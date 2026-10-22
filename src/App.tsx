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
import { AppSettingsModal, AppSettings } from './components/AppSettingsModal';
import { MobileBottomDock } from './components/MobileBottomDock';
import * as THREE from 'three';
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
  createRealisticPhysicsPlaygroundInstances,
  DEFAULT_PUBLISHED_GAMES,
} from './engine/templates';
import { scriptRunner } from './engine/scriptRunner';
import { soundEngine } from './engine/audio';
import { physicsEngine } from './engine/physics';
import { isDeviceLandscape, requestLandscapeMode, subscribeOrientation } from './engine/orientation';
import { Box, Code2, X, Smartphone, Monitor, Settings, Play, Square, Bomb, Globe, Upload } from 'lucide-react';
import { PWAInstallButton } from './components/PWAInstallButton';

const STORAGE_GAMES_KEY = 'roblox_studio_web_games_v1';
const STORAGE_CURRENT_PLACE_KEY = 'roblox_studio_current_place_v2';
const STORAGE_SETTINGS_KEY = 'roblox_studio_settings_v2';

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
  const [currentGameTitle, setCurrentGameTitle] = useState('⚡ Realistic Physics Playground');

  // App Settings (Android / Desktop mode, Cannon.js physics, Audio, Atmosphere)
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return {
      uiMode: 'auto',
      soundEnabled: true,
      footstepsEnabled: true,
      impactSoundsEnabled: true,
      gravity: -28,
      dpadOpacity: 0.9,
      skyTheme: 'clear',
      timeOfDay: 14,
    };
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeMobileDrawer, setActiveMobileDrawer] = useState<'explorer' | 'properties' | 'toolbox' | 'script' | 'console' | null>(null);

  // Viewport & Orientation detection (Phones & Touch devices)
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768 || 'ontouchstart' in window;
  });
  const [isLandscape, setIsLandscape] = useState<boolean>(() => isDeviceLandscape());

  // Virtual Joystick & Multi-touch Input State
  const [joystickVector, setJoystickVector] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isJumpActive, setIsJumpActive] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 768 || 'ontouchstart' in window);
      setIsLandscape(isDeviceLandscape());
    };
    window.addEventListener('resize', handleResize);
    const unsub = subscribeOrientation((landscape) => {
      setIsLandscape(landscape);
    });

    // Auto-request landscape on mobile devices
    if (isMobileViewport) {
      requestLandscapeMode();
    }
    const handleFirstGesture = () => {
      requestLandscapeMode();
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      unsub();
    };
  }, [isMobileViewport]);

  const isMobileLayout = appSettings.uiMode === 'mobile' || (appSettings.uiMode === 'auto' && isMobileViewport);

  // Sync physics engine gravity
  useEffect(() => {
    physicsEngine.setGravity(appSettings.gravity);
  }, [appSettings.gravity]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(appSettings));
    } catch {
      // Ignored
    }
  }, [appSettings]);

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
    timeOfDay: appSettings.timeOfDay,
    ambientColor: '#ffffff',
    fogDensity: 0.003,
    skyType: appSettings.skyTheme,
  });

  // Update lighting when appSettings change
  useEffect(() => {
    setLighting((prev) => ({
      ...prev,
      timeOfDay: appSettings.timeOfDay,
      skyType: appSettings.skyTheme,
    }));
  }, [appSettings.timeOfDay, appSettings.skyTheme]);

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

  // Output Logs
  const [logs, setLogs] = useState<OutputLog[]>([
    {
      id: 'log-1',
      type: 'info',
      text: 'Roblox Studio Web Engine (Cannon.js Real-time Physics Active)',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

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

  // Update App Settings
  const handleUpdateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setAppSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Trigger Cannon.js physics impulse explosion
  const handleTriggerExplosion = useCallback(() => {
    soundEngine.playExplosion();
    const center = new THREE.Vector3(0, 2, 0);
    physicsEngine.applyExplosion(center, 380, 30);
    addLog({ type: 'info', text: '💥 Physics impulse explosion blast triggered!' });
  }, [addLog]);

  // Spawn dynamic unanchored wooden crates
  const handleSpawnPhysicsCrates = useCallback(() => {
    soundEngine.playSpawn();
    const newCrates: RobloxInstance[] = [];
    const colors = ['#b45309', '#d97706', '#92400e', '#78350f'];
    let count = 1;
    for (let y = 0; y < 2; y++) {
      for (let x = -1; x <= 1; x++) {
        newCrates.push({
          id: `crate-dyn-${Date.now()}-${count++}`,
          name: `PushableCrate_${count}`,
          className: 'Part',
          parentId: 'workspace',
          shape: 'Block',
          position: { x: x * 3.4, y: 3 + y * 3.4, z: 2 },
          size: { x: 3, y: 3, z: 3 },
          rotation: { x: 0, y: 0, z: 0 },
          color: colors[count % colors.length],
          material: 'Wood',
          transparency: 0,
          reflectance: 0.1,
          anchored: false,
          canCollide: true,
          castShadow: true,
        });
      }
    }
    setInstances((prev) => [...prev, ...newCrates]);
    addLog({ type: 'print', text: 'Spawned 6 dynamic unanchored wooden crates!' });
  }, [addLog]);

  // Reset to initial Realistic Physics Playground
  const handleResetScene = useCallback(() => {
    const playground = createRealisticPhysicsPlaygroundInstances();
    setInstances(playground);
    setCurrentGameTitle('⚡ Realistic Physics Playground');
    setSelectedId(null);
    addLog({ type: 'info', text: 'Reset workspace to Realistic Physics Playground' });
  }, [addLog]);

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
    <div className="flex flex-col w-screen h-screen bg-[#1e1e24] text-white overflow-hidden font-sans select-none relative">
      {/* ======================================================== */}
      {/* 1. TOP HEADER (MOBILE VS DESKTOP) */}
      {/* ======================================================== */}
      {isMobileLayout ? (
        // Mobile / Android Top Bar
        <div className="h-11 px-3 bg-[#1a1a1e] border-b border-[#2e2e36] flex items-center justify-between text-xs shrink-0 select-none z-30">
          {/* Logo & Title */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 bg-[#00a2ff] rounded flex items-center justify-center transform -rotate-12 shadow">
              <div className="w-2 h-2 bg-white rounded-2xs transform rotate-12" />
            </div>
            <span className="font-bold text-white text-xs truncate max-w-[130px] sm:max-w-xs">
              {currentGameTitle}
            </span>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5">
            {/* Android / Desktop Toggle */}
            <button
              onClick={() => handleUpdateSettings({ uiMode: isMobileLayout ? 'desktop' : 'mobile' })}
              className="flex items-center gap-1 px-2 py-1 rounded bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-300 text-[11px] font-bold transition-colors"
              title="Switch to Desktop / Android UI"
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-[10px]">Android</span>
            </button>

            {/* Landscape Mode Button */}
            <button
              onClick={async () => {
                soundEngine.playClick();
                await requestLandscapeMode();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sky-300 text-[11px] font-bold transition-colors"
              title="Turn on Landscape Mode"
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-400 rotate-90" />
              <span className="hidden sm:inline text-[10px]">Landscape</span>
            </button>

            {/* Play / Stop */}
            <button
              onClick={togglePlayMode}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-bold text-xs shadow-md transition-colors ${
                isPlayMode ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              {isPlayMode ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
              <span>{isPlayMode ? 'Stop' : 'Play'}</span>
            </button>

            {/* Discover Games */}
            <button
              onClick={() => setIsGamesGalleryOpen(true)}
              className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700"
              title="Games Gallery"
            >
              <Globe className="w-4 h-4 text-sky-400" />
            </button>

            {/* App Settings Button */}
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-1.5 rounded-lg bg-neutral-800 text-neutral-200 border border-neutral-700 hover:bg-neutral-700 transition-colors"
              title="App Settings & Realistic Physics"
            >
              <Settings className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      ) : (
        // Authentic Desktop Studio Ribbon Bar
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
          uiMode={appSettings.uiMode}
          onToggleUIMode={() => handleUpdateSettings({ uiMode: isMobileLayout ? 'desktop' : 'mobile' })}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onTriggerExplosion={handleTriggerExplosion}
        />
      )}

      {/* ======================================================== */}
      {/* 2. MAIN WORKSTATION / 3D VIEWPORT */}
      {/* ======================================================== */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Drawer: Toolbox (Desktop only) */}
        {!isMobileLayout && isToolboxOpen && (
          <Toolbox
            onInsertModel={handleInsertModel}
            onClose={() => setIsToolboxOpen(false)}
          />
        )}

        {/* Center: Document Tabs + 3D Viewport or Script Editor */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#18181c] relative">
          {/* Authentic Document Tabstrip (Desktop Mode only) */}
          {!isMobileLayout && (
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
          )}

          {/* Main Document Content */}
          <div className="flex-1 relative overflow-hidden">
            {/* 3D Viewport */}
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
                joystickInput={joystickVector}
                isJumpPressed={isJumpActive}
              />

              {/* Landscape Orientation Recommendation Banner (Mobile Portrait) */}
              {isMobileLayout && !isLandscape && (
                <div className="absolute top-3 inset-x-3 z-50 bg-black/85 backdrop-blur-md border border-sky-500/50 rounded-xl p-2.5 shadow-2xl flex items-center justify-between text-xs select-none">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                      <Smartphone className="w-4 h-4 rotate-90" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-[11px] leading-tight">Landscape Mode Recommended</div>
                      <div className="text-[10px] text-neutral-400 leading-tight">Rotate phone for full Roblox experience</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      requestLandscapeMode();
                    }}
                    className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] rounded-lg shadow transition-colors flex items-center gap-1"
                  >
                    <span>Rotate</span>
                  </button>
                </div>
              )}

              {/* In-Game Roblox TopBar & Touch Controls in Play Mode */}
              {isPlayMode && (
                <PlayHUD
                  playerStats={playerStats}
                  gameTitle={currentGameTitle}
                  onExitPlayMode={togglePlayMode}
                  onResetCharacter={handleResetCharacter}
                  dpadOpacity={appSettings.dpadOpacity}
                  onJoystickMove={setJoystickVector}
                  onJumpChange={setIsJumpActive}
                />
              )}

              {/* Mobile Ergonomic Bottom Dock (Only in Mobile UI and when not playing) */}
              {isMobileLayout && !isPlayMode && (
                <MobileBottomDock
                  isPlayMode={isPlayMode}
                  onTogglePlayMode={togglePlayMode}
                  onOpenSettings={() => setIsSettingsModalOpen(true)}
                  onTriggerExplosion={handleTriggerExplosion}
                  onQuickInsertPart={() => handleInsertPart('Block')}
                  activeDrawer={activeMobileDrawer}
                  onSetActiveDrawer={setActiveMobileDrawer}
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

          {/* Bottom Dock: Output Console (Desktop Mode only) */}
          {!isMobileLayout && isConsoleOpen && !isPlayMode && (
            <OutputConsole
              logs={logs}
              onClearLogs={() => setLogs([])}
              onExecuteCommand={handleExecuteCommand}
              onClose={() => setIsConsoleOpen(false)}
            />
          )}
        </div>

        {/* Right Side: Explorer & Properties Panels (Desktop Mode only) */}
        {!isMobileLayout && !isPlayMode && (isExplorerOpen || isPropertiesOpen) && (
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

      {/* ======================================================== */}
      {/* 3. MOBILE SLIDING BOTTOM DRAWER (FOR EXPLORER/PROPERTIES) */}
      {/* ======================================================== */}
      {isMobileLayout && activeMobileDrawer && (
        <div className="fixed inset-x-0 bottom-0 z-50 h-[56vh] bg-[#1e1e24] border-t-2 border-[#00a2ff] shadow-2xl flex flex-col font-sans animate-in slide-in-from-bottom duration-200">
          {/* Drawer Header */}
          <div className="h-9 px-4 bg-[#26262e] border-b border-[#36363d] flex items-center justify-between">
            <span className="font-bold text-xs text-white uppercase tracking-wider">
              {activeMobileDrawer === 'explorer' && '🌲 Explorer Workspace'}
              {activeMobileDrawer === 'properties' && '⚙️ Properties Inspector'}
              {activeMobileDrawer === 'toolbox' && '🧰 Creator Toolbox'}
              {activeMobileDrawer === 'console' && '📟 Output Console'}
            </span>
            <button
              onClick={() => setActiveMobileDrawer(null)}
              className="p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-hidden">
            {activeMobileDrawer === 'explorer' && (
              <Explorer
                instances={instances}
                selectedId={selectedId}
                onSelectInstance={setSelectedId}
                onDeleteInstance={handleDeleteInstance}
                onDuplicateInstance={handleDuplicateInstance}
                onInsertPart={() => handleInsertPart('Block')}
              />
            )}
            {activeMobileDrawer === 'properties' && (
              <Properties
                selectedInstance={selectedInstance}
                onUpdateInstance={updateInstance}
                onOpenScriptEditor={(id) => {
                  setEditingScriptInstanceId(id);
                  setActiveDocumentTab('script');
                  setActiveMobileDrawer(null);
                }}
              />
            )}
            {activeMobileDrawer === 'toolbox' && (
              <Toolbox
                onInsertModel={handleInsertModel}
                onClose={() => setActiveMobileDrawer(null)}
              />
            )}
            {activeMobileDrawer === 'console' && (
              <OutputConsole
                logs={logs}
                onClearLogs={() => setLogs([])}
                onExecuteCommand={handleExecuteCommand}
                onClose={() => setActiveMobileDrawer(null)}
              />
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. DESKTOP STATUS BAR */}
      {/* ======================================================== */}
      {!isMobileLayout && (
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
              Physics: <strong className="text-amber-400">Cannon.js Active</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span>Gravity: {appSettings.gravity} m/s²</span>
            <span>Grid: {gridSnap} stud</span>
            <span className="text-emerald-400 font-semibold">● Real-time Physics</span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. MODALS: APP SETTINGS, PUBLISH, DISCOVER GAMES */}
      {/* ======================================================== */}
      {isSettingsModalOpen && (
        <AppSettingsModal
          settings={appSettings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setIsSettingsModalOpen(false)}
          onSpawnPhysicsCrates={handleSpawnPhysicsCrates}
          onTriggerExplosion={handleTriggerExplosion}
          onResetScene={handleResetScene}
        />
      )}

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
              setInstances(createRealisticPhysicsPlaygroundInstances());
              setCurrentGameTitle('⚡ Realistic Physics Playground');
            } else if (template === 'obby') {
              setInstances(createObbyInstances());
              setCurrentGameTitle('⭐ Super Obby Tower 3D');
            } else if (template === 'lava') {
              setInstances(createLavaEscapeInstances());
              setCurrentGameTitle('🌋 Lava Escape Volcano');
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
