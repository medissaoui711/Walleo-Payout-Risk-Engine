import React, { useEffect, useState } from "react";
import { 
  BarChart3, 
  Activity, 
  Clock, 
  Zap, 
  ShieldAlert, 
  CheckCircle2, 
  FileCode2, 
  RefreshCw,
  TrendingUp,
  Percent
} from "lucide-react";
import { PrometheusMetrics } from "../types";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

interface MetricsDashboardProps {
  lang: 'ar' | 'en';
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [metrics, setMetrics] = useState<PrometheusMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showGrafanaJson, setShowGrafanaJson] = useState(false);

  async function fetchMetrics() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/metrics");
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error("Failed to load metrics:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const grafanaJsonString = JSON.stringify({
    dashboard: {
      title: "Walleo Payout Risk Engine",
      panels: [
        {
          title: "Walleo Sentinel Request Rate",
          targets: [{ expr: "rate(sentinel_requests_total[5m])" }]
        },
        {
          title: "Auto-Approval Rate",
          targets: [{ expr: "sum(sentinel_requests_total{action='AUTO_APPROVE'}) / sum(sentinel_requests_total)" }]
        },
        {
          title: "Fallback Rate",
          targets: [{ expr: "sum(sentinel_fallbacks_total) / sum(sentinel_requests_total)" }]
        },
        {
          title: "P95 Latency",
          targets: [{ expr: "histogram_quantile(0.95, rate(sentinel_evaluation_latency_seconds_bucket[5m]))" }]
        }
      ]
    }
  }, null, 2);

  if (!metrics) {
    return (
      <div className="p-12 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-2" />
        <span>{isAr ? "جاري تحميل مقاييس Prometheus / Grafana..." : "Loading Live Metrics..."}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">
              {isAr ? "لوحة المراقبة الحية ومقاييس الأداء (Prometheus & Grafana)" : "Live Telemetry & Grafana Dashboard"}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr 
              ? "مراقبة مستمرة لمعدلات الموافقة التلقائية وزمن استجابة محرك Sentinel ونسب المراجعة اليدوية (Phase 5 Metrics)"
              : "Continuous Prometheus metrics scraping for request throughput, P95 latency, and auto-approval rates"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGrafanaJson(!showGrafanaJson)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showGrafanaJson ? (isAr ? "إخفاء JSON" : "Hide JSON") : (isAr ? "عرض كود Grafana JSON" : "Grafana JSON")}</span>
          </button>

          <button
            onClick={fetchMetrics}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grafana JSON Drawer if toggled */}
      {showGrafanaJson && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
            <span>Grafana Dashboard Specification (5.2)</span>
            <span className="text-emerald-400">PromQL Ready</span>
          </div>
          <pre className="text-[11px] font-mono text-emerald-300 bg-slate-900/90 p-4 rounded-xl overflow-x-auto border border-slate-800">
            {grafanaJsonString}
          </pre>
        </div>
      )}

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Requests */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isAr ? "إجمالي طلبات Sentinel" : "Total Sentinel Evaluations"}
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {metrics.totalRequests}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            rate(sentinel_requests_total[5m])
          </p>
        </div>

        {/* Auto-Approval Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isAr ? "نسبة الموافقة التلقائية" : "Auto-Approval Rate"}
            </span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            {metrics.autoApprovalRate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            {metrics.autoApprovedCount} / {metrics.totalRequests} approved instantly
          </p>
        </div>

        {/* Fallback Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isAr ? "معدل القواعد الاحتياطية" : "Fallback Rate"}
            </span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {metrics.fallbackRate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            sum(jev_fallbacks_total)
          </p>
        </div>

        {/* P95 Latency */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isAr ? "زمن الاستجابة (P95 Latency)" : "P95 Latency"}
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {metrics.p95LatencyMs} <span className="text-base text-slate-400">ms</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            Avg: {metrics.avgLatencyMs}ms (Sub-second SLA)
          </p>
        </div>
      </div>

      {/* Visual Grafana-style Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Volume Area Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              {isAr ? "حجم طلبات التقييم عبر الوقت (Sentinel Throughput)" : "Sentinel Request Rate (Hourly)"}
            </h3>
            <span className="text-xs font-mono text-slate-400">Prometheus</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.hourlyActivity}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorManual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="requests" name="Total Requests" stroke="#10b981" fillOpacity={1} fill="url(#colorRequests)" />
                <Area type="monotone" dataKey="manual" name="Manual Flagged" stroke="#f59e0b" fillOpacity={1} fill="url(#colorManual)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency Histogram Buckets */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              {isAr ? "توزيع زمن الاستجابة (Latency Buckets)" : "Latency Histogram Buckets"}
            </h3>
            <span className="text-xs font-mono text-slate-400">Histogram</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.latencyBuckets}>
                <XAxis dataKey="bucket" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="count" name="Evaluations" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
