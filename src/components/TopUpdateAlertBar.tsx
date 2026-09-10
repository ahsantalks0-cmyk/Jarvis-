import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Download,
  RefreshCw,
  X,
  Zap,
  ArrowUpCircle,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { UpdateState } from '../types';
import { electronBridge } from '../lib/electronBridge';

interface Props {
  updateState: UpdateState | null;
  onDismiss: () => void;
  onOpenSettings?: () => void;
}

export default function TopUpdateAlertBar({
  updateState,
  onDismiss,
  onOpenSettings
}: Props) {
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

  const handleStartDownload = async () => {
    try {
      await electronBridge.downloadUpdate();
    } catch (err) {
      console.error('Failed to trigger update download:', err);
    }
    if (onOpenSettings) {
      onOpenSettings();
    }
  };

  const isDownloaded = updateState.status === 'downloaded';
  const isDownloading = updateState.status === 'downloading';
  const isAvailable = updateState.status === 'available';

  const percent = updateState.percent ?? (isDownloaded ? 100 : 0);
  const remainingPercent =
    updateState.remainingPercent ?? Math.max(0, 100 - percent);

  // Format bytes for transferred / total
  const formatMB = (bytes?: number) => {
    if (!bytes || bytes <= 0) return null;
    return (bytes / (1024 * 1024)).toFixed(1);
  };

  const transferredMB = formatMB(updateState.transferred);
  const totalMB = formatMB(updateState.total);
  const speedKBs = updateState.bytesPerSecond
    ? Math.round(updateState.bytesPerSecond / 1024)
    : 0;
  const speedText = speedKBs > 1024 ? `${(speedKBs / 1024).toFixed(1)} MB/s` : speedKBs > 0 ? `${speedKBs} KB/s` : 'Network stream';

  return (
    <AnimatePresence>
      <motion.div
        id="top-update-notification-bar"
        aria-label="Software Update Alert Bar"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full overflow-hidden bg-gradient-to-r from-[#07131b] via-[#0b1b26] to-[#081512] border-b border-[#1b3d4f]/80 shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(0,229,255,0.08)] z-40 relative"
      >
        <div className="px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Left: Icon & Alert status */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                isDownloaded
                  ? 'bg-[#0a2318] border-[#185e3a] text-[#0df597] shadow-[0_0_12px_rgba(13,245,151,0.3)]'
                  : isDownloading
                  ? 'bg-[#091f2c] border-[#164f70] text-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                  : 'bg-[#1a1c10] border-[#594d13] text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
              }`}
            >
              {isDownloaded ? (
                <Sparkles className="w-4 h-4 animate-pulse" />
              ) : isDownloading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#00e5ff]" />
              ) : (
                <ArrowUpCircle className="w-4 h-4 animate-bounce text-amber-300" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold uppercase tracking-wider ${
                    isDownloaded
                      ? 'bg-[#0d2a1d] text-[#0df597] border border-[#1b553b]'
                      : isDownloading
                      ? 'bg-[#0c283a] text-[#00e5ff] border border-[#164d6e]'
                      : 'bg-[#29220d] text-amber-300 border border-[#524115]'
                  }`}
                >
                  {isDownloaded
                    ? 'Update Ready To Install'
                    : isDownloading
                    ? 'Downloading Update...'
                    : 'New Update Available'}
                </span>

                <span className="font-tech font-semibold text-slate-100 text-xs">
                  Jarvis v{updateState.version || '1.1.2'}
                </span>

                <span className="text-[10px] font-mono-tech text-slate-400 hidden sm:inline">
                  (Official GitHub Release)
                </span>
              </div>

              {/* Status explanation */}
              <p className="text-[11px] text-slate-300 font-sans mt-0.5 truncate max-w-xl">
                {isDownloaded
                  ? `Update package v${updateState.version || '1.1.2'} is 100% downloaded and verified. Restart now to apply!`
                  : isDownloading
                  ? `Downloading installer from GitHub: ${percent}% completed, ${remainingPercent}% remaining.`
                  : `A new official version (v${updateState.version || '1.1.2'}) is available. Automatic background download initiated.`}
              </p>
            </div>
          </div>

          {/* Middle / Right: Real-time Percentage & Progress Bar if downloading */}
          {isDownloading && (
            <div className="flex-1 max-w-md mx-auto w-full flex flex-col justify-center px-2">
              <div className="flex items-center justify-between text-[11px] font-mono-tech mb-1">
                <span className="text-[#0df597] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0df597] animate-ping inline-block" />
                  Downloaded: {percent}%
                </span>
                <span className="text-amber-400/90 font-medium">
                  Remaining: {remainingPercent}%
                </span>
                <span className="text-slate-400 text-[10px]">
                  {transferredMB && totalMB
                    ? `${transferredMB} MB / ${totalMB} MB`
                    : transferredMB
                    ? `${transferredMB} MB`
                    : ''}
                </span>
              </div>

              {/* Enhanced Visual Progress Bar */}
              <div className="w-full bg-[#08131e] h-2.5 rounded-full p-0.5 border border-[#1a384f] overflow-hidden relative shadow-inner">
                {/* Downloaded portion */}
                <div
                  className="bg-gradient-to-r from-[#00e5ff] via-[#0df597] to-[#10b981] h-full rounded-full transition-all duration-300 shadow-[0_0_10px_#0df597]"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[9px] font-mono-tech text-slate-400 mt-1">
                <span>Speed: ~{speedText}</span>
                <span className="text-slate-500">NSIS Package • Auto-verification</span>
              </div>
            </div>
          )}

          {/* Downloaded: Summary Progress (100% Complete) */}
          {isDownloaded && (
            <div className="hidden lg:flex items-center gap-3 px-3 py-1 rounded-lg bg-[#071912] border border-[#13442a] text-[11px] font-mono-tech">
              <div className="flex items-center gap-1.5 text-[#0df597]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="font-bold">100% Downloaded</span>
              </div>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">0% Remaining</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">{totalMB ? `${totalMB} MB Verified` : 'Verified Staged'}</span>
            </div>
          )}

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {isDownloaded ? (
              <button
                id="top-bar-btn-restart"
                onClick={handleInstall}
                disabled={isInstalling}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#0df597] to-[#00e5ff] text-[#05080e] font-tech font-bold text-xs hover:brightness-110 transition-all flex items-center gap-1.5 shadow-[0_0_16px_rgba(13,245,151,0.4)] cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isInstalling ? 'animate-spin' : ''}`}
                />
                <span>{isInstalling ? 'RESTARTING...' : 'RESTART TO UPDATE'}</span>
              </button>
            ) : isDownloading ? (
              <button
                id="top-bar-btn-view-details"
                onClick={onOpenSettings}
                className="px-3 py-1.5 rounded-lg bg-[#0d2133] border border-[#1b4b73] text-cyan-300 hover:bg-[#13324d] font-tech text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <HardDrive className="w-3 h-3" />
                <span>View Progress</span>
              </button>
            ) : (
              <button
                id="top-bar-btn-download-now"
                onClick={handleStartDownload}
                className="px-3.5 py-1.5 rounded-lg bg-[#0df597] text-[#05080e] font-tech font-bold text-xs hover:bg-[#0be08a] transition-all flex items-center gap-1.5 shadow-[0_0_14px_rgba(13,245,151,0.3)] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD UPDATE</span>
              </button>
            )}

            {/* Dismiss button */}
            <button
              id="top-bar-btn-dismiss"
              onClick={onDismiss}
              title="Dismiss notification"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-[#102233] transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
