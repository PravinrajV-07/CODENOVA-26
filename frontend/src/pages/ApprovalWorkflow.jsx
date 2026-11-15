import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  GitPullRequest,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MessageSquare,
  Clock,
  History,
  ShieldCheck,
  Send,
  User,
  ArrowRight,
  RefreshCw,
  FileText
} from 'lucide-react';

export const ApprovalWorkflow = () => {
  const { activeSubmissionId, setActiveSubmissionId, currentRole, currentUser, showToast } = useApp();

  const [submissionsList, setSubmissionsList] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Comment input
  const [newComment, setNewComment] = useState('');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [showDecisionModal, setShowDecisionModal] = useState(null); // 'approved' | 'changes_requested' | 'rejected'

  const loadData = async (subId) => {
    try {
      setLoading(true);
      const list = await api.getSubmissions();
      setSubmissionsList(list);
      const id = subId || activeSubmissionId || (list[0] ? list[0].id : null);
      if (id) {
        const detail = await api.getSubmissionDetail(id);
        setData(detail);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading approval workflow', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeSubmissionId);
  }, [activeSubmissionId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await api.addComment(data.submission.id, newComment.trim(), currentRole);
      setNewComment('');
      showToast('Review comment logged');
      loadData(data.submission.id);
    } catch (err) {
      showToast('Failed to post comment', 'error');
    }
  };

  const handleDecision = async (decision) => {
    if (currentRole !== 'reviewer' && currentRole !== 'admin') {
      showToast('Only authorized Reviewers or Administrators can make formal approval decisions.', 'error');
      return;
    }

    try {
      await api.makeDecision(data.submission.id, decision, decisionNotes, currentRole);

      if (decision === 'approved') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        showToast('Content approved and certified for publication!', 'success');
      } else if (decision === 'changes_requested') {
        showToast('Changes requested. Draft returned to creator for revisions.', 'info');
      } else {
        showToast('Content rejected under brand governance policy.', 'error');
      }

      setShowDecisionModal(null);
      setDecisionNotes('');
      loadData(data.submission.id);
    } catch (err) {
      showToast('Failed to record review decision', 'error');
    }
  };

  if (loading || !data) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading Approval Workflow...</p>
        </div>
      </div>
    );
  }

  const { submission, comments, revisions, approvals, findings } = data;

  const getStatusBanner = () => {
    switch (submission.status) {
      case 'approved':
        return (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="text-sm font-semibold text-white">Status: Brand Certified & Approved</h4>
                <p className="text-xs text-slate-300">Authorized by human reviewer. Cleared for external release.</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/40">
              PUBLISH READY
            </span>
          </div>
        );
      case 'changes_requested':
        return (
          <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="text-sm font-semibold text-white">Status: Revisions Requested</h4>
                <p className="text-xs text-slate-300">Reviewer returned content to creator with action items.</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 uppercase px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/40">
              ACTION REQUIRED
            </span>
          </div>
        );
      case 'rejected':
        return (
          <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-400" />
              <div>
                <h4 className="text-sm font-semibold text-white">Status: Content Rejected</h4>
                <p className="text-xs text-slate-300">Draft failed fundamental legal, brand, or factual criteria.</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-red-400 uppercase px-2.5 py-1 rounded bg-red-500/20 border border-red-500/40">
              REJECTED
            </span>
          </div>
        );
      default:
        return (
          <div className="p-4 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-400" />
              <div>
                <h4 className="text-sm font-semibold text-white">Status: Under Human Review</h4>
                <p className="text-xs text-slate-300">Awaiting formal review decision from designated brand reviewer.</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-blue-400 uppercase px-2.5 py-1 rounded bg-blue-500/20 border border-blue-500/40">
              PENDING DECISION
            </span>
          </div>
        );
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner and Submission Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
              Module 06
            </span>
            <span className="text-xs text-slate-400">Human Governance Control Plane</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Review & Approval Workflow</h2>
          <p className="text-xs text-slate-400 mt-1">
            Human-in-the-loop governance. Final publication authority rests solely with authorized personnel.
          </p>
        </div>

        <select
          value={submission.id}
          onChange={(e) => {
            const newId = Number(e.target.value);
            setActiveSubmissionId(newId);
            loadData(newId);
          }}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
        >
          {submissionsList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} ({s.status.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      {/* Mandatory Governance Guardrail Warning Alert */}
      <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <div>
            <span className="text-xs font-semibold text-white">Strict Enterprise Governance Protocol:</span>
            <p className="text-xs text-slate-300">
              AI analysis is advisory and never automatically publishes content. An authorized human reviewer must approve every release.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded border border-indigo-500/30">
          Role: {currentRole.toUpperCase()}
        </span>
      </div>

      {/* Status Banner */}
      {getStatusBanner()}

      {/* Main Grid: Content & Decision (Left) + Reviewer Comments & Revision Timeline (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Review Decision & Active Content */}
        <div className="lg:col-span-7 space-y-6">
          {/* Decision Action Card for Reviewers */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-indigo-400" />
                <span>Reviewer Decision Panel</span>
              </h3>
              <span className="text-xs text-slate-400">Acting as: {currentUser.full_name}</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setShowDecisionModal('approved')}
                className="py-3 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-semibold text-xs flex flex-col items-center gap-1.5 transition-all shadow-sm"
              >
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Approve Content</span>
              </button>

              <button
                onClick={() => setShowDecisionModal('changes_requested')}
                className="py-3 px-4 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 font-semibold text-xs flex flex-col items-center gap-1.5 transition-all shadow-sm"
              >
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Request Changes</span>
              </button>

              <button
                onClick={() => setShowDecisionModal('rejected')}
                className="py-3 px-4 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 font-semibold text-xs flex flex-col items-center gap-1.5 transition-all shadow-sm"
              >
                <XCircle className="w-5 h-5 text-red-400" />
                <span>Reject Draft</span>
              </button>
            </div>
          </div>

          {/* Current Content Text Panel */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Current Revised Copy for Review</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Author: {submission.author_name}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-sm font-sans leading-relaxed text-slate-200 whitespace-pre-wrap min-h-[220px]">
              {submission.current_content}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Category: {submission.category}</span>
              <span>Target: {submission.target_audience}</span>
            </div>
          </div>

          {/* Decision Records Log */}
          {approvals.length > 0 && (
            <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-3">
              <h3 className="text-sm font-semibold text-white">Formal Approval Records</h3>
              <div className="space-y-2">
                {approvals.map((app) => (
                  <div key={app.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{app.reviewer_name}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {new Date(app.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        app.decision === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {app.decision.replace('_', ' ')}
                      </span>
                      <span className="text-slate-300 italic">{app.notes || 'No notes provided'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Reviewer Comments Thread & Revision Audit History */}
        <div className="lg:col-span-5 space-y-6">
          {/* Review Comments Thread */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-6 flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white">Reviewer Discussion Thread</h3>
                </div>
                <span className="text-xs font-mono text-indigo-400">{comments.length} comments</span>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-6">
                    No comments yet. Start the review conversation below.
                  </p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-200">{c.author_name}</span>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {c.author_role}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{c.comment_text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="pt-4 mt-4 border-t border-slate-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Add review comment as ${currentUser.full_name}...`}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

          {/* Revision History Audit Trail */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Revision History Audit Trail</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">v{revisions.length} active</span>
            </div>

            <div className="space-y-3">
              {revisions.map((rev) => (
                <div key={rev.id} className="relative pl-6 border-l-2 border-slate-800 pb-2">
                  <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-indigo-500"></div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white font-mono">Version {rev.version_num}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">{rev.changes_summary}</p>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Responsible: {rev.author_name} ({rev.author_role})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decision Modal */}
      {showDecisionModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-base font-semibold text-white mb-1 capitalize">
              Confirm Decision: {showDecisionModal.replace('_', ' ')}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              This action will record an official decision on behalf of {currentUser.full_name} ({currentRole.toUpperCase()}).
            </p>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Decision Notes / Justification
              </label>
              <textarea
                rows={3}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Add audit notes regarding brand guidelines, legal compliance, or revisions needed..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowDecisionModal(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDecision(showDecisionModal)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg text-white ${
                  showDecisionModal === 'approved'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : showDecisionModal === 'changes_requested'
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                Confirm {showDecisionModal.replace('_', ' ')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
