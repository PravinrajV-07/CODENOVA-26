import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Key,
  ShieldCheck,
  Bell,
  Search,
  ExternalLink,
  Cpu,
  CheckCircle2,
  X
} from 'lucide-react';

export const Header = () => {
  const {
    activeTab,
    setActiveTab,
    engineStatus,
    geminiApiKey,
    saveGeminiKey,
    currentUser,
    currentRole
  } = useApp();

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState(geminiApiKey);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Executive Governance Dashboard';
      case 'knowledge': return 'Brand Knowledge Base & Asset Repository';
      case 'analyzer': return 'AI Content Analyzer & PDF Ingestion';
      case 'findings': return 'Explainable Violation Detector & Evidence';
      case 'workflow': return 'Human-in-the-Loop Review & Approval';
      case 'insights': return 'Governance Insights & Analytics';
      case 'team': return 'Team Members & Permissions';
      case 'settings': return 'Platform Settings & AI Governance';
      default: return 'BrandCue AI';
    }
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    saveGeminiKey(inputKey.trim());
    setShowKeyModal(false);
  };

  return (
    <>
      <header className="h-16 bg-[#0c1222]/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20 px-6 flex items-center justify-between">
        {/* Title and breadcrumb */}
        <div>
          <h1 className="text-base font-semibold text-white tracking-tight">{getPageTitle()}</h1>
          <p className="text-xs text-slate-400">ApexCloud Global Governance • Policy v4.2 Active</p>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* AI Engine Status Button */}
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-indigo-500/50 transition-all text-xs text-slate-300"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono text-[11px] font-medium">{engineStatus}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </button>

          {/* Quick Submit Button */}
          <button
            onClick={() => setActiveTab('analyzer')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analyze New Content</span>
          </button>
        </div>
      </header>

      {/* Gemini API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setShowKeyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                <Key className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Gemini AI Configuration</h3>
                <p className="text-xs text-slate-400">Optionally connect your live Google Gemini API key</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              BrandCue AI includes a high-performance **Local Explainable Governance Engine** that runs offline using deterministic knowledge base rules, terminology matrices, and factual verification.
              <br /><br />
              If you wish to run with **Live Gemini 1.5 Flash**, enter your API key below:
            </p>

            <form onSubmit={handleSaveKey}>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setInputKey('');
                    saveGeminiKey('');
                    setShowKeyModal(false);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 underline"
                >
                  Clear key (Use Local Engine)
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg border border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all"
                  >
                    Save & Activate
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
