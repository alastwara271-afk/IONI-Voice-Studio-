import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  RefreshCw,
  Sparkles,
  FastForward,
  Rewind,
  Music2
} from 'lucide-react';
import { base64ToBlobUrl, downloadBase64Audio, formatTime } from '../utils/audio';

interface AudioPlayerProps {
  audioBase64: string;
  mimeType?: string;
  sampleRate?: number;
  durationSeconds?: number;
  voiceName?: string;
  styleDescription?: string;
  textSnippet?: string;
  onRegenerate?: () => void;
  title?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioBase64,
  mimeType = 'audio/wav',
  sampleRate = 24000,
  durationSeconds = 0,
  voiceName = 'Kore',
  styleDescription,
  textSnippet,
  onRegenerate,
  title = 'Generated Speech Narration',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize or update audio blob URL
  useEffect(() => {
    if (audioBase64) {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      const url = base64ToBlobUrl(audioBase64, mimeType);
      blobUrlRef.current = url;

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.volume = isMuted ? 0 : volume;
        audioRef.current.load();
      }
      setIsPlaying(false);
      setCurrentTime(0);
    }

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [audioBase64, mimeType]);

  // Handle audio time updates
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!duration || isNaN(duration) || duration === 0) {
        setDuration(audioRef.current.duration || durationSeconds);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => console.error('Play error', e));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      const target = Math.max(0, Math.min(duration || 100, audioRef.current.currentTime + seconds));
      audioRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleDownload = () => {
    const cleanVoice = voiceName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filename = `IONI_${cleanVoice}_${Date.now()}.wav`;
    downloadBase64Audio(audioBase64, filename, mimeType);
  };

  const handleCopyText = () => {
    if (!textSnippet) return;
    navigator.clipboard.writeText(textSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Canvas visualizer animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let offset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 48;
      const barWidth = canvas.width / bars - 2;

      for (let i = 0; i < bars; i++) {
        let height = 6;
        if (isPlaying) {
          // Rhythmic dynamic wave simulation
          const wave1 = Math.sin((i * 0.25) + offset * 0.15);
          const wave2 = Math.cos((i * 0.4) - offset * 0.1);
          height = Math.max(6, Math.abs(wave1 * wave2) * (canvas.height * 0.85));
        } else {
          // Static resting gentle pattern
          height = 6 + Math.sin(i * 0.3) * 4;
        }

        const x = i * (barWidth + 2);
        const y = (canvas.height - height) / 2;

        const isCurrent = (i / bars) <= (duration > 0 ? currentTime / duration : 0);

        const gradient = ctx.createLinearGradient(0, y, 0, y + height);
        if (isCurrent) {
          gradient.addColorStop(0, '#38BDF8');
          gradient.addColorStop(1, '#2563EB');
        } else {
          gradient.addColorStop(0, '#1E293B');
          gradient.addColorStop(1, '#334155');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, height, 2);
        ctx.fill();
      }

      if (isPlaying) {
        offset += 1;
      }
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, currentTime, duration]);

  const effectiveDuration = duration || durationSeconds || 1;

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-[#10172A] to-[#0B0F19] border border-cyan-500/30 p-4 sm:p-6 shadow-2xl shadow-cyan-950/30 relative overflow-hidden">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Music2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {title}
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Voice: {voiceName}
              </span>
            </h3>
            {styleDescription && (
              <p className="text-xs text-slate-400 truncate max-w-md">
                {styleDescription}
              </p>
            )}
          </div>
        </div>

        {/* Audio Format Specs */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-cyan-400 bg-[#0e172a] px-2.5 py-1 rounded-lg border border-slate-700">
            WAV 24kHz • 16-bit Mono
          </span>
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              title="Regenerate audio"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          {textSnippet && (
            <button
              onClick={handleCopyText}
              title="Copy script"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Waveform Canvas */}
      <div className="w-full bg-[#070B14] rounded-xl p-3 border border-slate-800 mb-4">
        <canvas
          ref={canvasRef}
          width={600}
          height={64}
          className="w-full h-16 rounded cursor-pointer"
          onClick={togglePlay}
        />
        
        {/* Scrubber Range Bar */}
        <div className="relative mt-2">
          <input
            type="range"
            min={0}
            max={effectiveDuration}
            step={0.05}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Time display */}
        <div className="flex justify-between items-center text-xs font-mono text-slate-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span className="text-cyan-300 font-semibold">{formatTime(effectiveDuration)}</span>
        </div>
      </div>

      {/* Main Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Playback Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => handleSkip(-5)}
            title="Rewind 5s"
            className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <Rewind className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 transition-transform active:scale-95"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>

          <button
            onClick={() => handleSkip(5)}
            title="Forward 5s"
            className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <FastForward className="w-4 h-4" />
          </button>

          {/* Speed Pills */}
          <div className="flex items-center gap-1 bg-[#0c1220] p-1 rounded-xl border border-slate-800 ml-1">
            {[0.75, 1, 1.25, 1.5].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`px-2 py-1 rounded-lg text-xs font-mono transition-colors ${
                  playbackSpeed === s
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Volume & Download */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          {/* Volume Slider */}
          <div className="flex items-center gap-2 bg-[#0c1220] px-3 py-1.5 rounded-xl border border-slate-800">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 sm:w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download WAV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
