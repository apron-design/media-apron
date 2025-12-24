/**
 * LRC 歌词行接口
 */
export interface LrcLine {
  /** 时间（秒） */
  time: number;
  /** 歌词文本 */
  text: string;
}

/**
 * 解析 LRC 时间标签 [mm:ss.xx] 或 [mm:ss.xxx]
 * @param timeTag - 时间标签字符串，如 "00:12.00" 或 "00:12.000"
 * @returns 时间（秒）
 */
function parseTimeTag(timeTag: string): number {
  const parts = timeTag.split(':');
  if (parts.length !== 2) return 0;

  const minutes = parseInt(parts[0], 10);
  const secondsParts = parts[1].split('.');
  const seconds = parseInt(secondsParts[0], 10);
  const milliseconds = secondsParts[1] ? parseInt(secondsParts[1].padEnd(3, '0').slice(0, 3), 10) : 0;

  return minutes * 60 + seconds + milliseconds / 1000;
}

/**
 * 解析 LRC 歌词内容
 * @param lrcContent - LRC 歌词字符串
 * @returns 解析后的歌词行数组
 */
export function parseLrc(lrcContent: string): LrcLine[] {
  const lines: LrcLine[] = [];
  const lrcLines = lrcContent.split('\n');

  for (const line of lrcLines) {
    // 匹配时间标签 [mm:ss.xx] 或 [mm:ss.xxx]
    const timeTagRegex = /\[(\d{2}:\d{2}(?:\.\d{2,3})?)\]/g;
    const timeTags: string[] = [];
    let match;

    while ((match = timeTagRegex.exec(line)) !== null) {
      timeTags.push(match[1]);
    }

    if (timeTags.length === 0) continue;

    // 提取歌词文本（去除所有时间标签）
    const text = line.replace(timeTagRegex, '').trim();

    // 一行可能有多个时间标签，每个都创建一个歌词行
    for (const timeTag of timeTags) {
      const time = parseTimeTag(timeTag);
      lines.push({ time, text });
    }
  }

  // 按时间排序
  lines.sort((a, b) => a.time - b.time);

  return lines;
}

/**
 * 根据当前时间获取当前应该高亮的歌词索引
 * @param lrcLines - 歌词行数组
 * @param currentTime - 当前播放时间（秒）
 * @returns 当前歌词索引，如果没有则返回 -1
 */
export function getCurrentLrcIndex(lrcLines: LrcLine[], currentTime: number): number {
  if (lrcLines.length === 0) return -1;

  for (let i = lrcLines.length - 1; i >= 0; i--) {
    if (currentTime >= lrcLines[i].time) {
      return i;
    }
  }

  return -1;
}

