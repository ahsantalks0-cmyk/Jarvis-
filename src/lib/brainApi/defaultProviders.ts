import { AIProvider, BrainApiSettings } from '../../types';

export const defaultProviders: AIProvider[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    type: 'gemini',
    apiKeyEncrypted: '',
    apiKeyMasked: '',
    selectedModel: 'gemini-1.5-pro',
    models: [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Multimodal Core)', contextWindow: 2000000, inputCostPer1M: 1.25, outputCostPer1M: 5.0 },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Ultra Fast)', contextWindow: 1000000, inputCostPer1M: 0.075, outputCostPer1M: 0.3 },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Next-Gen)', contextWindow: 1000000, inputCostPer1M: 0.1, outputCostPer1M: 0.4 },
      { id: 'gemini-pro', name: 'Gemini Pro 1.0 (Standard)', contextWindow: 32768, inputCostPer1M: 0.5, outputCostPer1M: 1.5 },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', contextWindow: 16384, inputCostPer1M: 0.5, outputCostPer1M: 1.5 }
    ],
    priority: 1, // Highest priority
    enabled: true,
    status: 'active',
    statusMessage: 'Primary cognitive route (Awaiting operator API key)',
    rpmLimit: 60,
    currentRpm: 0,
    totalRequests: 0,
    inputTokens: 0,
    outputTokens: 0,
    estimatedCost: 0
  },
  {
    id: 'openai',
    name: 'OpenAI GPT',
    type: 'openai',
    apiKeyEncrypted: '',
    apiKeyMasked: '',
    selectedModel: 'gpt-4o',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o (Omni Reasoning)', contextWindow: 128000, inputCostPer1M: 2.5, outputCostPer1M: 10.0 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (High Speed)', contextWindow: 128000, inputCostPer1M: 0.15, outputCostPer1M: 0.6 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', contextWindow: 128000, inputCostPer1M: 10.0, outputCostPer1M: 30.0 },
      { id: 'gpt-4', name: 'GPT-4 (Original Precision)', contextWindow: 8192, inputCostPer1M: 30.0, outputCostPer1M: 60.0 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Legacy Economy)', contextWindow: 16385, inputCostPer1M: 0.5, outputCostPer1M: 1.5 }
    ],
    priority: 2,
    enabled: true,
    status: 'standby',
    statusMessage: 'Failover secondary standby tier',
    rpmLimit: 60,
    currentRpm: 0,
    totalRequests: 0,
    inputTokens: 0,
    outputTokens: 0,
    estimatedCost: 0
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    type: 'anthropic',
    apiKeyEncrypted: '',
    apiKeyMasked: '',
    selectedModel: 'claude-3-5-sonnet',
    models: [
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet (Frontier Intelligence)', contextWindow: 200000, inputCostPer1M: 3.0, outputCostPer1M: 15.0 },
      { id: 'claude-3-opus', name: 'Claude 3 Opus (Complex Synthesis)', contextWindow: 200000, inputCostPer1M: 15.0, outputCostPer1M: 75.0 },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet (Balanced)', contextWindow: 200000, inputCostPer1M: 3.0, outputCostPer1M: 15.0 },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku (Instant Response)', contextWindow: 200000, inputCostPer1M: 0.25, outputCostPer1M: 1.25 }
    ],
    priority: 3,
    enabled: true,
    status: 'standby',
    statusMessage: 'Deep reasoning & architectural reserve',
    rpmLimit: 50,
    currentRpm: 0,
    totalRequests: 0,
    inputTokens: 0,
    outputTokens: 0,
    estimatedCost: 0
  },
  {
    id: 'groq',
    name: 'Groq LPU Engine',
    type: 'groq',
    apiKeyEncrypted: '',
    apiKeyMasked: '',
    selectedModel: 'llama-3.3-70b-versatile',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', contextWindow: 128000, inputCostPer1M: 0.59, outputCostPer1M: 0.79 },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', contextWindow: 128000, inputCostPer1M: 0.05, outputCostPer1M: 0.08 },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (32k Context)', contextWindow: 32768, inputCostPer1M: 0.24, outputCostPer1M: 0.24 },
      { id: 'llama2-70b-4096', name: 'Llama 2 70B (4k Context)', contextWindow: 4096, inputCostPer1M: 0.7, outputCostPer1M: 0.8 }
    ],
    priority: 4,
    enabled: true,
    status: 'standby',
    statusMessage: 'Sub-second real-time inference cluster',
    rpmLimit: 30,
    currentRpm: 0,
    totalRequests: 0,
    inputTokens: 0,
    outputTokens: 0,
    estimatedCost: 0
  }
];

export const defaultSettings: BrainApiSettings = {
  routingMode: 'auto-failover',
  forcedProviderId: null,
  defaultProviderId: 'gemini',
  timeoutSeconds: 25,
  retryAttempts: 2,
  dailyCostAlertThreshold: 5.0, // Alert when cost >= $5/day
  monthlyCostAlertThreshold: 50.0, // Alert when cost >= $50/month
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: 'You are Jarvis, a highly intelligent, sophisticated personal AI assistant. You speak with high competence, calm authority, and refined efficiency.'
};
