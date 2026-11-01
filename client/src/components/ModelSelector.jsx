import React from 'react';
import { Cpu, RefreshCw, AlertTriangle, Layers, CheckCircle2 } from 'lucide-react';

export default function ModelSelector({
  engines = [],
  models = [],
  selectedModel,
  setSelectedModel,
  onRefresh,
  isRefreshing
}) {
  const comfyEngine = engines.find(e => e.id === 'comfyui') || engines[0];
  const engineModels = models.filter(m => m.engine === 'comfyui' || !m.engine);
  const currentModelObj = engineModels.find(m => m.id === selectedModel) || engineModels[0];

  return (
    <div className="space-y-3.5">
      {/* Engine Status Banner */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-theme-primary flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-theme-accent" />
            <span>AI Generation Engine</span>
          </label>
          <span className="text-[10px] text-theme-muted font-mono">
            ComfyUI
          </span>
        </div>

        {comfyEngine?.available ? (
          <div className="px-3 py-2 rounded-xl bg-theme-subtle border border-theme-border flex items-center justify-between text-xs">
            <span className="text-theme-secondary flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>ComfyUI Engine Connected</span>
            </span>
            <span className="font-mono text-theme-muted text-[11px]">:8188</span>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>ComfyUI Offline</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Launch ComfyUI locally with:
              <code className="block mt-0.5 p-1 rounded bg-theme-input text-theme-accent font-mono text-[10px]">
                python main.py --listen 127.0.0.1 --port 8188
              </code>
            </p>
          </div>
        )}
      </div>

      {/* Model Selector */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-theme-primary flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-theme-accent" />
            <span>Diffusion Model / Checkpoint</span>
          </label>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="text-[11px] text-theme-secondary hover:text-theme-primary flex items-center gap-1 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-theme-accent' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="relative">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full bg-theme-input border border-theme-border rounded-xl px-3 py-2 text-xs text-theme-primary focus:outline-none focus:border-theme-accent cursor-pointer appearance-none pr-8 shadow-xs"
          >
            {engineModels.length > 0 ? (
              engineModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))
            ) : (
              <option value="sd_xl_base_1.0.safetensors">
                sd_xl_base_1.0.safetensors (ComfyUI Default)
              </option>
            )}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-theme-muted">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Model Capability Note / Diagnostics */}
        {currentModelObj && (
          <div className="mt-2 p-2.5 rounded-xl bg-theme-subtle border border-theme-border space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-theme-primary font-mono font-semibold truncate max-w-[190px]">
                {currentModelObj.name}
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] uppercase font-mono font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Diffusion Checkpoint
              </span>
            </div>

            {currentModelObj.notes && (
              <p className="text-[11px] text-theme-secondary leading-relaxed">
                {currentModelObj.notes}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
