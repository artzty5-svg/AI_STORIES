import React, { useState } from 'react';
import { Compass, Sparkles, Copy, Check, ArrowRight, Search } from 'lucide-react';
import { CATEGORIES } from '../constants/prompts';

export default function ExplorePage({ onSelectPrompt }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const filtered = CATEGORIES.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (id, text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-theme-accent text-xs font-semibold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Curated Prompt Library</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary">Creative Inspirations</h1>
          <p className="text-xs text-theme-secondary">High-fidelity master prompts across photography, anime, architecture, 3D and more</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-theme-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search prompts or styles..."
            className="w-full bg-theme-surface border border-theme-border rounded-lg pl-9 pr-3 py-2 text-xs text-theme-primary placeholder-theme-muted focus:outline-none focus:border-theme-accent"
          />
        </div>
      </div>

      {/* Grid of Prompts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(item => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-theme-surface border border-theme-border space-y-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-theme-primary">{item.name}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-theme-subtle text-theme-secondary border border-theme-border">
                  {item.id}
                </span>
              </div>
              <p className="text-xs text-theme-secondary mb-3 leading-relaxed">
                "{item.prompt}"
              </p>
              {item.negativePrompt && (
                <p className="text-[11px] text-theme-muted font-mono">
                  <span className="font-semibold text-red-500/80">Negative:</span> {item.negativePrompt}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-theme-border">
              <button
                type="button"
                onClick={(e) => handleCopy(item.id, item.prompt, e)}
                className="text-[11px] text-theme-secondary hover:text-theme-primary flex items-center gap-1 font-medium"
              >
                {copiedId === item.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onSelectPrompt(item.prompt, item.negativePrompt)}
                className="px-3 py-1.5 rounded-lg bg-theme-accent hover:bg-theme-accentHover text-white text-xs font-medium flex items-center space-x-1.5 transition-colors"
              >
                <span>Use Prompt in Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

