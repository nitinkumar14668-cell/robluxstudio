import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Box,
  Folder,
  Sun,
  User,
  Code2,
  Trash2,
  Copy,
  Plus,
  Search,
  Eye,
  Camera,
} from 'lucide-react';
import { RobloxInstance } from '../types/roblox';
import { soundEngine } from '../engine/audio';

interface ExplorerProps {
  instances: RobloxInstance[];
  selectedId: string | null;
  onSelectInstance: (id: string | null) => void;
  onDeleteInstance: (id: string) => void;
  onDuplicateInstance: (id: string) => void;
  onInsertPart: () => void;
}

export const Explorer: React.FC<ExplorerProps> = ({
  instances,
  selectedId,
  onSelectInstance,
  onDeleteInstance,
  onDuplicateInstance,
  onInsertPart,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);
  const [isLightingOpen, setIsLightingOpen] = useState(false);
  const [isStarterPlayerOpen, setIsStarterPlayerOpen] = useState(false);

  const filteredInstances = instances.filter((i) =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getItemIcon = (inst: RobloxInstance) => {
    if (inst.className === 'SpawnLocation') {
      return <span className="text-amber-400 font-bold text-xs">★</span>;
    }
    if (inst.className === 'NPC') {
      return <User className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (inst.className === 'Script') {
      return <Code2 className="w-3.5 h-3.5 text-yellow-400" />;
    }
    if (inst.isLava) {
      return <span className="text-red-400 text-xs">🔥</span>;
    }
    if (inst.isCoin) {
      return <span className="text-yellow-400 text-xs">🪙</span>;
    }
    return <Box className="w-3.5 h-3.5 text-sky-400" />;
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e24] border-l border-neutral-800 text-xs text-neutral-200 select-none">
      {/* Explorer Header */}
      <div className="h-8 px-2.5 flex items-center justify-between border-b border-neutral-800 bg-[#25252b]">
        <div className="flex items-center gap-1.5 font-bold text-neutral-300">
          <Folder className="w-3.5 h-3.5 text-sky-400" />
          <span>Explorer</span>
        </div>
        <button
          onClick={() => {
            soundEngine.playClick();
            onInsertPart();
          }}
          className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white"
          title="Insert New Part"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-1.5 border-b border-neutral-800">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-neutral-500" />
          <input
            type="text"
            placeholder="Filter Workspace..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#141418] border border-neutral-700 rounded pl-7 pr-2 py-1 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Tree View */}
      <div className="flex-1 overflow-y-auto p-1 font-mono text-[11px]">
        {/* Workspace Root Node */}
        <div className="mb-0.5">
          <div
            onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
            className="flex items-center gap-1 px-1.5 py-1 rounded hover:bg-neutral-800 cursor-pointer font-bold text-neutral-300"
          >
            {isWorkspaceOpen ? (
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-neutral-400" />
            )}
            <Folder className="w-3.5 h-3.5 text-amber-500" />
            <span>Workspace</span>
            <span className="text-[10px] text-neutral-500 font-normal">({instances.length})</span>
          </div>

          {/* Children of Workspace */}
          {isWorkspaceOpen && (
            <div className="pl-4 border-l border-neutral-800/80 ml-2 mt-0.5 flex flex-col gap-0.5">
              {/* Virtual Camera */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded text-neutral-400 hover:bg-neutral-800 cursor-pointer">
                <Camera className="w-3.5 h-3.5 text-neutral-500" />
                <span>Camera</span>
              </div>

              {/* Instances */}
              {filteredInstances.map((inst) => (
                <div
                  key={inst.id}
                  onClick={() => {
                    soundEngine.playClick();
                    onSelectInstance(inst.id);
                  }}
                  className={`group flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors ${
                    selectedId === inst.id
                      ? 'bg-[#00a2ff] text-white font-semibold'
                      : 'hover:bg-neutral-800/70 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {getItemIcon(inst)}
                    <span className="truncate">{inst.name}</span>
                  </div>

                  {/* Context quick actions */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateInstance(inst.id);
                      }}
                      className="p-0.5 hover:text-white"
                      title="Duplicate (Ctrl+D)"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {inst.name !== 'Baseplate' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteInstance(inst.id);
                        }}
                        className="p-0.5 hover:text-red-400"
                        title="Delete (Del)"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lighting Node */}
        <div className="mb-0.5">
          <div
            onClick={() => setIsLightingOpen(!isLightingOpen)}
            className="flex items-center gap-1 px-1.5 py-1 rounded hover:bg-neutral-800 cursor-pointer font-bold text-neutral-400"
          >
            {isLightingOpen ? (
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-neutral-400" />
            )}
            <Sun className="w-3.5 h-3.5 text-yellow-500" />
            <span>Lighting</span>
          </div>
          {isLightingOpen && (
            <div className="pl-4 border-l border-neutral-800/80 ml-2 text-neutral-500 py-1">
              <div className="px-2 py-0.5">Skybox</div>
              <div className="px-2 py-0.5">Atmosphere & Bloom</div>
            </div>
          )}
        </div>

        {/* StarterPlayer Node */}
        <div className="mb-0.5">
          <div
            onClick={() => setIsStarterPlayerOpen(!isStarterPlayerOpen)}
            className="flex items-center gap-1 px-1.5 py-1 rounded hover:bg-neutral-800 cursor-pointer font-bold text-neutral-400"
          >
            {isStarterPlayerOpen ? (
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-neutral-400" />
            )}
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span>StarterPlayer</span>
          </div>
          {isStarterPlayerOpen && (
            <div className="pl-4 border-l border-neutral-800/80 ml-2 text-neutral-500 py-1">
              <div className="px-2 py-0.5">StarterCharacterScripts</div>
              <div className="px-2 py-0.5">StarterPlayerScripts</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
