import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  Film,
  Loader2,
  Clock,
  Cpu,
  Layers,
  StopCircle,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { formatFileSize, formatDuration } from '../../utils/formatters';

export default function VideoPlayer({
  activeJob,
  activeVideoUrl,
  videoMetadata,
  onDownload,
  onCancelJob
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer for active jobs
  useEffect(() => {
    let timer;
    if (activeJob && (activeJob.status === 'queued' || activeJob.status === 'preparing' || activeJob.status === 'generating' || activeJob.status === 'processing_output')) {
      const startTime = new Date(activeJob.createdAt).getTime();
      timer = setInterval(() => {
        setElapsedSeconds(Math.max(0, Math.round((Date.now() - startTime) / 1000)));
      }, 500);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [activeJob]);

  // Video playback controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
  };

  const handleRateChange = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      }
    }
  };

  // State 1: Active In-Progress / Queued Job
  if (activeJob && (activeJob.status === 'queued' || activeJob.status === 'preparing' || activeJob.status === 'generating' || activeJob.status === 'processing_output')) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-theme-bg select-none">
        <div className="w-20 h-20 rounded-3xl bg-theme-accentSubtle border border-theme-border flex items-center justify-center mb-6 text-theme-accent shadow-sm relative">
          <Loader2 className="w-10 h-10 animate-spin text-theme-accent" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 animate-ping" />
        </div>

        <div className="space-y-2 max-w-md">
          <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-theme-accentSubtle text-theme-accentText border border-theme-border font-bold uppercase tracking-wide">
            {activeJob.status}
          </span>

          <h3 className="text-lg font-bold text-theme-primary">
            {activeJob.progressMessage || 'Synthesizing Video Motion...'}
          </h3>

          <p className="text-xs text-theme-secondary line-clamp-2 italic">
            "{activeJob.prompt}"
          </p>

          <div className="flex items-center justify-center space-x-3 text-xs text-theme-muted font-mono pt-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Elapsed: {elapsedSeconds}s
            </span>
            <span>•</span>
            <span>{activeJob.width}×{activeJob.height}</span>
            <span>•</span>
            <span>{activeJob.duration}s @ {activeJob.fps}fps</span>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={() => onCancelJob(activeJob.id)}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-600 text-xs font-semibold flex items-center space-x-1.5 mx-auto transition-colors"
            >
              <StopCircle className="w-4 h-4" />
              <span>Cancel Video Job</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Failed Job
  if (activeJob && activeJob.status === 'failed') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-theme-bg select-none">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-500 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-theme-primary mb-1">Video Generation Failed</h3>
        <p className="text-xs text-red-600 max-w-md leading-relaxed mb-6 font-mono p-3 rounded-lg bg-red-500/5 border border-red-500/10">
          {activeJob.error || 'An unexpected error occurred during frame synthesis.'}
        </p>
        <p className="text-xs text-theme-muted max-w-sm">
          Your starting frame, ending frame, and prompt settings have been preserved on the left. You can adjust parameters and retry anytime.
        </p>
      </div>
    );
  }

  // State 3: Empty Workspace State (No active video)
  if (!activeVideoUrl && (!activeJob || activeJob.status !== 'completed')) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-theme-bg select-none">
        <div className="w-20 h-20 rounded-3xl bg-theme-accentSubtle border border-theme-border flex items-center justify-center mb-4 text-theme-accent shadow-sm">
          <Film className="w-10 h-10 opacity-70" />
        </div>
        <h3 className="text-lg font-bold text-theme-primary mb-1">AI Video Studio Ready</h3>
        <p className="text-xs text-theme-secondary max-w-md leading-relaxed mb-6">
          Generate fluid, high-resolution cinematic video between two reference frames. Upload a starting frame (Frame A), an ending frame (Frame B), and describe the motion transition.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-theme-muted font-mono">
          <span className="px-3 py-1 rounded-full bg-theme-surface border border-theme-border shadow-xs">First-Last Frame Conditioning</span>
          <span className="px-3 py-1 rounded-full bg-theme-surface border border-theme-border shadow-xs">Wan2.1 & LTX-Video</span>
          <span className="px-3 py-1 rounded-full bg-theme-surface border border-theme-border shadow-xs">Apple Silicon VideoToolbox</span>
          <span className="px-3 py-1 rounded-full bg-theme-surface border border-theme-border shadow-xs">Lossless Local Storage</span>
        </div>
      </div>
    );
  }

  // State 4: Completed Video Player Stage
  const meta = videoMetadata || activeJob?.videoMetadata || {};
  const promptText = activeJob?.prompt || 'Generated AI Video';

  return (
    <div className="w-full h-full flex flex-col bg-theme-bg overflow-hidden">
      {/* Top Technical Metadata Bar */}
      <div className="h-12 border-b border-theme-border px-4 flex items-center justify-between bg-theme-surface flex-shrink-0 shadow-xs">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-theme-accentSubtle border border-theme-border text-theme-accentText font-semibold">
            {meta.width || activeJob?.width || 1280} × {meta.height || activeJob?.height || 720} ({activeJob?.aspectRatio || '16:9'})
          </span>

          <span className="text-xs text-theme-secondary font-mono truncate max-w-[140px] hidden sm:inline">
            {activeJob?.model || 'Video Engine'}
          </span>

          <span className="text-xs text-theme-muted font-mono hidden md:inline">
            • {meta.duration || activeJob?.duration || 4}s @ {meta.fps || activeJob?.fps || 24}fps
          </span>

          {meta.size && (
            <span className="text-xs text-theme-muted font-mono hidden lg:inline">
              • {formatFileSize(meta.size)}
            </span>
          )}

          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            First-Last Frame
          </span>
        </div>

        {/* Right Action: Download Video */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => onDownload(activeJob)}
            className="px-3 py-1.5 rounded-lg bg-theme-accent hover:bg-theme-accentHover text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Video</span>
          </button>
        </div>
      </div>

      {/* Main Video Screen */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        <div className="max-w-full max-h-full flex items-center justify-center rounded-xl overflow-hidden shadow-2xl border border-theme-border bg-black relative group">
          <video
            ref={videoRef}
            src={activeVideoUrl}
            poster={activeJob?.posterUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
            className="max-h-[calc(100vh-17rem)] max-w-full object-contain cursor-pointer"
            playsInline
          />

          {/* Centered Play Button Overlay when paused */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition-all transform hover:scale-110 shadow-xl border border-white/20"
            >
              <Play className="w-7 h-7 ml-1" />
            </button>
          )}
        </div>
      </div>

      {/* Video Control Bar */}
      <div className="border-t border-theme-border px-4 py-2 bg-theme-surface flex-shrink-0 space-y-2 shadow-xs">
        {/* Progress Seek Bar */}
        <div className="flex items-center space-x-3">
          <span className="text-[10px] font-mono text-theme-muted w-10 text-right">
            {formatDurationSeconds(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 1}
            step="0.05"
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 accent-theme-accent h-1.5 bg-theme-subtle rounded-lg cursor-pointer"
          />
          <span className="text-[10px] font-mono text-theme-muted w-10">
            {formatDurationSeconds(duration)}
          </span>
        </div>

        {/* Playback Controls Strip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg hover:bg-theme-subtle text-theme-primary transition-colors"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play();
                  setIsPlaying(true);
                }
              }}
              className="p-1.5 rounded-lg hover:bg-theme-subtle text-theme-secondary hover:text-theme-primary transition-colors"
              title="Restart Video"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Volume */}
            <div className="flex items-center space-x-1 pl-2 border-l border-theme-border">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg hover:bg-theme-subtle text-theme-secondary hover:text-theme-primary transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 accent-theme-accent h-1 bg-theme-subtle rounded cursor-pointer hidden sm:block"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Speed Selector */}
            <div className="flex items-center space-x-1 p-0.5 rounded-md bg-theme-subtle border border-theme-border text-[10px] font-mono">
              {[0.5, 1, 1.5, 2].map(rate => (
                <button
                  key={rate}
                  onClick={() => handleRateChange(rate)}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    playbackRate === rate
                      ? 'bg-theme-surface text-theme-accent font-bold shadow-xs'
                      : 'text-theme-muted hover:text-theme-primary'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            <button
              onClick={handleFullscreen}
              className="p-1.5 rounded-lg hover:bg-theme-subtle text-theme-secondary hover:text-theme-primary transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Prompt Bar */}
      <div className="border-t border-theme-border p-3 bg-theme-surface flex-shrink-0">
        <p className="text-xs text-theme-secondary line-clamp-2 leading-relaxed">
          <span className="font-semibold text-theme-primary mr-1">Motion Prompt:</span>
          {promptText}
        </p>
      </div>
    </div>
  );
}

function formatDurationSeconds(sec) {
  if (isNaN(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

