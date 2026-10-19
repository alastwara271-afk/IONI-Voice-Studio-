import React, { useState } from 'react';
import { 
  Clapperboard, 
  Sparkles, 
  Play, 
  Pause, 
  Download, 
  Plus, 
  Trash2, 
  Layers, 
  Film, 
  FileCode, 
  Share2, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Scissors,
  ArrowRight,
  Music,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { ScriptScene, VoiceName, LanguageCode, CapCutCue } from '../types';
import { VOICES } from '../data/voices';
import { 
  formatTime, 
  downloadBase64Audio, 
  generateCapCutSrt, 
  generateCapCutCueSheetJson, 
  downloadTextFile, 
  isArabicText 
} from '../utils/audio';
import { AudioPlayer } from './AudioPlayer';

const DEFAULT_IONI_SCRIPT = `Scene 1: المقدمة والخطاف
مرحباً بكم في حلقة جديدة من قناة أيوني التعليمية! هل تساءلتم يوماً كيف يمكن للذكاء الاصطناعي أن يتحدث باللغة العربية بنفس فصاحة وإحساس البشر؟

Scene 2: شرح المفهوم العلمي
الأمر يبدأ بتحليل الحروف والأصوات الصامتة وحركات التشكيل كالفَتْحَة والضَّمَّة والكَسْرَة، ثم تحويلها إلى موجات صوتية عالية الدقة بتردد 24 ألف هرتز.

Scene 3: التطبيق العملي والمونتاج
الآن يمكن لصناع المحتوى كتابة النص بالكامل، وتوليد التعليق الصوتي لكل مشهد على حدة، وتصديره مباشرة إلى برنامج كاب كات ليتطابق مع الرسوم المتحركة.

Scene 4: الخاتمة والدعوة للاشتراك
إذا استفدتم من هذا الشرح لا تنسوا الإعجاب بالفيديو والاشتراك في قناة أيوني، وشاركوا في التعليقات ما هو الموضوع التالي الذي تودون استكشافه!`;

import { fetchWithPersonalAuth } from '../utils/api';

interface YoutubeWorkflowViewProps {
  onQuotaUpdate?: () => void;
  onOpenAccessModal?: () => void;
}

export const YoutubeWorkflowView: React.FC<YoutubeWorkflowViewProps> = ({
  onQuotaUpdate,
  onOpenAccessModal,
}) => {
  const [fullScript, setFullScript] = useState<string>(DEFAULT_IONI_SCRIPT);
  const [scenes, setScenes] = useState<ScriptScene[]>([
    {
      id: 'scene-1',
      title: 'Scene 1: Introduction & Hook',
      text: 'مرحباً بكم في حلقة جديدة من قناة أيوني التعليمية! هل تساءلتم يوماً كيف يمكن للذكاء الاصطناعي أن يتحدث باللغة العربية بنفس فصاحة وإحساس البشر؟',
      voiceName: 'Kore',
      style: 'Energetic, confident, engaging educational YouTube host',
      speed: 'normal',
      language: 'ar-SA',
    },
    {
      id: 'scene-2',
      title: 'Scene 2: Core Concept Breakdown',
      text: 'الأمر يبدأ بتحليل الحروف والأصوات وحركات التشكيل كالفَتْحَة والضَّمَّة والكَسْرَة، ثم تحويلها إلى موجات صوتية عالية الدقة بتردد 24 ألف هرتز.',
      voiceName: 'Kore',
      style: 'Clear, articulate, instructional educational presenter',
      speed: 'normal',
      language: 'ar-SA',
    },
    {
      id: 'scene-3',
      title: 'Scene 3: CapCut Workflow & Production',
      text: 'الآن يمكن لصناع المحتوى كتابة النص بالكامل، وتوليد التعليق الصوتي لكل مشهد على حدة، وتصديره مباشرة إلى برنامج كاب كات ليتطابق مع الرسوم المتحركة.',
      voiceName: 'Fenrir',
      style: 'Warm, conversational tech explainer',
      speed: 'normal',
      language: 'ar-SA',
    },
    {
      id: 'scene-4',
      title: 'Scene 4: Outro & Call to Action',
      text: 'إذا استفدتم من هذا الشرح لا تنسوا الإعجاب بالفيديو والاشتراك في قناة أيوني، وشاركوا في التعليقات ما هو الموضوع التالي الذي تودون استكشافه!',
      voiceName: 'Kore',
      style: 'Friendly, warm, encouraging host inviting viewers to subscribe',
      speed: 'normal',
      language: 'ar-SA',
    },
  ]);

  const [activePreviewSceneId, setActivePreviewSceneId] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; message: string }>({
    current: 0,
    total: 0,
    message: '',
  });

  const [masterAudio, setMasterAudio] = useState<{
    audioBase64: string;
    durationSeconds: number;
    sizeBytes: number;
  } | null>(null);
  const [isCombining, setIsCombining] = useState(false);

  // Auto split script by paragraphs or scene labels
  const handleAutoSplit = () => {
    if (!fullScript.trim()) return;
    const parts = fullScript.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const newScenes: ScriptScene[] = parts.map((part, index) => {
      let title = `Scene ${index + 1}`;
      let text = part.trim();
      if (text.startsWith('Scene') || text.startsWith('المشهد') || text.includes(':')) {
        const colonIdx = text.indexOf(':');
        if (colonIdx > 0 && colonIdx < 40) {
          title = text.slice(0, colonIdx).trim();
          text = text.slice(colonIdx + 1).trim();
        }
      }
      return {
        id: `scene-${Date.now()}-${index}`,
        title,
        text,
        voiceName: index === 0 ? 'Puck' : 'Kore',
        style: 'Clear educational YouTube presenter',
        speed: 'normal',
        language: 'ar-SA',
      };
    });
    setScenes(newScenes);
  };

  const handleUpdateScene = (id: string, updates: Partial<ScriptScene>) => {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleDeleteScene = (id: string) => {
    setScenes((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddScene = () => {
    const nextIdx = scenes.length + 1;
    const newScene: ScriptScene = {
      id: `scene-${Date.now()}`,
      title: `Scene ${nextIdx}`,
      text: '',
      voiceName: 'Kore',
      style: 'Clear, confident educational presenter',
      speed: 'normal',
      language: 'ar-SA',
    };
    setScenes([...scenes, newScene]);
  };

  // Helper sleep for rate limit pacing
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Generate single scene
  const handleGenerateScene = async (sceneId: string) => {
    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene || !scene.text.trim()) return;

    try {
      handleUpdateScene(sceneId, { isGenerating: true, error: undefined });
      const res = await fetchWithPersonalAuth('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scene.text,
          voiceName: scene.voiceName,
          style: scene.style,
          language: scene.language,
          speed: scene.speed,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        handleUpdateScene(sceneId, { isGenerating: false, error: 'Personal PIN required' });
        if (onOpenAccessModal) onOpenAccessModal();
        return;
      }

      if (res.status === 429) {
        const wait = data.retryAfterSeconds || 5;
        handleUpdateScene(sceneId, { isGenerating: false, error: `Rate limited. Wait ${wait}s` });
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to synthesize scene.');
      }

      handleUpdateScene(sceneId, {
        audioBase64: data.audioBase64,
        durationSeconds: data.durationSeconds || 0,
        isGenerating: false,
      });

      if (onQuotaUpdate) onQuotaUpdate();
    } catch (err: any) {
      handleUpdateScene(sceneId, {
        isGenerating: false,
        error: err?.message || 'Generation failed',
      });
    }
  };

  // Batch generate all scenes with 1.5s automatic pacing to stay well under free tier 15 RPM
  const handleGenerateAll = async () => {
    if (scenes.length === 0) return;
    setIsBatchGenerating(true);
    setBatchProgress({ current: 0, total: scenes.length, message: 'Starting batch synthesis with safe free-tier pacing...' });

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      setBatchProgress({
        current: i + 1,
        total: scenes.length,
        message: `Synthesizing ${scene.title} (${i + 1}/${scenes.length})...`,
      });

      try {
        handleUpdateScene(scene.id, { isGenerating: true, error: undefined });
        const res = await fetchWithPersonalAuth('/api/tts/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: scene.text,
            voiceName: scene.voiceName,
            style: scene.style,
            language: scene.language,
            speed: scene.speed,
          }),
        });
        const data = await res.json();

        if (res.status === 401) {
          handleUpdateScene(scene.id, { isGenerating: false, error: 'Personal PIN required' });
          if (onOpenAccessModal) onOpenAccessModal();
          break;
        }

        if (res.status === 429) {
          const waitSec = data.retryAfterSeconds || 6;
          setBatchProgress({
            current: i + 1,
            total: scenes.length,
            message: `Free-tier buffer: pausing ${waitSec}s to avoid rate limit...`,
          });
          await sleep(waitSec * 1000);
          i--; // Retry this scene
          continue;
        }

        if (data.success && data.audioBase64) {
          handleUpdateScene(scene.id, {
            audioBase64: data.audioBase64,
            durationSeconds: data.durationSeconds || 0,
            isGenerating: false,
          });
          if (onQuotaUpdate) onQuotaUpdate();
        } else {
          handleUpdateScene(scene.id, {
            isGenerating: false,
            error: data.error || 'Failed',
          });
        }
      } catch (e: any) {
        handleUpdateScene(scene.id, {
          isGenerating: false,
          error: e?.message || 'Failed',
        });
      }

      // Safe pacing delay of 1.5s between scenes
      if (i < scenes.length - 1) {
        await sleep(1500);
      }
    }

    setIsBatchGenerating(false);
  };

  // Combine all generated scenes into a single master WAV file
  const handleCombineAll = async () => {
    const clipsToCombine = scenes.filter((s) => s.audioBase64).map((s) => s.audioBase64!);
    if (clipsToCombine.length === 0) {
      alert('Please generate audio for at least one scene before combining.');
      return;
    }

    try {
      setIsCombining(true);
      const res = await fetchWithPersonalAuth('/api/tts/concat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioClips: clipsToCombine }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to concatenate audio clips.');
      }

      setMasterAudio({
        audioBase64: data.audioBase64,
        durationSeconds: data.durationSeconds,
        sizeBytes: data.sizeBytes,
      });
    } catch (err: any) {
    } finally {
      setIsCombining(false);
    }
  };

  // Preview individual scene audio
  const handleTogglePreviewScene = (scene: ScriptScene) => {
    if (!scene.audioBase64) return;

    if (previewAudio) {
      previewAudio.pause();
      setPreviewAudio(null);
    }

    if (activePreviewSceneId === scene.id) {
      setActivePreviewSceneId(null);
      return;
    }

    const audio = new Audio(`data:audio/wav;base64,${scene.audioBase64}`);
    audio.onended = () => {
      setActivePreviewSceneId(null);
      setPreviewAudio(null);
    };
    setPreviewAudio(audio);
    setActivePreviewSceneId(scene.id);
    audio.play();
  };

  // Download single scene WAV
  const handleDownloadScene = (scene: ScriptScene, index: number) => {
    if (!scene.audioBase64) return;
    const cleanTitle = scene.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    downloadBase64Audio(scene.audioBase64, `IONI_Scene_${index + 1}_${cleanTitle}.wav`);
  };

  // Calculate CapCut Cues
  const calculateCues = (): CapCutCue[] => {
    let cumulative = 0;
    return scenes.map((scene, idx) => {
      const dur = scene.durationSeconds || Math.max(3, Math.round(scene.text.length / 15));
      const start = cumulative;
      const end = cumulative + dur;
      cumulative = end;

      return {
        sceneNumber: idx + 1,
        title: scene.title,
        startTime: start,
        endTime: end,
        duration: dur,
        formattedStartTime: formatTime(start),
        formattedEndTime: formatTime(end),
        text: scene.text,
        visualNote: `Visual cut / animation cue for Scene ${idx + 1}`,
      };
    });
  };

  // Export SRT Subtitles for CapCut
  const handleExportSrt = () => {
    const cues = calculateCues();
    const srtContent = generateCapCutSrt(cues);
    downloadTextFile(srtContent, 'IONI_CapCut_Subtitles.srt', 'text/plain');
  };

  // Export CapCut JSON Cue Sheet
  const handleExportCueSheet = () => {
    const cues = calculateCues();
    const totalDur = cues.length > 0 ? cues[cues.length - 1].endTime : 0;
    const jsonContent = generateCapCutCueSheetJson(cues, totalDur);
    downloadTextFile(jsonContent, 'IONI_CapCut_Cue_Sheet.json', 'application/json');
  };

  const totalGeneratedCount = scenes.filter((s) => s.audioBase64).length;
  const totalDuration = scenes.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
      {/* Workflow Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0C1527] via-[#101F3D] to-[#0A1224] p-5 sm:p-6 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                IONI YouTube Production Studio
              </span>
              <span className="text-xs text-slate-400">
                CapCut & Premiere Pro Sync Workflow
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Scene-by-Scene Script Narration & CapCut Timeline Sync
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              Paste your entire educational video script, break it down into sequential scenes, assign voice personas, generate each scene with zero latency loss, and export a combined master WAV along with CapCut subtitle markers!
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <span className="text-xs text-slate-400">Progress:</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-cyan-400 font-mono">
                {totalGeneratedCount} / {scenes.length} Scenes Ready
              </span>
              {totalDuration > 0 && (
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Total: {formatTime(totalDuration)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Script Importer / Auto Splitter */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0D1322] border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Paste Full YouTube Script
            </h3>
          </div>
          <button
            onClick={handleAutoSplit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Segment into Scenes</span>
          </button>
        </div>

        <textarea
          value={fullScript}
          onChange={(e) => setFullScript(e.target.value)}
          rows={4}
          placeholder="Paste complete script here with paragraphs or Scene labels..."
          className="w-full p-3 rounded-xl bg-[#090E1B] border border-slate-800 text-slate-200 text-xs sm:text-sm font-['Cairo'] resize-y outline-none focus:border-cyan-500"
          dir="rtl"
        />
      </div>

      {/* Action Toolbar for Scenes */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0C1220] p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddScene}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131E35] hover:bg-[#1A2846] text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add Scene</span>
          </button>

          <button
            onClick={handleGenerateAll}
            disabled={isBatchGenerating || scenes.length === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isBatchGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing ({batchProgress.current}/{batchProgress.total})...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate All Scenes in Order</span>
              </>
            )}
          </button>
        </div>

        {/* Master & CapCut Export buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCombineAll}
            disabled={isCombining || totalGeneratedCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#142038] hover:bg-[#1B2B4C] text-cyan-300 border border-cyan-500/30 text-xs font-semibold disabled:opacity-50 transition-colors"
          >
            {isCombining ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Music className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>Export Combined Master WAV</span>
          </button>

          <button
            onClick={handleExportSrt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131D30] hover:bg-[#1A2640] text-slate-300 border border-slate-700 text-xs font-semibold transition-colors"
            title="Download SRT subtitle file for CapCut auto sync"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            <span>CapCut .SRT</span>
          </button>

          <button
            onClick={handleExportCueSheet}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131D30] hover:bg-[#1A2640] text-slate-300 border border-slate-700 text-xs font-semibold transition-colors"
            title="Download CapCut Timeline Markers JSON"
          >
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <span>CapCut Cue Sheet (.JSON)</span>
          </button>
        </div>
      </div>

      {/* Master Audio Player Preview when combined */}
      {masterAudio && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0C1527] to-[#12203E] border border-cyan-400/40 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Full Video Narration Master Track (Seamless WAV)
              </h4>
            </div>
            <span className="text-xs font-mono text-cyan-300 font-bold">
              Total Duration: {formatTime(masterAudio.durationSeconds)}
            </span>
          </div>

          <AudioPlayer
            audioBase64={masterAudio.audioBase64}
            durationSeconds={masterAudio.durationSeconds}
            voiceName="Multi-Scene Master"
            title="IONI YouTube Episode — Complete Narration Track"
          />
        </div>
      )}

      {/* Sequential Scene Cards */}
      <div className="flex flex-col gap-4">
        {scenes.map((scene, index) => {
          const isArabic = isArabicText(scene.text) || scene.language.startsWith('ar');
          const isPreviewing = activePreviewSceneId === scene.id;

          return (
            <div
              key={scene.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                scene.audioBase64
                  ? 'bg-[#0E1628] border-cyan-500/30'
                  : 'bg-[#0B0F19] border-slate-800'
              }`}
            >
              {/* Scene Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center text-xs font-mono font-bold">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={scene.title}
                    onChange={(e) => handleUpdateScene(scene.id, { title: e.target.value })}
                    className="bg-transparent text-sm font-bold text-white border-b border-transparent focus:border-cyan-400 outline-none px-1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {/* Voice Selector for this scene */}
                  <select
                    value={scene.voiceName}
                    onChange={(e) => handleUpdateScene(scene.id, { voiceName: e.target.value as VoiceName })}
                    className="bg-[#131D33] text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-slate-700 outline-none focus:border-cyan-400"
                  >
                    {VOICES.map((v) => (
                      <option key={v.id} value={v.name}>
                        {v.name} ({v.gender})
                      </option>
                    ))}
                  </select>

                  {/* Delete Scene */}
                  {scenes.length > 1 && (
                    <button
                      onClick={() => handleDeleteScene(scene.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete scene"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Scene Text Area */}
              <div className="mb-3">
                <textarea
                  value={scene.text}
                  onChange={(e) => handleUpdateScene(scene.id, { text: e.target.value })}
                  placeholder="Enter narration for this scene..."
                  rows={3}
                  dir={isArabic ? 'rtl' : 'ltr'}
                  className={`w-full p-3 rounded-xl bg-[#080D18] border border-slate-800 text-slate-100 text-xs sm:text-sm outline-none focus:border-cyan-400 ${
                    isArabic ? "font-['Cairo']" : "font-['Plus_Jakarta_Sans']"
                  }`}
                />
              </div>

              {/* Scene Footer & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                <div className="flex items-center gap-3 text-slate-400">
                  <span>
                    <strong className="text-slate-200 font-mono">{scene.text.length}</strong> chars
                  </span>
                  {scene.durationSeconds ? (
                    <span className="flex items-center gap-1 text-cyan-300 font-semibold font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(scene.durationSeconds)}
                    </span>
                  ) : null}
                  {scene.error && (
                    <span className="text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {scene.error}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {scene.audioBase64 ? (
                    <>
                      {/* Play Scene Button */}
                      <button
                        onClick={() => handleTogglePreviewScene(scene)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                          isPreviewing
                            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                            : 'bg-[#14223D] hover:bg-[#1B2F55] text-cyan-300 border border-cyan-500/40'
                        }`}
                      >
                        {isPreviewing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isPreviewing ? 'Pause' : 'Play'}</span>
                      </button>

                      {/* Download Scene WAV */}
                      <button
                        onClick={() => handleDownloadScene(scene, index)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-all"
                        title="Download Scene Audio (.wav)"
                      >
                        <Download className="w-3.5 h-3.5 text-cyan-400" />
                        <span>WAV</span>
                      </button>

                      {/* Re-generate */}
                      <button
                        onClick={() => handleGenerateScene(scene.id)}
                        disabled={scene.isGenerating}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        title="Re-generate this scene"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleGenerateScene(scene.id)}
                      disabled={scene.isGenerating || !scene.text.trim()}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold shadow-md shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {scene.isGenerating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate Audio</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CapCut Synchronization Guide */}
      <div className="p-5 rounded-2xl bg-[#090D18] border border-slate-800 flex flex-col gap-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Film className="w-4 h-4 text-cyan-400" />
          How to Sync with CapCut Video Editor
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-[#0E1526] border border-slate-800">
            <span className="font-bold text-cyan-300 block mb-1">1. Export Master or Clips</span>
            <span>Download the combined master WAV or individual scene clips into your CapCut media bin.</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0E1526] border border-slate-800">
            <span className="font-bold text-cyan-300 block mb-1">2. Import .SRT Subtitles</span>
            <span>Click <strong>CapCut .SRT</strong> above. In CapCut, navigate to Text &gt; Auto Captions &gt; Import Local Subtitles.</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0E1526] border border-slate-800">
            <span className="font-bold text-cyan-300 block mb-1">3. Snap Visuals to Audio</span>
            <span>Use the scene timestamps from the cue sheet to trigger animated character reactions, b-roll cuts, and sound effects!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
