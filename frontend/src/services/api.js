const API_BASE = '/api';

export const api = {
  // Knowledge Base
  async getKnowledgeOverview() {
    const res = await fetch(`${API_BASE}/knowledge/overview`);
    return res.json();
  },
  async getGuidelines(category, search) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/knowledge/guidelines?${params}`);
    return res.json();
  },
  async createGuideline(data) {
    const res = await fetch(`${API_BASE}/knowledge/guidelines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteGuideline(id) {
    const res = await fetch(`${API_BASE}/knowledge/guidelines/${id}`, { method: 'DELETE' });
    return res.json();
  },
  async uploadGuidelinePdf(formData) {
    const res = await fetch(`${API_BASE}/knowledge/upload-guideline-pdf`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },
  async getFacts(category, search) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/knowledge/facts?${params}`);
    return res.json();
  },
  async createFact(data) {
    const res = await fetch(`${API_BASE}/knowledge/facts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteFact(id) {
    const res = await fetch(`${API_BASE}/knowledge/facts/${id}`, { method: 'DELETE' });
    return res.json();
  },
  async getTerminology(termType, search) {
    const params = new URLSearchParams();
    if (termType) params.append('term_type', termType);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/knowledge/terminology?${params}`);
    return res.json();
  },
  async createTerminology(data) {
    const res = await fetch(`${API_BASE}/knowledge/terminology`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteTerminology(id) {
    const res = await fetch(`${API_BASE}/knowledge/terminology/${id}`, { method: 'DELETE' });
    return res.json();
  },
  async getTone() {
    const res = await fetch(`${API_BASE}/knowledge/tone`);
    return res.json();
  },
  async getMessaging() {
    const res = await fetch(`${API_BASE}/knowledge/messaging`);
    return res.json();
  },

  // Submissions & Analyzer
  async getSubmissions(status, category) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    const res = await fetch(`${API_BASE}/submissions?${params}`);
    return res.json();
  },
  async getSubmissionDetail(id) {
    const res = await fetch(`${API_BASE}/submissions/${id}`);
    return res.json();
  },
  async submitText(data) {
    const res = await fetch(`${API_BASE}/submissions/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async submitPdf(formData) {
    const res = await fetch(`${API_BASE}/submissions/pdf`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },
  async runAnalysis(submissionId, apiKey = null) {
    const headers = {};
    if (apiKey) headers['x-gemini-api-key'] = apiKey;
    const res = await fetch(`${API_BASE}/analysis/${submissionId}/run`, {
      method: 'POST',
      headers
    });
    return res.json();
  },
  async updateContent(id, content, changesSummary = null) {
    const res = await fetch(`${API_BASE}/submissions/${id}/content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, changes_summary: changesSummary })
    });
    return res.json();
  },

  // Smart Suggestions
  async acceptSuggestion(suggestionId) {
    const res = await fetch(`${API_BASE}/suggestions/${suggestionId}/accept`, { method: 'POST' });
    return res.json();
  },
  async rejectSuggestion(suggestionId) {
    const res = await fetch(`${API_BASE}/suggestions/${suggestionId}/reject`, { method: 'POST' });
    return res.json();
  },

  // Reviews & Comments
  async addComment(submissionId, commentText, userRole = 'reviewer') {
    const res = await fetch(`${API_BASE}/submissions/${submissionId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole
      },
      body: JSON.stringify({ comment_text: commentText })
    });
    return res.json();
  },
  async makeDecision(submissionId, decision, notes = '', userRole = 'reviewer') {
    const res = await fetch(`${API_BASE}/submissions/${submissionId}/decision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole
      },
      body: JSON.stringify({ decision, notes })
    });
    return res.json();
  },

  // Analytics
  async getDashboardAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/dashboard`);
    return res.json();
  },
  async getGovernanceInsights() {
    const res = await fetch(`${API_BASE}/analytics/governance-insights`);
    return res.json();
  }
};
