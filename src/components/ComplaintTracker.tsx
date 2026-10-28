import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  MapPin,
  ShieldCheck,
  Calendar,
  ExternalLink,
  ChevronRight,
  Filter,
  Globe,
  Heart,
  Download,
  Eye,
  Sparkles,
} from 'lucide-react';
import { Complaint, ComplaintStatus, UserSession, TrackedDocumentRecord } from '../types';
import { COMPLAINT_CATEGORIES } from '../data/panchayatData';
import { useLanguage } from '../context/LanguageContext';
import { LikedDocumentsModal } from './LikedDocumentsModal';
import {
  getTrackedDocuments,
  toggleLikeDocument,
  recordDocumentUsage,
  isDocumentLiked,
  syncDocumentsWithComplaints,
  subscribeToDocumentUpdates,
} from '../utils/documentTracker';

interface ComplaintTrackerProps {
  complaints: Complaint[];
  user: UserSession | null;
  onOpenComplaintForm: () => void;
}

const STATUS_LABELS: Record<
  ComplaintStatus,
  { labelEn: string; labelKn: string; color: string; stepIndex: number }
> = {
  submitted: {
    labelEn: 'Submitted to Panchayat',
    labelKn: 'ದೂರು ದಾಖಲಾಗಿದೆ',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    stepIndex: 1,
  },
  under_review: {
    labelEn: 'Under Review by PDO',
    labelKn: 'ಪಿ.ಡಿ.ಒ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    stepIndex: 2,
  },
  site_inspection: {
    labelEn: 'Field / Site Inspection',
    labelKn: 'ಸ್ಥಳ ತಪಾಸಣೆ ಹಂತ',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    stepIndex: 3,
  },
  action_initiated: {
    labelEn: 'Action Initiated',
    labelKn: 'ಕ್ರಮ ಕೈಗೊಳ್ಳಲಾಗಿದೆ',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    stepIndex: 4,
  },
  resolved: {
    labelEn: 'Resolved & Closed',
    labelKn: 'ಸಮಸ್ಯೆ ಪರಿಹರಿಸಲಾಗಿದೆ',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    stepIndex: 5,
  },
  rejected: {
    labelEn: 'Rejected / Invalid',
    labelKn: 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ',
    color: 'bg-rose-100 text-rose-800 border-rose-300',
    stepIndex: 0,
  },
};

export const ComplaintTracker: React.FC<ComplaintTrackerProps> = ({
  complaints,
  user,
  onOpenComplaintForm,
}) => {
  const { t, isKannada, isEnglish } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVillageFilter, setSelectedVillageFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [activeComplaintModal, setActiveComplaintModal] = useState<Complaint | null>(null);
  const [showLikedDocsModal, setShowLikedDocsModal] = useState(false);
  const [trackedDocs, setTrackedDocs] = useState<TrackedDocumentRecord[]>([]);

  // Synchronize documents with tracking registry and listen for updates
  useEffect(() => {
    syncDocumentsWithComplaints(complaints);
    setTrackedDocs(getTrackedDocuments());
    return subscribeToDocumentUpdates(() => {
      setTrackedDocs(getTrackedDocuments());
    });
  }, [complaints]);

  // Helper to get status string based on active language
  const getStatusText = (status: ComplaintStatus) => {
    const meta = STATUS_LABELS[status];
    if (isKannada) return meta.labelKn;
    if (isEnglish) return meta.labelEn;
    return `${meta.labelKn} • ${meta.labelEn}`;
  };

  const getDocTrackingInfo = (docId: string) => {
    return trackedDocs.find((d) => d.documentId === docId);
  };

  const handleDocLike = (docId: string, complaint: Complaint, docName: string, docSize: number, docType: string) => {
    toggleLikeDocument(docId, user, {
      documentId: docId,
      documentName: docName,
      complaintId: complaint.id,
      complaintTitle: complaint.title,
      category: complaint.category,
      fileSize: docSize,
      fileType: docType,
    });
  };

  const handleDocDownload = (docId: string, complaint: Complaint, docName: string, docSize: number, docType: string, dataUrl?: string) => {
    recordDocumentUsage(docId, 'downloaded', user, {
      documentId: docId,
      documentName: docName,
      complaintId: complaint.id,
      complaintTitle: complaint.title,
      category: complaint.category,
      fileSize: docSize,
      fileType: docType,
      dataUrl,
    });

    // Simulated download
    const blob = new Blob([`Official Karnataka Gram Panchayat Grievance Attachment\nDocument: ${docName}\nComplaint: ${complaint.id} - ${complaint.title}\nCategory: ${complaint.category}\nTimestamp: ${new Date().toISOString()}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = dataUrl || url;
    a.download = docName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalLikedCount = trackedDocs.reduce((sum, d) => sum + (d.likesCount || 0), 0);

  // Filter complaints based on query, village, and category
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.citizenMaskedId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesVillage =
      selectedVillageFilter === 'all' || c.village === selectedVillageFilter;

    const matchesCategory =
      selectedCategoryFilter === 'all' || c.category === selectedCategoryFilter;

    return matchesSearch && matchesVillage && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Open Public Access Notice Banner */}
      <div className="bg-emerald-50/90 border border-emerald-300/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-emerald-950 font-kannada flex items-center gap-2 flex-wrap">
              <span>{t('ಮುಕ್ತ ಸಾರ್ವಜನಿಕ ವೀಕ್ಷಣೆ', 'Open Public Tracking')}</span>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                {t('ಯಾವುದೇ ಲಾಗಿನ್ ಅಗತ್ಯವಿಲ್ಲ', 'No Login Required')}
              </span>
            </div>
            <p className="text-emerald-900 text-[11px] mt-0.5">
              {t(
                'ಗ್ರಾಮದ ನಾಗರಿಕರು ಯಾವುದೇ ಲಾಗಿನ್ ಇಲ್ಲದೆಯೇ ದೂರುಗಳ ಸ್ಥಿತಿ, ಪರಿಹಾರದ ಹಂತಗಳು ಮತ್ತು ಪಿ.ಡಿ.ಒ ಟಿಪ್ಪಣಿಗಳನ್ನು ನೇರವಾಗಿ ವೀಕ್ಷಿಸಬಹುದು.',
                'Citizens can openly inspect grievance progress, timeline stages, and Panchayat inspection reports without signing in.'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Liked Documents Registry Button */}
          <button
            onClick={() => setShowLikedDocsModal(true)}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl transition cursor-pointer text-xs shrink-0 inline-flex items-center gap-1.5 shadow-2xs"
            title={t('ಮೆಚ್ಚಿದ & ಬಳಸಲಾದ ದಾಖಲೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ', 'View Liked and Tracked Documents')}
          >
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>{t('ಮೆಚ್ಚಿದ ದಾಖಲೆಗಳು', 'Liked Documents')}</span>
            <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {totalLikedCount}
            </span>
          </button>

          <button
            onClick={onOpenComplaintForm}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition cursor-pointer text-xs shrink-0 shadow-2xs"
          >
            {t('ಹೊಸ ದೂರು ದಾಖಲಿಸಿ', 'Lodge Grievance')}
          </button>
        </div>
      </div>

      {/* Top Search & Filter Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-kannada">
              {t('ದೂರುಗಳ ಸ್ಥಿತಿ ಪರಿಶೀಲನೆ', 'Track Grievance Status')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t(
                'ನಿಮ್ಮ ದೂರು ನೋಂದಣಿ ಸಂಖ್ಯೆ (ID) ಅಥವಾ ಗ್ರಾಮದ ಹೆಸರಿನ ಮೂಲಕ ಪರಿಶೀಲಿಸಿ.',
                'Enter complaint registration ID or filter by constituent village jurisdiction.'
              )}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative max-w-sm w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(
                'ದೂರು ID (ಉದಾ: GP-KA-2026) ಅಥವಾ ವಿವರಣೆ ಹುಡುಕಿ...',
                'Search by ID (e.g. GP-KA-2026) or keywords...'
              )}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-bold">
            <Filter className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t('ಫಿಲ್ಟರ್:', 'Filter:')}</span>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg font-medium text-slate-700"
          >
            <option value="all">{t('ಎಲ್ಲಾ ವಿಭಾಗಗಳು', 'All Categories')}</option>
            {COMPLAINT_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {isKannada ? c.nameKn : isEnglish ? c.nameEn : `${c.nameKn} (${c.nameEn})`}
              </option>
            ))}
          </select>

          {/* Village Filter */}
          <select
            value={selectedVillageFilter}
            onChange={(e) => setSelectedVillageFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg font-medium text-slate-700"
          >
            <option value="all">{t('ಎಲ್ಲಾ ಗ್ರಾಮಗಳು', 'All Constituent Villages')}</option>
            <option value="Nandi Village (Main)">
              {t('ನಂದಿ ಗ್ರಾಮ (ಮುಖ್ಯ)', 'Nandi Village (Main)')}
            </option>
            <option value="Sultanpet">{t('ಸುಲ್ತಾನ್‌ಪೇಟೆ', 'Sultanpet')}</option>
            <option value="Muddenahalli">{t('ಮುದ್ದೇನಹಳ್ಳಿ', 'Muddenahalli')}</option>
            <option value="Karahalli Cross">{t('ಕಾರಹಳ್ಳಿ ಕ್ರಾಸ್', 'Karahalli Cross')}</option>
            <option value="Gopalakrishna Halli">{t('ಗೋಪಾಲಕೃಷ್ಣ ಹಳ್ಳಿ', 'Gopalakrishna Halli')}</option>
            <option value="Kattigenahalli">{t('ಕತ್ತಿಗೇನಹಳ್ಳಿ', 'Kattigenahalli')}</option>
            <option value="Yelagere Gate">{t('ಯಲಗೆರೆ ಗೇಟ್', 'Yelagere Gate')}</option>
          </select>

          <span className="text-slate-400 text-xs ml-auto">
            {t('ಒಟ್ಟು ಫಲಿತಾಂಶಗಳು:', 'Total Results:')} {filteredComplaints.length}
          </span>
        </div>
      </div>

      {/* Complaints Feed List */}
      <div className="space-y-4">
        {filteredComplaints.length > 0 ? (
          filteredComplaints.map((complaint) => {
            const statusConfig = STATUS_LABELS[complaint.status];

            return (
              <div
                key={complaint.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 transition p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-300">
                      {complaint.id}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusConfig.color}`}
                    >
                      {getStatusText(complaint.status)}
                    </span>
                    {complaint.priority === 'urgent' && (
                      <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                        {t('ತುರ್ತು', 'Urgent')}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {complaint.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {complaint.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      {complaint.village} ({complaint.specificLocality})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {t('ದಾಖಲಾದ ದಿನಾಂಕ:', 'Lodged Date:')} {complaint.submittedAt}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-800 font-mono font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {complaint.citizenMaskedId}
                    </span>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0">
                  {complaint.documents.length > 0 && (
                    <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                      <FileText className="w-3.5 h-3.5 text-slate-600" />
                      {complaint.documents.length} {t('ದಾಖಲೆಗಳು', 'files')}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveComplaintModal(complaint)}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <span>{t('ವಿವರ ನೋಡಿ', 'View Details')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">
              {t('ಯಾವುದೇ ದೂರುಗಳು ಕಂಡುಬಂದಿಲ್ಲ', 'No matching complaints found')}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t(
                'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹುಡುಕಾಟ ಪದವನ್ನು ಪರಿಶೀಲಿಸಿ ಅಥವಾ ಹೊಸ ದೂರನ್ನು ದಾಖಲಿಸಿ.',
                'Please check your search term or lodge a new complaint directly to the Gram Panchayat.'
              )}
            </p>
            <button
              onClick={onOpenComplaintForm}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition"
            >
              {t('ಹೊಸ ದೂರು ದಾಖಲಿಸಿ', 'Lodge New Grievance')}
            </button>
          </div>
        )}
      </div>

      {/* Active Complaint Detail Modal */}
      {activeComplaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white p-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-white/20 px-2 py-0.5 rounded font-bold">
                    {activeComplaintModal.id}
                  </span>
                  <span className="text-xs text-emerald-200 font-mono">
                    Token: {activeComplaintModal.citizenMaskedId}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1 leading-snug">
                  {activeComplaintModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveComplaintModal(null)}
                aria-label="Close dialog"
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 overflow-y-auto text-xs">
              {/* Progress Flow Steps */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 mb-3 font-kannada">
                  {t('ಪ್ರಸ್ತುತ ಪ್ರಗತಿ', 'Grievance Resolution Workflow')}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px]">
                  {[
                    { key: 'submitted', kn: '1. ದಾಖಲು', en: '1. Submitted' },
                    { key: 'under_review', kn: '2. ಪರಿಶೀಲನೆ', en: '2. Review' },
                    { key: 'site_inspection', kn: '3. ಸ್ಥಳ ಭೇಟಿ', en: '3. Inspect' },
                    { key: 'action_initiated', kn: '4. ಕ್ರಮ', en: '4. Action' },
                    { key: 'resolved', kn: '5. ಪರಿಹಾರ', en: '5. Resolved' },
                  ].map((step, idx) => {
                    const currentIdx = STATUS_LABELS[activeComplaintModal.status].stepIndex;
                    const isReached = currentIdx >= idx + 1;
                    const isCurrent = currentIdx === idx + 1;

                    return (
                      <div
                        key={step.key}
                        className={`p-2 rounded-lg border font-bold ${
                          isCurrent
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                            : isReached
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-white text-slate-400 border-slate-200'
                        }`}
                      >
                        {t(step.kn, step.en)}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Full Description */}
              <div>
                <div className="font-bold text-slate-800 font-kannada mb-1">
                  {t('ದೂರಿನ ವಿವರಣೆ:', 'Grievance Narrative:')}
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {activeComplaintModal.description}
                </div>
              </div>

              {/* Location & Jurisdiction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500">{t('ಗ್ರಾಮ:', 'Village:')}</span>{' '}
                  <span className="font-bold text-slate-900">{activeComplaintModal.village}</span>
                </div>
                <div>
                  <span className="text-slate-500">{t('ಸ್ಥಳ:', 'Locality:')}</span>{' '}
                  <span className="font-bold text-slate-900">{activeComplaintModal.specificLocality}</span>
                </div>
                <div>
                  <span className="text-slate-500">{t('ವಾರ್ಡ್ ಸಂಖ್ಯೆ:', 'Ward No:')}</span>{' '}
                  <span className="font-bold text-slate-900">{activeComplaintModal.wardNumber || t('ಸಾಮಾನ್ಯ', 'General')}</span>
                </div>
                <div>
                  <span className="text-slate-500">{t('ದಾಖಲಾದ ದಿನಾಂಕ:', 'Lodged Date:')}</span>{' '}
                  <span className="font-bold text-slate-900">{activeComplaintModal.submittedAt}</span>
                </div>
              </div>

              {/* Official Action Notes from PDO / Panchayat Desk */}
              {activeComplaintModal.statusNotes && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <div className="font-bold text-emerald-950 font-kannada flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>{t('ಪಂಚಾಯತ್ ಅಧಿಕಾರಿಗಳ ನಡಾವಳಿ:', 'Official Action Taken Notes:')}</span>
                  </div>
                  <p className="text-slate-700 pl-5 leading-relaxed">
                    {activeComplaintModal.statusNotes}
                  </p>
                  {activeComplaintModal.actionTakenBy && (
                    <div className="text-[10px] text-emerald-800 pl-5 font-mono pt-1">
                      {t('ಕ್ರಮ ಕೈಗೊಂಡ ಅಧಿಕಾರಿ:', 'Action Officer:')} {activeComplaintModal.actionTakenBy} ({activeComplaintModal.actionTakenAt})
                    </div>
                  )}
                </div>
              )}

              {/* Attached Documents with Like & Usage Tracking */}
              {activeComplaintModal.documents.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-slate-800 font-kannada">
                      {t('ಲಗತ್ತಿಸಲಾದ ದಾಖಲೆಗಳು (ಟ್ರ್ಯಾಕಿಂಗ್ ಸಕ್ರಿಯ)', 'Attached Documents (Tracked)')} ({activeComplaintModal.documents.length}):
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLikedDocsModal(true)}
                      className="text-[11px] text-rose-600 hover:text-rose-800 font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Heart className="w-3 h-3 fill-rose-500" />
                      <span>{t('ಮೆಚ್ಚಿದ ದಾಖಲೆಗಳ ಪಟ್ಟಿ ನೋಡಿ', 'All Liked Documents')}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {activeComplaintModal.documents.map((doc) => {
                      const trackInfo = getDocTrackingInfo(doc.id);
                      const isLiked = isDocumentLiked(doc.id, user);
                      const likes = trackInfo?.likesCount ?? (doc.likesCount || 0);
                      const uses = trackInfo?.usageCount ?? (doc.usageCount || 0);

                      return (
                        <div
                          key={doc.id}
                          className="p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {doc.type.startsWith('image/') && doc.dataUrl ? (
                              <img
                                src={doc.dataUrl}
                                alt="thumb"
                                className="w-10 h-10 rounded-lg object-cover border shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="p-2 bg-slate-100 text-emerald-800 rounded-lg shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-800 truncate text-xs">
                                {doc.name}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                                <span>{(doc.size / 1024).toFixed(1)} KB</span>
                                <span>•</span>
                                <span className="text-rose-600 font-semibold flex items-center gap-0.5">
                                  <Heart className="w-2.5 h-2.5 fill-current" /> {likes} {t('ಮೆಚ್ಚುಗೆ', 'Likes')}
                                </span>
                                <span>•</span>
                                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                                  <Eye className="w-2.5 h-2.5" /> {uses} {t('ಬಳಕೆಗಳು', 'Uses')}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons: Like, Download & View */}
                          <div className="flex items-center gap-1.5 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleDocLike(doc.id, activeComplaintModal, doc.name, doc.size, doc.type)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border ${
                                isLiked
                                  ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600'
                              }`}
                              title={isLiked ? t('ಮೆಚ್ಚುಗೆ ತೆಗೆದುಹಾಕಿ', 'Unlike') : t('ದಾಖಲೆ ಮೆಚ್ಚಿ', 'Like Document')}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                              <span>{isLiked ? t('ಮೆಚ್ಚಲಾಗಿದೆ', 'Liked') : t('ಮೆಚ್ಚು', 'Like')}</span>
                              <span className="text-[10px] font-mono">({likes})</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDocDownload(doc.id, activeComplaintModal, doc.name, doc.size, doc.type, doc.dataUrl)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              title={t('ಡೌನ್‌ಲೋಡ್ & ಬಳಕೆ ದಾಖಲಿಸಿ', 'Download & Record Usage')}
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>{t('ಡೌನ್‌ಲೋಡ್', 'Download')}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowLikedDocsModal(true)}
                className="text-xs text-rose-700 hover:text-rose-900 font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-500" />
                <span>{t('ಮೆಚ್ಚಿದ ದಾಖಲೆಗಳ ನೋಂದಣಿ', 'Open Liked Documents Registry')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveComplaintModal(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                {t('ಮುಚ್ಚಿ', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liked Documents & Access Tracker Modal */}
      <LikedDocumentsModal
        isOpen={showLikedDocsModal}
        onClose={() => setShowLikedDocsModal(false)}
        user={user}
      />
    </div>
  );
};

