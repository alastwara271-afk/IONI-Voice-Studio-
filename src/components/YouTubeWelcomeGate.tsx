import React, { useState } from 'react';
import { 
  Youtube, 
  ExternalLink, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Volume2, 
  Heart,
  ShieldCheck
} from 'lucide-react';

interface YouTubeWelcomeGateProps {
  onUnlock: () => void;
}

const YOUTUBE_CHANNEL_URL = 'https://youtube.com/channel/UCc_fByzElT6WYUnr8vk-evg?sub_confirmation=1';

export const YouTubeWelcomeGate: React.FC<YouTubeWelcomeGateProps> = ({ onUnlock }) => {
  const [hasClickedSubscribe, setHasClickedSubscribe] = useState<boolean>(false);
  const [showThankYouNotice, setShowThankYouNotice] = useState<boolean>(false);

  const handleSubscribeClick = () => {
    setHasClickedSubscribe(true);
    setShowThankYouNotice(true);
  };

  const handleContinue = () => {
    if (!hasClickedSubscribe) return;
    onUnlock();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#070B14] overflow-y-auto selection:bg-cyan-500 selection:text-slate-950 font-['Plus_Jakarta_Sans']">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-gradient-to-tr from-rose-600/15 via-red-500/10 to-cyan-500/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative w-full max-w-xl my-auto rounded-3xl bg-gradient-to-b from-[#0E1526] via-[#0C1220] to-[#080D18] border border-slate-800 p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 text-center flex flex-col items-center">
        {/* IONI Logo & YouTube Badge */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            IONI <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Voice Studio</span>
          </span>
        </div>

        {/* Big YouTube Icon with glowing badge */}
        <div className="relative mb-4 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-xl shadow-red-500/25">
            <Youtube className="w-9 h-9 text-white fill-current" />
          </div>
          <span className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-[#0E1526] border border-red-500/40 text-[10px] font-bold text-red-400 uppercase tracking-wider shadow">
            Creator Support
          </span>
        </div>

        {/* Welcoming Text */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          Welcome to IONI Voice Studio!
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-md mx-auto mb-2 leading-relaxed">
          Before using our free AI voice studio, please support us by visiting and subscribing to our YouTube channel.
        </p>

        {/* Arabic Welcome Translation */}
        <p className="text-xs sm:text-sm text-cyan-300/90 font-['Cairo'] font-medium mb-6 max-w-md mx-auto leading-relaxed" dir="rtl">
          مرحباً بكم في استوديو أيوني الصوتي! قبل البدء في استخدام الاستوديو المجاني، يُرجى دعمنا بالاشتراك في قناتنا على يوتيوب.
        </p>

        {/* Channel Feature Box */}
        <div className="w-full rounded-2xl bg-[#090D18] border border-slate-800 p-4 mb-6 text-left flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
              <Youtube className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                IONI Educational Channel
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              </h3>
              <p className="text-xs text-slate-400 truncate">
                AI tutorials, video editing workflows & YouTube guides
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 shrink-0">
            Free Access
          </span>
        </div>

        {/* Step 1: Mandatory Subscription Button */}
        <div className="w-full flex flex-col gap-3">
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleSubscribeClick}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:via-rose-500 hover:to-red-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-red-600/30 active:scale-98 transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
          >
            <Youtube className="w-5 h-5 fill-current" />
            <span>Subscribe to My YouTube Channel</span>
            <ExternalLink className="w-4 h-4 opacity-75 group-hover:translate-x-0.5 transition-transform" />
          </a>

          {/* Feedback banner after clicking */}
          {showThankYouNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Thank you for visiting! You can now continue to the voice studio.
              </span>
            </div>
          )}

          {/* Step 2: Continue Button (Initially disabled/locked until subscribe is clicked) */}
          <button
            type="button"
            onClick={handleContinue}
            disabled={!hasClickedSubscribe}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2.5 ${
              hasClickedSubscribe
                ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:via-cyan-400 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/25 active:scale-98 cursor-pointer animate-pulse'
                : 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed opacity-70'
            }`}
          >
            {hasClickedSubscribe ? (
              <>
                <Unlock className="w-4 h-4 text-cyan-200" />
                <span>Continue to IONI Voice Studio</span>
                <ArrowRight className="w-4 h-4 text-cyan-200" />
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Continue to IONI Voice Studio (Click Subscribe Above First)</span>
              </>
            )}
          </button>
        </div>

        {/* Transparency note */}
        <div className="mt-5 text-[11px] text-slate-400 max-w-sm flex items-center justify-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
          <span>Your support helps us keep AI voice generation free for everyone.</span>
        </div>
      </div>
    </div>
  );
};
