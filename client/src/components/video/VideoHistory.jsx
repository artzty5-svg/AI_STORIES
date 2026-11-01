import React from 'react';
import {
  Film,
  Download,
  Trash2,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function VideoHistory({
  jobs = [],
  activeJob,
  onSelectJob,
  onDownloadJob,
  onDeleteJob,
  onRetryJob,
  isCollapsed,
  setIsCollapsed
}) {
  if (isCollapsed) {
    return (
      <div className="w-12 h-full bg-theme-surface border-l border-theme-border flex flex-col items-center py-4 justify-between flex-shrink-0">
        <button
          onClick={() => setIsCollapsed(false)}
          title="Expand Video History"
          className="p-2 rounded-lg hover:bg-theme-subtle text-theme-secondary hover:text-theme-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center space-y-2">
          <Film className="w-4 h-4 text-theme-muted" />
          <span className="text-[10px] font-mono text-theme-muted font-bold rotate-90">
            {jobs.length}
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
          <Film className="w-4 h-4 text-theme-accent" />
          <h2 className="text-xs font-bold text-theme-primary">Video History</h2>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-theme-accentSubtle text-theme-accentText border border-theme-border font-semibold">
            {jobs.length}
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

      {/* Video Jobs List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
        {jobs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-theme-muted space-y-2">
            <Film className="w-8 h-8 opacity-30" />
            <p className="text-xs font-semibold text-theme-primary">No Videos Yet</p>
            <p className="text-[11px] text-theme-secondary leading-relaxed max-w-[170px]">
              Videos generated with start and end frames will appear here.
            </p>
          </div>
        ) : (
          jobs.map((job) => {
            const isSelected = activeJob?.id === job.id;
            const isComplete = job.status === 'completed';
            const isFailed = job.status === 'failed';
            const isRunning = !isComplete && !isFailed;

            return (
              <div
                key={job.id}
                onClick={() => isComplete && onSelectJob(job)}
                className={`group rounded-xl border p-2.5 transition-all ${
                  isComplete ? 'cursor-pointer' : ''
                } ${
                  isSelected
                    ? 'bg-theme-accentSubtle border-theme-accent shadow-xs'
                    : 'bg-theme-surface border-theme-border hover:border-theme-borderStrong hover:bg-theme-subtle/50'
                }`}
              >
                <div className="flex space-x-2.5">
                  {/* Thumbnail / Status Icon */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-black border border-theme-border flex-shrink-0 relative flex items-center justify-center">
                    {job.posterUrl ? (
                      <img
                        src={job.posterUrl}
                        alt="Poster"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-theme-subtle text-theme-muted">
                        {isRunning ? (
                          <Loader2 className="w-5 h-5 animate-spin text-theme-accent" />
                        ) : isFailed ? (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <Film className="w-5 h-5" />
                        )}
                      </div>
                    )}

                    {isComplete && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <p className="text-xs text-theme-primary line-clamp-2 leading-snug font-medium" title={job.prompt}>
                        {job.prompt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-theme-muted font-mono mt-1">
                      <span>{job.width}×{job.height}</span>
                      <span>{job.duration}s @ {job.fps}fps</span>
                    </div>
                  </div>
                </div>

                {/* Status & Quick Action Row */}
                <div className="mt-2 pt-1.5 border-t border-theme-border flex items-center justify-between text-[10px]">
                  <span className={`font-mono font-medium flex items-center gap-1 ${
                    isComplete
                      ? 'text-emerald-600'
                      : isFailed
                      ? 'text-red-500'
                      : 'text-amber-500'
                  }`}>
                    {isComplete && <CheckCircle2 className="w-3 h-3" />}
                    {isFailed && <AlertCircle className="w-3 h-3" />}
                    {isRunning && <Loader2 className="w-3 h-3 animate-spin" />}
                    <span className="capitalize">{job.status}</span>
                  </span>

                  <div className="flex items-center space-x-1">
                    {isComplete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadJob(job);
                        }}
                        title="Download Video"
                        className="p-1 rounded hover:bg-theme-border text-theme-secondary hover:text-theme-primary transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isFailed && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRetryJob(job);
                        }}
                        title="Retry Job"
                        className="p-1 rounded hover:bg-theme-border text-theme-secondary hover:text-theme-accent transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteJob(job.id);
                      }}
                      title="Delete Video Job"
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

