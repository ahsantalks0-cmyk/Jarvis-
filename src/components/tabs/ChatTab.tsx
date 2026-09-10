import { useState, useRef, useEffect, FormEvent } from 'react';
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
  Bot,
  BrainCircuit,
  Waves,
  ArrowRightLeft,
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import NeuralOrb from '../NeuralOrb';
import { JarvisMode, FailoverEvent } from '../../types';
import { brainApiService } from '../../lib/brainApi/brainApiService';

interface Message {
  id: string;
  sender: 'jarvis' | 'user';
  text: string;
  time: string;
  providerBadge?: string;
  latencyMs?: number;
  tokens?: { input: number; output: number };
  isStreaming?: boolean;
}

const initialMessages: Message[] = [
  {
    id: 'msg-1',
    sender: 'jarvis',
    text: 'Jarvis Neural Interface initialized with Brain API multi-provider routing (v1.1.1). Standing by for voice or text instructions.',
    time: '12:01:10 PM',
    providerBadge: 'Brain API Engine'
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
    text: 'All neural matrices nominal. Brain API provider router online with automatic failover, priority scheduling, and SafeStorage encryption. Auto-updater linked to v1.1.1 release channel.',
    time: '12:01:22 PM',
    providerBadge: 'System Core',
    latencyMs: 14,
    tokens: { input: 12, output: 42 }
  }
];

export default function ChatTab() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputVal, setInputVal] = useState('');
  const [micActive, setMicActive] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [activeMode, setActiveMode] = useState<JarvisMode>('idle');
  const [failoverAlert, setFailoverAlert] = useState<FailoverEvent | null>(null);
  const [statusHint, setStatusHint] = useState<string>('Standing by for command');
  const [activeProviderName, setActiveProviderName] = useState<string>('Gemini');
  const historyBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateActive = () => {
      const active = brainApiService.getActiveProvider();
      if (active) {
        setActiveProviderName(`${active.name} (${active.selectedModel})`);
      }
    };
    updateActive();
    return brainApiService.subscribe(updateActive);
  }, []);

  useEffect(() => {
    historyBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal.trim();
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');

    // Set mode to thinking while preparing request
    setActiveMode('thinking');
    setStatusHint('Engaging cognitive router...');

    const jarvisMsgId = `msg-resp-${Date.now()}`;
    const placeholderMsg: Message = {
      id: jarvisMsgId,
      sender: 'jarvis',
      text: '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isStreaming: true
    };

    setMessages((prev) => [...prev, placeholderMsg]);

    // Prepare conversation history
    const conversationHistory = [...messages, userMsg].map((m) => ({
      role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
      content: m.text
    }));

    try {
      let accumulatedText = '';

      const result = await brainApiService.executeChatPrompt(conversationHistory, {
        onChunk: (chunk: string) => {
          accumulatedText = chunk;
          setActiveMode('speaking');
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === jarvisMsgId
                ? {
                    ...msg,
                    text: accumulatedText,
                    isStreaming: true
                  }
                : msg
            )
          );
        },
        onProviderSwitch: (event: FailoverEvent) => {
          setFailoverAlert(event);
          setStatusHint(`Failover: ${event.fromProviderName} → ${event.toProviderName}`);
          setTimeout(() => setFailoverAlert(null), 5000);
        },
        onStatusChange: (status: string) => {
          setStatusHint(status);
        }
      });

      // Update completed message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === jarvisMsgId
            ? {
                ...msg,
                text: result.text,
                providerBadge: `via ${result.providerName} (${result.model})`,
                latencyMs: result.latencyMs,
                tokens: result.tokens,
                isStreaming: false
              }
            : msg
        )
      );

      // Voice speech synthesis if call is active
      if (callActive && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(result.text.replace(/\[.*?\]/g, ''));
        utterance.rate = 1.05;
        utterance.pitch = 0.95;
        utterance.onend = () => {
          setActiveMode('idle');
          setStatusHint('Standing by for command');
        };
        window.speechSynthesis.speak(utterance);
      } else {
        // Return to idle after speech animation pause
        setTimeout(() => {
          setActiveMode('idle');
          setStatusHint('Standing by for command');
        }, 2200);
      }
    } catch (err: any) {
      console.error('Inference pipeline error:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === jarvisMsgId
            ? {
                ...msg,
                text: `[Cognitive Pipeline Error]: ${err?.message || 'Connection failure'}`,
                providerBadge: 'Pipeline Fault',
                isStreaming: false
              }
            : msg
        )
      );
      setActiveMode('idle');
      setStatusHint('Standing by for command');
    }
  };

  const modeButtons: Array<{ id: JarvisMode; label: string; icon: typeof Sparkles }> = [
    { id: 'idle', label: 'Idle', icon: Sparkles },
    { id: 'listening', label: 'Listening', icon: Radio },
    { id: 'thinking', label: 'Thinking', icon: BrainCircuit },
    { id: 'speaking', label: 'Speaking', icon: Waves }
  ];

  return (
    <div className="h-full w-full flex flex-row overflow-hidden bg-[#06070a]">
      {/* ============================================================ */}
      {/* CRITICAL FIX 1: LEFT SIDEBAR (DEDICATED TELEMETRY PANELS ONLY) */}
      {/* ============================================================ */}
      <aside
        id="telemetry-left-sidebar"
        className="w-60 md:w-64 lg:w-72 border-r border-[#151924] flex flex-col shrink-0 h-full overflow-hidden bg-[#07090f]/95 z-10"
      >
        {/* Telemetry Header */}
        <div className="p-3 border-b border-[#151924] flex items-center justify-between bg-[#080b12] shrink-0">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#0df597]" />
            <span className="text-xs font-mono-tech tracking-wider uppercase font-semibold text-slate-200">
              SYSTEM TELEMETRY
            </span>
          </div>
          <span className="text-[9px] font-mono-tech px-2 py-0.5 rounded bg-[#0e1624] border border-[#1b283d] text-[#0df597]">
            LIVE UPLINK
          </span>
        </div>

        {/* Scrollable Telemetry Stack */}
        <div className="flex-1 p-3.5 space-y-3 overflow-y-auto min-h-0">
          {/* Network Telemetry Card */}
          <div className="p-3.5 rounded-xl bg-[#0b0e16] border border-[#161c2b] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-mono-tech text-slate-300 uppercase tracking-wider font-semibold">
                <Radio className="w-3 h-3 text-[#0df597]" />
                <span>Network Telemetry</span>
              </div>
              <span className="text-[9px] font-mono-tech text-[#0df597]">SECURE</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono-tech">
              <div className="p-2.5 rounded-lg bg-[#07090f] border border-[#141a27]">
                <div className="text-[9px] text-slate-500">PING LATENCY</div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">42 ms</div>
                <div className="w-full bg-[#161c2b] h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-[#0df597] h-full w-[24%]" />
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#07090f] border border-[#141a27]">
                <div className="text-[9px] text-slate-500">PACKET RATE</div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">2.65 MB/s</div>
                <div className="w-full bg-[#161c2b] h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-[#00e5ff] h-full w-[45%]" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono-tech text-slate-400 pt-1 border-t border-[#131722]">
              <span>ROUTING MESH</span>
              <span className="text-[#0df597] font-semibold">GLOBAL // SECURE</span>
            </div>
          </div>

          {/* Core Metrics Card */}
          <div className="p-3.5 rounded-xl bg-[#0b0e16] border border-[#161c2b] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-mono-tech text-slate-300 uppercase tracking-wider font-semibold">
                <Cpu className="w-3 h-3 text-[#00e5ff]" />
                <span>Core Metrics</span>
              </div>
              <span className="text-[9px] font-mono-tech text-slate-500">NOMINAL</span>
            </div>

            <div className="space-y-2.5 font-mono-tech text-xs">
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>CPU LOAD</span>
                  <span className="text-slate-200 font-semibold">31.3%</span>
                </div>
                <div className="w-full bg-[#111520] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#0df597] h-full w-[31.3%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>RAM USAGE</span>
                  <span className="text-slate-200 font-semibold">74.7%</span>
                </div>
                <div className="w-full bg-[#111520] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-sky-400 h-full w-[74.7%]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 rounded-lg bg-[#07090f] border border-[#141a27] flex items-center justify-between">
                  <div>
                    <div className="text-[8px] text-slate-500">THERMAL</div>
                    <div className="text-[11px] font-bold text-amber-300">50°C</div>
                  </div>
                  <Thermometer className="w-3 h-3 text-amber-400" />
                </div>
                <div className="p-2 rounded-lg bg-[#07090f] border border-[#141a27] flex items-center justify-between">
                  <div>
                    <div className="text-[8px] text-slate-500">HOST</div>
                    <div className="text-[11px] font-bold text-slate-300">Electron</div>
                  </div>
                  <Activity className="w-3 h-3 text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Neural Substrate Card */}
          <div className="p-3 rounded-xl bg-[#0b0e16] border border-[#161c2b] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0e1422] border border-[#1b263b] flex items-center justify-center text-[#0df597] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono-tech font-semibold text-slate-200 truncate">
                NEURAL SUBSTRATE
              </div>
              <div className="text-[9px] text-slate-500 truncate">
                Phase 1 Standby Skeleton • Nominal
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* CENTER: Hero Jarvis Globe + Control Buttons + 4 Mode Buttons */}
      {/* ============================================================ */}
      <section
        id="chat-center-stage"
        className="flex-1 flex flex-col justify-between items-center p-4 lg:p-6 min-w-0 min-h-0 overflow-hidden relative"
      >
        {/* Top Status Header */}
        <div className="w-full flex items-center justify-between shrink-0 mb-1 px-3">
          <div className="px-3 py-1 rounded-full bg-[#0b0e16] border border-[#192233] text-[10px] font-mono-tech text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0df597] animate-pulse" />
            <span>NEURAL HARMONIC CORE</span>
          </div>

          <div className="text-[10px] font-mono-tech text-slate-500">
            STATE:{' '}
            <span className="text-[#0df597] font-semibold uppercase">
              {activeMode}
            </span>
          </div>
        </div>

        {/* Center Responsive Globe Area - Expanded for Large Majestic Neural Orb */}
        <div className="flex-1 w-full min-h-0 flex items-center justify-center relative p-1 overflow-hidden">
          <NeuralOrb
            mode={activeMode}
            active={callActive || micActive || activeMode !== 'idle'}
          />
        </div>

        {/* Action Controls & 4 Mode Buttons */}
        <div className="w-full flex flex-col items-center gap-3 shrink-0 my-2">
          {/* Hardware & Link Call Controls */}
          <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-[#090c14]/90 border border-[#161c2c] backdrop-blur-md shadow-xl">
            <button
              id="chat-btn-camera"
              title="Camera Feed Toggle"
              className="w-9 h-9 rounded-xl bg-[#0f1420] border border-[#1a2234] flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-[#151c2c] transition-all cursor-pointer"
            >
              <Video className="w-4 h-4" />
            </button>

            <button
              id="chat-btn-call"
              title={callActive ? 'Disconnect Neural Link' : 'Establish Neural Link'}
              onClick={() => {
                const nextCall = !callActive;
                setCallActive(nextCall);
                if (nextCall) setActiveMode('listening');
                else setActiveMode('idle');
              }}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                callActive
                  ? 'bg-rose-600 text-white shadow-[0_0_18px_rgba(225,29,72,0.45)]'
                  : 'bg-[#0df597] text-[#06080d] hover:bg-[#0be08a] shadow-[0_0_18px_rgba(13,245,151,0.35)] font-bold'
              }`}
            >
              <Phone className={`w-4 h-4 ${callActive ? 'rotate-[135deg]' : ''}`} />
            </button>

            <button
              id="chat-btn-mute"
              title={micActive ? 'Mute Microphone' : 'Activate Microphone'}
              onClick={() => {
                const nextMic = !micActive;
                setMicActive(nextMic);
                if (nextMic) setActiveMode('listening');
                else setActiveMode('idle');
              }}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                micActive
                  ? 'bg-[#0df597]/20 border-[#0df597]/40 text-[#0df597]'
                  : 'bg-[#0f1420] border-[#1a2234] text-slate-400 hover:text-slate-200 hover:bg-[#151c2c]'
              }`}
            >
              {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
          </div>

          {/* 4 Jarvis Mode Buttons with Distinct Premium Highlights */}
          <div
            id="jarvis-mode-buttons"
            className="flex items-center gap-1.5 p-1 rounded-xl bg-[#080b12] border border-[#151a26] shadow-lg"
          >
            {modeButtons.map((m) => {
              const isCurrent = activeMode === m.id;
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  id={`mode-btn-${m.id}`}
                  onClick={() => setActiveMode(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-tech transition-all relative cursor-pointer ${
                    isCurrent
                      ? 'bg-[#0df597]/15 text-[#0df597] border border-[#0df597]/40 shadow-[0_0_14px_rgba(13,245,151,0.2)] font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#0e1320] border border-transparent'
                  }`}
                >
                  {isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0df597] animate-pulse" />
                  )}
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CRITICAL FIX 2: RIGHT SIDEBAR (FULL CHAT PANEL WITH INPUT AT BOTTOM) */}
      {/* ============================================================ */}
      <aside
        id="chat-right-sidebar"
        className="w-64 md:w-72 lg:w-80 xl:w-[330px] border-l border-[#151924] flex flex-col shrink-0 h-full overflow-hidden bg-[#07090f]/95 z-10"
      >
        {/* Transcript Header with Live Feed indicator */}
        <div className="p-3 border-b border-[#151924] flex items-center justify-between bg-[#080b12] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0df597] animate-pulse" />
            <span className="text-xs font-mono-tech tracking-wider uppercase font-semibold text-slate-200">
              TRANSCRIPT
            </span>
          </div>
          <span className="text-[9px] font-mono-tech px-2 py-0.5 rounded bg-[#091512] border border-[#133024] text-[#0df597] font-semibold truncate max-w-[130px]" title={activeProviderName}>
            {activeProviderName}
          </span>
        </div>

        {/* Seamless Failover Alert Notification */}
        {failoverAlert && (
          <div className="m-2 p-2 rounded-xl bg-amber-950/60 border border-amber-600/50 text-amber-200 text-[10px] font-mono-tech flex items-center gap-2 animate-fadeIn shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div className="truncate">
              <span className="font-bold text-amber-300">AUTO-FAILOVER:</span> Switched to {failoverAlert.toProviderName} ({failoverAlert.reason})
            </div>
          </div>
        )}

        {/* Scrollable Message History Area */}
        <div
          id="chat-history-container"
          className="flex-1 p-3.5 space-y-3 overflow-y-auto text-xs font-sans min-h-0"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[9px] font-mono-tech text-slate-500 mb-1 px-1 flex-wrap">
                {msg.sender === 'jarvis' && (
                  <Bot className="w-3 h-3 text-[#0df597]" />
                )}
                <span className={msg.sender === 'user' ? 'text-slate-400' : 'text-[#0df597]'}>
                  {msg.sender === 'user' ? 'OPERATOR' : 'JARVIS AI'}
                </span>
                <span>•</span>
                <span>{msg.time}</span>
                {msg.providerBadge && (
                  <span className="px-1.5 py-0.2 rounded bg-[#0e1625] text-cyan-300 border border-[#1a2942] text-[8px]">
                    {msg.providerBadge}
                  </span>
                )}
                {msg.latencyMs !== undefined && (
                  <span className="text-slate-500 text-[8px]">
                    {msg.latencyMs}ms
                  </span>
                )}
                {msg.tokens && (
                  <span className="text-slate-500 text-[8px]">
                    {msg.tokens.input + msg.tokens.output} tok
                  </span>
                )}
              </div>
              <div
                className={`max-w-[90%] p-3 rounded-xl leading-relaxed text-xs relative ${
                  msg.sender === 'user'
                    ? 'bg-[#101624] border border-[#1e2a42] text-slate-100 rounded-br-sm shadow-md'
                    : 'bg-[#0a0d16] border border-[#151d2d] text-slate-200 rounded-bl-sm shadow-sm'
                }`}
              >
                {msg.text || (msg.isStreaming ? 'Thinking...' : '')}
                {msg.isStreaming && (
                  <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#0df597] animate-pulse align-middle" />
                )}
              </div>
            </div>
          ))}
          <div ref={historyBottomRef} />
        </div>

        {/* Chat Input Field at the BOTTOM of this Right Sidebar */}
        <div
          id="chat-sidebar-input-area"
          className="p-3 border-t border-[#151924] bg-[#080b12] shrink-0"
        >
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <input
                id="chat-message-input"
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Enter command or message..."
                className="w-full bg-[#0c1018] border border-[#1a2234] rounded-xl pl-3.5 pr-2 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#0df597]/60 focus:ring-1 focus:ring-[#0df597]/40 transition-all font-sans shadow-inner"
              />
            </div>

            {/* Mic Quick Toggle */}
            <button
              type="button"
              id="chat-mic-input-btn"
              title="Voice Input Toggle"
              onClick={() => {
                const next = !micActive;
                setMicActive(next);
                setActiveMode(next ? 'listening' : 'idle');
              }}
              className={`p-2 rounded-xl border transition-all shrink-0 cursor-pointer ${
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
              className="p-2 rounded-xl bg-[#0df597] text-[#06080d] hover:bg-[#0be08a] transition-all font-semibold shadow-[0_0_12px_rgba(13,245,151,0.25)] shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-1.5 flex items-center justify-between text-[9px] font-mono-tech text-slate-500 px-1">
            <span>{statusHint}</span>
            <span className="text-slate-600 font-bold">v1.1.1</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
