import React from 'react';
import {
  X,
  Smartphone,
  Monitor,
  Sparkles,
  Volume2,
  Sliders,
  RotateCcw,
  Sun,
  Flame,
  Bomb,
  Layers,
  Zap,
} from 'lucide-react';
import { soundEngine } from '../engine/audio';
import { requestLandscapeMode } from '../engine/orientation';

export type UIMode = 'auto' | 'mobile' | 'desktop';

export interface AppSettings {
  uiMode: UIMode;
  soundEnabled: boolean;
  footstepsEnabled: boolean;
  impactSoundsEnabled: boolean;
  gravity: number; // -9.8 to -50
  dpadOpacity: number; // 0.3 to 1.0
  skyTheme: 'clear' | 'sunset' | 'night' | 'cyberpunk';
  timeOfDay: number;
}

interface AppSettingsModalProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClose: () => void;
  onSpawnPhysicsCrates: () => void;
  onTriggerExplosion: () => void;
  onResetScene: () => void;
}

export const AppSettingsModal: React.FC<AppSettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onSpawnPhysicsCrates,
  onTriggerExplosion,
  onResetScene,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 select-none font-sans overflow-y-auto">
      <div className="w-full max-w-lg bg-[#1e1e24] border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#26262e] border-b border-neutral-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Roblox App Settings & Realistic Modules
              </h2>
              <p className="text-[11px] text-neutral-400">
                Physics engine, Android / Desktop mode & realistic graphics
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-neutral-700/60 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* 1. Android vs Desktop Layout Toggle */}
          <div className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                <Smartphone className="w-4 h-4 text-sky-400" />
                <span>Interface Layout Mode</span>
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                Current: {settings.uiMode === 'auto' ? 'Auto Detect' : settings.uiMode.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* Option: Mobile */}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onUpdateSettings({ uiMode: 'mobile' });
                }}
                className={`py-2 px-2.5 rounded-lg flex flex-col items-center gap-1 font-semibold text-[11px] transition-all border ${
                  settings.uiMode === 'mobile'
                    ? 'bg-sky-600 text-white border-sky-400 shadow-md'
                    : 'bg-[#26262e] text-neutral-300 border-neutral-700/80 hover:bg-[#32323c]'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>📱 Android Mode</span>
              </button>

              {/* Option: Desktop */}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onUpdateSettings({ uiMode: 'desktop' });
                }}
                className={`py-2 px-2.5 rounded-lg flex flex-col items-center gap-1 font-semibold text-[11px] transition-all border ${
                  settings.uiMode === 'desktop'
                    ? 'bg-sky-600 text-white border-sky-400 shadow-md'
                    : 'bg-[#26262e] text-neutral-300 border-neutral-700/80 hover:bg-[#32323c]'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>💻 Desktop Studio</span>
              </button>

              {/* Option: Auto */}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onUpdateSettings({ uiMode: 'auto' });
                }}
                className={`py-2 px-2.5 rounded-lg flex flex-col items-center gap-1 font-semibold text-[11px] transition-all border ${
                  settings.uiMode === 'auto'
                    ? 'bg-sky-600 text-white border-sky-400 shadow-md'
                    : 'bg-[#26262e] text-neutral-300 border-neutral-700/80 hover:bg-[#32323c]'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>🔄 Auto Detect</span>
              </button>
            </div>
            <p className="text-[10px] text-neutral-400 leading-tight">
              Android mode gives a full-screen 3D viewport with bottom drawers and analog touch joystick.
            </p>

            {/* Landscape Lock Action */}
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
              <div>
                <div className="text-white font-semibold text-[11px] flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-sky-400 rotate-90" />
                  <span>Phone Landscape Mode</span>
                </div>
                <div className="text-neutral-400 text-[10px]">Turn on wide landscape orientation for Roblox</div>
              </div>
              <button
                onClick={async () => {
                  soundEngine.playClick();
                  await requestLandscapeMode();
                }}
                className="py-1.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors shadow"
              >
                <span>Rotate Landscape</span>
              </button>
            </div>
          </div>

          {/* 2. Cannon.js Real-time Physics Engine */}
          <div className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Cannon.js Physics Engine</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            {/* Gravity Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-300">Gravity Strength</span>
                <span className="font-mono text-amber-400 font-bold">{settings.gravity} m/s²</span>
              </div>
              <input
                type="range"
                min="-50"
                max="-5"
                step="1"
                value={settings.gravity}
                onChange={(e) => onUpdateSettings({ gravity: Number(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                <span>Moon (-5)</span>
                <span>Roblox Standard (-28)</span>
                <span>Heavy (-50)</span>
              </div>
            </div>

            {/* Quick Physics Spawn Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onSpawnPhysicsCrates();
                }}
                className="py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1.5 font-semibold text-[11px] transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>+ Spawn 6 Crates</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playExplosion();
                  onTriggerExplosion();
                }}
                className="py-2 px-3 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/40 flex items-center justify-center gap-1.5 font-semibold text-[11px] transition-colors"
              >
                <Bomb className="w-3.5 h-3.5 text-red-400" />
                <span>💥 Trigger Blast</span>
              </button>
            </div>
          </div>

          {/* 3. Realistic Atmosphere & Lighting Module */}
          <div className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-3">
            <span className="font-bold text-white flex items-center gap-1.5 text-xs">
              <Sun className="w-4 h-4 text-orange-400" />
              <span>Realistic Atmosphere & Skybox</span>
            </span>

            {/* Time of Day */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-300">Time of Day (Sun & Shadows)</span>
                <span className="font-mono text-orange-400 font-bold">{settings.timeOfDay}:00 hrs</span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                step="1"
                value={settings.timeOfDay}
                onChange={(e) => onUpdateSettings({ timeOfDay: Number(e.target.value) })}
                className="w-full accent-orange-400 cursor-pointer"
              />
            </div>

            {/* Sky Theme options */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {(['clear', 'sunset', 'night', 'cyberpunk'] as const).map((sky) => (
                <button
                  key={sky}
                  onClick={() => {
                    soundEngine.playClick();
                    onUpdateSettings({ skyTheme: sky });
                  }}
                  className={`py-1.5 px-1 rounded-md text-[10px] font-bold capitalize transition-all border ${
                    settings.skyTheme === sky
                      ? 'bg-orange-500 text-white border-orange-300'
                      : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                  }`}
                >
                  {sky}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Realistic Audio & Sounds */}
          <div className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2.5">
            <span className="font-bold text-white flex items-center gap-1.5 text-xs">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Realistic Audio Module</span>
            </span>

            <div className="space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-neutral-300 text-[11px]">Dynamic Impact Collisions</span>
                <input
                  type="checkbox"
                  checked={settings.impactSoundsEnabled}
                  onChange={(e) => onUpdateSettings({ impactSoundsEnabled: e.target.checked })}
                  className="rounded accent-emerald-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-neutral-300 text-[11px]">Walking Footstep Sounds</span>
                <input
                  type="checkbox"
                  checked={settings.footstepsEnabled}
                  onChange={(e) => onUpdateSettings({ footstepsEnabled: e.target.checked })}
                  className="rounded accent-emerald-500 w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* 5. Mobile Touch D-Pad Settings */}
          <div className="p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-neutral-300 font-semibold">Touch D-Pad Opacity</span>
              <span className="font-mono text-sky-400 font-bold">
                {Math.round(settings.dpadOpacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.3"
              max="1.0"
              step="0.05"
              value={settings.dpadOpacity}
              onChange={(e) => onUpdateSettings({ dpadOpacity: Number(e.target.value) })}
              className="w-full accent-sky-400 cursor-pointer"
            />
          </div>

          {/* Scene Reset Action */}
          <div className="pt-1 flex items-center justify-between">
            <button
              onClick={() => {
                soundEngine.playClick();
                onResetScene();
                onClose();
              }}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload Physics Playground</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg transition-colors"
            >
              Done & Return to Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
