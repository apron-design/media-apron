import React, { forwardRef, useRef, useState, useEffect, useCallback } from 'react';
import { VideoProps, VideoSource } from './types';
import styles from './Video.module.css';
import {
  PlayIcon,
  PauseIcon,
  NextIcon,
  VolumeIcon,
  SettingsIcon,
  PlaylistIcon,
  ImmersiveIcon,
  ExitImmersiveIcon,
  FullscreenIcon,
  VideoPlaceholderIcon,
} from './icons';

/**
 * Video 组件 - 媒体播放器的视频组件
 * @component
 */
export const Video = forwardRef<HTMLVideoElement, VideoProps>((props, ref) => {
  const {
    className,
    src,
    source,
    primaryColor = '#333333',
    style,
    ...restProps
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const progressHoverRef = useRef<HTMLDivElement>(null);
  const progressPreviewRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isImmersive, setIsImmersive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 解析播放列表
  const playlist = React.useMemo(() => {
    if (src) return null;
    if (!source) return null;
    
    if (typeof source === 'string') {
      return null; // 单个视频，不需要播放列表
    }
    
    if (Array.isArray(source)) {
      if (source.length === 0) return null;
      
      // 检查是否为字符串数组
      if (typeof source[0] === 'string') {
        return (source as string[]).map((url, index) => ({
          title: `视频 ${index + 1}`,
          url,
        }));
      }
      
      // 对象数组
      return source as VideoSource[];
    }
    
    return null;
  }, [src, source]);

  // 获取当前播放的 URL
  const currentUrl = React.useMemo(() => {
    if (src) return src;
    if (!source) return undefined;
    
    if (typeof source === 'string') {
      return source;
    }
    
    if (Array.isArray(source) && source.length > 0) {
      const item = source[currentIndex];
      if (typeof item === 'string') {
        return item;
      }
      return (item as VideoSource).url;
    }
    
    return undefined;
  }, [src, source, currentIndex]);

  // 获取当前字幕
  const currentCC = React.useMemo(() => {
    if (!playlist) return undefined;
    const current = playlist[currentIndex];
    return current?.cc;
  }, [playlist, currentIndex]);

  // 格式化时间
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 播放/暂停
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, []);

  // 播放下一个
  const playNext = useCallback(() => {
    if (!playlist || currentIndex >= playlist.length - 1) return;
    setCurrentIndex(prev => prev + 1);
  }, [playlist, currentIndex]);

  // 切换静音
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(!video.muted ? false : true);
  }, []);

  // 改变音量
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = parseInt(e.target.value);
    video.volume = newVolume / 100;
    setVolume(newVolume);
    
    if (newVolume > 0 && isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  }, [isMuted]);

  // 改变播放速度
  const handlePlaybackRateChange = useCallback((rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  }, []);

  // 切换沉浸模式
  const toggleImmersive = useCallback(() => {
    setIsImmersive(prev => !prev);
  }, []);

  // 切换全屏
  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  // 进度条点击
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progress = progressRef.current;
    if (!video || !progress) return;

    const rect = progress.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * video.duration;
    
    // 立即更新进度条显示
    setCurrentTime(newTime);
    // 设置视频播放位置
    video.currentTime = newTime;
  }, []);

  // 进度条鼠标移动
  const handleProgressMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const progress = progressRef.current;
    const hoverIndicator = progressHoverRef.current;
    const previewBar = progressPreviewRef.current;
    if (!progress || !hoverIndicator || !previewBar) return;

    const rect = progress.getBoundingClientRect();
    const pos = e.clientX - rect.left;
    const percentage = (pos / rect.width) * 100;
    
    hoverIndicator.style.left = `${pos}px`;
    previewBar.style.width = `${percentage}%`;
  }, []);

  // 进度条鼠标离开
  const handleProgressMouseLeave = useCallback(() => {
    const hoverIndicator = progressHoverRef.current;
    if (!hoverIndicator) return;
    hoverIndicator.style.opacity = '0';
  }, []);

  // 自动隐藏控制栏
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    setShowControls(true);
    
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  // 视频事件监听
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleVolumeUpdate = () => {
      setVolume(Math.round(video.volume * 100));
      setIsMuted(video.muted);
    };
    const handleEnded = () => {
      if (playlist && currentIndex < playlist.length - 1) {
        playNext();
      }
    };
    const handleWaiting = () => setIsLoading(true);
    const handleSeeking = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handlePlaying = () => setIsLoading(false);
    const handleLoadStart = () => setIsLoading(true);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('volumechange', handleVolumeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('loadstart', handleLoadStart);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('volumechange', handleVolumeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, [playlist, currentIndex, playNext]);

  // 鼠标移动显示控制栏
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = () => {
      resetControlsTimeout();
    };

    const handleMouseLeave = () => {
      if (isPlaying) {
        setShowControls(false);
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, resetControlsTimeout]);

  // ESC 键退出沉浸/全屏
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isImmersive) {
          setIsImmersive(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImmersive]);

  // 监听全屏变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      // 可以在这里添加额外的逻辑
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`${styles.videoContainer} ${isImmersive ? styles.immersive : ''} ${className || ''}`}
      style={{
        ...style,
        '--primary-color': primaryColor,
      } as React.CSSProperties}
    >
      <video
        ref={(el) => {
          videoRef.current = el;
          if (typeof ref === 'function') {
            ref(el);
          } else if (ref) {
            ref.current = el;
          }
        }}
        className={styles.video}
        src={currentUrl}
        onClick={togglePlay}
        {...restProps}
      >
        {currentCC && <track kind="subtitles" src={currentCC} />}
      </video>

      <div className={`${styles.loading} ${isLoading ? styles.visible : ''}`}>
        <div className={styles.loadingSpinner} />
      </div>

      <div className={`${styles.controls} ${!showControls ? styles.hidden : ''}`}>
        <div
          ref={progressRef}
          className={styles.progressContainer}
          onClick={handleProgressClick}
          onMouseMove={handleProgressMouseMove}
          onMouseLeave={handleProgressMouseLeave}
        >
          <div className={styles.progressBackground} />
          <div
            ref={progressPreviewRef}
            className={styles.progressPreview}
          />
          <div
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
          />
          <div
            ref={progressHoverRef}
            className={styles.progressHover}
          />
        </div>

        <div className={styles.controlsBottom}>
          <div className={styles.controlsLeft}>
            <button
              className={`${styles.button} ${styles.playButton} ${isPlaying ? styles.active : ''}`}
              onClick={togglePlay}
              title={isPlaying ? '暂停' : '播放'}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>

            {playlist && playlist.length > 1 && currentIndex < playlist.length - 1 && (
              <button
                className={`${styles.button} ${styles.playButton}`}
                onClick={playNext}
                title="下一个"
              >
                <NextIcon />
              </button>
            )}

            <div className={styles.timeDisplay}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className={styles.controlsRight}>
            <div className={styles.volumeContainer}>
              <span className={styles.volumeValue}>
                {isMuted ? '静音' : `${volume}%`}
              </span>
              <div className={styles.volumeSliderContainer}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className={styles.volumeSlider}
                />
              </div>
              <button
                className={`${styles.button} ${styles.iconButton}`}
                onClick={toggleMute}
                title={isMuted ? '取消静音' : '静音'}
              >
                <VolumeIcon volume={volume} isMuted={isMuted} />
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <button
                className={`${styles.button} ${styles.iconButton}`}
                onClick={() => setShowSettings(!showSettings)}
                title="设置"
              >
                <SettingsIcon />
              </button>

              <div className={`${styles.settingsMenu} ${showSettings ? styles.visible : ''}`}>
                {currentCC && (
                  <div className={styles.menuItem}>
                    CC 字幕
                  </div>
                )}
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', padding: '4px 12px' }}>
                  播放速度
                </div>
                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                  <div
                    key={rate}
                    className={`${styles.menuItem} ${playbackRate === rate ? styles.selected : ''}`}
                    onClick={() => handlePlaybackRateChange(rate)}
                  >
                    {rate}x
                  </div>
                ))}
              </div>
            </div>

            {playlist && playlist.length > 0 && (
              <button
                className={`${styles.button} ${styles.iconButton}`}
                onClick={() => setShowPlaylist(!showPlaylist)}
                title="播放列表"
              >
                <PlaylistIcon />
              </button>
            )}

            <button
              className={`${styles.button} ${styles.iconButton}`}
              onClick={toggleImmersive}
              title={isImmersive ? '退出沉浸模式' : '沉浸模式'}
            >
              {isImmersive ? <ExitImmersiveIcon /> : <ImmersiveIcon />}
            </button>

            <button
              className={`${styles.button} ${styles.iconButton}`}
              onClick={toggleFullscreen}
              title="全屏"
            >
              <FullscreenIcon />
            </button>
          </div>
        </div>
      </div>

      {playlist && playlist.length > 0 && (
        <div className={`${styles.playlist} ${showPlaylist ? styles.visible : ''}`}>
          <div className={styles.playlistHeader}>
            播放列表
          </div>
          {playlist.map((item, index) => (
            <div
              key={index}
              className={`${styles.playlistItem} ${index === currentIndex ? styles.active : ''}`}
              onClick={() => setCurrentIndex(index)}
            >
              {item.poster ? (
                <img
                  src={item.poster}
                  alt={item.title}
                  className={styles.playlistItemThumb}
                />
              ) : (
                <div className={styles.playlistItemPlaceholder}>
                  <VideoPlaceholderIcon />
                </div>
              )}
              <div className={styles.playlistItemContent}>
                <div className={styles.playlistItemTitle}>
                  {item.title}
                </div>
                {item.summary && (
                  <div className={styles.playlistItemSummary}>
                    {item.summary}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

Video.displayName = 'Video';

export type { VideoProps, VideoSource } from './types';

