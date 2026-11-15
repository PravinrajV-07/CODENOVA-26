import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSubmissionId, setActiveSubmissionId] = useState(1);

  // Authentication & Active Role (admin, creator, reviewer)
  const [currentRole, setCurrentRole] = useState('admin');
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    full_name: 'Sarah Lin',
    email: 'sarah.lin@apexcloud.io',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  });

  // Available sample users
  const roleUsers = {
    admin: {
      id: 1,
      full_name: 'Sarah Lin',
      email: 'sarah.lin@apexcloud.io',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      title: 'VP of Brand Governance'
    },
    creator: {
      id: 2,
      full_name: 'Elena Rostova',
      email: 'elena.rostova@apexcloud.io',
      role: 'creator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      title: 'Senior Content Strategist'
    },
    reviewer: {
      id: 3,
      full_name: 'Marcus Vance',
      email: 'marcus.vance@apexcloud.io',
      role: 'reviewer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      title: 'Brand Compliance Director'
    }
  };

  // Workspace
  const [workspace, setWorkspace] = useState({
    id: 1,
    name: 'ApexCloud Technologies',
    slug: 'apexcloud-global',
    description: 'Enterprise AI & Cloud Governance'
  });

  // AI Configuration
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('brandcue_gemini_key') || '');
  const [engineStatus, setEngineStatus] = useState(geminiApiKey ? 'Gemini 1.5 Flash (Live AI)' : 'BrandCue Explainable Engine (Local)');

  // Notification Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Switch Role handler
  const switchRole = (role) => {
    setCurrentRole(role);
    setCurrentUser(roleUsers[role]);
    showToast(`Switched active role to ${role.toUpperCase()} (${roleUsers[role].full_name})`, 'info');
  };

  const saveGeminiKey = (key) => {
    setGeminiApiKey(key);
    if (key) {
      localStorage.setItem('brandcue_gemini_key', key);
      setEngineStatus('Gemini 1.5 Flash (Live AI)');
      showToast('Gemini API key configured successfully!', 'success');
    } else {
      localStorage.removeItem('brandcue_gemini_key');
      setEngineStatus('BrandCue Explainable Engine (Local)');
      showToast('Switched to Local Explainable Governance Engine', 'info');
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeSubmissionId,
        setActiveSubmissionId,
        currentRole,
        switchRole,
        currentUser,
        workspace,
        geminiApiKey,
        saveGeminiKey,
        engineStatus,
        toast,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
