import React, { useState, useEffect } from 'react';
import {
  Phone,
  Clock,
  MapPin,
  ShieldCheck,
  Bell,
  User,
  LogOut,
  ChevronRight,
  Info,
  Calendar,
  Share2,
  BarChart3,
} from 'lucide-react';
import { KarnatakaEmblem } from '../utils/karnatakaEmblem';
import { GramPanchayatInfo, UserSession, OfficeStatusResult } from '../types';
import { getOfficeStatus } from '../utils/officeHours';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  panchayat: GramPanchayatInfo;
  user: UserSession | null;
  unreadAlertsCount: number;
  activeTab: 'lodge' | 'track' | 'admin' | 'council' | 'reports';
  setActiveTab: (tab: 'lodge' | 'track' | 'admin' | 'council' | 'reports') => void;
  onOpenAuth: () => void;
  onOpenLocation: () => void;
  onOpenSchedule: () => void;
  onOpenShare: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  panchayat,
  user,
  unreadAlertsCount,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenLocation,
  onOpenSchedule,
  onOpenShare,
  onLogout,
}) => {
  const { t, isKannada, isEnglish } = useLanguage();
  const [officeStatus, setOfficeStatus] = useState<OfficeStatusResult>(getOfficeStatus());

  useEffect(() => {
    const timer = setInterval(() => {
      setOfficeStatus(getOfficeStatus());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-emerald-800/20 shadow-sm">
      {/* Top Karnataka Tricolor & Helpline Ribbon */}
      <div className="bg-gradient-to-r from-amber-600 via-emerald-800 to-amber-700 text-white text-xs px-3 py-1.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Government Identity */}
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-wide font-kannada">
              {t(
                'ಕರ್ನಾಟಕ ಸರ್ಕಾರ | ಗ್ರಾಮೀಣಾಭಿವೃದ್ಧಿ ಮತ್ತು ಪಂಚಾಯತ್ ರಾಜ್ ಇಲಾಖೆ',
                'Govt. of Karnataka | RDPR Department'
              )}
            </span>
          </div>

          {/* Panchayat Helpline & Office Hours Trigger */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            {/* Helpline Number prominently displayed as requested: 0000111101 */}
            <a
              href="tel:0000111101"
              className="inline-flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-300/40 text-amber-100 px-2.5 py-0.5 rounded-full font-mono font-bold tracking-wider text-xs transition"
              title={t('ಅಧಿಕೃತ ಪಂಚಾಯತ್ ಸಹಾಯವಾಣಿ', 'Official Panchayat Helpline')}
            >
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {t('ಸಹಾಯವಾಣಿ', 'Helpline')}:{' '}
                <span className="text-white underline">{panchayat.helplineNumber}</span>
              </span>
            </a>

            {/* Quick Office Status Pill */}
            <button
              onClick={onOpenSchedule}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition cursor-pointer ${
                officeStatus.isOpen
                  ? 'bg-emerald-500/30 text-emerald-100 border border-emerald-400/40 hover:bg-emerald-500/40'
                  : officeStatus.isLunchTime
                  ? 'bg-amber-500/30 text-amber-100 border border-amber-400/40 hover:bg-amber-500/40'
                  : 'bg-rose-500/30 text-rose-100 border border-rose-400/40 hover:bg-rose-500/40'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span className="hidden sm:inline">
                {officeStatus.isOpen
                  ? t('ತೆರೆದಿದೆ', 'OPEN')
                  : officeStatus.isLunchTime
                  ? t('ಊಟದ ವಿರಾಮ', 'LUNCH')
                  : t('ಮುಕ್ತಾಯ', 'CLOSED')}
              </span>
              <Info className="w-2.5 h-2.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Official Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Karnataka Logo + Panchayat Name */}
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 p-1 rounded-xl border border-amber-200/80 shadow-xs">
              <KarnatakaEmblem size={52} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenLocation}
                  className="text-left group flex items-center gap-1.5 cursor-pointer"
                  title={t('ಗ್ರಾಮ ಪಂಚಾಯತಿ ಬದಲಾಯಿಸಿ (ಜಿಲ್ಲೆ ಮತ್ತು ತಾಲೂಕಿನ ಪ್ರಕಾರ)', 'Change Gram Panchayat (by District & Taluk)')}
                >
                  <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight group-hover:text-emerald-800 transition">
                    {isKannada ? panchayat.nameKn : panchayat.nameEn}
                  </h1>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-1.5 py-0.2 rounded group-hover:bg-emerald-200 transition">
                    {t('ಬದಲಿಸಿ', 'Change GP')}
                  </span>
                </button>
                <span className="hidden xl:inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {panchayat.currentTerm}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-600 font-kannada">
                <span className="font-semibold text-emerald-900">
                  {isEnglish ? panchayat.nameEn : panchayat.nameKn}
                </span>
                <span className="text-slate-400">•</span>
                <span>
                  {isKannada
                    ? `${panchayat.talukKn} ತಾಲೂಕು, ${panchayat.districtKn} ಜಿಲ್ಲೆ`
                    : isEnglish
                    ? `${panchayat.talukEn} Taluk, ${panchayat.districtEn} Dist.`
                    : `${panchayat.talukEn} (${panchayat.talukKn}), ${panchayat.districtEn}`}
                </span>
              </div>
            </div>
          </div>

          {/* Language Switcher, Location Picker & User Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dedicated Language Switcher (Strictly English and Kannada only) */}
            <LanguageSwitcher variant="header" />

            {/* Location selector trigger */}
            <button
              onClick={onOpenLocation}
              className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-900 px-2.5 sm:px-3 py-1.5 rounded-lg border border-emerald-300 font-semibold transition cursor-pointer shadow-2xs"
              title={t('ಗ್ರಾಮ ಪಂಚಾಯತಿ ಬದಲಾಯಿಸಿ (ಜಿಲ್ಲೆ ಮತ್ತು ತಾಲೂಕು)', 'Change Gram Panchayat (District & Taluk)')}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <div className="text-left hidden sm:block">
                <span className="max-w-[120px] truncate block font-bold text-[11px] leading-tight">
                  {isKannada ? panchayat.nameKn : panchayat.nameEn}
                </span>
                <span className="text-[10px] text-emerald-700 block leading-tight">
                  {isKannada ? panchayat.talukKn : panchayat.talukEn}
                </span>
              </div>
              <span className="text-[10px] bg-emerald-700 text-white font-bold px-1.5 py-0.5 rounded shadow-2xs">
                {t('ಗ್ರಾ.ಪಂ ಬದಲಿಸಿ', 'Change GP')}
              </span>
            </button>

            {/* Public Share & Notice Board QR Trigger */}
            <button
              onClick={onOpenShare}
              className="inline-flex items-center gap-1.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 px-3 py-1.5 rounded-lg border border-amber-300 font-bold transition cursor-pointer shadow-2xs"
              title={t('ಸಾರ್ವಜನಿಕ ಲಿಂಕ್ ಮತ್ತು ನೋಟಿಸ್ ಬೋರ್ಡ್ ಕ್ಯೂಆರ್', 'Public Access URL & Notice Board QR Code')}
            >
              <Share2 className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden md:inline">{t('ಹಂಚಿಕೊಳ್ಳಿ', 'Share')}</span>
            </button>

            {/* User Session status */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1 justify-end">
                    {user.role === 'official_pdo' ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <User className="w-3 h-3 text-emerald-700" />
                    )}
                    <span>{user.displayName || user.userId}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {user.role === 'official_pdo'
                      ? t('ಪಿ.ಡಿ.ಒ ಕಚೇರಿ ಡೆಸ್ಕ್', 'PDO Civil Desk')
                      : `+91 ${user.phoneNumber.slice(0, 5)}*****`}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-300 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium inline-flex items-center gap-1 transition cursor-pointer"
                  title={t('ನಿರ್ಗಮನ', 'Logout')}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('ನಿರ್ಗಮಿಸಿ', 'Logout')}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>{t('ಸಾರ್ವಜನಿಕ ವೀಕ್ಷಣೆ', 'Public Mode')}</span>
                </span>
                <button
                  onClick={onOpenAuth}
                  className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
                  title={t('ನಾಗರಿಕರ ಲಾಗಿನ್', 'Citizen Sign In with Mobile & OTP')}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  <span>{t('ಪ್ರವೇಶ', 'Login')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav aria-label="Main Navigation" className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
          <div className="flex items-center gap-1.5">
            {/* Tab: Track Grievance (100% Public & Unauthenticated) */}
            <button
              onClick={() => setActiveTab('track')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                activeTab === 'track'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{t('ಸ್ಥಿತಿ ಪರಿಶೀಲನೆ', 'Track Grievance')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                activeTab === 'track' ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {t('ಸಾರ್ವಜನಿಕ', 'Public')}
              </span>
            </button>

            {/* Tab: 5-Year Council Members (100% Public & Unauthenticated) */}
            <button
              onClick={() => setActiveTab('council')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                activeTab === 'council'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t('ಮಂಡಳಿ ಸದಸ್ಯರು', 'Council Members')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                activeTab === 'council' ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {t('ಸಾರ್ವಜನಿಕ', 'Public')}
              </span>
            </button>

            {/* Tab: Lodge Complaint (Verified Submission) */}
            <button
              onClick={() => setActiveTab('lodge')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                activeTab === 'lodge'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{t('ದೂರು ದಾಖಲಿಸಿ', 'Lodge Complaint')}</span>
              {!user && (
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded font-bold">
                  🔒 {t('OTP ಅಗತ್ಯ', 'OTP Req')}
                </span>
              )}
            </button>

            {/* Tab: Reports & Analytics (Public & Administrative Governance Audits) */}
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                activeTab === 'reports'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{t('ವರದಿಗಳು & ವಿಶ್ಲೇಷಣೆ', 'Reports & Analytics')}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                activeTab === 'reports' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'
              }`}>
                {t('ಆಡಿಟ್', 'Audit')}
              </span>
            </button>

            {/* Tab: PDO Officer Desk (Restricted Console) */}
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('ಪಿ.ಡಿ.ಒ ಕಚೇರಿ', 'PDO Desk')}</span>
              <span className="text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-bold">
                🛡️ PDO
              </span>
              {unreadAlertsCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                  {unreadAlertsCount}
                </span>
              )}
            </button>
          </div>

          {/* Whistleblower Privacy Assurance Badge */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {t(
                'ದೂರುದಾರರ ಗೌಪ್ಯತೆ ಖಚಿತ (100% Whistleblower Protection)',
                '100% Anonymous Whistleblower Protection'
              )}
            </span>
          </div>
        </nav>
      </div>
    </header>
  );
};

