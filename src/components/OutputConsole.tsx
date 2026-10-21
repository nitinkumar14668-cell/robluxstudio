import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Trash2, Filter, CornerDownLeft } from 'lucide-react';
import { OutputLog } from '../types/roblox';
import { soundEngine } from '../engine/audio';

interface OutputConsoleProps {
  logs: OutputLog[];
  onClearLogs: () => void;
  onExecuteCommand: (cmd: string) => void;
  onClose: () => void;
}

export const OutputConsole: React.FC<OutputConsoleProps> = ({
  logs,
  onClearLogs,
  onExecuteCommand,
  onClose,
}) => {
  const [filter, setFilter] = useState<'all' | 'print' | 'warn' | 'error'>('all');
  const [commandInput, setCommandInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.type === filter;
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && commandInput.trim()) {
      soundEngine.playClick();
      onExecuteCommand(commandInput.trim());
      setCommandInput('');
    }
  };

  return (
    <div className="flex flex-col h-48 bg-[#18181c] border-t border-neutral-800 text-xs font-mono select-none">
      {/* Header Bar */}
      <div className="h-7 px-3 flex items-center justify-between border-b border-neutral-800 bg-[#202026] text-neutral-300">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-bold text-[11px]">Output</span>
          <span className="text-[10px] text-neutral-500">({logs.length})</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <div className="flex items-center gap-1 text-[10px]">
            {(['all', 'print', 'warn', 'error'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-1.5 py-0.5 rounded capitalize ${
                  filter === f ? 'bg-sky-500 text-white font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={onClearLogs}
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded"
            title="Clear Output"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white font-bold px-1"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Log list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 text-[11px]">
        {filteredLogs.length === 0 ? (
          <div className="text-neutral-600 italic">No output messages</div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed">
              <span className="text-neutral-600 text-[10px]">{log.timestamp}</span>
              <span
                className={`flex-1 break-all ${
                  log.type === 'error'
                    ? 'text-red-400 font-semibold'
                    : log.type === 'warn'
                    ? 'text-amber-400'
                    : log.type === 'info'
                    ? 'text-sky-400'
                    : 'text-neutral-200'
                }`}
              >
                {log.text}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Command Bar */}
      <div className="h-8 px-2 flex items-center gap-2 border-t border-neutral-800 bg-[#141418]">
        <span className="text-sky-400 font-bold text-[11px]">{'>'}</span>
        <input
          type="text"
          placeholder="Command Bar (e.g. print('Hello World') or workspace.Baseplate.Color = '#ff0000')"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none text-neutral-200 text-xs focus:outline-none placeholder-neutral-600 font-mono"
        />
        <button
          onClick={() => {
            if (commandInput.trim()) {
              onExecuteCommand(commandInput.trim());
              setCommandInput('');
            }
          }}
          className="p-1 text-neutral-400 hover:text-sky-400"
          title="Run command"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
