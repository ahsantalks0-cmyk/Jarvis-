import { useState, useEffect } from 'react';
import { ShieldCheck, Wifi, Minus, Square, X, Cpu } from 'lucide-react';
import { electronBridge } from '../lib/electronBridge';

export default function Header() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      id="app-header"
      className="h-11 bg-[#06070a] border-b border-[#151924] flex items-center justify-between px-4 select-none shrink-0 z-50 text-xs font-mono-tech"
    >
      {/* Left Branding */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#0d121c] border border-[#1f283d] flex items-center justify-center text-[#0df597]">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-tech font-bold tracking-wider text-slate-100 text-xs leading-none">
              JARVIS AI
            </span>
            <span className="text-[9px] text-slate-500 tracking-widest leading-none mt-0.5">
              NEURAL INTERFACE
            </span>
          </div>
        </div>

        <div className="h-3 w-[1px] bg-[#1a202c] mx-1 hidden sm:block" />

        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#091016] border border-[#132724] text-[10px] text-[#0df597]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0df597] animate-pulse" />
          <span>KERNEL ACTIVE</span>
        </div>
      </div>

      {/* Center OS Label */}
      <div className="hidden md:flex items-center gap-2 text-slate-400 text-[11px] tracking-widest uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0df597]" />
        <span className="font-semibold text-slate-300">JARVIS OS</span>
        <span className="text-slate-600">//</span>
        <span>SYSTEM DESKTOP</span>
      </div>

      {/* Right Controls & Telemetry */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span className="px-1.5 py-0.5 rounded bg-[#0e131d] border border-[#1c2436] text-slate-300 font-medium">
            v1.0.0
          </span>
          <div className="flex items-center gap-1 text-[#0df597]">
            <ShieldCheck className="w-3 h-3" />
            <span className="tracking-wider">LINKED</span>
          </div>
          <div className="hidden lg:flex items-center gap-1 text-slate-400">
            <Wifi className="w-3 h-3 text-[#0df597]" />
            <span>100%</span>
          </div>
          <span className="hidden sm:inline text-slate-300 tracking-wider font-mono">
            {time || '12:00:00 PM'}
          </span>
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-1 pl-2 border-l border-[#191f2d]">
          <button
            id="win-btn-minimize"
            title="Minimize"
            onClick={() => electronBridge.windowControl('minimize')}
            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-[#131824] transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            id="win-btn-maximize"
            title="Maximize"
            onClick={() => electronBridge.windowControl('maximize')}
            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-[#131824] transition-colors"
          >
            <Square className="w-2.5 h-2.5" />
          </button>
          <button
            id="win-btn-close"
            title="Close"
            onClick={() => electronBridge.windowControl('close')}
            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </header>
  );
}
