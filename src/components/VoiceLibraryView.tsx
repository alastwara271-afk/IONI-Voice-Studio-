import React, { useState } from 'react';
import { 
  Users, 
  Play, 
  Pause, 
  Sparkles, 
  Check, 
  Filter, 
  Volume2, 
  ArrowRight,
  ShieldCheck,
  Radio,
  Globe
} from 'lucide-react';
import { VOICES } from '../data/voices';
import { VoiceProfile, LanguageCode } from '../types';

import { fetchWithPersonalAuth } from '../utils/api';

interface VoiceLibraryViewProps {
  onSelectVoice: (voice: VoiceProfile) => void;
  selectedVoiceId: string;
  onOpenAccessModal?: () => void;
}

export const VoiceLibraryView: React.FC<VoiceLibraryViewProps> = ({
  onSelectVoice,
  selectedVoiceId,
  onOpenAccessModal,
}) => {
  const [filterGender, setFilterGender] = useState<'all' | 'Female' | 'Male'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [previewLanguage, setPreviewLanguage] = useState<'ar' | 'en'>('ar');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null);
  const [loadingVoiceId, setLoadingVoiceId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Voices' },
    { id: 'educational', label: 'Educational Presenter' },
    { id: 'storytelling', label: 'Deep Storyteller' },
    { id: 'energetic', label: 'Energetic Tech Host' },
    { id: 'calm', label: 'Calm & Academic' },
    { id: 'authoritative', label: 'Authoritative Documentary' },
    { id: 'friendly', label: 'Friendly & Cheerful' },
  ];

  const filteredVoices = VOICES.filter((v) => {
    if (filterGender !== 'all' && v.gender !== filterGender) return false;
    if (filterCategory !== 'all' && v.category !== filterCategory) return false;
    return true;
  });

  const handlePlayPreview = async (voice: VoiceProfile) => {
    if (activeAudio) {
      activeAudio.pause();
      setActiveAudio(null);
    }

    if (playingVoiceId === voice.id) {
      setPlayingVoiceId(null);
      return;
    }

    try {
      setLoadingVoiceId(voice.id);
      const sampleText = previewLanguage === 'ar' ? voice.arabicSample : voice.englishSample;
      const langCode: LanguageCode = previewLanguage === 'ar' ? 'ar-SA' : 'en-US';

      const res = await fetchWithPersonalAuth('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sampleText,
          voiceName: voice.name,
          style: voice.defaultStyle,
          language: langCode,
          speed: 'normal',
        }),
      });

      if (res.status === 401 && onOpenAccessModal) {
        onOpenAccessModal();
        setLoadingVoiceId(null);
        return;
      }

      const data = await res.json();
      if (data.success && data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audio.onended = () => {
          setPlayingVoiceId(null);
          setActiveAudio(null);
        };
        setActiveAudio(audio);
        setPlayingVoiceId(voice.id);
        await audio.play();
      }
    } catch (e) {
      console.error('Failed to preview', e);
    } finally {
      setLoadingVoiceId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0C1527] via-[#0F1E38] to-[#0A1224] p-5 sm:p-6 border border-cyan-500/30 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                AI Voice Catalog
              </span>
              <span className="text-xs text-slate-400">
                Multilingual Speech Synthesis
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Explore Studio Narrator Personas
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Audition high-fidelity voices curated for educational YouTube tutorials, scientific explainers, documentaries, and interactive storytelling in Arabic and English.
            </p>
          </div>

          {/* Sample language toggle */}
          <div className="flex items-center gap-2 bg-[#090D18] p-1.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 pl-2">Sample Language:</span>
            <button
              onClick={() => setPreviewLanguage('ar')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                previewLanguage === 'ar'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              العربية (Arabic)
            </button>
            <button
              onClick={() => setPreviewLanguage('en')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                previewLanguage === 'en'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0D1322] p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilterCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterCategory === c.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white bg-[#0A0E1A] border border-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Gender filter */}
        <div className="flex items-center gap-1 bg-[#090D18] p-1 rounded-xl border border-slate-800">
          {(['all', 'Female', 'Male'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setFilterGender(g)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterGender === g
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {g === 'all' ? 'All Genders' : g}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVoices.map((voice) => {
          const isSelected = selectedVoiceId === voice.id;
          const isPlaying = playingVoiceId === voice.id;
          const isLoading = loadingVoiceId === voice.id;

          return (
            <div
              key={voice.id}
              className={`flex flex-col justify-between p-5 rounded-2xl border transition-all relative overflow-hidden group ${
                isSelected
                  ? 'bg-gradient-to-b from-[#111C33] to-[#0D1526] border-cyan-400 shadow-xl shadow-cyan-500/20'
                  : 'bg-[#0D1322] border-slate-800 hover:border-slate-700 hover:bg-[#0f172a]'
              }`}
            >
              {voice.isIoniDefault && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500 text-slate-950 uppercase tracking-wider shadow-sm">
                  IONI Channel Host
                </div>
              )}

              <div>
                {/* Voice Profile Header */}
                <div className="flex items-center gap-3.5 mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl ${voice.avatarGradient} flex items-center justify-center text-white text-base font-bold shadow-lg shadow-cyan-950/40`}
                  >
                    {voice.name.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {voice.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{voice.gender}</span>
                      <span>•</span>
                      <span className="text-cyan-300 font-medium">{voice.toneTag}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {voice.description}
                </p>

                {/* Sample Quote */}
                <div className="p-3 rounded-xl bg-[#090D18] border border-slate-800/80 mb-4 text-xs text-slate-300 italic font-['Cairo'] leading-relaxed" dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'}>
                  "{previewLanguage === 'ar' ? voice.arabicSample : voice.englishSample}"
                </div>

                {/* Capability Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-cyan-300 border border-cyan-500/20">
                    Arabic & English
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    24kHz Lossless WAV
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Tashkeel Voweling
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
                {/* Listen button */}
                <button
                  onClick={() => handlePlayPreview(voice)}
                  disabled={isLoading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isPlaying
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {isLoading ? (
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  ) : isPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>{isLoading ? 'Loading...' : isPlaying ? 'Playing' : 'Audition'}</span>
                </button>

                {/* Select button */}
                <button
                  onClick={() => onSelectVoice(voice)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Active Voice</span>
                    </>
                  ) : (
                    <>
                      <span>Use in Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
