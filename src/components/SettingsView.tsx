import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  HelpCircle, 
  BookOpen, 
  Film, 
  ExternalLink,
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';

interface SettingsViewProps {
  onResetWelcomeGate?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onResetWelcomeGate }) => {
  const [status, setStatus] = useState<{
    hasApiKey: boolean;
    defaultModel: string;
    sampleRate: number;
    audioFormat: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/status');
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      console.error('Failed to fetch status', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0C1527] via-[#0F1E38] to-[#0A1224] p-5 sm:p-6 border border-cyan-500/30 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                System & Specifications
              </span>
              <span className="text-xs text-slate-400">
                Audio Engine Configuration
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Settings & Production Guide
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Verify Gemini TTS engine status, explore Arabic voiceover pronunciation tips, and learn how to sync your audio clips with CapCut video editing.
            </p>
          </div>

          <button
            onClick={fetchStatus}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131D33] hover:bg-[#1A2846] text-slate-300 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Check Status</span>
          </button>
        </div>
      </div>

      {/* Backend Status Card */}
      <div className="p-5 rounded-2xl bg-[#0D1322] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            AI Speech Engine Status
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#080D18] border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400">API Connection</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <strong className="text-xs font-bold text-white">
                {status?.hasApiKey ? 'Server Configured' : 'Checking Key...'}
              </strong>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Managed via Environment</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080D18] border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400">Active Model</span>
            <div className="mt-2">
              <strong className="text-xs font-mono font-bold text-cyan-300 block truncate">
                {status?.defaultModel || 'gemini-3.8-flash-lite-tts'}
              </strong>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Cost-Optimized Low-Latency</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080D18] border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400">Audio Fidelity</span>
            <div className="mt-2">
              <strong className="text-xs font-mono font-bold text-white">
                24,000 Hz • 16-bit Mono
              </strong>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Broadcast Studio Quality</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080D18] border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400">Native Output Format</span>
            <div className="mt-2">
              <strong className="text-xs font-mono font-bold text-white">
                Lossless WAV (RIFF PCM)
              </strong>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Direct CapCut Import</span>
          </div>
        </div>
      </div>

      {/* Production Guides: Arabic & CapCut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Arabic Pronunciation Tips */}
        <div className="p-5 rounded-2xl bg-[#0D1322] border border-slate-800 shadow-xl flex flex-col">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Arabic Voiceover Best Practices (دليل النطق)
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed flex-1">
            <div className="p-3 rounded-xl bg-[#080D18] border border-slate-800/80">
              <strong className="text-cyan-300 block mb-1">1. استخدام التشكيل (Tashkeel)</strong>
              <span>
                لتفادي اللبس في قراءة الكلمات المتشابهة (مثل: عَلِمَ، عُلِمَ، عِلْم)، استخدم زر <strong>AI Tashkeel</strong> في المحرر لإضافة الحركات تلقائياً وضمان نطق دقيق 100%.
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#080D18] border border-slate-800/80">
              <strong className="text-cyan-300 block mb-1">2. علامات التوقف والوقفات (Pauses)</strong>
              <span>
                أدخل علامات الفاصلة (،) أو ثلاث نقاط (...) أو علامة <code className="text-cyan-300">&lt;breath&gt;</code> لإعطاء المعلق وقفة تنفسية طبيعية تشبه المذيع البشري في استوديوهات اليوتيوب.
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#080D18] border border-slate-800/80">
              <strong className="text-cyan-300 block mb-1">3. اللهجة المصرية والعامية</strong>
              <span>
                عند اختيار اللهجة المصرية (ar-EG)، يتم تكييف إيقاع ونبرة الصوت تلقائياً لتناسب روح المحتوى التفاعلي وفيديوهات اليوتيوب والريلز.
              </span>
            </div>
          </div>
        </div>

        {/* CapCut Video Sync Guide */}
        <div className="p-5 rounded-2xl bg-[#0D1322] border border-slate-800 shadow-xl flex flex-col">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
            <Film className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              CapCut & Video Editor Workflow
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed flex-1">
            <div className="p-3 rounded-xl bg-[#080D18] border border-slate-800/80">
              <strong className="text-cyan-300 block mb-1">1. One-Click Master WAV</strong>
              <span>
                Use the <strong>Combine Master WAV</strong> button in YouTube Workflow to get a single unified narration track with no header clicks or latency gaps between scenes.
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#080D18] border border-slate-800/80">
              <strong className="text-cyan-300 block mb-1">2. Auto-Captions with .SRT</strong>
              <span>
                Download the generated <code className="text-cyan-300">.SRT</code> file. In CapCut (Desktop or Mobile), open Subtitles &gt; Import Local Subtitle to have fully synchronized subtitles instantly!
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#080D18] border border-slate-800/80">
              <strong className="text-cyan-300 block mb-1">3. Motion Graphics & Character Cues</strong>
              <span>
                Use the Cue Sheet timeline to animate talking character mouths, display text bullets at exact seconds, and trigger transition sound effects.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* YouTube Channel Subscription Gate Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0D1322] border border-red-500/30 shadow-xl flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Mandatory YouTube Subscription Welcome Gate
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 uppercase tracking-wider">
                  Active
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Requires new visitors to click the subscription button before accessing the studio
              </p>
            </div>
          </div>

          {onResetWelcomeGate && (
            <button
              onClick={onResetWelcomeGate}
              className="px-3.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              Test Welcome Gate (Re-lock Screen)
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-[#080D18] border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">Target Channel</span>
            <a
              href="https://youtube.com/channel/UCc_fByzElT6WYUnr8vk-evg?sub_confirmation=1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline font-mono text-[11px] truncate block"
            >
              youtube.com/channel/UCc_fByzElT6WYUnr8vk-evg
            </a>
          </div>
          <div className="p-3 rounded-xl bg-[#080D18] border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">Gate Persistence</span>
            <span className="text-slate-200">
              Visitors must click the button to enable the Continue button. Refreshing without continuing will not bypass the gate.
            </span>
          </div>
        </div>
      </div>

      {/* Free Tier & Billing Transparency Breakdown */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0D1322] border border-cyan-500/30 shadow-xl flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Personal Use & Free-Tier Verification
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  $0.00 / Month
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Audited to ensure zero subscription fees and zero unexpected charges
              </p>
            </div>
          </div>
        </div>

        {/* Service Verification Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="pb-2 font-semibold">Service Layer</th>
                <th className="pb-2 font-semibold">Implementation</th>
                <th className="pb-2 font-semibold">Free Tier Allocation</th>
                <th className="pb-2 font-semibold text-right">Monthly Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              <tr>
                <td className="py-2.5 font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Gemini TTS Speech Engine
                </td>
                <td className="py-2.5 font-mono text-cyan-300">gemini-3.8-flash-lite-tts</td>
                <td className="py-2.5 text-slate-400">15 requests/min • 1,500 requests/day</td>
                <td className="py-2.5 text-right font-mono font-bold text-emerald-400">$0.00</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  App Hosting
                </td>
                <td className="py-2.5 text-slate-300">Google Cloud Run (AI Studio Preview)</td>
                <td className="py-2.5 text-slate-400">Included dev environment container</td>
                <td className="py-2.5 text-right font-mono font-bold text-emerald-400">$0.00</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Audio & Script Storage
                </td>
                <td className="py-2.5 text-slate-300">Client-Side IndexedDB / LocalStorage</td>
                <td className="py-2.5 text-slate-400">Zero cloud bucket fees (No AWS S3 / GCS)</td>
                <td className="py-2.5 text-right font-mono font-bold text-emerald-400">$0.00</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Database
                </td>
                <td className="py-2.5 text-slate-300">Zero External DB (No SQL or Firestore)</td>
                <td className="py-2.5 text-slate-400">No database instances provisioned</td>
                <td className="py-2.5 text-right font-mono font-bold text-emerald-400">$0.00</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Personal Quota Security
                </td>
                <td className="py-2.5 text-slate-300">PIN Access Control (<code className="text-cyan-300 font-mono">ioni2026</code>)</td>
                <td className="py-2.5 text-slate-400">Prevents public internet users from draining quota</td>
                <td className="py-2.5 text-right font-mono font-bold text-emerald-400">$0.00</td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Emergency Fallback Synthesizer
                </td>
                <td className="py-2.5 text-slate-300">Device Web Speech API</td>
                <td className="py-2.5 text-slate-400">Unlimited offline speech on Android/Desktop</td>
                <td className="py-2.5 text-right font-mono font-bold text-emerald-400">$0.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* What Happens When Free-Tier Limits Are Reached */}
        <div className="p-4 rounded-xl bg-[#080D18] border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            What Happens When Free-Tier Limits Are Reached?
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="p-3 rounded-lg bg-[#0E1526] border border-slate-800">
              <strong className="text-cyan-300 block mb-1">Minute Limit (15 Requests/Min)</strong>
              <span>
                If you generate scenes too quickly in succession, the app automatically pauses for a few seconds with a live countdown timer to protect your quota. <strong>No error is thrown and no fees are charged.</strong>
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#0E1526] border border-slate-800">
              <strong className="text-cyan-300 block mb-1">Daily Limit (1,500 Requests/Day)</strong>
              <span>
                If 1,500 generations are reached in 24 hours, the API pauses until 00:00 UTC. You can switch to the included <strong>Device Web Speech Mode</strong> for zero-cost offline narration. <strong>No billing card is ever charged.</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
