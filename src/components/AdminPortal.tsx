import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  FileText,
  MapPin,
  Calendar,
  Send,
  EyeOff,
  Bell,
  Volume2,
  Filter,
  Sparkles,
  Lock,
  KeyRound,
  BarChart3,
} from 'lucide-react';
import { Complaint, ComplaintStatus, UserSession, GramPanchayatInfo } from '../types';
import { COMPLAINT_CATEGORIES } from '../data/panchayatData';
import { useLanguage } from '../context/LanguageContext';

interface AdminPortalProps {
  complaints: Complaint[];
  panchayat: GramPanchayatInfo;
  user: UserSession | null;
  onUpdateComplaintStatus: (
    id: string,
    newStatus: ComplaintStatus,
    notes: string,
    actionOfficer: string
  ) => void;
  onRequirePdoLogin: () => void;
  onSwitchToPublicTrack?: () => void;
  onOpenReports?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  complaints,
  panchayat,
  user,
  onUpdateComplaintStatus,
  onRequirePdoLogin,
  onSwitchToPublicTrack,
  onOpenReports,
}) => {
  const { t, isKannada } = useLanguage();
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    complaints[0] || null
  );
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('under_review');
  const [actionNotes, setActionNotes] = useState('');
  const [officerName, setOfficerName] = useState('PDO Sri Manjunath Gowda');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showStatusModal, setShowStatusModal] = useState(false);

  const isPdo = user?.role === 'official_pdo';

  // Secure Authorization Gate for PDO Console
  if (!isPdo) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-12 shadow-sm text-center max-w-2xl mx-auto space-y-6 my-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700">
              <Lock className="w-10 h-10" />
            </div>
            <div className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-700 text-white rounded-full shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
            <span>{t('ಅಧಿಕೃತ ಆಡಳಿತ ವಿಭಾಗ (ಸುರಕ್ಷಿತ)', 'Official Administration (Secured)')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-kannada">
            {t('ಪಂಚಾಯತ್ ಅಭಿವೃದ್ಧಿ ಅಧಿಕಾರಿ (PDO) ದೃಢೀಕರಣ ಕಡ್ಡಾಯ', 'Panchayat Development Officer (PDO) Verification Required')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            {t(
              'ಆಡಳಿತಾತ್ಮಕ ಕುಂದುಕೊರತೆ ನಿಯಂತ್ರಣ ಫಲಕವು ಕೇವಲ ಗ್ರಾಮ ಪಂಚಾಯತ್ ಅಭಿವೃದ್ಧಿ ಅಧಿಕಾರಿ (PDO) ಹಾಗೂ ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರಕ್ಕೆ ಸೀಮಿತವಾಗಿದೆ. ನಾಗರಿಕರು ಲಾಗಿನ್ ಇಲ್ಲದೆಯೇ ದೂರುಗಳ ಸಾರ್ವಜನಿಕ ಪ್ರಗತಿ ಮತ್ತು 5 ವರ್ಷಗಳ ಗ್ರಾಮ ಪಂಚಾಯಿತಿ ಮಂಡಳಿ ಸದಸ್ಯರ ಪಟ್ಟಿಯನ್ನು ಮುಕ್ತವಾಗಿ ವೀಕ್ಷಿಸಬಹುದು.',
              'The Administrative Redressal Console is strictly restricted to designated Panchayat Development Officers (PDO) and civil authorities. Citizen complaint statuses and 5-year council rosters remain open for public viewing without login.'
            )}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs space-y-2.5 max-w-md mx-auto">
          <div className="font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>{t('ಭದ್ರತಾ ಹಾಗೂ ನಿಯಂತ್ರಣ ನಿಯಮಗಳು:', 'Security & Governance Rules:')}</span>
          </div>
          <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
            <li>{t('ದೂರುಗಳ ಸ್ಥಿತಿ ನವೀಕರಣ ಮತ್ತು ಸ್ಥಳ ತಪಾಸಣೆ ಆದೇಶಗಳಿಗೆ ಪಿ.ಡಿ.ಒ ಲಾಗಿನ್ ಅಗತ್ಯ.', 'PDO login required to update complaint status and issue site inspection notices.')}</li>
            <li>{t('ಅಧಿಕೃತ ಕೆಲಸದ ಆದೇಶ (Work Order) ಹಾಗೂ ಪರಿಹಾರ ಟಿಪ್ಪಣಿ ದಾಖಲಿಸಲು ಮಾತ್ರ ಅನುಮತಿ.', 'Authorized for recording official work orders and resolution directives.')}</li>
            <li>{t('ಸಾರ್ವಜನಿಕರು ಲಾಗಿನ್ ಇಲ್ಲದೆಯೇ "ದೂರುಗಳ ಸ್ಥಿತಿ" ಮೂಲಕ ಎಲ್ಲಾ ದೂರುಗಳ ಮುಕ್ತ ಪ್ರಗತಿ ವೀಕ್ಷಿಸಬಹುದು.', 'Citizens can track all complaint progress publicly without logging in.')}</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onRequirePdoLogin}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition cursor-pointer inline-flex items-center justify-center gap-2 text-sm"
          >
            <KeyRound className="w-4 h-4 text-amber-300" />
            <span>{t('ಪಿ.ಡಿ.ಒ ಅಧಿಕೃತ ಲಾಗಿನ್', 'Officer Login (PDO)')}</span>
          </button>
          {onSwitchToPublicTrack && (
            <button
              onClick={onSwitchToPublicTrack}
              className="w-full sm:w-auto px-5 py-3 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition cursor-pointer text-xs"
            >
              {t('ದೂರುಗಳ ಸಾರ್ವಜನಿಕ ಸ್ಥಿತಿ ವೀಕ್ಷಿಸಿ', 'View Public Complaint Tracker')}
            </button>
          )}
          {onOpenReports && (
            <button
              onClick={onOpenReports}
              className="w-full sm:w-auto px-5 py-3 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl transition cursor-pointer text-xs inline-flex items-center justify-center gap-1.5"
            >
              <BarChart3 className="w-4 h-4 text-emerald-700" />
              <span>{t('ಗ್ರಾಮಸೇವಾ ವರದಿ & ವಿಶ್ಲೇಷಣೆ', 'View Governance Reports')}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const filtered = complaints.filter((c) => {
    const matchCat = categoryFilter === 'all' || c.category === categoryFilter;
    const matchStat = statusFilter === 'all' || c.status === statusFilter;
    return matchCat && matchStat;
  });

  const handleApplyAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    onUpdateComplaintStatus(
      selectedComplaint.id,
      newStatus,
      actionNotes || (isKannada ? 'ಗ್ರಾಮ ಪಂಚಾಯತ್ ಕಚೇರಿಯಿಂದ ಪರಿಶೀಲಿಸಲಾಗಿದೆ.' : 'Verified by Gram Panchayat Desk.'),
      officerName
    );

    // Update local preview
    setSelectedComplaint((prev) =>
      prev
        ? {
            ...prev,
            status: newStatus,
            statusNotes: actionNotes,
            actionTakenBy: officerName,
            actionTakenAt: new Date().toLocaleString(),
          }
        : null
    );

    setShowStatusModal(false);
    setActionNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top PDO Banner & Whistleblower Privacy Guarantee */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t('ಪಂಚಾಯತ್ ಅಭಿವೃದ್ಧಿ ಅಧಿಕಾರಿ (PDO Desk) • ಅಧಿಕೃತ ಆಡಳಿತ ಕೇಂದ್ರ', 'Panchayat Development Officer (PDO Desk) • Official Admin')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight font-kannada">
              {t('ಗ್ರಾಮ ಪಂಚಾಯತಿ ದೂರು ನಿರ್ವಹಣಾ ಕಚೇರಿ', 'Authorized Grievance Redressal Console')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              {t(
                'ಗ್ರಾಮ ಪಂಚಾಯತ್ ಕಾಯ್ದೆಯನ್ವಯ ಎಲ್ಲಾ ನಾಗರಿಕ ದೂರುಗಳನ್ನು ನಿರ್ವಹಿಸಲಾಗುತ್ತದೆ. ಕುಂದುಕೊರತೆ ನಿಯಮಾವಳಿಗಳ ಪ್ರಕಾರ, ದೂರುದಾರರ ವೈಯಕ್ತಿಕ ವಿವರಗಳು ಪಂಚಾಯಿತಿ ಸದಸ್ಯರಿಗೆ ಸಂಪೂರ್ಣ ಅನಾಮಧೇಯವಾಗಿರುತ್ತವೆ.',
                'All citizen complaints and documents are managed under the control of the designated Gram Panchayat authority. Citizen identities remain anonymous to council members.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onOpenReports && (
              <button
                type="button"
                onClick={onOpenReports}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-3 rounded-xl font-bold text-xs inline-flex items-center gap-2 transition cursor-pointer shadow-sm"
                title={t('ಗ್ರಾಮಸೇವಾ ವರದಿ ಮತ್ತು ವಿಶ್ಲೇಷಣೆ', 'GramaSeva Governance Reports')}
              >
                <BarChart3 className="w-4 h-4 text-emerald-200" />
                <span className="hidden sm:inline">{t('ಆಡಳಿತಾತ್ಮಕ ವರದಿಗಳು (PDF/CSV)', 'Governance Reports (PDF/CSV)')}</span>
                <span className="sm:hidden">{t('ವರದಿಗಳು', 'Reports')}</span>
              </button>
            )}

            <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center">
              <div className="text-[11px] text-slate-400">{t('ಒಟ್ಟು ಸ್ವೀಕೃತ ದೂರುಗಳು', 'Total Complaints')}</div>
              <div className="text-2xl font-mono font-black text-amber-300">
                {complaints.length}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                {t('ಸಕ್ರಿಯ ದೂರುಗಳು', 'Active Complaints')}
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Notice Banner */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2.5 text-xs text-amber-200/90 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
          <EyeOff className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-amber-300">{t('ಗೌಪ್ಯತಾ ನಿಯಮ:', 'Whistleblower Protection Rule:')}</strong>{' '}
            {t(
              'ದೂರುದಾರರ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಹಾಗೂ ವೈಯಕ್ತಿಕ ವಿವರಗಳು ಪಂಚಾಯತಿ ಸದಸ್ಯರಿಗೆ ಕಾಣಿಸುವುದಿಲ್ಲ. ಕೇವಲ ಗ್ರಾಮ, ಸ್ಥಳ ಹಾಗೂ ದೂರಿನ ವಿವರಣೆ ಮತ್ತು ದಾಖಲೆಗಳು ಮಾತ್ರ ಲಭ್ಯವಿರುತ್ತದೆ.',
              'Citizen mobile numbers and personal identities remain masked from council members. Only village location, complaint facts, and attached documents are displayed.'
            )}
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout: Left Complaints List, Right Action & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Complaints List with Filters */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 font-kannada flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t('ದೂರುಗಳ ಪಟ್ಟಿ', 'Incoming Complaints')} ({filtered.length})</span>
              </span>
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 p-1.5 rounded-lg text-slate-700"
              >
                <option value="all">{t('ಎಲ್ಲಾ ವರ್ಗಗಳು', 'All Categories')}</option>
                {COMPLAINT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {isKannada ? c.nameKn : c.nameEn}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 p-1.5 rounded-lg text-slate-700"
              >
                <option value="all">{t('ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು', 'All Statuses')}</option>
                <option value="submitted">{t('ಸಲ್ಲಿಕೆಯಾಗಿದೆ', 'Submitted')}</option>
                <option value="under_review">{t('ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ', 'Under Review')}</option>
                <option value="site_inspection">{t('ಸ್ಥಳ ಪರಿಶೀಲನೆ', 'Site Inspection')}</option>
                <option value="action_initiated">{t('ಕ್ರಮ ಕೈಗೊಳ್ಳಲಾಗಿದೆ', 'Action Initiated')}</option>
                <option value="resolved">{t('ಪರಿಹರಿಸಲಾಗಿದೆ', 'Resolved')}</option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filtered.map((c) => {
              const isSelected = selectedComplaint?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedComplaint(c)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/30 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {c.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'site_inspection'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {c.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {c.title}
                  </h4>

                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {c.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <MapPin className="w-3 h-3 text-emerald-700" />
                      {c.village}
                    </span>
                    <span className="font-mono text-emerald-800 font-bold">
                      {c.citizenMaskedId}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Redressal Console & Action Workflow */}
        <div className="lg:col-span-7">
          {selectedComplaint ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              {/* Header Details */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm bg-slate-900 text-white px-2.5 py-0.5 rounded">
                      {selectedComplaint.id}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {t('ಗೌಪ್ಯ ಟೋಕನ್:', 'Masked Token:')} {selectedComplaint.citizenMaskedId}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-2">
                    {selectedComplaint.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNewStatus(selectedComplaint.status);
                    setActionNotes(selectedComplaint.statusNotes || '');
                    setShowStatusModal(true);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('ಕ್ರಮ ಕೈಗೊಳ್ಳಿ', 'Take Official Action')}</span>
                </button>
              </div>

              {/* Anonymity Shield Banner */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>
                    {t(
                      'ದೂರುದಾರರ ಗೌಪ್ಯತೆ ಸಕ್ರಿಯವಾಗಿದೆ (ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ರಹಸ್ಯವಾಗಿದೆ)',
                      'Citizen privacy active (phone number unrecognised to council)'
                    )}
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-800">
                  ID: {selectedComplaint.citizenMaskedId}
                </span>
              </div>

              {/* Location & Constituent Village */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px]">{t('ಗ್ರಾಮ:', 'Village:')}</span>
                  <span className="font-bold text-slate-900">{selectedComplaint.village}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">{t('ಸ್ಥಳ:', 'Locality:')}</span>
                  <span className="font-bold text-slate-900">{selectedComplaint.specificLocality}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">{t('ವಾರ್ಡ್:', 'Ward:')}</span>
                  <span className="font-bold text-slate-900">{selectedComplaint.wardNumber || '01'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">{t('ದಿನಾಂಕ:', 'Date:')}</span>
                  <span className="font-bold text-slate-900">{selectedComplaint.submittedAt}</span>
                </div>
              </div>

              {/* Full Description Narrative (Up to 1000 letters) */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 font-kannada mb-1.5">
                  {t('ದೂರುದಾರರು ಸಲ್ಲಿಸಿದ ಸಂಪೂರ್ಣ ವಿವರಣೆ:', 'Citizen Description:')} ({selectedComplaint.description.length} {t('ಅಕ್ಷರಗಳು', 'letters')})
                </h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedComplaint.description}
                </div>
              </div>

              {/* Attached Evidence / Documents */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 font-kannada mb-2">
                  {t('ಲಗತ್ತಿಸಲಾದ ದಾಖಲೆಗಳು:', 'Attached Evidence:')} ({selectedComplaint.documents.length})
                </h4>
                {selectedComplaint.documents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedComplaint.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {doc.type.startsWith('image/') && doc.dataUrl ? (
                            <img
                              src={doc.dataUrl}
                              alt="preview"
                              className="w-10 h-10 rounded-lg object-cover border"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <FileText className="w-8 h-8 text-slate-500" />
                          )}
                          <div className="truncate">
                            <div className="text-xs font-bold text-slate-800 truncate">
                              {doc.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {(doc.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </div>
                        {doc.dataUrl && (
                          <a
                            href={doc.dataUrl}
                            download={doc.name}
                            className="text-xs text-emerald-700 hover:underline font-bold"
                          >
                            {t('ವೀಕ್ಷಿಸಿ', 'View')}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">{t('ಯಾವುದೇ ದಾಖಲೆ ಲಗತ್ತಿಸಿಲ್ಲ.', 'No files attached.')}</p>
                )}
              </div>

              {/* Official Remarks Log */}
              {selectedComplaint.statusNotes && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-emerald-950 font-kannada">
                    {t('ಕೈಗೊಂಡಿರುವ ಕ್ರಮ:', 'Action Recorded:')}
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedComplaint.statusNotes}
                  </p>
                  <div className="text-[10px] text-emerald-800 font-mono pt-1">
                    {t('ಅಧಿಕಾರಿ:', 'Officer:')} {selectedComplaint.actionTakenBy} ({selectedComplaint.actionTakenAt})
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
              {t('ವೀಕ್ಷಿಸಲು ಪಟ್ಟಿಯಿಂದ ದೂರನ್ನು ಆಯ್ಕೆಮಾಡಿ.', 'Select a complaint from the list to view and manage.')}
            </div>
          )}
        </div>
      </div>

      {/* Official Status Update Modal */}
      {showStatusModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white p-5 flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold font-kannada">
                  {t('ದೂರಿನ ಸ್ಥಿತಿ ನವೀಕರಣ & ಕ್ರಮ ಕೈಗೊಳ್ಳುವಿಕೆ', 'Update Grievance Status & Directive')}
                </h3>
                <p className="text-xs text-emerald-200">
                  {t('ಗ್ರಾಮ ಪಂಚಾಯತಿ ಅಧಿಕೃತ ಆದೇಶ', 'Official Grievance Action by Gram Panchayat Authority')}
                </p>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyAction} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1 font-kannada">
                  {t('ದೂರಿನ ಸ್ಥಿತಿ *', 'Grievance Status *')}
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="under_review">{t('ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (PDO)', 'Under Review by PDO')}</option>
                  <option value="site_inspection">{t('ಸ್ಥಳ ಪರಿಶೀಲನೆ ನಿಗದಿಯಾಗಿದೆ', 'Site Inspection Scheduled')}</option>
                  <option value="action_initiated">{t('ಕ್ರಮ ಕೈಗೊಳ್ಳಲಾಗಿದೆ (ಕೆಲಸದ ಆದೇಶ ನೀಡಲಾಗಿದೆ)', 'Action Initiated (Work Order Issued)')}</option>
                  <option value="resolved">{t('ಪರಿಹರಿಸಲಾಗಿದೆ & ಮುಕ್ತಾಯಗೊಂಡಿದೆ', 'Resolved & Closed')}</option>
                  <option value="rejected">{t('ತಿರಸ್ಕರಿಸಲಾಗಿದೆ (ಗ್ರಾ.ಪಂ ವ್ಯಾಪ್ತಿಗೆ ಬರುವುದಿಲ್ಲ)', 'Invalid / Not under GP purview')}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 font-kannada">
                  {t('ಅಧಿಕಾರಿಯ ಹೆಸರು', 'Officer in Charge')}
                </label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 font-kannada">
                  {t('ಕೈಗೊಂಡ ಕ್ರಮದ ವಿವರಣೆ & ನಿರ್ದೇಶನ *', 'Action Remarks & Directive *')}
                </label>
                <textarea
                  rows={3}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder={t(
                    'ಉದಾ: ಪೈಪ್ ದುರಸ್ತಿಗೆ ವಾಟರ್‌ಮನ್‌ಗೆ ಸೂಚಿಸಲಾಗಿದೆ; ಅಥವಾ ಜೆ.ಇ ರವರಿಗೆ ಪತ್ರ ಬರೆಯಲಾಗಿದೆ.',
                    'e.g. Lineman instructed to repair pipe by tomorrow; or BESCOM Junior Engineer notified; or PACS secretary directed to release loan subsidy.'
                  )}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-medium text-slate-800 leading-relaxed"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                >
                  {t('ರದ್ದು', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('ನವೀಕರಿಸಿ', 'Record Action')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
