# @media-apron/vue

媒体播放组件库 Vue 3 版本 - Apron Design 的分支项目

## 安装

```bash
npm install @media-apron/vue
```

## 使用

```vue
<script setup lang="ts">
import { Video, Audio } from '@media-apron/vue';
import '@media-apron/vue/dist/style.css';
</script>

<template>
  <Video
    src="video.mp4"
    poster="poster.jpg"
    cc="subtitles.vtt"
  />

  <Audio
    src="audio.mp3"
    poster="cover.jpg"
    lyrics="lyrics.lrc"
  />
</template>
```

## 功能特性

- ✅ Video 组件：完整的视频播放控制
- ✅ Audio 组件：音频播放 + LRC 歌词支持
- ✅ 播放列表支持
- ✅ 自定义主题色
- ✅ 沉浸模式和全屏模式
- ✅ CC 字幕支持（Video）
- ✅ 滚动歌词支持（Audio）
- ✅ TypeScript 类型完整支持

## License

MIT
