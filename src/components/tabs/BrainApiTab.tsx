import { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  Lock,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Download,
  Sliders,
  DollarSign,
  Activity,
  ArrowRightLeft,
  ChevronDown,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  Zap,
  HardDrive
} from 'lucide-react';
import { AIProvider, ProviderType, ProviderStatus, BrainApiSettings } from '../../types';
import { brainApiService } from '../../lib/brainApi/brainApiService';
import { usageStore } from '../../lib/brainApi/usageStore';
import { validateKeyFormat } from '../../lib/brainApi/crypto';

export default function BrainApiTab() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [settings, setSettings] = useState<BrainApiSettings>(brainApiService.getSettings());
  const [todayStats, setTodayStats] = useState(usageStore.getTodayStats());
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; latencyMs?: number; error?: string }>>({});

  // Modals state
  const [editProvider, setEditProvider] = useState<AIProvider | null>(null);
  const [inputKey, setInputKey] = useState('');
  const [showKeyText, setShowKeyText] = useState(false);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // New Provider Form State
  const [newProv, setNewProv] = useState({
    name: '',
    endpointUrl: 'http://localhost:11434/v1/chat/completions',
    modelId: 'llama3:latest',
    modelName: 'Llama 3 Local',
    priority: 5,
    rpmLimit: 60,
    apiKey: ''
  });

  useEffect(() => {
    const update = () => {
      setProviders(brainApiService.getProviders());
      setSettings(brainApiService.getSettings());
      setTodayStats(usageStore.getTodayStats());
    };
    update();
    const unsub = brainApiService.subscribe(update);
    return unsub;
  }, []);

  // Handle live test connection
  const handleTestConnection = async (providerId: string, overrideKey?: string) => {
    setTestingId(providerId);
    setTestResults((prev) => ({ ...prev, [providerId]: undefined as any }));
    const res = await brainApiService.testProviderConnection(providerId, overrideKey);
    setTestResults((prev) => ({ ...prev, [providerId]: res }));
    setTestingId(null);
  };

  // Open Edit Key / Config modal
  const handleOpenEdit = (p: AIProvider) => {
    setEditProvider(p);
    setInputKey('');
    setShowKeyText(false);
    setTestResults((prev) => ({ ...prev, [p.id]: undefined as any }));
  };

  // Save Key & Configuration
  const handleSaveKeyAndConfig = async () => {
    if (!editProvider) return;

    if (inputKey.trim()) {
      await brainApiService.updateProviderKey(editProvider.id, inputKey.trim());
    }

    brainApiService.updateProviderConfig(editProvider.id, {
      selectedModel: editProvider.selectedModel,
      priority: editProvider.priority,
      rpmLimit: editProvider.rpmLimit
    });

    setSaveSuccessMsg(`Configuration saved & encrypted for ${editProvider.name}`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
    setEditProvider(null);
  };

  // Save New Custom Provider
  const handleCreateCustomProvider = () => {
    if (!newProv.name.trim() || !newProv.endpointUrl.trim() || !newProv.modelId.trim()) {
      alert('Please fill in Provider Name, Endpoint URL, and Model ID.');
      return;
    }

    brainApiService.addCustomProvider(newProv);
    setIsAddingCustom(false);
    setNewProv({
      name: '',
      endpointUrl: 'http://localhost:11434/v1/chat/completions',
      modelId: 'llama3:latest',
      modelName: 'Llama 3 Local',
      priority: 5,
      rpmLimit: 60,
      apiKey: ''
    });
    setSaveSuccessMsg('Custom AI Provider registered successfully!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Status color helper
  const getStatusBadge = (status: ProviderStatus, hasKey: boolean) => {
    if (!hasKey) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-tech bg-amber-950/40 border border-amber-800/50 text-amber-300 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          AWAITING KEY
        </span>
      );
    }

    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-tech bg-[#0a2318] border border-[#0df597]/40 text-[#0df597] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0df597] animate-ping" />
            ACTIVE
          </span>
        );
      case 'standby':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-tech bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            STANDBY
          </span>
        );
      case 'rate-limited':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-tech bg-purple-950/40 border border-purple-800/40 text-purple-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            RATE-LIMITED
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-tech bg-red-950/40 border border-red-800/40 text-red-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            FAILED
          </span>
        );
      case 'disabled':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-tech bg-slate-900 border border-slate-800 text-slate-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            DISABLED
          </span>
        );
    }
  };

  const getProviderIcon = (type: ProviderType) => {
    switch (type) {
      case 'gemini':
        return <Sparkles className="w-4 h-4 text-[#0df597]" />;
      case 'openai':
        return <BrainCircuit className="w-4 h-4 text-[#00e5ff]" />;
      case 'anthropic':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'groq':
        return <Zap className="w-4 h-4 text-purple-400" />;
      case 'custom':
      default:
        return <HardDrive className="w-4 h-4 text-slate-400" />;
    }
  };

  // Cost threshold calculation
  const isBudgetWarning =
    todayStats.estimatedCost >= (settings.dailyCostAlertThreshold || 5.0);

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-[#06070a] text-slate-100">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6 flex-1 flex flex-col">
        {/* Top Header & Architecture Title */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#161b27]">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0df597] shadow-[0_0_10px_#0df597]" />
              <h1 className="text-lg font-tech font-bold uppercase tracking-wider text-slate-100">
                Command Center // Brain API
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-tech bg-[#0b1713] text-[#0df597] border border-[#133827]">
                MULTI-AI CORE v1.1.0
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-tech bg-[#0f1422] text-cyan-400 border border-[#1d273f]">
                AUTO-FAILOVER ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Dynamic multi-provider cognitive routing, automatic failover with exponential retries, SafeStorage encryption, and real-time token telemetry.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAddingCustom(true)}
              className="px-3.5 py-2 rounded-xl bg-[#0f1422] border border-[#1d283e] hover:border-[#0df597]/50 text-slate-200 hover:text-white text-xs font-mono-tech flex items-center gap-2 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-[#0df597]" />
              <span>ADD CUSTOM PROVIDER</span>
            </button>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#090c14] border border-[#161c2a]">
              <button
                onClick={() => usageStore.exportCSV()}
                className="px-2.5 py-1.5 rounded-lg text-xs font-mono-tech text-slate-400 hover:text-slate-200 hover:bg-[#131926] flex items-center gap-1.5 transition-all"
                title="Export 30-Day Usage Report as CSV"
              >
                <Download className="w-3 h-3 text-[#0df597]" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => usageStore.exportJSON()}
                className="px-2.5 py-1.5 rounded-lg text-xs font-mono-tech text-slate-400 hover:text-slate-200 hover:bg-[#131926] flex items-center gap-1.5 transition-all"
                title="Export 30-Day Usage Report as JSON"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                <span>JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {saveSuccessMsg && (
          <div className="p-3 rounded-xl bg-[#0a1e16] border border-[#0df597]/40 text-[#0df597] text-xs font-mono-tech flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {isBudgetWarning && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-700/50 text-amber-300 text-xs font-mono-tech flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              [COST ALERT THRESHOLD]: Today's inference cost (${todayStats.estimatedCost.toFixed(4)}) has exceeded the configured daily budget (${settings.dailyCostAlertThreshold.toFixed(2)}).
            </span>
          </div>
        )}

        {/* ============================================================ */}
        {/* LIVE USAGE TELEMETRY DASHBOARD */}
        {/* ============================================================ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Today's Requests */}
          <div className="p-4 rounded-2xl bg-[#0a0d15] border border-[#161c2b] relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono-tech text-slate-500 uppercase tracking-wider">
                Requests Today
              </span>
              <Activity className="w-3.5 h-3.5 text-[#0df597]" />
            </div>
            <div className="mt-2 text-2xl font-tech font-bold text-slate-100">
              {todayStats.totalRequests}
            </div>
            <div className="text-[10px] font-mono-tech text-slate-500 mt-1">
              Active circular session buffer
            </div>
          </div>

          {/* Card 2: Tokens Processed */}
          <div className="p-4 rounded-2xl bg-[#0a0d15] border border-[#161c2b] relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono-tech text-slate-500 uppercase tracking-wider">
                Tokens Processed
              </span>
              <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="mt-2 text-2xl font-tech font-bold text-cyan-300">
              {todayStats.totalTokens.toLocaleString()}
            </div>
            <div className="text-[10px] font-mono-tech text-slate-500 mt-1 flex gap-2">
              <span>In: {todayStats.inputTokens.toLocaleString()}</span>
              <span>•</span>
              <span>Out: {todayStats.outputTokens.toLocaleString()}</span>
            </div>
          </div>

          {/* Card 3: Estimated Cost */}
          <div className="p-4 rounded-2xl bg-[#0a0d15] border border-[#161c2b] relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono-tech text-slate-500 uppercase tracking-wider">
                Estimated Cost Today
              </span>
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-tech font-bold text-amber-300">
              ${todayStats.estimatedCost.toFixed(4)}
            </div>
            <div className="text-[10px] font-mono-tech text-slate-500 mt-1">
              Threshold: ${settings.dailyCostAlertThreshold.toFixed(2)}/day
            </div>
          </div>

          {/* Card 4: Active Routing Mode */}
          <div className="p-4 rounded-2xl bg-[#0a0d15] border border-[#161c2b] relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono-tech text-slate-500 uppercase tracking-wider">
                Routing Engine
              </span>
              <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="mt-2 text-base font-tech font-bold uppercase text-slate-200">
              {settings.routingMode === 'auto-failover' ? 'AUTO-FAILOVER' : 'MANUAL LOCK'}
            </div>
            <div className="text-[10px] font-mono-tech text-slate-400 mt-1 truncate">
              {brainApiService.getActiveProvider()?.name || 'None Active'}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* GLOBAL ROUTING & ENGINE CONTROLS */}
        {/* ============================================================ */}
        <div className="p-4 rounded-2xl bg-[#080b13] border border-[#161c2a] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sliders className="w-4 h-4 text-[#0df597]" />
            <div>
              <span className="text-xs font-tech font-bold text-slate-200 uppercase tracking-wider">
                Global Routing Strategy
              </span>
              <p className="text-[11px] text-slate-500 font-mono-tech">
                Priority-ranked failover triggers seamlessly if primary quota or timeout is reached.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Strategy Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0d121e] border border-[#1c263c] text-xs font-mono-tech">
              <button
                onClick={() => brainApiService.updateSettings({ routingMode: 'auto-failover', forcedProviderId: null })}
                className={`px-3 py-1 rounded-lg transition-all ${
                  settings.routingMode === 'auto-failover'
                    ? 'bg-[#14261e] text-[#0df597] border border-[#1c4834]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Auto-Failover
              </button>
              <button
                onClick={() =>
                  brainApiService.updateSettings({
                    routingMode: 'manual',
                    forcedProviderId: providers[0]?.id || 'gemini'
                  })
                }
                className={`px-3 py-1 rounded-lg transition-all ${
                  settings.routingMode === 'manual'
                    ? 'bg-[#1b253b] text-cyan-300 border border-[#273b5f]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Manual Override
              </button>
            </div>

            {/* If manual mode, pick provider */}
            {settings.routingMode === 'manual' && (
              <select
                value={settings.forcedProviderId || ''}
                onChange={(e) => brainApiService.updateSettings({ forcedProviderId: e.target.value })}
                className="bg-[#0b0e17] border border-[#1e273c] text-xs text-cyan-300 rounded-xl px-3 py-1.5 font-mono-tech"
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    Force: {p.name}
                  </option>
                ))}
              </select>
            )}

            {/* Timeout duration */}
            <div className="flex items-center gap-1.5 text-xs font-mono-tech text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Timeout:</span>
              <select
                value={settings.timeoutSeconds}
                onChange={(e) => brainApiService.updateSettings({ timeoutSeconds: Number(e.target.value) })}
                className="bg-[#0b0e17] border border-[#1e273c] text-xs text-slate-300 rounded-lg px-2 py-1"
              >
                <option value={15}>15s</option>
                <option value={25}>25s</option>
                <option value={45}>45s</option>
                <option value={60}>60s</option>
              </select>
            </div>

            {/* Retries */}
            <div className="flex items-center gap-1.5 text-xs font-mono-tech text-slate-400">
              <RefreshCw className="w-3 h-3 text-slate-500" />
              <span>Retries:</span>
              <select
                value={settings.retryAttempts}
                onChange={(e) => brainApiService.updateSettings({ retryAttempts: Number(e.target.value) })}
                className="bg-[#0b0e17] border border-[#1e273c] text-xs text-slate-300 rounded-lg px-2 py-1"
              >
                <option value={1}>1 Attempt</option>
                <option value={2}>2 Retries</option>
                <option value={3}>3 Retries</option>
              </select>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* PROVIDER CARDS GRID (3 per row responsive) */}
        {/* ============================================================ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono-tech text-slate-400 px-1">
            <span className="uppercase tracking-wider">Configured AI Providers ({providers.length})</span>
            <span className="text-[11px] text-slate-500">Lower Priority Number = Higher Routing Rank</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map((p) => {
              const hasKey = Boolean(p.apiKeyEncrypted);
              const testResult = testResults[p.id];
              const isTesting = testingId === p.id;
              const currentModel = p.models.find((m) => m.id === p.selectedModel) || p.models[0];

              return (
                <div
                  key={p.id}
                  className={`rounded-2xl bg-[#0a0d16] border transition-all flex flex-col justify-between ${
                    p.status === 'active'
                      ? 'border-[#0df597]/40 shadow-[0_0_20px_rgba(13,245,151,0.08)]'
                      : p.enabled
                      ? 'border-[#171f30] hover:border-[#24314b]'
                      : 'border-[#121622] opacity-60'
                  }`}
                >
                  {/* Card Top */}
                  <div className="p-5 space-y-4">
                    {/* Header: Icon, Name, Status Badge, Toggle */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#0f1422] border border-[#1b253b] flex items-center justify-center shrink-0">
                          {getProviderIcon(p.type)}
                        </div>
                        <div>
                          <h3 className="text-sm font-tech font-bold text-slate-100 uppercase tracking-wide">
                            {p.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono-tech px-1.5 py-0.5 rounded bg-[#101726] text-cyan-300 border border-[#1a2942]">
                              PRIORITY #{p.priority}
                            </span>
                            {p.endpointUrl && (
                              <span className="text-[9px] font-mono-tech text-slate-500 truncate max-w-[110px]" title={p.endpointUrl}>
                                Custom
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusBadge(p.status, hasKey)}
                        {/* Enable toggle switch */}
                        <button
                          type="button"
                          onClick={() => brainApiService.toggleProvider(p.id, !p.enabled)}
                          className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                            p.enabled ? 'bg-[#0df597]' : 'bg-[#182030]'
                          }`}
                          title={p.enabled ? 'Disable Provider' : 'Enable Provider'}
                        >
                          <span
                            className={`w-4 h-4 rounded-full bg-slate-950 block transition-transform ${
                              p.enabled ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Model Selector Dropdown */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono-tech text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Active Model</span>
                        {currentModel?.contextWindow && (
                          <span className="text-[9px] text-slate-500">
                            {(currentModel.contextWindow / 1000).toFixed(0)}k ctx
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <select
                          disabled={!p.enabled}
                          value={p.selectedModel}
                          onChange={(e) =>
                            brainApiService.updateProviderConfig(p.id, { selectedModel: e.target.value })
                          }
                          className="w-full bg-[#07090f] border border-[#182236] rounded-xl px-3 py-2 text-xs text-slate-200 font-sans appearance-none disabled:opacity-60 pr-8"
                        >
                          {p.models.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                      </div>
                    </div>

                    {/* API Key Vault Status */}
                    <div className="p-3 rounded-xl bg-[#07090e] border border-[#141926] space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono-tech">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-[#0df597]" />
                          VAULT ENCRYPTION
                        </span>
                        <span className="text-slate-500">
                          {hasKey ? 'SafeStorage Protected' : 'Empty'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono tracking-widest text-slate-300 truncate">
                          {hasKey ? p.apiKeyMasked : '•••••••••••• (No Key)'}
                        </span>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="px-2 py-1 rounded-lg bg-[#111726] hover:bg-[#18233a] border border-[#1e2a44] text-[10px] font-mono-tech text-cyan-300 transition-colors whitespace-nowrap"
                        >
                          {hasKey ? 'Edit Key' : '+ Add Key'}
                        </button>
                      </div>

                      {/* Test connection result display */}
                      {testResult && (
                        <div
                          className={`mt-2 p-2 rounded-lg text-[10px] font-mono-tech flex items-center gap-2 ${
                            testResult.success
                              ? 'bg-[#091a13] text-[#0df597] border border-[#0df597]/30'
                              : 'bg-red-950/40 text-red-300 border border-red-900/40'
                          }`}
                        >
                          {testResult.success ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-[#0df597] shrink-0" />
                              <span>Live Ping Success: {testResult.latencyMs}ms</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-red-400 shrink-0" />
                              <span className="truncate">{testResult.error || 'Connection failed'}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Telemetry Metrics Strip */}
                    <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono-tech">
                      <div className="p-2 rounded-xl bg-[#07090f] border border-[#131a28]">
                        <span className="text-[9px] text-slate-500 block">RPM RATE</span>
                        <span className="text-xs font-bold text-slate-200">
                          {p.currentRpm} / {p.rpmLimit}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#07090f] border border-[#131a28]">
                        <span className="text-[9px] text-slate-500 block">TOTAL REQS</span>
                        <span className="text-xs font-bold text-slate-200">{p.totalRequests}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#07090f] border border-[#131a28]">
                        <span className="text-[9px] text-slate-500 block">EST. COST</span>
                        <span className="text-xs font-bold text-amber-300">
                          ${p.estimatedCost.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="p-3 bg-[#080a10] border-t border-[#141926] rounded-b-2xl flex items-center justify-between gap-2">
                    <button
                      disabled={isTesting || !hasKey || !p.enabled}
                      onClick={() => handleTestConnection(p.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#0e1422] hover:bg-[#162035] border border-[#1b263e] disabled:opacity-50 text-[11px] font-mono-tech text-slate-300 flex items-center gap-1.5 transition-all"
                    >
                      <RefreshCw className={`w-3 h-3 text-[#0df597] ${isTesting ? 'animate-spin' : ''}`} />
                      <span>{isTesting ? 'Testing...' : 'Test Ping'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="px-3 py-1.5 rounded-lg bg-[#0e1422] hover:bg-[#162035] border border-[#1b263e] text-[11px] font-mono-tech text-cyan-400 transition-colors"
                      >
                        Config
                      </button>

                      {p.type === 'custom' && (
                        <button
                          onClick={() => brainApiService.deleteProvider(p.id)}
                          title="Delete Custom Provider"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security & Ownership Disclaimer */}
        <div className="p-4 rounded-2xl bg-[#080a11] border border-[#141825] flex items-start gap-3 text-xs font-mono-tech text-slate-400 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-[#0df597] shrink-0 mt-0.5" />
          <span>
            [HARDENED SECURITY GUARANTEE]: All API keys entered above are encrypted locally via Electron's SafeStorage API and persisted solely within your local operating system vault. Jarvis never logs, transmits, or mirrors credentials to third-party tracking servers.
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* EDIT KEY & CONFIG MODAL */}
      {/* ============================================================ */}
      {editProvider && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0a0d16] border border-[#1d273a] shadow-2xl p-6 space-y-5 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#161f30] pb-4">
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-5 h-5 text-[#0df597]" />
                <div>
                  <h2 className="text-sm font-tech font-bold text-slate-100 uppercase">
                    Configure {editProvider.name}
                  </h2>
                  <span className="text-[10px] font-mono-tech text-slate-500">
                    ENCRYPTED VAULT STORAGE & PARAMETERS
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEditProvider(null)}
                className="text-slate-500 hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            {/* API Key Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono-tech text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Enter API Key</span>
                {editProvider.apiKeyMasked && (
                  <span className="text-[10px] text-slate-500">
                    Current: {editProvider.apiKeyMasked}
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showKeyText ? 'text' : 'password'}
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder={editProvider.apiKeyMasked ? 'Leave empty to keep existing key, or paste new key' : 'Paste API Key here...'}
                  className="w-full bg-[#07090e] border border-[#1c2538] focus:border-[#0df597] rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono pr-10 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowKeyText(!showKeyText)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showKeyText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 font-mono-tech">
                Key is encrypted before storage. It will never be displayed in plain text again.
              </p>
            </div>

            {/* Priority & RPM Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono-tech text-slate-400 uppercase">
                  Routing Priority (1-10)
                </label>
                <select
                  value={editProvider.priority}
                  onChange={(e) =>
                    setEditProvider({ ...editProvider, priority: Number(e.target.value) })
                  }
                  className="w-full bg-[#07090e] border border-[#1c2538] rounded-xl px-3 py-2 text-xs text-slate-200 font-mono-tech"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      Priority {num} {num === 1 ? '(Primary)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono-tech text-slate-400 uppercase">
                  Rate Limit (Req / Min)
                </label>
                <input
                  type="number"
                  min={5}
                  max={500}
                  value={editProvider.rpmLimit}
                  onChange={(e) =>
                    setEditProvider({ ...editProvider, rpmLimit: Number(e.target.value) })
                  }
                  className="w-full bg-[#07090e] border border-[#1c2538] rounded-xl px-3 py-2 text-xs text-slate-200 font-mono-tech"
                />
              </div>
            </div>

            {/* In-modal Test Ping */}
            <div className="p-3 rounded-xl bg-[#080b12] border border-[#151c2a] flex items-center justify-between">
              <div>
                <span className="text-xs font-tech text-slate-300">Validate Key Now</span>
                <span className="text-[10px] font-mono-tech text-slate-500 block">
                  Sends lightweight ping to verify credentials
                </span>
              </div>
              <button
                type="button"
                disabled={testingId === editProvider.id || (!inputKey && !editProvider.apiKeyEncrypted)}
                onClick={() => handleTestConnection(editProvider.id, inputKey || undefined)}
                className="px-3 py-1.5 rounded-lg bg-[#0e1422] border border-[#1e2a42] text-xs font-mono-tech text-slate-200 hover:text-white flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 text-[#0df597] ${testingId === editProvider.id ? 'animate-spin' : ''}`} />
                <span>Test Live</span>
              </button>
            </div>

            {/* Test connection result in modal */}
            {testResults[editProvider.id] && (
              <div
                className={`p-2.5 rounded-xl text-xs font-mono-tech flex items-center gap-2 ${
                  testResults[editProvider.id]?.success
                    ? 'bg-[#091a13] text-[#0df597] border border-[#0df597]/40'
                    : 'bg-red-950/40 text-red-300 border border-red-900/40'
                }`}
              >
                {testResults[editProvider.id]?.success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#0df597] shrink-0" />
                    <span>Credentials Verified ({testResults[editProvider.id]?.latencyMs}ms)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{testResults[editProvider.id]?.error || 'Verification failed'}</span>
                  </>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#161f30]">
              <button
                type="button"
                onClick={() => setEditProvider(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono-tech text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveKeyAndConfig}
                className="px-5 py-2 rounded-xl bg-[#0df597] hover:bg-[#0be088] text-slate-950 font-tech font-bold text-xs uppercase tracking-wider transition-all"
              >
                Save & Encrypt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ADD CUSTOM PROVIDER MODAL */}
      {/* ============================================================ */}
      {isAddingCustom && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0a0d16] border border-[#1d273a] shadow-2xl p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#161f30] pb-4">
              <div className="flex items-center gap-2.5">
                <Plus className="w-5 h-5 text-[#0df597]" />
                <div>
                  <h2 className="text-sm font-tech font-bold text-slate-100 uppercase">
                    Register Custom AI Provider
                  </h2>
                  <span className="text-[10px] font-mono-tech text-slate-500">
                    OPENAI-COMPATIBLE ENDPOINTS (OLLAMA, VLLM, LOCALAI)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAddingCustom(false)}
                className="text-slate-500 hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono-tech text-slate-400 uppercase">
                  Provider Name
                </label>
                <input
                  type="text"
                  value={newProv.name}
                  onChange={(e) => setNewProv({ ...newProv, name: e.target.value })}
                  placeholder="e.g. Local Ollama or DeepSeek"
                  className="w-full bg-[#07090e] border border-[#1c2538] rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono-tech text-slate-400 uppercase">
                  Endpoint URL (OpenAI Chat Completions)
                </label>
                <input
                  type="text"
                  value={newProv.endpointUrl}
                  onChange={(e) => setNewProv({ ...newProv, endpointUrl: e.target.value })}
                  placeholder="http://localhost:11434/v1/chat/completions"
                  className="w-full bg-[#07090e] border border-[#1c2538] rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono-tech text-slate-400 uppercase">
                    Model Identifier
                  </label>
                  <input
                    type="text"
                    value={newProv.modelId}
                    onChange={(e) => setNewProv({ ...newProv, modelId: e.target.value })}
                    placeholder="e.g. llama3:latest"
                    className="w-full bg-[#07090e] border border-[#1c2538] rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono-tech text-slate-400 uppercase">
                    Model Display Name
                  </label>
                  <input
                    type="text"
                    value={newProv.modelName}
                    onChange={(e) => setNewProv({ ...newProv, modelName: e.target.value })}
                    placeholder="e.g. Llama 3 Local"
                    className="w-full bg-[#07090e] border border-[#1c2538] rounded-xl px-3 py-2 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono-tech text-slate-400 uppercase">
                  API Key (Optional for local servers)
                </label>
                <input
                  type="password"
                  value={newProv.apiKey}
                  onChange={(e) => setNewProv({ ...newProv, apiKey: e.target.value })}
                  placeholder="Bearer token or sk-... (optional)"
                  className="w-full bg-[#07090e] border border-[#1c2538] rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono-tech text-slate-400 uppercase">
                    Priority (1-10)
                  </label>
                  <select
                    value={newProv.priority}
                    onChange={(e) => setNewProv({ ...newProv, priority: Number(e.target.value) })}
                    className="w-full bg-[#07090e] border border-[#1c2538] rounded-xl px-3 py-2 text-xs text-slate-200 font-mono-tech"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        Priority {num}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono-tech text-slate-400 uppercase">
                    RPM Limit
                  </label>
                  <input
                    type="number"
                    value={newProv.rpmLimit}
                    onChange={(e) => setNewProv({ ...newProv, rpmLimit: Number(e.target.value) })}
                    className="w-full bg-[#07090e] border border-[#1c2538] rounded-xl px-3 py-2 text-xs text-slate-200 font-mono-tech"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#161f30]">
              <button
                type="button"
                onClick={() => setIsAddingCustom(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono-tech text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCustomProvider}
                className="px-5 py-2 rounded-xl bg-[#0df597] hover:bg-[#0be088] text-slate-950 font-tech font-bold text-xs uppercase tracking-wider transition-all"
              >
                Register Provider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
