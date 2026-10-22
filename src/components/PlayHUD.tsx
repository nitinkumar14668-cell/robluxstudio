import React, { useState } from 'react';
import { LogOut, RefreshCw, MessageSquare, Send, Trophy, Heart, Shield, Sparkles } from 'lucide-react';
import { PlayerStats } from '../types/roblox';
import { soundEngine } from '../engine/audio';

interface PlayHUDProps {
  playerStats: PlayerStats;
  gameTitle: string;
  onExitPlayMode: () => void;
  onResetCharacter: () => void;
}

export const PlayHUD: React.FC<PlayHUDProps> = ({
  playerStats,
  gameTitle,
  onExitPlayMode,
  onResetCharacter,
}) => {
  const [isEscMenuOpen, setIsEscMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLogs, setChatLogs] = useState<string[]>([
    'System: Welcome to ' + gameTitle + '!',
    'Guide: Use WASD to walk, Space to jump!',
  ]);

  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatMessage.trim()) return;
    soundEngine.playClick();
    setChatLogs((prev) => [...prev, `[nitinkumar14668]: ${chatMessage.trim()}`]);
    setChatMessage('');
  };

  const healthPercent = Math.max(0, Math.min(100, (playerStats.health / playerStats.maxHealth) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-40 overflow-hidden font-sans">
      {/* Roblox Classic TopBar */}
      <div className="h-10 px-3 bg-black/50 backdrop-blur-xs flex items-center justify-between pointer-events-auto border-b border-white/10">
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
            <MessageSquare className="w-4 h-4" />
          </button>

          <span className="text-white font-bold text-xs ml-2 tracking-wide drop-shadow truncate max-w-xs">
            {gameTitle}
          </span>
        </div>

        {/* Right: Health Bar & Stop Play button */}
        <div className="flex items-center gap-3">
          {/* Health Bar */}
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <div className="w-28 h-3.5 bg-neutral-900/80 rounded border border-white/20 overflow-hidden p-0.5">
              <div
                className="h-full bg-emerald-500 rounded-xs transition-all duration-300"
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
            className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded shadow transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Stop (Shift+F5)</span>
          </button>
        </div>
      </div>

      {/* Leaderboard in Top-Right */}
      <div className="absolute top-12 right-3 pointer-events-auto bg-black/60 backdrop-blur-xs border border-white/10 rounded-lg p-2.5 min-w-44 text-xs shadow-xl">
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 text-[11px] font-bold text-neutral-400">
          <span>PLAYER</span>
          <span className="flex items-center gap-1 text-amber-300">
            <Trophy className="w-3 h-3 text-amber-400" />
            Coins
          </span>
        </div>

        <div className="flex items-center justify-between text-white font-semibold">
          <div className="flex items-center gap-1.5 truncate">
            <div className="w-4 h-4 rounded-full bg-sky-500 text-[9px] flex items-center justify-center font-bold">
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
        <div className="absolute top-12 left-3 pointer-events-auto w-80 bg-black/75 backdrop-blur-sm border border-white/10 rounded-lg p-2.5 text-xs text-white shadow-2xl flex flex-col gap-2">
          <div className="h-28 overflow-y-auto space-y-1 text-[11px] font-mono leading-relaxed">
            {chatLogs.map((msg, idx) => (
              <div key={idx} className="break-all">
                {msg}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="flex items-center gap-1.5 pt-1 border-t border-white/10">
            <input
              type="text"
              placeholder="To chat click here or press '/' key..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              className="p-1.5 bg-sky-600 hover:bg-sky-500 rounded text-white"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Mobile / Android On-Screen Touch Controls (U, D, L, R D-Pad and Jump) */}
      <div className="absolute bottom-5 left-5 pointer-events-auto flex flex-col items-center gap-1.5 select-none z-30 touch-none">
        {/* Button U = Up / Forward */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyU', key: 'u', bubbles: true }));
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW', key: 'w', bubbles: true }));
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp', key: 'ArrowUp', bubbles: true }));
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyU', key: 'u', bubbles: true }));
            window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW', key: 'w', bubbles: true }));
            window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowUp', key: 'ArrowUp', bubbles: true }));
          }}
          onMouseDown={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyU', key: 'u', bubbles: true }));
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW', key: 'w', bubbles: true }));
          }}
          onMouseUp={() => {
            window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyU', key: 'u', bubbles: true }));
            window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW', key: 'w', bubbles: true }));
          }}
          className="w-13 h-13 rounded-2xl bg-[#1e1e24]/90 active:bg-sky-500 border-2 border-white/20 active:border-sky-300 text-white flex flex-col items-center justify-center font-bold text-sm backdrop-blur-md shadow-2xl transition-transform active:scale-95"
          title="Up / Forward (U)"
        >
          <span className="text-base leading-none">▲</span>
          <span className="text-[10px] text-sky-400 font-extrabold leading-none">U</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Button L = Left side */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyL', key: 'l', bubbles: true }));
              window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA', key: 'a', bubbles: true }));
              window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft', key: 'ArrowLeft', bubbles: true }));
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyL', key: 'l', bubbles: true }));
              window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA', key: 'a', bubbles: true }));
              window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowLeft', key: 'ArrowLeft', bubbles: true }));
            }}
            onMouseDown={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyL', key: 'l', bubbles: true }));
              window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA', key: 'a', bubbles: true }));
            }}
            onMouseUp={() => {
              window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyL', key: 'l', bubbles: true }));
              window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA', key: 'a', bubbles: true }));
            }}
            className="w-13 h-13 rounded-2xl bg-[#1e1e24]/90 active:bg-sky-500 border-2 border-white/20 active:border-sky-300 text-white flex flex-col items-center justify-center font-bold text-sm backdrop-blur-md shadow-2xl transition-transform active:scale-95"
            title="Left side (L)"
          >
            <span className="text-base leading-none">◀</span>
            <span className="text-[10px] text-sky-400 font-extrabold leading-none">L</span>
          </button>

          {/* D-Pad Center Knob */}
          <div className="w-8 h-8 rounded-full bg-neutral-800/80 border border-white/10 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-sky-500/50" />
          </div>

          {/* Button R = Right side */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyR', key: 'r', bubbles: true }));
              window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', key: 'ArrowRight', bubbles: true }));
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyR', key: 'r', bubbles: true }));
              window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowRight', key: 'ArrowRight', bubbles: true }));
            }}
            onMouseDown={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyR', key: 'r', bubbles: true }));
            }}
            onMouseUp={() => {
              window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyR', key: 'r', bubbles: true }));
            }}
            className="w-13 h-13 rounded-2xl bg-[#1e1e24]/90 active:bg-sky-500 border-2 border-white/20 active:border-sky-300 text-white flex flex-col items-center justify-center font-bold text-sm backdrop-blur-md shadow-2xl transition-transform active:scale-95"
            title="Right side (R)"
          >
            <span className="text-base leading-none">▶</span>
            <span className="text-[10px] text-sky-400 font-extrabold leading-none">R</span>
          </button>
        </div>

        {/* Button D = Down / Back */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD', key: 'd', bubbles: true }));
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyS', key: 's', bubbles: true }));
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown', key: 'ArrowDown', bubbles: true }));
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD', key: 'd', bubbles: true }));
            window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyS', key: 's', bubbles: true }));
            window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowDown', key: 'ArrowDown', bubbles: true }));
          }}
          onMouseDown={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD', key: 'd', bubbles: true }));
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyS', key: 's', bubbles: true }));
          }}
          onMouseUp={() => {
            window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD', key: 'd', bubbles: true }));
            window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyS', key: 's', bubbles: true }));
          }}
          className="w-13 h-13 rounded-2xl bg-[#1e1e24]/90 active:bg-sky-500 border-2 border-white/20 active:border-sky-300 text-white flex flex-col items-center justify-center font-bold text-sm backdrop-blur-md shadow-2xl transition-transform active:scale-95"
          title="Down / Backward (D)"
        >
          <span className="text-[10px] text-sky-400 font-extrabold leading-none">D</span>
          <span className="text-base leading-none">▼</span>
        </button>
      </div>

      {/* Mobile Jump Button on Bottom-Right */}
      <div className="absolute bottom-6 right-6 pointer-events-auto select-none z-30 touch-none flex flex-col items-end gap-2">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true }));
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', key: ' ', bubbles: true }));
          }}
          onMouseDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true }))}
          onMouseUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', key: ' ', bubbles: true }))}
          className="w-18 h-18 rounded-full bg-gradient-to-tr from-sky-600 to-[#00a2ff] active:from-sky-500 active:to-sky-400 border-3 border-white/40 text-white flex flex-col items-center justify-center font-black text-sm shadow-2xl backdrop-blur-md transition-transform active:scale-95"
          title="Jump (Space)"
        >
          <span className="tracking-wider">JUMP</span>
          <span className="text-[9px] text-sky-100 font-semibold opacity-90">Space</span>
        </button>
      </div>

      {/* Roblox Classic Esc Pause Menu */}
      {isEscMenuOpen && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
          <div className="w-80 bg-[#1e1e24] border border-neutral-700 rounded-xl p-5 shadow-2xl text-center space-y-3">
            <h3 className="text-lg font-bold text-white tracking-wide">ROBLOX MENU</h3>
            <p className="text-xs text-neutral-400">{gameTitle}</p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => setIsEscMenuOpen(false)}
                className="w-full py-2 bg-[#00a2ff] hover:bg-[#0091e6] text-white font-bold text-xs rounded-lg transition-colors"
              >
                Resume Game
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
