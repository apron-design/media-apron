import React from 'react';
import ReactDOM from 'react-dom/client';
import { Video } from '../src';
import { Audio } from '../src';

// 示例 1: 单个视频（带 WebVTT 字幕）
const SingleVideoExample = () => {
  return (
    <div className="video-wrapper">
      <Video
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
        cc="./subtitles.vtt"
      />
    </div>
  );
};

// 示例 1.5: 单个视频（带 SRT 字幕）
const SingleVideoWithSrtExample = () => {
  return (
    <div className="video-wrapper">
      <Video
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
        cc="./subtitles.srt"
      />
    </div>
  );
};

// 示例 2: 播放列表（简单模式）
const PlaylistSimpleExample = () => {
  const playlist = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  ];

  return (
    <div className="video-wrapper">
      <Video source={playlist} />
    </div>
  );
};

// 示例 3: 播放列表（完整模式，带字幕）
const PlaylistFullExample = () => {
  const playlist = [
    {
      title: '正在播放的视频标题（带字幕）',
      summary: '视频摘要，没有可以不显示。点击设置按钮可以开关字幕。',
      poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      cc: './subtitles.vtt',
    },
    {
      title: '下一个要播放的视频标题',
      summary: '视频摘要，没有可以不显示',
      poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    },
    {
      title: '没有封面的视频（显示占位图标）',
      summary: '当没有提供 poster 时，会显示深灰色背景和视频图标占位符',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    },
  ];

  return (
    <div className="video-wrapper">
      <Video
        source={playlist}
        primaryColor="#1890ff"
      />
    </div>
  );
};

// 渲染示例
const singleVideoRoot = document.getElementById('single-video');
if (singleVideoRoot) {
  ReactDOM.createRoot(singleVideoRoot).render(<SingleVideoExample />);
}

const playlistSimpleRoot = document.getElementById('playlist-simple');
if (playlistSimpleRoot) {
  ReactDOM.createRoot(playlistSimpleRoot).render(<PlaylistSimpleExample />);
}

const playlistFullRoot = document.getElementById('playlist-full');
if (playlistFullRoot) {
  ReactDOM.createRoot(playlistFullRoot).render(<PlaylistFullExample />);
}

// Audio 组件示例
// 示例 1: 单个音频（无封面）
const SingleAudioExample = () => {
  return (
    <div className="audio-wrapper">
      <Audio
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      />
    </div>
  );
};

// 示例 1.5: 单个音频（无封面 + 歌词）
const SingleAudioWithLyricsExample = () => {
  return (
    <div className="audio-wrapper">
      <Audio
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        lyrics="./lyrics.lrc"
      />
    </div>
  );
};

// 示例 2: 单个音频（有封面和歌词）
const SingleAudioWithPosterExample = () => {
  return (
    <div className="audio-wrapper">
      <Audio
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
        lyrics="./lyrics.lrc"
        primaryColor="#1890ff"
      />
    </div>
  );
};

// 示例 3: 播放列表（简单模式）
const AudioPlaylistSimpleExample = () => {
  const playlist = [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  ];

  return (
    <div className="audio-wrapper">
      <Audio source={playlist} />
    </div>
  );
};

// 示例 4: 播放列表（完整模式，带歌词）
const AudioPlaylistFullExample = () => {
  const playlist = [
    {
      title: '第一首歌曲（带歌词）',
      summary: '这是第一首歌曲的简介，支持歌词显示',
      poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      lyrics: './lyrics.lrc',
    },
    {
      title: '第二首歌曲',
      summary: '这是第二首歌曲的简介',
      poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    },
    {
      title: '第三首歌曲（无封面）',
      summary: '没有封面的歌曲会显示背景色',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    },
  ];

  return (
    <div className="audio-wrapper">
      <Audio
        source={playlist}
        primaryColor="#1890ff"
      />
    </div>
  );
};

// 渲染 Audio 示例
const singleAudioRoot = document.getElementById('single-audio');
if (singleAudioRoot) {
  ReactDOM.createRoot(singleAudioRoot).render(<SingleAudioExample />);
}

const singleAudioWithLyricsRoot = document.getElementById('single-audio-lyrics');
if (singleAudioWithLyricsRoot) {
  ReactDOM.createRoot(singleAudioWithLyricsRoot).render(<SingleAudioWithLyricsExample />);
}

const singleAudioWithPosterRoot = document.getElementById('single-audio-poster');
if (singleAudioWithPosterRoot) {
  ReactDOM.createRoot(singleAudioWithPosterRoot).render(<SingleAudioWithPosterExample />);
}

const audioPlaylistSimpleRoot = document.getElementById('audio-playlist-simple');
if (audioPlaylistSimpleRoot) {
  ReactDOM.createRoot(audioPlaylistSimpleRoot).render(<AudioPlaylistSimpleExample />);
}

const audioPlaylistFullRoot = document.getElementById('audio-playlist-full');
if (audioPlaylistFullRoot) {
  ReactDOM.createRoot(audioPlaylistFullRoot).render(<AudioPlaylistFullExample />);
}

