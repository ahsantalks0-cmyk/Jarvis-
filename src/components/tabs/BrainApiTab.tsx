import { useState } from 'react';
import {
  BrainCircuit,
  Save,
  ShieldCheck,
  Lock,
  Sparkles,
  Info,
  ChevronDown
} from 'lucide-react';

export default function BrainApiTab() {
  const [selectedProvider, setSelectedProvider] = useState('gemini');

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto bg-[#06070a] space-y-6">
      {/* Sub-navigation bar (matching screenshot 3) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161b27]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0df597]" />
            <h1 className="text-base font-tech font-bold uppercase tracking-wider text-slate-100">
              Command Center // Brain API
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-[#19140b] text-amber-400 border border-[#3d2c12]">
              COMING IN PHASE 2
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Cognitive model providers, neural reasoning parameters, and local key vault.
          </p>
        </div>

        {/* Mock subtabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#090c14] border border-[#161c2a] text-xs font-mono-tech">
          <span className="px-3 py-1 rounded-lg text-slate-500">SYSTEM</span>
          <span className="px-3 py-1 rounded-lg text-slate-500">GENERAL</span>
          <span className="px-3 py-1 rounded-lg bg-[#141926] text-[#0df597] border border-[#232d42]">API KEYS</span>
          <span className="px-3 py-1 rounded-lg text-slate-500">SECURITY</span>
        </div>
      </div>

      {/* Main Form Card (matching screenshots 3 & 9) */}
      <div className="p-6 rounded-2xl bg-[#0b0e16] border border-[#161c2b] space-y-6">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#141926] pb-4">
          <div className="flex items-center gap-2.5">
            <BrainCircuit className="w-5 h-5 text-[#0df597]" />
            <div>
              <h2 className="text-sm font-tech font-bold text-slate-200 uppercase tracking-wide">
                External API Endpoints
              </h2>
              <span className="text-[10px] font-mono-tech text-slate-500">
                PROVIDER REGISTRATION & MODEL ROUTING
              </span>
            </div>
          </div>

          {/* White Pill Button (matching exact screenshot design) */}
          <button
            type="button"
            disabled
            title="Disabled in Phase 1"
            className="px-4 py-2 rounded-full bg-slate-100 text-slate-950 font-bold text-xs flex items-center gap-2 tracking-wider font-tech uppercase opacity-60 cursor-not-allowed"
          >
            <Save className="w-3.5 h-3.5" />
            <span>SAVE ALL KEYS</span>
          </button>
        </div>

        {/* Phase 2 Banner Notice */}
        <div className="p-3.5 rounded-xl bg-[#10131d] border border-[#1b2336] flex items-center gap-3 text-xs font-mono-tech text-slate-300">
          <Info className="w-4 h-4 text-[#0df597] shrink-0" />
          <span>
            Brain API orchestration is scheduled for Phase 2. Model connectors and credentials remain locked in Phase 1.
          </span>
        </div>

        {/* Provider Dropdown (Required: Gemini, OpenAI, Anthropic - disabled/placeholder) */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono-tech text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span>Active Inference Provider</span>
            <span className="text-[9px] text-slate-500">(Disabled Placeholder)</span>
          </label>
          <div className="relative">
            <select
              disabled
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full bg-[#07090f] border border-[#182030] rounded-xl px-4 py-2.5 text-xs text-slate-300 appearance-none cursor-not-allowed opacity-75 font-sans"
            >
              <option value="gemini">Google Gemini (Gemini 2.5 / 2.0 Pro)</option>
              <option value="openai">OpenAI (GPT-4o / o1)</option>
              <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* API Key Input Fields (matching screenshots 3 & 9 with masked dots and labels) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Gemini */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono-tech text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-[#0df597]" />
              <span>GEMINI PRO CORE</span>
            </label>
            <div className="relative">
              <input
                type="text"
                disabled
                value="••••••••••••••••••••••••••••••••••••••••"
                readOnly
                className="w-full bg-[#07090f] border border-[#182030] rounded-xl px-4 py-2.5 text-xs text-slate-300 font-mono tracking-widest cursor-not-allowed opacity-75 selection:bg-blue-600"
              />
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3.5 top-3" />
            </div>
          </div>

          {/* OpenAI */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono-tech text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <BrainCircuit className="w-3 h-3 text-[#00e5ff]" />
              <span>OPENAI GPT-4O CORE</span>
            </label>
            <div className="relative">
              <input
                type="text"
                disabled
                value="••••••••••••••••••••••••••••••••••••••••"
                readOnly
                className="w-full bg-[#07090f] border border-[#182030] rounded-xl px-4 py-2.5 text-xs text-slate-300 font-mono tracking-widest cursor-not-allowed opacity-75"
              />
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3.5 top-3" />
            </div>
          </div>

          {/* Anthropic */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono-tech text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>ANTHROPIC CLAUDE 3.5</span>
            </label>
            <div className="relative">
              <input
                type="text"
                disabled
                value="sk-ant-api03-••••••••••••••••••••••••••••"
                readOnly
                className="w-full bg-[#07090f] border border-[#182030] rounded-xl px-4 py-2.5 text-xs text-slate-300 font-mono tracking-widest cursor-not-allowed opacity-75"
              />
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3.5 top-3" />
            </div>
          </div>

          {/* Groq Fast Inferencing */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono-tech text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <BrainCircuit className="w-3 h-3 text-purple-400" />
              <span>GROQ FAST INFERENCING</span>
            </label>
            <div className="relative">
              <input
                type="text"
                disabled
                value="gsk_•••••••••••••••••••••••••••••••••••••"
                readOnly
                className="w-full bg-[#07090f] border border-[#182030] rounded-xl px-4 py-2.5 text-xs text-slate-300 font-mono tracking-widest cursor-not-allowed opacity-75"
              />
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3.5 top-3" />
            </div>
          </div>
        </div>

        {/* Security Notice Disclaimer (exact match from screenshots 3 & 9) */}
        <div className="p-3.5 rounded-xl bg-[#080a11] border border-[#131724] flex items-start gap-3 text-[11px] font-mono-tech text-slate-400 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-[#0df597] shrink-0 mt-0.5" />
          <span>
            [SECURITY NOTICE]: All API keys are encrypted and stored strictly in your local OS. Jarvis does not transmit these keys to any centralized server. You maintain full ownership and billing control over your provider endpoints.
          </span>
        </div>
      </div>
    </div>
  );
}
