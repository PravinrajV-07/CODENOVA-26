import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  BookOpen,
  FileText,
  Upload,
  Plus,
  Trash2,
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Mic,
  Tag,
  Filter,
  RefreshCw,
  ExternalLink,
  X
} from 'lucide-react';

export const BrandKnowledgeBase = () => {
  const { currentRole, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('guidelines'); // guidelines, facts, terminology, tone, messaging
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Data states
  const [guidelines, setGuidelines] = useState([]);
  const [facts, setFacts] = useState([]);
  const [terminologies, setTerminologies] = useState([]);
  const [tones, setTones] = useState([]);
  const [messaging, setMessaging] = useState([]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    content: '',
    source_title: '',
    tags: '',
    // Fact fields
    claim: '',
    approved_wording: '',
    verification_source: '',
    // Term fields
    term: '',
    term_type: 'prohibited',
    replacement_suggestion: '',
    rationale: '',
    // Tone fields
    dimension_name: '',
    positive_examples: '',
    negative_examples: '',
    // Messaging fields
    message_type: 'Tagline',
    approved_copy: '',
    audience: 'All Audiences'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'guidelines') {
        const res = await api.getGuidelines(null, search);
        setGuidelines(res);
      } else if (activeTab === 'facts') {
        const res = await api.getFacts(null, search);
        setFacts(res);
      } else if (activeTab === 'terminology') {
        const res = await api.getTerminology(null, search);
        setTerminologies(res);
      } else if (activeTab === 'tone') {
        const res = await api.getTone();
        setTones(res);
      } else if (activeTab === 'messaging') {
        const res = await api.getMessaging();
        setMessaging(res);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading knowledge data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, search]);

  const handleDelete = async (id) => {
    if (currentRole !== 'admin') {
      showToast('Only Administrators can delete brand knowledge references.', 'error');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this reference?')) return;

    try {
      if (activeTab === 'guidelines') await api.deleteGuideline(id);
      if (activeTab === 'facts') await api.deleteFact(id);
      if (activeTab === 'terminology') await api.deleteTerminology(id);
      showToast('Reference deleted successfully');
      loadData();
    } catch (err) {
      showToast('Failed to delete item', 'error');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (currentRole !== 'admin') {
      showToast('Only Administrators can manage brand knowledge references.', 'error');
      return;
    }

    try {
      if (activeTab === 'guidelines') {
        await api.createGuideline({
          title: formData.title,
          category: formData.category,
          content: formData.content,
          source_title: formData.source_title,
          tags: formData.tags
        });
      } else if (activeTab === 'facts') {
        await api.createFact({
          claim: formData.claim,
          category: formData.category,
          approved_wording: formData.approved_wording,
          verification_source: formData.verification_source
        });
      } else if (activeTab === 'terminology') {
        await api.createTerminology({
          term: formData.term,
          term_type: formData.term_type,
          replacement_suggestion: formData.replacement_suggestion,
          rationale: formData.rationale
        });
      }
      showToast('Reference added to Brand Knowledge Base!');
      setShowAddModal(false);
      loadData();
    } catch (err) {
      showToast('Failed to save reference', 'error');
    }
  };

  const handleUploadPdf = async (e) => {
    e.preventDefault();
    if (!pdfFile) return;

    try {
      setPdfUploading(true);
      const fd = new FormData();
      fd.append('file', pdfFile);
      fd.append('category', 'Brand Guidelines (PDF)');
      const res = await api.uploadGuidelinePdf(fd);
      showToast(`Parsed PDF with PyMuPDF! Extracted ${res.extraction_summary?.total_pages || 1} pages.`);
      setShowPdfModal(false);
      setPdfFile(null);
      loadData();
    } catch (err) {
      showToast('Failed to upload and extract PDF', 'error');
    } finally {
      setPdfUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
              Module 02
            </span>
            <span className="text-xs text-slate-400">Single Source of Brand Truth</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Approved Brand Knowledge Base</h2>
          <p className="text-xs text-slate-400 mt-1">
            Certified guidelines, facts, terminology, and messaging that AI and human reviewers evaluate against.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPdfModal(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Upload Guideline PDF</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Brand Reference</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'guidelines', label: 'Brand Guidelines & PDFs', icon: BookOpen },
          { id: 'facts', label: 'Approved Brand Facts', icon: ShieldCheck },
          { id: 'terminology', label: 'Terminology Matrix', icon: Tag },
          { id: 'tone', label: 'Tone & Voice Standards', icon: Mic },
          { id: 'messaging', label: 'Approved Messaging', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearch('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600/20 text-white border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder={`Search ${activeTab.replace('_', ' ')} by keyword, source, or title...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="p-12 flex justify-center items-center">
          <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Guidelines Tab */}
          {activeTab === 'guidelines' &&
            guidelines.map((g) => (
              <div key={g.id} className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
                      {g.category}
                    </span>
                    {currentRole === 'admin' && (
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{g.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">{g.content}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[180px]">{g.source_title || 'Apex Brand Book'}</span>
                  <span>{new Date(g.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}

          {/* Facts Tab */}
          {activeTab === 'facts' &&
            facts.map((f) => (
              <div key={f.id} className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
                      {f.category}
                    </span>
                    {currentRole === 'admin' && (
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1.5">{f.claim}</h3>
                  <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800 text-xs text-emerald-300 font-mono">
                    "{f.approved_wording}"
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                  <span className="truncate">Source: {f.verification_source}</span>
                  <span className="text-emerald-400 font-medium">Verified</span>
                </div>
              </div>
            ))}

          {/* Terminology Tab */}
          {activeTab === 'terminology' &&
            terminologies.map((t) => {
              const isProhibited = t.term_type === 'prohibited';
              return (
                <div key={t.id} className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        isProhibited
                          ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {isProhibited ? 'PROHIBITED TERM' : 'PREFERRED TERM'}
                      </span>
                      {currentRole === 'admin' && (
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="mb-2">
                      <span className="text-base font-bold text-white font-mono">{t.term}</span>
                    </div>

                    {isProhibited && t.replacement_suggestion && (
                      <div className="mb-3 text-xs">
                        <span className="text-slate-400">Use instead: </span>
                        <span className="text-emerald-400 font-medium font-mono">{t.replacement_suggestion}</span>
                      </div>
                    )}

                    <p className="text-xs text-slate-300 leading-relaxed">{t.rationale}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Policy rule</span>
                    <span>Updated {new Date(t.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}

          {/* Tone & Voice Tab */}
          {activeTab === 'tone' &&
            tones.map((tv) => (
              <div key={tv.id} className="glass-panel rounded-2xl p-5 border border-slate-800 col-span-1 md:col-span-2 lg:col-span-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white">{tv.dimension_name}</h3>
                </div>
                <p className="text-xs text-slate-300">{tv.guidelines}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                    <span className="font-semibold text-emerald-400 block mb-1">Approved Style (Positive Example):</span>
                    <p className="text-slate-200 italic">"{tv.positive_examples}"</p>
                  </div>
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs">
                    <span className="font-semibold text-red-400 block mb-1">Violates Voice (Negative Example):</span>
                    <p className="text-slate-200 italic">"{tv.negative_examples}"</p>
                  </div>
                </div>
              </div>
            ))}

          {/* Messaging Tab */}
          {activeTab === 'messaging' &&
            messaging.map((m) => (
              <div key={m.id} className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold mb-2 inline-block">
                    {m.message_type}
                  </span>
                  <h3 className="text-sm font-semibold text-white mb-2">{m.title}</h3>
                  <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-xs text-indigo-200 font-sans italic mb-3">
                    "{m.approved_copy}"
                  </div>
                  <p className="text-xs text-slate-400">Context: {m.context}</p>
                </div>
                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500">
                  Target Audience: {m.audience}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* PDF Upload Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setShowPdfModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                <Upload className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Upload Brand Guideline PDF</h3>
                <p className="text-xs text-slate-400">PyMuPDF will extract and index guideline text</p>
              </div>
            </div>

            <form onSubmit={handleUploadPdf}>
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-indigo-500/50 transition-colors mb-4">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files[0])}
                  className="hidden"
                  id="pdfUploadInput"
                />
                <label htmlFor="pdfUploadInput" className="cursor-pointer flex flex-col items-center">
                  <FileText className="w-10 h-10 text-indigo-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-200">
                    {pdfFile ? pdfFile.name : 'Click to select a brand guideline PDF'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">Supported text-based PDF up to 25MB</span>
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPdfModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!pdfFile || pdfUploading}
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {pdfUploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting with PyMuPDF...</span>
                    </>
                  ) : (
                    <span>Upload & Ingest</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Reference Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-semibold text-white mb-1">Add Approved Brand Reference</h3>
            <p className="text-xs text-slate-400 mb-4">Target Tab: <span className="text-indigo-400 capitalize">{activeTab}</span></p>

            <form onSubmit={handleCreate} className="space-y-4">
              {activeTab === 'guidelines' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Guideline Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Editorial Tone for Executive Briefs"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Voice, Visual, Legal, Positioning"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Guideline Content / Rules</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Specify approved guidelines..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Source Documentation Title</label>
                    <input
                      type="text"
                      value={formData.source_title}
                      onChange={(e) => setFormData({ ...formData, source_title: e.target.value })}
                      placeholder="e.g., Brand Book v4.2"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </>
              )}

              {activeTab === 'facts' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Fact / Claim Topic</label>
                    <input
                      type="text"
                      required
                      value={formData.claim}
                      onChange={(e) => setFormData({ ...formData, claim: e.target.value })}
                      placeholder="e.g., Platform SLA Guarantee"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Metrics, Security, History"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Approved Wording</label>
                    <textarea
                      required
                      rows={3}
                      value={formData.approved_wording}
                      onChange={(e) => setFormData({ ...formData, approved_wording: e.target.value })}
                      placeholder="Official certified phrasing, e.g. 99.95% uptime SLA..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Verification Source</label>
                    <input
                      type="text"
                      required
                      value={formData.verification_source}
                      onChange={(e) => setFormData({ ...formData, verification_source: e.target.value })}
                      placeholder="e.g., SEC Form D, SOC2 Audit 2026"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </>
              )}

              {activeTab === 'terminology' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Word or Phrase</label>
                    <input
                      type="text"
                      required
                      value={formData.term}
                      onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                      placeholder="e.g., foolproof"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Classification</label>
                    <select
                      value={formData.term_type}
                      onChange={(e) => setFormData({ ...formData, term_type: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      <option value="prohibited">Prohibited Term</option>
                      <option value="preferred">Preferred Term</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Alternative</label>
                    <input
                      type="text"
                      value={formData.replacement_suggestion}
                      onChange={(e) => setFormData({ ...formData, replacement_suggestion: e.target.value })}
                      placeholder="e.g., intuitive and error-preventing"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Policy Rationale</label>
                    <textarea
                      rows={3}
                      value={formData.rationale}
                      onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
                      placeholder="Why this word is prohibited or preferred..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
                >
                  Save Reference
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
