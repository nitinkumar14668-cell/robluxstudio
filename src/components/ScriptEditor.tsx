import React, { useState, useEffect } from 'react';
import { Code2, Save, Check, BookOpen, X } from 'lucide-react';
import { RobloxInstance } from '../types/roblox';
import { soundEngine } from '../engine/audio';

interface ScriptEditorProps {
  instance: RobloxInstance | null;
  onSaveScript: (instanceId: string, scriptContent: string) => void;
  onClose: () => void;
}

const PRESET_SCRIPTS = [
  {
    name: '🔥 Lava Kill',
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
    name: '🔄 Spin Rotor',
    code: `-- Continuous rotation loop
while true do
    script.Parent.Rotation.Y = script.Parent.Rotation.Y + 2
    wait(0.03)
end`,
  },
  {
    name: '🪙 Coin Reward',
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
    code: `-- Shift Rainbow color continuously
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
    <div className="w-full h-full bg-[#1e1e24] flex flex-col overflow-hidden text-neutral-200 font-mono select-none">
      {/* Editor Sub-header Bar */}
      <div className="h-8 px-3 bg-[#25252b] border-b border-[#36363d] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-neutral-200 text-xs">
            {instance.name}.lua
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
            Luau
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#00a2ff] hover:bg-[#0091e6] text-white rounded text-[11px] font-semibold shadow-xs"
          >
            {copied ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
            <span>{copied ? 'Saved' : 'Save Script'}</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded"
            title="Close Script Tab"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preset Snippets Bar */}
      <div className="px-3 py-1.5 bg-[#1a1a20] border-b border-[#2e2e36] flex items-center gap-2 overflow-x-auto text-xs shrink-0">
        <span className="text-[10px] text-neutral-400 font-semibold flex items-center gap-1">
          <BookOpen className="w-3 h-3 text-sky-400" />
          Snippets:
        </span>
        {PRESET_SCRIPTS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => {
              soundEngine.playClick();
              setCode(preset.code);
            }}
            className="px-2 py-0.5 rounded bg-[#25252d] hover:bg-[#32323a] text-neutral-300 border border-[#36363e] text-[10px] whitespace-nowrap"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Code Editor Body */}
      <div className="flex-1 flex overflow-hidden bg-[#141418]">
        {/* Line Numbers */}
        <div className="w-10 py-2 px-1 bg-[#18181d] border-r border-[#2a2a32] text-neutral-600 text-right select-none text-[11px] leading-5 font-mono">
          {Array.from({ length: Math.max(20, lineCount) }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="flex-1 p-2 bg-transparent text-neutral-100 text-xs font-mono leading-5 resize-none focus:outline-none border-none selection:bg-sky-900/60"
        />
      </div>

      {/* Editor Status Bar */}
      <div className="h-6 px-3 bg-[#1e1e24] border-t border-[#2d2d35] flex items-center justify-between text-[10px] text-neutral-400 font-sans">
        <span>Path: Workspace.{instance.name}</span>
        <span>{lineCount} lines | Luau Syntax</span>
      </div>
    </div>
  );
};
