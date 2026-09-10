import { useState, useEffect } from 'react';
import {
  Bot,
  Cpu,
  Globe,
  Code2,
  Sliders,
  CheckCircle2,
  Info,
  Clock
} from 'lucide-react';
import { AgentItem } from '../../types';
import { electronBridge } from '../../lib/electronBridge';

interface AgentsTabProps {
  agents: AgentItem[];
  onToggleAgent: (id: string) => void;
}

export default function AgentsTab({ agents, onToggleAgent }: AgentsTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'System Intelligence', 'Web Automation', 'Development'];

  const filteredAgents = agents.filter((agent) => {
    const matchesCat =
      selectedCategory === 'All' || agent.category === selectedCategory;
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.capabilities.some((c) =>
        c.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCat && matchesSearch;
  });

  const getAgentIcon = (id: string) => {
    switch (id) {
      case 'system-architect':
        return <Cpu className="w-5 h-5 text-[#0df597]" />;
      case 'web-navigator':
        return <Globe className="w-5 h-5 text-[#00e5ff]" />;
      case 'neural-synthesizer':
        return <Code2 className="w-5 h-5 text-purple-400" />;
      default:
        return <Bot className="w-5 h-5 text-[#0df597]" />;
    }
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto bg-[#06070a] space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#161b27]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0df597]" />
            <h1 className="text-base font-tech font-bold uppercase tracking-wider text-slate-100">
              Agent Registry & Fleet
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-tech bg-[#0e1624] text-[#0df597] border border-[#1b283d]">
              {agents.length} Registered
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Central orchestration registry. Modules are pre-registered with capability definitions and toggle states.
          </p>
        </div>

        {/* Architectural note badge */}
        <div className="px-3 py-2 rounded-xl bg-[#0a0d16] border border-[#161f30] flex items-center gap-2 text-xs font-mono-tech text-slate-300">
          <Info className="w-4 h-4 text-[#0df597] shrink-0" />
          <span>Foundation Ready: Plug-and-play agent registration</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#101522] text-[#0df597] border border-[#1e2a40] shadow-[0_0_10px_rgba(13,245,151,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0b0e16] border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter capabilities or agents..."
            className="w-full bg-[#0a0d15] border border-[#182030] rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#0df597]/50 font-sans"
          />
        </div>
      </div>

      {/* Agents List Container */}
      <div className="space-y-3">
        {filteredAgents.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#090c14] border border-[#151a28] text-center space-y-2">
            <Bot className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-sm text-slate-300 font-semibold font-tech">
              No Agents Match Filter
            </div>
            <p className="text-xs text-slate-500 font-sans">
              Clear your filter search or register a new agent specification.
            </p>
          </div>
        ) : (
          filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className={`p-4 rounded-xl transition-all border ${
                agent.enabled
                  ? 'bg-[#0b101a] border-[#1f2b42] shadow-[0_0_15px_rgba(13,245,151,0.08)]'
                  : 'bg-[#080b12] border-[#141926] hover:border-[#1c2438]'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left info */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0e1320] border border-[#1b253b] flex items-center justify-center shrink-0 mt-0.5">
                    {getAgentIcon(agent.id)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-tech font-bold text-slate-100 tracking-wide">
                        {agent.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-[#0d121e] border border-[#182337] text-slate-400">
                        {agent.category}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-[#19150b] border border-[#3b2b11] text-amber-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {agent.status} ({agent.phase})
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-2xl">
                      {agent.description}
                    </p>

                    {/* Capabilities Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                      {agent.capabilities.map((cap) => (
                        <span
                          key={cap}
                          className="px-2 py-0.5 rounded bg-[#07090f] border border-[#131826] text-[10px] font-mono-tech text-slate-300"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right controls: Toggle Button */}
                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] font-mono-tech uppercase text-slate-500">
                      Module Status
                    </div>
                    <div
                      className={`text-xs font-mono-tech font-semibold ${
                        agent.enabled ? 'text-[#0df597]' : 'text-slate-500'
                      }`}
                    >
                      {agent.enabled ? 'ENABLED' : 'STANDBY'}
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    id={`toggle-agent-${agent.id}`}
                    type="button"
                    onClick={() => onToggleAgent(agent.id)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer focus:outline-none ${
                      agent.enabled
                        ? 'bg-[#0df597] shadow-[0_0_12px_rgba(13,245,151,0.4)]'
                        : 'bg-[#182030]'
                    }`}
                  >
                    <div
                      className={`bg-[#06080d] w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                        agent.enabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Schema Info */}
      <div className="p-4 rounded-xl bg-[#090c14] border border-[#141824] flex items-center justify-between text-xs font-mono-tech text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#0df597]" />
          <span>Agent Registry Schema: &#123; id, name, description, capabilities, enabled, category &#125;</span>
        </div>
        <span className="text-[10px] text-slate-500 hidden sm:inline">
          Loaded from agent-registry.js IPC Bridge
        </span>
      </div>
    </div>
  );
}
