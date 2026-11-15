import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  BookOpen,
  FileSearch,
  ShieldAlert,
  GitPullRequest,
  BarChart3,
  Users,
  Settings,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  UserCheck
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, currentRole, switchRole, currentUser, workspace } = useApp();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, roles: ['admin', 'creator', 'reviewer'] },
    { id: 'knowledge', label: 'Brand Knowledge Base', icon: BookOpen, roles: ['admin', 'creator', 'reviewer'], badge: 'Admin Hub' },
    { id: 'analyzer', label: 'Content Analyzer', icon: FileSearch, roles: ['admin', 'creator', 'reviewer'], badge: 'AI Live' },
    { id: 'findings', label: 'Compliance Findings', icon: ShieldAlert, roles: ['admin', 'creator', 'reviewer'], badge: 'Explainable' },
    { id: 'workflow', label: 'Approval Workflow', icon: GitPullRequest, roles: ['admin', 'creator', 'reviewer'], badge: 'Audit Trail' },
    { id: 'insights', label: 'Governance Insights', icon: BarChart3, roles: ['admin', 'reviewer', 'creator'] },
    { id: 'team', label: 'Team Management', icon: Users, roles: ['admin'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin', 'creator', 'reviewer'] }
  ];

  return (
    <aside className="w-72 bg-[#0c1222] border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      {/* Top Branding */}
      <div>
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white font-sans">BrandCue</span>
                <span className="text-xs px-1.5 py-0.5 rounded font-mono font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">AI</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">Every Content. One Consistent Brand.</p>
            </div>
          </div>

          {/* Workspace Pill */}
          <div className="mt-4 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-xs font-medium text-slate-300 truncate">{workspace.name}</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Workspace</span>
          </div>
        </div>

        {/* Role Switcher Pill - Highlights Multi-Role Capabilities */}
        <div className="px-5 pt-4 pb-2">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-2 flex items-center justify-between">
            <span>Simulate User Role</span>
            <span className="text-[10px] font-mono text-indigo-400">Live Demo</span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
            {['admin', 'creator', 'reviewer'].map((role) => (
              <button
                key={role}
                onClick={() => switchRole(role)}
                className={`py-1.5 text-xs rounded-md capitalize font-medium transition-all ${
                  currentRole === role
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const hasAccess = item.roles.includes(currentRole);

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-white border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                } ${!hasAccess ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    isActive ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.full_name}
            className="w-9 h-9 rounded-full ring-2 ring-indigo-500/30 object-cover"
          />
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-slate-200 truncate">{currentUser.full_name}</p>
            <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold uppercase ${
            currentRole === 'admin'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : currentRole === 'reviewer'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {currentRole}
          </span>
        </div>
      </div>
    </aside>
  );
};
