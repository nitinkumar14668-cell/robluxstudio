import React from 'react';
import * as THREE from 'three';
import { RobloxInstance, MinecraftBlockType, PartMaterial } from '../types/roblox';
import { soundEngine } from '../engine/audio';
import { physicsEngine } from '../engine/physics';
import {
  X,
  Palette,
  Layers,
  Box,
  Maximize2,
  Anchor,
  Shield,
  Trash2,
  Copy,
  Zap,
  Bomb,
  Sparkles,
  Flame,
  ArrowUp,
  FastForward,
} from 'lucide-react';
import { MINECRAFT_BLOCKS } from './MinecraftHotbar';

interface StructureEditorModalProps {
  instance: RobloxInstance | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateInstance: (id: string, updates: Partial<RobloxInstance>) => void;
  onDeleteInstance: (id: string) => void;
  onDuplicateInstance: (id: string, offset?: { x: number; y: number; z: number }) => void;
  onTriggerExplosion?: (pos: { x: number; y: number; z: number }) => void;
}

export const StructureEditorModal: React.FC<StructureEditorModalProps> = ({
  instance,
  isOpen,
  onClose,
  onUpdateInstance,
  onDeleteInstance,
  onDuplicateInstance,
  onTriggerExplosion,
}) => {
  if (!isOpen || !instance) return null;

  const handleBlockTypeChange = (type: MinecraftBlockType) => {
    soundEngine.playBlockPlace(type);
    let mat: PartMaterial = 'Plastic';
    let transparency = 0;
    let isTNT = false;
    let isLava = false;

    if (type === 'wood') mat = 'Wood';
    else if (type === 'brick') mat = 'Brick';
    else if (type === 'glass') {
      mat = 'Glass';
      transparency = 0.4;
    } else if (type === 'glowstone') mat = 'Neon';
    else if (type === 'tnt') isTNT = true;
    else if (type === 'lava') {
      isLava = true;
      mat = 'Neon';
    }

    onUpdateInstance(instance.id, {
      blockType: type,
      material: mat,
      transparency,
      isTNT,
      isLava,
    });
  };

  const handlePresetScale = (size: { x: number; y: number; z: number }) => {
    soundEngine.playClick();
    onUpdateInstance(instance.id, { size });
  };

  const handleDetonateTNT = () => {
    soundEngine.playTntFuse();
    setTimeout(() => {
      soundEngine.playExplosion();
      physicsEngine.applyExplosion(
        new THREE.Vector3(instance.position.x, instance.position.y, instance.position.z),
        450,
        25
      );
      if (onTriggerExplosion) {
        onTriggerExplosion(instance.position);
      }
      onDeleteInstance(instance.id);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs select-none font-sans">
      <div className="bg-[#1e1e24] border border-[#3b3b47] rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#25252e] border-b border-[#363642]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-600 flex items-center justify-center text-white shadow">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Edit Structure Block</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono border border-sky-500/30">
                  {instance.blockType || instance.material}
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">
                Customizing: <span className="font-semibold text-neutral-200">{instance.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-7 h-7 rounded-lg hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-neutral-200">
          {/* Section 1: Minecraft Block Type */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
              1. Choose Minecraft Block Type
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-5 gap-1.5">
              {MINECRAFT_BLOCKS.map((item) => {
                const isSelected = instance.blockType === item.type;
                return (
                  <button
                    key={item.type}
                    onClick={() => handleBlockTypeChange(item.type)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${
                      isSelected
                        ? 'bg-sky-600/30 border-sky-400 text-white shadow-md scale-105'
                        : 'bg-neutral-800/80 hover:bg-neutral-700/80 border-neutral-700/60 text-neutral-300'
                    }`}
                  >
                    <span className="text-xl mb-1">{item.icon}</span>
                    <span className="font-semibold text-[10px] truncate max-w-full">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Scale & Dimensions */}
          <div className="bg-[#24242d] p-3 rounded-xl border border-neutral-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                2. Block Scale & Geometry
              </span>
              <span className="font-mono text-[10px] text-neutral-400">
                {instance.size.x} × {instance.size.y} × {instance.size.z} Studs
              </span>
            </div>

            {/* Scale Presets */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
              {[
                { label: '1x1 Cube', size: { x: 1, y: 1, z: 1 } },
                { label: '2x2 Standard', size: { x: 2, y: 2, z: 2 } },
                { label: '4x4 Mega', size: { x: 4, y: 4, z: 4 } },
                { label: 'Half Slab', size: { x: 2, y: 0.8, z: 2 } },
                { label: 'Pillar', size: { x: 1.5, y: 5, z: 1.5 } },
                { label: 'Wall', size: { x: 5, y: 3, z: 0.8 } },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetScale(preset.size)}
                  className="px-2 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 font-semibold text-[10px] text-neutral-200 border border-neutral-700/70 text-center transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom XYZ Sliders */}
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
              <div>
                <label className="text-neutral-400 text-[10px]">Width (X): {instance.size.x}</label>
                <input
                  type="range"
                  min="0.5"
                  max="16"
                  step="0.5"
                  value={instance.size.x}
                  onChange={(e) =>
                    onUpdateInstance(instance.id, {
                      size: { ...instance.size, x: parseFloat(e.target.value) },
                    })
                  }
                  className="w-full accent-sky-500"
                />
              </div>
              <div>
                <label className="text-neutral-400 text-[10px]">Height (Y): {instance.size.y}</label>
                <input
                  type="range"
                  min="0.5"
                  max="16"
                  step="0.5"
                  value={instance.size.y}
                  onChange={(e) =>
                    onUpdateInstance(instance.id, {
                      size: { ...instance.size, y: parseFloat(e.target.value) },
                    })
                  }
                  className="w-full accent-sky-500"
                />
              </div>
              <div>
                <label className="text-neutral-400 text-[10px]">Depth (Z): {instance.size.z}</label>
                <input
                  type="range"
                  min="0.5"
                  max="16"
                  step="0.5"
                  value={instance.size.z}
                  onChange={(e) =>
                    onUpdateInstance(instance.id, {
                      size: { ...instance.size, z: parseFloat(e.target.value) },
                    })
                  }
                  className="w-full accent-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Color & Appearance */}
          <div className="bg-[#24242d] p-3 rounded-xl border border-neutral-700/60 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              3. Color & Tint
            </span>

            <div className="flex items-center gap-2">
              <input
                type="color"
                value={instance.color || '#94a3b8'}
                onChange={(e) => onUpdateInstance(instance.id, { color: e.target.value })}
                className="w-9 h-9 rounded-lg border border-neutral-600 cursor-pointer bg-transparent"
              />
              <div className="flex flex-wrap gap-1.5 flex-1">
                {[
                  '#55c23e',
                  '#866043',
                  '#6b6b6b',
                  '#b88755',
                  '#8f3328',
                  '#22d3ee',
                  '#facc15',
                  '#ef4444',
                  '#1e1b4b',
                  '#ffffff',
                ].map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      soundEngine.playClick();
                      onUpdateInstance(instance.id, { color: c });
                    }}
                    style={{ backgroundColor: c }}
                    className="w-6 h-6 rounded-md border border-white/20 hover:scale-110 transition-transform shadow"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Physics & Interactive Mechanics */}
          <div className="bg-[#24242d] p-3 rounded-xl border border-neutral-700/60 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              4. Physics & Interactive Mechanics
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onUpdateInstance(instance.id, { anchored: !instance.anchored });
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl font-semibold text-xs border transition-colors ${
                  instance.anchored
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Anchor className="w-3.5 h-3.5" />
                  Anchored Block
                </span>
                <span className="text-[10px] font-bold font-mono">
                  {instance.anchored ? 'ON' : 'FALLING (Physics)'}
                </span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  onUpdateInstance(instance.id, { canCollide: !instance.canCollide });
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl font-semibold text-xs border transition-colors ${
                  instance.canCollide
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Solid Collision
                </span>
                <span className="text-[10px] font-bold font-mono">
                  {instance.canCollide ? 'SOLID' : 'WALK-THROUGH'}
                </span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  onUpdateInstance(instance.id, {
                    isJumpPad: !instance.isJumpPad,
                    material: !instance.isJumpPad ? 'Neon' : instance.material,
                  });
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl font-semibold text-xs border transition-colors ${
                  instance.isJumpPad
                    ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <ArrowUp className="w-3.5 h-3.5 text-pink-400" />
                  Trampoline Pad
                </span>
                <span className="text-[10px] font-bold font-mono">
                  {instance.isJumpPad ? 'ACTIVE' : 'OFF'}
                </span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  onUpdateInstance(instance.id, {
                    isLava: !instance.isLava,
                    color: !instance.isLava ? '#ef4444' : instance.color,
                  });
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl font-semibold text-xs border transition-colors ${
                  instance.isLava
                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  Lava Hazard
                </span>
                <span className="text-[10px] font-bold font-mono">
                  {instance.isLava ? 'DEADLY' : 'OFF'}
                </span>
              </button>
            </div>

            {/* TNT Detonate Button */}
            {(instance.blockType === 'tnt' || instance.isTNT) && (
              <div className="pt-1">
                <button
                  onClick={handleDetonateTNT}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-900/50 transition-all hover:scale-[1.02]"
                >
                  <Bomb className="w-4 h-4 fill-current animate-bounce" />
                  <span>Ignite & Detonate TNT (Physics Blast)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-[#24242d] border-t border-[#363642] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundEngine.playClick();
                onDuplicateInstance(instance.id, { x: instance.size.x, y: 0, z: 0 });
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-semibold text-xs transition-colors"
              title="Duplicate block adjacent"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Clone (+X)</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                onDuplicateInstance(instance.id, { x: 0, y: instance.size.y, z: 0 });
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-semibold text-xs transition-colors"
              title="Stack block on top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Stack (+Y)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playBlockBreak(instance.blockType || instance.material);
                onDeleteInstance(instance.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 font-bold text-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Break Block</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
