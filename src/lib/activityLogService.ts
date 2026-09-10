import { ActivityLogItem } from '../types';

const STORAGE_KEY = 'jarvis_activity_logs_v1';

const defaultLogs: ActivityLogItem[] = [
  {
    id: 'log-1',
    timestamp: '12:00:01.104',
    event: 'Jarvis Desktop Core initialized with Brain API multi-provider engine (v1.1.0)',
    category: 'SYSTEM',
    status: 'NOMINAL',
    latency: '1.2ms'
  },
  {
    id: 'log-2',
    timestamp: '12:00:01.320',
    event: 'Preload contextBridge exposed secure safeStorage and electronAPI endpoints',
    category: 'SECURITY',
    status: 'SUCCESS',
    latency: '0.4ms'
  },
  {
    id: 'log-3',
    timestamp: '12:00:01.512',
    event: 'Central Agent Registry mounted 3 baseline dormant agents',
    category: 'AGENT',
    status: 'NOMINAL',
    latency: '0.8ms'
  },
  {
    id: 'log-4',
    timestamp: '12:00:02.040',
    event: 'Auto-updater configured for GitHub releases (ahsantalks0-cmyk/jarvis v1.1.0)',
    category: 'UPDATER',
    status: 'SUCCESS',
    latency: '24ms'
  },
  {
    id: 'log-5',
    timestamp: '12:00:02.890',
    event: 'Brain API Provider Router initialized with Auto-Failover & Priority Routing',
    category: 'BRAIN_API',
    status: 'SUCCESS',
    latency: '2.1ms'
  }
];

class ActivityLogService {
  private logs: ActivityLogItem[] = [];
  private listeners: Array<(logs: ActivityLogItem[]) => void> = [];

  constructor() {
    this.loadLogs();
  }

  private loadLogs() {
    if (typeof window === 'undefined') {
      this.logs = [...defaultLogs];
      return;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.logs = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load activity logs:', e);
    }
    this.logs = [...defaultLogs];
  }

  private saveLogs() {
    if (typeof window === 'undefined') return;
    try {
      // Keep most recent 200 logs
      const trimmed = this.logs.slice(0, 200);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Failed to persist activity logs:', e);
    }
  }

  getLogs(): ActivityLogItem[] {
    return [...this.logs];
  }

  addLog(
    event: string,
    category: ActivityLogItem['category'],
    status: ActivityLogItem['status'] = 'SUCCESS',
    latency: string = '1.0ms'
  ) {
    const item: ActivityLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString([], { hour12: false }) + '.' + String(Date.now() % 1000).padStart(3, '0'),
      event,
      category,
      status,
      latency
    };
    this.logs = [item, ...this.logs];
    this.saveLogs();
    this.notify();
    return item;
  }

  clearLogs() {
    this.logs = [];
    this.saveLogs();
    this.notify();
  }

  subscribe(listener: (logs: ActivityLogItem[]) => void): () => void {
    this.listeners.push(listener);
    listener([...this.logs]);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const snapshot = [...this.logs];
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (e) {
        console.error('Error notifying activity log listener:', e);
      }
    });
  }
}

export const activityLogService = new ActivityLogService();
