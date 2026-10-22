import React, { useState } from 'react';
import {
  Play,
  Square,
  Box,
  Palette,
  Anchor,
  Shield,
  MousePointer,
  Move,
  Maximize2,
  RotateCw,
  Undo2,
  Redo2,
  Save,
  Globe,
  Upload,
  UserCheck,
  Code2,
  Zap,
  FolderOpen,
  Plus,
  Layers,
  ChevronDown,
  Smartphone,
  Monitor,
  Settings,
  Bomb,
} from 'lucide-react';
import { StudioTab, TransformMode, PartShape, PartMaterial } from '../types/roblox';
import { soundEngine } from '../engine/audio';
import { PWAInstallButton } from './PWAInstallButton';

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
  onOpenPlace: () => void;
  isConsoleOpen: boolean;
  onToggleConsole: () => void;
  isToolboxOpen: boolean;
  onToggleToolbox: () => void;
  isExplorerOpen: boolean;
  onToggleExplorer: () => void;
  isPropertiesOpen: boolean;
  onToggleProperties: () => void;
  uiMode?: 'mobile' | 'desktop' | 'auto';
  onToggleUIMode?: () => void;
  onOpenSettings?: () => void;
  onTriggerExplosion?: () => void;
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
  onOpenPlace,
  isConsoleOpen,
  onToggleConsole,
  isToolboxOpen,
  onToggleToolbox,
  isExplorerOpen,
  onToggleExplorer,
  isPropertiesOpen,
  onToggleProperties,
  uiMode = 'auto',
  onToggleUIMode,
  onOpenSettings,
  onTriggerExplosion,
}) => {
  const [isPartMenuOpen, setIsPartMenuOpen] = useState(false);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [isMaterialMenuOpen, setIsMaterialMenuOpen] = useState(false);
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);

  // Standard Roblox Studio BrickColors
  const colors = [
    { name: 'Really Red', hex: '#ff0000' },
    { name: 'Bright Blue', hex: '#0055ff' },
    { name: 'Lime Green', hex: '#00ff00' },
    { name: 'Bright Yellow', hex: '#ffff00' },
    { name: 'Bright Orange', hex: '#ff6600' },
    { name: 'Royal Purple', hex: '#aa00ff' },
    { name: 'Hot Pink', hex: '#ff0088' },
    { name: 'Medium Stone Grey', hex: '#6b7280' },
    { name: 'Dark Stone Grey', hex: '#374151' },
    { name: 'Black', hex: '#111827' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Sand Green', hex: '#708a70' },
    { name: 'Rust', hex: '#8a4025' },
    { name: 'Cyan / Teal', hex: '#00d4ff' },
    { name: 'Gold', hex: '#eab308' },
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
    'Ice',
  ];

  return (
    <div className="bg-[#242429] border-b border-[#36363d] text-neutral-200 select-none flex flex-col shrink-0">
      {/* 1. Desktop Window Top Bar */}
      <div className="h-7 px-2 flex items-center justify-between border-b border-[#1c1c20] text-xs bg-[#1a1a1e]">
        {/* Quick Access Toolbar */}
        <div className="flex items-center gap-1.5">
          {/* Roblox Tilt Logo / File Menu */}
          <div className="relative">
            <button
              onClick={() => setIsFileMenuOpen(!isFileMenuOpen)}
              className="flex items-center gap-1 px-1.5 py-0.5 hover:bg-neutral-800 rounded transition-colors"
            >
              <div className="w-4 h-4 bg-[#00a2ff] rounded flex items-center justify-center transform -rotate-12 shadow">
                <div className="w-1.5 h-1.5 bg-white rounded-2xs transform rotate-12" />
              </div>
              <span className="font-bold text-white text-[11px] ml-1">File</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {/* File Dropdown */}
            {isFileMenuOpen && (
              <div
                className="absolute top-7 left-0 w-52 bg-[#1e1e24] border border-[#3a3a44] rounded shadow-2xl py-1 z-50 text-xs flex flex-col font-sans"
                onMouseLeave={() => setIsFileMenuOpen(false)}
              >
                <button
                  onClick={() => {
                    setIsFileMenuOpen(false);
                    onOpenGamesGallery();
                  }}
                  className="px-3 py-1.5 hover:bg-[#00a2ff] hover:text-white flex items-center justify-between text-neutral-200"
                >
                  <span className="flex items-center gap-2">
                    <FolderOpen className="w-3.5 h-3.5" />
                    Open from Roblox...
                  </span>
                  <span className="text-[10px] text-neutral-400">Ctrl+O</span>
                </button>
                <button
                  onClick={() => {
                    setIsFileMenuOpen(false);
                    onSavePlace();
                  }}
                  className="px-3 py-1.5 hover:bg-[#00a2ff] hover:text-white flex items-center justify-between text-neutral-200"
                >
                  <span className="flex items-center gap-2">
                    <Save className="w-3.5 h-3.5" />
                    Save to File...
                  </span>
                  <span className="text-[10px] text-neutral-400">Ctrl+S</span>
                </button>
                <div className="h-px bg-neutral-700 my-1" />
                <button
                  onClick={() => {
                    setIsFileMenuOpen(false);
                    onPublishClick();
                  }}
                  className="px-3 py-1.5 hover:bg-[#00a2ff] hover:text-white flex items-center justify-between text-neutral-200"
                >
                  <span className="flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5" />
                    Publish to Roblox...
                  </span>
                  <span className="text-[10px] text-neutral-400">Alt+P</span>
                </button>
              </div>
            )}
          </div>

          <div className="h-3.5 w-px bg-neutral-700 mx-1" />

          {/* Quick Access Tools */}
          <button
            onClick={onSavePlace}
            className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
            title="Save Place (Ctrl+S)"
          >
            <Save className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onUndo}
            className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Experience Name */}
        <div className="text-[11px] font-semibold text-neutral-300 pointer-events-none truncate max-w-sm">
          Roblox Studio - Place1
        </div>

        {/* Right Section: Publish, Android PWA & Account */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <PWAInstallButton />

          <button
            onClick={onOpenGamesGallery}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 text-[11px] font-medium"
          >
            <Globe className="w-3 h-3 text-sky-400" />
            <span>Discover</span>
          </button>

          <button
            onClick={onPublishClick}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 rounded bg-[#00a2ff] hover:bg-[#0092e6] text-white text-[11px] font-semibold shadow-xs"
          >
            <Upload className="w-3 h-3" />
            <span className="hidden xs:inline">Publish</span>
          </button>

          {/* Android vs Desktop UI Toggle */}
          {onToggleUIMode && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onToggleUIMode();
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-sky-950/70 hover:bg-sky-900 border border-sky-500/40 text-sky-300 text-[11px] font-semibold transition-colors"
              title="Toggle Android / Desktop Interface"
            >
              {uiMode === 'mobile' ? (
                <>
                  <Smartphone className="w-3 h-3 text-sky-400" />
                  <span className="hidden sm:inline">📱 Android</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3 h-3 text-sky-400" />
                  <span className="hidden sm:inline">💻 Desktop</span>
                </>
              )}
            </button>
          )}

          {/* App Settings & Realistic Physics Button */}
          {onOpenSettings && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenSettings();
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-[11px] font-semibold transition-colors"
              title="Roblox App Settings & Realistic Modules"
            >
              <Settings className="w-3 h-3 text-amber-400" />
              <span className="hidden md:inline">Settings</span>
            </button>
          )}

          <div className="h-3.5 w-px bg-neutral-700 mx-0.5 hidden sm:block" />

          {/* User badge */}
          <div className="flex items-center gap-1.5 pl-1">
            <div className="w-5 h-5 rounded bg-amber-500 flex items-center justify-center font-bold text-[10px] text-neutral-900 border border-amber-300">
              R
            </div>
            <span className="text-[11px] font-medium text-neutral-300">nitinkumar14668</span>
          </div>
        </div>
      </div>

      {/* 2. Ribbon Tabs */}
      <div className="flex items-center px-2 bg-[#26262b] border-b border-[#1c1c20] text-xs font-medium overflow-x-auto">
        {(['home', 'model', 'test', 'view', 'plugins'] as StudioTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              soundEngine.playClick();
              onTabChange(tab);
            }}
            className={`px-3.5 py-1 capitalize transition-colors font-semibold text-[11px] ${
              activeTab === tab
                ? 'bg-[#323238] text-white border-b-2 border-[#00a2ff]'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Ribbon Toolstrip (Exact Studio Height & Density) */}
      <div className="h-22 px-3 flex items-center gap-3 overflow-x-auto bg-[#323238] border-b border-[#1f1f23]">
        {/* Test / Simulation Section (Play / Stop) */}
        <div className="flex flex-col items-center justify-center pr-3 border-r border-[#40404a]">
          <button
            onClick={() => {
              soundEngine.playClick();
              onTogglePlayMode();
            }}
            className={`flex flex-col items-center justify-center w-13 h-14 rounded-md font-bold text-[11px] transition-all shadow-sm ${
              isPlayMode
                ? 'bg-[#e11d48] hover:bg-[#be123c] text-white'
                : 'bg-[#15803d] hover:bg-[#166534] text-white'
            }`}
          >
            {isPlayMode ? (
              <>
                <Square className="w-5 h-5 fill-current mb-0.5" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current mb-0.5" />
                <span>Play</span>
              </>
            )}
          </button>
          <span className="text-[9px] text-neutral-400 mt-0.5 font-medium">F5</span>
        </div>

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="flex items-center gap-3">
            {/* Transform Tools: Select, Move, Scale, Rotate */}
            <div className="flex flex-col gap-1 pr-3 border-r border-[#40404a]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onTransformModeChange('select')}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    transformMode === 'select'
                      ? 'bg-[#00a2ff] text-white'
                      : 'bg-[#29292e] hover:bg-[#383840] text-neutral-300'
                  }`}
                  title="Select (1)"
                >
                  <MousePointer className="w-3.5 h-3.5" />
                  <span>Select</span>
                </button>
                <button
                  onClick={() => onTransformModeChange('move')}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    transformMode === 'move'
                      ? 'bg-[#00a2ff] text-white'
                      : 'bg-[#29292e] hover:bg-[#383840] text-neutral-300'
                  }`}
                  title="Move (2)"
                >
                  <Move className="w-3.5 h-3.5" />
                  <span>Move</span>
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onTransformModeChange('scale')}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    transformMode === 'scale'
                      ? 'bg-[#00a2ff] text-white'
                      : 'bg-[#29292e] hover:bg-[#383840] text-neutral-300'
                  }`}
                  title="Scale (3)"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Scale</span>
                </button>
                <button
                  onClick={() => onTransformModeChange('rotate')}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    transformMode === 'rotate'
                      ? 'bg-[#00a2ff] text-white'
                      : 'bg-[#29292e] hover:bg-[#383840] text-neutral-300'
                  }`}
                  title="Rotate (4)"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate</span>
                </button>
              </div>
            </div>

            {/* Part Insertion Dropdown */}
            <div className="relative pr-3 border-r border-[#40404a] flex flex-col items-center">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsPartMenuOpen(!isPartMenuOpen);
                }}
                className="flex flex-col items-center justify-center p-1.5 rounded bg-[#29292e] hover:bg-[#383840] border border-[#40404a] text-xs w-16"
              >
                <Box className="w-5 h-5 text-sky-400 mb-0.5" />
                <span className="font-semibold text-[11px]">Part ▾</span>
              </button>

              {isPartMenuOpen && (
                <div
                  className="absolute top-16 left-0 w-48 bg-[#1e1e24] border border-[#3a3a44] rounded shadow-2xl p-1 z-50 text-xs flex flex-col gap-0.5"
                  onMouseLeave={() => setIsPartMenuOpen(false)}
                >
                  <button
                    onClick={() => {
                      onInsertPart('Block');
                      setIsPartMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#2b2b33] rounded text-left text-neutral-200"
                  >
                    <div className="w-3 h-3 bg-neutral-400 rounded-xs" />
                    <span>Block</span>
                  </button>
                  <button
                    onClick={() => {
                      onInsertPart('Sphere');
                      setIsPartMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#2b2b33] rounded text-left text-neutral-200"
                  >
                    <div className="w-3 h-3 bg-sky-400 rounded-full" />
                    <span>Sphere</span>
                  </button>
                  <button
                    onClick={() => {
                      onInsertPart('Cylinder');
                      setIsPartMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#2b2b33] rounded text-left text-neutral-200"
                  >
                    <div className="w-3 h-3 bg-amber-400 rounded-xs" />
                    <span>Cylinder</span>
                  </button>
                  <button
                    onClick={() => {
                      onInsertPart('Wedge');
                      setIsPartMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#2b2b33] rounded text-left text-neutral-200"
                  >
                    <div className="w-3 h-3 bg-emerald-400" />
                    <span>Wedge</span>
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
                    <span>🔥 Lava Hazard</span>
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
                    <span>⚡ Trampoline Pad</span>
                  </button>
                </div>
              )}
            </div>

            {/* Material & Color Pickers */}
            <div className="flex items-center gap-2 pr-3 border-r border-[#40404a]">
              {/* Color Button */}
              <div className="relative">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setIsColorMenuOpen(!isColorMenuOpen);
                    setIsMaterialMenuOpen(false);
                  }}
                  className="flex flex-col items-center justify-center p-1.5 rounded bg-[#29292e] hover:bg-[#383840] border border-[#40404a] text-xs w-16"
                >
                  <Palette className="w-5 h-5 text-amber-400 mb-0.5" />
                  <span className="font-semibold text-[11px]">Color ▾</span>
                </button>
                {isColorMenuOpen && (
                  <div
                    className="absolute top-16 left-0 bg-[#1e1e24] border border-[#3a3a44] rounded shadow-2xl p-2 z-50 grid grid-cols-5 gap-1.5 w-48"
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
                  className="flex flex-col items-center justify-center p-1.5 rounded bg-[#29292e] hover:bg-[#383840] border border-[#40404a] text-xs w-18"
                >
                  <Layers className="w-5 h-5 text-purple-400 mb-0.5" />
                  <span className="font-semibold text-[11px]">Material ▾</span>
                </button>
                {isMaterialMenuOpen && (
                  <div
                    className="absolute top-16 left-0 bg-[#1e1e24] border border-[#3a3a44] rounded shadow-2xl p-1 z-50 flex flex-col gap-0.5 w-36 text-xs"
                    onMouseLeave={() => setIsMaterialMenuOpen(false)}
                  >
                    {materials.map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          onSelectMaterial(m);
                          setIsMaterialMenuOpen(false);
                        }}
                        className="px-2.5 py-1 text-left rounded hover:bg-[#2b2b33] text-neutral-200"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mechanics Toggles: Anchor & CanCollide */}
            <div className="flex flex-col gap-1 pr-3 border-r border-[#40404a]">
              <button
                onClick={onToggleAnchored}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  anchored
                    ? 'bg-[#273244] text-[#38bdf8] border border-[#0284c7]'
                    : 'bg-[#29292e] text-neutral-400 border border-[#3d3d46]'
                }`}
                title="Lock part in 3D coordinates"
              >
                <Anchor className="w-3.5 h-3.5" />
                <span>Anchor: {anchored ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={onToggleCanCollide}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  canCollide
                    ? 'bg-[#1e342a] text-[#4ade80] border border-[#16a34a]'
                    : 'bg-[#29292e] text-neutral-400 border border-[#3d3d46]'
                }`}
                title="Avatar physically collides with part"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Collide: {canCollide ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Quick Insert Rigs & Scripts */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onInsertNPC}
                className="flex flex-col items-center justify-center p-1.5 rounded bg-[#29292e] hover:bg-[#383840] border border-[#40404a] text-xs w-16"
                title="Insert Classic R6 Character Rig"
              >
                <UserCheck className="w-5 h-5 text-emerald-400 mb-0.5" />
                <span className="text-[11px] font-medium">NPC Rig</span>
              </button>

              <button
                onClick={onInsertScript}
                className="flex flex-col items-center justify-center p-1.5 rounded bg-[#29292e] hover:bg-[#383840] border border-[#40404a] text-xs w-16"
                title="Insert Luau Script into Workspace"
              >
                <Code2 className="w-5 h-5 text-yellow-400 mb-0.5" />
                <span className="text-[11px] font-medium">Script</span>
              </button>
            </div>
          </div>
        )}

        {/* MODEL TAB */}
        {activeTab === 'model' && (
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1 pr-3 border-r border-[#40404a]">
              <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                Grid Snapping
              </span>
              <div className="flex items-center gap-1">
                {[0.2, 1, 2, 4].map((snap) => (
                  <button
                    key={snap}
                    onClick={() => onGridSnapChange(snap)}
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      gridSnap === snap
                        ? 'bg-[#00a2ff] text-white'
                        : 'bg-[#29292e] text-neutral-300 hover:bg-[#383840]'
                    }`}
                  >
                    {snap} Stud
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TEST TAB */}
        {activeTab === 'test' && (
          <div className="flex items-center gap-3">
            <button
              onClick={onTogglePlayMode}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isPlayMode ? 'Stop Simulation' : 'Play (F5)'}</span>
            </button>
          </div>
        )}

        {/* VIEW TAB */}
        {activeTab === 'view' && (
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleExplorer}
              className={`px-3 py-1.5 rounded text-xs font-medium border ${
                isExplorerOpen
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-[#29292e] text-neutral-400 border-neutral-700'
              }`}
            >
              Explorer
            </button>
            <button
              onClick={onToggleProperties}
              className={`px-3 py-1.5 rounded text-xs font-medium border ${
                isPropertiesOpen
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-[#29292e] text-neutral-400 border-neutral-700'
              }`}
            >
              Properties
            </button>
            <button
              onClick={onToggleToolbox}
              className={`px-3 py-1.5 rounded text-xs font-medium border ${
                isToolboxOpen
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-[#29292e] text-neutral-400 border-neutral-700'
              }`}
            >
              Toolbox
            </button>
            <button
              onClick={onToggleConsole}
              className={`px-3 py-1.5 rounded text-xs font-medium border ${
                isConsoleOpen
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-[#29292e] text-neutral-400 border-neutral-700'
              }`}
            >
              Output
            </button>
          </div>
        )}

        {/* PLUGINS TAB */}
        {activeTab === 'plugins' && (
          <div className="flex items-center gap-3">
            <button
              onClick={onInsertScript}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#29292e] hover:bg-[#383840] text-neutral-200 border border-[#40404a] rounded text-xs"
            >
              <Code2 className="w-4 h-4 text-amber-400" />
              <span>Luau Script Helper</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
