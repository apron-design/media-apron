# 图标说明

Media Apron React 组件使用了一套完整的 SVG 图标系统。

## 图标列表

### 播放控制图标

- **play.svg** - 播放按钮
- **pause.svg** - 暂停按钮
- **next.svg** - 下一个视频按钮（播放列表模式）

### 音量图标

音量图标会根据当前音量和静音状态自动切换：

- **volume-mute.svg** - 静音状态（音量为 0 或已静音）
- **volume-0.svg** - 低音量（1-33%）
- **volume-1.svg** - 中等音量（34-66%）
- **volume-2.svg** - 高音量（67-100%）

### 功能图标

- **SettingsIcon** - 设置按钮（播放速度、字幕）
- **PlaylistIcon** - 播放列表按钮
- **ImmersiveIcon** - 沉浸模式按钮
- **ExitImmersiveIcon** - 退出沉浸模式按钮
- **FullscreenIcon** - 全屏按钮
- **VideoPlaceholderIcon** - 视频占位图标（播放列表中无封面时显示）

## 图标使用

所有图标都是 React 组件，支持自定义样式：

```tsx
import { PlayIcon, PauseIcon, VolumeIcon } from './icons';

// 基础使用
<PlayIcon />

// 自定义样式
<PlayIcon className="my-icon" style={{ color: 'red' }} />

// 音量图标（根据音量自动显示）
<VolumeIcon volume={75} isMuted={false} />
```

## 图标特点

- 所有图标使用 `currentColor` 填充，自动继承父元素颜色
- SVG 格式，支持任意缩放不失真
- 统一的视觉风格
- 轻量级，无需额外的图标库依赖

## 自定义图标

如果需要替换图标，只需：

1. 在 `src/components/Video/icons/` 目录下添加新的 SVG 文件
2. 在 `src/components/Video/icons/index.tsx` 中创建对应的 React 组件
3. 在 Video 组件中导入并使用新图标

示例：

```tsx
// icons/index.tsx
export const MyCustomIcon: React.FC<IconProps> = ({ className, style }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" className={className} style={style}>
    <path d="..." fill="currentColor"/>
  </svg>
);
```

