import React, { useState } from 'react';
import {
  Sparkles,
  Loader2,
  StopCircle,
  Layers,
  Sliders,
  ChevronDown,
  ChevronRight,
  Shuffle,
  Lock,
  Unlock,
  AlertCircle
} from 'lucide-react';

const SAMPLERS = ['Euler a', 'DPM++ 2M Karras', 'DDIM', 'LMS Karras'];

export default function GenerationControls({
  batchCount,
  setBatchCount,
  seed,
  setSeed,
  isSeedLocked,
  setIsSeedLocked,
  steps,
  setSteps,
  guidanceScale,
  setGuidanceScale,
  sampler,
  setSampler,
  onGenerate,
  onCancel,
  isGenerating,
  generationStage = '',
  elapsedSeconds = 0,
  generationError,
  promptLength
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 2147483647).toString());
  };

  return (
    <div className="space-y-3 pt-3 border-t border-theme-border">
      {/* Active Engine Indicator - ComfyUI */}
      <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-theme-subtle border border-theme-border">
        <span className="text-theme-muted font-medium">Active Engine:</span>
        <span className="font-semibold text-theme-primary flex items-center gap-1.5 font-mono">
          <span className={`w-2 h-2 rounded-full bg-indigo-500 ${isGenerating ? 'animate-pulse' : ''}`} />
          ComfyUI
        </span>
      </div>

      {/* Batch Output Count: 1, 2, 3, 4 */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-theme-primary flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-theme-accent" />
          <span>Output Quantity</span>
        </label>
        <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-theme-subtle border border-theme-border">
          {[1, 2, 3, 4].map((cnt) => (
            <button
              key={cnt}
              type="button"
              disabled={isGenerating}
              onClick={() => setBatchCount(cnt)}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all ${
                batchCount === cnt
                  ? 'bg-theme-accent text-white shadow-xs'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              {cnt}x
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Settings Collapsible */}
      <div>
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
                    title={isSeedLocked ? 'Seed locked' : 'Random seed per generation'}
                  >
                    {isSeedLocked ? <Lock className="w-3 h-3 text-theme-accent" /> : <Unlock className="w-3 h-3 text-theme-muted" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleRandomSeed}
                    className="p-1 rounded text-theme-secondary hover:text-theme-primary"
                    title="Generate new random seed"
                  >
                    <Shuffle className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={seed}
                onChange={(e) => setSeed(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Random (e.g. 4281903)"
                className="w-full bg-theme-input border border-theme-border rounded-lg px-2.5 py-1.5 font-mono text-xs text-theme-primary focus:outline-none focus:border-theme-accent"
              />
            </div>

            {/* Inference Steps Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-theme-secondary font-medium">Inference Steps:</span>
                <span className="font-mono text-theme-primary font-semibold">{steps}</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={steps}
                onChange={(e) => setSteps(parseInt(e.target.value, 10))}
                className="w-full accent-theme-accent cursor-pointer"
              />
            </div>

            {/* CFG Guidance Scale */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-theme-secondary font-medium">Guidance Scale (CFG):</span>
                <span className="font-mono text-theme-primary font-semibold">{guidanceScale.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="20.0"
                step="0.5"
                value={guidanceScale}
                onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                className="w-full accent-theme-accent cursor-pointer"
              />
            </div>

            {/* Sampler Selector */}
            <div className="space-y-1">
              <label className="text-theme-secondary font-medium text-[11px] block">Sampler:</label>
              <select
                value={sampler}
                onChange={(e) => setSampler(e.target.value)}
                className="w-full bg-theme-input border border-theme-border rounded-lg px-2.5 py-1.5 text-xs text-theme-primary focus:outline-none focus:border-theme-accent"
              >
                {SAMPLERS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Generate Button */}
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || promptLength === 0}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md ${
            isGenerating || promptLength === 0
              ? 'bg-theme-subtle text-theme-muted cursor-not-allowed border border-theme-border'
              : 'bg-theme-accent hover:bg-theme-accentHover text-white shadow-theme-accent/25 active:scale-[0.99]'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Generating with ComfyUI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate with ComfyUI</span>
            </>
          )}
        </button>

        {isGenerating && (
          <button
            type="button"
            onClick={onCancel}
            title="Cancel generation request"
            className="py-3 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-600 font-medium text-xs flex items-center justify-center transition-all"
          >
            <StopCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Visible Generation Progress Bar */}
      {isGenerating && (
        <div className="p-3 rounded-xl bg-theme-subtle border border-theme-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-theme-primary flex items-center gap-1.5 capitalize">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-theme-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-theme-accent"></span>
              </span>
              {generationStage === 'queued' ? 'Queued...' : 'Synthesizing Latents...'}
            </span>
            <span className="font-mono text-theme-muted text-[11px]">
              {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')} elapsed
            </span>
          </div>

          {/* Indeterminate Animated Progress Bar */}
          <div className="w-full bg-theme-border/50 h-1.5 rounded-full overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-theme-accent to-indigo-500 rounded-full animate-indeterminate"></div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-theme-muted font-mono">
            <span>Engine: ComfyUI Diffusion</span>
            <span>Local Apple Silicon</span>
          </div>
        </div>
      )}

      {/* Error Message Display */}
      {generationError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs leading-relaxed flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-[11px]">Notice</p>
            <p className="text-[11px]">{generationError}</p>
          </div>
        </div>
      )}
    </div>
  );
}
