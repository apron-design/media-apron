/**
 * 播放列表项（对象形式）
 */
export interface VideoSource {
  /** 视频标题 */
  title: string;
  /** 视频摘要 */
  summary?: string;
  /** 封面图 */
  poster?: string;
  /** 视频 URL */
  url: string;
  /** 字幕文件 URL */
  cc?: string;
}

/**
 * Video 组件的属性类型
 */
export interface VideoProps {
  /**
   * 自定义类名
   */
  class?: string;
  
  /**
   * 播放源，优先级最高
   */
  src?: string;
  
  /**
   * 字幕文件 URL（配合 src 使用）
   */
  cc?: string;
  
  /**
   * 播放源列表
   * - string: 单个视频 URL，等同于 src
   * - string[]: 播放列表，每项为视频 URL
   * - VideoSource[]: 播放列表，包含标题、摘要、封面等信息
   */
  source?: string | string[] | VideoSource[];
  
  /**
   * 主题色（进度条颜色）
   * @default '#333333'
   */
  primaryColor?: string;

  /**
   * 自动播放
   */
  autoplay?: boolean;

  /**
   * 循环播放
   */
  loop?: boolean;

  /**
   * 静音
   */
  muted?: boolean;

  /**
   * 预加载
   */
  preload?: 'none' | 'metadata' | 'auto';

  /**
   * 封面图（当使用 src 时）
   */
  poster?: string;
}

