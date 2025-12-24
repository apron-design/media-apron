import React, { forwardRef, useRef, useState, useEffect, useCallback } from 'react';
import { AudioProps, AudioSource } from './types';
import './Audio.scss';
import {
  PlayIcon,
  PauseIcon,
  PrevIcon,
  NextIcon,
  VolumeIcon,
} from './icons';
import { parseLrc, getCurrentLrcIndex, LrcLine } from './lrcParser';

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
    lyrics,
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
  const [lrcLines, setLrcLines] = useState<LrcLine[]>([]);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

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

  // 获取当前歌词 URL
  const currentLyrics = React.useMemo(() => {
    if (src && lyrics) return lyrics; // 优先使用 props.lyrics（当使用 src 时）
    if (!playlist) return undefined;
    const current = playlist[currentIndex];
    return (current as AudioSource)?.lyrics;
  }, [src, lyrics, playlist, currentIndex]);

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

  // 加载歌词
  useEffect(() => {
    if (!currentLyrics) {
      setLrcLines([]);
      return;
    }

    fetch(currentLyrics)
      .then(res => res.text())
      .then(text => {
        const lines = parseLrc(text);
        setLrcLines(lines);
      })
      .catch(err => {
        console.error('Failed to load lyrics:', err);
        setLrcLines([]);
      });
  }, [currentLyrics]);

  // 计算当前歌词索引
  const currentLrcIndex = React.useMemo(() => {
    return getCurrentLrcIndex(lrcLines, currentTime);
  }, [lrcLines, currentTime]);

  // 自动滚动歌词到当前行
  useEffect(() => {
    if (currentLrcIndex < 0 || !lyricsContainerRef.current) return;

    const container = lyricsContainerRef.current;
    const currentLine = container.children[currentLrcIndex] as HTMLElement;
    
    if (currentLine) {
      const containerHeight = container.clientHeight;
      const lineTop = currentLine.offsetTop;
      const lineHeight = currentLine.clientHeight;
      
      // 滚动到当前歌词行居中
      container.scrollTo({
        top: lineTop - containerHeight / 2 + lineHeight / 2,
        behavior: 'smooth'
      });
    }
  }, [currentLrcIndex]);

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
      className={`media-apron-audio ${hasPoster ? 'with-poster' : ''} ${className || ''}`}
      style={{
        ...style,
        '--primary-color': primaryColor,
      } as React.CSSProperties}
    >
      {hasPoster && (
        <div className="media-apron-audio-poster-container">
          <img
            src={currentPoster}
            alt="音频封面"
            className="media-apron-audio-poster"
          />
        </div>
      )}

      {lrcLines.length > 0 && (
        <div
          ref={lyricsContainerRef}
          className={`media-apron-audio-lyrics-container ${hasPoster ? 'with-poster' : ''}`}
        >
          {lrcLines.map((line, index) => (
            <div
              key={index}
              className={`media-apron-audio-lyrics-line ${index === currentLrcIndex ? 'active' : ''}`}
            >
              {line.text}
            </div>
          ))}
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
        className="media-apron-audio-element"
        src={currentUrl}
      {...restProps}
    />

      <div className={`media-apron-audio-loading ${isLoading ? 'visible' : ''}`}>
        <div className="media-apron-audio-loading-spinner" />
      </div>

      <div className="media-apron-audio-controls">
        <div
          ref={progressRef}
          className="media-apron-audio-progress-container"
          onClick={handleProgressClick}
          onMouseMove={handleProgressMouseMove}
          onMouseLeave={handleProgressMouseLeave}
        >
          <div className="media-apron-audio-progress-background" />
          <div
            ref={progressPreviewRef}
            className="media-apron-audio-progress-preview"
          />
          <div
            className="media-apron-audio-progress-bar"
            style={{ width: `${progress}%` }}
          />
          <div
            ref={progressHoverRef}
            className="media-apron-audio-progress-hover"
          />
        </div>

        <div className="media-apron-audio-controls-bottom">
          <div className="media-apron-audio-controls-left">
            <div className="media-apron-audio-time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="media-apron-audio-controls-center">
            {playlist && playlist.length > 1 && (
              <button
                className="media-apron-audio-button media-apron-audio-play-button"
                onClick={playPrev}
                disabled={currentIndex <= 0}
                title="上一首"
              >
                <PrevIcon />
              </button>
            )}

            <button
              className={`media-apron-audio-button media-apron-audio-play-button ${isPlaying ? 'active' : ''}`}
              onClick={togglePlay}
              title={isPlaying ? '暂停' : '播放'}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>

            {playlist && playlist.length > 1 && (
              <button
                className="media-apron-audio-button media-apron-audio-play-button"
                onClick={playNext}
                disabled={currentIndex >= playlist.length - 1}
                title="下一首"
              >
                <NextIcon />
              </button>
            )}
          </div>

          <div className="media-apron-audio-controls-right">
            <div className="media-apron-audio-volume-container">
              <span className="media-apron-audio-volume-value">
                {isMuted ? '静音' : `${volume}%`}
              </span>
              <div className="media-apron-audio-volume-slider-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="media-apron-audio-volume-slider"
                />
              </div>
              <button
                className="media-apron-audio-button media-apron-audio-icon-button"
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
