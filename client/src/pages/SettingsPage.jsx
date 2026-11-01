import React from 'react';
import {
  Server,
  Layers,
  Cpu,
  RefreshCw,
  HardDrive,
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export default function SettingsPage({
  backendOnline,
  comfyUIStatus,
  engines = [],
  models = [],
  onRefresh,
  isRefreshing
}) {
  const comfyEngine = engines.find(e => e.id === 'comfyui') || engines[0];

  const getStatusBadge = (available, statusText) => {
    if (available) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" />
          <span>Connected</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 border border-red-500/20">
        <XCircle className="w-3 h-3" />
        <span>Offline</span>
      </span>
    );
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-theme-bg p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-theme-border">
        <div>
          <h1 className="text-xl font-bold text-theme-primary">Studio Settings & Infrastructure</h1>
          <p className="text-xs text-theme-secondary mt-0.5">
            Local Apple Silicon generation engine and system status
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-theme-subtle hover:bg-theme-border border border-theme-border text-xs text-theme-primary font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-theme-accent' : ''}`} />
          <span>Refresh All</span>
        </button>
      </div>

      {/* Engine Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Backend API Server */}
        <div className="p-5 rounded-xl bg-theme-surface border border-theme-border shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-theme-accentSubtle text-theme-accent">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-theme-primary">Express Backend API</h3>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-theme-accent text-white font-mono font-medium">Core</span>
                </div>
                <p className="text-[11px] text-theme-muted font-mono">http://127.0.0.1:5000</p>
              </div>
            </div>
            {getStatusBadge(backendOnline, backendOnline ? 'connected' : 'offline')}
          </div>

          <p className="text-xs text-theme-secondary leading-relaxed">
            Local Express server handling image synthesis orchestration, file operations, Sharp super-resolution upscaling, and metadata.
          </p>

          <div className="pt-2 border-t border-theme-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-theme-muted">Hardware:</span>
              <span className="font-mono text-theme-primary font-semibold">Apple Silicon (MPS Acceleration)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-theme-muted">Storage:</span>
              <span className="font-mono text-theme-primary font-semibold">Local Filesystem (No Database)</span>
            </div>
          </div>
        </div>

        {/* ComfyUI Engine */}
        <div className="p-5 rounded-xl bg-theme-surface border border-theme-border shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-theme-subtle text-theme-primary">
                <Layers className="w-4 h-4 text-theme-accent" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-theme-primary">ComfyUI Diffusion Engine</h3>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-theme-accentSubtle text-theme-accentText border border-theme-border font-mono font-medium">Active Engine</span>
                </div>
                <p className="text-[11px] text-theme-muted font-mono">http://127.0.0.1:8188</p>
              </div>
            </div>
            {getStatusBadge(comfyEngine?.available, comfyEngine?.status)}
          </div>

          <p className="text-xs text-theme-secondary leading-relaxed">
            Local node-based diffusion engine powering high-resolution text-to-image, reference-image conditioning (image-to-image), and video synthesis.
          </p>

          <div className="pt-2 border-t border-theme-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-theme-muted">Status:</span>
              <span className="font-mono text-theme-primary font-semibold">
                {comfyEngine?.available ? 'Connected and Ready (:8188)' : 'Offline (Port 8188)'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-theme-muted">Available Models:</span>
              <span className="font-mono text-theme-primary font-semibold">{models.length}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-theme-subtle border border-theme-border text-xs text-theme-secondary space-y-1">
              <div className="font-medium text-theme-primary">How to launch ComfyUI locally:</div>
              <code className="text-[11px] bg-theme-input p-1 rounded block border border-theme-border text-theme-accent font-mono">
                python main.py --listen 127.0.0.1 --port 8188
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Storage and System Specs */}
      <div className="p-5 rounded-xl bg-theme-surface border border-theme-border shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-theme-primary flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-theme-accent" />
          <span>Local Storage & Privacy</span>
        </h3>
        <p className="text-xs text-theme-secondary leading-relaxed">
          NeuroCanvas AI operates 100% locally. Generated images, reference inputs, and metadata are persisted exclusively inside your project directory (<code>server/generated/</code> and <code>server/data/gallery.json</code>). No external cloud APIs are invoked.
        </p>
      </div>
    </div>
  );
}
