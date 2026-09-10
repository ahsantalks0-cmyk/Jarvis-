import {
  MessageSquareCode,
  Bot,
  Layers,
  BrainCircuit,
  Mic,
  Database,
  Activity,
  FileBarChart2,
  Zap,
  Settings,
  HardDrive
} from 'lucide-react';
import { TabType } from '../types';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  registeredAgentsCount: number;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: typeof MessageSquareCode;
  badge?: string;
}

export default function Sidebar({
  activeTab,
  onSelectTab,
  registeredAgentsCount
}: SidebarProps) {
  const navItems: NavItem[] = [
    { id: 'chat', label: 'Chat', icon: MessageSquareCode },
    {
      id: 'agents',
      label: 'Agents',
      icon: Bot,
      badge: `${registeredAgentsCount}`
    },
    { id: 'third-party', label: 'Third-Party Apps', icon: Layers },
    { id: 'brain-api', label: 'Brain API', icon: BrainCircuit, badge: 'Ph 2' },
    { id: 'voice-api', label: 'Voice API', icon: Mic, badge: 'Ph 4' },
    { id: 'memory', label: 'Memory', icon: Database },
    { id: 'activity-log', label: 'Activity Log', icon: Activity },
    { id: 'reports', label: 'Reports', icon: FileBarChart2 },
    { id: 'automations', label: 'Automations', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside
      id="left-sidebar"
      className="w-64 bg-[#08090e] border-r border-[#151924] flex flex-col justify-between shrink-0 select-none z-40"
    >
      {/* Navigation list */}
      <div className="p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-mono-tech tracking-wider text-slate-500 uppercase">
          Core Navigation
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative ${
                  isActive
                    ? 'bg-[#101520] text-slate-100 border border-[#1e2738] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c0e16] border border-transparent'
                }`}
              >
                {/* Active indicator bar on left */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#0df597] rounded-r shadow-[0_0_8px_#0df597]" />
                )}

                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? 'text-[#0df597]'
                        : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span className="tracking-wide text-left">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono-tech ${
                      isActive
                        ? 'bg-[#0df597]/15 text-[#0df597] border border-[#0df597]/30'
                        : 'bg-[#121622] text-slate-400 border border-[#192030]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom status enclave */}
      <div className="p-3 border-t border-[#141823] bg-[#06070a]">
        <div className="p-2.5 rounded-lg bg-[#0b0e16] border border-[#161c2b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#0df597] animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono-tech text-slate-300 font-semibold leading-tight">
                SYSTEM STANDBY
              </span>
              <span className="text-[9px] font-mono-tech text-slate-500 leading-tight">
                SECURE SANDBOX
              </span>
            </div>
          </div>
          <HardDrive className="w-3.5 h-3.5 text-slate-500" />
        </div>
      </div>
    </aside>
  );
}
