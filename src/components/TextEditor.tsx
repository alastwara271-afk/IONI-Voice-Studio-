import React, { useState } from 'react';
import { 
  Sparkles, 
  Trash2, 
  AlignRight, 
  AlignLeft, 
  Clock, 
  Type, 
  FileText,
  Wand2,
  HelpCircle,
  Check,
  ChevronDown
} from 'lucide-react';
import { estimateAudioDuration, isArabicText } from '../utils/audio';
import { SAMPLE_SCRIPTS } from '../data/voices';

import { fetchWithPersonalAuth } from '../utils/api';

interface TextEditorProps {
  text: string;
  onChange: (newText: string) => void;
  language: string;
  onLanguageChange?: (lang: string) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  text,
  onChange,
  language,
  onLanguageChange,
}) => {
  const [isTashkeelLoading, setIsTashkeelLoading] = useState(false);
  const [directionOverride, setDirectionOverride] = useState<'rtl' | 'ltr' | 'auto'>('auto');
  const [showPresets, setShowPresets] = useState(false);
  const [tashkeelSuccess, setTashkeelSuccess] = useState(false);

  // Determine direction
  const isArabic = isArabicText(text) || language.startsWith('ar');
  const effectiveDirection = directionOverride === 'auto' 
    ? (isArabic ? 'rtl' : 'ltr') 
    : directionOverride;

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const estSeconds = estimateAudioDuration(text, language);

  // Insert diacritic or symbol at current selection
  const insertSymbol = (symbol: string) => {
    const textarea = document.getElementById('ioni-main-editor') as HTMLTextAreaElement | null;
    if (!textarea) {
      onChange(text + symbol);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const updated = before + symbol + after;
    onChange(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 10);
  };

  // AI Tashkeel & Diacritics Optimizer
  const handleEnhanceTashkeel = async () => {
    if (!text.trim()) return;
    try {
      setIsTashkeelLoading(true);
      const dialect = language === 'ar-EG' ? 'egyptian' : 'msa';
      const res = await fetchWithPersonalAuth('/api/text/tashkeel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, dialect }),
      });
      const data = await res.json();
      if (data.success && data.optimizedText) {
        onChange(data.optimizedText);
        setTashkeelSuccess(true);
        setTimeout(() => setTashkeelSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Tashkeel error', e);
    } finally {
      setIsTashkeelLoading(false);
    }
  };

  const handleLoadSample = (sampleKey: keyof typeof SAMPLE_SCRIPTS) => {
    onChange(SAMPLE_SCRIPTS[sampleKey]);
    setShowPresets(false);
    if (sampleKey === 'arabicEdu' && onLanguageChange) onLanguageChange('ar-SA');
    if (sampleKey === 'egyptianReview' && onLanguageChange) onLanguageChange('ar-EG');
    if (sampleKey === 'englishTutorial' && onLanguageChange) onLanguageChange('en-US');
  };

  return (
    <div className="w-full flex flex-col rounded-2xl bg-[#0D1322] border border-slate-800 shadow-xl overflow-hidden focus-within:border-cyan-500/50 transition-all">
      {/* Editor Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#0B0F19] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-cyan-400" />
            Script Text Editor
          </span>

          {/* Sample Scripts Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141C30] hover:bg-[#1C2642] border border-slate-700 text-xs text-cyan-300 transition-colors"
            >
              <span>Load Sample</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showPresets && (
              <div className="absolute left-0 mt-1 w-64 bg-[#0e1628] border border-slate-700 rounded-xl shadow-2xl z-30 py-1.5 backdrop-blur-md">
                <button
                  onClick={() => handleLoadSample('arabicEdu')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-300 flex flex-col"
                >
                  <span className="font-semibold">Arabic Educational Host (الفصحى)</span>
                  <span className="text-[10px] text-slate-400">IONI Science Explainer script</span>
                </button>
                <button
                  onClick={() => handleLoadSample('egyptianReview')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-300 flex flex-col"
                >
                  <span className="font-semibold">Egyptian Tech Tutorial (عامية مصرية)</span>
                  <span className="text-[10px] text-slate-400">Casual YouTube video tutorial</span>
                </button>
                <button
                  onClick={() => handleLoadSample('englishTutorial')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-300 flex flex-col"
                >
                  <span className="font-semibold">English YouTube Intro & CapCut</span>
                  <span className="text-[10px] text-slate-400">Step-by-step editing workflow</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Direction & Actions */}
        <div className="flex items-center gap-2">
          {/* Text Direction toggle */}
          <div className="flex items-center bg-[#131c31] p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setDirectionOverride('ltr')}
              title="Left-to-Right (English)"
              className={`p-1.5 rounded-md text-xs transition-colors ${
                effectiveDirection === 'ltr' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDirectionOverride('rtl')}
              title="Right-to-Left (Arabic)"
              className={`p-1.5 rounded-md text-xs transition-colors ${
                effectiveDirection === 'rtl' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Clear Button */}
          {text && (
            <button
              onClick={() => onChange('')}
              title="Clear script"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative p-3 sm:p-4">
        <textarea
          id="ioni-main-editor"
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            effectiveDirection === 'rtl'
              ? 'اكتب أو الصق نص الفيديو التعليمي هنا باللغة العربية (الفصحى أو العامية)...'
              : 'Type or paste your educational YouTube script here in English or Arabic...'
          }
          dir={effectiveDirection}
          rows={7}
          className={`w-full bg-transparent text-slate-100 placeholder:text-slate-500 resize-y outline-none leading-relaxed text-sm sm:text-base ${
            effectiveDirection === 'rtl' ? "font-['Cairo']" : "font-['Plus_Jakarta_Sans']"
          }`}
        />
      </div>

      {/* Arabic Pronunciation & Diacritics (Tashkeel) Bar */}
      <div className="px-3 sm:px-4 py-2.5 bg-[#0A0F1D] border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
        {/* Diacritics & Pause markers */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          <span className="text-[11px] font-medium text-slate-400 mr-1 hidden sm:inline">
            Arabic Tashkeel & Pauses:
          </span>
          
          {/* Quick Diacritic buttons */}
          {[
            { label: 'َ', name: 'فتحة' },
            { label: 'ُ', name: 'ضمة' },
            { label: 'ِ', name: 'كسرة' },
            { label: 'ْ', name: 'سكون' },
            { label: 'ّ', name: 'شدّة' },
            { label: 'ً', name: 'تنوين فتح' },
            { label: 'ٌ', name: 'تنوين ضم' },
            { label: 'ٍ', name: 'تنوين كسر' },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => insertSymbol(item.label)}
              title={item.name}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#141C30] hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-200 border border-slate-700 text-sm font-['Cairo'] font-bold transition-all"
            >
              {item.label}
            </button>
          ))}

          {/* Pause insert button */}
          <button
            type="button"
            onClick={() => insertSymbol('... ')}
            title="Insert breathing pause"
            className="px-2 h-7 flex items-center gap-1 rounded-lg bg-[#141C30] hover:bg-cyan-500/20 text-slate-300 text-xs border border-slate-700 transition-all"
          >
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Pause (...)</span>
          </button>

          {/* Vocal breath button */}
          <button
            type="button"
            onClick={() => insertSymbol('<breath> ')}
            title="Natural breath mark for Gemini TTS"
            className="px-2 h-7 flex items-center rounded-lg bg-[#141C30] hover:bg-cyan-500/20 text-slate-300 text-xs border border-slate-700 transition-all font-mono"
          >
            &lt;breath&gt;
          </button>
        </div>

        {/* AI Tashkeel Enhancer Button */}
        <button
          type="button"
          onClick={handleEnhanceTashkeel}
          disabled={isTashkeelLoading || !text.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/80 to-cyan-600/80 hover:from-blue-600 hover:to-cyan-600 text-white text-xs font-semibold shadow-md shadow-cyan-500/15 disabled:opacity-50 transition-all active:scale-95"
        >
          {isTashkeelLoading ? (
            <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-300" />
          ) : tashkeelSuccess ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Wand2 className="w-3.5 h-3.5 text-cyan-300" />
          )}
          <span>
            {isTashkeelLoading
              ? 'Enhancing Vowels...'
              : tashkeelSuccess
              ? 'Vowels Applied!'
              : 'AI Tashkeel (تشكيل دقيق)'}
          </span>
        </button>
      </div>

      {/* Editor Footer Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#090D18] border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-slate-500" />
            <strong className="text-slate-200 font-mono">{charCount}</strong> characters
          </span>
          <span className="flex items-center gap-1.5">
            <strong className="text-slate-200 font-mono">{wordCount}</strong> words
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Estimated audio: <strong className="font-mono">~{estSeconds}s</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-[11px] text-slate-500">
            {isArabic ? 'Arabic Mode (125 wpm)' : 'English Mode (145 wpm)'}
          </span>
        </div>
      </div>
    </div>
  );
};
