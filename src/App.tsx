import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TabType, AgentItem, UpdateState } from './types';
import Header from './components/Header';
import TopNav from './components/TopNav';
import TopUpdateAlertBar from './components/TopUpdateAlertBar';
import UpdateNotificationBanner from './components/UpdateNotificationBanner';
import ChatTab from './components/tabs/ChatTab';
import AgentsTab from './components/tabs/AgentsTab';
import ThirdPartyAppsTab from './components/tabs/ThirdPartyAppsTab';
import BrainApiTab from './components/tabs/BrainApiTab';
import VoiceApiTab from './components/tabs/VoiceApiTab';
import MemoryTab from './components/tabs/MemoryTab';
import ActivityLogTab from './components/tabs/ActivityLogTab';
import ReportsTab from './components/tabs/ReportsTab';
import AutomationsTab from './components/tabs/AutomationsTab';
import SettingsTab from './components/tabs/SettingsTab';
import { electronBridge } from './lib/electronBridge';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [toastUpdate, setToastUpdate] = useState<UpdateState | null>(null);
  const [isToastDismissed, setIsToastDismissed] = useState<boolean>(false);
  const [isTopBannerDismissed, setIsTopBannerDismissed] = useState<boolean>(false);

  useEffect(() => {
    // Load agent registry items from Electron IPC / local foundation registry
    const loadAgents = async () => {
      const list = await electronBridge.getAgents();
      setAgents(list);
    };
    loadAgents();

    // Listen to auto-updater status to trigger top banner & notifications
    const unsubscribeUpdater = electronBridge.onUpdateStatus((state) => {
      if (state.status === 'available' || state.status === 'downloaded') {
        setToastUpdate(state);
        setIsToastDismissed(false);
        setIsTopBannerDismissed(false);
      } else if (state.status === 'downloading') {
        setToastUpdate((prev) => (prev ? { ...prev, ...state } : state));
        setIsTopBannerDismissed(false);
      }
    });

    return () => {
      unsubscribeUpdater();
    };
  }, []);

  const handleToggleAgent = async (id: string) => {
    const updated = await electronBridge.toggleAgent(id);
    if (updated) {
      setAgents((prev) =>
        prev.map((agent) => (agent.id === id ? { ...agent, enabled: updated.enabled } : agent))
      );
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatTab />;
      case 'agents':
        return (
          <AgentsTab
            agents={agents}
            onToggleAgent={handleToggleAgent}
          />
        );
      case 'third-party':
        return <ThirdPartyAppsTab />;
      case 'brain-api':
        return <BrainApiTab />;
      case 'voice-api':
        return <VoiceApiTab />;
      case 'memory':
        return <MemoryTab />;
      case 'activity-log':
        return <ActivityLogTab />;
      case 'reports':
        return <ReportsTab />;
      case 'automations':
        return <AutomationsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <ChatTab />;
    }
  };

  return (
    <div
      id="jarvis-desktop-window"
      className="w-screen h-screen flex flex-col bg-[#060709] text-slate-100 overflow-hidden select-none font-sans"
    >
      {/* Desktop Window Title Bar & Header */}
      <Header />

      {/* Top Banner Alert Bar: Shows automatically at the top when update is available, downloading, or ready to install */}
      {!isTopBannerDismissed && toastUpdate && (
        <TopUpdateAlertBar
          updateState={toastUpdate}
          onDismiss={() => setIsTopBannerDismissed(true)}
          onOpenSettings={() => {
            setActiveTab('settings');
          }}
        />
      )}

      {/* Auto-Update Toast / Banner Notification */}
      {!isToastDismissed && toastUpdate && (
        <UpdateNotificationBanner
          updateState={toastUpdate}
          onDismiss={() => setIsToastDismissed(true)}
          onOpenSettings={() => {
            setActiveTab('settings');
            setIsToastDismissed(true);
          }}
        />
      )}

      {/* Horizontal Top Navigation Bar */}
      <TopNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        registeredAgentsCount={agents.length}
      />

      {/* Main Workspace Tab Viewport */}
      <main
        id="main-tab-viewport"
        className="flex-1 overflow-hidden relative bg-[#06070a]"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="w-full h-full"
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
