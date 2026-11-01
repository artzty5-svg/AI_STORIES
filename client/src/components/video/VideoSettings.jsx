import React, { useState } from 'react';
import {
  Layers,
  Clock,
  Maximize2,
  Film,
  Sliders,
  ChevronDown,
  ChevronRight,
  Shuffle,
  Lock,
  Unlock,
  Cpu,
  Info
} from 'lucide-react';

const DURATION_PRESETS = [2, 4, 5, 8, 10];
const RESOLUTION_PRESETS = ['480p', '540p', '720p', '1080p'];
const ASPECT_PRESETS = [
  { id: '16:9', label: '16:9', desc: 'Widescreen' },
  { id: '9:16', label: '9:16', desc: 'Vertical / Story' },
  { id: '1:1', label: '1:1', desc: 'Square' },
  { id: '4:3', label: '4:3', desc: 'Standard' },
  { id: '3:2', label: '3:2', desc: 'Landscape' }
];

export default function VideoSettings({
  models = [],
  selectedModel,
  setSelectedModel,
  duration,
  setDuration,
  resolution,
  setResolution,
  aspectRatio,
  setAspectRatio,
  fps,
  setFps,
  seed,
  setSeed,
  isSeedLocked,
  setIsSeedLocked,
  steps,
  setSteps,
  guidanceScale,
  setGuidanceScale,
  disabled
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const currentModelObj = models.find(m => m.id === selectedModel) || models[0];
  const totalFrames = duration * fps;

  return (
    <div className="space-y-3 pt-1">
      {/* Video Model Selection */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-theme-primary flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-theme-accent" />
            <span>Video Model & Pipeline</span>
          </label>
          <span className="text-[10px] text-theme-muted font-mono">First-Last Frame</span>
        </div>

        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={disabled}
          className="w-full bg-theme-input border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-primary focus:outline-none focus:border-theme-accent cursor-pointer shadow-xs font-medium"
        >
          {models.map(m => (
            <option key={m.id} value={m.id}>
              {m.name} [ComfyUI]
            </option>
          ))}
        </select>

        {currentModelObj && (
          <div className="p-2.5 rounded-xl bg-theme-subtle border border-theme-border space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-theme-primary font-mono font-semibold">{currentModelObj.id}</span>
              <span className="px-2 py-0.5 rounded text-[9px] uppercase font-mono font-semibold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                ComfyUI
              </span>
            </div>
            <p className="text-[11px] text-theme-secondary leading-relaxed">
              {currentModelObj.notes}
            </p>
          </div>
        )}
      </div>

      {/* Duration Selector */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-theme-primary flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-theme-accent" />
            <span>Duration & Frame Count</span>
          </label>
          <span className="font-mono text-[11px] text-theme-accent font-semibold">
            {duration}s ({totalFrames} frames @ {fps}fps)
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1 p-0.5 rounded-xl bg-theme-subtle border border-theme-border">
          {DURATION_PRESETS.map((d) => (
            <button
              key={d}
              type="button"
              disabled={disabled}
              onClick={() => setDuration(d)}
              className={`py-1.5 text-xs font-mono font-semibold rounded-lg transition-all ${
                duration === d
                  ? 'bg-theme-surface text-theme-accent shadow-xs'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              {d}s
            </button>
          ))}
        </div>
      </div>

      {/* Resolution & Aspect Ratio Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Resolution */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-theme-primary block">
            Resolution
          </label>
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            disabled={disabled}
            className="w-full bg-theme-input border border-theme-border rounded-lg px-2.5 py-1.5 text-xs text-theme-primary font-mono focus:outline-none"
          >
            {RESOLUTION_PRESETS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Frame Rate */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-theme-primary block">
            Frame Rate (FPS)
          </label>
          <div className="grid grid-cols-2 gap-1 p-0.5 rounded-lg bg-theme-subtle border border-theme-border">
            {[24, 30].map(f => (
              <button
                key={f}
                type="button"
                disabled={disabled}
                onClick={() => setFps(f)}
                className={`py-1 text-xs font-mono font-medium rounded transition-all ${
                  fps === f
                    ? 'bg-theme-surface text-theme-accent font-bold shadow-xs'
                    : 'text-theme-muted hover:text-theme-primary'
                }`}
              >
                {f} fps
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Aspect Ratio Picker */}
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-theme-primary block">
          Aspect Ratio
        </label>
        <div className="grid grid-cols-5 gap-1">
          {ASPECT_PRESETS.map(asp => (
            <button
              key={asp.id}
              type="button"
              disabled={disabled}
              onClick={() => setAspectRatio(asp.id)}
              className={`py-1.5 rounded-lg border text-center transition-all ${
                aspectRatio === asp.id
                  ? 'bg-theme-accentSubtle border-theme-accent text-theme-accentText font-bold shadow-xs'
                  : 'bg-theme-surface border-theme-border text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <span className="block font-mono text-[11px] font-semibold">{asp.label}</span>
              <span className="text-[9px] text-theme-muted block truncate px-0.5">{asp.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Video Settings Collapsible */}
      <div className="pt-1 border-t border-theme-border">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-theme-secondary hover:text-theme-primary flex items-center justify-between w-full transition-colors font-medium py-1"
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-theme-muted" />
            <span>Advanced Sampling & Seed</span>
          </span>
          {showAdvanced ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {showAdvanced && (
          <div className="mt-2 p-3 rounded-xl bg-theme-subtle border border-theme-border space-y-3 text-xs">
            {/* Seed */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-theme-secondary font-medium">Generation Seed:</span>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setIsSeedLocked(!isSeedLocked)}
                    className="p-1 rounded text-theme-secondary hover:text-theme-primary"
                    title={isSeedLocked ? 'Seed locked' : 'Random seed'}
                  >
                    {isSeedLocked ? <Lock className="w-3 h-3 text-theme-accent" /> : <Unlock className="w-3 h-3 text-theme-muted" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeed(Math.floor(Math.random() * 2147483647).toString())}
                    className="p-1 rounded text-theme-secondary hover:text-theme-primary"
                    title="Generate random seed"
                  >
                    <Shuffle className="w-3 h-3 text-theme-muted" />
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Random seed (-1)"
                className="w-full bg-theme-input border border-theme-border rounded-lg px-2.5 py-1 text-xs text-theme-primary font-mono focus:outline-none focus:border-theme-accent"
              />
            </div>

            {/* Steps Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-theme-secondary font-medium">Diffusion Steps:</span>
                <span className="font-mono font-bold text-theme-primary">{steps}</span>
              </div>
              <input
                type="range"
                min="15"
                max="50"
                value={steps}
                onChange={(e) => setSteps(parseInt(e.target.value, 10))}
                className="w-full accent-theme-accent cursor-pointer"
              />
            </div>

            {/* Guidance Scale */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-theme-secondary font-medium">Motion Guidance (CFG):</span>
                <span className="font-mono font-bold text-theme-primary">{guidanceScale}</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="0.5"
                value={guidanceScale}
                onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                className="w-full accent-theme-accent cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

