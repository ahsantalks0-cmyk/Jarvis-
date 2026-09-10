import { useState } from 'react';
import {
  Mic,
  Save,
  ShieldCheck,
  Lock,
  Volume2,
  AudioWaveform,
  Info,
  ChevronDown
} from 'lucide-react';

export default function VoiceApiTab() {
  const [selectedVoiceProvider, setSelectedVoiceProvider] = useState('elevenlabs');

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto bg-[#06070a] space-y-6">
      {/* Sub-navigation bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#161b27]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0df597]" />
            <h1 className="text-base font-tech font-bold uppercase tracking-wider text-slate-100">
              Command Center // Voice API
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-[#19140b] text-amber-400 border border-[#3d2c12]">
              COMING IN PHASE 4
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Ultra-low latency duplex audio pipelines, neural speech synthesis, and local Whisper audio models.
          </p>
        </div>

        {/* Mock subtabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#090c14] border border-[#161c2a] text-xs font-mono-tech">
          <span className="px-3 py-1 rounded-lg text-slate-500">SYSTEM</span>
          <span className="px-3 py-1 rounded-lg text-slate-500">HARDWARE</span>
          <span className="px-3 py-1 rounded-lg bg-[#141926] text-[#0df597] border border-[#232d42]">VOICE KEYS</span>
          <span className="px-3 py-1 rounded-lg text-slate-500">PIPELINES</span>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="p-6 rounded-2xl bg-[#0b0e16] border border-[#161c2b] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#141926] pb-4">
          <div className="flex items-center gap-2.5">
            <Mic className="w-5 h-5 text-[#0df597]" />
            <div>
              <h2 className="text-sm font-tech font-bold text-slate-200 uppercase tracking-wide">
                Voice & Speech Engine Endpoints
              </h2>
              <span className="text-[10px] font-mono-tech text-slate-500">
                SPEECH-TO-TEXT & TEXT-TO-SPEECH PROVIDERS
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled
            title="Disabled in Phase 1"
            className="px-4 py-2 rounded-full bg-slate-100 text-slate-950 font-bold text-xs flex items-center gap-2 tracking-wider font-tech uppercase opacity-60 cursor-not-allowed"
          >
            <Save className="w-3.5 h-3.5" />
            <span>SAVE VOICE KEYS</span>
          </button>
        </div>

        {/* Phase 4 Banner Notice */}
        <div className="p-3.5 rounded-xl bg-[#10131d] border border-[#1b2336] flex items-center gap-3 text-xs font-mono-tech text-slate-300">
          <Info className="w-4 h-4 text-[#0df597] shrink-0" />
          <span>
            Real-time duplex audio hardware protocols and voice models activate in Phase 4. Key vaults are locked.
          </span>
        </div>

        {/* Provider Dropdown (Required) */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono-tech text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span>Primary Voice Synthesizer Provider</span>
            <span className="text-[9px] text-slate-500">(Disabled Placeholder)</span>
          </label>
          <div className="relative">
            <select
              disabled
              value={selectedVoiceProvider}
              onChange={(e) => setSelectedVoiceProvider(e.target.value)}
              className="w-full bg-[#07090f] border border-[#182030] rounded-xl px-4 py-2.5 text-xs text-slate-300 appearance-none cursor-not-allowed opacity-75 font-sans"
            >
              <option value="elevenlabs">ElevenLabs (Multilingual V2 / Flash)</option>
              <option value="cartesia">Cartesia Sonic (Ultra-low latency)</option>
              <option value="whisper">OpenAI Whisper (Speech-to-Text)</option>
              <option value="deepgram">Deepgram Nova-2 (Real-time)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Key Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono-tech text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <AudioWaveform className="w-3 h-3 text-[#0df597]" />
              <span>ELEVENLABS SPEECH KEY</span>
            </label>
            <div className="relative">
              <input
                type="text"
                disabled
                value="xi-••••••••••••••••••••••••••••••••••••"
                readOnly
                className="w-full bg-[#07090f] border border-[#182030] rounded-xl px-4 py-2.5 text-xs text-slate-300 font-mono tracking-widest cursor-not-allowed opacity-75"
              />
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3.5 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono-tech text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Volume2 className="w-3 h-3 text-[#00e5ff]" />
              <span>CARTESIA AUDIO KEY</span>
            </label>
            <div className="relative">
              <input
                type="text"
                disabled
                value="cartesia_••••••••••••••••••••••••••••••"
                readOnly
                className="w-full bg-[#07090f] border border-[#182030] rounded-xl px-4 py-2.5 text-xs text-slate-300 font-mono tracking-widest cursor-not-allowed opacity-75"
              />
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3.5 top-3" />
            </div>
          </div>
        </div>

        {/* Audio Device Hardware routing (Disabled placeholders) */}
        <div className="p-4 rounded-xl bg-[#080b12] border border-[#141826] grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-mono-tech text-slate-500 uppercase">
              Microphone Input Device
            </label>
            <div className="text-xs text-slate-300 font-mono mt-1">
              Default System Recording Interface
            </div>
          </div>
          <div>
            <label className="text-[10px] font-mono-tech text-slate-500 uppercase">
              Speaker Output Device
            </label>
            <div className="text-xs text-slate-300 font-mono mt-1">
              Default High-Definition Audio Device
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-3.5 rounded-xl bg-[#080a11] border border-[#131724] flex items-start gap-3 text-[11px] font-mono-tech text-slate-400 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-[#0df597] shrink-0 mt-0.5" />
          <span>
            [SECURITY NOTICE]: All voice model keys are stored encrypted within your client container. Voice inference streaming communicates strictly through direct TLS connections.
          </span>
        </div>
      </div>
    </div>
  );
}
