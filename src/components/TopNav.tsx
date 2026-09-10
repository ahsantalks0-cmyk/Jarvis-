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
  ShieldAlert
} from 'lucide-react';
import { TabType } from '../types';

interface TopNavProps {
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

export default function TopNav({
  activeTab,
  onSelectTab,
  registeredAgentsCount
}: TopNavProps) {
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
    <nav
      id="top-navigation-bar"
      className="h-11 bg-[#07090f] border-b border-[#151924] flex items-center justify-center px-4 md:px-8 shrink-0 z-40 select-none overflow-x-auto no-scrollbar w-full"
    >
      {/* Horizontally Centered Nav Tabs with Equal Spacing */}
      <div className="flex items-center justify-center gap-1.5 md:gap-2.5 py-1 mx-auto min-w-max">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`top-tab-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all group relative shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#0f1522] text-[#0df597] border border-[#1d293d] shadow-[0_0_12px_rgba(13,245,151,0.14)] font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0b0e17] border border-transparent'
              }`}
            >
              {/* Glowing active underline indicator */}
              {isActive && (
                <span className="absolute -bottom-[6px] left-2 right-2 h-[2px] bg-[#0df597] shadow-[0_0_8px_#0df597] rounded-full" />
              )}

              <Icon
                className={`w-3.5 h-3.5 transition-colors ${
                  isActive ? 'text-[#0df597]' : 'text-slate-500 group-hover:text-slate-300'
                }`}
              />
              <span className="tracking-wide text-xs">{item.label}</span>

              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono-tech leading-none ${
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
      </div>
    </nav>
  );
}
