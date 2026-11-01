import React, { useState, useEffect, useRef } from 'react';
import StartFrameUpload from '../components/video/StartFrameUpload';
import EndFrameUpload from '../components/video/EndFrameUpload';
import VideoPromptEditor from '../components/video/VideoPromptEditor';
import VideoSettings from '../components/video/VideoSettings';
import VideoPlayer from '../components/video/VideoPlayer';
import VideoHistory from '../components/video/VideoHistory';

import {
  createVideoJob,
  getVideoJobStatus,
  cancelVideoJob,
  listVideoJobs,
  deleteVideoJob,
  getVideoModels,
  triggerDownload
} from '../services/api';
import { Sparkles, Loader2, Play, AlertCircle } from 'lucide-react';
import { sanitizeFilename } from '../utils/formatters';

export default function VideoStudioPage() {
  // Input References & Prompt
  const [startFrame, setStartFrame] = useState(null);
  const [endFrame, setEndFrame] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('blurry, flickering, low quality, distortion');

  // Video Settings
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('local-motion-v2');
  const [duration, setDuration] = useState(4); // 2, 4, 5, 8, 10
  const [resolution, setResolution] = useState('720p');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [fps, setFps] = useState(24);
  const [seed, setSeed] = useState('');
  const [isSeedLocked, setIsSeedLocked] = useState(false);
  const [steps, setSteps] = useState(25);
  const [guidanceScale, setGuidanceScale] = useState(7.5);

  // Job & History State
  const [jobs, setJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const pollIntervalRef = useRef(null);

  // Load Models & Initial Job History
  useEffect(() => {
    async function loadInitialData() {
      try {
        const modRes = await getVideoModels();
        if (modRes.success && modRes.models) {
          setModels(modRes.models);
          if (modRes.models.length > 0) {
            setSelectedModel(modRes.models[0].id);
          }
        }

        const jobRes = await listVideoJobs();
        if (jobRes.success && jobRes.jobs) {
          setJobs(jobRes.jobs);
          if (jobRes.jobs.length > 0) {
            const latest = jobRes.jobs[0];
            setActiveJob(latest);
            // If the latest job is still in progress, continue polling it
            if (['queued', 'preparing', 'generating', 'processing_output'].includes(latest.status)) {
              startPolling(latest.id);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load initial video studio data:', err);
      }
    }
    loadInitialData();

    return () => stopPolling();
  }, []);

  // Poll Job Status
  const startPolling = (jobId) => {
    stopPolling();
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await getVideoJobStatus(jobId);
        if (res.success && res.job) {
          const updatedJob = res.job;
          setActiveJob(updatedJob);

          // Update job in history list
          setJobs(prev => prev.map(j => (j.id === updatedJob.id ? updatedJob : j)));

          if (['completed', 'failed', 'cancelled'].includes(updatedJob.status)) {
            stopPolling();
          }
        }
      } catch (e) {
        console.warn('Polling error:', e);
      }
    }, 1500);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  // Generate Video Job Submit
  const handleGenerateVideo = async () => {
    if (!startFrame || !endFrame || !prompt.trim() || isSubmitting) return;

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const selectedModelObj = models.find(m => m.id === selectedModel);
      const targetEngine = 'comfyui';

      const payload = {
        prompt: prompt.trim(),
        negativePrompt: negativePrompt.trim(),
        startFrame: startFrame.filename,
        endFrame: endFrame.filename,
        model: selectedModel,
        engine: targetEngine,
        duration,
        resolution,
        aspectRatio,
        fps,
        seed: isSeedLocked && seed ? seed : undefined,
        steps,
        guidanceScale
      };

      const res = await createVideoJob(payload);
      if (res.success && res.job) {
        setActiveJob(res.job);
        setJobs(prev => [res.job, ...prev]);
        startPolling(res.job.id);
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit video generation job.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel Job
  const handleCancelJob = async (jobId) => {
    try {
      const res = await cancelVideoJob(jobId);
      if (res.success && res.job) {
        setActiveJob(res.job);
        setJobs(prev => prev.map(j => (j.id === res.job.id ? res.job : j)));
        stopPolling();
      }
    } catch (err) {
      console.warn('Cancel error:', err);
    }
  };

  // Download Video
  const handleDownloadJob = (job) => {
    if (!job || !job.outputFilename) return;
    const downloadFilename = sanitizeFilename(job.prompt, job.width, job.height, 'mp4');
    const downloadUrl = `/api/video/jobs/${encodeURIComponent(job.id)}/download`;
    triggerDownload(downloadUrl, downloadFilename);
  };

  // Delete Job
  const handleDeleteJob = async (jobId) => {
    try {
      await deleteVideoJob(jobId);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      if (activeJob?.id === jobId) {
        const remaining = jobs.filter(j => j.id !== jobId);
        setActiveJob(remaining[0] || null);
      }
    } catch (err) {
      console.warn('Delete error:', err);
    }
  };

  // Retry Failed Job
  const handleRetryJob = (job) => {
    setPrompt(job.prompt);
    if (job.negativePrompt) setNegativePrompt(job.negativePrompt);
    setDuration(job.duration || 4);
    setResolution(job.resolution || '720p');
    setAspectRatio(job.aspectRatio || '16:9');
    setFps(job.fps || 24);
  };

  const isGenerating = activeJob && ['queued', 'preparing', 'generating', 'processing_output'].includes(activeJob.status);
  const canGenerate = startFrame && endFrame && prompt.trim().length > 0 && !isGenerating && !isSubmitting;

  return (
    <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden bg-theme-bg">
      {/* LEFT SECTION: Video Generation Controls (Scrollable) */}
      <aside className="w-full lg:w-[420px] lg:min-w-[380px] lg:max-w-[450px] h-full flex flex-col bg-theme-surface border-r border-theme-border overflow-y-auto p-4 space-y-4 flex-shrink-0 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-theme-primary tracking-tight">AI Video Generation</h2>
          <p className="text-[11px] text-theme-muted">First-Last Frame video synthesis with Apple Silicon acceleration</p>
        </div>

        {/* Start Frame Upload */}
        <StartFrameUpload
          startFrame={startFrame}
          setStartFrame={setStartFrame}
          disabled={isGenerating || isSubmitting}
        />

        {/* End Frame Upload */}
        <EndFrameUpload
          endFrame={endFrame}
          setEndFrame={setEndFrame}
          disabled={isGenerating || isSubmitting}
        />

        {/* Motion Prompt Editor */}
        <VideoPromptEditor
          prompt={prompt}
          setPrompt={setPrompt}
          negativePrompt={negativePrompt}
          setNegativePrompt={setNegativePrompt}
          disabled={isGenerating || isSubmitting}
        />

        {/* Video Settings (Duration, Resolution, FPS, Seed) */}
        <VideoSettings
          models={models}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          duration={duration}
          setDuration={setDuration}
          resolution={resolution}
          setResolution={setResolution}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          fps={fps}
          setFps={setFps}
          seed={seed}
          setSeed={setSeed}
          isSeedLocked={isSeedLocked}
          setIsSeedLocked={setIsSeedLocked}
          steps={steps}
          setSteps={setSteps}
          guidanceScale={guidanceScale}
          setGuidanceScale={setGuidanceScale}
          disabled={isGenerating || isSubmitting}
        />

        {/* Action: Generate Video Button */}
        <div className="pt-2 border-t border-theme-border space-y-2">
          <button
            type="button"
            onClick={handleGenerateVideo}
            disabled={!canGenerate}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md ${
              !canGenerate
                ? 'bg-theme-subtle text-theme-muted cursor-not-allowed border border-theme-border'
                : 'bg-theme-accent hover:bg-theme-accentHover text-white shadow-theme-accent/25 active:scale-[0.99]'
            }`}
          >
            {isGenerating || isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating Video...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Generate Video</span>
              </>
            )}
          </button>

          {!startFrame && !endFrame && (
            <p className="text-[10px] text-theme-muted text-center font-mono">
              Upload both Frame A and Frame B to enable generation.
            </p>
          )}

          {submitError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}
        </div>
      </aside>

      {/* CENTER SECTION: Video Preview & Player */}
      <main className="flex-1 min-w-0 h-full flex flex-col overflow-hidden relative">
        <VideoPlayer
          activeJob={activeJob}
          activeVideoUrl={activeJob?.outputUrl}
          videoMetadata={activeJob?.videoMetadata}
          onDownload={handleDownloadJob}
          onCancelJob={handleCancelJob}
        />
      </main>

      {/* RIGHT SECTION: Video History (Collapsible) */}
      <aside
        className={`h-full flex flex-col flex-shrink-0 transition-all duration-200 ${
          isCollapsed ? 'w-12' : 'w-full lg:w-[300px] lg:min-w-[280px] lg:max-w-[340px]'
        }`}
      >
        <VideoHistory
          jobs={jobs}
          activeJob={activeJob}
          onSelectJob={(j) => setActiveJob(j)}
          onDownloadJob={handleDownloadJob}
          onDeleteJob={handleDeleteJob}
          onRetryJob={handleRetryJob}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      </aside>
    </div>
  );
}

