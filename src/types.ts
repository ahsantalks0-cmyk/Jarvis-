export type TabType =
  | 'chat'
  | 'agents'
  | 'third-party'
  | 'brain-api'
  | 'voice-api'
  | 'memory'
  | 'activity-log'
  | 'reports'
  | 'automations'
  | 'settings';

export interface AgentItem {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  enabled: boolean;
  category: string;
  status: string;
  phase: string;
}

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'downloading'
  | 'up-to-date'
  | 'error';

export interface UpdateState {
  status: UpdateStatus;
  version?: string;
  message: string;
  percent?: number;
  lastChecked?: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  event: string;
  category: 'SYSTEM' | 'SECURITY' | 'UPDATER' | 'AGENT';
  status: 'SUCCESS' | 'STANDBY' | 'NOMINAL';
  latency: string;
}

export interface SystemMetrics {
  cpuLoad: number;
  ramUsage: number;
  tempCelsius: number;
  pingMs: number;
  packetRate: string;
  osName: string;
}
