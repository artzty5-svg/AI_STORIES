import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Wand2,
  Film,
  Camera,
  Mountain,
  Building2,
  Box,
  Share2,
  Cat,
  Utensils,
  Home,
  Shapes,
  Palette
} from 'lucide-react';
import { CATEGORIES } from '../constants/prompts';

const ICON_MAP = {
  Camera,
  Mountain,
  Building2,
  Sparkles,
  Wand2,
  Palette,
  Box,
  Share2,
  Cat,
  Utensils,
  Home,
  Shapes
};

export default function HomePage({ onSelectPrompt, onGoToCreate, onGoToVideo, prompt, setPrompt }) {
  const handleQuickCreate = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGoToCreate();
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 max-w-7xl mx-auto space-y-12">
      {/* Hero Welcome Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto pt-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-theme-accentSubtle border border-theme-border text-xs text-theme-accentText font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Local Studio • Apple Silicon M5 Pro Accelerated</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-theme-primary leading-tight">
          Production AI Image Generation, <br className="hidden sm:inline" />
          <span className="text-theme-accent">100% On-Device</span>
        </h1>

        <p className="text-sm sm:text-base text-theme-secondary leading-relaxed">
          Create commercial-grade photography, portraits, anime, landscapes, 3D products, architecture, and graphic design locally. Complete privacy, zero cloud transmission.
        </p>

        {/* Hero Prompt Bar */}
        <form onSubmit={handleQuickCreate} className="pt-2">
          <div className="flex flex-col sm:flex-row items-stretch gap-2 p-1.5 rounded-xl bg-theme-surface border border-theme-border shadow-md">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe any scene, style, or subject you want to create..."
              className="flex-1 bg-transparent px-4 py-3 text-sm text-theme-primary placeholder-theme-muted focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-theme-accent hover:bg-theme-accentHover text-white text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all shadow-sm flex-shrink-0"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4 text-left">
          <div className="p-3.5 rounded-lg bg-theme-surface border border-theme-border">
            <div className="flex items-center space-x-2 text-theme-primary font-semibold text-xs mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Zero-Cloud Privacy</span>
            </div>
            <p className="text-[11px] text-theme-secondary leading-snug">
              Prompts and images never leave your local MacBook.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-theme-surface border border-theme-border">
            <div className="flex items-center space-x-2 text-theme-primary font-semibold text-xs mb-1">
              <Cpu className="w-4 h-4 text-theme-accent" />
              <span>ComfyUI Accelerated</span>
            </div>
            <p className="text-[11px] text-theme-secondary leading-snug">
              Hardware-accelerated node diffusion on Apple Silicon.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-theme-surface border border-theme-border">
            <div className="flex items-center space-x-2 text-theme-primary font-semibold text-xs mb-1">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>Multi-Output Batches</span>
            </div>
            <p className="text-[11px] text-theme-secondary leading-snug">
              Generate 1 to 4 distinct variations simultaneously.
            </p>
          </div>

          <div
            onClick={onGoToVideo}
            className="p-3.5 rounded-lg bg-theme-accentSubtle border border-theme-border hover:border-theme-accent cursor-pointer transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between text-theme-accent font-semibold text-xs mb-1">
              <div className="flex items-center space-x-1.5">
                <Film className="w-4 h-4" />
                <span>AI Video Studio</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-theme-secondary leading-snug">
              First-Last frame motion synthesis with hardware encoding.
            </p>
          </div>
        </div>
      </section>

      {/* 12 Category Inspiration Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-theme-primary tracking-tight">Explore Creative Genres</h2>
            <p className="text-xs text-theme-secondary">Click any genre to load its curated master prompt into the studio</p>
          </div>
          <button
            onClick={onGoToCreate}
            className="text-xs text-theme-accent font-medium hover:underline flex items-center gap-1"
          >
            <span>Open Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map(category => {
            const IconComponent = ICON_MAP[category.icon] || Sparkles;
            return (
              <div
                key={category.id}
                onClick={() => onSelectPrompt(category.prompt, category.negativePrompt)}
                className="group p-4 rounded-xl bg-theme-surface border border-theme-border hover:border-theme-borderStrong transition-all cursor-pointer shadow-sm hover:shadow-md space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-lg bg-theme-subtle text-theme-accent group-hover:bg-theme-accent group-hover:text-white transition-colors">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-theme-primary group-hover:text-theme-accent transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-[10px] text-theme-muted">{category.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-theme-muted group-hover:text-theme-accent transition-transform group-hover:translate-x-0.5" />
                </div>

                <div className="p-2.5 rounded-lg bg-theme-subtle border border-theme-border text-xs text-theme-secondary line-clamp-3 leading-relaxed font-sans">
                  "{category.prompt}"
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
