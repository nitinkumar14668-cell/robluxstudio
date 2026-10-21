import React, { useState } from 'react';
import { ShoppingBag, Search, Sparkles, Box, Shield, Zap, Flame, User, Disc } from 'lucide-react';
import { RobloxInstance } from '../types/roblox';
import { soundEngine } from '../engine/audio';

interface ToolboxProps {
  onInsertModel: (instances: Partial<RobloxInstance>[]) => void;
  onClose: () => void;
}

interface ToolboxItem {
  id: string;
  name: string;
  category: 'Models' | 'Hazards' | 'Props' | 'NPCs';
  creator: string;
  icon: React.ReactNode;
  instances: Partial<RobloxInstance>[];
}

export const Toolbox: React.FC<ToolboxProps> = ({ onInsertModel, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const toolboxItems: ToolboxItem[] = [
    {
      id: 'tool-castle-tower',
      name: 'Medieval Castle Tower',
      category: 'Models',
      creator: 'RobloxAssets',
      icon: <Box className="w-5 h-5 text-indigo-400" />,
      instances: [
        {
          name: 'Castle Pillar',
          className: 'Part',
          shape: 'Cylinder',
          size: { x: 8, y: 18, z: 8 },
          color: '#475569',
          material: 'Brick',
          anchored: true,
          canCollide: true,
        },
        {
          name: 'Castle Roof',
          className: 'Part',
          shape: 'Wedge',
          size: { x: 9, y: 5, z: 9 },
          color: '#991b1b',
          material: 'Wood',
          anchored: true,
          canCollide: true,
        },
      ],
    },
    {
      id: 'tool-jump-pad',
      name: 'Mega Jump Trampoline',
      category: 'Props',
      creator: 'ParkourDev',
      icon: <Zap className="w-5 h-5 text-pink-400" />,
      instances: [
        {
          name: 'Trampoline Base',
          className: 'Part',
          shape: 'Cylinder',
          size: { x: 7, y: 0.8, z: 7 },
          color: '#ec4899',
          material: 'Neon',
          anchored: true,
          canCollide: true,
          isJumpPad: true,
        },
      ],
    },
    {
      id: 'tool-lava-strip',
      name: 'Lava Kill Hazard Floor',
      category: 'Hazards',
      creator: 'ObbyMasters',
      icon: <Flame className="w-5 h-5 text-red-500" />,
      instances: [
        {
          name: 'Lava Hazard',
          className: 'Part',
          shape: 'Block',
          size: { x: 12, y: 0.8, z: 12 },
          color: '#ef4444',
          material: 'Neon',
          anchored: true,
          canCollide: true,
          isLava: true,
        },
      ],
    },
    {
      id: 'tool-coin-cluster',
      name: 'Gold Coin Trio',
      category: 'Props',
      creator: 'EconomyStore',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      instances: [
        {
          name: 'Gold Coin 1',
          className: 'Part',
          shape: 'Cylinder',
          size: { x: 1.5, y: 0.3, z: 1.5 },
          rotation: { x: 90, y: 0, z: 0 },
          color: '#facc15',
          material: 'Neon',
          anchored: true,
          canCollide: false,
          isCoin: true,
          coinValue: 20,
        },
      ],
    },
    {
      id: 'tool-speed-boost',
      name: 'Nitro Speed Pad',
      category: 'Props',
      creator: 'RacingClub',
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
      instances: [
        {
          name: 'Nitro Pad',
          className: 'Part',
          shape: 'Block',
          size: { x: 6, y: 0.4, z: 6 },
          color: '#06b6d4',
          material: 'Neon',
          anchored: true,
          canCollide: true,
          isSpeedPad: true,
        },
      ],
    },
    {
      id: 'tool-npc-zombie',
      name: 'Blocky Zombie NPC',
      category: 'NPCs',
      creator: 'SurvivalGames',
      icon: <User className="w-5 h-5 text-emerald-500" />,
      instances: [
        {
          name: 'Zombie Dummy',
          className: 'NPC',
          size: { x: 2, y: 5, z: 2 },
          color: '#15803d',
          material: 'Plastic',
          anchored: true,
          canCollide: true,
          npcType: 'Zombie',
          dialogue: 'Graaah! Braaains!',
        },
      ],
    },
    {
      id: 'tool-street-lamp',
      name: 'Glowing Street Lamp',
      category: 'Props',
      creator: 'CityBuilders',
      icon: <Box className="w-5 h-5 text-amber-300" />,
      instances: [
        {
          name: 'Lamp Post',
          className: 'Part',
          shape: 'Cylinder',
          size: { x: 0.6, y: 10, z: 0.6 },
          color: '#1e293b',
          material: 'Metal',
          anchored: true,
          canCollide: true,
        },
        {
          name: 'Lamp Bulb',
          className: 'Part',
          shape: 'Sphere',
          size: { x: 1.8, y: 1.8, z: 1.8 },
          color: '#fef08a',
          material: 'Neon',
          anchored: true,
          canCollide: false,
        },
      ],
    },
  ];

  const filteredItems = toolboxItems.filter((item) => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-[#1e1e24] border-r border-neutral-800 text-xs text-neutral-200 select-none w-64">
      {/* Header */}
      <div className="h-8 px-2.5 flex items-center justify-between border-b border-neutral-800 bg-[#25252b]">
        <div className="flex items-center gap-1.5 font-bold text-neutral-300">
          <ShoppingBag className="w-3.5 h-3.5 text-sky-400" />
          <span>Toolbox</span>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-500 hover:text-white font-bold px-1"
        >
          ✕
        </button>
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-neutral-800">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search Creator Store..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#141418] border border-neutral-700 rounded pl-7 pr-2 py-1 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 mt-2 overflow-x-auto text-[10px]">
          {['All', 'Models', 'Props', 'Hazards', 'NPCs'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-0.5 rounded font-medium ${
                activeCategory === cat
                  ? 'bg-sky-500 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              soundEngine.playClick();
              onInsertModel(item.instances);
            }}
            className="p-2.5 bg-[#17171c] hover:bg-[#25252d] border border-neutral-800 hover:border-sky-500/60 rounded-lg cursor-pointer transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded bg-neutral-800/80 flex items-center justify-center border border-neutral-700/50 group-hover:scale-105 transition-transform">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-neutral-200 truncate group-hover:text-sky-300">
                {item.name}
              </div>
              <div className="text-[10px] text-neutral-500 truncate">
                by {item.creator}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
