import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  BarChart3,
  TrendingUp,
  Clock,
  ShieldCheck,
  Filter,
  Download,
  AlertTriangle,
  RefreshCw,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export const GovernanceInsights = () => {
  const { showToast } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('6m');

  const loadInsights = async () => {
    try {
      setLoading(true);
      const res = await api.getGovernanceInsights();
      setData(res);
    } catch (err) {
      console.error(err);
      showToast('Error loading governance insights', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [dateRange]);

  const handleExportReport = () => {
    showToast('Governance Audit Report exported as CSV/PDF summary', 'success');
  };

  if (loading || !data) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading Governance Insights & Analytics...</p>
        </div>
      </div>
    );
  }

  const { monthly_trends, category_breakdown, top_infractions, turnaround_metrics } = data;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
              Module 07
            </span>
            <span className="text-xs text-slate-400">Continuous Brand Health Monitoring</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Governance Insights & Analytics</h2>
          <p className="text-xs text-slate-400 mt-1">
            Track enterprise compliance trends, recurring terminology infractions, and review velocity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="30d">Last 30 Days</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last 12 Months</option>
          </select>

          <button
            onClick={handleExportReport}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export Audit Report</span>
          </button>
        </div>
      </div>

      {/* Turnaround & SLA Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Average Turnaround Time</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{turnaround_metrics.avg_hours}h</span>
            <span className="text-xs text-emerald-400 font-medium">35% faster than Q2</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">From submission to formal human approval</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Same-Day Approval Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{turnaround_metrics.same_day_pct}%</span>
            <span className="text-xs text-emerald-400 font-medium">High Efficiency</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Accelerated by AI smart correction engine</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Revisions per Approval</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{turnaround_metrics.revisions_per_approval}</span>
            <span className="text-xs text-purple-400 font-medium">Industry Best: &lt; 2.0</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Low friction governance workflow</p>
        </div>
      </div>

      {/* Main Trends Chart */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Review Volume & Approval Trends Over Time</h3>
            <p className="text-xs text-slate-400">Monthly breakdown of reviews conducted and content approved</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-indigo-500"></span> Total Reviews
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Approved Content
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Area type="monotone" dataKey="reviews" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorReviews)" />
              <Area type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorApproved)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Columns: Category Performance & Top Infractions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Compliance Matrix */}
        <div className="lg:col-span-6 glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-white">Compliance by Content Channel</h3>
            <p className="text-xs text-slate-400">Tracking average compliance score across publishing formats</p>
          </div>

          <div className="space-y-3 pt-2">
            {category_breakdown.map((cat) => (
              <div key={cat.category} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-white">{cat.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{cat.total} submissions</span>
                    <span className="font-mono font-bold text-indigo-400">{cat.compliance_avg}% score</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full"
                    style={{ width: `${cat.compliance_avg}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Recurring Terminology Infractions */}
        <div className="lg:col-span-6 glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-white">Top Terminology Infractions</h3>
            <p className="text-xs text-slate-400">Most frequently detected prohibited vocabulary across departments</p>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-2.5">Prohibited Term</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Frequency</th>
                  <th className="px-4 py-2.5">Preferred Alternative</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {top_infractions.map((inf) => (
                  <tr key={inf.term} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-mono font-bold text-red-400">"{inf.term}"</td>
                    <td className="px-4 py-3 text-slate-400">{inf.type}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-white">{inf.occurrences}x</td>
                    <td className="px-4 py-3 font-mono text-emerald-400">"{inf.preferred}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
