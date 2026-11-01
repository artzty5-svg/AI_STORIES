import React from 'react';
import { Sparkles, Server, Cpu, RefreshCw, HardDrive, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Header({
  backendOnline,
  comfyUIStatus,
  activeEngine,
  onRefresh,
  isRefreshing
}) {
  return (
    <header className="h-14 border-b border-white/5 bg-[#0e1117] px-4 flex items-center justify-between flex-shrink-0 z-20">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm tracking-wide text-zinc-100">NeuroCanvas AI</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Local Studio
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-normal">M-Series Apple Silicon • Unified Memory</p>
        </div>
      </div>

      {/* Status Hub */}
      <div className="flex items-center space-x-3">
        {/* Backend Status */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#141822] border border-white/5 text-xs">
          <Server className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-400 hidden sm:inline">Backend:</span>
          {backendOnline ? (
            <span className="flex items-center text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
              :5000
            </span>
          ) : (
            <span className="flex items-center text-red-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1"></span>
              Offline
            </span>
          )}
        </div>

        {/* ComfyUI Status */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#141822] border border-white/5 text-xs">
          <Cpu className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-400 hidden sm:inline">ComfyUI:</span>
          {comfyUIStatus?.available ? (
            <span className="flex items-center text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1"></span>
              :8188
            </span>
          ) : (
            <span className="flex items-center text-amber-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1"></span>
              Unreachable
            </span>
          )}
        </div>

        {/* Active Engine Badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-300">
          <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-mono text-[11px] truncate max-w-[140px]">{activeEngine?.name || 'ComfyUI'}</span>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh server and model connections"
          className="p-1.5 rounded-md hover:bg-white/5 text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>
    </header>
  );
}

