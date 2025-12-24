/**
 * 播放列表项（对象形式）
 */
export interface AudioSource {
  /** 音频标题 */
  title: string;
  /** 音频摘要 */
  summary?: string;
  /** 封面图 */
  poster?: string;
  /** 音频 URL */
  url: string;
  /** 歌词文件 URL (LRC 格式) */
  lyrics?: string;
}

/**
 * Audio 组件的属性类型
 */
export interface AudioProps {
  /**
   * 自定义类名
   */
  class?: string;
  
  /**
   * 播放源，优先级最高
   */
  src?: string;
  
  /**
   * 播放源列表
   * - string[]: 播放列表，每项为音频 URL
   * - AudioSource[]: 播放列表，包含标题、摘要、封面等信息
   */
  source?: string[] | AudioSource[];
  
  /**
   * 封面图（当使用 src 时）
   */
  poster?: string;
  
  /**
   * 歌词文件 URL（当使用 src 时，LRC 格式）
   */
  lyrics?: string;
  
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
}

