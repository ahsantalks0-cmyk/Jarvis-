import { HardDrive, Activity, ArrowDownCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  percent: number;
  remainingPercent?: number;
  transferredBytes?: number;
  totalBytes?: number;
  bytesPerSecond?: number;
  isCompleted?: boolean;
  compact?: boolean;
  className?: string;
}

export default function UpdateProgressBar({
  percent,
  remainingPercent: customRemaining,
  transferredBytes,
  totalBytes,
  bytesPerSecond,
  isCompleted = false,
  compact = false,
  className = ''
}: Props) {
  const safePercent = Math.min(100, Math.max(0, Math.round(percent)));
  const remaining =
    customRemaining !== undefined
      ? Math.max(0, Math.round(customRemaining))
      : Math.max(0, 100 - safePercent);

  // Helper to format MB
  const formatMB = (bytes?: number) => {
    if (!bytes || bytes <= 0) return null;
    return (bytes / (1024 * 1024)).toFixed(1);
  };

  const transferredMB = formatMB(transferredBytes);
  const totalMB = formatMB(totalBytes);
  const speedKBs = bytesPerSecond ? Math.round(bytesPerSecond / 1024) : 0;
  const speedText = speedKBs > 1024 ? `${(speedKBs / 1024).toFixed(1)} MB/s` : speedKBs > 0 ? `${speedKBs} KB/s` : 'Active stream';

  if (compact) {
    return (
      <div className={`space-y-1.5 font-mono-tech ${className}`}>
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5 text-[#0df597] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0df597] animate-pulse" />
            <span>Downloaded: {safePercent}%</span>
          </div>
          <div className="text-amber-300 font-semibold">
            Remaining: {remaining}%
          </div>
        </div>

        {/* Bar */}
        <div className="w-full bg-[#08121a] h-2 rounded-full p-0.5 border border-[#163547] overflow-hidden shadow-inner relative">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#00e5ff] via-[#0df597] to-[#10b981] transition-all duration-300 shadow-[0_0_10px_#0df597]"
            style={{ width: `${safePercent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      id="update-comprehensive-progress-card"
      className={`p-3.5 rounded-xl bg-[#060b13] border border-[#142838] shadow-lg font-mono-tech space-y-3 ${className}`}
    >
      {/* Top metrics header: Kitny % download ho gayi vs Kitny % rehti hai */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {/* Metric 1: Downloaded */}
        <div className="p-2.5 rounded-lg bg-[#081a13] border border-[#14482c] flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans">
              Download Ho Gayi
            </span>
            <div className="text-sm sm:text-base font-bold text-[#0df597] flex items-center gap-1.5">
              <ArrowDownCircle className="w-4 h-4 text-[#0df597]" />
              <span>{safePercent}%</span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#0b241b] text-[#0df597] font-bold border border-[#185e39]">
            {isCompleted || safePercent === 100 ? 'COMPLETE' : 'ACTIVE'}
          </span>
        </div>

        {/* Metric 2: Remaining */}
        <div className="p-2.5 rounded-lg bg-[#14180d] border border-[#423b12] flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans">
              Download Rehti Hai
            </span>
            <div className="text-sm sm:text-base font-bold text-amber-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>{remaining}%</span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#24210d] text-amber-300 font-bold border border-[#524412]">
            {remaining === 0 ? '0% LEFT' : 'PENDING'}
          </span>
        </div>
      </div>

      {/* Futuristic Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] text-slate-300">
          <span className="flex items-center gap-1.5 font-semibold text-slate-200">
            <HardDrive className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span>Progress: {safePercent}% / 100%</span>
          </span>
          <span className="text-slate-400 text-[10px]">
            {transferredMB && totalMB
              ? `${transferredMB} MB of ${totalMB} MB`
              : transferredMB
              ? `${transferredMB} MB downloaded`
              : `${safePercent}% completed`}
          </span>
        </div>

        <div className="w-full bg-[#050b11] h-3.5 rounded-lg p-0.5 border border-[#18364b] overflow-hidden relative shadow-inner">
          {/* Glowing bar */}
          <div
            className="h-full rounded-md bg-gradient-to-r from-[#00e5ff] via-[#0df597] to-[#10b981] transition-all duration-300 shadow-[0_0_12px_#0df597] relative overflow-hidden"
            style={{ width: `${safePercent}%` }}
          >
            {/* Animated light sheen across the bar */}
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Bottom telemetry detail strip */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-[#0e1d29] pt-2">
        <div className="flex items-center gap-3">
          <span>
            Transfer Speed: <strong className="text-slate-200">{speedText}</strong>
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline">
            Installer: <strong className="text-slate-300 font-mono">NSIS .exe</strong>
          </span>
        </div>

        {safePercent === 100 || isCompleted ? (
          <span className="text-[#0df597] flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% Staged</span>
          </span>
        ) : (
          <span className="text-cyan-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>Streaming payload</span>
          </span>
        )}
      </div>
    </div>
  );
}
