/**
 * GramaSeva Portal API Client
 * Provides communication with backend /api/* routes
 * Includes offline resilience and fallback to localStorage.
 */

import { Complaint, ComplaintStatus, GramPanchayatInfo, CouncilMember } from '../types';

export const API_BASE = '/api';

export const api = {
  // Check backend status
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) throw new Error('Backend offline');
      return await res.json();
    } catch (err) {
      console.warn('[API] Health check failed, running in local mode:', err);
      return null;
    }
  },

  // Complaints
  async getComplaints(params?: {
    panchayatId?: string;
    village?: string;
    category?: string;
    status?: string;
    search?: string;
  }): Promise<{ success: boolean; data: Complaint[] }> {
    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE}/complaints?${query}`);
      if (!res.ok) throw new Error('Failed to fetch complaints');
      return await res.json();
    } catch (err) {
      console.warn('[API] Fetching from local storage fallback:', err);
      let data: Complaint[] = [];
      try {
        const saved = localStorage.getItem('gp_complaints_list');
        if (saved) data = JSON.parse(saved);
      } catch (parseErr) {
        console.warn('Failed to parse complaints fallback:', parseErr);
      }
      return { success: true, data };
    }
  },

  async submitComplaint(complaintData: Partial<Complaint>): Promise<{ success: boolean; data?: Complaint; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaintData),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to submit grievance');
      }
      return json;
    } catch (err: any) {
      console.warn('[API] Network submit failed, returning error or fallback:', err);
      return { success: false, error: err.message || 'Network error' };
    }
  },

  async updateComplaintStatus(
    id: string,
    status: ComplaintStatus,
    notes: string,
    actionOfficer: string
  ): Promise<{ success: boolean; data?: Complaint }> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes, actionOfficer }),
      });
      if (!res.ok) throw new Error('Status update failed');
      return await res.json();
    } catch (err) {
      console.warn('[API] Status update network failure:', err);
      return { success: false };
    }
  },

  // Panchayats
  async getPanchayats(params?: { district?: string; taluk?: string; search?: string }) {
    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE}/panchayats?${query}`);
      if (!res.ok) throw new Error('Failed to fetch panchayats');
      return await res.json();
    } catch (err) {
      return { success: false, data: [] };
    }
  },

  async getCouncil(panchayatId: string): Promise<{ success: boolean; data: CouncilMember[] }> {
    try {
      const res = await fetch(`${API_BASE}/panchayats/${encodeURIComponent(panchayatId)}/council`);
      if (!res.ok) throw new Error('Failed to fetch council');
      return await res.json();
    } catch (err) {
      return { success: false, data: [] };
    }
  },

  // Reports
  async getReportSummary(params?: { timeFrame?: string; village?: string; category?: string }) {
    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE}/reports/summary?${query}`);
      if (!res.ok) throw new Error('Failed to fetch report');
      return await res.json();
    } catch (err) {
      return null;
    }
  },

  // Office Hours
  async getOfficeStatus() {
    try {
      const res = await fetch(`${API_BASE}/office-status`);
      if (!res.ok) throw new Error('Failed to fetch office status');
      return await res.json();
    } catch (err) {
      return null;
    }
  },

  // Document Like
  async likeDocument(docId: string) {
    try {
      const res = await fetch(`${API_BASE}/documents/${encodeURIComponent(docId)}/like`, {
        method: 'POST',
      });
      return await res.json();
    } catch (err) {
      return null;
    }
  },
};
