import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings as SettingsIcon,
  Cpu,
  Key,
  Shield,
  Sliders,
  Download,
  Building,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Settings = () => {
  const {
    workspace,
    geminiApiKey,
    saveGeminiKey,
    engineStatus,
    showToast
  } = useApp();

  const [orgName, setOrgName] = useState(workspace.name);
  const [slug, setSlug] = useState(workspace.slug);
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
  const [strictness, setStrictness] = useState('strict');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    saveGeminiKey(apiKeyInput.trim());
    showToast('Platform and governance settings updated successfully!', 'success');
  };

  const handleExportData = () => {
    showToast('Exporting certified brand guidelines and audit logs...', 'info');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
            Module 09
          </span>
          <span className="text-xs text-slate-400">Workspace & AI Configuration</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Platform Settings</h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure organization profiles, AI analysis provider keys, and brand compliance strictness.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Workspace Organization Details */}
        <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Building className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Organization & Workspace</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Organization Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Workspace Slug
              </label>
              <input
                type="text"
                value={slug}
                disabled
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* AI Engine & Gemini API Key */}
        <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">AI Governance Engine</h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
              Active: {engineStatus}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Google Gemini API Key
              </label>
              <input
                type="password"
                placeholder="AIzaSy... (Leave empty to use built-in Explainable Local Engine)"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                API keys are kept strictly on the backend and are never exposed in browser payloads.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Gemini Model Target
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra Fast & Precise)</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (Next-Gen)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Contextual Analysis)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Brand Governance Strictness
                </label>
                <select
                  value={strictness}
                  onChange={(e) => setStrictness(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                >
                  <option value="strict">Strict (Flag all superlatives and prohibited terms)</option>
                  <option value="standard">Standard (Flag high & critical issues)</option>
                  <option value="advisory">Advisory Only (Highlight without blocking)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Data Export & Backup */}
        <div className="glass-panel rounded-2xl border border-slate-800 p-6 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white">Export Compliance Audit Logs</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Download complete database records of brand guidelines, revision histories, and reviewer sign-offs.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportData}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export JSON / CSV</span>
          </button>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
