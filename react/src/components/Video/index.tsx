import React, { forwardRef, useRef, useState, useEffect, useCallback } from 'react';
import { VideoProps, VideoSource } from './types';
import './Video.scss';
import {
  PlayIcon,
  PauseIcon,
  NextIcon,
  VolumeIcon,
  SettingsIcon,
  PlaylistIcon,
  ImmersiveIcon,
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
    cc,
    source,
    primaryColor = '#1890ff',
    style,
    ...restProps
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const progressHoverRef = useRef<HTMLDivElement>(null);
  const progressPreviewRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldResumePlayingRef = useRef(false);
  const mouseLeaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  const [showSubtitles, setShowSubtitles] = useState(true);

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
    // 如果使用 src 播放，使用 props 传入的 cc
    if (src && cc) return cc;
    
    // 如果使用 source 播放，从 playlist 中获取
    if (!playlist) return undefined;
    const current = playlist[currentIndex];
    return (current as VideoSource)?.cc;
  }, [src, cc, playlist, currentIndex]);

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
    // 记录当前播放状态
    shouldResumePlayingRef.current = isPlaying;
    setCurrentIndex(prev => prev + 1);
  }, [playlist, currentIndex, isPlaying]);

  // 切换播放源
  const handlePlaylistItemClick = useCallback((index: number) => {
    if (index === currentIndex) return;
    
    // 记录当前播放状态
    shouldResumePlayingRef.current = isPlaying;
    setCurrentIndex(index);
    setShowPlaylist(false); // 切换后收起播放列表
  }, [currentIndex, isPlaying]);

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

  // 切换字幕显示
  const toggleSubtitles = useCallback(() => {
    setShowSubtitles(prev => !prev);
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
    const handleCanPlay = () => {
      setIsLoading(false);
      // 如果之前正在播放，恢复播放状态
      if (shouldResumePlayingRef.current) {
        video.play().catch(() => {});
        shouldResumePlayingRef.current = false;
      }
    };
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
      // 清除鼠标移出的延迟隐藏
      if (mouseLeaveTimeoutRef.current) {
        clearTimeout(mouseLeaveTimeoutRef.current);
        mouseLeaveTimeoutRef.current = null;
      }
    };

    const handleMouseLeave = () => {
      // 清除之前的定时器
      if (mouseLeaveTimeoutRef.current) {
        clearTimeout(mouseLeaveTimeoutRef.current);
      }
      // 延迟1秒后隐藏控制栏
      if (isPlaying) {
        mouseLeaveTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
          mouseLeaveTimeoutRef.current = null;
        }, 1000);
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
      if (mouseLeaveTimeoutRef.current) {
        clearTimeout(mouseLeaveTimeoutRef.current);
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

  // 控制字幕显示/隐藏
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentCC) return;

    const setupSubtitles = () => {
      const textTracks = video.textTracks;
      if (textTracks && textTracks.length > 0) {
        const track = textTracks[0];
        track.mode = showSubtitles ? 'showing' : 'hidden';
      }
    };

    // 立即尝试设置
    setupSubtitles();

    // 监听字幕轨道加载
    const handleLoadedMetadata = () => {
      setupSubtitles();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    // 如果字幕轨道已经加载，直接设置
    if (video.textTracks && video.textTracks.length > 0) {
      setupSubtitles();
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [showSubtitles, currentCC, currentIndex]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`media-apron-video ${isImmersive ? 'immersive' : ''} ${!showControls ? 'controls-hidden' : ''} ${className || ''}`}
      style={{
        ...style,
        '--primary-color': primaryColor,
      } as React.CSSProperties}
    >
      <video
        ref={(el) => {
          (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
          if (typeof ref === 'function') {
            ref(el);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLVideoElement | null>).current = el;
          }
        }}
        className="media-apron-video-element"
        src={currentUrl}
        onClick={togglePlay}
        {...restProps}
      >
        {currentCC && (
          <track
            kind="subtitles"
            src={currentCC}
            srcLang="zh"
            label="中文字幕"
            default={showSubtitles}
          />
        )}
      </video>

      <div className={`media-apron-video-loading ${isLoading ? 'visible' : ''}`}>
        <div className="media-apron-video-loading-spinner" />
      </div>

      <div className={`media-apron-video-controls ${!showControls ? 'hidden' : ''}`}>
        <div
          ref={progressRef}
          className="media-apron-video-progress-container"
          onClick={handleProgressClick}
          onMouseMove={handleProgressMouseMove}
          onMouseLeave={handleProgressMouseLeave}
        >
          <div className="media-apron-video-progress-background" />
          <div
            ref={progressPreviewRef}
            className="media-apron-video-progress-preview"
          />
          <div
            className="media-apron-video-progress-bar"
            style={{ width: `${progress}%` }}
          />
          <div
            ref={progressHoverRef}
            className="media-apron-video-progress-hover"
          />
        </div>

        <div className="media-apron-video-controls-bottom">
          <div className="media-apron-video-controls-left">
            <button
              className={`media-apron-video-button media-apron-video-play-button ${isPlaying ? 'active' : ''}`}
              onClick={togglePlay}
              title={isPlaying ? '暂停' : '播放'}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>

            {playlist && playlist.length > 1 && currentIndex < playlist.length - 1 && (
              <button
                className="media-apron-video-button media-apron-video-play-button"
                onClick={playNext}
                title="下一个"
              >
                <NextIcon />
              </button>
            )}

            <div className="media-apron-video-time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="media-apron-video-controls-right">
            <div className="media-apron-video-volume-container">
              <span className="media-apron-video-volume-value">
                {isMuted ? '静音' : `${volume}%`}
              </span>
              <div className="media-apron-video-volume-slider-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="media-apron-video-volume-slider"
                />
              </div>
              <button
                className="media-apron-video-button media-apron-video-icon-button"
                onClick={toggleMute}
                title={isMuted ? '取消静音' : '静音'}
              >
                <VolumeIcon volume={volume} isMuted={isMuted} />
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <button
                className="media-apron-video-button media-apron-video-icon-button"
                onClick={() => setShowSettings(!showSettings)}
                title="设置"
              >
                <SettingsIcon />
              </button>

              <div className={`media-apron-video-settings-menu ${showSettings ? 'visible' : ''}`}>
                {currentCC && (
                  <div
                    className={`media-apron-video-menu-item ${showSubtitles ? 'selected' : ''}`}
                    onClick={toggleSubtitles}
                  >
                    CC 字幕 {showSubtitles ? '✓' : ''}
                  </div>
                )}
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', padding: '4px 12px' }}>
                  播放速度
                </div>
                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                  <div
                    key={rate}
                    className={`media-apron-video-menu-item ${playbackRate === rate ? 'selected' : ''}`}
                    onClick={() => handlePlaybackRateChange(rate)}
                  >
                    {rate}x
                  </div>
                ))}
              </div>
            </div>

            {playlist && playlist.length > 0 && (
              <button
                className="media-apron-video-button media-apron-video-icon-button"
                onClick={() => setShowPlaylist(!showPlaylist)}
                title="播放列表"
              >
                <PlaylistIcon />
              </button>
            )}

            <button
              key={isImmersive ? 'exit-immersive' : 'immersive'}
              className="media-apron-video-button media-apron-video-icon-button"
              onClick={toggleImmersive}
              title={isImmersive ? '退出沉浸模式' : '沉浸模式'}
            >
              <ImmersiveIcon />
            </button>

            <button
              className="media-apron-video-button media-apron-video-icon-button"
              onClick={toggleFullscreen}
              title="全屏"
            >
              <FullscreenIcon />
            </button>
          </div>
        </div>
      </div>

      {/* 播放列表展开时的模糊遮罩 */}
      {playlist && playlist.length > 0 && showPlaylist && (
        <div 
          className="media-apron-video-playlist-overlay"
          onClick={() => setShowPlaylist(false)}
        />
      )}

      {playlist && playlist.length > 0 && (
        <div className={`media-apron-video-playlist ${showPlaylist ? 'visible' : ''}`}>
          <div className="media-apron-video-playlist-header">
            播放列表
          </div>
          {playlist.map((item, index) => {
            const videoItem = item as VideoSource;
            return (
              <div
                key={index}
                className={`media-apron-video-playlist-item ${index === currentIndex ? 'active' : ''}`}
                onClick={() => handlePlaylistItemClick(index)}
              >
                {videoItem.poster ? (
                  <img
                    src={videoItem.poster}
                    alt={videoItem.title}
                    className="media-apron-video-playlist-item-thumb"
                  />
                ) : (
                  <div className="media-apron-video-playlist-item-placeholder">
                    <VideoPlaceholderIcon />
                  </div>
                )}
                <div className="media-apron-video-playlist-item-content">
                  <div className="media-apron-video-playlist-item-title">
                    {videoItem.title}
                  </div>
                  {videoItem.summary && (
                    <div className="media-apron-video-playlist-item-summary">
                      {videoItem.summary}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

Video.displayName = 'Video';

export type { VideoProps, VideoSource } from './types';

