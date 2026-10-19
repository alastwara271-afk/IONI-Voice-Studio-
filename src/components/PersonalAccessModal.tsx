import React from 'react';
import { 
  Globe, 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  Activity, 
  Info,
  ExternalLink,
  Users
} from 'lucide-react';
import { FreeTierUsage } from '../utils/api';

interface PersonalAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  isUnlocked: boolean;
  onUnlockSuccess: () => void;
  usageStats?: FreeTierUsage;
}

export const PersonalAccessModal: React.FC<PersonalAccessModalProps> = ({
  isOpen,
  onClose,
  usageStats,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0D1322] border border-cyan-500/40 p-6 shadow-2xl shadow-cyan-950/50">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Public Access & Sharing Status
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Open Access
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Anyone with the link can generate audio without sign-in or PIN
            </p>
          </div>
        </div>

        {/* Public Status Banner */}
        <div className="p-3.5 rounded-xl bg-[#080D18] border border-slate-800 mb-4 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Application Unrestricted</strong>
              <span>
                PIN security gates have been lifted. All visitors can now generate Modern Standard Arabic, Egyptian Arabic, and English voiceovers, audition voices, and download lossless WAV audio files.
              </span>
            </div>
          </div>
        </div>

        {/* Platform Level Unauthenticated Sharing Guide */}
        <div className="p-4 rounded-xl bg-[#080D18] border border-cyan-500/20 mb-4 text-xs text-slate-300 space-y-2">
          <h4 className="font-bold text-white flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            To allow visitors without a Google account:
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed pl-1">
            <li>
              In the Google AI Studio top-right toolbar, click the <strong>Share</strong> button.
            </li>
            <li>
              Under <strong>General Access</strong> / <strong>Link Sharing</strong>, select <strong>"Anyone with the link"</strong> (Viewer).
            </li>
            <li>
              Copy the shared public link. Visitors will now bypass the Google account sign-in prompt and access the studio directly!
            </li>
          </ol>
        </div>

        {/* Live Free Tier Limits Details */}
        <div className="border-t border-slate-800 pt-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Active Free Tier Quota (Zero Billing)
          </h4>

          <div className="grid grid-cols-2 gap-2.5 mb-3 text-xs">
            <div className="p-3 rounded-xl bg-[#080D18] border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Daily Requests Used</span>
              <strong className="text-sm font-mono text-cyan-300">
                {usageStats?.dailyRequests || 0} / 1,500
              </strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">$0.00 Cost</span>
            </div>

            <div className="p-3 rounded-xl bg-[#080D18] border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Minute Rate Buffer</span>
              <strong className="text-sm font-mono text-cyan-300">
                {usageStats?.minuteRequests || 0} / 15 RPM
              </strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Auto-Paced</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>API Keys & Credentials:</span>
            <span className="text-emerald-400 font-mono font-semibold">100% Server-Side Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
