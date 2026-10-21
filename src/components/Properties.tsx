import React from 'react';
import { Sliders, CheckSquare, Square, Palette, Box, Sparkles, Code } from 'lucide-react';
import { RobloxInstance, PartMaterial, PartShape } from '../types/roblox';

interface PropertiesProps {
  selectedInstance: RobloxInstance | null;
  onUpdateInstance: (id: string, updates: Partial<RobloxInstance>) => void;
  onOpenScriptEditor: (id: string) => void;
}

export const Properties: React.FC<PropertiesProps> = ({
  selectedInstance,
  onUpdateInstance,
  onOpenScriptEditor,
}) => {
  if (!selectedInstance) {
    return (
      <div className="flex flex-col h-full bg-[#1e1e24] border-l border-neutral-800 text-xs text-neutral-400 select-none">
        <div className="h-8 px-2.5 flex items-center border-b border-neutral-800 bg-[#25252b] font-bold text-neutral-300">
          <Sliders className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
          <span>Properties</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 text-center text-neutral-500">
          <span>Select an object in Workspace or Explorer to edit properties</span>
        </div>
      </div>
    );
  }

  const inst = selectedInstance;

  const handleVecChange = (
    prop: 'position' | 'size' | 'rotation',
    axis: 'x' | 'y' | 'z',
    val: number
  ) => {
    onUpdateInstance(inst.id, {
      [prop]: {
        ...inst[prop],
        [axis]: isNaN(val) ? 0 : val,
      },
    });
  };

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

  const shapes: PartShape[] = ['Block', 'Sphere', 'Cylinder', 'Wedge'];

  return (
    <div className="flex flex-col h-full bg-[#1e1e24] border-l border-neutral-800 text-xs text-neutral-200 select-none overflow-hidden">
      {/* Properties Header */}
      <div className="h-8 px-2.5 flex items-center justify-between border-b border-neutral-800 bg-[#25252b]">
        <div className="flex items-center gap-1.5 font-bold text-neutral-300">
          <Sliders className="w-3.5 h-3.5 text-sky-400" />
          <span>Properties - {inst.name}</span>
        </div>
        <span className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400 font-mono">
          {inst.className}
        </span>
      </div>

      {/* Property List */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/80 font-mono text-[11px]">
        {/* Section: Data */}
        <div>
          <div className="bg-[#24242a] px-2.5 py-1 font-bold text-[10px] text-neutral-400 uppercase tracking-wider">
            Data
          </div>
          <div className="p-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Name</span>
              <input
                type="text"
                value={inst.name}
                onChange={(e) => onUpdateInstance(inst.id, { name: e.target.value })}
                className="w-36 bg-[#141418] border border-neutral-700 rounded px-1.5 py-0.5 text-neutral-200 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">ClassName</span>
              <span className="text-neutral-300">{inst.className}</span>
            </div>
          </div>
        </div>

        {/* Section: Appearance */}
        <div>
          <div className="bg-[#24242a] px-2.5 py-1 font-bold text-[10px] text-neutral-400 uppercase tracking-wider">
            Appearance
          </div>
          <div className="p-2 space-y-2">
            {/* Color */}
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Color</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={inst.color || '#94a3b8'}
                  onChange={(e) => onUpdateInstance(inst.id, { color: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border border-neutral-700 bg-transparent"
                />
                <span className="text-[10px] text-neutral-400">{inst.color}</span>
              </div>
            </div>

            {/* Material */}
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Material</span>
              <select
                value={inst.material || 'Plastic'}
                onChange={(e) =>
                  onUpdateInstance(inst.id, { material: e.target.value as PartMaterial })
                }
                className="w-36 bg-[#141418] border border-neutral-700 rounded px-1.5 py-0.5 text-neutral-200 focus:outline-none focus:border-sky-500"
              >
                {materials.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Transparency */}
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Transparency</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={inst.transparency || 0}
                  onChange={(e) =>
                    onUpdateInstance(inst.id, { transparency: parseFloat(e.target.value) })
                  }
                  className="w-20 accent-sky-500"
                />
                <span className="w-8 text-right">{(inst.transparency || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* CastShadow */}
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">CastShadow</span>
              <input
                type="checkbox"
                checked={inst.castShadow ?? true}
                onChange={(e) => onUpdateInstance(inst.id, { castShadow: e.target.checked })}
                className="accent-sky-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section: Transform */}
        <div>
          <div className="bg-[#24242a] px-2.5 py-1 font-bold text-[10px] text-neutral-400 uppercase tracking-wider">
            Transform
          </div>
          <div className="p-2 space-y-2">
            {/* Position */}
            <div>
              <span className="text-neutral-400 block mb-1">Position (X, Y, Z)</span>
              <div className="grid grid-cols-3 gap-1">
                {(['x', 'y', 'z'] as const).map((axis) => (
                  <div key={axis} className="flex items-center bg-[#141418] border border-neutral-700 rounded px-1">
                    <span className="text-[9px] text-neutral-500 uppercase mr-1">{axis}:</span>
                    <input
                      type="number"
                      step="0.5"
                      value={Math.round(inst.position[axis] * 10) / 10}
                      onChange={(e) =>
                        handleVecChange('position', axis, parseFloat(e.target.value))
                      }
                      className="w-full bg-transparent text-neutral-200 focus:outline-none text-[11px]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <span className="text-neutral-400 block mb-1">Size (X, Y, Z)</span>
              <div className="grid grid-cols-3 gap-1">
                {(['x', 'y', 'z'] as const).map((axis) => (
                  <div key={axis} className="flex items-center bg-[#141418] border border-neutral-700 rounded px-1">
                    <span className="text-[9px] text-neutral-500 uppercase mr-1">{axis}:</span>
                    <input
                      type="number"
                      min="0.2"
                      step="0.5"
                      value={Math.round(inst.size[axis] * 10) / 10}
                      onChange={(e) =>
                        handleVecChange('size', axis, Math.max(0.2, parseFloat(e.target.value)))
                      }
                      className="w-full bg-transparent text-neutral-200 focus:outline-none text-[11px]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Orientation */}
            <div>
              <span className="text-neutral-400 block mb-1">Rotation (Pitch, Yaw, Roll)</span>
              <div className="grid grid-cols-3 gap-1">
                {(['x', 'y', 'z'] as const).map((axis) => (
                  <div key={axis} className="flex items-center bg-[#141418] border border-neutral-700 rounded px-1">
                    <span className="text-[9px] text-neutral-500 uppercase mr-1">{axis}:</span>
                    <input
                      type="number"
                      step="15"
                      value={Math.round(inst.rotation[axis])}
                      onChange={(e) =>
                        handleVecChange('rotation', axis, parseFloat(e.target.value))
                      }
                      className="w-full bg-transparent text-neutral-200 focus:outline-none text-[11px]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Collision & Physics */}
        <div>
          <div className="bg-[#24242a] px-2.5 py-1 font-bold text-[10px] text-neutral-400 uppercase tracking-wider">
            Collision & Mechanics
          </div>
          <div className="p-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Anchored</span>
              <input
                type="checkbox"
                checked={inst.anchored}
                onChange={(e) => onUpdateInstance(inst.id, { anchored: e.target.checked })}
                className="accent-sky-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-400">CanCollide</span>
              <input
                type="checkbox"
                checked={inst.canCollide}
                onChange={(e) => onUpdateInstance(inst.id, { canCollide: e.target.checked })}
                className="accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Interactive special properties */}
            <div className="pt-1 border-t border-neutral-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-red-400 font-semibold">Lava Kill Hazard</span>
                <input
                  type="checkbox"
                  checked={inst.isLava || false}
                  onChange={(e) => onUpdateInstance(inst.id, { isLava: e.target.checked })}
                  className="accent-red-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-semibold">Collectible Coin</span>
                <input
                  type="checkbox"
                  checked={inst.isCoin || false}
                  onChange={(e) => onUpdateInstance(inst.id, { isCoin: e.target.checked })}
                  className="accent-yellow-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-pink-400 font-semibold">Trampoline / Jump Pad</span>
                <input
                  type="checkbox"
                  checked={inst.isJumpPad || false}
                  onChange={(e) => onUpdateInstance(inst.id, { isJumpPad: e.target.checked })}
                  className="accent-pink-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Script Action */}
        <div className="p-2">
          <button
            onClick={() => onOpenScriptEditor(inst.id)}
            className="w-full flex items-center justify-center gap-2 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded font-semibold transition-colors"
          >
            <Code className="w-3.5 h-3.5 text-yellow-400" />
            <span>{inst.scriptContent ? 'Edit Attached Script' : 'Attach Lua Script'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
