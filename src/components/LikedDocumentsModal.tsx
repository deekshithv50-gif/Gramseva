import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  FileText,
  Download,
  Eye,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Printer,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { TrackedDocumentRecord, UserSession } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  getTrackedDocuments,
  toggleLikeDocument,
  recordDocumentUsage,
  subscribeToDocumentUpdates,
  getEffectiveUserIdentifier,
} from '../utils/documentTracker';

interface LikedDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserSession | null;
  onViewComplaint?: (complaintId: string) => void;
}

export const LikedDocumentsModal: React.FC<LikedDocumentsModalProps> = ({
  isOpen,
  onClose,
  user,
  onViewComplaint,
}) => {
  const { t, isKannada, isEnglish } = useLanguage();
  const [documents, setDocuments] = useState<TrackedDocumentRecord[]>([]);
  const [filterMode, setFilterMode] = useState<'all_tracked' | 'my_liked' | 'most_popular'>('all_tracked');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuditDoc, setSelectedAuditDoc] = useState<TrackedDocumentRecord | null>(null);
  const [activePreviewDoc, setActivePreviewDoc] = useState<TrackedDocumentRecord | null>(null);

  const currentUser = getEffectiveUserIdentifier(user);

  useEffect(() => {
    if (isOpen) {
      setDocuments(getTrackedDocuments());
      return subscribeToDocumentUpdates(() => {
        setDocuments(getTrackedDocuments());
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleLike = (doc: TrackedDocumentRecord) => {
    const updated = toggleLikeDocument(doc.documentId, user, doc);
    if (selectedAuditDoc && selectedAuditDoc.documentId === doc.documentId) {
      setSelectedAuditDoc(updated);
    }
  };

  const handleUseDocument = (doc: TrackedDocumentRecord, action: 'viewed' | 'downloaded' | 'printed') => {
    const updated = recordDocumentUsage(doc.documentId, action, user, doc);
    if (selectedAuditDoc && selectedAuditDoc.documentId === doc.documentId) {
      setSelectedAuditDoc(updated);
    }

    if (action === 'viewed') {
      setActivePreviewDoc(doc);
    } else if (action === 'downloaded') {
      // Simulate file download
      const blob = new Blob([`Official Gram Panchayat Document: ${doc.documentName}\nComplaint Ref: ${doc.complaintId}\nTitle: ${doc.complaintTitle}\nCategory: ${doc.category}\nTimestamp: ${new Date().toISOString()}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = doc.dataUrl || url;
      a.download = doc.documentName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (action === 'printed') {
      window.print();
    }
  };

  const isLikedByMe = (doc: TrackedDocumentRecord) => {
    return doc.likedBy.some((u) => u.userId === currentUser.userId);
  };

  // Filter and search
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.complaintId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.complaintTitle.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === 'my_liked') {
      return isLikedByMe(doc);
    }
    return true;
  }).sort((a, b) => {
    if (filterMode === 'most_popular') {
      return b.likesCount + b.usageCount - (a.likesCount + a.usageCount);
    }
    return (b.likesCount || 0) - (a.likesCount || 0);
  });

  const totalLikesAcrossDocs = documents.reduce((sum, d) => sum + (d.likesCount || 0), 0);
  const totalUsesAcrossDocs = documents.reduce((sum, d) => sum + (d.usageCount || 0), 0);
  const myLikedCount = documents.filter((d) => isLikedByMe(d)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/20 border border-rose-400/40 rounded-xl text-rose-300">
              <Heart className="w-6 h-6 fill-rose-400 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-kannada">
                  {t('ಮೆಚ್ಚಿದ & ಬಳಸಲಾದ ದಾಖಲೆಗಳ ನೋಂದಣಿ', 'Liked Documents & Access Tracking Registry')}
                </h3>
                <span className="text-[10px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full">
                  {documents.length} {t('ದಾಖಲೆಗಳು', 'Docs')}
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                {t(
                  'ಯಾವ ದಾಖಲೆಗಳನ್ನು ಯಾರು ಮೆಚ್ಚಿದ್ದಾರೆ ಮತ್ತು ಬಳಸಿದ್ದಾರೆ ಎಂಬುದರ ಅಧಿಕೃತ ಟ್ರ್ಯಾಕಿಂಗ್ ವ್ಯವಸ್ಥೆ.',
                  'Official tracking of who liked and accessed/used grievance documents with audit history.'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Metric Strip */}
        <div className="grid grid-cols-3 divide-x divide-slate-200 bg-slate-50 border-b border-slate-200 text-center py-2.5 text-xs">
          <div>
            <span className="text-slate-500">{t('ಒಟ್ಟು ಮೆಚ್ಚುಗೆಗಳು', 'Total Likes')}: </span>
            <span className="font-bold text-rose-600 font-mono">❤️ {totalLikesAcrossDocs}</span>
          </div>
          <div>
            <span className="text-slate-500">{t('ಒಟ್ಟು ಬಳಕೆಗಳು', 'Total Accesses')}: </span>
            <span className="font-bold text-emerald-700 font-mono">👁️ {totalUsesAcrossDocs}</span>
          </div>
          <div>
            <span className="text-slate-500">{t('ನನ್ನ ಮೆಚ್ಚಿನ ದಾಖಲೆಗಳು', 'My Liked')}: </span>
            <span className="font-bold text-slate-900 font-mono">{myLikedCount}</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterMode('all_tracked')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterMode === 'all_tracked'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t('ಎಲ್ಲಾ ದಾಖಲೆಗಳು', 'All Tracked Documents')}
            </button>
            <button
              onClick={() => setFilterMode('my_liked')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                filterMode === 'my_liked'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>{t('ನಾನು ಮೆಚ್ಚಿದವು', 'My Liked')}</span>
              <span className="text-[10px] opacity-80">({myLikedCount})</span>
            </button>
            <button
              onClick={() => setFilterMode('most_popular')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filterMode === 'most_popular'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t('ಹೆಚ್ಚು ಜನಪ್ರಿಯ', 'Most Active')}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('ದಾಖಲೆ / ದೂರು ಐಡಿ ಹುಡುಕಿ...', 'Search document or complaint...')}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Document List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => {
              const liked = isLikedByMe(doc);
              const latestLiker = doc.likedBy[0];
              const latestUser = doc.usageHistory[0];

              return (
                <div
                  key={doc.documentId}
                  className="bg-white rounded-xl border border-slate-200 hover:border-emerald-300 transition p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  {/* Left: Document details & Origin complaint */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-900 text-sm truncate max-w-xs sm:max-w-md">
                        {doc.documentName}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono border">
                        {(doc.fileSize / 1024).toFixed(1)} KB
                      </span>
                      <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                        {doc.complaintId}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-1">
                      {doc.complaintTitle}
                    </p>

                    {/* Who liked & Who used summary tags */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] pt-1">
                      {/* Liked count badge */}
                      <button
                        onClick={() => setSelectedAuditDoc(doc)}
                        className="inline-flex items-center gap-1 text-rose-700 hover:text-rose-900 font-semibold cursor-pointer bg-rose-50 px-2 py-0.5 rounded border border-rose-200"
                        title={t('ಯಾರು ಮೆಚ್ಚಿದ್ದಾರೆ ಎಂಬುದನ್ನು ನೋಡಿ', 'Click to view who liked this')}
                      >
                        <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                        <span>{doc.likesCount} {t('ಮೆಚ್ಚುಗೆಗಳು', 'Likes')}</span>
                        {latestLiker && (
                          <span className="text-[10px] text-rose-500 font-normal hidden md:inline">
                            • {t('ಇತ್ತೀಚೆಗೆ:', 'Recent:')} {latestLiker.userName}
                          </span>
                        )}
                      </button>

                      {/* Usage count badge */}
                      <button
                        onClick={() => setSelectedAuditDoc(doc)}
                        className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-semibold cursor-pointer bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                        title={t('ಯಾರು ಬಳಸಿದ್ದಾರೆ ಎಂಬ ವಿವರ ನೋಡಿ', 'Click to view who accessed and used this')}
                      >
                        <Eye className="w-3 h-3 text-emerald-700" />
                        <span>{doc.usageCount} {t('ಬಾರಿ ಬಳಸಲಾಗಿದೆ', 'Uses')}</span>
                        {latestUser && (
                          <span className="text-[10px] text-emerald-700 font-normal hidden md:inline">
                            • {latestUser.action} by {latestUser.userName}
                          </span>
                        )}
                      </button>

                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 text-[10px] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {doc.uploadedAt}
                      </span>
                    </div>
                  </div>

                  {/* Right Actions: Like Button, View Button, Download Button, Audit Button */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                    {/* Toggle Like Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleLike(doc)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                        liked
                          ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600'
                      }`}
                      title={liked ? t('ಮೆಚ್ಚುಗೆ ತೆಗೆದುಹಾಕಿ', 'Unlike Document') : t('ದಾಖಲೆ ಮೆಚ್ಚಿ', 'Like Document')}
                    >
                      <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{liked ? t('ಮೆಚ್ಚಲಾಗಿದೆ', 'Liked') : t('ಮೆಚ್ಚು', 'Like')}</span>
                    </button>

                    {/* View Preview */}
                    <button
                      type="button"
                      onClick={() => handleUseDocument(doc, 'viewed')}
                      className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-medium transition cursor-pointer"
                      title={t('ದಾಖಲೆ ವೀಕ್ಷಿಸಿ', 'View Document Preview')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Download */}
                    <button
                      type="button"
                      onClick={() => handleUseDocument(doc, 'downloaded')}
                      className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-medium transition cursor-pointer"
                      title={t('ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ', 'Download Document')}
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Open Audit Breakdown */}
                    <button
                      type="button"
                      onClick={() => setSelectedAuditDoc(doc)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition cursor-pointer"
                      title={t('ಸಂಪೂರ್ಣ ಟ್ರ್ಯಾಕಿಂಗ್ ಇತಿಹಾಸ', 'Full Tracking Audit')}
                    >
                      <span>{t('ಟ್ರ್ಯಾಕಿಂಗ್', 'Track')}</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 space-y-2 text-slate-500">
              <Heart className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-sm text-slate-700">
                {t('ಯಾವುದೇ ಮೆಚ್ಚಿದ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ', 'No matching liked documents found')}
              </p>
              <p className="text-xs text-slate-400">
                {t(
                  'ಯಾವುದೇ ದೂರಿನ ದಾಖಲೆಯ ಮೇಲಿನ ಹೃದಯ ಗುರುತನ್ನು (❤️ Like) ಒತ್ತಿ ಇಲ್ಲಿ ಪಟ್ಟಿ ಮಾಡಬಹುದು.',
                  'Click the Heart (❤️ Like) icon on any grievance attachment to save and track it here.'
                )}
              </p>
            </div>
          )}
        </div>

        {/* Audit Popover: Who Liked & Who Used Breakdown */}
        {selectedAuditDoc && (
          <div className="p-4 bg-slate-900 text-white border-t border-slate-800 space-y-3 animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold font-kannada">
                  {t('ದಾಖಲೆ ಟ್ರ್ಯಾಕಿಂಗ್ ವಿವರಣೆ:', 'Document Tracking & Usage Audit:')}{' '}
                  <span className="text-amber-300">{selectedAuditDoc.documentName}</span>
                </h4>
              </div>
              <button
                onClick={() => setSelectedAuditDoc(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded"
              >
                ✕ {t('ಮುಚ್ಚಿ', 'Close')}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Who Liked List */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-2">
                <div className="font-bold text-rose-300 flex items-center justify-between">
                  <span>❤️ {t('ಮೆಚ್ಚಿದ ಬಳಕೆದಾರರು', 'Who Liked')} ({selectedAuditDoc.likedBy.length})</span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {selectedAuditDoc.likedBy.length > 0 ? (
                    selectedAuditDoc.likedBy.map((liker, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-[11px] p-1.5 rounded bg-slate-700/50 border border-slate-600/50"
                      >
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-rose-300" />
                          <span className="font-semibold">{liker.userName}</span>
                          <span className="text-[10px] text-slate-400">
                            ({liker.role === 'official_pdo' ? 'PDO' : liker.role === 'citizen' ? 'Citizen' : 'Public'})
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">{liker.likedAt}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 text-[11px]">{t('ಇನ್ನೂ ಯಾರೂ ಮೆಚ್ಚಿಲ್ಲ', 'No likes yet')}</div>
                  )}
                </div>
              </div>

              {/* Who Used List */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-2">
                <div className="font-bold text-emerald-300 flex items-center justify-between">
                  <span>👁️ {t('ಬಳಸಿದ ಇತಿಹಾಸ', 'Access & Usage History')} ({selectedAuditDoc.usageHistory.length})</span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {selectedAuditDoc.usageHistory.length > 0 ? (
                    selectedAuditDoc.usageHistory.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between text-[11px] p-1.5 rounded bg-slate-700/50 border border-slate-600/50"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="px-1 py-0.2 rounded text-[10px] font-mono font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {log.action}
                          </span>
                          <span>{log.userName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 text-[11px]">{t('ಇನ್ನೂ ಯಾವುದೇ ಬಳಕೆ ದಾಖಲಾಗಿಲ್ಲ', 'No access logs yet')}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>
              {t(
                'ಪ್ರತಿಯೊಂದು ದಾಖಲೆ ಡೌನ್‌ಲೋಡ್ & ಮೆಚ್ಚುಗೆಯು ಪಾರದರ್ಶಕತೆಗಾಗಿ ಆಡಿಟ್ ಆಗುತ್ತದೆ.',
                'All document interactions are permanently audited for Karnataka Gram Swaraj transparency.'
              )}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold transition cursor-pointer"
          >
            {t('ಮುಚ್ಚಿ', 'Close')}
          </button>
        </div>
      </div>

      {/* Document Quick View Lightbox */}
      {activePreviewDoc && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="font-bold text-sm text-slate-900 truncate">
                {activePreviewDoc.documentName}
              </div>
              <button
                onClick={() => setActivePreviewDoc(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
              {activePreviewDoc.dataUrl ? (
                <img
                  src={activePreviewDoc.dataUrl}
                  alt={activePreviewDoc.documentName}
                  className="max-h-64 mx-auto rounded object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="space-y-2">
                  <FileText className="w-16 h-16 text-emerald-700 mx-auto" />
                  <div className="text-xs text-slate-600 font-mono">
                    {activePreviewDoc.documentName} ({(activePreviewDoc.fileSize / 1024).toFixed(1)} KB)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {t('ಅಧಿಕೃತ ಗ್ರಾಮ ಪಂಚಾಯತ್ ಕುಂದುಕೊರತೆ ಸಾಕ್ಷ್ಯ ದಾಖಲೆ.', 'Official Gram Panchayat grievance evidence file.')}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleToggleLike(activePreviewDoc)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                  isLikedByMe(activePreviewDoc)
                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLikedByMe(activePreviewDoc) ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isLikedByMe(activePreviewDoc) ? t('ಮೆಚ್ಚಲಾಗಿದೆ', 'Liked') : t('ಮೆಚ್ಚು', 'Like')}</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleUseDocument(activePreviewDoc, 'downloaded')}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('ಡೌನ್‌ಲೋಡ್', 'Download')}</span>
                </button>
                <button
                  onClick={() => setActivePreviewDoc(null)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold"
                >
                  {t('ಮುಕ್ತಾಯ', 'Dismiss')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
