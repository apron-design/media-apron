import { AudioHTMLAttributes } from 'react';

/**
 * Audio 组件的属性类型
 */
export interface AudioProps extends AudioHTMLAttributes<HTMLAudioElement> {
  /**
   * 自定义类名
   */
  className?: string;
}

