import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  BookOpen,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const DashboardOverview = () => {
  const { setActiveTab, setActiveSubmissionId } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#3b82f6'];

  if (loading || !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading Governance Analytics...</p>
        </div>
      </div>
    );
  }

  const kpis = data.kpis || {};

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>BrandCue AI Platform Active</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">ApexCloud Brand Governance Control Plane</h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Real-time multi-channel brand compliance. Check marketing drafts, product specs, and press releases against certified enterprise guidelines, facts, and terminology.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('analyzer')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analyze Draft</span>
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Knowledge Base</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Content Reviews */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Content Reviews</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{kpis.total_reviews}</span>
            <span className="text-xs text-emerald-400 flex items-center font-medium">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +12% this week
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Across 6 publication categories</p>
        </div>

        {/* Approved Content */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Approved Content</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{kpis.approved}</span>
            <span className="text-xs text-slate-400 font-medium">
              Certified for release
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">100% human-verified</p>
        </div>

        {/* Flagged Issues */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Flagged Submissions</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{kpis.flagged_content}</span>
            <span className="text-xs text-amber-400 font-medium">Needs Attention</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">{kpis.total_issues} detected violations</p>
        </div>

        {/* Governance Health */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Brand Health Score</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{kpis.governance_health_score}%</span>
            <span className="text-xs text-emerald-400 font-medium">High Standard</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Avg turnaround: {kpis.avg_turnaround_hours}h</p>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most Common Violation Categories */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">Most Common Violation Categories</h3>
              <p className="text-xs text-slate-400">Frequency of infractions detected across active knowledge base policies</p>
            </div>
            <button
              onClick={() => setActiveTab('insights')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              <span>View Insights</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.violation_categories} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Issue Severity Breakdown</h3>
            <p className="text-xs text-slate-400 mb-4">Risk classification of active governance findings</p>
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.severity_distribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {data.severity_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
            {data.severity_distribution.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-xs text-slate-300 truncate">{item.name}</span>
                <span className="text-xs font-mono font-semibold text-white ml-auto">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Recent Content Submissions</h3>
            <p className="text-xs text-slate-400">Content currently tracked under the governance workflow</p>
          </div>
          <button
            onClick={() => setActiveTab('workflow')}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
          >
            <span>Approval Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="px-6 py-3.5">Content Title</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Author</th>
                <th className="px-6 py-3.5">Compliance Score</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.recent_submissions.map((sub) => {
                const getStatusBadge = (status) => {
                  switch (status) {
                    case 'approved':
                      return <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">Approved</span>;
                    case 'flagged':
                      return <span className="px-2.5 py-1 text-xs rounded-full bg-red-500/10 text-red-400 border border-red-500/30 font-medium animate-pulse">Flagged</span>;
                    case 'in_review':
                      return <span className="px-2.5 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-medium">In Review</span>;
                    default:
                      return <span className="px-2.5 py-1 text-xs rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-medium">Changes Requested</span>;
                  }
                };

                const scoreColor = sub.compliance_score >= 90 ? 'text-emerald-400' : sub.compliance_score >= 70 ? 'text-amber-400' : 'text-red-400';

                return (
                  <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white max-w-xs truncate">
                      {sub.title}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">{sub.category}</td>
                    <td className="px-6 py-4 text-xs text-slate-300">{sub.author_name}</td>
                    <td className="px-6 py-4">
                      <span className={`font-mono text-sm font-semibold ${scoreColor}`}>
                        {sub.compliance_score.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(sub.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setActiveSubmissionId(sub.id);
                          setActiveTab('findings');
                        }}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition-all inline-flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
