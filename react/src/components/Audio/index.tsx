import React, { forwardRef, useRef, useState, useEffect, useCallback } from 'react';
import { AudioProps, AudioSource } from './types';
import styles from './Audio.module.css';
import {
  PlayIcon,
  PauseIcon,
  PrevIcon,
  NextIcon,
  VolumeIcon,
} from './icons';

/**
 * Audio 组件 - 媒体播放器的音频组件
 * @component
 */
export const Audio = forwardRef<HTMLAudioElement, AudioProps>((props, ref) => {
  const {
    className,
    src,
    source,
    poster,
    primaryColor = '#333333',
    style,
    ...restProps
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const progressHoverRef = useRef<HTMLDivElement>(null);
  const progressPreviewRef = useRef<HTMLDivElement>(null);
  const shouldResumePlayingRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 解析播放列表
  const playlist = React.useMemo(() => {
    if (src) return null;
    if (!source) return null;
    
    if (Array.isArray(source)) {
      if (source.length === 0) return null;
      
      // 检查是否为字符串数组
      if (typeof source[0] === 'string') {
        return (source as string[]).map((url, index) => ({
          title: `音频 ${index + 1}`,
          url,
        }));
      }
      
      // 对象数组
      return source as AudioSource[];
    }
    
    return null;
  }, [src, source]);

  // 获取当前播放的 URL
  const currentUrl = React.useMemo(() => {
    if (src) return src;
    if (!source) return undefined;
    
    if (Array.isArray(source) && source.length > 0) {
      const item = source[currentIndex];
      if (typeof item === 'string') {
        return item;
      }
      return (item as AudioSource).url;
    }
    
    return undefined;
  }, [src, source, currentIndex]);

  // 获取当前封面图
  const currentPoster = React.useMemo(() => {
    if (poster) return poster;
    if (!playlist) return undefined;
    const current = playlist[currentIndex];
    return (current as AudioSource)?.poster;
  }, [poster, playlist, currentIndex]);

  // 判断是否有封面
  const hasPoster = !!currentPoster;

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
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }, []);

  // 播放上一首
  const playPrev = useCallback(() => {
    if (!playlist || currentIndex <= 0) return;
    shouldResumePlayingRef.current = isPlaying;
    setCurrentIndex(prev => prev - 1);
  }, [playlist, currentIndex, isPlaying]);

  // 播放下一首
  const playNext = useCallback(() => {
    if (!playlist || currentIndex >= playlist.length - 1) return;
    shouldResumePlayingRef.current = isPlaying;
    setCurrentIndex(prev => prev + 1);
  }, [playlist, currentIndex, isPlaying]);

  // 切换静音
  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.muted = !audio.muted;
    setIsMuted(!audio.muted ? false : true);
  }, []);

  // 改变音量
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = parseInt(e.target.value);
    audio.volume = newVolume / 100;
    setVolume(newVolume);
    
    if (newVolume > 0 && isMuted) {
      audio.muted = false;
      setIsMuted(false);
    }
  }, [isMuted]);

  // 进度条点击
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progress = progressRef.current;
    if (!audio || !progress) return;

    const rect = progress.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * audio.duration;
    
    setCurrentTime(newTime);
    audio.currentTime = newTime;
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

  // 音频事件监听
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleVolumeUpdate = () => {
      setVolume(Math.round(audio.volume * 100));
      setIsMuted(audio.muted);
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
      if (shouldResumePlayingRef.current) {
        audio.play().catch(() => {});
        shouldResumePlayingRef.current = false;
      }
    };
    const handlePlaying = () => setIsLoading(false);
    const handleLoadStart = () => setIsLoading(true);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('volumechange', handleVolumeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('seeking', handleSeeking);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('volumechange', handleVolumeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('seeking', handleSeeking);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [playlist, currentIndex, playNext]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`${styles.audioContainer} ${hasPoster ? styles.withPoster : ''} ${className || ''}`}
      style={{
        ...style,
        '--primary-color': primaryColor,
      } as React.CSSProperties}
    >
      {hasPoster && (
        <div className={styles.posterContainer}>
          <img
            src={currentPoster}
            alt="音频封面"
            className={styles.poster}
          />
        </div>
      )}

    <audio
        ref={(el) => {
          (audioRef as React.MutableRefObject<HTMLAudioElement | null>).current = el;
          if (typeof ref === 'function') {
            ref(el);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLAudioElement | null>).current = el;
          }
        }}
        className={styles.audio}
        src={currentUrl}
      {...restProps}
    />

      <div className={`${styles.loading} ${isLoading ? styles.visible : ''}`}>
        <div className={styles.loadingSpinner} />
      </div>

      <div className={styles.controls}>
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
            <div className={styles.timeDisplay}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className={styles.controlsCenter}>
            {playlist && playlist.length > 1 && (
              <button
                className={`${styles.button} ${styles.playButton}`}
                onClick={playPrev}
                disabled={currentIndex <= 0}
                title="上一首"
              >
                <PrevIcon />
              </button>
            )}

            <button
              className={`${styles.button} ${styles.playButton} ${isPlaying ? styles.active : ''}`}
              onClick={togglePlay}
              title={isPlaying ? '暂停' : '播放'}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>

            {playlist && playlist.length > 1 && (
              <button
                className={`${styles.button} ${styles.playButton}`}
                onClick={playNext}
                disabled={currentIndex >= playlist.length - 1}
                title="下一首"
              >
                <NextIcon />
              </button>
            )}
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
          </div>
        </div>
      </div>
    </div>
  );
});

Audio.displayName = 'Audio';

export type { AudioProps, AudioSource } from './types';
