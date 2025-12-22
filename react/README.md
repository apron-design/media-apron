# Media Apron - React

媒体播放组件库 React 版本 - Apron Design 分支项目

## 简介

Media Apron 是一个专注于媒体播放的组件库，提供功能丰富的 Video 和 Audio 组件。

## 特性

- 🎨 美观的自定义 UI 设计，专业的矢量图标
- 📱 16:9 响应式布局，自动适应容器宽度
- 📋 支持播放列表（简单模式和完整模式）
- ⚡ 自动隐藏控制栏，3 秒无操作自动隐藏
- 🎯 沉浸模式和全屏模式
- 🔊 智能音量控制（根据音量级别显示不同图标）
- ⏩ 播放速度调节（0.25x - 2x）
- 📝 字幕支持（CC 字幕）
- 🎬 封面图和视频信息显示
- ⌨️ 键盘快捷键（ESC 退出沉浸/全屏）

## 安装

```bash
npm install @media-apron/react
```

## 使用

### 单个视频

```tsx
import { Video } from '@media-apron/react';

function App() {
  return (
    <Video
      src="video.mp4"
      poster="cover.jpg"
    />
  );
}
```

### 播放列表（简单模式）

```tsx
import { Video } from '@media-apron/react';

function App() {
  const playlist = [
    'video1.mp4',
    'video2.mp4',
    'video3.mp4',
  ];

  return <Video source={playlist} />;
}
```

### 播放列表（完整模式）

```tsx
import { Video, VideoSource } from '@media-apron/react';

function App() {
  const playlist: VideoSource[] = [
    {
      title: '视频标题',
      summary: '视频简介',
      poster: 'cover.jpg',
      url: 'video1.mp4',
      cc: 'subtitles.vtt',
    },
    {
      title: '第二个视频',
      summary: '视频简介',
      poster: 'cover2.jpg',
      url: 'video2.mp4',
    },
  ];

  return (
    <Video
      source={playlist}
      primaryColor="#1890ff"
    />
  );
}
```

## API

### VideoProps

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| src | `string` | - | 视频源 URL（优先级最高） |
| source | `string \| string[] \| VideoSource[]` | - | 播放源或播放列表 |
| primaryColor | `string` | `#333333` | 主题色（进度条颜色） |
| className | `string` | - | 自定义类名 |
| ...rest | `VideoHTMLAttributes` | - | 继承所有原生 video 标签属性 |

### VideoSource

```typescript
interface VideoSource {
  title: string;      // 视频标题
  summary?: string;   // 视频摘要
  poster?: string;    // 封面图
  url: string;        // 视频 URL
  cc?: string;        // 字幕文件 URL
}
```

## 功能说明

### 默认尺寸

组件默认宽度 100%，高度按 16:9 比例自动计算。

### 控制栏

- 自动隐藏：鼠标移出后 3 秒自动隐藏
- 进度条：可点击跳转，可拖动调整进度
- 播放控制：播放/暂停、下一个（播放列表模式）
- 时间显示：当前时间/总时长

### 右侧功能按钮

- **音量**：显示音量百分比，hover 展开音量滑块，点击切换静音
- **设置**：播放速度调节、字幕开关（如果有）
- **播放列表**：从右侧展开播放列表面板（仅播放列表模式）
- **沉浸模式**：占满整个视口，ESC 退出
- **全屏**：进入浏览器全屏，ESC 退出

## 开发

```bash
# 安装依赖
npm install

# 开发模式（查看示例）
npm run dev

# 构建
npm run build

# 类型检查
npm run type-check
```

## License

MIT

