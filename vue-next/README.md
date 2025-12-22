# Media Apron - Vue

媒体播放组件库 Vue 3 版本 - Apron Design 分支项目

## 简介

Media Apron 是一个专注于媒体播放的组件库，提供 Video 和 Audio 两个核心组件。

## 组件

### Video

视频播放组件

### Audio

音频播放组件

## 安装

```bash
npm install @media-apron/vue
```

## 使用

```vue
<template>
  <div>
    <Video src="video.mp4" controls />
    <Audio src="audio.mp3" controls />
  </div>
</template>

<script setup>
import { Video, Audio } from '@media-apron/vue';
</script>
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 类型检查
npm run type-check
```

## License

MIT

