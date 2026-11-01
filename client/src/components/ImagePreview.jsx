import React, { useState } from 'react';
import {
  Download,
  Image as ImageIcon,
  Maximize2,
  Sparkles,
  Clock,
  Cpu,
  Layers,
  ArrowRight,
  BookmarkCheck,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize2,
  RefreshCw,
  Zap,
  Trash2,
  Check
} from 'lucide-react';
import { formatDuration, formatFileSize } from '../utils/formatters';

export default function ImagePreview({
  currentImage,
  batchImages = [],
  onSelectImage,
  onDownload,
  onUseAsReference,
  onGenerateVariation,
  onUpscaleImage,
  onDeleteImage,
  onOpenFullscreen,
  isGenerating,
  generationStage = '',
  elapsedSeconds = 0
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fitMode, setFitMode] = useState('fit'); // 'fit' or 'actual'
  const [selectedFormat, setSelectedFormat] = useState('png');
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [isUpscaling, setIsUpscaling] = useState(false);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(2.5, prev + 0.25));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(0.5, prev - 0.25));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setFitMode('fit');
  };

  const handleUpscale = async () => {
    if (!currentImage || isUpscaling) return;
    setIsUpscaling(true);
    try {
      await onUpscaleImage(currentImage.filename, 2);
    } finally {
      setIsUpscaling(false);
    }
  };

  if (!currentImage && batchImages.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-theme-bg select-none">
        <div className="w-20 h-20 rounded-3xl bg-theme-accentSubtle border border-theme-border flex items-center justify-center mb-4 text-theme-accent shadow-sm">
          <ImageIcon className="w-10 h-10 opacity-70" />
        </div>
        <h3 className="text-lg font-bold text-theme-primary mb-1">Canvas Ready</h3>
        <p className="text-xs text-theme-secondary max-w-md leading-relaxed mb-6">
          Describe any subject in the prompt editor or upload a reference image on the left. The studio will render your artwork directly on your Apple Silicon hardware.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-theme-muted font-mono">
          <span className="px-3 py-1 rounded-full bg-theme-surface border border-theme-border shadow-xs">Text-to-Image</span>
          <span className="px-3 py-1 rounded-full bg-theme-surface border border-theme-border shadow-xs">Multi-Genre Synthesis</span>
          <span className="px-3 py-1 rounded-full bg-theme-surface border border-theme-border shadow-xs">Image-to-Image Conditioning</span>
          <span className="px-3 py-1 rounded-full bg-theme-surface border border-theme-border shadow-xs">Apple Silicon Unified Memory</span>
        </div>
      </div>
    );
  }

  // Display batch output strip if there are multiple images from the latest generation
  const activeImage = currentImage || batchImages[0];

  return (
    <div className="w-full h-full flex flex-col bg-theme-bg overflow-hidden">
      {/* Top Metadata & Zoom Bar */}
      <div className="h-12 border-b border-theme-border px-4 flex items-center justify-between bg-theme-surface flex-shrink-0 shadow-xs">
        {/* Left: Image Technical Specs */}
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-theme-accentSubtle border border-theme-border text-theme-accentText font-semibold">
            {activeImage.width} × {activeImage.height} ({activeImage.aspectRatio || '1:1'})
          </span>

          <span className="text-xs text-theme-secondary font-mono truncate max-w-[140px] hidden sm:inline">
            {activeImage.model}
          </span>

          {activeImage.durationMs && (
            <span className="text-xs text-theme-muted font-mono hidden md:inline">
              • {formatDuration(activeImage.durationMs)}
            </span>
          )}

          {activeImage.seed && (
            <span className="text-xs text-theme-muted font-mono hidden lg:inline">
              • Seed: {activeImage.seed}
            </span>
          )}

          {activeImage.referenceImageUsed && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-semibold flex items-center gap-1">
              <BookmarkCheck className="w-3 h-3" />
              Ref Used
            </span>
          )}
        </div>

        {/* Right: Stage Zoom & View Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 rounded-md hover:bg-theme-subtle text-theme-secondary hover:text-theme-primary transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-theme-muted w-10 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 rounded-md hover:bg-theme-subtle text-theme-secondary hover:text-theme-primary transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Fit to Screen"
            className="px-2 py-1 rounded-md hover:bg-theme-subtle text-theme-secondary hover:text-theme-primary text-[11px] font-medium transition-colors"
          >
            Fit
          </button>

          <button
            onClick={() => onOpenFullscreen(activeImage)}
            title="Open Fullscreen Lightbox"
            className="p-1.5 rounded-md hover:bg-theme-subtle text-theme-secondary hover:text-theme-primary transition-colors ml-1"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Active Generation Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 z-20 bg-theme-bg/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-theme-surface border border-theme-border shadow-lg flex items-center justify-center mb-4 relative">
              <Sparkles className="w-8 h-8 text-theme-accent animate-pulse" />
              <div className="absolute -inset-1 rounded-2xl border-2 border-theme-accent/30 animate-ping pointer-events-none" />
            </div>
            <h4 className="text-base font-bold text-theme-primary mb-1">
              Synthesizing Diffusion Latents
            </h4>
            <p className="text-xs text-theme-secondary font-mono mb-4">
              ComfyUI Diffusion Engine
            </p>

            <div className="w-64 max-w-full space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-theme-muted">
                <span>Status: In Progress</span>
                <span>{Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}</span>
              </div>
              <div className="w-full bg-theme-border/60 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-theme-accent via-indigo-500 to-theme-accent rounded-full animate-indeterminate" />
              </div>
              <p className="text-[11px] text-theme-muted">
                Executing locally on Apple Silicon unified memory
              </p>
            </div>
          </div>
        )}

        <div
          className="max-w-full max-h-full flex items-center justify-center rounded-xl overflow-hidden shadow-lg border border-theme-border bg-theme-surface transition-transform duration-150"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <img
            src={activeImage.url}
            alt={activeImage.prompt}
            className="max-h-[calc(100vh-16rem)] max-w-full object-contain select-none"
          />
        </div>
      </div>

      {/* Multi-Output Batch Grid Strip (Shown when batch > 1) */}
      {batchImages.length > 1 && (
        <div className="border-t border-theme-border px-4 py-2 bg-theme-surface flex-shrink-0 flex items-center space-x-3 overflow-x-auto">
          <span className="text-[11px] font-semibold text-theme-secondary uppercase font-mono flex-shrink-0">
            Batch Outputs ({batchImages.length}):
          </span>
          <div className="flex items-center space-x-2">
            {batchImages.map((img, idx) => (
              <div
                key={img.id || img.filename}
                onClick={() => onSelectImage(img)}
                className={`relative w-12 h-12 rounded-lg overflow-hidden border cursor-pointer flex-shrink-0 transition-all ${
                  activeImage.filename === img.filename
                    ? 'border-theme-accent ring-2 ring-theme-accent/20 scale-105'
                    : 'border-theme-border opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img.url} alt={`Variation ${idx + 1}`} className="w-full h-full object-cover" />
                <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/60 text-[9px] font-mono text-white">
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Action Toolbar & Prompt Bar */}
      <div className="border-t border-theme-border p-3.5 bg-theme-surface flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-theme-secondary line-clamp-2 leading-relaxed">
            <span className="font-semibold text-theme-primary mr-1">Prompt:</span>
            {activeImage.prompt}
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Use as Reference */}
          <button
            onClick={() => onUseAsReference(activeImage)}
            title="Set as active reference in the generation panel"
            className="px-3 py-1.5 rounded-lg bg-theme-accentSubtle hover:bg-theme-accent/20 border border-theme-border text-theme-accentText text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-theme-accent" />
            <span>Use as Reference</span>
          </button>

          {/* 2x Super-Resolution Upscale */}
          <button
            onClick={handleUpscale}
            disabled={isUpscaling}
            title="Super-resolution upscale (2x detail enhancement)"
            className="px-3 py-1.5 rounded-lg bg-theme-subtle hover:bg-theme-border border border-theme-border text-theme-primary text-xs font-medium flex items-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 text-amber-500 ${isUpscaling ? 'animate-bounce' : ''}`} />
            <span>{isUpscaling ? 'Upscaling...' : '2x Upscale'}</span>
          </button>

          {/* Download with Format Picker */}
          <div className="relative">
            <button
              onClick={() => onDownload(activeImage, selectedFormat)}
              className="px-3 py-1.5 rounded-lg bg-theme-accent hover:bg-theme-accentHover text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
              <span className="text-[10px] uppercase font-mono opacity-80">({selectedFormat})</span>
            </button>
          </div>

          {/* Delete */}
          <button
            onClick={() => onDeleteImage(activeImage)}
            title="Delete this image"
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-theme-muted hover:text-red-500 border border-transparent hover:border-red-500/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
