import React, { useState } from 'react';
import {
  Type,
  X,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  Wand2,
  Shuffle,
  Copy,
  Check,
  Tag,
  Loader2
} from 'lucide-react';
import { CATEGORIES, PROMPT_SUGGESTIONS } from '../constants/prompts';
import { enhancePrompt as apiEnhancePrompt } from '../services/api';

export default function PromptInput({
  prompt,
  setPrompt,
  negativePrompt,
  setNegativePrompt,
  isGenerating
}) {
  const [showNegative, setShowNegative] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [suggestionCategory, setSuggestionCategory] = useState('lighting');

  const handleRandomPrompt = () => {
    const randomItem = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    setPrompt(randomItem.prompt);
    if (randomItem.negativePrompt) {
      setNegativePrompt(randomItem.negativePrompt);
    }
  };

  const handleCopyPrompt = () => {
    if (!prompt.trim()) return;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnhance = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const enhanced = await apiEnhancePrompt(prompt);
      setPrompt(enhanced);
    } catch (err) {
      console.warn('Enhancement failed:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const addTagToPrompt = (tag) => {
    const cleaned = prompt.trim();
    if (!cleaned) {
      setPrompt(tag);
    } else if (!cleaned.toLowerCase().includes(tag.toLowerCase())) {
      setPrompt(`${cleaned}, ${tag}`);
    }
  };

  return (
    <div className="space-y-2">
      {/* Label and Quick Utilities */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-theme-primary flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-theme-accent" />
          <span>Prompt Description</span>
        </label>

        <div className="flex items-center space-x-1.5 text-xs text-theme-secondary">
          <button
            type="button"
            onClick={handleRandomPrompt}
            disabled={isGenerating}
            title="Load random inspiration prompt"
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
              disabled={isGenerating}
              title="Clear prompt"
              className="p-1 rounded hover:bg-theme-subtle text-theme-muted hover:text-theme-primary transition-colors disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <span className="font-mono text-[10px] text-theme-muted ml-1">{prompt.length} chars</span>
        </div>
      </div>

      {/* Main Prompt Textarea */}
      <div className="relative">
        <textarea
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe any scene, portrait, landscape, anime character, 3D product, or architecture you want to generate..."
          className="w-full bg-theme-input border border-theme-border rounded-xl p-3 text-xs text-theme-primary placeholder-theme-muted focus:outline-none focus:border-theme-accent transition-all resize-none leading-relaxed shadow-sm"
        />

        {/* Prompt Enhance Button */}
        <div className="absolute bottom-2 right-2 flex items-center space-x-1">
          <button
            type="button"
            onClick={handleEnhance}
            disabled={isEnhancing || !prompt.trim() || isGenerating}
            title="Enhance prompt with studio prompt assistant"
            className="px-2 py-1 rounded-md bg-theme-accentSubtle hover:bg-theme-accent/20 border border-theme-border text-theme-accentText text-[10px] font-semibold flex items-center space-x-1 transition-all disabled:opacity-40"
          >
            {isEnhancing ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Enhancing...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3 h-3 text-theme-accent" />
                <span>Enhance</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prompt Suggestions Collapsible */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="text-xs text-theme-secondary hover:text-theme-primary flex items-center gap-1.5 transition-colors font-medium"
        >
          {showSuggestions ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          <Tag className="w-3 h-3 text-theme-accent" />
          <span>Prompt Style Suggestions</span>
        </button>

        {showSuggestions && (
          <div className="mt-2 p-2.5 rounded-xl bg-theme-subtle border border-theme-border space-y-2">
            {/* Category tabs for suggestions */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
              {Object.keys(PROMPT_SUGGESTIONS).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSuggestionCategory(cat)}
                  className={`px-2 py-0.5 rounded capitalize whitespace-nowrap transition-colors ${
                    suggestionCategory === cat
                      ? 'bg-theme-surface text-theme-accent font-semibold shadow-xs'
                      : 'text-theme-muted hover:text-theme-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Tags Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PROMPT_SUGGESTIONS[suggestionCategory]?.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTagToPrompt(tag)}
                  className="px-2 py-0.5 rounded-md bg-theme-surface hover:bg-theme-border border border-theme-border text-[11px] text-theme-secondary hover:text-theme-primary transition-colors text-left"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        )}
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
          <span>Negative Prompt (Optional)</span>
        </button>

        {showNegative && (
          <div className="mt-2 space-y-1">
            <textarea
              rows={2}
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="What to exclude (e.g. blurry, low quality, oversaturated, deformed hands, artificial plastic look)..."
              className="w-full bg-theme-input border border-theme-border rounded-lg p-2.5 text-xs text-theme-primary placeholder-theme-muted focus:outline-none focus:border-theme-accent resize-none"
            />
            <p className="text-[10px] text-theme-muted font-mono">Unwanted artifacts the engine should suppress.</p>
          </div>
        )}
      </div>
    </div>
  );
}
