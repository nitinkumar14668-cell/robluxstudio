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

      {/* Mobile / On-Screen Touch Controls (D-Pad and Jump) */}
      <div className="absolute bottom-6 left-6 pointer-events-auto flex flex-col items-center gap-1 select-none z-30">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW', bubbles: true }));
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW', bubbles: true }));
          }}
          onMouseDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW', bubbles: true }))}
          onMouseUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW', bubbles: true }))}
          className="w-12 h-12 rounded-full bg-black/60 active:bg-sky-500/80 border border-white/20 text-white flex items-center justify-center font-bold text-lg backdrop-blur-xs shadow-lg"
        >
          ▲
        </button>

        <div className="flex items-center gap-3">
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA', bubbles: true }));
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA', bubbles: true }));
            }}
            onMouseDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA', bubbles: true }))}
            onMouseUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA', bubbles: true }))}
            className="w-12 h-12 rounded-full bg-black/60 active:bg-sky-500/80 border border-white/20 text-white flex items-center justify-center font-bold text-lg backdrop-blur-xs shadow-lg"
          >
            ◀
          </button>

          <div className="w-6 h-6 rounded-full bg-white/20" />

          <button
            onTouchStart={(e) => {
              e.preventDefault();
              window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD', bubbles: true }));
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD', bubbles: true }));
            }}
            onMouseDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD', bubbles: true }))}
            onMouseUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD', bubbles: true }))}
            className="w-12 h-12 rounded-full bg-black/60 active:bg-sky-500/80 border border-white/20 text-white flex items-center justify-center font-bold text-lg backdrop-blur-xs shadow-lg"
          >
            ▶
          </button>
        </div>

        <button
          onTouchStart={(e) => {
            e.preventDefault();
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyS', bubbles: true }));
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyS', bubbles: true }));
          }}
          onMouseDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyS', bubbles: true }))}
          onMouseUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyS', bubbles: true }))}
          className="w-12 h-12 rounded-full bg-black/60 active:bg-sky-500/80 border border-white/20 text-white flex items-center justify-center font-bold text-lg backdrop-blur-xs shadow-lg"
        >
          ▼
        </button>
      </div>

      {/* Mobile Jump Button on Bottom-Right */}
      <div className="absolute bottom-8 right-8 pointer-events-auto select-none z-30">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', bubbles: true }));
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', bubbles: true }));
          }}
          onMouseDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', bubbles: true }))}
          onMouseUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', bubbles: true }))}
          className="w-16 h-16 rounded-full bg-[#00a2ff]/90 active:bg-sky-400 border-2 border-white/40 text-white flex flex-col items-center justify-center font-extrabold text-sm shadow-2xl backdrop-blur-xs"
        >
          <span>JUMP</span>
          <span className="text-[10px] opacity-75">Space</span>
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
