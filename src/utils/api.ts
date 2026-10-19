export interface FreeTierUsage {
  dailyRequests: number;
  dailyLimit: number;
  minuteRequests: number;
  minuteLimit: number;
}

export interface EngineStatusResponse {
  status: string;
  hasApiKey: boolean;
  isPinValid: boolean;
  defaultModel: string;
  audioFormat: string;
  sampleRate: number;
  freeTierInfo: {
    cost: string;
    limits: {
      rpm: number;
      rpd: number;
      tpm: number;
    };
    currentUsage: FreeTierUsage;
  };
}

const PIN_STORAGE_KEY = 'ioni_personal_studio_pin';
const DEFAULT_PIN = 'ioni2026';

export function getStoredPin(): string {
  try {
    const pin = localStorage.getItem(PIN_STORAGE_KEY);
    return pin ? pin.trim() : DEFAULT_PIN;
  } catch {
    return DEFAULT_PIN;
  }
}

export function saveStoredPin(pin: string): void {
  try {
    localStorage.setItem(PIN_STORAGE_KEY, pin.trim());
  } catch (e) {
    console.error('Failed to save PIN to localStorage', e);
  }
}

export async function fetchWithPersonalAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const pin = getStoredPin();
  const headers = new Headers(options.headers || {});
  headers.set('x-personal-pin', pin);

  return fetch(url, {
    ...options,
    headers,
  });
}

// Check backend status & quota info
export async function getEngineStatus(): Promise<EngineStatusResponse> {
  const res = await fetchWithPersonalAuth('/api/status');
  if (!res.ok) {
    throw new Error(`Failed to fetch engine status: ${res.statusText}`);
  }
  return res.json();
}

// Verify entered PIN
export async function verifyStudioPin(pin: string): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch {
    return false;
  }
}

// Free Browser Device Speech Fallback (Zero network calls, 100% free)
export function speakWithBrowserWebSpeech(
  text: string, 
  lang: string = 'ar-SA', 
  onStart?: () => void, 
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1.0;

  // Try to find matching voice for language
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopBrowserSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
