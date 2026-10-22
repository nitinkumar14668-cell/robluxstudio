import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, CheckCircle, ExternalLink, X, Info } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  // If already installed, show small badge or nothing
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-600/40 text-emerald-400 text-[11px] font-medium" title="Running as installed standalone App">
        <CheckCircle className="w-3 h-3" />
        <span className="hidden sm:inline">Installed App</span>
      </div>
    );
  }

  return (
    <>
      {/* 1. Direct Install Button when browser fires beforeinstallprompt */}
      {isInstallable ? (
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-semibold shadow-xs transition-all animate-pulse hover:animate-none"
          title="Install Roblox Studio as an Android / Desktop Native App"
        >
          <Smartphone className="w-3 h-3" />
          <span>Install App</span>
        </button>
      ) : (
        /* 2. Android App / PWA Guide button when prompt is not yet triggered */
        <button
          onClick={() => setShowAndroidGuide(true)}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-sky-400 border border-sky-800/50 text-[11px] font-medium transition-all"
          title="Android App Info & APK / Install Guide"
        >
          <Smartphone className="w-3 h-3" />
          <span className="hidden xs:inline">Android App</span>
        </button>
      )}

      {/* Guide Modal for Android & APK instructions */}
      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 select-none font-sans">
          <div className="w-full max-w-md rounded-xl bg-[#1e1e24] border border-[#3b3b47] p-5 shadow-2xl text-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-700/80 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Android App / APK Setup</h3>
                  <p className="text-[11px] text-neutral-400">Install directly on your phone or convert to APK</p>
                </div>
              </div>
              <button
                onClick={() => setShowAndroidGuide(false)}
                className="p-1 text-neutral-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              {/* Method 1: Instant PWA Install on Android */}
              <div className="p-3 rounded-lg bg-neutral-900/90 border border-emerald-500/30">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1 text-[13px]">
                  <span>Method 1: Direct Install (Instant - No APK needed)</span>
                </div>
                <p className="text-neutral-300 mb-2">
                  Android Chrome / Edge browser allows direct 1-tap installation:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-neutral-400 text-[11px]">
                  <li>Open <span className="text-sky-300 font-mono">https://opstudio-web.vercel.app</span> in Chrome on Android.</li>
                  <li>Tap the <strong>three dots (⋮)</strong> at top right.</li>
                  <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  <li>It installs with full-screen mode, native icon & offline cache!</li>
                </ol>
              </div>

              {/* Method 2: Convert to APK / AAB */}
              <div className="p-3 rounded-lg bg-neutral-900/90 border border-neutral-700/80">
                <div className="font-bold text-sky-400 flex items-center gap-1.5 mb-1 text-[13px]">
                  <span>Method 2: Export as Android .APK / .AAB</span>
                </div>
                <p className="text-neutral-300 mb-2">
                  Since this app is a fully compliant PWA, you can generate an Android APK in 30 seconds for Google Play or direct download:
                </p>
                <div className="space-y-1.5 text-[11px] text-neutral-400">
                  <p>1. Visit <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-sky-400 underline font-semibold">PWABuilder.com</a></p>
                  <p>2. Enter URL: <span className="text-amber-300 font-mono">https://opstudio-web.vercel.app</span></p>
                  <p>3. Click <strong>"Package for Android"</strong> to download the ready <code className="text-emerald-300 font-bold">.apk</code> or <code className="text-emerald-300 font-bold">.aab</code> package!</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-700/80 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAndroidGuide(false)}
                className="px-4 py-1.5 rounded-lg bg-[#00a2ff] hover:bg-[#0092e6] text-white font-semibold text-xs transition"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
