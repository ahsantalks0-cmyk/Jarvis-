import { AgentItem, UpdateState } from '../types';

declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      platform: string;
      getVersion: () => Promise<string>;
      checkForUpdates: () => Promise<any>;
      installUpdate: () => Promise<void>;
      onUpdateStatus: (callback: (data: any) => void) => () => void;
      getAgents: () => Promise<AgentItem[]>;
      toggleAgent: (id: string) => Promise<AgentItem | null>;
      windowControl: (action: 'minimize' | 'maximize' | 'close') => void;
      openExternal: (url: string) => Promise<void>;
    };
  }
}

// Initial agents mirroring agent-registry.js
const defaultAgents: AgentItem[] = [
  {
    id: 'system-architect',
    name: 'System Architect',
    description: 'Autonomous desktop operations, process analysis, and background system orchestration.',
    capabilities: ['Process Monitoring', 'File Vault Access', 'System Telemetry', 'Terminal Automation'],
    category: 'System Intelligence',
    enabled: false,
    status: 'Coming Soon',
    phase: 'Phase 3'
  },
  {
    id: 'web-navigator',
    name: 'Cyber Web Navigator',
    description: 'High-speed headless web research, automated document synthesis, and external API indexing.',
    capabilities: ['Deep Research', 'DOM Extraction', 'Session Persistence', 'Data Harvesting'],
    category: 'Web Automation',
    enabled: false,
    status: 'Coming Soon',
    phase: 'Phase 3'
  },
  {
    id: 'neural-synthesizer',
    name: 'Neural Code Synthesizer',
    description: 'Multi-lingual source code refactoring, AST parsing, and secure script execution sandboxing.',
    capabilities: ['Code Synthesis', 'Bug Diagnostic', 'Test Suite Runner', 'Git Patch Generation'],
    category: 'Development',
    enabled: false,
    status: 'Coming Soon',
    phase: 'Phase 3'
  }
];

let localAgents = [...defaultAgents];

export const electronBridge = {
  isElectron(): boolean {
    return typeof window !== 'undefined' && Boolean(window.electronAPI?.isElectron);
  },

  async getVersion(): Promise<string> {
    if (window.electronAPI?.getVersion) {
      try {
        return await window.electronAPI.getVersion();
      } catch {
        return '1.0.0';
      }
    }
    return '1.0.0';
  },

  async getAgents(): Promise<AgentItem[]> {
    if (window.electronAPI?.getAgents) {
      try {
        const remoteAgents = await window.electronAPI.getAgents();
        if (remoteAgents && remoteAgents.length > 0) return remoteAgents;
      } catch (err) {
        console.warn('Electron IPC getAgents fallback to local registry:', err);
      }
    }
    return localAgents;
  },

  async toggleAgent(id: string): Promise<AgentItem | null> {
    if (window.electronAPI?.toggleAgent) {
      try {
        return await window.electronAPI.toggleAgent(id);
      } catch (err) {
        console.warn('Electron IPC toggleAgent fallback:', err);
      }
    }
    localAgents = localAgents.map(agent =>
      agent.id === id ? { ...agent, enabled: !agent.enabled } : agent
    );
    return localAgents.find(a => a.id === id) || null;
  },

  async checkForUpdates(): Promise<UpdateState> {
    if (window.electronAPI?.checkForUpdates) {
      try {
        const res = await window.electronAPI.checkForUpdates();
        return {
          status: res?.status || 'up-to-date',
          version: res?.version || '1.0.4',
          message: res?.message || 'Jarvis v1.0.4 is currently the latest release.',
          percent: res?.percent,
          lastChecked: new Date().toLocaleTimeString()
        };
      } catch (err: any) {
        return {
          status: 'error',
          message: err?.message || 'Could not verify release manifest.',
          lastChecked: new Date().toLocaleTimeString()
        };
      }
    }

    // Web simulation
    return {
      status: 'up-to-date',
      version: '1.0.4',
      message: 'Jarvis is up to date (v1.0.4).',
      lastChecked: new Date().toLocaleTimeString()
    };
  },

  async installUpdate(): Promise<void> {
    if (window.electronAPI?.installUpdate) {
      await window.electronAPI.installUpdate();
    } else {
      console.log('[AutoUpdater] Simulated install & restart');
    }
  },

  onUpdateStatus(callback: (state: UpdateState) => void): () => void {
    if (window.electronAPI?.onUpdateStatus) {
      return window.electronAPI.onUpdateStatus((data: any) => {
        callback({
          status: data.status,
          version: data.version || '1.0.4',
          message: data.message || '',
          percent: data.percent,
          lastChecked: new Date().toLocaleTimeString()
        });
      });
    }
    return () => {};
  },

  windowControl(action: 'minimize' | 'maximize' | 'close') {
    if (window.electronAPI?.windowControl) {
      window.electronAPI.windowControl(action);
    } else {
      console.log(`[Window Control]: ${action}`);
    }
  }
};
