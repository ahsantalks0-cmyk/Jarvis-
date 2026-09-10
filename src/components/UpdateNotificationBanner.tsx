import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Download, RefreshCw, X, ExternalLink, ArrowUpCircle } from 'lucide-react';
import { UpdateState } from '../types';
import { electronBridge } from '../lib/electronBridge';

interface Props {
  updateState: UpdateState | null;
  onDismiss: () => void;
  onOpenSettings?: () => void;
}

export default function UpdateNotificationBanner({ updateState, onDismiss, onOpenSettings }: Props) {
  const [isInstalling, setIsInstalling] = useState(false);

  if (
    !updateState ||
    (updateState.status !== 'available' &&
      updateState.status !== 'downloading' &&
      updateState.status !== 'downloaded')
  ) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    await electronBridge.installUpdate();
  };

  const isDownloaded = updateState.status === 'downloaded';

  return (
    <AnimatePresence>
      <motion.aside
        id="auto-update-toast-banner"
        aria-label="Software Update Alert"
        initial={{ opacity: 0, y: -24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -24, scale: 0.95 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed top-12 right-4 z-50 max-w-md w-full sm:w-[410px] p-3.5 rounded-xl bg-[#080d17]/95 backdrop-blur-md border border-[#1b2f4c] shadow-[0_12px_36px_rgba(0,0,0,0.7),0_0_24px_rgba(0,229,255,0.15)] font-mono-tech"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#0c1827] border border-[#1a3a5f] flex items-center justify-center shrink-0 mt-0.5">
              {isDownloaded ? (
                <Sparkles className="w-4 h-4 text-[#0df597] animate-pulse" />
              ) : (
                <ArrowUpCircle className="w-4 h-4 text-[#00e5ff] animate-bounce" />
              )}
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-tech font-bold text-xs text-slate-100 tracking-wider">
                  {isDownloaded ? 'UPDATE READY TO INSTALL' : 'NEW UPDATE AVAILABLE'}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#0f283d] border border-[#1d4d75] text-[#38bdf8] font-bold">
                  v{updateState.version || '1.1.1'}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 font-sans leading-snug">
                {isDownloaded
                  ? `Version ${updateState.version || '1.1.1'} has been staged. Restart Jarvis now to complete installation.`
                  : updateState.percent !== undefined
                  ? `Downloading update package from GitHub releases (${updateState.percent}%)...`
                  : `Version ${updateState.version || '1.1.1'} was detected on GitHub and is downloading in the background.`}
              </p>

              {/* Progress bar if downloading */}
              {updateState.status === 'downloading' && (
                <div className="space-y-1 mt-2">
                  <div className="flex items-center justify-between text-[10px] font-mono-tech">
                    <span className="text-[#0df597] font-bold">
                      Downloaded: {updateState.percent ?? 45}%
                    </span>
                    <span className="text-amber-400 font-semibold">
                      Remaining: {updateState.remainingPercent ?? Math.max(0, 100 - (updateState.percent ?? 45))}%
                    </span>
                  </div>
                  <div className="w-full bg-[#101b2b] h-2 rounded-full overflow-hidden p-0.5 border border-[#19324a]">
                    <div
                      className="bg-gradient-to-r from-[#00e5ff] to-[#0df597] h-full rounded-full transition-all duration-300 shadow-[0_0_8px_#0df597]"
                      style={{ width: `${updateState.percent ?? 45}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2">
                {isDownloaded ? (
                  <button
                    id="toast-btn-install-restart"
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="px-3 py-1 rounded-lg bg-[#0df597] text-[#06080d] hover:bg-[#0be08a] font-bold text-[10px] tracking-wider transition-all shadow-[0_0_12px_rgba(13,245,151,0.4)] flex items-center gap-1.5 cursor-pointer font-tech"
                  >
                    <RefreshCw className={`w-3 h-3 ${isInstalling ? 'animate-spin' : ''}`} />
                    <span>{isInstalling ? 'RESTARTING...' : 'RESTART TO UPDATE'}</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-cyan-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span>Background download active</span>
                  </span>
                )}

                {onOpenSettings && (
                  <button
                    id="toast-btn-open-settings"
                    onClick={onOpenSettings}
                    className="px-2.5 py-1 rounded-lg bg-[#0d1624] border border-[#1e2f47] text-slate-300 hover:text-slate-100 hover:bg-[#142238] text-[10px] transition-colors flex items-center gap-1 cursor-pointer ml-auto"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    <span>Settings</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            id="toast-btn-dismiss"
            onClick={onDismiss}
            title="Dismiss notification"
            className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-[#152236] transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
