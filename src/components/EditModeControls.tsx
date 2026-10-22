import React, { useState } from 'react';
import { VirtualJoystick, JoystickVector } from './VirtualJoystick';
import {
  ArrowUp,
  ArrowDown,
  Zap,
  User,
  Compass,
  Eye,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { soundEngine } from '../engine/audio';

interface EditModeControlsProps {
  onJoystickMove: (vec: JoystickVector) => void;
  onFlyElevationChange: (elevation: number) => void; // 1 = up, -1 = down, 0 = idle
  isEditAvatarMode: boolean;
  onToggleEditAvatarMode: () => void;
  isFastFly: boolean;
  onToggleFastFly: () => void;
  opacity?: number;
  onResetView?: () => void;
}

export const EditModeControls: React.FC<EditModeControlsProps> = ({
  onJoystickMove,
  onFlyElevationChange,
  isEditAvatarMode,
  onToggleEditAvatarMode,
  isFastFly,
  onToggleFastFly,
  opacity = 0.92,
  onResetView,
}) => {
  const [isElevatingUp, setIsElevatingUp] = useState(false);
  const [isElevatingDown, setIsElevatingDown] = useState(false);
  const [isJoystickMinimized, setIsJoystickMinimized] = useState(false);

  const handleFlyUpStart = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setIsElevatingUp(true);
    onFlyElevationChange(1);
  };

  const handleFlyUpEnd = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setIsElevatingUp(false);
    onFlyElevationChange(0);
  };

  const handleFlyDownStart = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setIsElevatingDown(true);
    onFlyElevationChange(-1);
  };

  const handleFlyDownEnd = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setIsElevatingDown(false);
    onFlyElevationChange(0);
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 overflow-hidden font-sans">
      {/* ======================================================== */}
      {/* 1. BOTTOM-LEFT: VIRTUAL ANALOG JOYSTICK IN EDIT MODE */}
      {/* ======================================================== */}
      <div className="absolute bottom-4 left-3 sm:left-5 pointer-events-auto select-none touch-none flex flex-col items-start gap-1">
        {/* Joystick Header Badge with Mode & Minimize Toggle */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] text-neutral-300 font-mono shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white text-[9px] uppercase tracking-wider">
            {isEditAvatarMode ? 'Player Walk' : 'Free Fly'}
          </span>
          <button
            onClick={() => {
              soundEngine.playClick();
              setIsJoystickMinimized(!isJoystickMinimized);
            }}
            className="ml-1 text-neutral-400 hover:text-white px-1 hover:bg-white/10 rounded transition-colors"
            title={isJoystickMinimized ? 'Show Joystick' : 'Minimize Joystick'}
          >
            {isJoystickMinimized ? '▲ Show' : '▼ Hide'}
          </button>
        </div>

        {/* Joystick Wheel */}
        {!isJoystickMinimized && (
          <div className="relative group">
            <VirtualJoystick
              onMove={onJoystickMove}
              onEnd={() => onJoystickMove({ x: 0, y: 0 })}
              opacity={opacity}
              size={125}
            />
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. BOTTOM-RIGHT: ELEVATION (FLY UP/DOWN) & SPEED BOOST */}
      {/* ======================================================== */}
      <div className="absolute bottom-4 right-3 sm:right-5 pointer-events-auto select-none touch-none flex flex-col items-end gap-2">
        {/* Top Mini Control Bar: Avatar vs Flycam Toggle & Turbo Speed */}
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-2xl border border-white/15 shadow-xl">
          {/* Avatar / Freecam Mode Toggle */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleEditAvatarMode();
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold text-[10px] transition-all ${
              isEditAvatarMode
                ? 'bg-sky-600 text-white shadow-md shadow-sky-500/30'
                : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300'
            }`}
            title="Toggle between Player Avatar Walk mode and Flying Camera mode"
          >
            {isEditAvatarMode ? (
              <>
                <User className="w-3 h-3" />
                <span>Player</span>
              </>
            ) : (
              <>
                <Compass className="w-3 h-3" />
                <span>Flycam</span>
              </>
            )}
          </button>

          {/* Turbo Speed Toggle */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleFastFly();
            }}
            className={`flex items-center gap-0.5 px-2 py-1 rounded-xl font-bold text-[10px] transition-all ${
              isFastFly
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/40'
                : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300'
            }`}
            title="Toggle Turbo Flight Speed (2.5x)"
          >
            <Zap className="w-3 h-3 fill-current" />
            <span>{isFastFly ? '2.5x' : '1x'}</span>
          </button>
        </div>

        {/* Vertical Fly Elevation Buttons (Up & Down) */}
        <div className="flex flex-col gap-1.5 items-center">
          {/* Fly Up Button */}
          <button
            onTouchStart={handleFlyUpStart}
            onTouchEnd={handleFlyUpEnd}
            onTouchCancel={handleFlyUpEnd}
            onMouseDown={handleFlyUpStart}
            onMouseUp={handleFlyUpEnd}
            onMouseLeave={handleFlyUpEnd}
            className={`w-12 h-12 rounded-2xl border-2 flex flex-col items-center justify-center shadow-xl backdrop-blur-md select-none touch-none transition-all duration-75 active:scale-95 ${
              isElevatingUp
                ? 'bg-sky-500 border-white text-white shadow-sky-500/50 scale-105'
                : 'bg-black/55 hover:bg-black/75 border-white/20 text-neutral-200'
            }`}
            title="Fly Up (Elevation +Y)"
          >
            <ArrowUp className="w-5 h-5" />
            <span className="text-[8px] font-bold font-mono leading-none">UP</span>
          </button>

          {/* Fly Down Button */}
          <button
            onTouchStart={handleFlyDownStart}
            onTouchEnd={handleFlyDownEnd}
            onTouchCancel={handleFlyDownEnd}
            onMouseDown={handleFlyDownStart}
            onMouseUp={handleFlyDownEnd}
            onMouseLeave={handleFlyDownEnd}
            className={`w-12 h-12 rounded-2xl border-2 flex flex-col items-center justify-center shadow-xl backdrop-blur-md select-none touch-none transition-all duration-75 active:scale-95 ${
              isElevatingDown
                ? 'bg-sky-500 border-white text-white shadow-sky-500/50 scale-105'
                : 'bg-black/55 hover:bg-black/75 border-white/20 text-neutral-200'
            }`}
            title="Fly Down (Elevation -Y)"
          >
            <ArrowDown className="w-5 h-5" />
            <span className="text-[8px] font-bold font-mono leading-none">DOWN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
