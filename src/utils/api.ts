/**
 * GramaSeva Portal API Client
 * Provides zero-redundant-network operation for static hosts (GitHub Pages)
 * and seamless fallback to localStorage to minimize data usage.
 */

import { Complaint, ComplaintStatus, CouncilMember } from '../types';
import { getOfficeStatus as calculateLocalOfficeStatus } from './officeHours';
import {
  PANCHAYAT_DIRECTORY,
  INITIAL_COMPLAINTS,
  DEFAULT_GRAM_PANCHAYAT,
  getCouncilMembersForPanchayat,
} from '../data/panchayatData';

export const API_BASE = '/api';

// Detect if running on static host (e.g. GitHub Pages) where backend /api doesn't exist
const isStaticHost =
  typeof window !== 'undefined' &&
  (window.location.hostname.endsWith('github.io') ||
    window.location.hostname === 'localhost' && window.location.port !== '3000' ||
    window.location.protocol === 'file:');

// Cache backend reachability to avoid repeating failed network requests
let backendAvailable: boolean | null = isStaticHost ? false : null;

export const api = {
  // Check backend status without burning repeated requests
  async getHealth() {
    if (backendAvailable === false) {
      return { status: 'offline', mode: 'offline-local' };
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error('Backend offline');
      backendAvailable = true;
      return await res.json();
    } catch (err) {
      backendAvailable = false;
      return { status: 'offline', mode: 'offline-local' };
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
    // If backend is known offline or on static host, load locally to save network data
    if (backendAvailable === false) {
      return { success: true, data: this.getLocalComplaints() };
    }

    try {
      const query = new URLSearchParams(params as any).toString();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${API_BASE}/complaints?${query}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error('Failed to fetch complaints');
      backendAvailable = true;
      return await res.json();
    } catch (err) {
      backendAvailable = false;
      return { success: true, data: this.getLocalComplaints() };
    }
  },

  getLocalComplaints(): Complaint[] {
    try {
      const saved = localStorage.getItem('gp_complaints_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading stored complaints:', e);
    }
    return INITIAL_COMPLAINTS;
  },

  async submitComplaint(complaintData: Partial<Complaint>): Promise<{ success: boolean; data?: Complaint; error?: string }> {
    // Immediately persist to localStorage for instant UI and zero network failure
    try {
      const current = this.getLocalComplaints();
      const newComplaint = complaintData as Complaint;
      const updated = [newComplaint, ...current.filter((c) => c.id !== newComplaint.id)];
      localStorage.setItem('gp_complaints_list', JSON.stringify(updated));
    } catch (e) {
      console.warn('Local complaint save warning:', e);
    }

    if (backendAvailable === false) {
      return { success: true, data: complaintData as Complaint };
    }

    try {
      const res = await fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaintData),
      });
      if (res.ok) {
        backendAvailable = true;
        return await res.json();
      }
    } catch (err: any) {
      backendAvailable = false;
    }
    return { success: true, data: complaintData as Complaint };
  },

  async updateComplaintStatus(
    id: string,
    status: ComplaintStatus,
    notes: string,
    actionOfficer: string
  ): Promise<{ success: boolean; data?: Complaint }> {
    // Update locally first
    try {
      const current = this.getLocalComplaints();
      const target = current.find((c) => c.id === id);
      if (target) {
        target.status = status;
        target.statusHistory.unshift({
          status,
          timestamp: new Date().toISOString(),
          remarks: notes || 'Status updated',
          updatedBy: actionOfficer || 'PDO Officer',
        });
        localStorage.setItem('gp_complaints_list', JSON.stringify(current));
      }
    } catch (e) {
      console.warn('Local status update warning:', e);
    }

    if (backendAvailable === false) {
      return { success: true };
    }

    try {
      const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes, actionOfficer }),
      });
      if (res.ok) {
        backendAvailable = true;
        return await res.json();
      }
    } catch (err) {
      backendAvailable = false;
    }
    return { success: true };
  },

  // Panchayats - Served with zero network payload from bundled dataset
  async getPanchayats(params?: { district?: string; taluk?: string; search?: string }) {
    if (backendAvailable === true) {
      try {
        const query = new URLSearchParams(params as any).toString();
        const res = await fetch(`${API_BASE}/panchayats?${query}`);
        if (res.ok) return await res.json();
      } catch (e) {
        backendAvailable = false;
      }
    }

    // Zero-network fallback
    let list: any[] = [...PANCHAYAT_DIRECTORY];

    if (params?.district) {
      list = list.filter((p) => p.district.toLowerCase() === params.district?.toLowerCase());
    }
    if (params?.taluk) {
      list = list.filter((p) => p.taluk.toLowerCase() === params.taluk?.toLowerCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.nameEn.toLowerCase().includes(q) ||
          p.nameKn.includes(q) ||
          p.code.toLowerCase().includes(q)
      );
    }
    return { success: true, data: list };
  },

  async getCouncil(panchayatId: string): Promise<{ success: boolean; data: CouncilMember[] }> {
    if (backendAvailable === true) {
      try {
        const res = await fetch(`${API_BASE}/panchayats/${encodeURIComponent(panchayatId)}/council`);
        if (res.ok) return await res.json();
      } catch (e) {
        backendAvailable = false;
      }
    }
    const targetGp = PANCHAYAT_DIRECTORY.find((p) => p.id === panchayatId) || DEFAULT_GRAM_PANCHAYAT;
    return { success: true, data: getCouncilMembersForPanchayat(targetGp) };
  },

  // Reports - Computed locally with zero network latency
  async getReportSummary(params?: { timeFrame?: string; village?: string; category?: string }) {
    if (backendAvailable === true) {
      try {
        const query = new URLSearchParams(params as any).toString();
        const res = await fetch(`${API_BASE}/reports/summary?${query}`);
        if (res.ok) return await res.json();
      } catch (e) {
        backendAvailable = false;
      }
    }
    return null;
  },

  // Office Hours - Calculated client-side in IST without network overhead
  async getOfficeStatus() {
    return {
      success: true,
      data: calculateLocalOfficeStatus(new Date()),
    };
  },

  // Document Like
  async likeDocument(docId: string) {
    if (backendAvailable === true) {
      try {
        const res = await fetch(`${API_BASE}/documents/${encodeURIComponent(docId)}/like`, {
          method: 'POST',
        });
        if (res.ok) return await res.json();
      } catch (e) {
        backendAvailable = false;
      }
    }
    return { success: true };
  },
};
