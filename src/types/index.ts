export type VoiceName = 'Kore' | 'Fenrir' | 'Puck' | 'Zephyr' | 'Charon' | 'Aoede' | 'Leda' | 'Orus';

export type LanguageCode = 'ar-SA' | 'ar-EG' | 'en-US';

export type VoiceStyle = 
  | 'educational' 
  | 'storytelling' 
  | 'energetic' 
  | 'calm' 
  | 'authoritative' 
  | 'friendly';

export interface VoiceProfile {
  id: string;
  name: VoiceName;
  displayName: string;
  gender: 'Female' | 'Male';
  supportedLanguages: {
    code: LanguageCode;
    label: string;
  }[];
  defaultStyle: string;
  toneTag: string;
  category: VoiceStyle;
  description: string;
  avatarColor: string;
  avatarGradient: string;
  arabicSample: string;
  englishSample: string;
  isIoniDefault?: boolean;
}

export interface GeneratedAudioItem {
  id: string;
  timestamp: number;
  text: string;
  voiceName: VoiceName;
  voiceDisplayName: string;
  language: LanguageCode;
  style: string;
  speed: string;
  durationSeconds: number;
  audioBase64: string;
  mimeType: string;
  sizeBytes: number;
  title?: string;
}

export interface ScriptScene {
  id: string;
  title: string;
  text: string;
  voiceName: VoiceName;
  style: string;
  speed: string;
  language: LanguageCode;
  audioBase64?: string;
  durationSeconds?: number;
  isGenerating?: boolean;
  error?: string;
}

export interface CapCutCue {
  sceneNumber: number;
  title: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  duration: number; // in seconds
  formattedStartTime: string;
  formattedEndTime: string;
  text: string;
  visualNote: string;
}
