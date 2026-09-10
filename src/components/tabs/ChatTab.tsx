import { useState, FormEvent } from 'react';
import {
  Mic,
  Send,
  Phone,
  Video,
  MicOff,
  Activity,
  Cpu,
  Thermometer,
  Radio,
  Sparkles,
  Bot
} from 'lucide-react';
import NeuralOrb from '../NeuralOrb';

interface Message {
  id: string;
  sender: 'jarvis' | 'user';
  text: string;
  time: string;
}

const initialMessages: Message[] = [
  {
    id: 'msg-1',
    sender: 'jarvis',
    text: 'Jarvis Neural Interface initialized. Standing by for voice or text instructions.',
    time: '12:01:10 PM'
  },
  {
    id: 'msg-2',
    sender: 'user',
    text: 'Status report on core subsystems.',
    time: '12:01:18 PM'
  },
  {
    id: 'msg-3',
    sender: 'jarvis',
    text: 'All neural matrices nominal. Agent Registry mounted with 3 dormant modules. Auto-updater linked to GitHub repository release pipeline.',
    time: '12:01:22 PM'
  }
];

export default function ChatTab() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputVal, setInputVal] = useState('');
  const [micActive, setMicActive] = useState(false);
  const [callActive, setCallActive] = useState(false);

  const handleSend = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: inputVal.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');

    // Simulated assistant response (Phase 1 UI skeleton feedback)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-resp-${Date.now()}`,
          sender: 'jarvis',
          text: 'Instruction logged to Activity Stream. [Phase 1 Foundation: AI execution pipeline will activate in Phase 2 with Brain API connection.]',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      ]);
    }, 450);
  };

  return (
    <div className="h-full flex flex-col xl:flex-row overflow-hidden bg-[#06070a]">
      {/* LEFT COLUMN: Telemetry & Core Metrics (matching attached images 4 & 8) */}
      <div className="w-full xl:w-72 p-4 border-b xl:border-b-0 xl:border-r border-[#151924] flex flex-col gap-4 shrink-0 overflow-y-auto bg-[#07090f]/70">
        {/* Network Telemetry */}
        <div className="p-3.5 rounded-xl bg-[#0b0e16] border border-[#161c2b] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-mono-tech text-slate-300 uppercase tracking-wider font-semibold">
              <Radio className="w-3.5 h-3.5 text-[#0df597]" />
              <span>Network Telemetry</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono-tech bg-[#0e1624] border border-[#1b283d] text-[#0df597]">
              SECURE UPLINK
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono-tech">
            <div className="p-2 rounded bg-[#07090f] border border-[#141a27]">
              <div className="text-[10px] text-slate-500">PING LATENCY</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">42 ms</div>
              <div className="w-full bg-[#161c2b] h-1 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-[#0df597] h-full w-[24%]" />
              </div>
            </div>
            <div className="p-2 rounded bg-[#07090f] border border-[#141a27]">
              <div className="text-[10px] text-slate-500">PACKET RATE</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">2.65 MB/s</div>
              <div className="w-full bg-[#161c2b] h-1 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-[#00e5ff] h-full w-[45%]" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono-tech text-slate-400 pt-1 border-t border-[#131722]">
            <span>ROUTING MESH</span>
            <span className="text-[#0df597] font-semibold">GLOBAL // SECURE</span>
          </div>
        </div>

        {/* Core Metrics */}
        <div className="p-3.5 rounded-xl bg-[#0b0e16] border border-[#161c2b] space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-mono-tech text-slate-300 uppercase tracking-wider font-semibold">
              <Cpu className="w-3.5 h-3.5 text-[#00e5ff]" />
              <span>Core Metrics</span>
            </div>
            <span className="text-[9px] font-mono-tech text-slate-500">NOMINAL</span>
          </div>

          <div className="space-y-2.5 font-mono-tech text-xs">
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>CPU LOAD</span>
                <span className="text-slate-200 font-semibold">31.3%</span>
              </div>
              <div className="w-full bg-[#111520] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#0df597] h-full w-[31.3%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>RAM USAGE</span>
                <span className="text-slate-200 font-semibold">74.7%</span>
              </div>
              <div className="w-full bg-[#111520] h-1.5 rounded-full overflow-hidden">
                <div className="bg-sky-400 h-full w-[74.7%]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 rounded bg-[#07090f] border border-[#141a27] flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-slate-500">THERMAL</div>
                  <div className="text-xs font-bold text-amber-300">50°C</div>
                </div>
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="p-2 rounded bg-[#07090f] border border-[#141a27] flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-slate-500">ENVIRONMENT</div>
                  <div className="text-xs font-bold text-slate-300">Electron</div>
                </div>
                <Activity className="w-3.5 h-3.5 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Neural State */}
        <div className="p-3 rounded-xl bg-[#090b12] border border-[#141824] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0e1422] border border-[#1b263b] flex items-center justify-center text-[#0df597]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-mono-tech font-semibold text-slate-200">
              NEURAL SUBSTRATE
            </div>
            <div className="text-[10px] text-slate-500">
              Phase 1 Standby Skeleton
            </div>
          </div>
        </div>
      </div>

      {/* CENTER COLUMN: Interactive 3D Neural Particle Orb & Controls (matching images 4 & 8) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-radial from-[#0d121c]/40 to-transparent">
        {/* Subtitle tag */}
        <div className="absolute top-4 px-3 py-1 rounded-full bg-[#0b0e16] border border-[#192233] text-[10px] font-mono-tech text-slate-400 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0df597] animate-pulse" />
          <span>NEURAL HARMONIC CORE</span>
        </div>

        {/* 3D Particle Sphere */}
        <div className="my-auto flex flex-col items-center justify-center">
          <NeuralOrb size={340} active={callActive || micActive} />
          
          <div className="mt-4 text-center">
            <h2 className="text-sm font-tech font-semibold tracking-wider text-slate-200 uppercase">
              Jarvis Core Engine
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-mono-tech">
              {callActive ? 'Voice Channel Active • Listening...' : 'Awaiting input or voice prompt'}
            </p>
          </div>
        </div>

        {/* Call Controls Bar (bottom center, matching screenshots 4 & 8) */}
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-[#090c14]/90 border border-[#161c2c] backdrop-blur-md mb-2 shadow-2xl">
          <button
            id="chat-btn-camera"
            title="Camera Toggle (Placeholder)"
            className="w-10 h-10 rounded-xl bg-[#0f1420] border border-[#1a2234] flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-[#151c2c] transition-all"
          >
            <Video className="w-4 h-4" />
          </button>

          <button
            id="chat-btn-call"
            title={callActive ? 'Disconnect Call' : 'Establish Neural Link'}
            onClick={() => setCallActive(!callActive)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              callActive
                ? 'bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)]'
                : 'bg-[#0df597] text-[#06080d] hover:bg-[#0be08a] shadow-[0_0_20px_rgba(13,245,151,0.35)]'
            }`}
          >
            <Phone className={`w-5 h-5 ${callActive ? 'rotate-[135deg]' : ''}`} />
          </button>

          <button
            id="chat-btn-mute"
            title={micActive ? 'Mute Microphone' : 'Activate Microphone'}
            onClick={() => setMicActive(!micActive)}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
              micActive
                ? 'bg-[#0df597]/20 border-[#0df597]/40 text-[#0df597]'
                : 'bg-[#0f1420] border-[#1a2234] text-slate-400 hover:text-slate-200 hover:bg-[#151c2c]'
            }`}
          >
            {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Transcript / Chat Stream & Input Box (matching images 4 & 8) */}
      <div className="w-full xl:w-96 border-t xl:border-t-0 xl:border-l border-[#151924] flex flex-col justify-between shrink-0 bg-[#07090f]/90">
        {/* Transcript Header */}
        <div className="p-3.5 border-b border-[#151924] flex items-center justify-between bg-[#080b12]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0df597]" />
            <span className="text-xs font-mono-tech tracking-wider uppercase font-semibold text-slate-200">
              TRANSCRIPT
            </span>
          </div>
          <span className="text-[10px] font-mono-tech text-slate-500">LIVE FEED</span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 space-y-3.5 overflow-y-auto text-xs font-sans">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[9px] font-mono-tech text-slate-500 mb-1 px-1">
                {msg.sender === 'jarvis' && (
                  <Bot className="w-2.5 h-2.5 text-[#0df597]" />
                )}
                <span>{msg.sender === 'user' ? 'OPERATOR' : 'JARVIS AI'}</span>
                <span>•</span>
                <span>{msg.time}</span>
              </div>
              <div
                className={`max-w-[90%] p-3 rounded-xl leading-relaxed text-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#101520] border border-[#1e273b] text-slate-100 rounded-br-sm'
                    : 'bg-[#0a0d15] border border-[#141b27] text-slate-300 rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Message Input Box (Bottom) */}
        <div className="p-3.5 border-t border-[#151924] bg-[#07090f]">
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <input
                id="chat-message-input"
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Enter command or message Jarvis..."
                className="w-full bg-[#0c1018] border border-[#1a2234] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#0df597]/60 focus:ring-1 focus:ring-[#0df597]/40 transition-all font-sans"
              />
            </div>

            {/* Mic Placeholder Button */}
            <button
              type="button"
              id="chat-mic-input-btn"
              title="Voice Input (Placeholder)"
              onClick={() => setMicActive(!micActive)}
              className={`p-2.5 rounded-xl border transition-all ${
                micActive
                  ? 'bg-[#0df597]/20 border-[#0df597]/40 text-[#0df597]'
                  : 'bg-[#0c1018] border-[#1a2234] text-slate-400 hover:text-slate-200 hover:bg-[#121824]'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              id="chat-send-btn"
              title="Send Message"
              className="p-2.5 rounded-xl bg-[#0df597] text-[#06080d] hover:bg-[#0be08a] transition-all font-semibold shadow-[0_0_12px_rgba(13,245,151,0.25)]"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 text-center">
            <span className="text-[10px] font-mono-tech text-slate-600">
              Press Enter to send • Local sandbox session
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
