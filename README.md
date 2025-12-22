# Media Apron

媒体播放组件库 - Apron Design 分支项目

## 简介

Media Apron 是 Apron Design 的分支项目，专注于提供高质量的媒体播放组件。

## 包

- `@media-apron/react` - React 版本
- `@media-apron/vue` - Vue 3 版本

## 组件

### Video

视频播放组件，提供丰富的视频播放功能。

### Audio

音频播放组件，提供丰富的音频播放功能。

## 项目结构

```
media.apron/
├── react/          # React 版本
│   ├── src/
│   │   ├── components/
│   │   │   ├── Video/
│   │   │   └── Audio/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── vue-next/       # Vue 3 版本
    ├── package.json
    └── README.md
```

## 开发

每个包都可以独立开发和构建。

### React 版本

```bash
cd react
npm install
npm run dev
```

### Vue 版本

```bash
cd vue-next
npm install
npm run dev
```

## License

MIT

