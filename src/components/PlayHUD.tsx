import React, { useState } from 'react';
import { LogOut, RefreshCw, MessageSquare, Send, Trophy, Heart, Maximize2, Smartphone } from 'lucide-react';
import { PlayerStats } from '../types/roblox';
import { soundEngine } from '../engine/audio';
import { VirtualJoystick, JoystickVector } from './VirtualJoystick';
import { requestLandscapeMode, toggleFullscreen } from '../engine/orientation';

interface PlayHUDProps {
  playerStats: PlayerStats;
  gameTitle: string;
  onExitPlayMode: () => void;
  onResetCharacter: () => void;
  dpadOpacity?: number;
  onJoystickMove?: (vec: JoystickVector) => void;
  onJumpChange?: (isJumping: boolean) => void;
}

export const PlayHUD: React.FC<PlayHUDProps> = ({
  playerStats,
  gameTitle,
  onExitPlayMode,
  onResetCharacter,
  dpadOpacity = 0.9,
  onJoystickMove,
  onJumpChange,
}) => {
  const [isEscMenuOpen, setIsEscMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLogs, setChatLogs] = useState<string[]>([
    'System: Welcome to ' + gameTitle + '!',
    'Mobile: Left thumb = Joystick, Right thumb = Camera look & Jump!',
  ]);
  const [isJumpActive, setIsJumpActive] = useState(false);

  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatMessage.trim()) return;
    soundEngine.playClick();
    setChatLogs((prev) => [...prev, `[nitinkumar14668]: ${chatMessage.trim()}`]);
    setChatMessage('');
  };

  const handleJumpStart = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setIsJumpActive(true);
    if (onJumpChange) onJumpChange(true);
    // Also dispatch Space for any legacy listeners
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true }));
  };

  const handleJumpEnd = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setIsJumpActive(false);
    if (onJumpChange) onJumpChange(false);
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', key: ' ', bubbles: true }));
  };

  const handleJoystickMove = (vector: JoystickVector) => {
    if (onJoystickMove) {
      onJoystickMove(vector);
    }
  };

  const handleToggleLandscape = async () => {
    soundEngine.playClick();
    await requestLandscapeMode();
  };

  const healthPercent = Math.max(0, Math.min(100, (playerStats.health / playerStats.maxHealth) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-40 overflow-hidden font-sans">
      {/* Roblox Classic TopBar */}
      <div className="h-9 px-3 bg-black/60 backdrop-blur-xs flex items-center justify-between pointer-events-auto border-b border-white/10">
        {/* Left: Roblox Logo & Chat Button */}
        <div className="flex items-center gap-2">
          {/* Roblox Tilt Logo */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setIsEscMenuOpen(!isEscMenuOpen);
            }}
            className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded flex items-center justify-center transition-colors"
            title="Roblox Menu (Esc)"
          >
            <div className="w-3.5 h-3.5 bg-white rounded-xs transform -rotate-12 shadow flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-neutral-900 rounded-2xs transform rotate-12" />
            </div>
          </button>

          {/* Chat Icon */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setIsChatOpen(!isChatOpen);
            }}
            className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
              isChatOpen ? 'bg-sky-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
            title="Chat"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>

          <span className="text-white font-bold text-xs ml-1 tracking-wide drop-shadow truncate max-w-[130px] sm:max-w-xs">
            {gameTitle}
          </span>
        </div>

        {/* Right: Landscape Toggle, Health Bar & Stop Play button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Force Landscape / Fullscreen */}
          <button
            onClick={handleToggleLandscape}
            className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 text-neutral-200 text-[11px] font-semibold rounded border border-white/10 transition-colors"
            title="Switch to Landscape / Fullscreen"
          >
            <Smartphone className="w-3.5 h-3.5 text-sky-400 rotate-90" />
            <span className="hidden sm:inline">Landscape</span>
          </button>

          {/* Health Bar */}
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
            <div className="w-20 sm:w-28 h-3 bg-neutral-900/80 rounded border border-white/20 overflow-hidden p-0.5">
              <div
                className="h-full rounded-xs transition-all duration-300"
                style={{
                  width: `${healthPercent}%`,
                  backgroundColor: healthPercent < 30 ? '#ef4444' : '#22c55e',
                }}
              />
            </div>
          </div>

          {/* Stop / Leave Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onExitPlayMode();
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded shadow transition-all"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline">Stop</span>
          </button>
        </div>
      </div>

      {/* Leaderboard in Top-Right */}
      <div className="absolute top-11 right-3 pointer-events-auto bg-black/60 backdrop-blur-xs border border-white/10 rounded-lg p-2 min-w-36 text-xs shadow-xl hidden sm:block">
        <div className="flex items-center justify-between pb-1 mb-1 border-b border-white/10 text-[10px] font-bold text-neutral-400">
          <span>PLAYER</span>
          <span className="flex items-center gap-1 text-amber-300">
            <Trophy className="w-3 h-3 text-amber-400" />
            Coins
          </span>
        </div>

        <div className="flex items-center justify-between text-white font-semibold text-[11px]">
          <div className="flex items-center gap-1.5 truncate">
            <div className="w-3.5 h-3.5 rounded-full bg-sky-500 text-[8px] flex items-center justify-center font-bold">
              N
            </div>
            <span className="truncate">nitinkumar14668</span>
          </div>
          <span className="text-amber-400 font-mono font-bold">
            {playerStats.coins}
          </span>
        </div>
      </div>

      {/* In-Game Chat Overlay */}
      {isChatOpen && (
        <div className="absolute top-11 left-3 pointer-events-auto w-72 sm:w-80 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg p-2.5 text-xs text-white shadow-2xl flex flex-col gap-2 z-50">
          <div className="h-24 sm:h-28 overflow-y-auto space-y-1 text-[11px] font-mono leading-relaxed">
            {chatLogs.map((msg, idx) => (
              <div key={idx} className="break-all">
                {msg}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="flex items-center gap-1.5 pt-1 border-t border-white/10">
            <input
              type="text"
              placeholder="Chat here or press '/'..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              className="p-1.5 bg-sky-600 hover:bg-sky-500 rounded text-white"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MOBILE CONTROLS: VIRTUAL JOYSTICK & JUMP BUTTON */}
      {/* ======================================================== */}

      {/* Virtual Analog Joystick (Bottom-Left) */}
      <div className="absolute bottom-5 left-5 pointer-events-auto select-none z-30 touch-none">
        <VirtualJoystick
          onMove={handleJoystickMove}
          onEnd={() => handleJoystickMove({ x: 0, y: 0 })}
          opacity={dpadOpacity}
          size={135}
        />
      </div>

      {/* Tactile Jump Button (Bottom-Right) */}
      <div
        className="absolute bottom-6 right-6 pointer-events-auto select-none z-30 touch-none flex flex-col items-end transition-opacity"
        style={{ opacity: dpadOpacity }}
      >
        <button
          onTouchStart={handleJumpStart}
          onTouchEnd={handleJumpEnd}
          onTouchCancel={handleJumpEnd}
          onMouseDown={handleJumpStart}
          onMouseUp={handleJumpEnd}
          onMouseLeave={handleJumpEnd}
          className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full border-3 flex flex-col items-center justify-center shadow-2xl backdrop-blur-md select-none touch-none transition-all duration-100 ${
            isJumpActive
              ? 'bg-sky-400 border-white scale-90 shadow-[0_0_25px_rgba(56,189,248,0.7)] text-black'
              : 'bg-gradient-to-tr from-sky-600 to-[#00a2ff] border-white/40 text-white active:scale-95'
          }`}
          title="Jump Button (Multi-touch compatible)"
        >
          <span className="font-black text-sm tracking-widest leading-none">JUMP</span>
          <span className="text-[9px] font-semibold opacity-90 mt-0.5">▲</span>
        </button>
      </div>

      {/* Roblox Classic Esc Pause Menu */}
      {isEscMenuOpen && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center pointer-events-auto z-50">
          <div className="w-80 bg-[#1e1e24] border border-neutral-700 rounded-xl p-5 shadow-2xl text-center space-y-3">
            <h3 className="text-base font-bold text-white tracking-wide">ROBLOX MENU</h3>
            <p className="text-xs text-neutral-400">{gameTitle}</p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => setIsEscMenuOpen(false)}
                className="w-full py-2 bg-[#00a2ff] hover:bg-[#0091e6] text-white font-bold text-xs rounded-lg transition-colors"
              >
                Resume Game
              </button>

              <button
                onClick={handleToggleLandscape}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs rounded-lg border border-neutral-700 transition-colors flex items-center justify-center gap-2"
              >
                <Smartphone className="w-3.5 h-3.5 text-sky-400 rotate-90" />
                <span>Toggle Landscape Mode</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  onResetCharacter();
                  setIsEscMenuOpen(false);
                }}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs rounded-lg border border-neutral-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Reset Character (Oof)</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  onExitPlayMode();
                }}
                className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave Game to Studio</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
