/**
 * SRT 字幕解析器
 * 将 SRT 格式转换为 WebVTT 格式
 */

/**
 * 将 SRT 时间格式 (HH:MM:SS,mmm) 转换为 WebVTT 时间格式 (HH:MM:SS.mmm)
 */
function convertSrtTimeToWebVtt(srtTime: string): string {
  return srtTime.replace(',', '.');
}

/**
 * 解析 SRT 字幕内容并转换为 WebVTT 格式
 */
export function srtToWebVtt(srtContent: string): string {
  // WebVTT 文件头
  let webvtt = 'WEBVTT\n\n';

  // 移除 BOM（如果存在）
  srtContent = srtContent.replace(/^\uFEFF/, '');

  // 按空行分割字幕块
  const blocks = srtContent.trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    
    if (lines.length < 3) continue; // 至少需要序号、时间、文本

    // 第一行是序号，跳过
    // 第二行是时间轴
    const timeLine = lines[1].trim();
    const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/);
    
    if (!timeMatch) continue;

    const startTime = convertSrtTimeToWebVtt(timeMatch[1]);
    const endTime = convertSrtTimeToWebVtt(timeMatch[2]);

    // 剩余行是字幕文本
    const text = lines.slice(2).join('\n').trim();

    if (text) {
      // 转换 HTML 标签（SRT 使用 <i>, <b>, <u>，WebVTT 使用相同格式）
      // 移除可能存在的字体标签，只保留基本格式
      const formattedText = text
        .replace(/<font[^>]*>/gi, '')
        .replace(/<\/font>/gi, '')
        .replace(/<color[^>]*>/gi, '')
        .replace(/<\/color>/gi, '');

      webvtt += `${startTime} --> ${endTime}\n${formattedText}\n\n`;
    }
  }

  return webvtt;
}

/**
 * 检测文件是否为 SRT 格式（通过 URL 扩展名）
 */
export function isSrtFile(url: string): boolean {
  return /\.srt$/i.test(url);
}

/**
 * 加载并转换 SRT 文件为 WebVTT Blob URL
 */
export async function loadSrtAsWebVtt(srtUrl: string): Promise<string> {
  try {
    const response = await fetch(srtUrl);
    if (!response.ok) {
      throw new Error(`Failed to load SRT file: ${response.statusText}`);
    }
    
    const srtContent = await response.text();
    const webvttContent = srtToWebVtt(srtContent);
    
    // 创建 Blob 并生成 URL
    const blob = new Blob([webvttContent], { type: 'text/vtt' });
    const blobUrl = URL.createObjectURL(blob);
    
    return blobUrl;
  } catch (error) {
    console.error('Error loading SRT file:', error);
    throw error;
  }
}

