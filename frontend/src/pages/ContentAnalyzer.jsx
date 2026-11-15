import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  FileText,
  Upload,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
  FileCheck,
  Search,
  BookOpen
} from 'lucide-react';

export const ContentAnalyzer = () => {
  const { setActiveTab, setActiveSubmissionId, geminiApiKey, showToast } = useApp();

  const [inputMode, setInputMode] = useState('text'); // 'text' | 'pdf'
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Press Release');
  const [targetAudience, setTargetAudience] = useState('Enterprise IT Leaders & CTOs');
  const [content, setContent] = useState('');
  const [pdfFile, setPdfFile] = useState(null);

  // Live multi-step pipeline state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedAnalysis, setCompletedAnalysis] = useState(null);

  const steps = [
    { title: 'Uploading Content', desc: 'Securely staging payload to workspace repository' },
    { title: 'Extracting Text & Structure', desc: 'Parsing content blocks and sentence syntax' },
    { title: 'Querying Brand Knowledge Base', desc: 'Retrieving certified facts, guidelines & terminology rules' },
    { title: 'AI Governance Deep Analysis', desc: 'Evaluating tone, superlatives, SLA validity & policy compliance' },
    { title: 'Synthesizing Explainable Findings', desc: 'Linking evidence citations & smart correction suggestions' }
  ];

  // Helper to load sample test draft
  const handleLoadSample = () => {
    setTitle('Press Release: ApexCloud NextGen Launch');
    setCategory('Press Release');
    setTargetAudience('Global Financial Institutions');
    setContent(`ApexCloud is proud to announce CloudMesh 2.0, the best in the world cloud orchestration platform.
Our groundbreaking solution is completely foolproof and delivers a 100% bug-free deployment pipeline that completely crushes the competition.
Unlike legacy providers that charge exorbitant fees, our platform is super cheap and guarantees a 99.999% uptime SLA for every single workload.
Founded in 2018, we have helped hundreds of organizations modernize their stacks with bulletproof reliability.`);
    showToast('Loaded sample draft with intentional brand violations for demonstration!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (inputMode === 'text' && !content.trim()) {
      showToast('Please enter text content to analyze.', 'error');
      return;
    }
    if (inputMode === 'pdf' && !pdfFile) {
      showToast('Please select a PDF file to analyze.', 'error');
      return;
    }

    try {
      setIsAnalyzing(true);
      setCurrentStep(0); // Step 1: Uploading

      let submissionRecord = null;

      if (inputMode === 'text') {
        setCurrentStep(1); // Step 2: Extracting
        const res = await api.submitText({
          title: title || 'Untitled Governance Draft',
          category,
          target_audience: targetAudience,
          content
        });
        submissionRecord = res;
      } else {
        const fd = new FormData();
        fd.append('file', pdfFile);
        fd.append('title', title || pdfFile.name.replace('.pdf', ''));
        fd.append('category', category);
        fd.append('target_audience', targetAudience);
        const res = await api.submitPdf(fd);
        submissionRecord = res;
      }

      // Step 3: Querying Brand Knowledge Base
      setCurrentStep(2);
      await new Promise(r => setTimeout(r, 600));

      // Step 4: AI Deep Governance Analysis
      setCurrentStep(3);
      const analysisResult = await api.runAnalysis(submissionRecord.id, geminiApiKey);

      // Step 5: Synthesizing findings
      setCurrentStep(4);
      await new Promise(r => setTimeout(r, 600));

      setCompletedAnalysis({
        submission: submissionRecord,
        result: analysisResult
      });
      setActiveSubmissionId(submissionRecord.id);
      showToast(`Analysis completed! Found ${analysisResult.findings_count} governance findings.`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Analysis error occurred. Please try again.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
              Module 03
            </span>
            <span className="text-xs text-slate-400">Intelligent Pre-Publication Verification</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">AI Content Analyzer</h2>
          <p className="text-xs text-slate-400 mt-1">
            Submit editorial drafts, ad campaigns, or PDFs for deep verification against certified guidelines.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Load Sample Draft with Violations</span>
        </button>
      </div>

      {/* Main Submission Form */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Content Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Q4 Enterprise Launch Announcement"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Press Release">Press Release</option>
                <option value="Blog Post">Blog Post</option>
                <option value="Product Spec">Product Documentation</option>
                <option value="Marketing Copy">Marketing Copy</option>
                <option value="Ad Campaign">Ad Campaign</option>
                <option value="Email Newsletter">Email Newsletter</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Target Audience
              </label>
              <input
                type="text"
                placeholder="e.g., Enterprise Decision Makers"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Mode Switcher: Text Editor vs PDF Upload */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setInputMode('text')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                inputMode === 'text'
                  ? 'bg-indigo-600/20 text-white border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Direct Text Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('pdf')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                inputMode === 'pdf'
                  ? 'bg-indigo-600/20 text-white border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>PDF Document Upload (PyMuPDF)</span>
            </button>
          </div>

          {/* Editor Body */}
          {inputMode === 'text' ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Draft Content
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  {content.length} characters • {content.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                rows={10}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste or draft your article, announcement, or ad copy here..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed resize-y"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-700/80 rounded-2xl p-8 text-center hover:border-indigo-500/50 transition-colors bg-slate-950/40">
              <input
                type="file"
                accept=".pdf"
                id="pdfSubmitFile"
                onChange={(e) => setPdfFile(e.target.files[0])}
                className="hidden"
              />
              <label htmlFor="pdfSubmitFile" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-12 h-12 text-indigo-400 mb-3" />
                <span className="text-sm font-semibold text-slate-200">
                  {pdfFile ? pdfFile.name : 'Upload PDF draft document'}
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  PyMuPDF extracts clean text, preserving headers, paragraphs, and structure.
                </span>
              </label>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Checks against ApexCloud Brand Book v4.2 & Master SLA</span>
            </div>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzing ? 'Analyzing in Progress...' : 'Run BrandCue Governance Analysis'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Live Multi-Stage Processing Pipeline Visualizer */}
      {isAnalyzing && (
        <div className="glass-panel rounded-2xl border border-indigo-500/30 p-6 bg-slate-900/90 shadow-2xl space-y-4 pulse-glow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
              <h3 className="text-sm font-semibold text-white">Live Brand Governance Pipeline</h3>
            </div>
            <span className="text-xs font-mono text-indigo-400">
              Stage {currentStep + 1} of {steps.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
            {steps.map((step, idx) => {
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    isCurrent
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                      : isPast
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {isPast ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : isCurrent ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full bg-slate-800 font-mono text-[9px] flex items-center justify-center text-slate-400">
                        {idx + 1}
                      </span>
                    )}
                    <span className="font-semibold truncate">{step.title}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Callout */}
      {completedAnalysis && !isAnalyzing && (
        <div className="glass-panel rounded-2xl border border-emerald-500/40 p-6 bg-emerald-950/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Governance Analysis Complete</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Evaluated "{completedAnalysis.submission.title}" with a compliance score of{' '}
                <span className="font-bold text-indigo-400 font-mono">
                  {completedAnalysis.result.analysis?.compliance_score}%
                </span>
                . {completedAnalysis.result.findings_count} actionable findings generated.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('findings')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all whitespace-nowrap"
          >
            <span>Inspect Explainable Findings & Corrections</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
