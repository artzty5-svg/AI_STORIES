import React, { useState } from 'react';
import {
  Type,
  X,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  Shuffle,
  Copy,
  Check,
  Video,
  Sparkles
} from 'lucide-react';

const VIDEO_EXAMPLE_PROMPTS = [
  {
    title: 'Cinematic Push-In',
    prompt: 'Cinematic slow camera push-in moving smoothly from the starting composition toward the focal subject, gentle ambient atmospheric dust, photorealistic motion blur.',
    negative: 'flickering, jittery camera, sudden jumps, warping'
  },
  {
    title: 'Character Turn',
    prompt: 'Character naturally turns their head and shoulders toward the camera, wind blowing gently through hair, smooth continuous facial expression transition.',
    negative: 'distorted face, extra limbs, unnatural robotic motion, flickering'
  },
  {
    title: 'Day to Night Transition',
    prompt: 'Smooth temporal transition as golden hour sunlight fades into twilight, city lights illuminate, stars appear in the deepening night sky, seamless continuous time lapse.',
    negative: 'abrupt cut, flickering light, frame drop, visual artifacts'
  },
  {
    title: 'Product 360 Orbit',
    prompt: 'Smooth elegant camera orbit rotating around the product pedestal, studio softbox reflections gliding across metallic surfaces, commercial 4k advertising look.',
    negative: 'wobbly camera, distorted geometry, reflection noise'
  },
  {
    title: 'Subject Walking Forward',
    prompt: 'Subject walks smoothly forward through the environment toward the camera, natural stride, dynamic lighting shifts across garments, steady tracking camera move.',
    negative: 'glitching, floating walk, inconsistent footsteps, morphing anatomy'
  },
  {
    title: 'Mountain Cloud Inversion',
    prompt: 'Atmospheric mist and clouds rolling smoothly across the mountain ridge, morning sunlight breaking through cloud layers, slow motion cinematic drone flight.',
    negative: 'static freeze, jerky motion, choppy frame rate'
  }
];

export default function VideoPromptEditor({
  prompt,
  setPrompt,
  negativePrompt,
  setNegativePrompt,
  disabled
}) {
  const [showNegative, setShowNegative] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRandomExample = () => {
    const item = VIDEO_EXAMPLE_PROMPTS[Math.floor(Math.random() * VIDEO_EXAMPLE_PROMPTS.length)];
    setPrompt(item.prompt);
    if (item.negative) setNegativePrompt(item.negative);
  };

  const handleCopyPrompt = () => {
    if (!prompt.trim()) return;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-theme-primary flex items-center gap-1.5">
          <Video className="w-3.5 h-3.5 text-theme-accent" />
          <span>Motion & Transition Prompt</span>
        </label>

        <div className="flex items-center space-x-1.5 text-xs text-theme-secondary">
          <button
            type="button"
            onClick={handleRandomExample}
            disabled={disabled}
            title="Load random motion prompt example"
            className="p-1 rounded hover:bg-theme-subtle text-theme-muted hover:text-theme-primary transition-colors disabled:opacity-50"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          {prompt && (
            <button
              type="button"
              onClick={handleCopyPrompt}
              title="Copy prompt"
              className="p-1 rounded hover:bg-theme-subtle text-theme-muted hover:text-theme-primary transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}

          {prompt && (
            <button
              type="button"
              onClick={() => setPrompt('')}
              disabled={disabled}
              title="Clear prompt"
              className="p-1 rounded hover:bg-theme-subtle text-theme-muted hover:text-theme-primary transition-colors disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <span className="font-mono text-[10px] text-theme-muted ml-1">{prompt.length} chars</span>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe how the scene should move from the starting frame to the ending frame. Include subject motion, camera movement, transitions, and environmental changes..."
          className="w-full bg-theme-input border border-theme-border rounded-xl p-3 text-xs text-theme-primary placeholder-theme-muted focus:outline-none focus:border-theme-accent transition-all resize-none leading-relaxed shadow-sm"
        />
      </div>

      {/* Quick Example Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
        <span className="text-theme-muted font-mono flex-shrink-0">Inspirations:</span>
        {VIDEO_EXAMPLE_PROMPTS.slice(0, 4).map((ex) => (
          <button
            key={ex.title}
            type="button"
            onClick={() => {
              setPrompt(ex.prompt);
              if (ex.negative) setNegativePrompt(ex.negative);
            }}
            className="px-2 py-0.5 rounded-md bg-theme-subtle hover:bg-theme-border border border-theme-border text-theme-secondary hover:text-theme-primary whitespace-nowrap transition-colors"
          >
            {ex.title}
          </button>
        ))}
      </div>

      {/* Negative Prompt Collapsible */}
      <div className="pt-0.5">
        <button
          type="button"
          onClick={() => setShowNegative(!showNegative)}
          className="text-xs text-theme-secondary hover:text-theme-primary flex items-center gap-1.5 transition-colors font-medium"
        >
          {showNegative ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          <SlidersHorizontal className="w-3 h-3 text-theme-muted" />
          <span>Negative Motion Prompt (Optional)</span>
        </button>

        {showNegative && (
          <div className="mt-2 space-y-1">
            <textarea
              rows={2}
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="What to exclude (e.g. flickering, distorted anatomy, camera shake, unnatural motion, blurry details)..."
              className="w-full bg-theme-input border border-theme-border rounded-lg p-2.5 text-xs text-theme-primary placeholder-theme-muted focus:outline-none focus:border-theme-accent resize-none"
            />
            <p className="text-[10px] text-theme-muted font-mono">Unwanted artifacts the video model should suppress.</p>
          </div>
        )}
      </div>
    </div>
  );
}

