import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Mail,
  UserCheck,
  X
} from 'lucide-react';

export const TeamManagement = () => {
  const { currentRole, switchRole, showToast } = useApp();

  const [members, setMembers] = useState([
    {
      id: 1,
      name: 'Sarah Lin',
      email: 'sarah.lin@apexcloud.io',
      role: 'admin',
      title: 'VP of Brand Governance',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      reviews_handled: 84
    },
    {
      id: 2,
      name: 'Elena Rostova',
      email: 'elena.rostova@apexcloud.io',
      role: 'creator',
      title: 'Senior Content Strategist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      reviews_handled: 42
    },
    {
      id: 3,
      name: 'Marcus Vance',
      email: 'marcus.vance@apexcloud.io',
      role: 'reviewer',
      title: 'Brand Compliance Director',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      reviews_handled: 67
    }
  ]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('creator');

  const handleInvite = (e) => {
    e.preventDefault();
    if (currentRole !== 'admin') {
      showToast('Only Administrators can invite new team members.', 'error');
      return;
    }

    const newMember = {
      id: members.length + 1,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      title: inviteRole === 'admin' ? 'Brand Admin' : inviteRole === 'reviewer' ? 'Content Reviewer' : 'Content Author',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      reviews_handled: 0
    };

    setMembers([...members, newMember]);
    setShowInviteModal(false);
    setInviteName('');
    setInviteEmail('');
    showToast(`Invitation sent to ${inviteEmail} as ${inviteRole.toUpperCase()}`, 'success');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
              Module 08
            </span>
            <span className="text-xs text-slate-400">Governance Permissions & Access</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Team Management & Roles</h2>
          <p className="text-xs text-slate-400 mt-1">
            Assign workspace members to specific brand governance responsibilities.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Role Responsibilities Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-purple-500/30 bg-purple-950/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">1. Administrator</span>
            <button
              onClick={() => switchRole('admin')}
              className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30 hover:bg-purple-500/40"
            >
              Simulate Role
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Manages brand guideline PDFs, approved facts, terminology matrix, team invitations, and workspace governance settings.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 bg-emerald-950/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">2. Creator</span>
            <button
              onClick={() => switchRole('creator')}
              className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 hover:bg-emerald-500/40"
            >
              Simulate Role
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Submits raw content and PDFs, runs AI governance analysis, reviews explainable findings, applies smart corrections, and revises drafts.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-blue-500/30 bg-blue-950/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider font-mono">3. Reviewer</span>
            <button
              onClick={() => switchRole('reviewer')}
              className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30 hover:bg-blue-500/40"
            >
              Simulate Role
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Examines detected issues and supporting evidence, adds threaded comments, requests changes, and issues final binding approvals.
          </p>
        </div>
      </div>

      {/* Team Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Active Workspace Members ({members.length})</h3>
          <span className="text-xs text-slate-400">ApexCloud Technologies</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-xs uppercase tracking-wider text-slate-400 font-mono border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Member</th>
                <th className="px-6 py-3.5">Title</th>
                <th className="px-6 py-3.5">Governance Role</th>
                <th className="px-6 py-3.5">Activity</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-9 h-9 rounded-full ring-2 ring-indigo-500/20 object-cover"
                    />
                    <div>
                      <span className="font-semibold text-white block">{m.name}</span>
                      <span className="text-xs text-slate-400">{m.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-300">{m.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded-full uppercase ${
                      m.role === 'admin'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : m.role === 'reviewer'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {m.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">
                    {m.reviews_handled} actions recorded
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => switchRole(m.role)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                    >
                      Assume Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setShowInviteModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-semibold text-white mb-1">Invite Workspace Member</h3>
            <p className="text-xs text-slate-400 mb-4">Grant appropriate governance permissions</p>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., David Kim"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="david.kim@apexcloud.io"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="creator">Creator (Uploads & Revises Drafts)</option>
                  <option value="reviewer">Reviewer (Audits, Comments & Approves)</option>
                  <option value="admin">Administrator (Manages Guidelines & Settings)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
