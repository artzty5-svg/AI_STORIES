import React from 'react';
import {
  History,
  Download,
  Sparkles,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
  BookmarkCheck
} from 'lucide-react';

export default function ImageGallery({
  history = [],
  selectedImage,
  onSelectImage,
  onDownload,
  onUseAsReference,
  onDeleteImage,
  isCollapsed,
  setIsCollapsed
}) {
  if (isCollapsed) {
    return (
      <div className="w-12 h-full bg-theme-surface border-l border-theme-border flex flex-col items-center py-4 justify-between flex-shrink-0">
        <button
          onClick={() => setIsCollapsed(false)}
          title="Expand History Sidebar"
          className="p-2 rounded-lg hover:bg-theme-subtle text-theme-secondary hover:text-theme-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center space-y-2">
          <History className="w-4 h-4 text-theme-muted" />
          <span className="text-[10px] font-mono text-theme-muted font-bold rotate-90">
            {history.length}
          </span>
        </div>

        <div />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-theme-surface border-l border-theme-border">
      {/* Header */}
      <div className="h-12 border-b border-theme-border px-3.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-theme-accent" />
          <h2 className="text-xs font-bold text-theme-primary">Session History</h2>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-theme-accentSubtle text-theme-accentText border border-theme-border font-semibold">
            {history.length}
          </span>
        </div>

        <button
          onClick={() => setIsCollapsed(true)}
          title="Collapse Sidebar"
          className="p-1 rounded-md hover:bg-theme-subtle text-theme-muted hover:text-theme-primary transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Gallery List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-theme-muted space-y-2">
            <ImageIcon className="w-8 h-8 opacity-30" />
            <p className="text-xs font-semibold text-theme-primary">No Images Yet</p>
            <p className="text-[11px] text-theme-secondary leading-relaxed max-w-[170px]">
              Artworks generated in this session will be collected here.
            </p>
          </div>
        ) : (
          history.map((item) => {
            const isSelected = selectedImage?.id === item.id || selectedImage?.filename === item.filename;

            return (
              <div
                key={item.id || item.filename}
                onClick={() => onSelectImage(item)}
                className={`group rounded-xl border p-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-theme-accentSubtle border-theme-accent shadow-xs'
                    : 'bg-theme-surface border-theme-border hover:border-theme-borderStrong hover:bg-theme-subtle/50'
                }`}
              >
                <div className="flex space-x-2.5">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-theme-subtle border border-theme-border flex-shrink-0 relative">
                    <img
                      src={item.url}
                      alt={item.prompt || 'Thumbnail'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {item.referenceImageUsed && (
                      <div className="absolute bottom-0 right-0 p-0.5 bg-emerald-600 text-white rounded-tl" title="Generated with reference">
                        <BookmarkCheck className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <p className="text-xs text-theme-primary line-clamp-2 leading-snug font-medium">
                      {item.prompt}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-theme-muted font-mono mt-1">
                      <span>{item.width}×{item.height}</span>
                      <span className="truncate max-w-[70px]">{item.model}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-2 pt-1.5 border-t border-theme-border flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] text-theme-muted font-mono">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUseAsReference(item);
                      }}
                      title="Use as reference"
                      className="p-1 rounded hover:bg-theme-border text-theme-secondary hover:text-theme-accent transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload(item);
                      }}
                      title="Download image"
                      className="p-1 rounded hover:bg-theme-border text-theme-secondary hover:text-theme-primary transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteImage(item);
                      }}
                      title="Delete"
                      className="p-1 rounded hover:bg-red-500/10 text-theme-secondary hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
