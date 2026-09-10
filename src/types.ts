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

export type JarvisMode = 'idle' | 'listening' | 'thinking' | 'speaking';

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
  | 'downloaded'
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
  category: 'SYSTEM' | 'SECURITY' | 'UPDATER' | 'AGENT' | 'BRAIN_API' | 'FAILOVER';
  status: 'SUCCESS' | 'STANDBY' | 'NOMINAL' | 'WARNING' | 'FAILED';
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

// ==========================================
// Brain API Multi-Provider Intelligence Layer
// ==========================================

export type ProviderType = 'gemini' | 'openai' | 'anthropic' | 'groq' | 'custom';

export type ProviderStatus = 'active' | 'standby' | 'failed' | 'rate-limited' | 'disabled';

export interface AIModel {
  id: string;
  name: string;
  contextWindow?: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
}

export interface AIProvider {
  id: string;
  name: string;
  type: ProviderType;
  apiKeyEncrypted: string;
  apiKeyMasked: string; // Shows only last 4 chars e.g. "••••••••••••3a8f"
  selectedModel: string;
  models: AIModel[];
  priority: number; // 1-10, lower = higher priority
  enabled: boolean;
  status: ProviderStatus;
  statusMessage?: string;
  endpointUrl?: string; // For custom OpenAI-compatible endpoints
  customHeaders?: Record<string, string>;
  rpmLimit: number;
  currentRpm: number;
  totalRequests: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  lastUsed?: string;
  lastLatencyMs?: number;
}

export interface BrainApiSettings {
  routingMode: 'auto-failover' | 'manual';
  forcedProviderId: string | null;
  defaultProviderId: string;
  timeoutSeconds: number;
  retryAttempts: number;
  dailyCostAlertThreshold: number;
  monthlyCostAlertThreshold: number;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface UsageHistoryRecord {
  id: string;
  timestamp: string;
  date: string; // YYYY-MM-DD
  providerId: string;
  providerName: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  success: boolean;
  latencyMs: number;
}

export interface FailoverEvent {
  timestamp: string;
  fromProviderId: string;
  fromProviderName: string;
  toProviderId: string;
  toProviderName: string;
  reason: string;
}
