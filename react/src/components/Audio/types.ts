import { AudioHTMLAttributes } from 'react';

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
}

/**
 * Audio 组件的属性类型
 */
export interface AudioProps extends Omit<AudioHTMLAttributes<HTMLAudioElement>, 'src'> {
  /**
   * 自定义类名
   */
  className?: string;
  
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
   * 主题色（进度条颜色）
   * @default '#333333'
   */
  primaryColor?: string;
}

