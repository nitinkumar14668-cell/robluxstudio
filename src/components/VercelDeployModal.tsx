import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Terminal, Github, Rocket, CheckCircle2, Globe, Sparkles } from 'lucide-react';
import { soundEngine } from '../engine/audio';

interface VercelDeployModalProps {
  onClose: () => void;
}

export const VercelDeployModal: React.FC<VercelDeployModalProps> = ({ onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    soundEngine.playClick();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#1c1c22] border border-neutral-700 rounded-xl shadow-2xl overflow-hidden text-neutral-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-13 px-5 bg-[#25252d] border-b border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center border border-white/20">
              {/* Vercel Triangle Logo */}
              <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 76 65" fill="none">
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Deploy Roblox Studio Web to Vercel</h3>
              <p className="text-[11px] text-neutral-400">Step-by-step Hindi & English guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Current Live Cloud URL Notice */}
          <div className="p-3.5 bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-500/30 rounded-xl flex items-start gap-3">
            <Globe className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sky-300 text-xs mb-1">
                Aapka App Abhi Bhi Live Hai! (Already Running on Cloud)
              </h4>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                Aapki website Google Cloud par live chal rahi hai. Lekin agar aapko apni personal Vercel domain (jaise <code className="text-sky-300 bg-black/40 px-1 rounded">roblox-studio.vercel.app</code>) par deploy karna hai, toh neeche diye 2 aasan tareeqo me se koi bhi use kar sakte hain:
              </p>
            </div>
          </div>

          {/* Method 1: GitHub + Vercel (Sabse Aasan aur Best) */}
          <div className="bg-[#15151a] border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-neutral-800 rounded-lg text-white">
                <Github className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-xs">
                Tareeqa 1: GitHub se Vercel par Deploy (Recommended)
              </h4>
            </div>

            <ol className="list-decimal list-inside space-y-2 text-neutral-300 leading-relaxed pl-1 text-[11px]">
              <li>
                <strong className="text-white">GitHub Repository banayein:</strong>{' '}
                <a
                  href="https://github.com/new"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 underline inline-flex items-center gap-0.5"
                >
                  github.com/new <ExternalLink className="w-2.5 h-2.5" />
                </a>{' '}
                par jakar nayi repository create karein (e.g. <code className="text-amber-300">roblox-studio-web</code>).
              </li>
              <li>
                <strong className="text-white">Files Push karein:</strong> Apne computer terminal me ye commands run karein:
                <div className="mt-1.5 relative bg-[#0d0d10] p-2.5 rounded-lg border border-neutral-800 font-mono text-[11px] text-sky-300">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'git init\ngit add .\ngit commit -m "Initial Roblox Studio Web"\ngit branch -M main\ngit remote add origin YOUR_GITHUB_REPO_URL\ngit push -u origin main',
                        'git-cmd'
                      )
                    }
                    className="absolute right-2 top-2 p-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded"
                    title="Copy commands"
                  >
                    {copiedKey === 'git-cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <pre className="overflow-x-auto select-all pr-8">
{`git init
git add .
git commit -m "Initial Roblox Studio Web"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main`}
                  </pre>
                </div>
              </li>
              <li>
                <strong className="text-white">Vercel par Import karein:</strong>{' '}
                <a
                  href="https://vercel.com/new"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 underline inline-flex items-center gap-0.5"
                >
                  vercel.com/new <ExternalLink className="w-2.5 h-2.5" />
                </a>{' '}
                par jayein, apni GitHub repo select karein aur <strong>"Deploy"</strong> par click karein!
              </li>
            </ol>
          </div>

          {/* Method 2: Vercel CLI (Super Fast Terminal Deploy) */}
          <div className="bg-[#15151a] border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-neutral-800 rounded-lg text-emerald-400">
                <Terminal className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-xs">
                Tareeqa 2: Vercel CLI (Sirf 2 Commands me Deploy)
              </h4>
            </div>

            <p className="text-[11px] text-neutral-400">
              Terminal me directly Vercel CLI se bina GitHub ke bhi deploy kar sakte hain:
            </p>

            <div className="relative bg-[#0d0d10] p-2.5 rounded-lg border border-neutral-800 font-mono text-[11px] text-emerald-400">
              <button
                onClick={() => copyToClipboard('npm i -g vercel\nvercel', 'cli-cmd')}
                className="absolute right-2 top-2 p-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded"
                title="Copy command"
              >
                {copiedKey === 'cli-cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
              <pre className="overflow-x-auto select-all">
{`# 1. Vercel install karein
npm i -g vercel

# 2. Deploy karein
vercel --prod`}
              </pre>
            </div>
          </div>

          {/* Pre-configured details */}
          <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-[11px] space-y-1.5">
            <div className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vercel Configuration Ready!</span>
            </div>
            <p className="text-neutral-400">
              Humne aapke project me <code className="text-neutral-200 bg-neutral-800 px-1 rounded">vercel.json</code>, build script, aur Single Page Application (SPA) routing already configure kar di hai. Vercel automatically:
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
              <div className="bg-[#141418] p-1.5 rounded border border-neutral-800">
                <span className="text-neutral-500 block">Framework:</span>
                <span className="text-sky-300 font-semibold">Vite</span>
              </div>
              <div className="bg-[#141418] p-1.5 rounded border border-neutral-800">
                <span className="text-neutral-500 block">Build Command:</span>
                <span className="text-emerald-300 font-semibold">npm run build</span>
              </div>
              <div className="bg-[#141418] p-1.5 rounded border border-neutral-800">
                <span className="text-neutral-500 block">Output Dir:</span>
                <span className="text-amber-300 font-semibold">dist</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-12 px-5 bg-[#202027] border-t border-neutral-800 flex items-center justify-between">
          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Open Vercel Dashboard</span>
            <ExternalLink className="w-3 h-3 text-neutral-600" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
