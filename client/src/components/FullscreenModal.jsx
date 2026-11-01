import React, { useEffect, useState } from 'react';
import { X, Download, Sparkles, Clock, Cpu, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { formatDuration } from '../utils/formatters';

export default function FullscreenModal({
  image,
  onClose,
  onDownload,
  onUseAsReference
}) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 select-none"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="flex items-center justify-between z-10 w-full max-w-6xl mx-auto py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-3 text-xs text-white">
          <span className="font-mono font-bold px-2 py-0.5 rounded bg-white/20 text-white">
            {image.width} × {image.height}
          </span>
          <span className="font-mono text-zinc-300">{image.model}</span>
          {image.durationMs && (
            <span className="font-mono text-zinc-400">• {formatDuration(image.durationMs)}</span>
          )}
          {image.seed && (
            <span className="font-mono text-zinc-400">• Seed: {image.seed}</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-white/80 w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(prev => Math.min(3, prev + 0.25))}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => onUseAsReference(image)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors ml-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Use as Reference</span>
          </button>

          <button
            onClick={() => onDownload(image)}
            className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            title="Download image"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="flex-1 flex items-center justify-center p-2 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.url}
          alt={image.prompt}
          className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-100"
          style={{ transform: `scale(${zoom})` }}
        />
      </div>

      {/* Bottom Prompt Bar */}
      <div
        className="w-full max-w-4xl mx-auto text-center p-3 rounded-xl bg-black/70 border border-white/10 text-xs text-white/90 backdrop-blur z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="line-clamp-2 leading-relaxed font-sans">{image.prompt}</p>
      </div>
    </div>
  );
}
