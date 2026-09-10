import {
  Zap,
  Play,
  Save,
  Clock,
  Terminal,
  MousePointer,
  Keyboard,
  Globe,
  Plus,
  Volume2,
  FileCode
} from 'lucide-react';

export default function AutomationsTab() {
  const moduleLibrary = [
    {
      category: 'TRIGGERS',
      items: [
        { name: 'TRIGGER', icon: Zap },
        { name: 'WAIT', icon: Clock }
      ]
    },
    {
      category: 'SYSTEM',
      items: [
        { name: 'OPEN APP', icon: Play },
        { name: 'CLOSE APP', icon: Play },
        { name: 'SET VOLUME', icon: Volume2 }
      ]
    },
    {
      category: 'AUTOMATION',
      items: [
        { name: 'GHOST TYPE', icon: Keyboard },
        { name: 'PRESS SHORTCUT', icon: Keyboard },
        { name: 'CLICK ON SCREEN', icon: MousePointer },
        { name: 'RUN TERMINAL', icon: Terminal }
      ]
    },
    {
      category: 'WEB INTELLIGENCE',
      items: [
        { name: 'GOOGLE SEARCH', icon: Globe },
        { name: 'DEEP RESEARCH', icon: FileCode }
      ]
    }
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-[#06070a]">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-10 py-6 space-y-5 flex-1 flex flex-col">
        {/* Top action header (matching screenshot 5) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#161b27]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0df597]" />
          <h1 className="text-base font-tech font-bold uppercase tracking-wider text-slate-100">
            Automations & Neural Macros
          </h1>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-[#0e1624] text-[#0df597] border border-[#1b283d]">
            Neural Patterns (0)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            className="px-3 py-1.5 rounded-lg border border-[#1d273a] text-slate-400 text-xs font-mono-tech flex items-center gap-1.5 cursor-not-allowed opacity-75"
          >
            <Play className="w-3 h-3 text-[#0df597]" />
            <span>RUN MACRO</span>
          </button>

          <button
            type="button"
            disabled
            className="px-4 py-1.5 rounded-lg bg-[#0df597] text-[#06080d] font-bold text-xs font-tech tracking-wider flex items-center gap-1.5 cursor-not-allowed opacity-75 shadow-[0_0_12px_rgba(13,245,151,0.25)]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>SAVE PIPELINE</span>
          </button>
        </div>
      </div>

      {/* Main 2-column layout (matching screenshot 5) */}
      <div className="flex-1 rounded-2xl bg-[#080a11] border border-[#141825] flex flex-col md:flex-row overflow-hidden">
        {/* Left Module Library Drawer (exact layout from screenshot 5) */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#141825] p-3.5 overflow-y-auto bg-[#07090f]/80 space-y-4">
          <div className="text-[10px] font-mono-tech uppercase tracking-widest text-slate-400 font-semibold">
            MODULE LIBRARY
          </div>

          <div className="space-y-4">
            {moduleLibrary.map((grp) => (
              <div key={grp.category} className="space-y-1.5">
                <div className="text-[9px] font-mono-tech text-slate-500 uppercase tracking-wider">
                  {grp.category}
                </div>
                <div className="space-y-1">
                  {grp.items.map((mod) => {
                    const Icon = mod.icon;
                    return (
                      <div
                        key={mod.name}
                        className="px-2.5 py-1.5 rounded-lg bg-[#0a0d16] border border-[#141a27] hover:border-[#222c42] flex items-center gap-2 text-xs font-mono-tech text-slate-300 cursor-grab active:cursor-grabbing transition-all select-none"
                      >
                        <Icon className="w-3.5 h-3.5 text-[#0df597]" />
                        <span className="text-[11px]">{mod.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Canvas: Macro Builder Workspace */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-radial from-[#0e131d]/30 to-transparent relative">
          <div className="w-16 h-16 rounded-2xl bg-[#0b0e17] border border-[#182133] flex items-center justify-center text-[#0df597] mb-4 shadow-[0_0_20px_rgba(13,245,151,0.1)]">
            <Zap className="w-8 h-8" />
          </div>

          <h3 className="text-xs font-mono-tech uppercase tracking-widest text-slate-200 font-semibold">
            EMPTY MACRO CANVAS
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-sm font-sans leading-relaxed">
            Drag system actions, input simulators, and research triggers from the left module library into this flow canvas.
          </p>

          <div className="mt-5 px-3 py-1.5 rounded-lg bg-[#0a0d15] border border-[#161c2a] text-[10px] font-mono-tech text-slate-400">
            Pipeline Orchestration Engine • Scheduled for Phase 3
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
