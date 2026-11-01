import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Sliders,
  Layers
} from 'lucide-react';
import { uploadReference } from '../services/api';
import { formatFileSize } from '../utils/formatters';

const REFERENCE_MODES = [
  { id: 'image-to-image', label: 'Image-to-Image', desc: 'Blends reference structure with prompt' },
  { id: 'style-reference', label: 'Style Reference', desc: 'Transfers color palette & aesthetic' },
  { id: 'character-reference', label: 'Character Ref', desc: 'Maintains facial identity & outline' },
  { id: 'image-variation', label: 'Image Variation', desc: 'Creates subtle artistic alternatives' },
];

export default function ReferenceUpload({
  activeReference,
  setActiveReference,
  referenceStrength,
  setReferenceStrength,
  referenceMode,
  setReferenceMode,
  isGenerating
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileProcess = async (file) => {
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid format. Please upload PNG, JPG, JPEG, or WEBP.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const data = await uploadReference(file);
      setActiveReference({
        filename: data.filename,
        url: data.url,
        originalName: data.originalName,
        width: data.width,
        height: data.height,
        size: data.size,
        mimeType: data.mimeType,
        source: 'upload'
      });
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-theme-primary flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-theme-accent" />
          <span>Reference Image (Img2Img)</span>
        </label>
        {activeReference && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            Active
          </span>
        )}
      </div>

      {activeReference ? (
        <div className="p-3 rounded-xl bg-theme-surface border border-theme-borderStrong shadow-xs space-y-3">
          {/* Thumbnail & File Details */}
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-theme-subtle border border-theme-border flex-shrink-0 relative">
              <img
                src={activeReference.url}
                alt="Reference"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-theme-primary truncate">
                {activeReference.originalName || activeReference.filename}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-theme-secondary font-mono mt-0.5">
                <span>{activeReference.width} × {activeReference.height}</span>
                <span>•</span>
                <span>{formatFileSize(activeReference.size)}</span>
              </div>
              <p className="text-[10px] text-theme-accent font-medium mt-0.5">
                {activeReference.source === 'generated' ? 'From previous output' : 'Uploaded file'}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isGenerating}
                title="Replace reference image"
                className="p-1.5 rounded-md hover:bg-theme-subtle text-theme-muted hover:text-theme-primary transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveReference(null)}
                disabled={isGenerating}
                title="Remove reference"
                className="p-1.5 rounded-md hover:bg-red-500/10 text-theme-muted hover:text-red-500 transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Reference Mode Selector */}
          <div className="pt-2 border-t border-theme-border space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-theme-secondary font-medium">Conditioning Mode:</span>
              <span className="text-theme-accent font-mono text-[10px] font-semibold uppercase">{referenceMode}</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {REFERENCE_MODES.map(mode => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setReferenceMode(mode.id)}
                  className={`px-2 py-1 rounded text-[11px] font-medium text-left truncate transition-colors ${
                    referenceMode === mode.id
                      ? 'bg-theme-accent text-white shadow-xs'
                      : 'bg-theme-subtle text-theme-secondary hover:bg-theme-border'
                  }`}
                  title={mode.desc}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reference Strength Slider */}
          <div className="pt-2 border-t border-theme-border space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-theme-secondary font-medium flex items-center gap-1">
                <Sliders className="w-3 h-3 text-theme-muted" />
                <span>Reference Influence:</span>
              </span>
              <span className="font-mono font-bold text-theme-primary">
                {Math.round(referenceStrength * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={referenceStrength}
              onChange={(e) => setReferenceStrength(parseFloat(e.target.value))}
              className="w-full accent-theme-accent cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-theme-muted font-mono">
              <span>Subtle (25%)</span>
              <span>Balanced (50%)</span>
              <span>Maximum (100%)</span>
            </div>
          </div>
        </div>
      ) : (
        /* Upload Area */
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-theme-accent bg-theme-accentSubtle'
              : 'border-theme-border bg-theme-surface hover:border-theme-borderStrong hover:bg-theme-subtle/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileProcess(e.target.files[0]);
            }}
          />
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <UploadCloud className={`w-5 h-5 ${isUploading ? 'animate-bounce text-theme-accent' : 'text-theme-muted'}`} />
            <div>
              <p className="text-xs text-theme-primary font-medium">
                {isUploading ? 'Uploading & analyzing image...' : 'Drop reference image or click to browse'}
              </p>
              <p className="text-[10px] text-theme-muted">PNG, JPG, WEBP (Max 25MB)</p>
            </div>
          </div>
        </div>
      )}

      {uploadError && (
        <p className="text-[11px] text-red-500 font-medium">{uploadError}</p>
      )}
    </div>
  );
}
