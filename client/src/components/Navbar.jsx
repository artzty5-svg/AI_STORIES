import React, { useState } from 'react';
import {
  Sparkles,
  Home,
  Wand2,
  Film,
  Compass,
  History,
  Settings,
  Server,
  Cpu,
  RefreshCw,
  Palette,
  Check,
  Menu,
  X
} from 'lucide-react';
import { THEMES } from '../constants/themes';

export default function Navbar({
  activeTab,
  setActiveTab,
  currentTheme,
  setTheme,
  backendOnline,
  comfyUIStatus,
  activeEngine,
  historyCount,
  onRefresh,
  isRefreshing
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { key: 'home', label: 'Home', icon: <Home className="w-3.5 h-3.5" /> },
    { key: 'create', label: 'Image Studio', icon: <Wand2 className="w-3.5 h-3.5 text-theme-accent" /> },
    { key: 'video', label: 'Video Studio', icon: <Film className="w-3.5 h-3.5 text-theme-accent" /> },
    { key: 'explore', label: 'Explore', icon: <Compass className="w-3.5 h-3.5" /> },
    { key: 'history', label: 'Gallery', icon: <History className="w-3.5 h-3.5" />, badge: historyCount > 0 ? historyCount : null },
    { key: 'settings', label: 'Settings', icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  const handleTabSelect = (key) => {
    setActiveTab(key);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="h-14 border-b border-theme-border bg-theme-surface px-4 flex items-center justify-between flex-shrink-0 z-30 transition-colors shadow-sm">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-8 h-8 rounded-lg bg-theme-accent text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm tracking-tight text-theme-primary">NeuroCanvas AI</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-theme-accentSubtle text-theme-accentText border border-theme-border font-medium">
                Studio
              </span>
            </div>
            <p className="text-[10px] text-theme-muted hidden sm:block">Apple Silicon Local Studio</p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 p-1 bg-theme-subtle rounded-lg border border-theme-border">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => handleTabSelect(item.key)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === item.key
                  ? 'bg-theme-surface text-theme-primary shadow-sm'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-mono px-1 rounded-full bg-theme-accentSubtle text-theme-accentText">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Backend Status indicator */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-theme-subtle border border-theme-border text-xs">
            <Server className="w-3.5 h-3.5 text-theme-muted" />
            <span className="text-theme-secondary">API:</span>
            {backendOnline ? (
              <span className="flex items-center text-emerald-600 font-medium text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                :5000
              </span>
            ) : (
              <span className="flex items-center text-red-500 font-medium text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1"></span>
                Offline
              </span>
            )}
          </div>

          {/* ComfyUI Status Indicator */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-theme-subtle border border-theme-border text-xs">
            <Cpu className="w-3.5 h-3.5 text-theme-muted" />
            <span className="text-theme-secondary">ComfyUI:</span>
            {comfyUIStatus?.available ? (
              <span className="flex items-center text-emerald-600 font-medium text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>
                :8188
              </span>
            ) : (
              <span className="flex items-center text-amber-600 font-medium text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1"></span>
                Unreachable
              </span>
            )}
          </div>

          {/* Theme Picker Dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-theme-subtle hover:bg-theme-border border border-theme-border text-xs text-theme-primary transition-colors"
              title="Switch Studio Theme"
            >
              <Palette className="w-3.5 h-3.5 text-theme-accent" />
              <span className="capitalize font-medium text-[11px] hidden sm:inline">
                {THEMES.find(t => t.id === currentTheme)?.name || 'Theme'}
              </span>
            </button>

            <div className="absolute right-0 mt-1 w-44 rounded-lg bg-theme-surface border border-theme-border shadow-lg p-1 hidden group-hover:block hover:block z-50">
              <div className="text-[10px] uppercase font-mono px-2 py-1 text-theme-muted font-semibold">
                Select Theme
              </div>
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors ${
                    currentTheme === t.id
                      ? 'bg-theme-accentSubtle text-theme-accentText font-semibold'
                      : 'text-theme-primary hover:bg-theme-subtle'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full border border-theme-border flex-shrink-0"
                      style={{ backgroundColor: t.accent }}
                    />
                    <span>{t.name}</span>
                  </div>
                  {currentTheme === t.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Refresh Diagnostics */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh server status"
            className="p-1.5 rounded-md hover:bg-theme-subtle text-theme-muted hover:text-theme-primary transition-colors disabled:opacity-50 border border-transparent hover:border-theme-border"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-theme-accent' : ''}`} />
          </button>

          {/* Mobile Hamburger — visible only below md breakpoint */}
          <button
            aria-label="Open navigation menu"
            title="Navigation menu"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="md:hidden p-1.5 rounded-md hover:bg-theme-subtle text-theme-muted hover:text-theme-primary transition-colors border border-transparent hover:border-theme-border"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Dropdown — appears below header, above content */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-theme-surface border-b border-theme-border shadow-md z-20 px-2 py-2 space-y-1">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => handleTabSelect(item.key)}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.key
                  ? 'bg-theme-accentSubtle text-theme-accentText'
                  : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-subtle'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-theme-accentSubtle text-theme-accentText">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          {/* Status indicators in mobile menu */}
          <div className="flex items-center space-x-3 px-4 py-2 text-xs text-theme-muted border-t border-theme-border mt-1 pt-2">
            <span className={`flex items-center space-x-1 ${backendOnline ? 'text-emerald-600' : 'text-red-500'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              <span>API {backendOnline ? ':5000' : 'Offline'}</span>
            </span>
            <span className={`flex items-center space-x-1 ${comfyUIStatus?.available ? 'text-emerald-600' : 'text-amber-600'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${comfyUIStatus?.available ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span>ComfyUI {comfyUIStatus?.available ? ':8188' : 'Unreachable'}</span>
            </span>
          </div>
        </div>
      )}
    </>
  );
}
