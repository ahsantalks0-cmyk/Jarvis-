import { Database, Plus, FileText, Search, BrainCircuit } from 'lucide-react';

export default function MemoryTab() {
  return (
    <div className="h-full flex flex-col overflow-y-auto bg-[#06070a]">
      <div className="w-full max-w-6xl mx-auto px-6 md:px-10 py-6 space-y-6 flex-1 flex flex-col">
        {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161b27]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0df597]" />
            <h1 className="text-base font-tech font-bold uppercase tracking-wider text-slate-100">
              Neural Memory Bank
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-[#0e1624] text-[#0df597] border border-[#1b283d]">
              # 0 ITEMS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Episodic storage, vector embeddings, and persistent user context database.
          </p>
        </div>

        <button
          type="button"
          disabled
          className="px-3 py-2 rounded-xl bg-[#0f1422] border border-[#1d273a] text-slate-400 text-xs font-mono-tech flex items-center gap-2 cursor-not-allowed opacity-75"
        >
          <Plus className="w-3.5 h-3.5 text-[#0df597]" />
          <span>NEW MEMORY NODE</span>
        </button>
      </div>

      {/* Main 2-column layout (matching screenshot 10) */}
      <div className="flex-1 min-h-[420px] rounded-2xl bg-[#080a11] border border-[#141825] flex flex-col md:flex-row overflow-hidden">
        {/* Left Subpanel: Memory Index List */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[#141825] p-5 flex flex-col justify-between bg-[#07090f]/70">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono-tech tracking-wider uppercase text-slate-400 font-semibold">
                MEMORY BANK
              </span>
              <span className="text-[10px] font-mono-tech text-slate-500">0 NODES</span>
            </div>

            <div className="relative mb-4">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                disabled
                placeholder="Search semantic index..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#0a0d15] border border-[#161c2b] rounded-lg text-xs text-slate-400 placeholder-slate-600 cursor-not-allowed font-sans"
              />
            </div>

            <div className="text-center py-10 space-y-2">
              <Database className="w-8 h-8 text-slate-600 mx-auto stroke-[1.5]" />
              <p className="text-xs font-mono-tech text-slate-400">No memories saved.</p>
              <p className="text-[11px] text-slate-500 font-sans">
                Click + or ask Jarvis to store persistent context in future phases.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0a0d15] border border-[#161c2a] text-[10px] font-mono-tech text-slate-500 flex items-center gap-2">
            <BrainCircuit className="w-3.5 h-3.5 text-[#0df597]" />
            <span>Local Vector Database • Standby</span>
          </div>
        </div>

        {/* Right Main Panel: Empty Document State (matching screenshot 10) */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-radial from-[#0e131d]/30 to-transparent">
          <div className="w-16 h-16 rounded-2xl bg-[#0b0e17] border border-[#161d2d] flex items-center justify-center text-slate-600 mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-xs font-mono-tech uppercase tracking-widest text-slate-300 font-semibold">
            SELECT A DATA NODE OR CREATE NEW
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm font-sans leading-relaxed">
            Memory graph viewer will display semantic entities, cross-session facts, and user preferences here.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
