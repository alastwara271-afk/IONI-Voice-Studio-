/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StudioView } from './components/StudioView';
import { YoutubeWorkflowView } from './components/YoutubeWorkflowView';
import { VoiceLibraryView } from './components/VoiceLibraryView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { PersonalAccessModal } from './components/PersonalAccessModal';
import { YouTubeWelcomeGate } from './components/YouTubeWelcomeGate';
import { VOICES } from './data/voices';
import { VoiceProfile, GeneratedAudioItem } from './types';
import { getAudioHistory, deleteAudioItem, clearAudioHistory } from './utils/storage';
import { getStoredPin, verifyStudioPin, getEngineStatus, FreeTierUsage } from './utils/api';

const YT_GATE_STORAGE_KEY = 'ioni_yt_subscribed_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'youtube' | 'library' | 'history' | 'settings'>('studio');
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfile>(VOICES[0]);
  const [historyItems, setHistoryItems] = useState<GeneratedAudioItem[]>([]);
  
  // Mandatory YouTube Subscription Welcome Screen Gate
  const [isGateUnlocked, setIsGateUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem(YT_GATE_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Access & Quota Stats
  const [isUnlocked, setIsUnlocked] = useState<boolean>(true);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState<boolean>(false);
  const [usageStats, setUsageStats] = useState<FreeTierUsage>({
    dailyRequests: 0,
    dailyLimit: 1500,
    minuteRequests: 0,
    minuteLimit: 15,
  });

  // Verify API on startup & load usage stats
  const refreshUsageAndAuth = useCallback(async () => {
    try {
      const pin = getStoredPin();
      const valid = await verifyStudioPin(pin);
      setIsUnlocked(valid);

      const status = await getEngineStatus();
      if (status.freeTierInfo?.currentUsage) {
        setUsageStats(status.freeTierInfo.currentUsage);
      }
    } catch (e) {
      console.warn('Status check warning', e);
    }
  }, []);

  useEffect(() => {
    const saved = getAudioHistory();
    setHistoryItems(saved);
    refreshUsageAndAuth();
  }, [refreshUsageAndAuth]);

  const handleUnlockGate = () => {
    try {
      localStorage.setItem(YT_GATE_STORAGE_KEY, 'true');
    } catch (e) {
      console.error(e);
    }
    setIsGateUnlocked(true);
  };

  const handleResetGate = () => {
    try {
      localStorage.removeItem(YT_GATE_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    setIsGateUnlocked(false);
  };

  const handleAudioSaved = (item: GeneratedAudioItem) => {
    setHistoryItems((prev) => [item, ...prev.filter((i) => i.id !== item.id)].slice(0, 30));
    refreshUsageAndAuth();
  };

  const handleDeleteItem = (id: string) => {
    const updated = deleteAudioItem(id);
    setHistoryItems(updated);
  };

  const handleClearAll = () => {
    clearAudioHistory();
    setHistoryItems([]);
  };

  const handleSelectVoiceFromLibrary = (voice: VoiceProfile) => {
    setSelectedVoice(voice);
    setActiveTab('studio');
  };

  return (
    <div className="min-h-screen bg-[#080C16] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-cyan-500 selection:text-slate-950">
      {/* Mandatory Full-Screen YouTube Subscription Welcome Screen */}
      {!isGateUnlocked && (
        <YouTubeWelcomeGate onUnlock={handleUnlockGate} />
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={historyItems.length}
        isUnlocked={isUnlocked}
        onOpenAccessModal={() => setIsAccessModalOpen(true)}
        usageToday={usageStats.dailyRequests}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pb-12">
        {activeTab === 'studio' && (
          <StudioView
            onAudioSaved={handleAudioSaved}
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
            onQuotaUpdate={refreshUsageAndAuth}
            onOpenAccessModal={() => setIsAccessModalOpen(true)}
          />
        )}

        {activeTab === 'youtube' && (
          <YoutubeWorkflowView
            onQuotaUpdate={refreshUsageAndAuth}
            onOpenAccessModal={() => setIsAccessModalOpen(true)}
          />
        )}

        {activeTab === 'library' && (
          <VoiceLibraryView
            onSelectVoice={handleSelectVoiceFromLibrary}
            selectedVoiceId={selectedVoice.id}
            onOpenAccessModal={() => setIsAccessModalOpen(true)}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            items={historyItems}
            onDeleteItem={handleDeleteItem}
            onClearAll={handleClearAll}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView onResetWelcomeGate={handleResetGate} />
        )}
      </main>

      {/* Access & Quota Info Modal */}
      <PersonalAccessModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        isUnlocked={isUnlocked}
        onUnlockSuccess={() => {
          setIsUnlocked(true);
          refreshUsageAndAuth();
        }}
        usageStats={usageStats}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#070A12] py-6 px-4 text-center text-xs text-slate-500 hidden md:block">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">IONI Voice Studio</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">Public Edition • Free AI Speech Studio ($0.00 / month)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Gemini TTS Free Tier (15 RPM • 1,500 RPD)</span>
            <span>•</span>
            <button
              onClick={() => setIsAccessModalOpen(true)}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Public Access & Quota Info
            </button>
            <span>•</span>
            <button
              onClick={handleResetGate}
              className="text-rose-400 hover:underline cursor-pointer"
              title="Re-open the YouTube subscription welcome screen"
            >
              YouTube Welcome Screen
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
