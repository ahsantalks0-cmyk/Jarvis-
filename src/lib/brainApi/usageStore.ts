import { UsageHistoryRecord } from '../../types';

const USAGE_STORAGE_KEY = 'jarvis_brain_usage_history_v1';

class UsageStore {
  private history: UsageHistoryRecord[] = [];

  constructor() {
    this.loadHistory();
  }

  private loadHistory() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(USAGE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Keep only past 30 days
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - 30);
          this.history = parsed.filter((item: UsageHistoryRecord) => {
            return new Date(item.timestamp) >= cutoff;
          });
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to parse usage history:', e);
    }
    this.history = [];
  }

  private saveHistory() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(this.history));
    } catch (e) {
      console.warn('Failed to persist usage history:', e);
    }
  }

  recordUsage(record: Omit<UsageHistoryRecord, 'id' | 'timestamp' | 'date'>) {
    const now = new Date();
    const item: UsageHistoryRecord = {
      ...record,
      id: `usage-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now.toISOString(),
      date: now.toISOString().split('T')[0]
    };
    this.history = [item, ...this.history];
    this.saveHistory();
    return item;
  }

  get30DayHistory(): UsageHistoryRecord[] {
    return [...this.history];
  }

  getTodayStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = this.history.filter((r) => r.date === today);

    const totalRequests = todayRecords.length;
    const inputTokens = todayRecords.reduce((acc, r) => acc + r.inputTokens, 0);
    const outputTokens = todayRecords.reduce((acc, r) => acc + r.outputTokens, 0);
    const totalTokens = inputTokens + outputTokens;
    const estimatedCost = todayRecords.reduce((acc, r) => acc + r.cost, 0);

    // Group by provider for chart
    const perProvider: Record<string, { requests: number; cost: number; tokens: number }> = {};
    todayRecords.forEach((r) => {
      if (!perProvider[r.providerName]) {
        perProvider[r.providerName] = { requests: 0, cost: 0, tokens: 0 };
      }
      perProvider[r.providerName].requests += 1;
      perProvider[r.providerName].cost += r.cost;
      perProvider[r.providerName].tokens += r.totalTokens;
    });

    return {
      totalRequests,
      inputTokens,
      outputTokens,
      totalTokens,
      estimatedCost,
      perProvider
    };
  }

  getMonthStats() {
    const currentYearMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    const monthRecords = this.history.filter((r) => r.date.startsWith(currentYearMonth));

    return {
      totalRequests: monthRecords.length,
      estimatedCost: monthRecords.reduce((acc, r) => acc + r.cost, 0)
    };
  }

  exportCSV(): void {
    if (this.history.length === 0) {
      const emptyCsv = 'Date,Timestamp,Provider,Model,InputTokens,OutputTokens,TotalTokens,CostUSD,LatencyMs,Success\n';
      this.triggerDownload('jarvis_brain_usage_report.csv', emptyCsv, 'text/csv');
      return;
    }

    const headers = ['Date', 'Timestamp', 'Provider', 'Model', 'InputTokens', 'OutputTokens', 'TotalTokens', 'CostUSD', 'LatencyMs', 'Success'];
    const rows = this.history.map((r) => [
      r.date,
      r.timestamp,
      `"${r.providerName}"`,
      `"${r.model}"`,
      r.inputTokens,
      r.outputTokens,
      r.totalTokens,
      r.cost.toFixed(6),
      r.latencyMs,
      r.success ? 'TRUE' : 'FALSE'
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    this.triggerDownload(`jarvis_brain_usage_30days_${new Date().toISOString().split('T')[0]}.csv`, csvContent, 'text/csv');
  }

  exportJSON(): void {
    const dataStr = JSON.stringify(this.history, null, 2);
    this.triggerDownload(`jarvis_brain_usage_30days_${new Date().toISOString().split('T')[0]}.json`, dataStr, 'application/json');
  }

  private triggerDownload(filename: string, content: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const usageStore = new UsageStore();
