import { AgentItem, UpdateState } from '../types';

declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      platform: string;
      getVersion: () => Promise<string>;
      checkForUpdates: () => Promise<any>;
      downloadUpdate?: () => Promise<any>;
      installUpdate: () => Promise<void>;
      onUpdateStatus: (callback: (data: any) => void) => () => void;
      getAgents: () => Promise<AgentItem[]>;
      toggleAgent: (id: string) => Promise<AgentItem | null>;
      windowControl: (action: 'minimize' | 'maximize' | 'close') => void;
      openExternal: (url: string) => Promise<void>;
      isSafeStorageAvailable?: () => Promise<boolean>;
      safeStorageEncrypt?: (plainText: string) => Promise<{ success: boolean; cipherText?: string; error?: string }>;
      safeStorageDecrypt?: (cipherText: string) => Promise<{ success: boolean; plainText?: string; error?: string }>;
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

const updateListeners = new Set<(state: UpdateState) => void>();

export const electronBridge = {
  isElectron(): boolean {
    return typeof window !== 'undefined' && Boolean(window.electronAPI?.isElectron);
  },

  dispatchUpdate(state: UpdateState) {
    updateListeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('Error in updateListener:', err);
      }
    });
  },

  async getVersion(): Promise<string> {
    if (window.electronAPI?.getVersion) {
      try {
        return await window.electronAPI.getVersion();
      } catch {
        return '1.1.1';
      }
    }
    return '1.1.1';
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
          version: res?.version || (await this.getVersion()),
          message: res?.message || `Jarvis is up to date (v${res?.version || '1.1.1'})`,
          percent: res?.percent,
          lastChecked: res?.lastChecked || new Date().toLocaleTimeString(),
          error: res?.error,
          releaseNotes: res?.releaseNotes
        };
      } catch (err: any) {
        const curVersion = await this.getVersion();
        return {
          status: 'error',
          version: curVersion,
          message: `Update check failed: ${err?.message || 'Could not contact updater process'}`,
          error: err?.message || String(err),
          lastChecked: new Date().toLocaleTimeString()
        };
      }
    }

    // Web / Preview Environment: Live check against GitHub Releases API
    try {
      const curVersion = await this.getVersion();
      const res = await fetch('https://api.github.com/repos/ahsantalks0-cmyk/Jarvis-/releases/latest', {
        headers: { Accept: 'application/vnd.github.v3+json' }
      });
      if (!res.ok) {
        throw new Error(`GitHub releases API: HTTP ${res.status} (${res.statusText})`);
      }
      const data = await res.json();
      const latestTag = (data.tag_name || '').replace(/^v/, '');

      const parseSemver = (v: string) => (v || '').replace(/[^0-9.]/g, '').split('.').map(Number);
      const v1 = parseSemver(latestTag);
      const v2 = parseSemver(curVersion);
      let isNewer = false;
      for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
        const n1 = v1[i] || 0;
        const n2 = v2[i] || 0;
        if (n1 > n2) {
          isNewer = true;
          break;
        }
        if (n1 < n2) {
          break;
        }
      }

      if (isNewer && latestTag) {
        return {
          status: 'available',
          version: latestTag,
          message: `Update v${latestTag} available — downloading...`,
          lastChecked: new Date().toLocaleTimeString(),
          releaseNotes: data.body
        };
      }

      return {
        status: 'up-to-date',
        version: curVersion,
        message: `Jarvis is up to date (v${curVersion})`,
        lastChecked: new Date().toLocaleTimeString()
      };
    } catch (err: any) {
      const curVersion = await this.getVersion();
      return {
        status: 'error',
        version: curVersion,
        message: `Update check failed: ${err?.message || 'Could not reach GitHub release API'}`,
        error: err?.message || String(err),
        lastChecked: new Date().toLocaleTimeString()
      };
    }
  },

  async downloadUpdate(): Promise<void> {
    if (window.electronAPI?.downloadUpdate) {
      await window.electronAPI.downloadUpdate();
    } else {
      console.log('[AutoUpdater] downloadUpdate invoked');
    }
  },

  async installUpdate(): Promise<void> {
    if (window.electronAPI?.installUpdate) {
      await window.electronAPI.installUpdate();
    } else {
      console.log('[AutoUpdater] Simulated install & restart');
    }
  },

  onUpdateStatus(callback: (state: UpdateState) => void): () => void {
    updateListeners.add(callback);

    let ipcUnsubscribe: (() => void) | null = null;
    if (window.electronAPI?.onUpdateStatus) {
      ipcUnsubscribe = window.electronAPI.onUpdateStatus((data: any) => {
        const percent = data.percent !== undefined ? Number(data.percent) : undefined;
        const remainingPercent =
          data.remainingPercent !== undefined
            ? Number(data.remainingPercent)
            : percent !== undefined
            ? Math.max(0, 100 - percent)
            : undefined;

        callback({
          status: data.status,
          version: data.version || '1.1.1',
          message: data.message || '',
          percent,
          remainingPercent,
          transferred: data.transferred,
          total: data.total,
          bytesPerSecond: data.bytesPerSecond,
          lastChecked: data.lastChecked || new Date().toLocaleTimeString(),
          error: data.error,
          releaseNotes: data.releaseNotes
        });
      });
    }

    return () => {
      updateListeners.delete(callback);
      if (ipcUnsubscribe) ipcUnsubscribe();
    };
  },

  windowControl(action: 'minimize' | 'maximize' | 'close') {
    if (window.electronAPI?.windowControl) {
      window.electronAPI.windowControl(action);
    } else {
      console.log(`[Window Control]: ${action}`);
    }
  }
};
