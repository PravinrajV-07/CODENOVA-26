import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
  Check,
  X,
  Edit3,
  RefreshCw,
  Sliders,
  ChevronDown,
  Layers,
  Columns
} from 'lucide-react';

export const ReviewFindings = () => {
  const { activeSubmissionId, setActiveSubmissionId, setActiveTab, showToast, currentRole } = useApp();

  const [submissionsList, setSubmissionsList] = useState([]);
  const [submissionData, setSubmissionData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFindingId, setSelectedFindingId] = useState(null);

  // Manual Edit State
  const [editingContent, setEditingContent] = useState(false);
  const [manualText, setManualText] = useState('');

  // Side-by-side diff mode toggle
  const [showSideBySideDiff, setShowSideBySideDiff] = useState(false);

  const loadSubmissions = async () => {
    try {
      const list = await api.getSubmissions();
      setSubmissionsList(list);
      const targetId = activeSubmissionId || (list[0] ? list[0].id : null);
      if (targetId) {
        loadDetail(targetId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadDetail = async (id) => {
    try {
      setLoading(true);
      const res = await api.getSubmissionDetail(id);
      setSubmissionData(res);
      setManualText(res.submission.current_content);
      if (res.findings && res.findings.length > 0) {
        setSelectedFindingId(res.findings[0].id);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading submission details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [activeSubmissionId]);

  const handleAcceptSuggestion = async (suggestionId) => {
    try {
      const res = await api.acceptSuggestion(suggestionId);
      showToast('Suggestion accepted! Document updated and finding marked resolved.');
      loadDetail(activeSubmissionId);
    } catch (err) {
      showToast('Failed to accept suggestion', 'error');
    }
  };

  const handleRejectSuggestion = async (suggestionId) => {
    try {
      await api.rejectSuggestion(suggestionId);
      showToast('Suggestion dismissed');
      loadDetail(activeSubmissionId);
    } catch (err) {
      showToast('Failed to reject suggestion', 'error');
    }
  };

  const handleSaveManualEdit = async () => {
    try {
      await api.updateContent(activeSubmissionId, manualText, 'Manual revision by editor');
      showToast('Manual revisions saved successfully');
      setEditingContent(false);
      loadDetail(activeSubmissionId);
    } catch (err) {
      showToast('Failed to save manual edits', 'error');
    }
  };

  if (loading || !submissionData) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading explainable governance inspector...</p>
        </div>
      </div>
    );
  }

  const { submission, findings, suggestions } = submissionData;

  const filteredFindings = findings.filter((f) => {
    if (selectedSeverity !== 'all' && f.severity !== selectedSeverity) return false;
    if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;
    return true;
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/30 uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
            Critical Violation
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 uppercase">
            High Severity
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
            Medium
          </span>
        );
      case 'needs_verification':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-purple-400" />
            Needs Verification
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
            Low
          </span>
        );
    }
  };

  // Helper to render interactive highlighted text in the document viewer
  const renderHighlightedContent = () => {
    let content = submission.current_content;
    const parts = [];
    let lastIndex = 0;

    // Collect all passages with findings
    const sortedFindings = [...findings].sort((a, b) => {
      const idxA = content.indexOf(a.original_passage);
      const idxB = content.indexOf(b.original_passage);
      return idxA - idxB;
    });

    for (const f of sortedFindings) {
      const idx = content.indexOf(f.original_passage, lastIndex);
      if (idx !== -1) {
        if (idx > lastIndex) {
          parts.push(
            <span key={`text-${lastIndex}`}>{content.slice(lastIndex, idx)}</span>
          );
        }
        const isSelected = selectedFindingId === f.id;
        const isResolved = f.is_resolved;

        let highlightClass = 'bg-amber-500/20 text-amber-200 border-b-2 border-amber-500';
        if (f.severity === 'critical') highlightClass = 'bg-red-500/25 text-red-200 border-b-2 border-red-500';
        if (f.severity === 'needs_verification') highlightClass = 'bg-purple-500/25 text-purple-200 border-b-2 border-purple-500';
        if (isResolved) highlightClass = 'bg-emerald-500/20 text-emerald-200 line-through opacity-70';

        parts.push(
          <span
            key={`finding-${f.id}`}
            onClick={() => setSelectedFindingId(f.id)}
            className={`cursor-pointer px-1 py-0.5 rounded transition-all font-medium ${highlightClass} ${
              isSelected ? 'ring-2 ring-indigo-400 font-bold' : ''
            }`}
            title={`Click to view issue: ${f.issue_title}`}
          >
            {content.slice(idx, idx + f.original_passage.length)}
          </span>
        );
        lastIndex = idx + f.original_passage.length;
      }
    }

    if (lastIndex < content.length) {
      parts.push(<span key={`text-end`}>{content.slice(lastIndex)}</span>);
    }

    return parts;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
              Module 04 & 05
            </span>
            <span className="text-xs text-slate-400">Explainable Violation Inspector</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">{submission.title}</h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
              {submission.category}
            </span>
          </div>
        </div>

        {/* Switch active submission dropdown & Actions */}
        <div className="flex items-center gap-3">
          <select
            value={activeSubmissionId}
            onChange={(e) => {
              const newId = Number(e.target.value);
              setActiveSubmissionId(newId);
              loadDetail(newId);
            }}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
          >
            {submissionsList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.status.toUpperCase()})
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowSideBySideDiff(!showSideBySideDiff)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
              showSideBySideDiff
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Columns className="w-4 h-4" />
            <span>{showSideBySideDiff ? 'Hide Side-by-Side Diff' : 'Side-by-Side Diff'}</span>
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
          >
            <span>Proceed to Approval</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Compliance Score & Health Bar */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
            <span
              className={`text-xl font-bold font-mono ${
                submission.compliance_score >= 90
                  ? 'text-emerald-400'
                  : submission.compliance_score >= 70
                  ? 'text-amber-400'
                  : 'text-red-400'
              }`}
            >
              {submission.compliance_score.toFixed(0)}%
            </span>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Score</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Brand Alignment Assessment</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {findings.length === 0
                ? 'Zero compliance violations found. Fully approved for release.'
                : `${findings.filter(f => !f.is_resolved).length} unresolved issues require human verification or correction.`}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="needs_verification">Needs Verification</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300"
          >
            <option value="all">All Categories</option>
            <option value="terminology">Terminology</option>
            <option value="unsupported_claim">Unsupported Claims</option>
            <option value="outdated_fact">Outdated Facts</option>
            <option value="tone">Tone & Voice</option>
          </select>
        </div>
      </div>

      {/* Side-by-Side Diff View (Optional Toggle) */}
      {showSideBySideDiff && (
        <div className="glass-panel rounded-2xl border border-indigo-500/30 p-6 bg-slate-900/90 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Columns className="w-4 h-4 text-indigo-400" />
              <span>Original Draft vs Revised Version (Live Comparison)</span>
            </h3>
            <span className="text-xs text-slate-400">Comparing original submission against active revisions</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-950 border border-red-500/20 text-xs font-sans leading-relaxed text-slate-300">
              <span className="text-[11px] font-mono text-red-400 uppercase font-semibold block mb-2">Original Submitted Draft</span>
              <p className="whitespace-pre-wrap">{submission.original_content}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20 text-xs font-sans leading-relaxed text-slate-100">
              <span className="text-[11px] font-mono text-emerald-400 uppercase font-semibold block mb-2">Current Revised Draft</span>
              <p className="whitespace-pre-wrap">{submission.current_content}</p>
            </div>
          </div>
        </div>
      )}

      {/* Split Viewer: Document with Highlighting (Left) + Explainable Finding Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Document Viewer */}
        <div className="lg:col-span-6 glass-panel rounded-2xl border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Interactive Document Viewer</h3>
              </div>
              <button
                onClick={() => setEditingContent(!editingContent)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{editingContent ? 'View Highlights' : 'Edit Manually'}</span>
              </button>
            </div>

            {editingContent ? (
              <div className="space-y-3">
                <textarea
                  rows={14}
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs font-sans text-white focus:outline-none focus:border-indigo-500 leading-relaxed resize-y"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setManualText(submission.current_content);
                      setEditingContent(false);
                    }}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveManualEdit}
                    className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-sm font-sans leading-relaxed text-slate-200 whitespace-pre-wrap min-h-[320px]">
                {renderHighlightedContent()}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Click any highlighted phrase to inspect evidence</span>
            <span className="font-mono text-indigo-400">{findings.length} flags total</span>
          </div>
        </div>

        {/* Right Column: Explainable Findings & Smart Correction Assistant */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              <span>Evidence-Linked Findings ({filteredFindings.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400">Non-guaranteed Advisory</span>
          </div>

          {filteredFindings.length === 0 ? (
            <div className="glass-panel rounded-2xl border border-slate-800 p-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-white">No Issues Match Filters</h4>
              <p className="text-xs text-slate-400 mt-1">Try switching severity or category filters.</p>
            </div>
          ) : (
            filteredFindings.map((finding) => {
              const isSelected = selectedFindingId === finding.id;
              const matchingSuggestion = suggestions.find((s) => s.finding_id === finding.id);

              return (
                <div
                  key={finding.id}
                  onClick={() => setSelectedFindingId(finding.id)}
                  className={`glass-panel rounded-2xl p-5 border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500/80 ring-1 ring-indigo-500/40 bg-slate-900/90 shadow-xl'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(finding.severity)}
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-800">
                        {finding.category.replace('_', ' ')}
                      </span>
                    </div>
                    {finding.is_resolved && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Resolved
                      </span>
                    )}
                  </div>

                  {/* Title & Original Text */}
                  <h4 className="text-sm font-bold text-white mb-1.5">{finding.issue_title}</h4>
                  <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 text-xs font-mono text-red-300 mb-3">
                    <span className="text-[10px] text-slate-500 uppercase block font-sans font-semibold">Flagged Passage:</span>
                    "{finding.original_passage}"
                  </div>

                  {/* Why it Matters */}
                  <div className="mb-3">
                    <span className="text-[11px] font-semibold text-slate-300 block mb-0.5">Why it matters:</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{finding.explanation}</p>
                  </div>

                  {/* Evidence Box */}
                  {finding.reference_title && (
                    <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-3 mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 mb-1">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Supporting Certified Reference: {finding.reference_title}</span>
                      </div>
                      <p className="text-xs text-slate-300 italic">"{finding.evidence_excerpt}"</p>
                    </div>
                  )}

                  {/* Explicit Uncertainty Indicator (Mandatory requirement) */}
                  {finding.uncertainty_note && (
                    <div className="bg-purple-950/25 border border-purple-500/20 rounded-xl p-3 mb-3 text-xs text-purple-200">
                      <div className="flex items-center gap-1.5 font-semibold text-purple-300 mb-1">
                        <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                        <span>Uncertainty & Verification Disclosure</span>
                      </div>
                      <p className="leading-relaxed">{finding.uncertainty_note}</p>
                    </div>
                  )}

                  {/* Recommended Action */}
                  <div className="mb-4 text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Recommended Action: </span>
                    {finding.recommended_action}
                  </div>

                  {/* Smart Correction Assistant Card */}
                  {matchingSuggestion && !finding.is_resolved && (
                    <div className="bg-gradient-to-r from-slate-950 via-indigo-950/20 to-slate-950 border border-indigo-500/30 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Smart Correction Assistant
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">Preserves Intent</span>
                      </div>

                      <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 text-xs text-emerald-300 font-mono">
                        "{matchingSuggestion.suggested_replacement}"
                      </div>

                      <p className="text-[11px] text-slate-400 leading-tight">
                        <span className="font-semibold text-slate-300">Rationale: </span>
                        {matchingSuggestion.rationale}
                      </p>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => handleRejectSuggestion(matchingSuggestion.id)}
                          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg border border-slate-800"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAcceptSuggestion(matchingSuggestion.id)}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Correction</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
