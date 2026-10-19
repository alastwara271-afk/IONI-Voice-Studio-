import React, { useState } from 'react';
import { 
  Users, 
  Sparkles, 
  Volume2, 
  Play, 
  Pause, 
  Sliders, 
  Globe, 
  Gauge, 
  Check, 
  Info,
  ChevronRight
} from 'lucide-react';
import { VOICES, STYLE_PRESETS } from '../data/voices';
import { VoiceProfile, VoiceName, LanguageCode } from '../types';

interface VoiceControlsProps {
  selectedVoice: VoiceProfile;
  onSelectVoice: (voice: VoiceProfile) => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  stylePrompt: string;
  onStylePromptChange: (prompt: string) => void;
  speed: string; // 'normal' | 'slow' | 'brisk'
  onSpeedChange: (speed: string) => void;
  onPreviewVoice?: (voice: VoiceProfile) => void;
  previewingVoiceId?: string | null;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  selectedVoice,
  onSelectVoice,
  language,
  onLanguageChange,
  stylePrompt,
  onStylePromptChange,
  speed,
  onSpeedChange,
  onPreviewVoice,
  previewingVoiceId,
}) => {
  const [showAdvancedStyle, setShowAdvancedStyle] = useState(false);

  return (
    <div className="w-full flex flex-col gap-5 p-4 sm:p-5 rounded-2xl bg-[#0D1322] border border-slate-800 shadow-xl">
      {/* Top Header: Voice & Language Selection */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Voice & Narration Settings
          </h3>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1.5 bg-[#080D18] p-1 rounded-xl border border-slate-800">
          <Globe className="w-3.5 h-3.5 text-cyan-400 ml-2" />
          <button
            onClick={() => onLanguageChange('ar-SA')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              language === 'ar-SA'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            العربية (الفصحى)
          </button>
          <button
            onClick={() => onLanguageChange('ar-EG')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              language === 'ar-EG'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            العربية (مصر)
          </button>
          <button
            onClick={() => onLanguageChange('en-US')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              language === 'en-US'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Voice Selection Cards Carousel / Grid */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-semibold text-slate-300">
            Select AI Voice
          </label>
          <span className="text-[11px] text-slate-400">
            Current: <strong className="text-cyan-300">{selectedVoice.displayName}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {VOICES.map((v) => {
            const isSelected = selectedVoice.id === v.id;
            const isPreviewing = previewingVoiceId === v.id;
            return (
              <div
                key={v.id}
                onClick={() => onSelectVoice(v)}
                className={`relative flex flex-col p-3 rounded-xl border cursor-pointer transition-all duration-200 text-left group ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#131E35] to-[#0E1628] border-cyan-400 shadow-lg shadow-cyan-500/20'
                    : 'bg-[#0B0F19] border-slate-800 hover:border-slate-700 hover:bg-[#0f1628]'
                }`}
              >
                {v.isIoniDefault && (
                  <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500 text-slate-950 uppercase tracking-tighter">
                    IONI Host
                  </span>
                )}

                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg ${v.avatarGradient} flex items-center justify-center text-white text-xs font-bold shadow-md`}
                  >
                    {v.name.slice(0, 2)}
                  </div>

                  {/* Preview audio button */}
                  {onPreviewVoice && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreviewVoice(v);
                      }}
                      title={`Preview ${v.name}'s voice`}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isPreviewing
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300'
                      }`}
                    >
                      {isPreviewing ? (
                        <Pause className="w-3 h-3 fill-current" />
                      ) : (
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      )}
                    </button>
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {v.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {v.gender} • {v.toneTag.split('&')[0]}
                  </span>
                </div>

                {isSelected && (
                  <div className="absolute bottom-2 right-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Style Presets and Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Style Presets */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Presenter Tone & Emotion
          </label>
          <div className="flex flex-wrap gap-1.5">
            {STYLE_PRESETS.map((preset) => {
              const isActive = stylePrompt === preset.prompt;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onStylePromptChange(preset.prompt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                      : 'bg-[#0B0F19] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Speaking Pace */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Speaking Pace
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'slow', label: 'Measured / Slow', desc: 'Calm tutorials' },
              { id: 'normal', label: 'Balanced (1.0x)', desc: 'Standard IONI' },
              { id: 'brisk', label: 'Brisk / Energetic', desc: 'Hooks & Shorts' },
            ].map((p) => {
              const isPaceActive = speed === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSpeedChange(p.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                    isPaceActive
                      ? 'bg-gradient-to-b from-[#131E35] to-[#0E1628] border-cyan-400 text-cyan-300'
                      : 'bg-[#0B0F19] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold">{p.label}</span>
                  <span className="text-[10px] text-slate-500">{p.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Advanced Prompt Direction Toggle */}
      <div className="border-t border-slate-800/80 pt-3">
        <button
          type="button"
          onClick={() => setShowAdvancedStyle(!showAdvancedStyle)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Custom Voice Prompt Modifier ({showAdvancedStyle ? 'Hide' : 'Expand'})</span>
        </button>

        {showAdvancedStyle && (
          <div className="mt-2 p-3 rounded-xl bg-[#090D18] border border-slate-800">
            <p className="text-[11px] text-slate-400 mb-1.5">
              Fine-tune the exact directorial prompt sent to Gemini TTS metadata:
            </p>
            <input
              type="text"
              value={stylePrompt}
              onChange={(e) => onStylePromptChange(e.target.value)}
              placeholder="e.g. Energetic Arabic presenter with excitement and friendly smiles"
              className="w-full px-3 py-2 rounded-lg bg-[#0E1526] border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        )}
      </div>
    </div>
  );
};
