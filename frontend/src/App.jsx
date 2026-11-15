import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardOverview } from './pages/DashboardOverview';
import { BrandKnowledgeBase } from './pages/BrandKnowledgeBase';
import { ContentAnalyzer } from './pages/ContentAnalyzer';
import { ReviewFindings } from './pages/ReviewFindings';
import { ApprovalWorkflow } from './pages/ApprovalWorkflow';
import { GovernanceInsights } from './pages/GovernanceInsights';
import { TeamManagement } from './pages/TeamManagement';
import { Settings } from './pages/Settings';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const MainContent = () => {
  const { activeTab, toast } = useApp();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'knowledge':
        return <BrandKnowledgeBase />;
      case 'analyzer':
        return <ContentAnalyzer />;
      case 'findings':
        return <ReviewFindings />;
      case 'workflow':
        return <ApprovalWorkflow />;
      case 'insights':
        return <GovernanceInsights />;
      case 'team':
        return <TeamManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#080c14] text-slate-100 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto pb-12">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="glass-panel rounded-xl px-4 py-3 border border-indigo-500/40 shadow-2xl flex items-center gap-2.5 text-xs text-white bg-slate-900/95">
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400" />
            ) : toast.type === 'info' ? (
              <Info className="w-4 h-4 text-blue-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
