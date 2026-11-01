import React, { useState } from 'react';
import { Maximize2, Lock, Unlock, RotateCcw, AlertCircle, HardDrive } from 'lucide-react';
import { RESOLUTION_GROUPS, estimateMemory } from '../constants/resolutions';

export default function ResolutionPicker({
  selectedPreset,
  setSelectedPreset,
  customWidth,
  setCustomWidth,
  customHeight,
  setCustomHeight
}) {
  const [activeCategory, setActiveCategory] = useState('Square');
  const [aspectLocked, setAspectLocked] = useState(false);

  const isCustom = selectedPreset === 'custom';

  // Find active preset object across groups
  let activePresetObj = null;
  for (const group of RESOLUTION_GROUPS) {
    const found = group.presets.find(p => p.id === selectedPreset);
    if (found) {
      activePresetObj = found;
      break;
    }
  }

  const currentWidth = isCustom ? parseInt(customWidth, 10) || 1024 : activePresetObj?.width || 1024;
  const currentHeight = isCustom ? parseInt(customHeight, 10) || 1024 : activePresetObj?.height || 1024;

  const isValidWidth = currentWidth >= 256 && currentWidth <= 2048;
  const isValidHeight = currentHeight >= 256 && currentHeight <= 2048;
  const isValid = isValidWidth && isValidHeight;

  const handleWidthChange = (val) => {
    setCustomWidth(val);
    if (aspectLocked && currentWidth > 0) {
      const ratio = currentHeight / currentWidth;
      const num = parseInt(val, 10);
      if (!isNaN(num)) {
        setCustomHeight(Math.round(num * ratio));
      }
    }
  };

  const handleHeightChange = (val) => {
    setCustomHeight(val);
    if (aspectLocked && currentHeight > 0) {
      const ratio = currentWidth / currentHeight;
      const num = parseInt(val, 10);
      if (!isNaN(num)) {
        setCustomWidth(Math.round(num * ratio));
      }
    }
  };

  const handleResetCustom = () => {
    setCustomWidth('1024');
    setCustomHeight('1024');
  };

  const currentGroup = RESOLUTION_GROUPS.find(g => g.category === activeCategory) || RESOLUTION_GROUPS[0];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-theme-primary flex items-center gap-1.5">
          <Maximize2 className="w-3.5 h-3.5 text-theme-accent" />
          <span>Aspect Ratio & Resolution</span>
        </label>
        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-theme-accentSubtle text-theme-accentText border border-theme-border font-semibold">
          {currentWidth} × {currentHeight}
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center p-1 rounded-lg bg-theme-subtle border border-theme-border text-[11px] gap-1 overflow-x-auto">
        {RESOLUTION_GROUPS.map(group => (
          <button
            key={group.category}
            type="button"
            onClick={() => {
              setActiveCategory(group.category);
              if (isCustom) setSelectedPreset(group.presets[0].id);
            }}
            className={`px-2 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeCategory === group.category && !isCustom
                ? 'bg-theme-surface text-theme-primary shadow-xs font-semibold'
                : 'text-theme-muted hover:text-theme-primary'
            }`}
          >
            {group.category}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSelectedPreset('custom')}
          className={`px-2 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
            isCustom
              ? 'bg-theme-surface text-theme-accent shadow-xs font-semibold'
              : 'text-theme-muted hover:text-theme-primary'
          }`}
        >
          Custom
        </button>
      </div>

      {/* Presets List */}
      {!isCustom ? (
        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
          {currentGroup.presets.map(preset => {
            const isSelected = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedPreset(preset.id)}
                className={`p-2 rounded-lg text-left border transition-all ${
                  isSelected
                    ? 'bg-theme-accentSubtle border-theme-accent text-theme-accentText shadow-xs'
                    : 'bg-theme-surface border-theme-border text-theme-secondary hover:border-theme-borderStrong hover:text-theme-primary'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono font-medium">
                  <span>{preset.label}</span>
                  <span className="text-[10px] text-theme-muted">{preset.aspect}</span>
                </div>
                <div className="text-[10px] text-theme-muted truncate mt-0.5">
                  {preset.tag}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* Custom Dimensions Editor */
        <div className="p-3 rounded-xl bg-theme-surface border border-theme-border space-y-3 shadow-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-theme-muted uppercase mb-1">Width (px)</label>
              <input
                type="number"
                min="256"
                max="2048"
                step="64"
                value={customWidth}
                onChange={(e) => handleWidthChange(e.target.value)}
                className="w-full bg-theme-input border border-theme-border rounded-lg px-2.5 py-1.5 text-xs text-theme-primary font-mono focus:outline-none focus:border-theme-accent"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-theme-muted uppercase mb-1">Height (px)</label>
              <input
                type="number"
                min="256"
                max="2048"
                step="64"
                value={customHeight}
                onChange={(e) => handleHeightChange(e.target.value)}
                className="w-full bg-theme-input border border-theme-border rounded-lg px-2.5 py-1.5 text-xs text-theme-primary font-mono focus:outline-none focus:border-theme-accent"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-theme-secondary pt-1 border-t border-theme-border">
            <button
              type="button"
              onClick={() => setAspectLocked(!aspectLocked)}
              className="flex items-center space-x-1 hover:text-theme-primary transition-colors"
            >
              {aspectLocked ? <Lock className="w-3.5 h-3.5 text-theme-accent" /> : <Unlock className="w-3.5 h-3.5 text-theme-muted" />}
              <span>{aspectLocked ? 'Aspect Locked' : 'Aspect Unlocked'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetCustom}
              className="flex items-center space-x-1 text-theme-muted hover:text-theme-primary transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-theme-muted">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              Est. Memory: {estimateMemory(currentWidth, currentHeight)}
            </span>
            <span>Max: 2048 × 2048</span>
          </div>

          {!isValid && (
            <div className="flex items-center gap-1.5 text-[11px] text-red-500 pt-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Dimensions must be between 256 and 2048 pixels.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
