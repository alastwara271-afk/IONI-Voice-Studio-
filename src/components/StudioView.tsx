import React, { useState } from 'react';
import { 
  Sparkles, 
  Volume2, 
  AlertCircle, 
  Loader2, 
  Layers, 
  Zap, 
  CheckCircle2,
  Share2
} from 'lucide-react';
import { TextEditor } from './TextEditor';
import { VoiceControls } from './VoiceControls';
import { AudioPlayer } from './AudioPlayer';
import { VOICES, SAMPLE_SCRIPTS, STYLE_PRESETS } from '../data/voices';
import { VoiceProfile, GeneratedAudioItem, LanguageCode } from '../types';
import { saveAudioItem } from '../utils/storage';
import { isArabicText } from '../utils/audio';

import { fetchWithPersonalAuth, speakWithBrowserWebSpeech, stopBrowserSpeech } from '../utils/api';

interface StudioViewProps {
  onAudioSaved: (item: GeneratedAudioItem) => void;
  selectedVoice: VoiceProfile;
  setSelectedVoice: (voice: VoiceProfile) => void;
  onQuotaUpdate?: () => void;
  onOpenAccessModal?: () => void;
}

export const StudioView: React.FC<StudioViewProps> = ({
  onAudioSaved,
  selectedVoice,
  setSelectedVoice,
  onQuotaUpdate,
  onOpenAccessModal,
}) => {
  const [text, setText] = useState<string>(SAMPLE_SCRIPTS.arabicEdu);
  const [language, setLanguage] = useState<LanguageCode>('ar-SA');
  const [stylePrompt, setStylePrompt] = useState<string>(STYLE_PRESETS[0].prompt);
  const [speed, setSpeed] = useState<string>('normal');

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isSpeakingDevice, setIsSpeakingDevice] = useState(false);

  const [generatedAudio, setGeneratedAudio] = useState<{
    audioBase64: string;
    durationSeconds: number;
    sampleRate: number;
    voiceName: string;
    style: string;
    title: string;
  } | null>(null);

  // Voice preview state
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);

  // Generate speech handler
  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Please enter or paste text to generate speech.');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setProgressStep('Connecting to Gemini TTS engine...');

      const timer1 = setTimeout(() => {
        setProgressStep('Synthesizing natural voiceover & Arabic vowels...');
      }, 700);

      const timer2 = setTimeout(() => {
        setProgressStep('Rendering studio 24kHz lossless WAV stream...');
      }, 2000);

      const res = await fetchWithPersonalAuth('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceName: selectedVoice.name,
          style: stylePrompt,
          language,
          speed,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const data = await res.json();

      if (res.status === 401) {
        setError('Personal Studio Locked: Please enter your personal PIN to unlock speech synthesis.');
        if (onOpenAccessModal) onOpenAccessModal();
        setIsGenerating(false);
        return;
      }

      if (res.status === 429) {
        const waitSec = data.retryAfterSeconds || 5;
        setError(data.error);
        setCountdown(waitSec);
        let remaining = waitSec;
        const countTimer = setInterval(() => {
          remaining -= 1;
          setCountdown(remaining);
          if (remaining <= 0) {
            clearInterval(countTimer);
            setCountdown(null);
            setError(null);
            handleGenerate(); // Auto retry after safe buffer!
          }
        }, 1000);
        setIsGenerating(false);
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to synthesize audio. Please try again.');
      }

      const newItem: GeneratedAudioItem = {
        id: `ioni_audio_${Date.now()}`,
        timestamp: Date.now(),
        text,
        voiceName: selectedVoice.name,
        voiceDisplayName: selectedVoice.displayName,
        language,
        style: stylePrompt,
        speed,
        durationSeconds: data.durationSeconds || 0,
        audioBase64: data.audioBase64,
        mimeType: 'audio/wav',
        sizeBytes: data.sizeBytes || 0,
        title: text.slice(0, 45) + (text.length > 45 ? '...' : ''),
      };

      setGeneratedAudio({
        audioBase64: data.audioBase64,
        durationSeconds: data.durationSeconds || 0,
        sampleRate: data.sampleRate || 24000,
        voiceName: selectedVoice.name,
        style: stylePrompt,
        title: newItem.title || 'Generated Narration',
      });

      // Save to localStorage history
      saveAudioItem(newItem);
      onAudioSaved(newItem);
      if (onQuotaUpdate) onQuotaUpdate();

      setProgressStep('');
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err?.message || 'Speech generation encountered an issue.');
    } finally {
      setIsGenerating(false);
      setProgressStep('');
    }
  };

  // Free Device Web Speech preview (Zero API calls, 100% free offline playback)
  const handleDeviceSpeechPreview = () => {
    if (isSpeakingDevice) {
      stopBrowserSpeech();
      setIsSpeakingDevice(false);
      return;
    }

    const started = speakWithBrowserWebSpeech(
      text,
      language,
      () => setIsSpeakingDevice(true),
      () => setIsSpeakingDevice(false)
    );

    if (!started) {
      alert('Device speech synthesis is not supported in this browser.');
    }
  };

  // Preview voice sample
  const handlePreviewVoice = async (voice: VoiceProfile) => {
    if (previewAudio) {
      previewAudio.pause();
      setPreviewAudio(null);
    }

    if (previewingVoiceId === voice.id) {
      setPreviewingVoiceId(null);
      return;
    }

    try {
      setPreviewingVoiceId(voice.id);
      const isArabic = language.startsWith('ar');
      const sampleText = isArabic ? voice.arabicSample : voice.englishSample;

      const res = await fetchWithPersonalAuth('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sampleText,
          voiceName: voice.name,
          style: voice.defaultStyle,
          language,
          speed: 'normal',
        }),
      });

      const data = await res.json();
      if (data.success && data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audio.onended = () => {
          setPreviewingVoiceId(null);
          setPreviewAudio(null);
        };
        setPreviewAudio(audio);
        await audio.play();
        if (onQuotaUpdate) onQuotaUpdate();
      } else {
        setPreviewingVoiceId(null);
        if (data.error && onOpenAccessModal && res.status === 401) {
          onOpenAccessModal();
        }
      }
    } catch (e) {
      console.error('Preview error', e);
      setPreviewingVoiceId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0C1527] via-[#0E1A33] to-[#0A1224] p-5 sm:p-6 border border-cyan-500/20 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-52 h-52 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Studio Workspace
              </span>
              <span className="text-xs text-slate-400">
                Optimized for Educational YouTube Narration
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Transform Your Script into Broadcast-Quality Speech
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Generate natural Arabic and English voiceovers with precise pronunciation, diacritics support, and direct WAV audio downloads for video editing in CapCut.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {VOICES.slice(0, 4).map((v) => (
                <div
                  key={v.id}
                  className={`w-8 h-8 rounded-full border-2 border-[#0B0F19] ${v.avatarGradient} flex items-center justify-center text-[10px] text-white font-bold shadow-md`}
                  title={v.name}
                >
                  {v.name.slice(0, 1)}
                </div>
              ))}
            </div>
            <span className="text-xs text-cyan-400 font-semibold pl-1">
              6 Studio Voices
            </span>
          </div>
        </div>
      </div>

      {/* Text Editor Section */}
      <TextEditor
        text={text}
        onChange={setText}
        language={language}
        onLanguageChange={(l) => setLanguage(l as LanguageCode)}
      />

      {/* Voice Selection & Controls */}
      <VoiceControls
        selectedVoice={selectedVoice}
        onSelectVoice={setSelectedVoice}
        language={language}
        onLanguageChange={setLanguage}
        stylePrompt={stylePrompt}
        onStylePromptChange={setStylePrompt}
        speed={speed}
        onSpeedChange={setSpeed}
        onPreviewVoice={handlePreviewVoice}
        previewingVoiceId={previewingVoiceId}
      />

      {/* Prominent Generate Button & Progress */}
      <div className="flex flex-col items-center gap-3 pt-2">
        {error && (
          <div className="w-full flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-semibold block mb-0.5">Speech Generation Error</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="w-full rounded-xl bg-[#0e1628] border border-cyan-500/30 p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-cyan-300 font-medium flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                {progressStep || 'Synthesizing voice audio...'}
              </span>
              <span className="text-slate-400 font-mono text-[11px]">Lossless WAV 24kHz</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-400 animate-pulse rounded-full w-3/4 transition-all duration-500"></div>
            </div>
          </div>
        )}

        {countdown !== null && (
          <div className="w-full flex items-center justify-between p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              <span><strong>Free-Tier Rate Limiter Buffer:</strong> Auto-pausing for {countdown}s to prevent quota error...</span>
            </div>
            <span className="font-mono font-bold text-amber-400 text-sm">{countdown}s</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || countdown !== null || !text.trim()}
            className="flex-1 sm:flex-initial sm:min-w-[280px] flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:via-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 active:scale-98 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Audio...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-cyan-200" />
                <span>Generate Speech ({selectedVoice.name})</span>
              </>
            )}
          </button>

          {/* Free Device Speech Preview (Zero API calls, 100% Free) */}
          <button
            type="button"
            onClick={handleDeviceSpeechPreview}
            className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl border font-semibold text-xs transition-all active:scale-95 ${
              isSpeakingDevice
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                : 'bg-[#121B30] hover:bg-[#182440] text-slate-300 border-slate-700'
            }`}
            title="Read text using built-in device voice (0 API calls, unlimited free offline speech)"
          >
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>{isSpeakingDevice ? 'Stop Device Voice' : 'Free Device Speech (0 API)'}</span>
          </button>
        </div>
      </div>

      {/* Generated Audio Player Result */}
      {generatedAudio && (
        <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 mb-2 px-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Audio Generated Successfully
            </span>
          </div>

          <AudioPlayer
            audioBase64={generatedAudio.audioBase64}
            durationSeconds={generatedAudio.durationSeconds}
            sampleRate={generatedAudio.sampleRate}
            voiceName={generatedAudio.voiceName}
            styleDescription={generatedAudio.style}
            textSnippet={text}
            onRegenerate={handleGenerate}
            title={generatedAudio.title}
          />
        </div>
      )}
    </div>
  );
};
