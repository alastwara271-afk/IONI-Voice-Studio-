import React, { useState } from 'react';
import { 
  History, 
  Trash2, 
  Download, 
  Play, 
  Pause, 
  Search, 
  Calendar, 
  Clock, 
  Volume2, 
  FileAudio,
  Check,
  AlertTriangle
} from 'lucide-react';
import { GeneratedAudioItem } from '../types';
import { formatTime, downloadBase64Audio } from '../utils/audio';

interface HistoryViewProps {
  items: GeneratedAudioItem[];
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  items,
  onDeleteItem,
  onClearAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null);

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.text.toLowerCase().includes(q) ||
      item.voiceName.toLowerCase().includes(q) ||
      item.voiceDisplayName.toLowerCase().includes(q)
    );
  });

  const handleTogglePlay = (item: GeneratedAudioItem) => {
    if (activeAudio) {
      activeAudio.pause();
      setActiveAudio(null);
    }

    if (playingId === item.id) {
      setPlayingId(null);
      return;
    }

    const audio = new Audio(`data:audio/wav;base64,${item.audioBase64}`);
    audio.onended = () => {
      setPlayingId(null);
      setActiveAudio(null);
    };
    setActiveAudio(audio);
    setPlayingId(item.id);
    audio.play();
  };

  const handleDownload = (item: GeneratedAudioItem) => {
    const filename = `IONI_${item.voiceName}_${new Date(item.timestamp).toISOString().slice(0, 10)}.wav`;
    downloadBase64Audio(item.audioBase64, filename, item.mimeType);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0C1527] via-[#0F1E38] to-[#0A1224] p-5 sm:p-6 border border-cyan-500/30 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Audio Archive
              </span>
              <span className="text-xs text-slate-400">
                Stored Locally in Your Browser
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Generated Speech Library ({items.length})
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Access your previous speech generations, replay audio anytime, and download lossless WAV files ready for your video editing timeline.
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear your local audio history?')) {
                  onClearAll();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {items.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audio scripts or voice name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D1322] border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      )}

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-[#0D1322] border border-slate-800 text-center">
          <FileAudio className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">
            {items.length === 0 ? 'No Generated Audio Yet' : 'No matching results'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm">
            {items.length === 0
              ? 'Head over to the Studio or YouTube Workflow tab to synthesize your first voiceover!'
              : 'Try searching for a different keyword or script phrase.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredItems.map((item) => {
            const isPlaying = playingId === item.id;
            const dateStr = new Date(item.timestamp).toLocaleString();

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0D1322] border border-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleTogglePlay(item)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      isPlaying
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                        : 'bg-gradient-to-tr from-blue-600 to-cyan-600 text-white hover:scale-105'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-bold text-white">
                        {item.voiceName}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                        {item.language}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {formatTime(item.durationSeconds)}
                      </span>
                      <span className="text-[10px] text-slate-500 hidden sm:inline">
                        • {dateStr}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 truncate" dir="auto">
                      {item.text}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 justify-end">
                  <button
                    onClick={() => handleDownload(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141F36] hover:bg-[#1B2B4A] text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download WAV</span>
                  </button>

                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete clip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
