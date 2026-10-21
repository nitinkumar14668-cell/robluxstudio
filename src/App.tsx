/**
 * Roblox Studio Web - 3D Game Creator & Publisher
 * Complete web recreation of Roblox Studio (.exe)
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
import { VercelDeployModal } from './components/VercelDeployModal';
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

const STORAGE_GAMES_KEY = 'roblox_studio_web_games_v1';
const STORAGE_CURRENT_PLACE_KEY = 'roblox_studio_current_place_v1';

export default function App() {
  // Studio UI Layout States
  const [activeTab, setActiveTab] = useState<StudioTab>('home');
  const [transformMode, setTransformMode] = useState<TransformMode>('select');
  const [gridSnap, setGridSnap] = useState<number>(1);
  const [anchoredDefault, setAnchoredDefault] = useState<boolean>(true);
  const [canCollideDefault, setCanCollideDefault] = useState<boolean>(true);

  // Panel Toggles
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true);
  const [isToolboxOpen, setIsToolboxOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [isScriptEditorOpen, setIsScriptEditorOpen] = useState(false);
  const [editingScriptInstanceId, setEditingScriptInstanceId] = useState<string | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isGamesGalleryOpen, setIsGamesGalleryOpen] = useState(false);
  const [isVercelModalOpen, setIsVercelModalOpen] = useState(false);

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
      text: 'Roblox Studio Web 2026 initialized successfully. Ready to build!',
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

  // Save to localStorage
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

  // Append Log Helper
  const addLog = useCallback(
    (log: Omit<OutputLog, 'id' | 'timestamp'>) => {
      setLogs((prev) => [
        ...prev.slice(-100),
        {
          ...log,
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    },
    []
  );

  // Update instance helper with undo snapshot
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
      // Starting Play Test
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

      // Execute scripts on instances
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
      // Stopping Play Test: Restore scene
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

  // Reset Character inside Play Mode
  const handleResetCharacter = useCallback(() => {
    soundEngine.playOof();
    setPlayerStats((prev) => ({ ...prev, health: 0 }));
    addLog({
      type: 'warn',
      text: 'Character reset.',
    });
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
      let color = '#94a3b8';
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
        name = 'LavaKillBlock';
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

  // Insert NPC Rig
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
      dialogue: 'Oof! Ready to build awesome Roblox games in browser!',
    };

    setInstances((prev) => [...prev, newNPC]);
    setSelectedId(id);
    addLog({
      type: 'print',
      text: `Inserted NPC Rig into Workspace`,
    });
  }, [instances, addLog]);

  // Insert Script
  const handleInsertScript = useCallback(() => {
    soundEngine.playClick();
    const targetId = selectedId || (instances[0] ? instances[0].id : null);
    if (!targetId) return;

    setEditingScriptInstanceId(targetId);
    setIsScriptEditorOpen(true);
    addLog({
      type: 'info',
      text: `Opened Script Editor for instance`,
    });
  }, [selectedId, instances, addLog]);

  // Insert Pre-made Model from Toolbox
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
        text: `Inserted model package (${created.length} parts) into Workspace`,
      });
    },
    [instances, addLog]
  );

  // Quick Obby / Arena Generator
  const handleQuickGenerate = useCallback(
    (type: 'obby' | 'arena' | 'castle') => {
      soundEngine.playCheckpoint();
      setHistory((h) => [...h.slice(-20), instances]);
      setFuture([]);

      if (type === 'obby') {
        const obbyStages = createObbyInstances().filter((i) => i.name !== 'Baseplate');
        setInstances((prev) => [...prev, ...obbyStages]);
        addLog({
          type: 'info',
          text: `Generated Super Obby stages (${obbyStages.length} obstacles) in Workspace!`,
        });
      } else if (type === 'arena') {
        const lavaStages = createLavaEscapeInstances().filter((i) => i.name !== 'Baseplate');
        setInstances((prev) => [...prev, ...lavaStages]);
        addLog({
          type: 'info',
          text: `Generated Lava Arena obstacle course in Workspace!`,
        });
      }
    },
    [instances, addLog]
  );

  // Delete Instance
  const handleDeleteInstance = useCallback(
    (id: string) => {
      const inst = instances.find((i) => i.id === id);
      if (!inst || inst.name === 'Baseplate') return;
      soundEngine.playClick();
      setHistory((h) => [...h.slice(-20), instances]);
      setFuture([]);
      setInstances((prev) => prev.filter((i) => i.id !== id));
      if (selectedId === id) setSelectedId(null);
      addLog({
        type: 'warn',
        text: `Deleted instance ${inst.name}`,
      });
    },
    [instances, selectedId, addLog]
  );

  // Duplicate Instance
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
      addLog({
        type: 'print',
        text: `Duplicated ${inst.name} -> ${copy.name}`,
      });
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

  // Save place to downloadable .rbxl JSON file
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

    addLog({
      type: 'print',
      text: `Saved place to file: ${a.download}`,
    });
  }, [currentGameTitle, instances, lighting, addLog]);

  // Import .rbxl JSON file
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
          addLog({
            type: 'error',
            text: `Failed to parse place file: ${file.name}`,
          });
        }
      };
      reader.readAsText(file);
    },
    [addLog]
  );

  // Execute Luau command in command bar
  const handleExecuteCommand = useCallback(
    (cmd: string) => {
      addLog({
        type: 'print',
        text: `> ${cmd}`,
      });

      // Simple Luau command interpreter:
      if (cmd.startsWith('print(')) {
        const match = cmd.match(/print\((['"]?)(.*?)\1\)/);
        if (match) {
          addLog({ type: 'print', text: match[2] });
        }
      } else if (cmd.includes('.Color =')) {
        const hex = cmd.split('=')[1]?.trim().replace(/['"]/g, '');
        if (selectedId && hex) {
          updateInstance(selectedId, { color: hex });
          addLog({ type: 'info', text: `Set color to ${hex}` });
        }
      } else if (cmd === 'clear' || cmd === 'cls') {
        setLogs([]);
      } else if (cmd === 'help') {
        addLog({
          type: 'info',
          text: 'Available commands: print("text"), clear, help, workspace.Baseplate.Color = "#hex"',
        });
      } else {
        addLog({
          type: 'info',
          text: `Executed statement: ${cmd}`,
        });
      }
    },
    [selectedId, updateInstance, addLog]
  );

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // F5 to Toggle Play Test
      if (e.key === 'F5') {
        e.preventDefault();
        togglePlayMode();
      }

      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Ctrl/Cmd + Y or Ctrl+Shift+Z: Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      }

      // Delete or Backspace: Delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        handleDeleteInstance(selectedId);
      }

      // Ctrl/Cmd + D: Duplicate selected
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedId) {
        e.preventDefault();
        handleDuplicateInstance(selectedId);
      }

      // Ctrl/Cmd + S: Save Place
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

  return (
    <div className="flex flex-col w-screen h-screen bg-[#18181c] text-white overflow-hidden font-sans">
      {/* Top Ribbon Bar (Studio Tabs & Actions) */}
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
        onOpenVercelDeploy={() => setIsVercelModalOpen(true)}
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
        onQuickGenerate={handleQuickGenerate}
        isConsoleOpen={isConsoleOpen}
        onToggleConsole={() => setIsConsoleOpen((c) => !c)}
        isToolboxOpen={isToolboxOpen}
        onToggleToolbox={() => setIsToolboxOpen((t) => !t)}
        isExplorerOpen={isExplorerOpen}
        onToggleExplorer={() => setIsExplorerOpen((e) => !e)}
        isPropertiesOpen={isPropertiesOpen}
        onToggleProperties={() => setIsPropertiesOpen((p) => !p)}
        isScriptEditorOpen={isScriptEditorOpen}
        onToggleScriptEditor={() => {
          if (selectedId) setEditingScriptInstanceId(selectedId);
          setIsScriptEditorOpen((s) => !s);
        }}
      />

      {/* Main Studio Work Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Toolbox (if open) */}
        {isToolboxOpen && (
          <Toolbox
            onInsertModel={handleInsertModel}
            onClose={() => setIsToolboxOpen(false)}
          />
        )}

        {/* Center: 3D Viewport & Play HUD Overlay */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          <div className="flex-1 relative">
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

            {/* In-Game Roblox TopBar HUD when in Play Mode */}
            {isPlayMode && (
              <PlayHUD
                playerStats={playerStats}
                gameTitle={currentGameTitle}
                onExitPlayMode={togglePlayMode}
                onResetCharacter={handleResetCharacter}
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
          <div className="w-64 flex flex-col bg-[#1e1e24] border-l border-neutral-800">
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
              <div className={isExplorerOpen ? 'h-1/2' : 'h-full'}>
                <Properties
                  selectedInstance={selectedInstance}
                  onUpdateInstance={updateInstance}
                  onOpenScriptEditor={(id) => {
                    setEditingScriptInstanceId(id);
                    setIsScriptEditorOpen(true);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Bar at Bottom */}
      <div className="h-6 px-3 bg-[#17171b] border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400 select-none">
        <div className="flex items-center gap-4">
          <span>
            Objects: <strong className="text-neutral-200">{instances.length}</strong>
          </span>
          {selectedInstance && (
            <span>
              Selected: <strong className="text-sky-400">{selectedInstance.name}</strong> ({selectedInstance.className})
            </span>
          )}
          <span>
            Mode: <strong className="text-neutral-200">{isPlayMode ? 'Testing (In-Game)' : 'Edit Mode'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span>Grid Snap: {gridSnap} stud</span>
          <span>FPS: 60</span>
          <span className="text-emerald-400 font-semibold">● Ready</span>
        </div>
      </div>

      {/* Script Editor Modal */}
      {isScriptEditorOpen && (
        <ScriptEditor
          instance={
            instances.find((i) => i.id === editingScriptInstanceId) ||
            selectedInstance ||
            instances[0] ||
            null
          }
          onSaveScript={(instId, code) => {
            updateInstance(instId, { scriptContent: code });
            addLog({
              type: 'info',
              text: `Saved script to instance ${instId}`,
            });
          }}
          onClose={() => setIsScriptEditorOpen(false)}
        />
      )}

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
              text: `Published experience "${newGame.title}" to Roblox community gallery!`,
            });
          }}
          onClose={() => setIsPublishModalOpen(false)}
        />
      )}

      {/* Games Gallery / Discover Modal */}
      {isGamesGalleryOpen && (
        <GamesGallery
          games={publishedGames}
          onPlayGame={(game) => {
            setInstances(game.instances);
            setCurrentGameTitle(game.title);
            setLighting(game.lighting);
            setIsGamesGalleryOpen(false);
            if (!isPlayMode) {
              togglePlayMode();
            }
          }}
          onEditGame={(game) => {
            setInstances(game.instances);
            setCurrentGameTitle(game.title);
            setLighting(game.lighting);
            setIsGamesGalleryOpen(false);
            if (isPlayMode) {
              togglePlayMode();
            }
            addLog({
              type: 'info',
              text: `Loaded "${game.title}" into Roblox Studio for editing.`,
            });
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
            addLog({
              type: 'info',
              text: `Created new project from ${template} template.`,
            });
          }}
          onImportGameFile={handleImportGameFile}
          onClose={() => setIsGamesGalleryOpen(false)}
        />
      )}

      {/* Vercel Deploy Guide Modal */}
      {isVercelModalOpen && (
        <VercelDeployModal onClose={() => setIsVercelModalOpen(false)} />
      )}
    </div>
  );
}
