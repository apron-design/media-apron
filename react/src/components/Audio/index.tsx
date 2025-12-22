import React, { forwardRef } from 'react';
import { AudioProps } from './types';

/**
 * Audio 组件 - 媒体播放器的音频组件
 * @component
 */
export const Audio = forwardRef<HTMLAudioElement, AudioProps>((props, ref) => {
  const { className, ...restProps } = props;

  return (
    <audio
      ref={ref}
      className={className}
      {...restProps}
    />
  );
});

Audio.displayName = 'Audio';

export type { AudioProps } from './types';

