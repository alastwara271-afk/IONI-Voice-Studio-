import { GeneratedAudioItem } from '../types';

const STORAGE_KEY = 'ioni_generated_history_v1';

export function getAudioHistory(): GeneratedAudioItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load audio history from localStorage', e);
    return [];
  }
}

export function saveAudioItem(item: GeneratedAudioItem): void {
  try {
    const existing = getAudioHistory();
    // Keep most recent first, limit to latest 30 items to prevent storage quota issues
    const filtered = existing.filter((i) => i.id !== item.id);
    const updated = [item, ...filtered].slice(0, 30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save to localStorage, attempting to prune older entries', e);
    try {
      const existing = getAudioHistory();
      const pruned = [item, ...existing.slice(0, 10)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
    } catch {
      // Storage full or quota exceeded
    }
  }
}

export function deleteAudioItem(id: string): GeneratedAudioItem[] {
  try {
    const existing = getAudioHistory();
    const updated = existing.filter((i) => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete item', e);
    return [];
  }
}

export function clearAudioHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear history', e);
  }
}
