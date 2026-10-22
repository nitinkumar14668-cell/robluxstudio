import React from 'react';
import { MinecraftBlockType, TransformMode } from '../types/roblox';
import { soundEngine } from '../engine/audio';
import { Hammer, Pickaxe, Edit3, MousePointer, Sparkles, Trash2 } from 'lucide-react';

export interface HotbarBlockItem {
  type: MinecraftBlockType;
  name: string;
  icon: string;
  color: string;
  badge?: string;
}

export const MINECRAFT_BLOCKS: HotbarBlockItem[] = [
  { type: 'grass', name: 'Grass', icon: '🟩', color: '#55c23e' },
  { type: 'dirt', name: 'Dirt', icon: '🟫', color: '#866043' },
  { type: 'cobblestone', name: 'Cobble', icon: '🪨', color: '#6b6b6b' },
  { type: 'wood', name: 'Planks', icon: '🪵', color: '#b88755' },
  { type: 'brick', name: 'Brick', icon: '🧱', color: '#8f3328' },
  { type: 'glass', name: 'Glass', icon: '🪟', color: '#bae6fd' },
  { type: 'diamond', name: 'Diamond', icon: '💎', color: '#22d3ee' },
  { type: 'gold', name: 'Gold', icon: '🟡', color: '#facc15' },
  { type: 'tnt', name: 'TNT', icon: '🧨', color: '#ef4444', badge: 'BOOM' },
];

interface MinecraftHotbarProps {
  activeBlock: MinecraftBlockType;
  onSelectBlock: (type: MinecraftBlockType) => void;
  transformMode: TransformMode;
  onSetTransformMode: (mode: TransformMode) => void;
  isPlayMode: boolean;
  selectedBlockId: string | null;
  onOpenStructureEditor: () => void;
}

export const MinecraftHotbar: React.FC<MinecraftHotbarProps> = ({
  activeBlock,
  onSelectBlock,
  transformMode,
  onSetTransformMode,
  isPlayMode,
  selectedBlockId,
  onOpenStructureEditor,
}) => {
  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 max-w-[96vw] w-auto pointer-events-auto select-none flex flex-col items-center gap-1.5 font-sans">
      {/* Tool Selector Bar: Place (Build), Mine (Tap & Drag Break), Edit (Full Customizer), Select */}
      <div className="flex items-center gap-1.5 bg-[#18181f]/95 backdrop-blur-md px-2.5 py-1 rounded-2xl border border-neutral-700/80 shadow-2xl">
        <button
          onClick={() => {
            soundEngine.playClick();
            onSetTransformMode('place');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
            transformMode === 'place'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 scale-105'
              : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/50'
          }`}
          title="Place Block (Click to attach to face)"
        >
          <Hammer className="w-3.5 h-3.5" />
          <span>Place (B)</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onSetTransformMode('mine');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
            transformMode === 'mine'
              ? 'bg-red-600 text-white shadow-lg shadow-red-900/40 scale-105 animate-pulse'
              : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/50'
          }`}
          title="Mine / Break (Tap & Drag across blocks to remove)"
        >
          <Pickaxe className="w-3.5 h-3.5" />
          <span>Mine / Drag Break (X)</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onSetTransformMode('select');
            if (selectedBlockId) {
              onOpenStructureEditor();
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
            transformMode === 'select'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/40'
              : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/50'
          }`}
          title="Select & Full Edit Structure"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Block</span>
        </button>

        {selectedBlockId && (
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenStructureEditor();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs transition-colors shadow-md"
            title="Open Full Structure Customizer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Customize</span>
          </button>
        )}
      </div>

      {/* Minecraft 9-Slot Quick Hotbar */}
      <div className="flex items-center gap-1 sm:gap-1.5 bg-[#1b1b22]/95 backdrop-blur-md p-1.5 rounded-2xl border-2 border-[#383844] shadow-2xl overflow-x-auto max-w-[94vw]">
        {MINECRAFT_BLOCKS.map((item, index) => {
          const isSelected = activeBlock === item.type;
          return (
            <button
              key={item.type}
              onClick={() => {
                soundEngine.playClick();
                onSelectBlock(item.type);
                if (transformMode !== 'place' && transformMode !== 'mine') {
                  onSetTransformMode('place');
                }
              }}
              className={`relative flex flex-col items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all ${
                isSelected
                  ? 'bg-gradient-to-b from-sky-500/30 to-sky-600/40 border-2 border-sky-400 scale-105 shadow-md shadow-sky-500/30'
                  : 'bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700/60 hover:border-neutral-500'
              }`}
              title={`${item.name} (Key ${index + 1})`}
            >
              <span className="text-lg leading-none select-none">{item.icon}</span>
              <span className="absolute top-0.5 right-1 text-[8px] font-mono font-bold text-neutral-400">
                {index + 1}
              </span>
              <span className="text-[8px] font-semibold text-neutral-300 truncate max-w-full px-0.5">
                {item.name}
              </span>
              {isSelected && (
                <div className="absolute -bottom-1 w-2 h-1 bg-sky-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
