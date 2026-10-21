import React, { useState } from 'react';
import {
  Play,
  Square,
  Pause,
  Upload,
  Layers,
  Box,
  Palette,
  Anchor,
  Shield,
  MousePointer,
  Move,
  Maximize2,
  RotateCw,
  FolderPlus,
  Undo2,
  Redo2,
  Save,
  Globe,
  Settings,
  Sun,
  Code2,
  Grid,
  Bot,
  UserCheck,
  Zap,
} from 'lucide-react';
import { StudioTab, TransformMode, PartShape, PartMaterial } from '../types/roblox';
import { soundEngine } from '../engine/audio';

interface RibbonBarProps {
  activeTab: StudioTab;
  onTabChange: (tab: StudioTab) => void;
  transformMode: TransformMode;
  onTransformModeChange: (mode: TransformMode) => void;
  isPlayMode: boolean;
  onTogglePlayMode: () => void;
  onInsertPart: (shape: PartShape, specialType?: 'lava' | 'coin' | 'jumpPad' | 'speedPad' | 'spawn') => void;
  onInsertNPC: () => void;
  onInsertScript: () => void;
  onPublishClick: () => void;
  onOpenGamesGallery: () => void;
  onOpenVercelDeploy: () => void;
  gridSnap: number;
  onGridSnapChange: (snap: number) => void;
  anchored: boolean;
  onToggleAnchored: () => void;
  canCollide: boolean;
  onToggleCanCollide: () => void;
  onSelectColor: (color: string) => void;
  onSelectMaterial: (mat: PartMaterial) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSavePlace: () => void;
  onQuickGenerate: (type: 'obby' | 'arena' | 'castle') => void;
  isConsoleOpen: boolean;
  onToggleConsole: () => void;
  isToolboxOpen: boolean;
  onToggleToolbox: () => void;
  isExplorerOpen: boolean;
  onToggleExplorer: () => void;
  isPropertiesOpen: boolean;
  onToggleProperties: () => void;
  isScriptEditorOpen: boolean;
  onToggleScriptEditor: () => void;
}

export const RibbonBar: React.FC<RibbonBarProps> = ({
  activeTab,
  onTabChange,
  transformMode,
  onTransformModeChange,
  isPlayMode,
  onTogglePlayMode,
  onInsertPart,
  onInsertNPC,
  onInsertScript,
  onPublishClick,
  onOpenGamesGallery,
  onOpenVercelDeploy,
  gridSnap,
  onGridSnapChange,
  anchored,
  onToggleAnchored,
  canCollide,
  onToggleCanCollide,
  onSelectColor,
  onSelectMaterial,
  onUndo,
  onRedo,
  onSavePlace,
  onQuickGenerate,
  isConsoleOpen,
  onToggleConsole,
  isToolboxOpen,
  onToggleToolbox,
  isExplorerOpen,
  onToggleExplorer,
  isPropertiesOpen,
  onToggleProperties,
  isScriptEditorOpen,
  onToggleScriptEditor,
}) => {
  const [isPartMenuOpen, setIsPartMenuOpen] = useState(false);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [isMaterialMenuOpen, setIsMaterialMenuOpen] = useState(false);

  const colors = [
    { name: 'Really Red', hex: '#ef4444' },
    { name: 'Bright Blue', hex: '#0284c7' },
    { name: 'Lime Green', hex: '#22c55e' },
    { name: 'Bright Yellow', hex: '#eab308' },
    { name: 'White', hex: '#f8fafc' },
    { name: 'Black', hex: '#0f172a' },
    { name: 'Medium Stone Grey', hex: '#64748b' },
    { name: 'Neon Orange', hex: '#f97316' },
    { name: 'Royal Purple', hex: '#9333ea' },
    { name: 'Hot Pink', hex: '#ec4899' },
  ];

  const materials: PartMaterial[] = [
    'Plastic',
    'SmoothPlastic',
    'Neon',
    'Wood',
    'Metal',
    'Grass',
    'Brick',
    'Glass',
  ];

  return (
    <div className="bg-[#222226] border-b border-neutral-700/80 text-neutral-200 select-none">
      {/* Very Top Bar: Title & Quick Actions */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-neutral-800/80 text-xs bg-[#1a1a1e]">
        <div className="flex items-center gap-3">
          {/* Roblox Tilt Logo */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#00a2ff] rounded flex items-center justify-center transform -rotate-12 shadow">
              <div className="w-2 h-2 bg-white rounded-xs transform rotate-12" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white">Roblox Studio</span>
            <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-semibold text-[10px] border border-sky-500/30">
              WEB EXE
            </span>
          </div>

          <div className="h-4 w-px bg-neutral-700 mx-1" />

          {/* Quick Access Icons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                soundEngine.playClick();
                onUndo();
              }}
              className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                onRedo();
              }}
              className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                onSavePlace();
              }}
              className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
              title="Save Place to Local File"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right quick buttons */}
        <div className="flex items-center gap-2">
          {/* Vercel Deploy Helper Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenVercelDeploy();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black hover:bg-neutral-900 text-white border border-neutral-700 font-semibold text-[11px] transition-colors shadow-xs"
            title="Deploy to Vercel"
          >
            <svg className="w-3 h-3 fill-white" viewBox="0 0 76 65">
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
            <span>Deploy to Vercel</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenGamesGallery();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-medium text-[11px] transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>Discover Games</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onPublishClick();
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#00a2ff] hover:bg-[#0091e6] text-white font-semibold text-[11px] shadow-sm transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Publish to Roblox</span>
          </button>

          <div className="h-4 w-px bg-neutral-700 mx-1" />

          <div className="flex items-center gap-2 pl-1">
            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center font-bold text-[11px] text-neutral-900 border border-amber-300">
              R
            </div>
            <span className="text-[11px] font-medium text-neutral-300 hidden sm:inline">nitinkumar14668</span>
          </div>
        </div>
      </div>

      {/* Ribbon Tabs Header */}
      <div className="flex items-center px-2 bg-[#222226] border-b border-neutral-800 text-[12px] font-medium">
        {(['home', 'model', 'test', 'view', 'plugins'] as StudioTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              soundEngine.playClick();
              onTabChange(tab);
            }}
            className={`px-4 py-1.5 capitalize transition-colors border-b-2 font-medium ${
              activeTab === tab
                ? 'border-[#00a2ff] text-white bg-[#2b2b30]'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Ribbon Content Bar */}
      <div className="h-20 px-3 flex items-center gap-3 overflow-x-auto bg-[#2b2b30]">
        {/* Play / Stop Simulation Section - Always Visible on Left */}
        <div className="flex flex-col items-center justify-center px-3 border-r border-neutral-700/60">
          <button
            onClick={() => {
              soundEngine.playClick();
              onTogglePlayMode();
            }}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg font-bold text-[11px] transition-all ${
              isPlayMode
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
            }`}
          >
            {isPlayMode ? (
              <>
                <Square className="w-6 h-6 fill-current mb-0.5" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-current mb-0.5" />
                <span>Play</span>
              </>
            )}
          </button>
          <span className="text-[10px] text-neutral-400 mt-1">F5 Test</span>
        </div>

        {/* HOME TAB CONTENT */}
        {activeTab === 'home' && (
          <div className="flex items-center gap-4">
            {/* Tools Group: Select, Move, Scale, Rotate */}
            <div className="flex flex-col gap-1 pr-3 border-r border-neutral-700/60">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onTransformModeChange('select');
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                    transformMode === 'select'
                      ? 'bg-[#00a2ff] text-white'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                  }`}
                  title="Select Tool"
                >
                  <MousePointer className="w-3.5 h-3.5" />
                  <span>Select</span>
                </button>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onTransformModeChange('move');
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                    transformMode === 'move'
                      ? 'bg-[#00a2ff] text-white'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                  }`}
                  title="Move Tool"
                >
                  <Move className="w-3.5 h-3.5" />
                  <span>Move</span>
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onTransformModeChange('scale');
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                    transformMode === 'scale'
                      ? 'bg-[#00a2ff] text-white'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                  }`}
                  title="Scale Tool"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Scale</span>
                </button>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onTransformModeChange('rotate');
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                    transformMode === 'rotate'
                      ? 'bg-[#00a2ff] text-white'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                  }`}
                  title="Rotate Tool"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate</span>
                </button>
              </div>
            </div>

            {/* Part Inserter Dropdown */}
            <div className="relative pr-3 border-r border-neutral-700/60 flex flex-col items-center">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsPartMenuOpen(!isPartMenuOpen);
                }}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs w-16"
              >
                <Box className="w-5 h-5 text-sky-400 mb-0.5" />
                <span className="font-semibold text-[11px]">Part ▾</span>
              </button>

              {isPartMenuOpen && (
                <div
                  className="absolute top-16 left-0 w-44 bg-[#1e1e24] border border-neutral-700 rounded-lg shadow-2xl p-1 z-50 text-xs flex flex-col gap-0.5"
                  onMouseLeave={() => setIsPartMenuOpen(false)}
                >
                  <button
                    onClick={() => {
                      onInsertPart('Block');
                      setIsPartMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-800 rounded text-left text-neutral-200"
                  >
                    <div className="w-3 h-3 bg-slate-400 rounded-xs" />
                    <span>Block Part</span>
                  </button>
                  <button
                    onClick={() => {
                      onInsertPart('Sphere');
                      setIsPartMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-800 rounded text-left text-neutral-200"
                  >
                    <div className="w-3 h-3 bg-sky-400 rounded-full" />
                    <span>Sphere Part</span>
                  </button>
                  <button
                    onClick={() => {
                      onInsertPart('Cylinder');
                      setIsPartMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-800 rounded text-left text-neutral-200"
                  >
                    <div className="w-3 h-3 bg-amber-400 rounded-xs" />
                    <span>Cylinder Part</span>
                  </button>
                  <button
                    onClick={() => {
                      onInsertPart('Wedge');
                      setIsPartMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-800 rounded text-left text-neutral-200"
                  >
                    <div className="w-3 h-3 bg-emerald-400" />
                    <span>Wedge Part</span>
                  </button>
                  <div className="h-px bg-neutral-700 my-1" />
                  <button
                    onClick={() => {
                      onInsertPart('Block', 'spawn');
                      setIsPartMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-sky-600/30 rounded text-left text-sky-300 font-semibold"
                  >
                    <span>★ SpawnLocation</span>
                  </button>
                  <button
                    onClick={() => {
                      onInsertPart('Block', 'lava');
                      setIsPartMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-600/30 rounded text-left text-red-400 font-semibold"
                  >
                    <span>🔥 Lava Kill Brick</span>
                  </button>
                  <button
                    onClick={() => {
                      onInsertPart('Cylinder', 'coin');
                      setIsPartMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-yellow-600/30 rounded text-left text-amber-300 font-semibold"
                  >
                    <span>🪙 Coin Collectible</span>
                  </button>
                  <button
                    onClick={() => {
                      onInsertPart('Cylinder', 'jumpPad');
                      setIsPartMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-pink-600/30 rounded text-left text-pink-400 font-semibold"
                  >
                    <span>⚡ Trampoline Jump Pad</span>
                  </button>
                </div>
              )}
            </div>

            {/* Material & Color Pickers */}
            <div className="flex items-center gap-2 pr-3 border-r border-neutral-700/60">
              {/* Color Button */}
              <div className="relative">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setIsColorMenuOpen(!isColorMenuOpen);
                    setIsMaterialMenuOpen(false);
                  }}
                  className="flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs w-16"
                >
                  <Palette className="w-5 h-5 text-amber-400 mb-0.5" />
                  <span className="font-semibold text-[11px]">Color ▾</span>
                </button>
                {isColorMenuOpen && (
                  <div
                    className="absolute top-16 left-0 bg-[#1e1e24] border border-neutral-700 rounded-lg shadow-2xl p-2 z-50 grid grid-cols-5 gap-1.5 w-44"
                    onMouseLeave={() => setIsColorMenuOpen(false)}
                  >
                    {colors.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => {
                          onSelectColor(c.hex);
                          setIsColorMenuOpen(false);
                        }}
                        style={{ backgroundColor: c.hex }}
                        className="w-7 h-7 rounded border border-white/20 hover:scale-110 transition-transform shadow"
                        title={c.name}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Material Button */}
              <div className="relative">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setIsMaterialMenuOpen(!isMaterialMenuOpen);
                    setIsColorMenuOpen(false);
                  }}
                  className="flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs w-18"
                >
                  <Layers className="w-5 h-5 text-purple-400 mb-0.5" />
                  <span className="font-semibold text-[11px]">Material ▾</span>
                </button>
                {isMaterialMenuOpen && (
                  <div
                    className="absolute top-16 left-0 bg-[#1e1e24] border border-neutral-700 rounded-lg shadow-2xl p-1 z-50 flex flex-col gap-0.5 w-36 text-xs"
                    onMouseLeave={() => setIsMaterialMenuOpen(false)}
                  >
                    {materials.map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          onSelectMaterial(m);
                          setIsMaterialMenuOpen(false);
                        }}
                        className="px-2.5 py-1 text-left rounded hover:bg-neutral-800 text-neutral-200"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Physics & Properties Toggles */}
            <div className="flex flex-col gap-1 pr-3 border-r border-neutral-700/60">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onToggleAnchored();
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
                  anchored
                    ? 'bg-neutral-700 text-sky-400 font-bold border border-sky-500/50'
                    : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                }`}
                title="Anchored: Locks part in 3D space"
              >
                <Anchor className="w-3.5 h-3.5" />
                <span>Anchor: {anchored ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  onToggleCanCollide();
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
                  canCollide
                    ? 'bg-neutral-700 text-emerald-400 font-bold border border-emerald-500/50'
                    : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                }`}
                title="CanCollide: Avatar collides with part"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Collide: {canCollide ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Quick NPC / Script Spawn */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onInsertNPC();
                }}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs w-16"
                title="Insert Roblox NPC Dummy"
              >
                <UserCheck className="w-5 h-5 text-emerald-400 mb-0.5" />
                <span className="text-[11px] font-semibold">NPC Rig</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  onInsertScript();
                }}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs w-16"
                title="Insert Roblox Lua Script"
              >
                <Code2 className="w-5 h-5 text-yellow-400 mb-0.5" />
                <span className="text-[11px] font-semibold">Script</span>
              </button>
            </div>
          </div>
        )}

        {/* MODEL TAB CONTENT */}
        {activeTab === 'model' && (
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1 pr-3 border-r border-neutral-700/60">
              <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Snap to Grid</span>
              <div className="flex items-center gap-1">
                {[0.2, 1, 2, 4].map((snap) => (
                  <button
                    key={snap}
                    onClick={() => {
                      soundEngine.playClick();
                      onGridSnapChange(snap);
                    }}
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      gridSnap === snap ? 'bg-sky-500 text-white' : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {snap} Stud
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pr-3 border-r border-neutral-700/60">
              <button
                onClick={() => onQuickGenerate('obby')}
                className="flex flex-col items-center p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs"
              >
                <Zap className="w-5 h-5 text-amber-400 mb-0.5" />
                <span>Add Obby Stage</span>
              </button>
              <button
                onClick={() => onQuickGenerate('castle')}
                className="flex flex-col items-center p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs"
              >
                <Box className="w-5 h-5 text-indigo-400 mb-0.5" />
                <span>Tower Platform</span>
              </button>
            </div>
          </div>
        )}

        {/* TEST TAB CONTENT */}
        {activeTab === 'test' && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pr-3 border-r border-neutral-700/60">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onTogglePlayMode();
                }}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isPlayMode ? 'Stop Test' : 'Run Avatar Test (F5)'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <span>WASD to Walk, Space to Jump, Right-Click Drag to Orbit Camera</span>
            </div>
          </div>
        )}

        {/* VIEW TAB CONTENT */}
        {activeTab === 'view' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundEngine.playClick();
                onToggleExplorer();
              }}
              className={`px-3 py-2 rounded-lg text-xs font-medium border ${
                isExplorerOpen
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}
            >
              Explorer
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                onToggleProperties();
              }}
              className={`px-3 py-2 rounded-lg text-xs font-medium border ${
                isPropertiesOpen
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}
            >
              Properties
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                onToggleToolbox();
              }}
              className={`px-3 py-2 rounded-lg text-xs font-medium border ${
                isToolboxOpen
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}
            >
              Toolbox
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                onToggleConsole();
              }}
              className={`px-3 py-2 rounded-lg text-xs font-medium border ${
                isConsoleOpen
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}
            >
              Output Console
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                onToggleScriptEditor();
              }}
              className={`px-3 py-2 rounded-lg text-xs font-medium border ${
                isScriptEditorOpen
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}
            >
              Script Editor
            </button>
          </div>
        )}

        {/* PLUGINS TAB CONTENT */}
        {activeTab === 'plugins' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundEngine.playClick();
                onQuickGenerate('obby');
              }}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg text-xs shadow hover:opacity-95"
            >
              <Bot className="w-4 h-4" />
              <span>AI Obby Generator</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                onInsertScript();
              }}
              className="flex items-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg text-xs"
            >
              <Code2 className="w-4 h-4 text-amber-400" />
              <span>Lua Script Assistant</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
