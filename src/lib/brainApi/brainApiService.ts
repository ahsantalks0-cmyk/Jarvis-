import {
  AIProvider,
  BrainApiSettings,
  FailoverEvent,
  ProviderType
} from '../../types';
import { defaultProviders, defaultSettings } from './defaultProviders';
import { encryptApiKey, decryptApiKey, maskApiKey } from './crypto';
import { usageStore } from './usageStore';
import { activityLogService } from '../activityLogService';

const PROVIDERS_STORAGE_KEY = 'jarvis_brain_providers_v1';
const SETTINGS_STORAGE_KEY = 'jarvis_brain_settings_v1';

export class BrainApiService {
  private providers: AIProvider[] = [];
  private settings: BrainApiSettings = { ...defaultSettings };
  private listeners: Array<() => void> = [];
  // Rolling 60-second window request timestamps for RPM tracking
  private requestWindows: Record<string, number[]> = {};

  constructor() {
    this.loadState();
    // Periodically prune request windows every 5 seconds to keep RPM accurate
    if (typeof window !== 'undefined') {
      setInterval(() => this.pruneRpmWindows(), 5000);
    }
  }

  private loadState() {
    if (typeof window === 'undefined') {
      this.providers = [...defaultProviders];
      this.settings = { ...defaultSettings };
      return;
    }

    try {
      const storedProviders = localStorage.getItem(PROVIDERS_STORAGE_KEY);
      if (storedProviders) {
        const parsed = JSON.parse(storedProviders);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with default providers to ensure any new models or default fields exist
          this.providers = defaultProviders.map((def) => {
            const found = parsed.find((p: AIProvider) => p.id === def.id);
            if (found) {
              return {
                ...def,
                ...found,
                // Ensure model list has default models
                models: def.models,
                // Do not keep stale failed status on startup
                status: found.enabled ? 'standby' : 'disabled'
              };
            }
            return def;
          });

          // Also keep any custom providers the user added
          const customOnes = parsed.filter(
            (p: AIProvider) => !defaultProviders.some((d) => d.id === p.id)
          );
          this.providers.push(...customOnes);
        } else {
          this.providers = [...defaultProviders];
        }
      } else {
        this.providers = [...defaultProviders];
      }

      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        this.settings = { ...defaultSettings, ...JSON.parse(storedSettings) };
      } else {
        this.settings = { ...defaultSettings };
      }
    } catch (e) {
      console.warn('Failed to load brain api state, using defaults:', e);
      this.providers = [...defaultProviders];
      this.settings = { ...defaultSettings };
    }

    this.recalcPrimaryStatus();
  }

  private saveState() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(PROVIDERS_STORAGE_KEY, JSON.stringify(this.providers));
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save brain api state:', e);
    }
  }

  private recalcPrimaryStatus() {
    const sorted = this.getPrioritizedProviders();
    this.providers = this.providers.map((p) => {
      if (!p.enabled) return { ...p, status: 'disabled' };
      if (p.status === 'rate-limited') return p;
      if (sorted.length > 0 && sorted[0].id === p.id) {
        return { ...p, status: 'active', statusMessage: 'Primary cognitive route' };
      }
      return { ...p, status: 'standby', statusMessage: 'Failover standby tier' };
    });
  }

  private pruneRpmWindows() {
    const now = Date.now();
    let changed = false;

    this.providers.forEach((p) => {
      const window = this.requestWindows[p.id] || [];
      const valid = window.filter((t) => now - t < 60000);
      this.requestWindows[p.id] = valid;

      if (p.currentRpm !== valid.length) {
        p.currentRpm = valid.length;
        changed = true;
      }

      // Recover from rate-limited if below threshold
      if (p.status === 'rate-limited' && valid.length < p.rpmLimit) {
        p.status = 'standby';
        changed = true;
      }
    });

    if (changed) {
      this.notify();
    }
  }

  private recordRequestForRpm(providerId: string) {
    const now = Date.now();
    if (!this.requestWindows[providerId]) {
      this.requestWindows[providerId] = [];
    }
    this.requestWindows[providerId].push(now);
    const valid = this.requestWindows[providerId].filter((t) => now - t < 60000);
    this.requestWindows[providerId] = valid;

    const provider = this.providers.find((p) => p.id === providerId);
    if (provider) {
      provider.currentRpm = valid.length;
      if (provider.currentRpm >= provider.rpmLimit) {
        provider.status = 'rate-limited';
        provider.statusMessage = `Rate limit reached (${provider.currentRpm}/${provider.rpmLimit} RPM)`;
      }
    }
  }

  // Getters
  getProviders(): AIProvider[] {
    return [...this.providers];
  }

  getSettings(): BrainApiSettings {
    return { ...this.settings };
  }

  getPrioritizedProviders(): AIProvider[] {
    return [...this.providers]
      .filter((p) => p.enabled)
      .sort((a, b) => a.priority - b.priority);
  }

  getActiveProvider(): AIProvider | null {
    if (this.settings.routingMode === 'manual' && this.settings.forcedProviderId) {
      const forced = this.providers.find((p) => p.id === this.settings.forcedProviderId);
      if (forced && forced.enabled) return forced;
    }
    const prioritized = this.getPrioritizedProviders();
    return prioritized.length > 0 ? prioritized[0] : null;
  }

  // Updates & Mutations
  async updateProviderKey(id: string, plainKey: string) {
    const provider = this.providers.find((p) => p.id === id);
    if (!provider) return;

    if (!plainKey || !plainKey.trim()) {
      provider.apiKeyEncrypted = '';
      provider.apiKeyMasked = '';
    } else {
      provider.apiKeyEncrypted = await encryptApiKey(plainKey.trim());
      provider.apiKeyMasked = maskApiKey(plainKey.trim());
    }

    this.saveState();
    this.notify();

    activityLogService.addLog(
      `Updated & encrypted API Key vault for ${provider.name}`,
      'SECURITY',
      'SUCCESS'
    );
  }

  updateProviderConfig(id: string, updates: Partial<AIProvider>) {
    this.providers = this.providers.map((p) => {
      if (p.id !== id) return p;
      return { ...p, ...updates };
    });
    this.recalcPrimaryStatus();
    this.saveState();
    this.notify();
  }

  toggleProvider(id: string, enabled: boolean) {
    this.providers = this.providers.map((p) => {
      if (p.id !== id) return p;
      return {
        ...p,
        enabled,
        status: enabled ? 'standby' : 'disabled'
      };
    });
    this.recalcPrimaryStatus();
    this.saveState();
    this.notify();

    const p = this.providers.find((item) => item.id === id);
    activityLogService.addLog(
      `${p?.name || id} ${enabled ? 'enabled' : 'disabled'} in Brain API Router`,
      'BRAIN_API',
      'NOMINAL'
    );
  }

  addCustomProvider(provider: {
    name: string;
    endpointUrl: string;
    modelId: string;
    modelName: string;
    priority: number;
    rpmLimit: number;
    apiKey: string;
  }) {
    const id = `custom-${Date.now()}`;
    const newProvider: AIProvider = {
      id,
      name: provider.name,
      type: 'custom',
      apiKeyEncrypted: '',
      apiKeyMasked: provider.apiKey ? maskApiKey(provider.apiKey) : '',
      selectedModel: provider.modelId,
      models: [
        {
          id: provider.modelId,
          name: provider.modelName || provider.modelId,
          contextWindow: 65536,
          inputCostPer1M: 0.5,
          outputCostPer1M: 1.5
        }
      ],
      priority: provider.priority || 5,
      enabled: true,
      status: 'standby',
      statusMessage: 'Custom OpenAI-compatible inference bridge',
      endpointUrl: provider.endpointUrl,
      rpmLimit: provider.rpmLimit || 60,
      currentRpm: 0,
      totalRequests: 0,
      inputTokens: 0,
      outputTokens: 0,
      estimatedCost: 0
    };

    if (provider.apiKey) {
      encryptApiKey(provider.apiKey).then((encrypted) => {
        newProvider.apiKeyEncrypted = encrypted;
        this.saveState();
      });
    }

    this.providers.push(newProvider);
    this.recalcPrimaryStatus();
    this.saveState();
    this.notify();

    activityLogService.addLog(
      `Registered Custom Provider [${provider.name}] at ${provider.endpointUrl}`,
      'BRAIN_API',
      'SUCCESS'
    );

    return newProvider;
  }

  deleteProvider(id: string) {
    this.providers = this.providers.filter((p) => p.id !== id);
    this.recalcPrimaryStatus();
    this.saveState();
    this.notify();
  }

  updateSettings(updates: Partial<BrainApiSettings>) {
    this.settings = { ...this.settings, ...updates };
    this.recalcPrimaryStatus();
    this.saveState();
    this.notify();
    activityLogService.addLog(
      `Brain API Global Settings updated (Routing: ${this.settings.routingMode})`,
      'BRAIN_API',
      'NOMINAL'
    );
  }

  // Live Test Connection for Provider
  async testProviderConnection(
    providerId: string,
    overrideApiKey?: string
  ): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const provider = this.providers.find((p) => p.id === providerId);
    if (!provider) {
      return { success: false, latencyMs: 0, error: 'Provider not found' };
    }

    let apiKey = overrideApiKey;
    if (!apiKey && provider.apiKeyEncrypted) {
      apiKey = await decryptApiKey(provider.apiKeyEncrypted);
    }

    if (!apiKey || !apiKey.trim()) {
      return {
        success: false,
        latencyMs: 0,
        error: 'No API Key configured. Please enter your API key to test connection.'
      };
    }

    const start = performance.now();

    try {
      switch (provider.type) {
        case 'gemini': {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${provider.selectedModel}:generateContent?key=${apiKey}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'ping' }] }],
              generationConfig: { maxOutputTokens: 2 }
            })
          });
          const latencyMs = Math.round(performance.now() - start);
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData.error?.message || `HTTP ${res.status}: ${res.statusText}`;
            return { success: false, latencyMs, error: errMsg };
          }
          provider.lastLatencyMs = latencyMs;
          this.notify();
          activityLogService.addLog(
            `Connection test SUCCESS for ${provider.name} (${latencyMs}ms)`,
            'BRAIN_API',
            'SUCCESS',
            `${latencyMs}ms`
          );
          return { success: true, latencyMs };
        }

        case 'openai': {
          const url = 'https://api.openai.com/v1/chat/completions';
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: provider.selectedModel,
              messages: [{ role: 'user', content: 'ping' }],
              max_tokens: 2
            })
          });
          const latencyMs = Math.round(performance.now() - start);
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData.error?.message || `HTTP ${res.status}: ${res.statusText}`;
            return { success: false, latencyMs, error: errMsg };
          }
          provider.lastLatencyMs = latencyMs;
          this.notify();
          activityLogService.addLog(
            `Connection test SUCCESS for ${provider.name} (${latencyMs}ms)`,
            'BRAIN_API',
            'SUCCESS',
            `${latencyMs}ms`
          );
          return { success: true, latencyMs };
        }

        case 'anthropic': {
          const url = 'https://api.anthropic.com/v1/messages';
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: provider.selectedModel,
              max_tokens: 2,
              messages: [{ role: 'user', content: 'ping' }]
            })
          });
          const latencyMs = Math.round(performance.now() - start);
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData.error?.message || `HTTP ${res.status}: ${res.statusText}`;
            return { success: false, latencyMs, error: errMsg };
          }
          provider.lastLatencyMs = latencyMs;
          this.notify();
          activityLogService.addLog(
            `Connection test SUCCESS for ${provider.name} (${latencyMs}ms)`,
            'BRAIN_API',
            'SUCCESS',
            `${latencyMs}ms`
          );
          return { success: true, latencyMs };
        }

        case 'groq': {
          const url = 'https://api.groq.com/openai/v1/chat/completions';
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: provider.selectedModel,
              messages: [{ role: 'user', content: 'ping' }],
              max_tokens: 2
            })
          });
          const latencyMs = Math.round(performance.now() - start);
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData.error?.message || `HTTP ${res.status}: ${res.statusText}`;
            return { success: false, latencyMs, error: errMsg };
          }
          provider.lastLatencyMs = latencyMs;
          this.notify();
          activityLogService.addLog(
            `Connection test SUCCESS for ${provider.name} (${latencyMs}ms)`,
            'BRAIN_API',
            'SUCCESS',
            `${latencyMs}ms`
          );
          return { success: true, latencyMs };
        }

        case 'custom': {
          const endpoint = provider.endpointUrl || 'http://localhost:11434/v1/chat/completions';
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
              ...(provider.customHeaders || {})
            },
            body: JSON.stringify({
              model: provider.selectedModel,
              messages: [{ role: 'user', content: 'ping' }],
              max_tokens: 2
            })
          });
          const latencyMs = Math.round(performance.now() - start);
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errMsg = errData.error?.message || `HTTP ${res.status}: ${res.statusText}`;
            return { success: false, latencyMs, error: errMsg };
          }
          provider.lastLatencyMs = latencyMs;
          this.notify();
          activityLogService.addLog(
            `Connection test SUCCESS for ${provider.name} (${latencyMs}ms)`,
            'BRAIN_API',
            'SUCCESS',
            `${latencyMs}ms`
          );
          return { success: true, latencyMs };
        }

        default:
          return { success: false, latencyMs: 0, error: 'Unsupported provider type' };
      }
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - start);
      return {
        success: false,
        latencyMs,
        error: err?.message || 'Network request failed or endpoint unreachable'
      };
    }
  }

  /**
   * Main Chat Inference Pipeline with Automatic Failover, Retries, and Streaming
   */
  async executeChatPrompt(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    callbacks: {
      onChunk?: (chunk: string) => void;
      onProviderSwitch?: (event: FailoverEvent) => void;
      onStatusChange?: (status: string) => void;
    } = {}
  ): Promise<{
    text: string;
    providerId: string;
    providerName: string;
    model: string;
    latencyMs: number;
    tokens: { input: number; output: number };
    cost: number;
  }> {
    // Check offline status
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const offlineMsg =
        '[Offline Mode]: System is operating without active internet uplink. Real-time cognitive inference paused until network connectivity resumes.';
      callbacks.onChunk?.(offlineMsg);
      return {
        text: offlineMsg,
        providerId: 'local',
        providerName: 'Offline Cache',
        model: 'local-stub',
        latencyMs: 1,
        tokens: { input: 0, output: 0 },
        cost: 0
      };
    }

    // Determine candidate providers
    let candidates: AIProvider[] = [];
    if (this.settings.routingMode === 'manual' && this.settings.forcedProviderId) {
      const forced = this.providers.find((p) => p.id === this.settings.forcedProviderId);
      if (forced && forced.enabled) {
        candidates = [forced];
      }
    }

    if (candidates.length === 0) {
      candidates = this.getPrioritizedProviders();
    }

    if (candidates.length === 0) {
      const msg = 'All AI Providers in the Brain API are currently disabled. Please enable at least one provider in the Brain API tab.';
      callbacks.onChunk?.(msg);
      return {
        text: msg,
        providerId: 'none',
        providerName: 'None',
        model: 'none',
        latencyMs: 1,
        tokens: { input: 0, output: 0 },
        cost: 0
      };
    }

    // Check if user has entered ANY API key
    const anyKeyExists = candidates.some((c) => Boolean(c.apiKeyEncrypted));
    if (!anyKeyExists) {
      const activeP = candidates[0];
      const setupMsg =
        `No API key configured for ${activeP.name}. To enable live neural reasoning, please enter your API key in the Brain API tab.`;
      
      // Simulate natural streaming cadence for the guidance message
      callbacks.onStatusChange?.(`Awaiting API key for ${activeP.name}`);
      for (const word of setupMsg.split(' ')) {
        callbacks.onChunk?.(word + ' ');
        await new Promise((r) => setTimeout(r, 20));
      }

      return {
        text: setupMsg,
        providerId: activeP.id,
        providerName: activeP.name,
        model: activeP.selectedModel,
        latencyMs: 40,
        tokens: { input: 0, output: 0 },
        cost: 0
      };
    }

    // Filter to candidates that have an API key configured
    let eligibleCandidates = candidates.filter((c) => Boolean(c.apiKeyEncrypted));
    if (eligibleCandidates.length === 0) {
      eligibleCandidates = candidates;
    }

    let previousProvider: AIProvider | null = null;
    let lastError: string = '';

    // Provider Failover Loop
    for (let i = 0; i < eligibleCandidates.length; i++) {
      const provider = eligibleCandidates[i];

      // If switching providers during failover
      if (previousProvider && previousProvider.id !== provider.id) {
        const event: FailoverEvent = {
          timestamp: new Date().toLocaleTimeString(),
          fromProviderId: previousProvider.id,
          fromProviderName: previousProvider.name,
          toProviderId: provider.id,
          toProviderName: provider.name,
          reason: lastError || 'Quota exceeded or connection failure'
        };

        activityLogService.addLog(
          `AUTO-FAILOVER: Switched from ${previousProvider.name} to ${provider.name} (${event.reason})`,
          'FAILOVER',
          'WARNING'
        );

        callbacks.onProviderSwitch?.(event);
      }

      // Check RPM limit
      if (provider.currentRpm >= provider.rpmLimit) {
        provider.status = 'rate-limited';
        lastError = `Rate limit exceeded (${provider.rpmLimit} RPM)`;
        previousProvider = provider;
        continue;
      }

      callbacks.onStatusChange?.(`Jarvis reasoning via ${provider.name} (${provider.selectedModel})...`);

      // Attempt execution with retries and exponential backoff
      const maxRetries = Math.max(1, this.settings.retryAttempts || 2);
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          this.recordRequestForRpm(provider.id);
          const decryptedKey = await decryptApiKey(provider.apiKeyEncrypted);

          if (!decryptedKey) {
            throw new Error(`Decryption failed or missing API Key for ${provider.name}`);
          }

          const result = await this.callProviderApi(
            provider,
            decryptedKey,
            messages,
            callbacks.onChunk
          );

          // Success! Update provider status & usage
          provider.status = 'active';
          provider.statusMessage = 'Active & Healthy';
          provider.totalRequests += 1;
          provider.inputTokens += result.tokens.input;
          provider.outputTokens += result.tokens.output;
          provider.estimatedCost += result.cost;
          provider.lastUsed = new Date().toISOString();
          provider.lastLatencyMs = result.latencyMs;

          // Record in 30-day usage store
          usageStore.recordUsage({
            providerId: provider.id,
            providerName: provider.name,
            model: provider.selectedModel,
            inputTokens: result.tokens.input,
            outputTokens: result.tokens.output,
            totalTokens: result.tokens.input + result.tokens.output,
            cost: result.cost,
            success: true,
            latencyMs: result.latencyMs
          });

          this.saveState();
          this.notify();

          activityLogService.addLog(
            `Inference completed via ${provider.name} [${provider.selectedModel}] (${result.latencyMs}ms)`,
            'BRAIN_API',
            'SUCCESS',
            `${result.latencyMs}ms`
          );

          return {
            text: result.text,
            providerId: provider.id,
            providerName: provider.name,
            model: provider.selectedModel,
            latencyMs: result.latencyMs,
            tokens: result.tokens,
            cost: result.cost
          };
        } catch (err: any) {
          lastError = err?.message || 'Inference error';
          console.warn(
            `Attempt ${attempt} failed for ${provider.name} (${provider.selectedModel}):`,
            err
          );

          // If more retries remain, back off exponentially
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt - 1) * 600;
            callbacks.onStatusChange?.(
              `Retrying ${provider.name} (Attempt ${attempt + 1}/${maxRetries} in ${delay}ms)...`
            );
            await new Promise((r) => setTimeout(r, delay));
          } else {
            // Out of retries for this provider: mark provider status and prepare failover
            provider.status = 'failed';
            provider.statusMessage = `Failed: ${lastError.substring(0, 60)}`;
            this.saveState();
            this.notify();
            previousProvider = provider;
          }
        }
      }
    }

    // If ALL providers failed
    const finalError = `Cognitive Pipeline Notice: All available AI providers encountered connectivity or quota limits. Last error: ${lastError}`;
    callbacks.onChunk?.(finalError);

    activityLogService.addLog(
      `CRITICAL: All Brain API providers failed. Last: ${lastError}`,
      'BRAIN_API',
      'FAILED'
    );

    return {
      text: finalError,
      providerId: 'error',
      providerName: 'System Error',
      model: 'error',
      latencyMs: 0,
      tokens: { input: 0, output: 0 },
      cost: 0
    };
  }

  // Low-level provider dispatch
  private async callProviderApi(
    provider: AIProvider,
    apiKey: string,
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    onChunk?: (chunk: string) => void
  ): Promise<{
    text: string;
    tokens: { input: number; output: number };
    cost: number;
    latencyMs: number;
  }> {
    const start = performance.now();
    const timeoutMs = (this.settings.timeoutSeconds || 30) * 1000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      let text = '';
      let inputTokens = 0;
      let outputTokens = 0;

      // Calculate approximate prompt tokens if not returned by API
      const promptChars = messages.reduce((acc, m) => acc + m.content.length, 0);
      inputTokens = Math.max(10, Math.round(promptChars / 3.8));

      switch (provider.type) {
        case 'gemini': {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${provider.selectedModel}:generateContent?key=${apiKey}`;
          
          // Format Gemini contents
          const systemMsg = messages.find((m) => m.role === 'system') || {
            content: this.settings.systemPrompt
          };
          const chatMsgs = messages
            .filter((m) => m.role !== 'system')
            .map((m) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }]
            }));

          const payload: any = {
            contents: chatMsgs.length > 0 ? chatMsgs : [{ role: 'user', parts: [{ text: 'Hello' }] }],
            systemInstruction: { parts: [{ text: systemMsg.content }] },
            generationConfig: {
              temperature: this.settings.temperature,
              maxOutputTokens: this.settings.maxTokens
            }
          };

          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
          });

          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            throw new Error(errJson.error?.message || `Gemini API error (HTTP ${res.status})`);
          }

          const data = await res.json();
          text =
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            'I have processed your command.';
          
          if (data.usageMetadata) {
            inputTokens = data.usageMetadata.promptTokenCount || inputTokens;
            outputTokens = data.usageMetadata.candidatesTokenCount || Math.round(text.length / 3.8);
          } else {
            outputTokens = Math.max(10, Math.round(text.length / 3.8));
          }

          // Emit full text or progressive stream
          if (onChunk) {
            onChunk(text);
          }
          break;
        }

        case 'openai': {
          const url = 'https://api.openai.com/v1/chat/completions';
          const formatted = [
            { role: 'system', content: this.settings.systemPrompt },
            ...messages.filter((m) => m.role !== 'system')
          ];

          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: provider.selectedModel,
              messages: formatted,
              temperature: this.settings.temperature,
              max_tokens: this.settings.maxTokens
            }),
            signal: controller.signal
          });

          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            throw new Error(errJson.error?.message || `OpenAI API error (HTTP ${res.status})`);
          }

          const data = await res.json();
          text = data.choices?.[0]?.message?.content || 'Completed.';
          if (data.usage) {
            inputTokens = data.usage.prompt_tokens || inputTokens;
            outputTokens = data.usage.completion_tokens || Math.round(text.length / 3.8);
          } else {
            outputTokens = Math.max(10, Math.round(text.length / 3.8));
          }

          if (onChunk) {
            onChunk(text);
          }
          break;
        }

        case 'anthropic': {
          const url = 'https://api.anthropic.com/v1/messages';
          const chatMsgs = messages
            .filter((m) => m.role !== 'system')
            .map((m) => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content
            }));

          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: provider.selectedModel,
              max_tokens: this.settings.maxTokens,
              temperature: this.settings.temperature,
              system: this.settings.systemPrompt,
              messages: chatMsgs.length > 0 ? chatMsgs : [{ role: 'user', content: 'Hello' }]
            }),
            signal: controller.signal
          });

          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            throw new Error(errJson.error?.message || `Anthropic API error (HTTP ${res.status})`);
          }

          const data = await res.json();
          text = data.content?.[0]?.text || 'Synthesized.';
          if (data.usage) {
            inputTokens = data.usage.input_tokens || inputTokens;
            outputTokens = data.usage.output_tokens || Math.round(text.length / 3.8);
          } else {
            outputTokens = Math.max(10, Math.round(text.length / 3.8));
          }

          if (onChunk) {
            onChunk(text);
          }
          break;
        }

        case 'groq': {
          const url = 'https://api.groq.com/openai/v1/chat/completions';
          const formatted = [
            { role: 'system', content: this.settings.systemPrompt },
            ...messages.filter((m) => m.role !== 'system')
          ];

          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: provider.selectedModel,
              messages: formatted,
              temperature: this.settings.temperature,
              max_tokens: this.settings.maxTokens
            }),
            signal: controller.signal
          });

          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            throw new Error(errJson.error?.message || `Groq API error (HTTP ${res.status})`);
          }

          const data = await res.json();
          text = data.choices?.[0]?.message?.content || 'Completed.';
          if (data.usage) {
            inputTokens = data.usage.prompt_tokens || inputTokens;
            outputTokens = data.usage.completion_tokens || Math.round(text.length / 3.8);
          } else {
            outputTokens = Math.max(10, Math.round(text.length / 3.8));
          }

          if (onChunk) {
            onChunk(text);
          }
          break;
        }

        case 'custom': {
          const endpoint = provider.endpointUrl || 'http://localhost:11434/v1/chat/completions';
          const formatted = [
            { role: 'system', content: this.settings.systemPrompt },
            ...messages.filter((m) => m.role !== 'system')
          ];

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
              ...(provider.customHeaders || {})
            },
            body: JSON.stringify({
              model: provider.selectedModel,
              messages: formatted,
              temperature: this.settings.temperature,
              max_tokens: this.settings.maxTokens
            }),
            signal: controller.signal
          });

          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            throw new Error(errJson.error?.message || `Custom API error (HTTP ${res.status})`);
          }

          const data = await res.json();
          text = data.choices?.[0]?.message?.content || 'Completed.';
          if (data.usage) {
            inputTokens = data.usage.prompt_tokens || inputTokens;
            outputTokens = data.usage.completion_tokens || Math.round(text.length / 3.8);
          } else {
            outputTokens = Math.max(10, Math.round(text.length / 3.8));
          }

          if (onChunk) {
            onChunk(text);
          }
          break;
        }
      }

      const latencyMs = Math.round(performance.now() - start);

      // Find current model costs
      const activeModel = provider.models.find((m) => m.id === provider.selectedModel) || provider.models[0];
      const cost =
        (inputTokens / 1000000) * (activeModel?.inputCostPer1M || 0.5) +
        (outputTokens / 1000000) * (activeModel?.outputCostPer1M || 1.5);

      return {
        text,
        tokens: { input: inputTokens, output: outputTokens },
        cost,
        latencyMs
      };
    } finally {
      clearTimeout(timer);
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Brain API listener error:', e);
      }
    });
  }
}

export const brainApiService = new BrainApiService();
