import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import VideoStudioPage from './pages/VideoStudioPage';

import PromptInput from './components/PromptInput';
import ReferenceUpload from './components/ReferenceUpload';
import ModelSelector from './components/ModelSelector';
import ResolutionPicker from './components/ResolutionPicker';
import GenerationControls from './components/GenerationControls';
import ImagePreview from './components/ImagePreview';
import ImageGallery from './components/ImageGallery';
import FullscreenModal from './components/FullscreenModal';

import { useLocalStorage } from './hooks/useLocalStorage';
import {
  checkHealth,
  getEngines,
  getAllModels,
  generateImage,
  deleteImage as apiDeleteImage,
  clearAllHistory as apiClearAllHistory,
  listImages,
  upscaleImage as apiUpscaleImage,
  createVariation as apiCreateVariation,
  downloadAllZip as apiDownloadAllZip,
  triggerDownload
} from './services/api';
import { sanitizeFilename } from './utils/formatters';
import { RESOLUTION_GROUPS } from './constants/resolutions';

export default function App() {
  // Theme System (Light by default)
  const [theme, setTheme] = useLocalStorage('neuro_theme', 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Main Navigation Tab
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'create', 'explore', 'history', 'settings'

  // Studio Settings (Persisted in localStorage)
  const [selectedModel, setSelectedModel] = useLocalStorage('neuro_model', 'sd_xl_base_1.0.safetensors');
  const [selectedPreset, setSelectedPreset] = useLocalStorage('neuro_resolution', 'sq-1024');

  // Working Generation State
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [customWidth, setCustomWidth] = useState('1024');
  const [customHeight, setCustomHeight] = useState('1024');
  const [batchCount, setBatchCount] = useState(1); // 1, 2, 3, or 4
  const [activeReference, setActiveReference] = useState(null);
  const [referenceStrength, setReferenceStrength] = useState(0.65);
  const [referenceMode, setReferenceMode] = useState('image-to-image');

  // Sampling & Seed Settings
  const [seed, setSeed] = useState('');
  const [isSeedLocked, setIsSeedLocked] = useState(false);
  const [steps, setSteps] = useState(25);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [sampler, setSampler] = useState('Euler a');

  // System & Connection State
  const [backendOnline, setBackendOnline] = useState(true);
  const [comfyUIStatus, setComfyUIStatus] = useState(null);
  const [engines, setEngines] = useState([]);
  const [models, setModels] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Studio Preview & History State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState(''); // 'queued' | 'synthesizing' | 'saving' | 'completed' | 'cancelled' | 'failed'
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [generationError, setGenerationError] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [batchImages, setBatchImages] = useState([]);
  const [history, setHistory] = useState([]);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

  const abortControllerRef = useRef(null);
  const timerRef = useRef(null);

  // Timer for generation progress
  useEffect(() => {
    if (isGenerating) {
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGenerating]);

  // Sync System & Server Gallery
  const refreshConnections = useCallback(async () => {
    setIsRefreshing(true);
    setGenerationError(null);

    try {
      // 1. Health
      try {
        await checkHealth();
        setBackendOnline(true);
      } catch (e) {
        setBackendOnline(false);
      }

      // 2. Engines & Models
      try {
        const engRes = await getEngines();
        if (engRes.success) {
          setEngines(engRes.engines);
          const comfy = engRes.engines.find(e => e.id === 'comfyui');
          setComfyUIStatus(comfy ? { available: comfy.available, ...comfy.details } : { available: false });
        }

        const modRes = await getAllModels();
        if (modRes.success) {
          setModels(modRes.models);
          if (!modRes.models.some(m => m.id === selectedModel)) {
            const defModel = modRes.models[0];
            if (defModel) setSelectedModel(defModel.id);
          }
        }
      } catch (e) {
        console.warn('Failed to load engines/models:', e);
      }

      // 3. Initial History sync from server
      try {
        const existing = await listImages();
        if (existing.success && existing.images) {
          setHistory(existing.images);
          if (existing.images.length > 0 && !currentImage) {
            setCurrentImage(existing.images[0]);
          }
        }
      } catch (e) {
        // ignore
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedModel, currentImage, setSelectedModel]);

  useEffect(() => {
    refreshConnections();
  }, [refreshConnections]);

  // Handle Image Generation
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setGenerationError(null);
    setIsGenerating(true);
    setGenerationStage('queued');

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Transition to synthesizing
    setTimeout(() => {
      setGenerationStage('synthesizing');
    }, 400);

    // Resolve Dimensions
    let width = 1024;
    let height = 1024;

    if (selectedPreset === 'custom') {
      width = parseInt(customWidth, 10) || 1024;
      height = parseInt(customHeight, 10) || 1024;
    } else {
      let found = null;
      for (const group of RESOLUTION_GROUPS) {
        const p = group.presets.find(item => item.id === selectedPreset);
        if (p) {
          found = p;
          break;
        }
      }
      if (found) {
        width = found.width;
        height = found.height;
      }
    }

    try {
      const payload = {
        prompt: prompt.trim(),
        negativePrompt: negativePrompt.trim() || undefined,
        referenceImage: activeReference ? activeReference.filename : null,
        referenceStrength,
        referenceMode,
        resolution: `${width}x${height}`,
        width,
        height,
        model: selectedModel,
        engine: 'comfyui',
        seed: isSeedLocked && seed ? seed : undefined,
        steps,
        guidanceScale,
        sampler,
        count: batchCount
      };

      const result = await generateImage(payload, abortController.signal);

      if (result.success && result.images && result.images.length > 0) {
        setGenerationStage('completed');
        const newImages = result.images;
        setBatchImages(newImages);
        setCurrentImage(newImages[0]);
        setHistory(prev => [...newImages, ...prev]);

        // If seed wasn't locked, update with the primary seed
        if (!isSeedLocked && newImages[0].seed) {
          setSeed(newImages[0].seed.toString());
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setGenerationStage('cancelled');
        setGenerationError('Generation request was cancelled.');
      } else {
        setGenerationStage('failed');
        setGenerationError(err.message || 'Image generation failed.');
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const handleSelectPromptFromInspiration = (inspirationPrompt, inspirationNegative = '') => {
    setPrompt(inspirationPrompt);
    if (inspirationNegative) setNegativePrompt(inspirationNegative);
    setActiveTab('create');
  };

  const handleUseAsReference = (imageItem) => {
    if (!imageItem) return;
    setActiveReference({
      filename: imageItem.filename,
      url: imageItem.url,
      originalName: imageItem.filename,
      width: imageItem.width,
      height: imageItem.height,
      size: imageItem.size || 0,
      mimeType: 'image/png',
      source: 'generated'
    });
    setActiveTab('create');
  };

  const handleDownload = (imageItem, format = 'png') => {
    if (!imageItem) return;
    const downloadFilename = sanitizeFilename(imageItem.prompt, imageItem.width, imageItem.height, format);
    const downloadUrl = `/api/download/${encodeURIComponent(imageItem.filename)}`;
    triggerDownload(downloadUrl, downloadFilename, format);
  };

  const handleDownloadAllZip = async (filenames = null) => {
    try {
      await apiDownloadAllZip(filenames);
    } catch (e) {
      console.warn('ZIP download error:', e);
    }
  };

  const handleUpscaleImage = async (filename, scale = 2) => {
    const upscaled = await apiUpscaleImage(filename, scale);
    setHistory(prev => [upscaled, ...prev]);
    setCurrentImage(upscaled);
    return upscaled;
  };

  const handleGenerateVariation = async (imageItem) => {
    if (!imageItem) return;
    const variation = await apiCreateVariation(imageItem.filename, imageItem.prompt, referenceStrength);
    setHistory(prev => [variation, ...prev]);
    setCurrentImage(variation);
  };

  const handleDeleteImage = async (imageItem) => {
    if (!imageItem) return;
    try {
      await apiDeleteImage(imageItem.filename);
    } catch (e) {
      // ignore
    }

    setHistory(prev => prev.filter(img => img.filename !== imageItem.filename));
    setBatchImages(prev => prev.filter(img => img.filename !== imageItem.filename));

    if (currentImage?.filename === imageItem.filename) {
      const remaining = history.filter(img => img.filename !== imageItem.filename);
      setCurrentImage(remaining[0] || null);
    }
    if (activeReference?.filename === imageItem.filename) {
      setActiveReference(null);
    }
  };

  const handleClearAllHistory = async () => {
    try {
      await apiClearAllHistory();
    } catch (e) {
      // ignore
    }
    setHistory([]);
    setBatchImages([]);
    setCurrentImage(null);
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter to trigger generation in create view
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (activeTab === 'create') {
          handleGenerate();
        } else {
          setActiveTab('create');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="h-screen w-screen flex flex-col bg-theme-bg text-theme-primary overflow-hidden font-sans">
      {/* Top Application Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentTheme={theme}
        setTheme={setTheme}
        backendOnline={backendOnline}
        comfyUIStatus={comfyUIStatus}
        activeEngine={engines.find(e => e.id === 'comfyui') || engines[0]}
        historyCount={history.length}
        onRefresh={refreshConnections}
        isRefreshing={isRefreshing}
      />

      {/* Main View Router */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {activeTab === 'home' && (
          <HomePage
            prompt={prompt}
            setPrompt={setPrompt}
            onSelectPrompt={handleSelectPromptFromInspiration}
            onGoToCreate={() => setActiveTab('create')}
            onGoToVideo={() => setActiveTab('video')}
          />
        )}

        {activeTab === 'explore' && (
          <ExplorePage
            onSelectPrompt={handleSelectPromptFromInspiration}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage
            history={history}
            onSelectImage={(img) => {
              setCurrentImage(img);
              setActiveTab('create');
            }}
            onUseAsReference={handleUseAsReference}
            onDownload={handleDownload}
            onDeleteImage={handleDeleteImage}
            onClearAllHistory={handleClearAllHistory}
            onDownloadAllZip={handleDownloadAllZip}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            backendOnline={backendOnline}
            comfyUIStatus={comfyUIStatus}
            engines={engines}
            models={models}
            onRefresh={refreshConnections}
            isRefreshing={isRefreshing}
          />
        )}

        {activeTab === 'video' && (
          <VideoStudioPage />
        )}

        {/* 3-Column Studio Workspace */}
        {activeTab === 'create' && (
          <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden">
            {/* Left Column: Generation Settings (Scrollable) */}
            <aside className="w-full lg:w-[390px] lg:min-w-[360px] lg:max-w-[420px] h-full flex flex-col bg-theme-surface border-r border-theme-border overflow-y-auto p-4 space-y-4 flex-shrink-0 shadow-xs">
              {/* Prompt Editor */}
              <PromptInput
                prompt={prompt}
                setPrompt={setPrompt}
                negativePrompt={negativePrompt}
                setNegativePrompt={setNegativePrompt}
                isGenerating={isGenerating}
              />

              {/* Reference Image (Img2Img) */}
              <ReferenceUpload
                activeReference={activeReference}
                setActiveReference={setActiveReference}
                referenceStrength={referenceStrength}
                setReferenceStrength={setReferenceStrength}
                referenceMode={referenceMode}
                setReferenceMode={setReferenceMode}
                isGenerating={isGenerating}
              />

              {/* Engine & Model Selection */}
              <ModelSelector
                engines={engines}
                models={models}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                onRefresh={refreshConnections}
                isRefreshing={isRefreshing}
              />

              {/* Resolution & Aspect Ratio Picker */}
              <ResolutionPicker
                selectedPreset={selectedPreset}
                setSelectedPreset={setSelectedPreset}
                customWidth={customWidth}
                setCustomWidth={setCustomWidth}
                customHeight={customHeight}
                setCustomHeight={setCustomHeight}
              />

              {/* Batch Output & Advanced Sampling */}
              <GenerationControls
                batchCount={batchCount}
                setBatchCount={setBatchCount}
                seed={seed}
                setSeed={setSeed}
                isSeedLocked={isSeedLocked}
                setIsSeedLocked={setIsSeedLocked}
                steps={steps}
                setSteps={setSteps}
                guidanceScale={guidanceScale}
                setGuidanceScale={setGuidanceScale}
                sampler={sampler}
                setSampler={setSampler}
                onGenerate={() => handleGenerate()}
                onCancel={handleCancel}
                isGenerating={isGenerating}
                generationStage={generationStage}
                elapsedSeconds={elapsedSeconds}
                generationError={generationError}
                promptLength={prompt.trim().length}
              />
            </aside>

            {/* Center Column: Image Preview Stage */}
            <main className="flex-1 min-w-0 h-full flex flex-col overflow-hidden relative">
              <ImagePreview
                currentImage={currentImage}
                batchImages={batchImages}
                onSelectImage={setCurrentImage}
                onDownload={handleDownload}
                onUseAsReference={handleUseAsReference}
                onGenerateVariation={handleGenerateVariation}
                onUpscaleImage={handleUpscaleImage}
                onDeleteImage={handleDeleteImage}
                onOpenFullscreen={setFullscreenImage}
                isGenerating={isGenerating}
                generationStage={generationStage}
                elapsedSeconds={elapsedSeconds}
              />
            </main>

            {/* Right Column: History Sidebar (Collapsible) */}
            <aside
              className={`h-full flex flex-col flex-shrink-0 transition-all duration-200 ${
                rightSidebarCollapsed ? 'w-12' : 'w-full lg:w-[280px] lg:min-w-[260px] lg:max-w-[320px]'
              }`}
            >
              <ImageGallery
                history={history}
                selectedImage={currentImage}
                onSelectImage={setCurrentImage}
                onDownload={handleDownload}
                onUseAsReference={handleUseAsReference}
                onDeleteImage={handleDeleteImage}
                isCollapsed={rightSidebarCollapsed}
                setIsCollapsed={setRightSidebarCollapsed}
              />
            </aside>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {fullscreenImage && (
        <FullscreenModal
          image={fullscreenImage}
          onClose={() => setFullscreenImage(null)}
          onDownload={handleDownload}
          onUseAsReference={handleUseAsReference}
        />
      )}
    </div>
  );
}
