import { useState } from 'react';
import {
  Bot,
  Cpu,
  Globe,
  Code2,
  CheckCircle2,
  Info,
  Clock,
  Search
} from 'lucide-react';
import { AgentItem } from '../../types';

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
    <div className="h-full flex flex-col overflow-y-auto bg-[#06070a]">
      {/* Centered Premium Container with Generous Equal Margins on Both Sides */}
      <div className="w-full max-w-7xl mx-auto px-6 md:px-10 py-6 space-y-6 flex-1 flex flex-col">
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
              Central orchestration registry. Modules are pre-registered with capability definitions and runtime toggle states.
            </p>
          </div>

          {/* Architectural note badge */}
          <div className="px-3.5 py-2 rounded-xl bg-[#0a0d16] border border-[#161f30] flex items-center gap-2 text-xs font-mono-tech text-slate-300 self-start md:self-auto">
            <Info className="w-4 h-4 text-[#0df597] shrink-0" />
            <span>Foundation Ready: Plug-and-play agent fleet</span>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono-tech whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#101522] text-[#0df597] border border-[#1e2a40] shadow-[0_0_10px_rgba(13,245,151,0.15)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0b0e16] border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter capabilities or agents..."
              className="w-full bg-[#0a0d15] border border-[#182030] rounded-xl pl-8.5 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#0df597]/50 font-sans shadow-inner"
            />
          </div>
        </div>

        {/* CRITICAL FIX 4: Responsive Premium 3-Column Grid Layout */}
        <div className="flex-1">
          {filteredAgents.length === 0 ? (
            <div className="p-10 rounded-2xl bg-[#090c14] border border-[#151a28] text-center space-y-2">
              <Bot className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-sm text-slate-300 font-semibold font-tech">
                No Agents Match Filter
              </div>
              <p className="text-xs text-slate-500 font-sans">
                Clear your filter search query or reset category to inspect registered fleet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredAgents.map((agent) => (
                <div
                  key={agent.id}
                  className={`p-5 rounded-2xl transition-all border flex flex-col justify-between ${
                    agent.enabled
                      ? 'bg-[#0b101a] border-[#1e2e4a] shadow-[0_0_20px_rgba(13,245,151,0.08)]'
                      : 'bg-[#080b12] border-[#141926] hover:border-[#1e273b]'
                  }`}
                >
                  {/* Top Area: Icon & Meta */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#0e1422] border border-[#1b263b] flex items-center justify-center shrink-0 shadow-sm">
                        {getAgentIcon(agent.id)}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono-tech bg-[#0e1624] border border-[#1b283d] text-slate-400">
                          {agent.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono-tech bg-[#19150b] border border-[#3b2b11] text-amber-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {agent.status}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-tech font-bold text-slate-100 tracking-wide">
                        {agent.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-sans leading-relaxed mt-1 line-clamp-3 min-h-[48px]">
                        {agent.description}
                      </p>
                    </div>

                    {/* Capabilities Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {agent.capabilities.map((cap) => (
                        <span
                          key={cap}
                          className="px-2 py-0.5 rounded-md bg-[#07090f] border border-[#131826] text-[10px] font-mono-tech text-slate-300"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Divider & Toggle Controls */}
                  <div className="pt-4 border-t border-[#131826] flex items-center justify-between mt-4">
                    <div>
                      <div className="text-[9px] font-mono-tech uppercase text-slate-500">
                        MODULE STATE
                      </div>
                      <div
                        className={`text-xs font-mono-tech font-semibold flex items-center gap-1.5 ${
                          agent.enabled ? 'text-[#0df597]' : 'text-slate-500'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            agent.enabled ? 'bg-[#0df597] animate-pulse' : 'bg-slate-600'
                          }`}
                        />
                        <span>{agent.enabled ? 'ENABLED' : 'STANDBY'}</span>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      id={`toggle-agent-${agent.id}`}
                      type="button"
                      onClick={() => onToggleAgent(agent.id)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer focus:outline-none ${
                        agent.enabled
                          ? 'bg-[#0df597] shadow-[0_0_14px_rgba(13,245,151,0.4)]'
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
              ))}
            </div>
          )}
        </div>

        {/* Footer Schema Info */}
        <div className="p-4 rounded-2xl bg-[#090c14] border border-[#141824] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono-tech text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0df597] shrink-0" />
            <span>Agent Registry Schema: &#123; id, name, description, capabilities, enabled, category &#125;</span>
          </div>
          <span className="text-[10px] text-slate-500">
            Loaded from agent-registry.js IPC Bridge
          </span>
        </div>
      </div>
    </div>
  );
}
