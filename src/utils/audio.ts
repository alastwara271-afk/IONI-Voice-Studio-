import { CapCutCue } from '../types';

export function base64ToBlobUrl(base64: string, mimeType = 'audio/wav'): string {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
}

export function downloadBase64Audio(base64: string, filename: string, mimeType = 'audio/wav') {
  const blobUrl = base64ToBlobUrl(base64, mimeType);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = blobUrl;
  a.download = filename.endsWith('.wav') ? filename : `${filename}.wav`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  }, 1000);
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const mStr = mins < 10 ? `0${mins}` : `${mins}`;
  const sStr = secs < 10 ? `0${secs}` : `${secs}`;
  return `${mStr}:${sStr}`;
}

export function formatTimeSrt(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  const hStr = hours < 10 ? `0${hours}` : `${hours}`;
  const mStr = mins < 10 ? `0${mins}` : `${mins}`;
  const sStr = secs < 10 ? `0${secs}` : `${secs}`;
  const msStr = ms < 10 ? `00${ms}` : ms < 100 ? `0${ms}` : `${ms}`;

  return `${hStr}:${mStr}:${sStr},${msStr}`;
}

// Arabic character check
export function isArabicText(text: string): boolean {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
}

// Estimation of audio duration
export function estimateAudioDuration(text: string, language: string = 'ar-SA'): number {
  if (!text || text.trim().length === 0) return 0;
  const isArabic = isArabicText(text) || language.startsWith('ar');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  // Average speaking rates:
  // Arabic: ~120-130 words per minute for clear educational pace
  // English: ~140-150 words per minute
  const wordsPerMinute = isArabic ? 125 : 145;
  const estimatedSeconds = (words / wordsPerMinute) * 60;
  return Math.max(1, Math.round(estimatedSeconds));
}

// Generate CapCut Compatible SRT File
export function generateCapCutSrt(cues: CapCutCue[]): string {
  return cues
    .map((cue, idx) => {
      const startSrt = formatTimeSrt(cue.startTime);
      const endSrt = formatTimeSrt(cue.endTime);
      return `${idx + 1}\n${startSrt} --> ${endSrt}\n${cue.text}\n`;
    })
    .join('\n');
}

// Generate CapCut Cues JSON
export function generateCapCutCueSheetJson(cues: CapCutCue[], totalDuration: number): string {
  return JSON.stringify(
    {
      project: 'IONI YouTube Video Narration',
      softwareCompatibility: 'CapCut / Premiere Pro / DaVinci Resolve',
      totalDurationSeconds: totalDuration,
      scenesCount: cues.length,
      audioSampleRate: '24000 Hz',
      audioFormat: 'WAV 16-bit Mono',
      cues: cues.map((c) => ({
        scene: c.sceneNumber,
        title: c.title,
        timelineStart: c.formattedStartTime,
        timelineEnd: c.formattedEndTime,
        durationSeconds: c.duration,
        narrationScript: c.text,
        suggestedVisualMotion: c.visualNote,
      })),
    },
    null,
    2
  );
}

export function downloadTextFile(content: string, filename: string, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}
