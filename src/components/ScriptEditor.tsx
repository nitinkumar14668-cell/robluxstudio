import React, { useState, useEffect } from 'react';
import { Code2, Play, Save, Check, Copy, BookOpen } from 'lucide-react';
import { RobloxInstance } from '../types/roblox';
import { soundEngine } from '../engine/audio';

interface ScriptEditorProps {
  instance: RobloxInstance | null;
  onSaveScript: (instanceId: string, scriptContent: string) => void;
  onClose: () => void;
}

const PRESET_SCRIPTS = [
  {
    name: '🔥 Lava Kill Brick',
    code: `-- Kill player on touch
script.Parent.Touched:Connect(function(hit)
    local humanoid = hit.Parent:FindFirstChild("Humanoid")
    if humanoid then
        humanoid.Health = 0
        print(hit.Parent.Name .. " touched lava!")
    end
end)`,
  },
  {
    name: '🔄 Spinning Rotor',
    code: `-- Continuous rotation loop
while true do
    script.Parent.Rotation.Y = script.Parent.Rotation.Y + 2
    wait(0.03)
end`,
  },
  {
    name: '🪙 Coin Collect Reward',
    code: `-- Award coins when player collects
script.Parent.Touched:Connect(function(hit)
    local player = game.Players:GetPlayerFromCharacter(hit.Parent)
    if player then
        player.leaderstats.Coins.Value = player.leaderstats.Coins.Value + 10
        print("Awarded 10 Coins to " .. player.Name)
        script.Parent:Destroy()
    end
end)`,
  },
  {
    name: '👻 Disappearing Platform',
    code: `-- Periodic fading platform
while true do
    wait(2)
    script.Parent.Transparency = 1
    script.Parent.CanCollide = false
    wait(2)
    script.Parent.Transparency = 0
    script.Parent.CanCollide = true
end`,
  },
  {
    name: '🌈 Rainbow Color',
    code: `-- Shift HSV Rainbow color continuously
while true do
    script.Parent.Color = Color3.fromHSV(math.sin(tick()) * 0.5 + 0.5, 0.8, 1)
    wait(0.05)
end`,
  },
];

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  instance,
  onSaveScript,
  onClose,
}) => {
  const [code, setCode] = useState(
    instance?.scriptContent ||
      `-- Roblox Luau Script
local part = script.Parent

print("Script initialized on " .. part.Name)

-- Example: Rotate part
while true do
    part.Rotation.Y = part.Rotation.Y + 1
    wait(0.05)
end`
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (instance?.scriptContent) {
      setCode(instance.scriptContent);
    }
  }, [instance]);

  if (!instance) return null;

  const handleSave = () => {
    soundEngine.playClick();
    onSaveScript(instance.id, code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[80vh] bg-[#1a1a20] border border-neutral-700 rounded-xl shadow-2xl flex flex-col overflow-hidden text-neutral-200 font-mono">
        {/* Editor Top Bar */}
        <div className="h-10 px-4 bg-[#23232b] border-b border-neutral-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-yellow-400" />
            <span className="font-bold text-sm text-neutral-100">
              Script: {instance.name}.lua
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
              Roblox Luau
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold shadow"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{copied ? 'Saved!' : 'Save Script'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-2.5 py-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded font-bold text-xs"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Preset Snippets Bar */}
        <div className="px-4 py-2 bg-[#202027] border-b border-neutral-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] text-neutral-400 font-semibold flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            Snippets:
          </span>
          {PRESET_SCRIPTS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                soundEngine.playClick();
                setCode(preset.code);
              }}
              className="px-2.5 py-1 rounded bg-[#17171c] hover:bg-neutral-700 text-neutral-300 border border-neutral-700 text-[11px] whitespace-nowrap"
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Code Area with Line Numbers */}
        <div className="flex-1 flex overflow-hidden bg-[#141418]">
          {/* Line Numbers */}
          <div className="w-12 py-3 px-2 bg-[#17171d] border-r border-neutral-800 text-neutral-600 text-right select-none text-xs leading-6 font-mono">
            {Array.from({ length: Math.max(15, lineCount) }).map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 p-3 bg-transparent text-neutral-100 text-xs font-mono leading-6 resize-none focus:outline-none border-none selection:bg-sky-900/50"
          />
        </div>

        {/* Footer info */}
        <div className="h-7 px-4 bg-[#1e1e24] border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Target: workspace.{instance.name}</span>
          <span>Lines: {lineCount} | UTF-8</span>
        </div>
      </div>
    </div>
  );
};
