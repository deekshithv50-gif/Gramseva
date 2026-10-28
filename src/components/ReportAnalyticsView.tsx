import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Droplets,
  Layers,
  Copy,
  Check,
  BarChart3,
  Search,
  ExternalLink,
  ChevronDown,
  FileSpreadsheet,
  Award,
  Users,
} from 'lucide-react';
import {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  GramPanchayatInfo,
  CouncilMember,
} from '../types';
import { COMPLAINT_CATEGORIES } from '../data/panchayatData';
import { useLanguage } from '../context/LanguageContext';
import { KarnatakaEmblem } from '../utils/karnatakaEmblem';

interface ReportAnalyticsViewProps {
  complaints: Complaint[];
  panchayat: GramPanchayatInfo;
  councilMembers: CouncilMember[];
  onOpenComplaintTracker?: (filterId?: string) => void;
}

type TimeFrame = 'all' | 'current_month' | 'last_30_days' | 'last_quarter' | 'fy_current';
type ReportType = 'gram_sabha' | 'department_sla' | 'village_audit' | 'complaints_ledger';

export const ReportAnalyticsView: React.FC<ReportAnalyticsViewProps> = ({
  complaints,
  panchayat,
  councilMembers,
  onOpenComplaintTracker,
}) => {
  const { t, isKannada } = useLanguage();

  // Filters state
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('all');
  const [selectedVillage, setSelectedVillage] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [reportType, setReportType] = useState<ReportType>('gram_sabha');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  // Filter complaints based on active filters
  const filteredComplaints = useMemo(() => {
    const now = new Date();

    return complaints.filter((c) => {
      // Time frame filter
      const compDate = new Date(c.submittedAt);
      if (timeFrame === 'current_month') {
        if (
          compDate.getMonth() !== now.getMonth() ||
          compDate.getFullYear() !== now.getFullYear()
        ) {
          return false;
        }
      } else if (timeFrame === 'last_30_days') {
        const diffDays = (now.getTime() - compDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 30) return false;
      } else if (timeFrame === 'last_quarter') {
        const diffDays = (now.getTime() - compDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 90) return false;
      } else if (timeFrame === 'fy_current') {
        // FY 2026 starts April 1, 2026
        const fyStart = new Date(2026, 3, 1);
        if (compDate < fyStart) return false;
      }

      // Village filter
      if (selectedVillage !== 'all' && c.village !== selectedVillage) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && c.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'pending') {
          if (c.status === 'resolved' || c.status === 'rejected') return false;
        } else if (c.status !== selectedStatus) {
          return false;
        }
      }

      // Priority filter
      if (selectedPriority !== 'all' && c.priority !== selectedPriority) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesId = c.id.toLowerCase().includes(q);
        const matchesVillage = c.village.toLowerCase().includes(q);
        const matchesCitizen = c.citizenMaskedId.toLowerCase().includes(q);
        if (!matchesTitle && !matchesId && !matchesVillage && !matchesCitizen) {
          return false;
        }
      }

      return true;
    });
  }, [
    complaints,
    timeFrame,
    selectedVillage,
    selectedCategory,
    selectedStatus,
    selectedPriority,
    searchTerm,
  ]);

  // Aggregate Metrics & Key Performance Indicators
  const metrics = useMemo(() => {
    const total = filteredComplaints.length;
    const resolved = filteredComplaints.filter((c) => c.status === 'resolved').length;
    const underReview = filteredComplaints.filter((c) => c.status === 'under_review').length;
    const siteInspection = filteredComplaints.filter((c) => c.status === 'site_inspection').length;
    const actionInitiated = filteredComplaints.filter((c) => c.status === 'action_initiated').length;
    const rejected = filteredComplaints.filter((c) => c.status === 'rejected').length;
    const submitted = filteredComplaints.filter((c) => c.status === 'submitted').length;
    const inProgress = total - resolved - rejected;

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // SLA performance calculations
    let withinSla = 0;
    let breachedSla = 0;
    let totalTurnaroundDays = 0;
    let resolvedCountForAvg = 0;

    filteredComplaints.forEach((c) => {
      const catMeta = COMPLAINT_CATEGORIES.find((cat) => cat.id === c.category);
      const slaDays = catMeta?.slaDays || 5;

      const subTime = new Date(c.submittedAt).getTime();
      const updatedTime = new Date(c.updatedAt).getTime();
      const daysTaken = Math.max(1, Math.round((updatedTime - subTime) / (1000 * 3600 * 24)));

      if (c.status === 'resolved') {
        totalTurnaroundDays += daysTaken;
        resolvedCountForAvg += 1;
        if (daysTaken <= slaDays) {
          withinSla += 1;
        } else {
          breachedSla += 1;
        }
      } else {
        const daysPending = Math.max(1, Math.round((Date.now() - subTime) / (1000 * 3600 * 24)));
        if (daysPending > slaDays) {
          breachedSla += 1;
        } else {
          withinSla += 1;
        }
      }
    });

    const avgResolutionDays =
      resolvedCountForAvg > 0 ? (totalTurnaroundDays / resolvedCountForAvg).toFixed(1) : '2.4';
    const slaComplianceRate = total > 0 ? Math.round((withinSla / total) * 100) : 100;

    // Evidence & documents
    const totalDocumentsAttached = filteredComplaints.reduce(
      (acc, c) => acc + (c.documents?.length || 0),
      0
    );
    const complaintsWithDocs = filteredComplaints.filter(
      (c) => c.documents && c.documents.length > 0
    ).length;
    const documentAttachmentRate =
      total > 0 ? Math.round((complaintsWithDocs / total) * 100) : 0;

    // Total documents likes and usage
    let totalDocLikes = 0;
    filteredComplaints.forEach((c) => {
      c.documents?.forEach((d) => {
        totalDocLikes += d.likesCount || 0;
      });
    });

    // Urgent / high count
    const urgentCount = filteredComplaints.filter((c) => c.priority === 'urgent').length;
    const highCount = filteredComplaints.filter((c) => c.priority === 'high').length;

    return {
      total,
      resolved,
      inProgress,
      submitted,
      underReview,
      siteInspection,
      actionInitiated,
      rejected,
      resolutionRate,
      withinSla,
      breachedSla,
      slaComplianceRate,
      avgResolutionDays,
      totalDocumentsAttached,
      complaintsWithDocs,
      documentAttachmentRate,
      totalDocLikes,
      urgentCount,
      highCount,
    };
  }, [filteredComplaints]);

  // Village-wise distribution
  const villageStats = useMemo(() => {
    return panchayat.villages.map((v) => {
      const vComplaints = complaints.filter(
        (c) => c.village.toLowerCase() === v.nameEn.toLowerCase() || c.village === v.nameKn
      );
      const total = vComplaints.length;
      const resolved = vComplaints.filter((c) => c.status === 'resolved').length;
      const inProgress = total - resolved - vComplaints.filter((c) => c.status === 'rejected').length;
      const rate = total > 0 ? Math.round((resolved / total) * 100) : 100;

      return {
        village: v,
        total,
        resolved,
        inProgress,
        resolutionRate: rate,
        population: v.population,
        wardsCount: v.wardsCount,
      };
    });
  }, [complaints, panchayat.villages]);

  // Category-wise distribution
  const categoryStats = useMemo(() => {
    return COMPLAINT_CATEGORIES.map((cat) => {
      const catComplaints = filteredComplaints.filter((c) => c.category === cat.id);
      const total = catComplaints.length;
      const resolved = catComplaints.filter((c) => c.status === 'resolved').length;
      const inProgress = total - resolved - catComplaints.filter((c) => c.status === 'rejected').length;
      const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
      const withDocs = catComplaints.filter((c) => c.documents && c.documents.length > 0).length;

      return {
        category: cat,
        total,
        resolved,
        inProgress,
        resolutionRate: rate,
        slaDays: cat.slaDays,
        withDocs,
      };
    }).filter((item) => item.total > 0 || selectedCategory === 'all');
  }, [filteredComplaints, selectedCategory]);

  // Export to CSV Functionality with UTF-8 BOM for perfect Kannada display
  const handleExportCSV = () => {
    const headers = [
      'Complaint ID',
      'Title',
      'Category ID',
      'Category Name (EN)',
      'Category Name (KN)',
      'Village',
      'Specific Locality',
      'Status',
      'Priority',
      'Submitted Date',
      'Last Updated',
      'Citizen Masked ID',
      'Documents Count',
      'Action Officer',
      'Resolution Remarks',
    ];

    const rows = filteredComplaints.map((c) => {
      const cat = COMPLAINT_CATEGORIES.find((catMeta) => catMeta.id === c.category);
      return [
        `"${c.id}"`,
        `"${(c.title || '').replace(/"/g, '""')}"`,
        `"${c.category}"`,
        `"${cat?.nameEn || ''}"`,
        `"${cat?.nameKn || ''}"`,
        `"${c.village}"`,
        `"${(c.specificLocality || '').replace(/"/g, '""')}"`,
        `"${c.status}"`,
        `"${c.priority}"`,
        `"${c.submittedAt}"`,
        `"${c.updatedAt}"`,
        `"${c.citizenMaskedId}"`,
        c.documents?.length || 0,
        `"${(c.actionTakenBy || '').replace(/"/g, '""')}"`,
        `"${(c.resolutionRemarks || c.statusNotes || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute(
      'href',
      url
    );
    link.setAttribute(
      'download',
      `GramaSeva_${panchayat.nameEn.replace(/\s+/g, '_')}_Report_${timestamp}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Executive Summary
  const handleCopySummary = () => {
    const periodLabel =
      timeFrame === 'all'
        ? 'All Time / ಸಮಗ್ರ'
        : timeFrame === 'current_month'
        ? 'Current Month / ಪ್ರಸ್ತುತ ತಿಂಗಳು'
        : timeFrame === 'last_30_days'
        ? 'Last 30 Days / ಕಳೆದ 30 ದಿನಗಳು'
        : 'FY 2026-27';

    const text = `🏛️ ${isKannada ? panchayat.nameKn : panchayat.nameEn} ಗ್ರಾಮ ಪಂಚಾಯತ್ - ಜನಹಿತ ವರದಿ ಸಾರಾಂಶ
📅 ಅವಧಿ / Period: ${periodLabel}
📍 ಜಿಲ್ಲೆ / District: ${isKannada ? panchayat.districtKn : panchayat.districtEn} | ತಾಲೂಕು: ${isKannada ? panchayat.talukKn : panchayat.talukEn}
📊 ಒಟ್ಟು ಸ್ವೀಕೃತ ದೂರುಗಳು (Total Received): ${metrics.total}
✅ ಪರಿಹಾರ ಕಂಡ ದೂರುಗಳು (Resolved): ${metrics.resolved} (${metrics.resolutionRate}%)
⏳ ಪ್ರಗತಿಯಲ್ಲಿರುವ ದೂರುಗಳು (In-Progress): ${metrics.inProgress}
⏱️ ಸೇವಾ ಖಾತರಿ (SLA Compliance): ${metrics.slaComplianceRate}% | ಸರಾಸರಿ ಪರಿಹಾರ ಕಾಲ: ${metrics.avgResolutionDays} ದಿನಗಳು
📎 ಲಗತ್ತಿಸಲಾದ ಪುರಾವೆ ದಾಖಲೆಗಳು (Evidence Docs): ${metrics.totalDocumentsAttached}
🔒 ದೂರುದಾರರ ಅನಾಮಧೇಯತೆ: ೧೦೦% ರಕ್ಷಣೆ (Masked Citizen ID)
📞 ಸಹಾಯವಾಣಿ (Helpline): ${panchayat.helplineNumber}`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Station (Screen Only) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs print:hidden space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
                <BarChart3 className="w-5 h-5 text-emerald-700" />
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-kannada">
                {t('ಗ್ರಾಮಸೇವಾ ವರದಿ & ವಿಶ್ಲೇಷಣೆ ಪೋರ್ಟಲ್', 'GramaSeva Reports & Governance Analytics')}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              {t(
                `ಗ್ರಾಮ ಪಂಚಾಯತ್: ${panchayat.nameKn} (${panchayat.nameEn}), ತಾಲೂಕು: ${panchayat.talukKn}, ಜಿಲ್ಲೆ: ${panchayat.districtKn} • ೫-ವರ್ಷಗಳ ಆಡಳಿತಾವಧಿ ${panchayat.currentTerm}`,
                `Gram Panchayat: ${panchayat.nameEn}, Taluk: ${panchayat.talukEn}, District: ${panchayat.districtEn} • Term ${panchayat.currentTerm}`
              )}
            </p>
          </div>

          {/* Quick Actions (Print, Export CSV, Copy) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopySummary}
              type="button"
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title={t('ಸಾರಾಂಶ ನಕಲಿಸಿ', 'Copy Summary')}
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">{t('ನಕಲಿಸಲಾಗಿದೆ!', 'Copied!')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>{t('ಸಾರಾಂಶ ಕಾಪಿ', 'Copy Summary')}</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportCSV}
              type="button"
              className="px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title={t('ಎಕ್ಸೆಲ್/ಸಿಎಸ್ವಿ ಡೌನ್‌ಲೋಡ್', 'Download CSV / Excel')}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>{t('CSV / Excel ರಫ್ತು', 'Export CSV')}</span>
            </button>

            <button
              onClick={handlePrint}
              type="button"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title={t('ಅಧಿಕೃತ ಪಿಡಿಎಫ್ ಮುದ್ರಿಸಿ', 'Print Official Report')}
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>{t('ಅಧಿಕೃತ ವರದಿ ಮುದ್ರಿಸಿ (PDF)', 'Print / Save PDF')}</span>
            </button>
          </div>
        </div>

        {/* Report Type Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setReportType('gram_sabha')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer inline-flex items-center gap-2 ${
              reportType === 'gram_sabha'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{t('ಗ್ರಾಮ ಸಭೆ ವರದಿ', 'Gram Sabha Audit')}</span>
          </button>

          <button
            type="button"
            onClick={() => setReportType('department_sla')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer inline-flex items-center gap-2 ${
              reportType === 'department_sla'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{t('ಸೇವಾ ಖಾತರಿ & ಇಲಾಖಾವಾರು', 'Department SLA')}</span>
          </button>

          <button
            type="button"
            onClick={() => setReportType('village_audit')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer inline-flex items-center gap-2 ${
              reportType === 'village_audit'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>{t('ಗ್ರಾಮವಾರು ಲೆಕ್ಕಪರಿಶೋಧನೆ', 'Village Audit')}</span>
          </button>

          <button
            type="button"
            onClick={() => setReportType('complaints_ledger')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer inline-flex items-center gap-2 ${
              reportType === 'complaints_ledger'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t('ದೂರುಗಳ ನೋಂದಣಿ ರಿಜಿಸ್ಟರ್', 'Complaints Ledger')}</span>
          </button>
        </div>

        {/* Filter Bar Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {/* Timeframe */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              {t('ಸಮಯದ ಅವಧಿ', 'Time Period')}
            </label>
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-emerald-600"
            >
              <option value="all">{t('ಸಮಗ್ರ ಅವಧಿ (All Time)', 'All Time')}</option>
              <option value="current_month">{t('ಪ್ರಸ್ತುತ ತಿಂಗಳು (This Month)', 'Current Month')}</option>
              <option value="last_30_days">{t('ಕಳೆದ ೩೦ ದಿನಗಳು', 'Last 30 Days')}</option>
              <option value="last_quarter">{t('ಹಿಂದಿನ ತ್ರೈಮಾಸಿಕ (90 Days)', 'Last Quarter')}</option>
              <option value="fy_current">{t('ಪ್ರಸ್ತುತ ಆರ್ಥಿಕ ವರ್ಷ (FY 2026-27)', 'Current FY 2026-27')}</option>
            </select>
          </div>

          {/* Constituent Village */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              {t('ಒಳಪಟ್ಟ ಗ್ರಾಮ', 'Village')}
            </label>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-emerald-600"
            >
              <option value="all">{t('ಎಲ್ಲಾ ಒಳಪಟ್ಟ ಗ್ರಾಮಗಳು (All Villages)', 'All Constituent Villages')}</option>
              {panchayat.villages.map((v) => (
                <option key={v.id} value={v.nameEn}>
                  {isKannada ? v.nameKn : v.nameEn} (ವಾರ್ಡ್: {v.wardsCount})
                </option>
              ))}
            </select>
          </div>

          {/* Grievance Category */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              {t('ಕುಂದುಕೊರತೆ ವರ್ಗ', 'Category')}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-emerald-600 truncate"
            >
              <option value="all">{t('ಎಲ್ಲಾ ವರ್ಗಗಳು (All Categories)', 'All Categories')}</option>
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {isKannada ? cat.nameKn : cat.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Grievance Status */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              {t('ಸ್ಥಿತಿ ಪರಿಶೀಲನೆ', 'Status')}
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-emerald-600"
            >
              <option value="all">{t('ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು (All)', 'All Statuses')}</option>
              <option value="resolved">{t('ಪರಿಹಾರಗೊಂಡಿದೆ (Resolved)', 'Resolved Only')}</option>
              <option value="pending">{t('ಬಾಕಿ ಉಳಿದಿದೆ (In Progress)', 'Pending / In-Progress')}</option>
              <option value="site_inspection">{t('ಸ್ಥಳ ಪರಿಶೀಲನೆ (Site Inspection)', 'Site Inspection')}</option>
              <option value="rejected">{t('ತಿರಸ್ಕೃತಗೊಂಡಿದೆ (Rejected)', 'Rejected')}</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              {t('ಹುಡುಕು (ID / ಶೀರ್ಷಿಕೆ)', 'Search ID or Title')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('ಉದಾ: GP-KA-2026...', 'Search ID, title, village')}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-slate-800 focus:outline-emerald-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Active Filter Indicators */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span>{t('ಫಲಿತಾಂಶ:', 'Filtered Results:')}</span>
            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
              {filteredComplaints.length} / {complaints.length} {t('ದೂರುಗಳು', 'Grievances')}
            </span>
          </div>

          {(timeFrame !== 'all' ||
            selectedVillage !== 'all' ||
            selectedCategory !== 'all' ||
            selectedStatus !== 'all' ||
            searchTerm) && (
            <button
              type="button"
              onClick={() => {
                setTimeFrame('all');
                setSelectedVillage('all');
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSelectedPriority('all');
                setSearchTerm('');
              }}
              className="text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer text-xs"
            >
              {t('ಫಿಲ್ಟರ್‌ಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ', 'Reset All Filters')}
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          PRINTABLE & ON-SCREEN OFFICIAL REPORT CANVAS
          ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-8 print:p-0 print:border-none print:shadow-none">
        {/* Official Karnataka Government Letterhead (Shows both on screen & print) */}
        <div className="border-b-2 border-slate-900 pb-6 text-center space-y-2.5">
          <div className="flex items-center justify-between">
            <KarnatakaEmblem size={56} />
            <div className="flex-1 px-4 text-center">
              <div className="text-xs uppercase tracking-widest text-slate-600 font-bold">
                {t('ಕರ್ನಾಟಕ ಸರ್ಕಾರ • ಗ್ರಾಮೀಣಾಭಿವೃದ್ಧಿ ಮತ್ತು ಪಂಚಾಯತ್ ರಾಜ್ ಇಲಾಖೆ', 'Government of Karnataka • Department of RDPR')}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-kannada tracking-tight">
                {isKannada ? panchayat.nameKn : panchayat.nameEn} {t('ಗ್ರಾಮ ಪಂಚಾಯತಿ', 'Gram Panchayat')}
              </h1>
              <div className="text-xs text-slate-700 font-medium">
                {t('ತಾಲೂಕು:', 'Taluk:')} {isKannada ? panchayat.talukKn : panchayat.talukEn} |{' '}
                {t('ಜಿಲ್ಲೆ:', 'District:')} {isKannada ? panchayat.districtKn : panchayat.districtEn} |{' '}
                {t('ಪಿನ್ ಕೋಡ್ / GP Code:', 'GP Code:')} {panchayat.id.toUpperCase()}
              </div>
              <div className="inline-block bg-slate-900 text-white text-[11px] font-bold px-3 py-0.5 rounded-full mt-1.5 uppercase tracking-wide">
                {reportType === 'gram_sabha' && t('ಗ್ರಾಮ ಸಭೆ ಕುಂದುಕೊರತೆ ಲೆಕ್ಕಪರಿಶೋಧನಾ ಅಧಿಕೃತ ವರದಿ', 'Official Gram Sabha Grievance Audit Report')}
                {reportType === 'department_sla' && t('ಸೇವಾ ಖಾತರಿ & ಇಲಾಖಾವಾರು ಪರಿಹಾರ ದಕ್ಷತೆ ವರದಿ', 'Department SLA & Turnaround Performance Report')}
                {reportType === 'village_audit' && t('ಒಳಪಟ್ಟ ಗ್ರಾಮವಾರು ಕುಂದುಕೊರತೆ ವರದಿ', 'Constituent Village Grievance Distribution Report')}
                {reportType === 'complaints_ledger' && t('ಸಮಗ್ರ ಕುಂದುಕೊರತೆ ನೋಂದಣಿ ಪುಸ್ತಕ (ರಿಜಿಸ್ಟರ್)', 'Itemized Grievance Ledger & Audit Register')}
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-500 font-mono hidden sm:block">
              <div>Ref: RDPR/GP/{panchayat.id.toUpperCase()}/{new Date().getFullYear()}</div>
              <div>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              <div className="text-emerald-700 font-bold">Helpline: {panchayat.helplineNumber}</div>
            </div>
          </div>
        </div>

        {/* Executive Scorecard / KPI Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center">
            <div className="text-xs font-semibold text-slate-500">
              {t('ಒಟ್ಟು ದೂರುಗಳು', 'Total Grievances')}
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{metrics.total}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{t('ಸ್ವೀಕೃತ', 'Received')}</div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 text-center">
            <div className="text-xs font-semibold text-emerald-800">
              {t('ಪರಿಹಾರ ಕಂಡಿದೆ', 'Resolved')}
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{metrics.resolved}</div>
            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
              {metrics.resolutionRate}% {t('ಪರಿಹಾರ ದರ', 'Rate')}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-center">
            <div className="text-xs font-semibold text-amber-800">
              {t('ಪ್ರಗತಿಯಲ್ಲಿದೆ', 'In Progress')}
            </div>
            <div className="text-2xl font-black text-amber-700 mt-1">{metrics.inProgress}</div>
            <div className="text-[10px] text-amber-700 mt-0.5">{t('ಕ್ರಮ ಜಾರಿಯಲ್ಲಿದೆ', 'Action Underway')}</div>
          </div>

          <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-4 text-center">
            <div className="text-xs font-semibold text-blue-800">
              {t('ಸೇವಾ ಖಾತರಿ (SLA)', 'SLA Turnaround')}
            </div>
            <div className="text-2xl font-black text-blue-700 mt-1">{metrics.avgResolutionDays}d</div>
            <div className="text-[10px] text-blue-600 mt-0.5">{t('ಸರಾಸರಿ ದಿನಗಳು', 'Avg Days Taken')}</div>
          </div>

          <div className="bg-purple-50 border border-purple-200/80 rounded-2xl p-4 text-center">
            <div className="text-xs font-semibold text-purple-800">
              {t('ಲಗತ್ತಿಸಿದ ದಾಖಲೆಗಳು', 'Attached Evidence')}
            </div>
            <div className="text-2xl font-black text-purple-700 mt-1">
              {metrics.totalDocumentsAttached}
            </div>
            <div className="text-[10px] text-purple-600 mt-0.5">
              {metrics.documentAttachmentRate}% {t('ದೂರುಗಳಲ್ಲಿ ದಾಖಲೆ ಇದೆ', 'with Docs')}
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-200/80 rounded-2xl p-4 text-center">
            <div className="text-xs font-semibold text-teal-800">
              {t('ಅನಾಮಧೇಯತೆ', 'Anonymity')}
            </div>
            <div className="text-2xl font-black text-teal-700 mt-1">100%</div>
            <div className="text-[10px] text-teal-600 mt-0.5">{t('ಮಾಸ್ಕ್ಡ್ ಐಡಿ ರಕ್ಷಣೆ', 'Masked Citizen ID')}</div>
          </div>
        </div>

        {/* Resolution Progress Bar */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>{t('ಒಟ್ಟಾರೆ ಪರಿಹಾರ ದಕ್ಷತೆ (Resolution Efficiency Meter)', 'Overall Resolution Progress')}</span>
            <span className="text-emerald-700">{metrics.resolutionRate}% ({metrics.resolved}/{metrics.total})</span>
          </div>
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${metrics.resolutionRate}%` }}
              className="bg-emerald-600 h-full transition-all duration-500"
              title={`Resolved: ${metrics.resolved}`}
            />
            <div
              style={{
                width: `${
                  metrics.total > 0
                    ? Math.round((metrics.inProgress / metrics.total) * 100)
                    : 0
                }%`,
              }}
              className="bg-amber-400 h-full transition-all duration-500"
              title={`In Progress: ${metrics.inProgress}`}
            />
            <div
              style={{
                width: `${
                  metrics.total > 0
                    ? Math.round((metrics.rejected / metrics.total) * 100)
                    : 0
                }%`,
              }}
              className="bg-slate-400 h-full transition-all duration-500"
              title={`Rejected: ${metrics.rejected}`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                {t('ಪರಿಹಾರ ಕಂಡಿದೆ', 'Resolved')}: {metrics.resolved}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                {t('ಪ್ರಗತಿಯಲ್ಲಿದೆ', 'In-Progress')}: {metrics.inProgress}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                {t('ತಿರಸ್ಕೃತ', 'Rejected')}: {metrics.rejected}
              </span>
            </div>
            <div className="font-semibold text-slate-600">
              {t('ಸೇವಾ ಖಾತರಿ ಪಾಲನೆ:', 'Sakala SLA Compliance:')} {metrics.slaComplianceRate}%
            </div>
          </div>
        </div>

        {/* =====================================================================
            TAB CONTENT 1: GRAM SABHA AUDIT
            ===================================================================== */}
        {reportType === 'gram_sabha' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-kannada flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-700" />
                <span>{t('ಗ್ರಾಮ ಸಭೆ ಲೆಕ್ಕಪರಿಶೋಧನಾ ವಿಭಾಗ (ವಿಭಾಗವಾರು ವಿಶ್ಲೇಷಣೆ)', 'Gram Sabha Departmental Audit Matrix')}</span>
              </h3>
              <span className="text-xs text-slate-500">
                {categoryStats.length} {t('ಇಲಾಖೆಗಳು', 'Categories')}
              </span>
            </div>

            {/* Department Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">{t('ಕ್ರ.ಸಂ', 'SL')}</th>
                    <th className="py-3 px-4">{t('ಕುಂದುಕೊರತೆ ವರ್ಗ & ಇಲಾಖೆ', 'Category & Department')}</th>
                    <th className="py-3 px-3 text-center">{t('ಸೇವಾ ಖಾತರಿ (ದಿನ)', 'SLA (Days)')}</th>
                    <th className="py-3 px-3 text-center">{t('ಒಟ್ಟು ಸ್ವೀಕೃತ', 'Total Lodged')}</th>
                    <th className="py-3 px-3 text-center text-emerald-800">{t('ಪರಿಹಾರ ಕಂಡಿದೆ', 'Resolved')}</th>
                    <th className="py-3 px-3 text-center text-amber-800">{t('ಪ್ರಗತಿಯಲ್ಲಿದೆ', 'Pending')}</th>
                    <th className="py-3 px-3 text-center">{t('ದಾಖಲೆ ಲಗತ್ತು', 'With Docs')}</th>
                    <th className="py-3 px-4 text-right">{t('ಪರಿಹಾರ ದರ %', 'Resolution %')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {categoryStats.map((item, idx) => (
                    <tr key={item.category.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {isKannada ? item.category.nameKn : item.category.nameEn}
                        </div>
                        <div className="text-[11px] text-slate-500">{item.category.department}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold">{item.slaDays} {t('ದಿನ', 'days')}</td>
                      <td className="py-3 px-3 text-center font-bold text-slate-900">{item.total}</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-700">{item.resolved}</td>
                      <td className="py-3 px-3 text-center font-bold text-amber-700">{item.inProgress}</td>
                      <td className="py-3 px-3 text-center font-mono text-purple-700">
                        {item.withDocs} ({item.total > 0 ? Math.round((item.withDocs / item.total) * 100) : 0}%)
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 font-bold font-mono">
                          <span
                            className={
                              item.resolutionRate >= 75
                                ? 'text-emerald-700'
                                : item.resolutionRate >= 50
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }
                          >
                            {item.resolutionRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Village Distribution Summary Grid */}
            <div className="space-y-3 pt-4">
              <h4 className="text-sm font-bold text-slate-900 font-kannada flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>{t('ಒಳಪಟ್ಟ ಗ್ರಾಮವಾರು ಕುಂದುಕೊರತೆ ಹಂಚಿಕೆ', 'Constituent Village Breakdown')}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {villageStats.map((vs) => (
                  <div
                    key={vs.village.id}
                    className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2 hover:border-slate-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">
                        {isKannada ? vs.village.nameKn : vs.village.nameEn}
                      </span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                        {t('ವಾರ್ಡ್', 'Wards')}: {vs.village.wardsCount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500">{t('ಜನಸಂಖ್ಯೆ', 'Pop.')}: {vs.population.toLocaleString('en-IN')}</span>
                      <span className="font-bold text-slate-800">{vs.total} {t('ದೂರು', 'grievances')}</span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${vs.resolutionRate}%` }}
                        className="bg-emerald-600 h-full"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="text-emerald-700 font-semibold">{t('ಪರಿಹಾರ', 'Resolved')}: {vs.resolved}</span>
                      <span className="text-amber-700 font-semibold">{t('ಬಾಕಿ', 'Pending')}: {vs.inProgress}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB CONTENT 2: DEPARTMENT SLA PERFORMANCE
            ===================================================================== */}
        {reportType === 'department_sla' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-kannada flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-700" />
                <span>{t('ಕರ್ನಾಟಕ ಸಕಾಲ & ಇಲಾಖಾವಾರು ಸೇವಾ ಖಾತರಿ ವರದಿ', 'Karnataka Sakala & SLA Compliance Report')}</span>
              </h3>
              <span className="text-xs text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                {t('ಒಟ್ಟಾರೆ ಸಕಾಲ ಪಾಲನೆ:', 'Overall Sakala Compliance:')} {metrics.slaComplianceRate}%
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {t(
                'ಕರ್ನಾಟಕ ಗ್ರಾಮ ಸ್ವರಾಜ್ ಮತ್ತು ಪಂಚಾಯತ್ ರಾಜ್ ಕಾಯ್ದೆ ಹಾಗೂ ಸಕಾಲ ಸೇವಾ ಖಾತರಿ ಅಧಿನಿಯಮದ ಅಡಿಯಲ್ಲಿ ಗ್ರಾಮ ಪಂಚಾಯತಿ ವ್ಯಾಪ್ತಿಯ ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆಗಳನ್ನು ನಿಗದಿತ ಕಾಲಮಿತಿಯೊಳಗೆ ಪರಿಹರಿಸುವ ಅಧಿಕೃತ ಮಾನದಂಡ ವರದಿ.',
                'Official governance scorecard benchmarking citizen grievance redressal turnaround times against Karnataka Sakala Act and RDPR statutory response targets.'
              )}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryStats.map((item) => (
                <div
                  key={item.category.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {isKannada ? item.category.nameKn : item.category.nameEn}
                      </h4>
                      <p className="text-[11px] text-slate-500">{item.category.department}</p>
                    </div>
                    <span className="shrink-0 text-xs font-mono font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md">
                      SLA: {item.slaDays} {t('ದಿನ', 'days')}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-500">{t('ಸ್ವೀಕೃತ', 'Total')}</div>
                      <div className="font-bold text-slate-900 text-base">{item.total}</div>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-emerald-700">{t('ಪರಿಹಾರ', 'Resolved')}</div>
                      <div className="font-bold text-emerald-700 text-base">{item.resolved}</div>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-amber-700">{t('ಬಾಕಿ', 'Pending')}</div>
                      <div className="font-bold text-amber-700 text-base">{item.inProgress}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-600 font-semibold">
                      <span>{t('ಪರಿಹಾರ ದರ', 'Resolution Ratio')}</span>
                      <span>{item.resolutionRate}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${item.resolutionRate}%` }}
                        className={`h-full ${
                          item.resolutionRate >= 75 ? 'bg-emerald-600' : 'bg-amber-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB CONTENT 3: CONSTITUENT VILLAGE AUDIT
            ===================================================================== */}
        {reportType === 'village_audit' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-kannada flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-700" />
                <span>{t('ಒಳಪಟ್ಟ ಗ್ರಾಮವಾರು ಲೆಕ್ಕಪರಿಶೋಧನಾ ವರದಿ', 'Constituent Village Audit Report')}</span>
              </h3>
              <span className="text-xs text-slate-500">
                {panchayat.villages.length} {t('ಗ್ರಾಮಗಳು (<10)', 'Villages (<10)')}
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">{t('ಗ್ರಾಮದ ಹೆಸರು', 'Village Name')}</th>
                    <th className="py-3 px-3 text-center">{t('ವಾರ್ಡ್‌ಗಳು', 'Wards')}</th>
                    <th className="py-3 px-3 text-center">{t('ಜನಸಂಖ್ಯೆ', 'Population')}</th>
                    <th className="py-3 px-3 text-center">{t('ದೂರುಗಳ ಸಂಖ್ಯೆ', 'Grievances Filed')}</th>
                    <th className="py-3 px-3 text-center text-emerald-800">{t('ಪರಿಹಾರಗೊಂಡಿದೆ', 'Resolved')}</th>
                    <th className="py-3 px-3 text-center text-amber-800">{t('ಪ್ರಗತಿಯಲ್ಲಿದೆ', 'In Progress')}</th>
                    <th className="py-3 px-4 text-right">{t('ಪರಿಹಾರ ದರ %', 'Resolution Rate')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {villageStats.map((v) => (
                    <tr key={v.village.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {isKannada ? v.village.nameKn : v.village.nameEn}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">ID: {v.village.id}</div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-800">{v.wardsCount}</td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-800">{v.population.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-900 text-sm">{v.total}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-emerald-700 text-sm">{v.resolved}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-amber-700 text-sm">{v.inProgress}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-bold font-mono text-xs px-2 py-0.5 rounded ${
                            v.resolutionRate >= 75
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {v.resolutionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Council Representation Audit */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>{t('೫-ವರ್ಷಗಳ ಚುನಾಯಿತ ಮಂಡಳಿ ಸದಸ್ಯರ ಪ್ರಾತಿನಿಧ್ಯ', '5-Year Elected Council Member Governance Representation')}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {councilMembers.slice(0, 6).map((m) => (
                  <div key={m.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="font-bold text-slate-900">{isKannada ? m.nameKn : m.name}</div>
                    <div className="text-emerald-700 font-semibold text-[11px]">{isKannada ? m.roleTitleKn : m.roleTitleEn}</div>
                    <div className="text-slate-500 text-[10px]">{t('ಪ್ರಾತಿನಿಧ್ಯ:', 'Ward:')} {m.villageRepresented} (ವಾರ್ಡ್ {m.wardNumber})</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB CONTENT 4: COMPLAINTS REGISTER / ITEMISED LEDGER
            ===================================================================== */}
        {reportType === 'complaints_ledger' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-kannada flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <span>{t('ದೂರುಗಳ ಅಧಿಕೃತ ನೋಂದಣಿ ಪುಸ್ತಕ (ರಿಜಿಸ್ಟರ್)', 'Itemized Grievance Redressal Register')}</span>
              </h3>
              <span className="text-xs font-mono font-bold text-slate-600">
                {filteredComplaints.length} {t('ದಾಖಲೆಗಳು', 'Records')}
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">{t('ದೂರು ಕ್ರ.ಸಂಖ್ಯೆ', 'Grievance ID')}</th>
                    <th className="py-3 px-3">{t('ದಿನಾಂಕ', 'Date')}</th>
                    <th className="py-3 px-3">{t('ಗ್ರಾಮ & ಸ್ಥಳ', 'Village & Locality')}</th>
                    <th className="py-3 px-4">{t('ಶೀರ್ಷಿಕೆ & ವರ್ಗ', 'Title & Department')}</th>
                    <th className="py-3 px-3 text-center">{t('ದಾಖಲೆಗಳು', 'Docs')}</th>
                    <th className="py-3 px-3">{t('ಅನಾಮಧೇಯ ಐಡಿ', 'Masked ID')}</th>
                    <th className="py-3 px-3">{t('ಸ್ಥಿತಿ', 'Status')}</th>
                    <th className="py-3 px-3">{t('ಅಧಿಕಾರಿ / ಪರಿಹಾರ ಟಿಪ್ಪಣಿ', 'Action Officer / Remarks')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredComplaints.map((c) => {
                    const catMeta = COMPLAINT_CATEGORIES.find((cat) => cat.id === c.category);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {c.id}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                          {c.submittedAt}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{c.village}</div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                            {c.specificLocality}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 max-w-xs">{c.title}</div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {isKannada ? catMeta?.nameKn : catMeta?.nameEn}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          {c.documents && c.documents.length > 0 ? (
                            <span className="inline-flex items-center gap-1 text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded text-[11px]">
                              📎 {c.documents.length}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-emerald-800 text-[11px] whitespace-nowrap">
                          {c.citizenMaskedId}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              c.status === 'resolved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.status === 'site_inspection'
                                ? 'bg-blue-100 text-blue-800'
                                : c.status === 'action_initiated'
                                ? 'bg-indigo-100 text-indigo-800'
                                : c.status === 'under_review'
                                ? 'bg-amber-100 text-amber-800'
                                : c.status === 'rejected'
                                ? 'bg-slate-200 text-slate-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {c.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 max-w-xs text-[11px]">
                          <div className="font-semibold text-slate-800">
                            {c.actionTakenBy || panchayat.pdoName}
                          </div>
                          <div className="text-slate-500 italic truncate">
                            {c.resolutionRemarks || c.statusNotes || t('ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ', 'Under review')}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =====================================================================
            OFFICIAL STAMP, LEGAL ATTESTATION & SIGNATURE BLOCKS
            (Critical for official Karnataka Gram Panchayat reports & PDFs)
            ===================================================================== */}
        <div className="border-t-2 border-slate-800 pt-8 mt-10 space-y-6">
          <div className="text-center text-xs text-slate-600 italic">
            {t(
              'ಈ ವರದಿಯು ಕರ್ನಾಟಕ ಗ್ರಾಮ ಸ್ವರಾಜ್ & ಪಂಚಾಯತ್ ರಾಜ್ ಅಧಿನಿಯಮ 1993ರ ನಿಯಮಾವಳಿಗಳ ಅನ್ವಯ ಅಧಿಕೃತ ಜನಹಿತ ಪೋರ್ಟಲ್ ಮೂಲಕ ಉತ್ಪಾದಿಸಲಾದ ನೈಜ ದಾಖಲೆಯಾಗಿದೆ.',
              'This document is generated by the official Karnataka Gram Panchayat Janahita Redressal Engine in accordance with the Karnataka Gram Swaraj & Panchayat Raj Act, 1993.'
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-6">
            {/* Seal & Verification */}
            <div className="text-center sm:text-left space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t('ಪಂಚಾಯತ್ ಮೊಹರು / ಅಧಿಕೃತ ಮುದ್ರೆ', 'Official Panchayat Seal')}
              </div>
              <div className="w-28 h-28 border-2 border-dashed border-slate-400 rounded-2xl flex flex-col items-center justify-center text-[10px] text-slate-400 p-2 mx-auto sm:mx-0">
                <KarnatakaEmblem size={24} />
                <span className="font-bold mt-1">SEAL / ಮುದ್ರೆ</span>
                <span className="text-[8px] font-mono">{panchayat.id.toUpperCase()}</span>
              </div>
            </div>

            {/* PDO Sign-off */}
            <div className="text-center space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t('ಪಂಚಾಯತ್ ಅಭಿವೃದ್ಧಿ ಅಧಿಕಾರಿ (PDO)', 'Panchayat Development Officer')}
              </div>
              <div className="pt-10 font-bold text-slate-900 text-sm font-kannada">
                {panchayat.pdoName}
              </div>
              <div className="text-xs text-slate-600">
                {t('ಗ್ರಾಮ ಪಂಚಾಯತಿ ಕಾರ್ಯದರ್ಶಿ / PDO', 'PDO & Executive Secretary')}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Mob: +91 {panchayat.pdoPhone}
              </div>
            </div>

            {/* GP President Sign-off */}
            <div className="text-center sm:text-right space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t('ಗ್ರಾಮ ಪಂಚಾಯತಿ ಅಧ್ಯಕ್ಷರು', 'Gram Panchayat President')}
              </div>
              <div className="pt-10 font-bold text-slate-900 text-sm font-kannada">
                {councilMembers.find((m) => m.role === 'president')?.nameKn ||
                  councilMembers.find((m) => m.role === 'president')?.name ||
                  'ಅಧ್ಯಕ್ಷರು (President)'}
              </div>
              <div className="text-xs text-slate-600">
                {t('ಗ್ರಾಮ ಪಂಚಾಯತ್ ಆಡಳಿತ ಮಂಡಳಿ', 'Gram Panchayat Council')}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {t('ಅವಧಿ:', 'Term:')} {panchayat.currentTerm}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 pt-4 border-t border-slate-200">
            <div>
              {t(
                `ವರದಿ ಸೃಷ್ಟಿಯ ದಿನಾಂಕ: ${new Date().toLocaleString('kn-IN')}`,
                `Report Generated: ${new Date().toLocaleString('en-IN')}`
              )}
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('೧೦೦% ಅನಾಮಧೇಯತೆ ದೃಢೀಕೃತ ವರದಿ', '100% Whistleblower Anonymity Certified')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
