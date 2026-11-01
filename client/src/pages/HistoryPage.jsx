import React, { useState, useMemo } from 'react';
import {
  History,
  Download,
  Sparkles,
  Trash2,
  Search,
  Filter,
  ArrowUpDown,
  Archive,
  Image as ImageIcon,
  Check,
  BookmarkCheck,
  Clock,
  Cpu,
  Layers,
  AlertTriangle,
  X
} from 'lucide-react';
import { formatFileSize, formatDuration } from '../utils/formatters';

export default function HistoryPage({
  history = [],
  onSelectImage,
  onUseAsReference,
  onDownload,
  onDeleteImage,
  onClearAllHistory,
  onDownloadAllZip
}) {
  const [search, setSearch] = useState('');
  const [modelFilter, setModelFilter] = useState('all');
  const [aspectFilter, setAspectFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Available unique models & aspects
  const models = useMemo(() => {
    const set = new Set(history.map(h => h.model).filter(Boolean));
    return Array.from(set);
  }, [history]);

  const aspectRatios = useMemo(() => {
    const set = new Set(history.map(h => h.aspectRatio).filter(Boolean));
    return Array.from(set);
  }, [history]);

  // Filtered & Sorted list
  const filtered = useMemo(() => {
    let result = [...history];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(item =>
        (item.prompt && item.prompt.toLowerCase().includes(q)) ||
        (item.model && item.model.toLowerCase().includes(q)) ||
        (item.filename && item.filename.toLowerCase().includes(q))
      );
    }

    if (modelFilter !== 'all') {
      result = result.filter(item => item.model === modelFilter);
    }

    if (aspectFilter !== 'all') {
      result = result.filter(item => item.aspectRatio === aspectFilter);
    }

    if (sortOrder === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [history, search, modelFilter, aspectFilter, sortOrder]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDownloadSelectedZip = () => {
    const filenames = history
      .filter(h => selectedIds.has(h.id || h.filename))
      .map(h => h.filename);
    onDownloadAllZip(filenames.length > 0 ? filenames : null);
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      {/* Header & Batch Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-theme-accent text-xs font-semibold uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Local Storage Gallery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary">Session Generations</h1>
          <p className="text-xs text-theme-secondary">
            {history.length} {history.length === 1 ? 'artwork' : 'artworks'} rendered locally without external databases
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {history.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleDownloadSelectedZip}
                className="px-3 py-2 rounded-lg bg-theme-surface border border-theme-border hover:bg-theme-subtle text-xs font-medium text-theme-primary flex items-center space-x-1.5 shadow-sm transition-colors"
                title="Download all or selected as ZIP"
              >
                <Archive className="w-3.5 h-3.5 text-theme-accent" />
                <span>
                  {selectedIds.size > 0 ? `Download (${selectedIds.size}) ZIP` : 'Download All (ZIP)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-medium text-red-600 flex items-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl bg-theme-surface border border-theme-border shadow-sm flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-theme-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompt or model..."
            className="w-full bg-theme-subtle border border-theme-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-theme-primary placeholder-theme-muted focus:outline-none focus:border-theme-accent"
          />
        </div>

        {/* Model Filter */}
        <div className="flex items-center space-x-1.5 text-xs text-theme-secondary">
          <Filter className="w-3.5 h-3.5 text-theme-muted" />
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="bg-theme-subtle border border-theme-border rounded-lg px-2.5 py-1.5 text-xs text-theme-primary focus:outline-none"
          >
            <option value="all">All Models</option>
            {models.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Aspect Ratio Filter */}
        <div className="flex items-center space-x-1.5 text-xs text-theme-secondary">
          <select
            value={aspectFilter}
            onChange={(e) => setAspectFilter(e.target.value)}
            className="bg-theme-subtle border border-theme-border rounded-lg px-2.5 py-1.5 text-xs text-theme-primary focus:outline-none"
          >
            <option value="all">All Aspect Ratios</option>
            {aspectRatios.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div className="flex items-center space-x-1.5 text-xs text-theme-secondary">
          <ArrowUpDown className="w-3.5 h-3.5 text-theme-muted" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-theme-subtle border border-theme-border rounded-lg px-2.5 py-1.5 text-xs text-theme-primary focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Gallery Grid */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-theme-surface border border-theme-border space-y-3">
          <ImageIcon className="w-12 h-12 text-theme-muted mx-auto opacity-40" />
          <h3 className="text-sm font-semibold text-theme-primary">No Images Found</h3>
          <p className="text-xs text-theme-secondary max-w-sm mx-auto">
            {history.length === 0
              ? 'Start generating images in the studio and they will automatically appear here.'
              : 'No images matched your search and filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(item => {
            const isSelected = selectedIds.has(item.id || item.filename);
            return (
              <div
                key={item.id || item.filename}
                className={`group rounded-xl overflow-hidden bg-theme-surface border transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${
                  isSelected ? 'border-theme-accent ring-2 ring-theme-accent/20' : 'border-theme-border'
                }`}
              >
                {/* Image Stage */}
                <div
                  className="relative aspect-square overflow-hidden bg-theme-subtle cursor-pointer"
                  onClick={() => onSelectImage(item)}
                >
                  <img
                    src={item.url}
                    alt={item.prompt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Multi-Select Checkbox overlay */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(item.id || item.filename);
                    }}
                    className={`absolute top-2 left-2 w-6 h-6 rounded-md flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-theme-accent text-white border-theme-accent shadow-sm'
                        : 'bg-black/40 text-white/70 border-white/30 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>

                  {/* Badge overlays */}
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    {item.referenceImageUsed && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-600/90 text-white text-[9px] font-mono flex items-center gap-0.5">
                        <BookmarkCheck className="w-2.5 h-2.5" />
                        Ref
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
                      {item.width}×{item.height}
                    </span>
                  </div>
                </div>

                {/* Details & Actions */}
                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-theme-primary line-clamp-2 font-medium leading-relaxed" title={item.prompt}>
                      {item.prompt}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-theme-muted font-mono mt-1.5">
                      <span className="truncate max-w-[120px]">{item.model}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-theme-border flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onUseAsReference(item)}
                      title="Use as Reference"
                      className="text-[11px] font-medium text-theme-accent hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Use Ref</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => onDownload(item)}
                        title="Download Image"
                        className="p-1.5 rounded hover:bg-theme-subtle text-theme-secondary hover:text-theme-primary transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteImage(item)}
                        title="Delete Image"
                        className="p-1.5 rounded hover:bg-red-500/10 text-theme-secondary hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-theme-surface border border-theme-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-red-500">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-theme-primary">Clear Session Gallery?</h3>
                <p className="text-xs text-theme-secondary">This action will clear all records from the gallery.</p>
              </div>
            </div>

            <p className="text-xs text-theme-secondary leading-relaxed">
              Are you sure you want to clear your local session history? Image files will be safely cleared according to your permissions.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-lg bg-theme-subtle hover:bg-theme-border text-xs font-semibold text-theme-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAllHistory();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Confirm Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

