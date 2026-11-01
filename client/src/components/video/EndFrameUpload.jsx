import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, RefreshCw, CheckCircle2, Flag } from 'lucide-react';
import { uploadVideoFrame } from '../../services/api';
import { formatFileSize } from '../../utils/formatters';

export default function EndFrameUpload({
  endFrame,
  setEndFrame,
  disabled
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

    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File exceeds 25 MB maximum limit.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const data = await uploadVideoFrame(file);
      setEndFrame({
        filename: data.filename,
        url: data.url,
        originalName: data.originalName,
        width: data.width,
        height: data.height,
        size: data.size,
        mimeType: data.mimeType
      });
    } catch (err) {
      setUploadError(err.message || 'End frame upload failed');
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-theme-primary flex items-center gap-1.5">
          <Flag className="w-3.5 h-3.5 text-theme-accent" />
          <span>Ending Reference Frame (Frame B)</span>
        </label>
        {endFrame && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            Loaded
          </span>
        )}
      </div>

      {endFrame ? (
        <div className="p-2.5 rounded-xl bg-theme-surface border border-theme-borderStrong shadow-xs space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-theme-subtle border border-theme-border flex-shrink-0 relative">
              <img
                src={endFrame.url}
                alt="End Frame"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-theme-primary truncate">
                {endFrame.originalName || endFrame.filename}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-theme-secondary font-mono mt-0.5">
                <span>{endFrame.width} × {endFrame.height}</span>
                <span>•</span>
                <span>{formatFileSize(endFrame.size)}</span>
              </div>
              <p className="text-[10px] text-theme-accent font-medium mt-0.5">
                Target Scene Destination
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                title="Replace end frame"
                className="p-1.5 rounded-md hover:bg-theme-subtle text-theme-muted hover:text-theme-primary transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setEndFrame(null)}
                disabled={disabled}
                title="Remove end frame"
                className="p-1.5 rounded-md hover:bg-red-500/10 text-theme-muted hover:text-red-500 transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
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
            disabled={disabled}
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileProcess(e.target.files[0]);
            }}
          />
          <div className="flex flex-col items-center justify-center space-y-1">
            <UploadCloud className={`w-5 h-5 ${isUploading ? 'animate-bounce text-theme-accent' : 'text-theme-muted'}`} />
            <div>
              <p className="text-xs text-theme-primary font-medium">
                {isUploading ? 'Uploading & verifying frame...' : 'Upload Ending Frame'}
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

