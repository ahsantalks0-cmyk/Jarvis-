import { useState, useEffect } from 'react';
import { Activity, Terminal, Shield, RefreshCw, Filter, Trash2 } from 'lucide-react';
import { ActivityLogItem } from '../../types';
import { activityLogService } from '../../lib/activityLogService';

export default function ActivityLogTab() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    const unsubscribe = activityLogService.subscribe((updated) => {
      setLogs(updated);
    });
    return unsubscribe;
  }, []);

  const filteredLogs = logs.filter(
    (l) => filter === 'ALL' || l.category === filter
  );

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-[#06070a]">
      <div className="w-full max-w-6xl mx-auto px-6 md:px-10 py-6 space-y-6 flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161b27]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0df597]" />
            <h1 className="text-base font-tech font-bold uppercase tracking-wider text-slate-100">
              System Audit Trail & Event Telemetry
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-[#0e1624] text-[#0df597] border border-[#1b283d]">
              {logs.length} EVENTS LOGGED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Real-time execution metrics, security transactions, and subsystem telemetry logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#090c14] border border-[#161c2a] text-xs font-mono-tech overflow-x-auto">
            {['ALL', 'SYSTEM', 'BRAIN_API', 'FAILOVER', 'SECURITY', 'AGENT'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all whitespace-nowrap ${
                  filter === cat
                    ? 'bg-[#141926] text-[#0df597] border border-[#232d42]'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => activityLogService.clearLogs()}
            title="Clear Activity Logs"
            className="p-2 rounded-xl bg-[#090c14] border border-[#161c2a] text-slate-500 hover:text-red-400 hover:border-red-900/40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log rows list */}
      <div className="p-4 rounded-2xl bg-[#080b12] border border-[#151a26] space-y-2 font-mono-tech">
        <div className="flex items-center justify-between text-[10px] text-slate-500 pb-2 border-b border-[#131722] px-2">
          <span>TIMESTAMP / EVENT</span>
          <span>CATEGORY / STATUS</span>
        </div>

        <div className="space-y-2">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-[#0a0d15] border border-[#131926] hover:border-[#1d273a] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-500">{log.timestamp}</span>
                <span className="text-xs text-slate-200 font-sans">{log.event}</span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="text-[9px] px-2 py-0.5 rounded bg-[#0d121e] border border-[#182337] text-slate-400">
                  {log.category}
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-[#0b1713] border border-[#123326] text-[#0df597]">
                  {log.status}
                </span>
                <span className="text-[10px] text-slate-500">{log.latency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 rounded-xl bg-[#090c14] border border-[#141824] flex items-center justify-between text-xs font-mono-tech text-slate-500">
        <span>Log retention: Local circular buffer (10,000 items)</span>
        <span className="text-[#0df597]">Active Stream Synced</span>
      </div>
      </div>
    </div>
  );
}
