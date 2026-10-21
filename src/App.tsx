/**
 * Roblox Studio Web - Authentic Desktop IDE & 3D Game Creator
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RibbonBar } from './components/RibbonBar';
import { Viewport3D } from './components/Viewport3D';
import { Explorer } from './components/Explorer';
import { Properties } from './components/Properties';
import { Toolbox } from './components/Toolbox';
import { OutputConsole } from './components/OutputConsole';
import { ScriptEditor } from './components/ScriptEditor';
import { PublishModal } from './components/PublishModal';
import { GamesGallery } from './components/GamesGallery';
import { PlayHUD } from './components/PlayHUD';
import {
  RobloxInstance,
  TransformMode,
  StudioTab,
  PublishedGame,
  OutputLog,
  PlayerStats,
  PartShape,
  PartMaterial,
} from './types/roblox';
import {
  createBaseplateInstances,
  createObbyInstances,
  createLavaEscapeInstances,
  DEFAULT_PUBLISHED_GAMES,
} from './engine/templates';
import { scriptRunner } from './engine/scriptRunner';
import { soundEngine } from './engine/audio';
import { Box, Code2, X } from 'lucide-react';

const STORAGE_GAMES_KEY = 'roblox_studio_web_games_v1';
const STORAGE_CURRENT_PLACE_KEY = 'roblox_studio_current_place_v1';

export default function App() {
  // Studio UI Layout States
  const [activeTab, setActiveTab] = useState<StudioTab>('home');
  const [transformMode, setTransformMode] = useState<TransformMode>('select');
  const [gridSnap, setGridSnap] = useState<number>(1);
  const [anchoredDefault, setAnchoredDefault] = useState<boolean>(true);
  const [canCollideDefault, setCanCollideDefault] = useState<boolean>(true);

  // Document Tabs: 'workspace' | 'script'
  const [activeDocumentTab, setActiveDocumentTab] = useState<'workspace' | 'script'>('workspace');
  const [editingScriptInstanceId, setEditingScriptInstanceId] = useState<string | null>(null);

  // Panel Toggles
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true);
  const [isToolboxOpen, setIsToolboxOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isGamesGalleryOpen, setIsGamesGalleryOpen] = useState(false);

  // Scene Instances & Selection
  const [instances, setInstances] = useState<RobloxInstance[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CURRENT_PLACE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return createBaseplateInstances();
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<RobloxInstance[][]>([]);
  const [future, setFuture] = useState<RobloxInstance[][]>([]);

  // Simulation / Play Mode
  const [isPlayMode, setIsPlayMode] = useState<boolean>(false);
  const backupInstancesRef = useRef<RobloxInstance[] | null>(null);
  const [currentGameTitle, setCurrentGameTitle] = useState('Classic Baseplate Sandbox');

  // Player Stats in Play Mode
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    health: 100,
    maxHealth: 100,
    coins: 0,
    score: 0,
    checkpoint: null,
    walkSpeed: 16,
    jumpPower: 45,
  });

  // Lighting & Skybox
  const [lighting, setLighting] = useState<{
    timeOfDay: number;
    ambientColor: string;
    fogDensity: number;
    skyType: 'clear' | 'sunset' | 'night' | 'cyberpunk';
  }>({
    timeOfDay: 14,
    ambientColor: '#ffffff',
    fogDensity: 0.003,
    skyType: 'clear',
  });

  // Output Logs
  const [logs, setLogs] = useState<OutputLog[]>([
    {
      id: 'log-1',
      type: 'info',
      text: 'Roblox Studio Web Engine v2.4 initialized. Ready to build!',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  // Published Games Library
  const [publishedGames, setPublishedGames] = useState<PublishedGame[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_GAMES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_PUBLISHED_GAMES;
  });

  // Camera presets
  const [cameraPreset, setCameraPreset] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CURRENT_PLACE_KEY, JSON.stringify(instances));
    } catch {
      // Ignored
    }
  }, [instances]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_GAMES_KEY, JSON.stringify(publishedGames));
    } catch {
      // Ignored
    }
  }, [publishedGames]);

  // Append Log
  const addLog = useCallback((log: Omit<OutputLog, 'id' | 'timestamp'>) => {
    setLogs((prev) => [
      ...prev.slice(-100),
      {
        ...log,
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, []);

  // Update instance helper
  const updateInstance = useCallback(
    (id: string, updates: Partial<RobloxInstance>, saveHistory = true) => {
      setInstances((prev) => {
        if (saveHistory) {
          setHistory((h) => [...h.slice(-20), prev]);
          setFuture([]);
        }
        return prev.map((inst) => (inst.id === id ? { ...inst, ...updates } : inst));
      });
    },
    []
  );

  // Update player stats
  const handleUpdatePlayerStats = useCallback((updates: Partial<PlayerStats>) => {
    setPlayerStats((prev) => ({ ...prev, ...updates }));
  }, []);

  // Play Mode Toggle
  const togglePlayMode = useCallback(() => {
    if (!isPlayMode) {
      // Starting Play Test: switch to 3D workspace tab
      setActiveDocumentTab('workspace');
      soundEngine.playSpawn();
      backupInstancesRef.current = JSON.parse(JSON.stringify(instances));
      setIsPlayMode(true);
      setSelectedId(null);
      setPlayerStats({
        health: 100,
        maxHealth: 100,
        coins: 0,
        score: 0,
        checkpoint: null,
        walkSpeed: 16,
        jumpPower: 45,
      });

      addLog({
        type: 'info',
        text: `--- Simulation Started: ${currentGameTitle} ---`,
      });

      // Execute scripts
      instances.forEach((inst) => {
        if (inst.scriptContent) {
          scriptRunner.runScript(inst.scriptContent, {
            instance: inst,
            onLog: (l) => addLog(l),
            onModifyInstance: (instId, up) => updateInstance(instId, up, false),
            onAwardCoins: (c) =>
              setPlayerStats((s) => ({ ...s, coins: s.coins + c })),
          });
        }
      });
    } else {
      // Stop Simulation
      scriptRunner.stopAll();
      setIsPlayMode(false);
      if (backupInstancesRef.current) {
        setInstances(backupInstancesRef.current);
      }
      addLog({
        type: 'info',
        text: '--- Simulation Stopped. Scene restored to Studio state. ---',
      });
    }
  }, [isPlayMode, instances, currentGameTitle, addLog, updateInstance]);

  // Reset Character
  const handleResetCharacter = useCallback(() => {
    soundEngine.playOof();
    setPlayerStats((prev) => ({ ...prev, health: 0 }));
    addLog({ type: 'warn', text: 'Character reset.' });
  }, [addLog]);

  // Insert Part Helper
  const handleInsertPart = useCallback(
    (
      shape: PartShape = 'Block',
      specialType?: 'lava' | 'coin' | 'jumpPad' | 'speedPad' | 'spawn'
    ) => {
      soundEngine.playClick();
      setHistory((h) => [...h.slice(-20), instances]);
      setFuture([]);

      const id = `part-${Date.now()}`;
      let name = `${shape}Part`;
      let color = '#6b7280';
      let material: PartMaterial = 'Plastic';
      let size = { x: 4, y: 1.2, z: 4 };
      let isLava = false;
      let isCoin = false;
      let isJumpPad = false;
      let isSpeedPad = false;
      let isCheckpoint = false;
      let className: RobloxInstance['className'] = 'Part';

      if (specialType === 'spawn') {
        name = 'SpawnLocation';
        className = 'SpawnLocation';
        color = '#38bdf8';
        material = 'SmoothPlastic';
        size = { x: 8, y: 0.5, z: 8 };
        isCheckpoint = true;
      } else if (specialType === 'lava') {
        name = 'LavaHazard';
        color = '#ef4444';
        material = 'Neon';
        size = { x: 6, y: 1, z: 6 };
        isLava = true;
      } else if (specialType === 'coin') {
        name = 'CoinCollectible';
        shape = 'Cylinder';
        color = '#facc15';
        material = 'Neon';
        size = { x: 1.6, y: 0.3, z: 1.6 };
        isCoin = true;
      } else if (specialType === 'jumpPad') {
        name = 'TrampolinePad';
        color = '#ec4899';
        material = 'Neon';
        size = { x: 6, y: 0.6, z: 6 };
        isJumpPad = true;
      } else if (specialType === 'speedPad') {
        name = 'SpeedBoostPad';
        color = '#06b6d4';
        material = 'Neon';
        size = { x: 6, y: 0.4, z: 6 };
        isSpeedPad = true;
      }

      const newPart: RobloxInstance = {
        id,
        name,
        className,
        parentId: 'workspace',
        shape,
        position: { x: 0, y: 3, z: 0 },
        size,
        rotation: { x: 0, y: 0, z: 0 },
        color,
        material,
        transparency: 0,
        reflectance: 0.2,
        anchored: anchoredDefault,
        canCollide: canCollideDefault,
        castShadow: true,
        isLava,
        isCoin,
        isJumpPad,
        isSpeedPad,
        isCheckpoint,
      };

      setInstances((prev) => [...prev, newPart]);
      setSelectedId(id);
      addLog({
        type: 'print',
        text: `Created new ${name} (${id}) in Workspace`,
      });
    },
    [instances, anchoredDefault, canCollideDefault, addLog]
  );

  // Insert NPC
  const handleInsertNPC = useCallback(() => {
    soundEngine.playClick();
    setHistory((h) => [...h.slice(-20), instances]);
    setFuture([]);

    const id = `npc-${Date.now()}`;
    const newNPC: RobloxInstance = {
      id,
      name: 'Classic Noob Rig',
      className: 'NPC',
      parentId: 'workspace',
      position: { x: 0, y: 0, z: -5 },
      size: { x: 2, y: 5, z: 2 },
      rotation: { x: 0, y: 0, z: 0 },
      color: '#f5cd2f',
      material: 'Plastic',
      transparency: 0,
      reflectance: 0,
      anchored: true,
      canCollide: true,
      npcType: 'Noob',
      dialogue: 'Oof! Ready to build awesome Roblox games!',
    };

    setInstances((prev) => [...prev, newNPC]);
    setSelectedId(id);
    addLog({ type: 'print', text: `Inserted NPC Rig into Workspace` });
  }, [instances, addLog]);

  // Insert Script
  const handleInsertScript = useCallback(() => {
    soundEngine.playClick();
    const target = instances.find((i) => i.id === selectedId) || instances[0];
    if (!target) return;

    setEditingScriptInstanceId(target.id);
    setActiveDocumentTab('script');
    addLog({
      type: 'info',
      text: `Opened script document for ${target.name}`,
    });
  }, [selectedId, instances, addLog]);

  // Insert Model from Toolbox
  const handleInsertModel = useCallback(
    (modelInstances: Partial<RobloxInstance>[]) => {
      setHistory((h) => [...h.slice(-20), instances]);
      setFuture([]);

      const created: RobloxInstance[] = modelInstances.map((m, idx) => ({
        id: `toolbox-${Date.now()}-${idx}`,
        name: m.name || 'ModelPart',
        className: m.className || 'Part',
        parentId: 'workspace',
        shape: m.shape || 'Block',
        position: m.position || { x: (idx - 1) * 3, y: 2 + idx * 2, z: 0 },
        size: m.size || { x: 4, y: 2, z: 4 },
        rotation: m.rotation || { x: 0, y: 0, z: 0 },
        color: m.color || '#3b82f6',
        material: m.material || 'Plastic',
        transparency: m.transparency || 0,
        reflectance: m.reflectance || 0.1,
        anchored: m.anchored ?? true,
        canCollide: m.canCollide ?? true,
        castShadow: true,
        isLava: m.isLava,
        isCoin: m.isCoin,
        isJumpPad: m.isJumpPad,
        isSpeedPad: m.isSpeedPad,
        npcType: m.npcType,
        dialogue: m.dialogue,
      }));

      setInstances((prev) => [...prev, ...created]);
      if (created[0]) setSelectedId(created[0].id);
      addLog({
        type: 'print',
        text: `Inserted package (${created.length} parts) into Workspace`,
      });
    },
    [instances, addLog]
  );

  // Delete
  const handleDeleteInstance = useCallback(
    (id: string) => {
      const inst = instances.find((i) => i.id === id);
      if (!inst || inst.name === 'Baseplate') return;
      soundEngine.playClick();
      setHistory((h) => [...h.slice(-20), instances]);
      setFuture([]);
      setInstances((prev) => prev.filter((i) => i.id !== id));
      if (selectedId === id) setSelectedId(null);
      addLog({ type: 'warn', text: `Deleted instance ${inst.name}` });
    },
    [instances, selectedId, addLog]
  );

  // Duplicate
  const handleDuplicateInstance = useCallback(
    (id: string) => {
      const inst = instances.find((i) => i.id === id);
      if (!inst) return;
      soundEngine.playClick();
      setHistory((h) => [...h.slice(-20), instances]);
      setFuture([]);

      const copy: RobloxInstance = {
        ...JSON.parse(JSON.stringify(inst)),
        id: `part-${Date.now()}`,
        name: `${inst.name}_Copy`,
        position: {
          x: inst.position.x + 2,
          y: inst.position.y,
          z: inst.position.z + 2,
        },
      };

      setInstances((prev) => [...prev, copy]);
      setSelectedId(copy.id);
      addLog({ type: 'print', text: `Duplicated ${inst.name} -> ${copy.name}` });
    },
    [instances, addLog]
  );

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    soundEngine.playClick();
    const prev = history[history.length - 1];
    setFuture((f) => [instances, ...f]);
    setHistory((h) => h.slice(0, -1));
    setInstances(prev);
    addLog({ type: 'info', text: 'Undo action executed' });
  }, [history, instances, addLog]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    soundEngine.playClick();
    const next = future[0];
    setHistory((h) => [...h, instances]);
    setFuture((f) => f.slice(1));
    setInstances(next);
    addLog({ type: 'info', text: 'Redo action executed' });
  }, [future, instances, addLog]);

  // Save place
  const handleSavePlace = useCallback(() => {
    soundEngine.playClick();
    const placeData = {
      title: currentGameTitle,
      creator: 'nitinkumar14668',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      instances,
      lighting,
    };

    const blob = new Blob([JSON.stringify(placeData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentGameTitle.replace(/\s+/g, '_')}.rbxl.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog({ type: 'print', text: `Saved place to file: ${a.download}` });
  }, [currentGameTitle, instances, lighting, addLog]);

  // Import place file
  const handleImportGameFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed.instances)) {
            setInstances(parsed.instances);
            if (parsed.title) setCurrentGameTitle(parsed.title);
            if (parsed.lighting) setLighting(parsed.lighting);
            soundEngine.playCheckpoint();
            addLog({
              type: 'info',
              text: `Successfully imported game: ${parsed.title || file.name}`,
            });
            setIsGamesGalleryOpen(false);
          }
        } catch {
          addLog({ type: 'error', text: `Failed to parse place file: ${file.name}` });
        }
      };
      reader.readAsText(file);
    },
    [addLog]
  );

  // Command bar
  const handleExecuteCommand = useCallback(
    (cmd: string) => {
      addLog({ type: 'print', text: `> ${cmd}` });
      if (cmd.startsWith('print(')) {
        const match = cmd.match(/print\((['"]?)(.*?)\1\)/);
        if (match) addLog({ type: 'print', text: match[2] });
      } else if (cmd.includes('.Color =')) {
        const hex = cmd.split('=')[1]?.trim().replace(/['"]/g, '');
        if (selectedId && hex) {
          updateInstance(selectedId, { color: hex });
          addLog({ type: 'info', text: `Set color to ${hex}` });
        }
      } else if (cmd === 'clear' || cmd === 'cls') {
        setLogs([]);
      } else {
        addLog({ type: 'info', text: `Executed statement: ${cmd}` });
      }
    },
    [selectedId, updateInstance, addLog]
  );

  // Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'F5') {
        e.preventDefault();
        togglePlayMode();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        handleDeleteInstance(selectedId);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedId) {
        e.preventDefault();
        handleDuplicateInstance(selectedId);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSavePlace();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    togglePlayMode,
    handleUndo,
    handleRedo,
    handleDeleteInstance,
    handleDuplicateInstance,
    handleSavePlace,
    selectedId,
  ]);

  const selectedInstance = instances.find((i) => i.id === selectedId) || null;
  const editingScriptInstance =
    instances.find((i) => i.id === editingScriptInstanceId) || selectedInstance || instances[0];

  return (
    <div className="flex flex-col w-screen h-screen bg-[#1e1e24] text-white overflow-hidden font-sans select-none">
      {/* 1. Authentic Studio Ribbon Bar */}
      <RibbonBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        transformMode={transformMode}
        onTransformModeChange={setTransformMode}
        isPlayMode={isPlayMode}
        onTogglePlayMode={togglePlayMode}
        onInsertPart={handleInsertPart}
        onInsertNPC={handleInsertNPC}
        onInsertScript={handleInsertScript}
        onPublishClick={() => setIsPublishModalOpen(true)}
        onOpenGamesGallery={() => setIsGamesGalleryOpen(true)}
        gridSnap={gridSnap}
        onGridSnapChange={setGridSnap}
        anchored={anchoredDefault}
        onToggleAnchored={() => setAnchoredDefault((a) => !a)}
        canCollide={canCollideDefault}
        onToggleCanCollide={() => setCanCollideDefault((c) => !c)}
        onSelectColor={(hex) => {
          if (selectedId) updateInstance(selectedId, { color: hex });
        }}
        onSelectMaterial={(mat) => {
          if (selectedId) updateInstance(selectedId, { material: mat });
        }}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSavePlace={handleSavePlace}
        onOpenPlace={() => setIsGamesGalleryOpen(true)}
        isConsoleOpen={isConsoleOpen}
        onToggleConsole={() => setIsConsoleOpen((c) => !c)}
        isToolboxOpen={isToolboxOpen}
        onToggleToolbox={() => setIsToolboxOpen((t) => !t)}
        isExplorerOpen={isExplorerOpen}
        onToggleExplorer={() => setIsExplorerOpen((e) => !e)}
        isPropertiesOpen={isPropertiesOpen}
        onToggleProperties={() => setIsPropertiesOpen((p) => !p)}
      />

      {/* 2. Main Studio IDE Workstation */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Drawer: Toolbox (if open) */}
        {isToolboxOpen && (
          <Toolbox
            onInsertModel={handleInsertModel}
            onClose={() => setIsToolboxOpen(false)}
          />
        )}

        {/* Center: Document Tabs + 3D Viewport or Script Editor */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#18181c]">
          {/* Authentic Document Tabstrip */}
          <div className="h-7 px-2 bg-[#202026] border-b border-[#2e2e36] flex items-center gap-1 shrink-0">
            {/* Tab 1: 3D Workspace */}
            <button
              onClick={() => setActiveDocumentTab('workspace')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-t text-xs font-semibold border-t-2 transition-colors ${
                activeDocumentTab === 'workspace'
                  ? 'bg-[#18181c] text-white border-[#00a2ff]'
                  : 'bg-transparent text-neutral-400 hover:text-neutral-200 border-transparent hover:bg-[#282830]'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-sky-400" />
              <span>Workspace</span>
            </button>

            {/* Tab 2: Script Document (if open) */}
            {editingScriptInstanceId && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-t text-xs font-semibold border-t-2 transition-colors cursor-pointer ${
                  activeDocumentTab === 'script'
                    ? 'bg-[#18181c] text-white border-amber-400'
                    : 'bg-transparent text-neutral-400 hover:text-neutral-200 border-transparent hover:bg-[#282830]'
                }`}
                onClick={() => setActiveDocumentTab('script')}
              >
                <Code2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{editingScriptInstance?.name || 'Script'}.lua</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingScriptInstanceId(null);
                    setActiveDocumentTab('workspace');
                  }}
                  className="hover:text-red-400 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Main Document Content */}
          <div className="flex-1 relative overflow-hidden">
            {/* 3D Viewport is always mounted so WebGL context stays hot */}
            <div
              className={`w-full h-full ${
                activeDocumentTab === 'workspace' ? 'block' : 'hidden'
              }`}
            >
              <Viewport3D
                instances={instances}
                selectedId={selectedId}
                onSelectInstance={setSelectedId}
                onUpdateInstance={updateInstance}
                transformMode={transformMode}
                isPlayMode={isPlayMode}
                playerStats={playerStats}
                onUpdatePlayerStats={handleUpdatePlayerStats}
                gridSnap={gridSnap}
                timeOfDay={lighting.timeOfDay}
                skyType={lighting.skyType}
                cameraPreset={cameraPreset}
                onClearCameraPreset={() => setCameraPreset(null)}
              />

              {/* In-Game Roblox TopBar HUD in Play Mode */}
              {isPlayMode && (
                <PlayHUD
                  playerStats={playerStats}
                  gameTitle={currentGameTitle}
                  onExitPlayMode={togglePlayMode}
                  onResetCharacter={handleResetCharacter}
                />
              )}
            </div>

            {/* Embedded Script Document Editor */}
            {activeDocumentTab === 'script' && editingScriptInstance && (
              <ScriptEditor
                instance={editingScriptInstance}
                onSaveScript={(instId, code) => {
                  updateInstance(instId, { scriptContent: code });
                  addLog({ type: 'info', text: `Saved script to ${editingScriptInstance.name}` });
                }}
                onClose={() => {
                  setEditingScriptInstanceId(null);
                  setActiveDocumentTab('workspace');
                }}
              />
            )}
          </div>

          {/* Bottom Dock: Output Console (if open and not in Play mode) */}
          {isConsoleOpen && !isPlayMode && (
            <OutputConsole
              logs={logs}
              onClearLogs={() => setLogs([])}
              onExecuteCommand={handleExecuteCommand}
              onClose={() => setIsConsoleOpen(false)}
            />
          )}
        </div>

        {/* Right Side: Explorer & Properties Panels */}
        {!isPlayMode && (isExplorerOpen || isPropertiesOpen) && (
          <div className="w-68 flex flex-col bg-[#1e1e24] border-l border-[#33333d] shrink-0">
            {isExplorerOpen && (
              <div className={isPropertiesOpen ? 'h-1/2' : 'h-full'}>
                <Explorer
                  instances={instances}
                  selectedId={selectedId}
                  onSelectInstance={setSelectedId}
                  onDeleteInstance={handleDeleteInstance}
                  onDuplicateInstance={handleDuplicateInstance}
                  onInsertPart={() => handleInsertPart('Block')}
                />
              </div>
            )}

            {isPropertiesOpen && (
              <div className={isExplorerOpen ? 'h-1/2 border-t border-[#33333d]' : 'h-full'}>
                <Properties
                  selectedInstance={selectedInstance}
                  onUpdateInstance={updateInstance}
                  onOpenScriptEditor={(id) => {
                    setEditingScriptInstanceId(id);
                    setActiveDocumentTab('script');
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Authentic Studio Status Bar */}
      <div className="h-6 px-3 bg-[#18181d] border-t border-[#2e2e36] flex items-center justify-between text-[11px] text-neutral-400 shrink-0 font-sans">
        <div className="flex items-center gap-4">
          <span>
            Workspace Parts: <strong className="text-neutral-200">{instances.length}</strong>
          </span>
          {selectedInstance && (
            <span>
              Selected: <strong className="text-[#38bdf8]">{selectedInstance.name}</strong> ({selectedInstance.className})
            </span>
          )}
          <span>
            State: <strong className="text-neutral-200">{isPlayMode ? 'Running F5' : 'Edit Mode'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span>Grid: {gridSnap} stud</span>
          <span>FPS: 60</span>
          <span className="text-emerald-400 font-semibold">Ready</span>
        </div>
      </div>

      {/* Publish to Roblox Modal */}
      {isPublishModalOpen && (
        <PublishModal
          currentInstances={instances}
          lighting={lighting}
          onSavePublishedGame={(newGame) => {
            setPublishedGames((prev) => [newGame, ...prev]);
            setCurrentGameTitle(newGame.title);
            addLog({
              type: 'info',
              text: `Published "${newGame.title}" to Roblox community gallery!`,
            });
          }}
          onClose={() => setIsPublishModalOpen(false)}
        />
      )}

      {/* Discover Games Modal */}
      {isGamesGalleryOpen && (
        <GamesGallery
          games={publishedGames}
          onPlayGame={(game) => {
            setInstances(game.instances);
            setCurrentGameTitle(game.title);
            setLighting(game.lighting);
            setIsGamesGalleryOpen(false);
            if (!isPlayMode) togglePlayMode();
          }}
          onEditGame={(game) => {
            setInstances(game.instances);
            setCurrentGameTitle(game.title);
            setLighting(game.lighting);
            setIsGamesGalleryOpen(false);
            if (isPlayMode) togglePlayMode();
            addLog({ type: 'info', text: `Loaded "${game.title}" into Roblox Studio.` });
          }}
          onNewFromTemplate={(template) => {
            if (template === 'baseplate') {
              setInstances(createBaseplateInstances());
              setCurrentGameTitle('Classic Baseplate');
            } else if (template === 'obby') {
              setInstances(createObbyInstances());
              setCurrentGameTitle('Super Obby Tower 3D');
            } else if (template === 'lava') {
              setInstances(createLavaEscapeInstances());
              setCurrentGameTitle('Lava Escape Parkour');
            }
            setIsGamesGalleryOpen(false);
          }}
          onImportGameFile={handleImportGameFile}
          onClose={() => setIsGamesGalleryOpen(false)}
        />
      )}
    </div>
  );
}
