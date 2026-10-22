import React, { useState } from 'react';
import {
  Plus,
  FolderTree,
  SlidersHorizontal,
  Package,
  Code2,
  Terminal,
  Bomb,
  Settings,
  ChevronDown,
  X,
  Play,
  Square,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { soundEngine } from '../engine/audio';
import { requestLandscapeMode } from '../engine/orientation';

interface MobileBottomDockProps {
  isPlayMode: boolean;
  onTogglePlayMode: () => void;
  onOpenSettings: () => void;
  onTriggerExplosion: () => void;
  onQuickInsertPart: () => void;
  activeDrawer: 'explorer' | 'properties' | 'toolbox' | 'script' | 'console' | null;
  onSetActiveDrawer: (drawer: 'explorer' | 'properties' | 'toolbox' | 'script' | 'console' | null) => void;
}

export const MobileBottomDock: React.FC<MobileBottomDockProps> = ({
  isPlayMode,
  onTogglePlayMode,
  onOpenSettings,
  onTriggerExplosion,
  onQuickInsertPart,
  activeDrawer,
  onSetActiveDrawer,
}) => {
  const toggleDrawer = (drawer: 'explorer' | 'properties' | 'toolbox' | 'script' | 'console') => {
    soundEngine.playClick();
    onSetActiveDrawer(activeDrawer === drawer ? null : drawer);
  };

  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40 max-w-[96vw] w-auto pointer-events-auto select-none">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e1e24]/95 backdrop-blur-md border border-neutral-700/80 rounded-2xl shadow-2xl">
        {/* Play / Stop Button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onTogglePlayMode();
          }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all ${
            isPlayMode
              ? 'bg-red-600 hover:bg-red-500 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {isPlayMode ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play (F5)</span>
            </>
          )}
        </button>

        <div className="w-px h-5 bg-neutral-700 mx-0.5" />

        {/* Quick Insert Part (When in Edit Mode) */}
        {!isPlayMode && (
          <button
            onClick={() => {
              soundEngine.playClick();
              onQuickInsertPart();
            }}
            className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-sky-400 border border-neutral-700/60"
            title="Add Block Part"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}

        {/* Explorer Drawer Toggle */}
        {!isPlayMode && (
          <button
            onClick={() => toggleDrawer('explorer')}
            className={`p-2 rounded-xl border transition-colors ${
              activeDrawer === 'explorer'
                ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border-neutral-700/60'
            }`}
            title="Explorer"
          >
            <FolderTree className="w-4 h-4" />
          </button>
        )}

        {/* Properties Drawer Toggle */}
        {!isPlayMode && (
          <button
            onClick={() => toggleDrawer('properties')}
            className={`p-2 rounded-xl border transition-colors ${
              activeDrawer === 'properties'
                ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border-neutral-700/60'
            }`}
            title="Properties"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        )}

        {/* Toolbox Drawer Toggle */}
        {!isPlayMode && (
          <button
            onClick={() => toggleDrawer('toolbox')}
            className={`p-2 rounded-xl border transition-colors ${
              activeDrawer === 'toolbox'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border-neutral-700/60'
            }`}
            title="Toolbox"
          >
            <Package className="w-4 h-4" />
          </button>
        )}

        {/* Console / Output */}
        {!isPlayMode && (
          <button
            onClick={() => toggleDrawer('console')}
            className={`p-2 rounded-xl border transition-colors ${
              activeDrawer === 'console'
                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border-neutral-700/60'
            }`}
            title="Output Console"
          >
            <Terminal className="w-4 h-4" />
          </button>
        )}

        {/* Physics Explosion Blast Button */}
        <button
          onClick={() => {
            soundEngine.playExplosion();
            onTriggerExplosion();
          }}
          className="p-2 rounded-xl bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-500/40"
          title="Blast Unanchored Parts"
        >
          <Bomb className="w-4 h-4" />
        </button>

        {/* Landscape Mode Button */}
        <button
          onClick={async () => {
            soundEngine.playClick();
            await requestLandscapeMode();
          }}
          className="p-2 rounded-xl bg-sky-950/70 hover:bg-sky-900 text-sky-400 border border-sky-500/40"
          title="Turn on Landscape Mode"
        >
          <Smartphone className="w-4 h-4 rotate-90" />
        </button>

        {/* App Settings */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenSettings();
          }}
          className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 border border-neutral-700/60"
          title="App Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
