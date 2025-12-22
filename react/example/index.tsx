import React from 'react';
import ReactDOM from 'react-dom/client';
import { Video } from '../src';

// 示例 1: 单个视频
const SingleVideoExample = () => {
  return (
    <div className="video-wrapper">
      <Video
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
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

// 示例 3: 播放列表（完整模式）
const PlaylistFullExample = () => {
  const playlist = [
    {
      title: '正在播放的视频标题',
      summary: '视频摘要，没有可以不显示',
      poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
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

