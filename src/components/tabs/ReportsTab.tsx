import { Bell, CheckCircle2, ShieldAlert, Sparkles, Filter } from 'lucide-react';

export default function ReportsTab() {
  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto bg-[#06070a] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161b27]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0df597]" />
            <h1 className="text-base font-tech font-bold uppercase tracking-wider text-slate-100">
              Intelligence Reports & Notification Center
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-[#0e1624] text-[#0df597] border border-[#1b283d]">
              0 UNREAD
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Periodic synthesis briefs, runtime diagnostic digests, and security posture audits.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#090c14] border border-[#161c2a] text-xs font-mono-tech text-slate-400">
          <span className="px-3 py-1 rounded-lg bg-[#141926] text-[#0df597] border border-[#232d42]">ALL ALERTS</span>
          <span className="px-3 py-1 rounded-lg text-slate-500">SECURITY</span>
          <span className="px-3 py-1 rounded-lg text-slate-500">DIAGNOSTICS</span>
        </div>
      </div>

      {/* Notification Center Empty State */}
      <div className="flex-1 min-h-[380px] rounded-2xl bg-[#080b12] border border-[#141825] flex flex-col items-center justify-center p-8 text-center bg-radial from-[#0d121c]/40 to-transparent">
        <div className="w-16 h-16 rounded-2xl bg-[#0b0e17] border border-[#182032] flex items-center justify-center text-[#0df597] mb-4 shadow-[0_0_20px_rgba(13,245,151,0.1)]">
          <Bell className="w-8 h-8" />
        </div>

        <h3 className="text-xs font-mono-tech uppercase tracking-widest text-slate-200 font-semibold">
          ALL NOTIFICATIONS & DIAGNOSTICS CURRENT
        </h3>
        <p className="text-xs text-slate-500 mt-1.5 max-w-sm font-sans leading-relaxed">
          No unresolved security anomalies, memory leaks, or execution alerts detected across runtime modules.
        </p>

        <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0a0f18] border border-[#172235] text-[10px] font-mono-tech text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#0df597]" />
          <span>System Health: 100% Nominal</span>
        </div>
      </div>
    </div>
  );
}
