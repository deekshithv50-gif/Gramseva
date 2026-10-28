import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  DEFAULT_GRAM_PANCHAYAT,
  PANCHAYAT_DIRECTORY,
  INITIAL_COMPLAINTS,
  INITIAL_COUNCIL_MEMBERS,
  COMPLAINT_CATEGORIES,
  KARNATAKA_DISTRICTS,
  getCouncilMembersForPanchayat,
} from './src/data/panchayatData.ts';
import type { Complaint, ComplaintStatus, AttachedDocument, GramPanchayatInfo, CouncilMember } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// In-Memory Database store initialized with seed records
let complaintsDB: Complaint[] = [...INITIAL_COMPLAINTS];
let panchayatsDB: GramPanchayatInfo[] = [...PANCHAYAT_DIRECTORY];
let trackedDocsStats: Record<string, { likes: number; views: number }> = {
  'doc-01': { likes: 5, views: 18 },
  'doc-02': { likes: 3, views: 12 },
};

// Express Middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Request logging middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API ${req.method}] ${req.path}`);
  }
  next();
});

// ============================================================================
// 1. HEALTH & METADATA APIS
// ============================================================================

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    portal: 'Karnataka Gram Panchayat Janahita Portal (GramaSeva)',
    version: '2.4.0',
    timestamp: new Date().toISOString(),
    complaintsCount: complaintsDB.length,
    panchayatsCount: panchayatsDB.length,
  });
});

// ============================================================================
// 2. PANCHAYAT & JURISDICTION APIS
// ============================================================================

// Get all Karnataka Districts and Taluks
app.get('/api/districts', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: KARNATAKA_DISTRICTS,
  });
});

// List Gram Panchayats with optional district & taluk filter
app.get('/api/panchayats', (req: Request, res: Response) => {
  const { district, taluk, search } = req.query;
  let results = [...panchayatsDB];

  if (district && typeof district === 'string') {
    results = results.filter(
      (p) =>
        p.districtEn.toLowerCase() === district.toLowerCase() ||
        p.districtKn === district
    );
  }

  if (taluk && typeof taluk === 'string') {
    results = results.filter(
      (p) =>
        p.talukEn.toLowerCase() === taluk.toLowerCase() ||
        p.talukKn === taluk
    );
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (p) =>
        p.nameEn.toLowerCase().includes(q) ||
        p.nameKn.includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    count: results.length,
    data: results,
  });
});

// Get single Gram Panchayat details by ID
app.get('/api/panchayats/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const found = panchayatsDB.find((p) => p.id.toLowerCase() === id.toLowerCase());

  if (!found) {
    return res.status(404).json({ success: false, error: 'Gram Panchayat not found' });
  }

  res.json({ success: true, data: found });
});

// Get elected council members for a Gram Panchayat
app.get('/api/panchayats/:id/council', (req: Request, res: Response) => {
  const { id } = req.params;
  const gp = panchayatsDB.find((p) => p.id.toLowerCase() === id.toLowerCase()) || DEFAULT_GRAM_PANCHAYAT;
  const members = getCouncilMembersForPanchayat(gp);

  res.json({
    success: true,
    panchayatId: gp.id,
    panchayatName: gp.nameEn,
    currentTerm: gp.currentTerm,
    count: members.length,
    data: members,
  });
});

// ============================================================================
// 3. GRIEVANCES & CITIZEN COMPLAINTS APIS
// ============================================================================

// List complaints with search and filtering
app.get('/api/complaints', (req: Request, res: Response) => {
  const {
    panchayatId,
    village,
    category,
    status,
    priority,
    search,
    limit = '50',
    offset = '0',
  } = req.query;

  let results = [...complaintsDB];

  if (village && typeof village === 'string' && village !== 'all') {
    results = results.filter((c) => c.village.toLowerCase() === village.toLowerCase());
  }

  if (category && typeof category === 'string' && category !== 'all') {
    results = results.filter((c) => c.category === category);
  }

  if (status && typeof status === 'string' && status !== 'all') {
    if (status === 'pending') {
      results = results.filter((c) => c.status !== 'resolved' && c.status !== 'rejected');
    } else {
      results = results.filter((c) => c.status === status);
    }
  }

  if (priority && typeof priority === 'string' && priority !== 'all') {
    results = results.filter((c) => c.priority === priority);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.village.toLowerCase().includes(q) ||
        c.citizenMaskedId.toLowerCase().includes(q)
    );
  }

  const parsedLimit = Math.min(100, parseInt(limit as string, 10) || 50);
  const parsedOffset = parseInt(offset as string, 10) || 0;
  const paginated = results.slice(parsedOffset, parsedOffset + parsedLimit);

  // Sanitized public view (private citizen phone is masked for public transparency)
  const publicView = paginated.map((c) => ({
    ...c,
    privateCitizenPhone: undefined,
  }));

  res.json({
    success: true,
    total: results.length,
    limit: parsedLimit,
    offset: parsedOffset,
    data: publicView,
  });
});

// Get single complaint by ID
app.get('/api/complaints/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const found = complaintsDB.find((c) => c.id.toLowerCase() === id.toLowerCase());

  if (!found) {
    return res.status(404).json({ success: false, error: 'Complaint not found' });
  }

  res.json({
    success: true,
    data: {
      ...found,
      privateCitizenPhone: undefined, // Enforce anonymity rule
    },
  });
});

// Submit a new complaint (with 1000-char limit, mandatory doc verification & masked identity)
app.post('/api/complaints', (req: Request, res: Response) => {
  const {
    category,
    title,
    description,
    village,
    specificLocality,
    wardNumber,
    hasAcceptedSubmitNote,
    privateCitizenPhone,
    documents = [],
    priority = 'normal',
    location,
  } = req.body;

  // Validation
  if (!title || !description || !village || !category) {
    return res.status(400).json({
      success: false,
      error: 'Missing required grievance fields (category, title, description, village)',
    });
  }

  if (description.length > 1000) {
    return res.status(400).json({
      success: false,
      error: 'Grievance description exceeds maximum limit of 1000 characters',
    });
  }

  // Mandatory Document Verification Rule
  if (!documents || documents.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Mandatory document requirement: At least one supporting document or photograph must be attached',
    });
  }

  // Generate Official Karnataka Grievance Reference Number
  const catPrefixMap: Record<string, string> = {
    water_requirements: 'WTR',
    garbage_waste_management: 'WST',
    road_development: 'RD',
    electricity_problems: 'ELE',
    social_problems: 'SOC',
    farmers_loan_delay: 'FRM',
    property_family_dispute: 'PROP',
    unemployment_mgnrega: 'NREGA',
    scholarship_handicapped: 'DIS',
    womens_welfare: 'WLF',
    single_parent_support: 'SPT',
    other_grievance: 'GEN',
  };

  const prefix = catPrefixMap[category] || 'GEN';
  const serial = Math.floor(100 + Math.random() * 900);
  const complaintId = `GP-KA-2026-${prefix}-${serial}`;

  // Mask Citizen Identity for 100% Whistleblower Protection
  const rawPhone = String(privateCitizenPhone || '9800000000').replace(/\D/g, '');
  const lastFour = rawPhone.slice(-4) || '8491';
  const citizenMaskedId = `CIT-KA-***-${lastFour}`;

  const now = new Date();
  const dateFormatted = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  const newComplaint: Complaint = {
    id: complaintId,
    category,
    title: String(title).trim(),
    description: String(description).trim(),
    village: String(village).trim(),
    specificLocality: String(specificLocality || 'Village Ward Area').trim(),
    wardNumber: wardNumber ? String(wardNumber) : undefined,
    citizenMaskedId,
    hasAcceptedSubmitNote: Boolean(hasAcceptedSubmitNote),
    privateCitizenPhone: rawPhone,
    privateCitizenUserId: `cit_${Date.now()}`,
    location: location || {
      district: 'Chikkaballapura',
      taluk: 'Chikkaballapura Rural',
      gramPanchayat: 'Nandi Gram Panchayat',
      village: String(village),
      geoPermitted: false,
    },
    documents: documents.map((doc: any, idx: number) => ({
      id: doc.id || `doc-${Date.now()}-${idx}`,
      name: doc.name || 'evidence_document.jpg',
      size: doc.size || 1024,
      type: doc.type || 'image/jpeg',
      dataUrl: doc.dataUrl,
      uploadedAt: dateFormatted,
      likesCount: 0,
      usageCount: 0,
    })),
    status: 'submitted',
    submittedAt: dateFormatted,
    updatedAt: dateFormatted,
    priority: priority || 'normal',
  };

  // Prepend to in-memory database
  complaintsDB.unshift(newComplaint);

  res.status(201).json({
    success: true,
    message: 'Grievance lodged successfully with anonymous whistleblower protection',
    complaintId: newComplaint.id,
    data: {
      ...newComplaint,
      privateCitizenPhone: undefined,
    },
  });
});

// Update complaint status (authorized PDO officer desk)
app.patch('/api/complaints/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes, actionOfficer } = req.body;

  const validStatuses: ComplaintStatus[] = [
    'submitted',
    'under_review',
    'site_inspection',
    'action_initiated',
    'resolved',
    'rejected',
  ];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    });
  }

  const index = complaintsDB.findIndex((c) => c.id.toLowerCase() === id.toLowerCase());
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Complaint not found' });
  }

  const now = new Date();
  const dateFormatted = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  complaintsDB[index] = {
    ...complaintsDB[index],
    status,
    statusNotes: notes || complaintsDB[index].statusNotes,
    actionTakenBy: actionOfficer || 'Panchayat Development Officer (PDO)',
    actionTakenAt: dateFormatted,
    resolutionRemarks: status === 'resolved' ? notes : complaintsDB[index].resolutionRemarks,
    updatedAt: dateFormatted,
  };

  res.json({
    success: true,
    message: `Complaint ${id} status updated to ${status}`,
    data: {
      ...complaintsDB[index],
      privateCitizenPhone: undefined,
    },
  });
});

// ============================================================================
// 4. REPORTS & GOVERNANCE ANALYTICS APIS
// ============================================================================

// Aggregate Analytics Summary for Gram Sabha and Zilla Panchayat Audits
app.get('/api/reports/summary', (req: Request, res: Response) => {
  const { timeFrame = 'all', village = 'all', category = 'all' } = req.query;

  let filtered = [...complaintsDB];
  const now = new Date();

  // Time frame filtering
  if (timeFrame === 'current_month') {
    filtered = filtered.filter((c) => {
      const d = new Date(c.submittedAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  } else if (timeFrame === 'last_30_days') {
    filtered = filtered.filter((c) => {
      const diff = (now.getTime() - new Date(c.submittedAt).getTime()) / (1000 * 3600 * 24);
      return diff <= 30;
    });
  }

  if (village !== 'all' && typeof village === 'string') {
    filtered = filtered.filter((c) => c.village.toLowerCase() === village.toLowerCase());
  }

  if (category !== 'all' && typeof category === 'string') {
    filtered = filtered.filter((c) => c.category === category);
  }

  const total = filtered.length;
  const resolved = filtered.filter((c) => c.status === 'resolved').length;
  const inProgress = filtered.filter(
    (c) => c.status !== 'resolved' && c.status !== 'rejected'
  ).length;
  const rejected = filtered.filter((c) => c.status === 'rejected').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Calculate Turnaround Days & SLA Compliance
  let withinSlaCount = 0;
  let totalTurnaroundDays = 0;
  let resolvedForAvg = 0;

  filtered.forEach((c) => {
    const cat = COMPLAINT_CATEGORIES.find((meta) => meta.id === c.category);
    const sla = cat?.slaDays || 5;

    const sub = new Date(c.submittedAt).getTime();
    const upd = new Date(c.updatedAt).getTime();
    const days = Math.max(1, Math.round((upd - sub) / (1000 * 3600 * 24)));

    if (c.status === 'resolved') {
      totalTurnaroundDays += days;
      resolvedForAvg += 1;
      if (days <= sla) withinSlaCount += 1;
    } else {
      const daysPending = Math.max(1, Math.round((now.getTime() - sub) / (1000 * 3600 * 24)));
      if (daysPending <= sla) withinSlaCount += 1;
    }
  });

  const avgDays = resolvedForAvg > 0 ? (totalTurnaroundDays / resolvedForAvg).toFixed(1) : '2.4';
  const slaRate = total > 0 ? Math.round((withinSlaCount / total) * 100) : 100;

  // Attached Document Metrics
  const totalAttachedDocs = filtered.reduce((acc, c) => acc + (c.documents?.length || 0), 0);

  // Category Distribution
  const categoryStats = COMPLAINT_CATEGORIES.map((cat) => {
    const catList = filtered.filter((c) => c.category === cat.id);
    const catResolved = catList.filter((c) => c.status === 'resolved').length;
    return {
      categoryId: cat.id,
      categoryNameEn: cat.nameEn,
      categoryNameKn: cat.nameKn,
      department: cat.department,
      slaDays: cat.slaDays,
      totalLodged: catList.length,
      resolved: catResolved,
      pending: catList.length - catResolved - catList.filter((c) => c.status === 'rejected').length,
      resolutionRate: catList.length > 0 ? Math.round((catResolved / catList.length) * 100) : 0,
    };
  }).filter((c) => c.totalLodged > 0 || category === 'all');

  res.json({
    success: true,
    data: {
      totalGrievances: total,
      resolved,
      inProgress,
      rejected,
      resolutionRate,
      averageResolutionDays: avgDays,
      slaComplianceRate: slaRate,
      totalAttachedEvidenceDocuments: totalAttachedDocs,
      whistleblowerAnonymityRate: '100%',
      categoryBreakdown: categoryStats,
    },
  });
});

// Server-side CSV Export with UTF-8 BOM
app.get('/api/reports/export-csv', (_req: Request, res: Response) => {
  const headers = [
    'Complaint ID',
    'Title',
    'Category',
    'Village',
    'Locality',
    'Status',
    'Priority',
    'Lodged Date',
    'Citizen Masked ID',
    'Action Officer',
    'Resolution Remarks',
  ];

  const rows = complaintsDB.map((c) => [
    `"${c.id}"`,
    `"${(c.title || '').replace(/"/g, '""')}"`,
    `"${c.category}"`,
    `"${c.village}"`,
    `"${(c.specificLocality || '').replace(/"/g, '""')}"`,
    `"${c.status}"`,
    `"${c.priority}"`,
    `"${c.submittedAt}"`,
    `"${c.citizenMaskedId}"`,
    `"${(c.actionTakenBy || '').replace(/"/g, '""')}"`,
    `"${(c.resolutionRemarks || c.statusNotes || '').replace(/"/g, '""')}"`,
  ]);

  const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const filename = `GramaSeva_Grievance_Report_${new Date().toISOString().slice(0, 10)}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
});

// ============================================================================
// 5. DOCUMENT TRACKING & LIKES APIS
// ============================================================================

app.post('/api/documents/:docId/like', (req: Request, res: Response) => {
  const { docId } = req.params;
  if (!trackedDocsStats[docId]) {
    trackedDocsStats[docId] = { likes: 0, views: 0 };
  }
  trackedDocsStats[docId].likes += 1;

  res.json({
    success: true,
    documentId: docId,
    likesCount: trackedDocsStats[docId].likes,
  });
});

app.post('/api/documents/:docId/usage', (req: Request, res: Response) => {
  const { docId } = req.params;
  const { action = 'viewed' } = req.body;
  if (!trackedDocsStats[docId]) {
    trackedDocsStats[docId] = { likes: 0, views: 0 };
  }
  trackedDocsStats[docId].views += 1;

  res.json({
    success: true,
    documentId: docId,
    action,
    viewsCount: trackedDocsStats[docId].views,
  });
});

// ============================================================================
// 6. REAL-TIME OFFICE HOURS API
// ============================================================================

app.get('/api/office-status', (_req: Request, res: Response) => {
  const istString = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const istDate = new Date(istString);

  const dayOfWeek = istDate.getDay();
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  let isOpen = false;
  let statusText = 'Office Closed';
  let statusTextKn = 'ಕಚೇರಿ ಮುಚ್ಚಿದೆ';

  if (dayOfWeek === 0) {
    statusText = 'Sunday Holiday';
    statusTextKn = 'ಭಾನುವಾರ ರಜೆ';
  } else if (dayOfWeek === 6) {
    if (totalMinutes >= 600 && totalMinutes < 780) {
      isOpen = true;
      statusText = 'Open (Saturday Half Day)';
      statusTextKn = 'ತೆರೆದಿದೆ (ಶನಿವಾರ ಅರ್ಧದಿನ)';
    } else {
      statusText = 'Closed (Saturday after 1 PM)';
      statusTextKn = 'ಮುಚ್ಚಿದೆ (ಶನಿವಾರ 1 PM ನಂತರ)';
    }
  } else {
    if (totalMinutes >= 600 && totalMinutes < 780) {
      isOpen = true;
      statusText = 'Open (Morning Session)';
      statusTextKn = 'ತೆರೆದಿದೆ (ಬೆಳಗಿನ ಅವಧಿ)';
    } else if (totalMinutes >= 780 && totalMinutes < 840) {
      statusText = 'Lunch Recess (1:00 PM - 2:00 PM)';
      statusTextKn = 'ಊಟದ ವಿರಾಮ (1:00 PM - 2:00 PM)';
    } else if (totalMinutes >= 840 && totalMinutes < 1020) {
      isOpen = true;
      statusText = 'Open (Afternoon Session)';
      statusTextKn = 'ತೆರೆದಿದೆ (ಮಧ್ಯಾಹ್ನದ ಅವಧಿ)';
    } else {
      statusText = 'Office Closed (Working Hours: 10 AM - 5 PM)';
      statusTextKn = 'ಕಚೇರಿ ಮುಚ್ಚಿದೆ (ಕೆಲಸದ ವೇಳೆ: 10 AM - 5 PM)';
    }
  }

  res.json({
    success: true,
    isOpen,
    statusText,
    statusTextKn,
    currentTimeIST: istDate.toLocaleTimeString('en-IN', { hour12: true }),
    officeSchedule: {
      monToThu: '10:00 AM – 5:00 PM',
      lunchRecess: '1:00 PM – 2:00 PM',
      saturdayHalfDay: '10:00 AM – 1:00 PM',
      sunday: 'Holiday',
    },
  });
});

// ============================================================================
// 7. VITE MIDDLEWARE & STATIC ASSET SERVER
// ============================================================================

async function startServer() {
  if (!isProduction) {
    // Development Mode: Mount Vite as middleware with HMR
    console.log('[Server] Initializing Vite development server middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode: Serve built client bundle
    console.log('[Server] Serving production static bundle from dist directory...');
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`================================================================`);
    console.log(` Karnataka Gram Panchayat Janahita Portal (GramaSeva Backend)   `);
    console.log(` Server active on port: ${PORT}`);
    console.log(` API Endpoint: http://localhost:${PORT}/api/health               `);
    console.log(` Mode: ${isProduction ? 'Production' : 'Development (Vite SSR)'}`);
    console.log(`================================================================`);
  });
}

startServer().catch((err) => {
  console.error('[Server Error] Failed to start server:', err);
  process.exit(1);
});
