import React, { useState, useEffect, useCallback } from 'react';
import {
  Header,
} from './components/Header';
import { ComplaintForm } from './components/ComplaintForm';
import { ComplaintTracker } from './components/ComplaintTracker';
import { ElectionCouncilView } from './components/ElectionCouncilView';
import { AdminPortal } from './components/AdminPortal';
import { AuthModal } from './components/AuthModal';
import { LocationPickerModal } from './components/LocationPickerModal';
import { OfficeHoursModal } from './components/OfficeHoursModal';
import { PublicShareModal } from './components/PublicShareModal';
import { NotificationToast } from './components/NotificationToast';
import { AccessibilityToolbar, AccessibilitySettings } from './components/AccessibilityToolbar';
import { LikedDocumentsModal } from './components/LikedDocumentsModal';
import { ReportAnalyticsView } from './components/ReportAnalyticsView';
import { KarnatakaEmblem } from './utils/karnatakaEmblem';
import { api } from './utils/api';
import { useLanguage } from './context/LanguageContext';
import {
  DEFAULT_GRAM_PANCHAYAT,
  INITIAL_COMPLAINTS,
  INITIAL_COUNCIL_MEMBERS,
  COMPLAINT_CATEGORIES,
  getCouncilMembersForPanchayat,
} from './data/panchayatData';
import {
  Complaint,
  ComplaintStatus,
  CouncilMember,
  GramPanchayatInfo,
  UserSession,
} from './types';
import {
  Phone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  TreePine,
  Sparkles,
  MapPin,
  Calendar,
  AlertTriangle,
  Info,
  Layers,
  Share2,
  Keyboard,
  Eye,
  Lock,
  Heart,
} from 'lucide-react';
import { getOfficeStatus } from './utils/officeHours';

export default function App() {
  const { language, setLanguage, t, isKannada, isEnglish } = useLanguage();

  // Local storage backed state with bulletproof error handling
  const [panchayat, setPanchayat] = useState<GramPanchayatInfo>(() => {
    try {
      const saved = localStorage.getItem('gp_panchayat_info');
      return saved ? JSON.parse(saved) : DEFAULT_GRAM_PANCHAYAT;
    } catch (e) {
      console.warn('Using default panchayat info:', e);
      return DEFAULT_GRAM_PANCHAYAT;
    }
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const saved = localStorage.getItem('gp_complaints_list');
      return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
    } catch (e) {
      console.warn('Using default complaints list:', e);
      return INITIAL_COMPLAINTS;
    }
  });

  const [councilMembers, setCouncilMembers] = useState<CouncilMember[]>(() => {
    try {
      const saved = localStorage.getItem('gp_council_members');
      return saved ? JSON.parse(saved) : INITIAL_COUNCIL_MEMBERS;
    } catch (e) {
      console.warn('Using default council members:', e);
      return INITIAL_COUNCIL_MEMBERS;
    }
  });

  // Public unauthenticated visitor by default; stored session if user logged in
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('gp_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('No active user session:', e);
      return null;
    }
  });

  // Default to public complaint tracking view so visitors can freely explore without login
  const [activeTab, setActiveTab] = useState<'lodge' | 'track' | 'council' | 'admin' | 'reports'>('track');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'citizen' | 'official_pdo'>('citizen');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isLikedDocsOpen, setIsLikedDocsOpen] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [latestAlert, setLatestAlert] = useState<Complaint | null>(null);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(1);
  const [natureOverlayOpacity, setNatureOverlayOpacity] = useState<'normal' | 'light' | 'subtle'>('normal');

  // Screen Reader live announcement text
  const [srAnnouncement, setSrAnnouncement] = useState('');

  // Accessibility State (saved in localStorage for inclusive citizen experience)
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem('gp_accessibility_settings');
      return saved
        ? JSON.parse(saved)
        : {
            fontScale: 'normal',
            highContrast: false,
            dyslexicFont: false,
            reducedMotion: false,
            screenReaderActive: false,
          };
    } catch (e) {
      return {
        fontScale: 'normal',
        highContrast: false,
        dyslexicFont: false,
        reducedMotion: false,
        screenReaderActive: false,
      };
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('gp_panchayat_info', JSON.stringify(panchayat));
  }, [panchayat]);

  useEffect(() => {
    localStorage.setItem('gp_complaints_list', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('gp_council_members', JSON.stringify(councilMembers));
  }, [councilMembers]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('gp_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('gp_user_session');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('gp_accessibility_settings', JSON.stringify(accessibility));
  }, [accessibility]);

  const handleUpdateAccessibility = (newSettings: Partial<AccessibilitySettings>) => {
    setAccessibility((prev) => ({ ...prev, ...newSettings }));
  };

  const handleResetAccessibility = () => {
    setAccessibility({
      fontScale: 'normal',
      highContrast: false,
      dyslexicFont: false,
      reducedMotion: false,
      screenReaderActive: false,
    });
  };

  // Authentication & Tab Routing Manager:
  // - Public unauthenticated viewing for complaint statuses ('track'), council member info ('council'), and reports ('reports')
  // - Strict security verification for grievance filing ('lodge') and administrative consoles ('admin')
  const handleTabChange = useCallback((tab: 'lodge' | 'track' | 'council' | 'admin' | 'reports') => {
    if (tab === 'track') {
      // 100% Public and Unauthenticated
      setActiveTab('track');
      setSrAnnouncement(t('ದೂರುಗಳ ಸ್ಥಿತಿ ಪರಿಶೀಲನೆ ಸಾರ್ವಜನಿಕ ಪುಟಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.', 'Switched to Public Grievance Status Tracker.'));
    } else if (tab === 'council') {
      // 100% Public and Unauthenticated
      setActiveTab('council');
      setSrAnnouncement(t('ಗ್ರಾಮ ಪಂಚಾಯತ್ ಚುನಾಯಿತ ಮಂಡಳಿ ಸದಸ್ಯರ ಸಾರ್ವಜನಿಕ ಪುಟಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.', 'Switched to Public Elected Council Members Directory.'));
    } else if (tab === 'reports') {
      // 100% Public and Unauthenticated Governance Analytics & Reports
      setActiveTab('reports');
      setSrAnnouncement(t('ಗ್ರಾಮಸೇವಾ ವರದಿ ಮತ್ತು ವಿಶ್ಲೇಷಣೆ ಸಾರ್ವಜನಿಕ ಪುಟಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.', 'Switched to GramaSeva Governance Reports & Analytics.'));
    } else if (tab === 'lodge') {
      // Secure Grievance Filing: Citizens can inspect form, but filing requires mobile & OTP verification
      setActiveTab('lodge');
      if (!user) {
        setAuthMode('citizen');
        setIsAuthOpen(true);
      }
      setSrAnnouncement(t('ದೂರು ದಾಖಲಿಸುವ ಸುರಕ್ಷಿತ ಪುಟಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.', 'Switched to Secure Grievance Filing Console.'));
    } else if (tab === 'admin') {
      // Strictly Secured Administrative Desk: Requires official PDO credentials
      setActiveTab('admin');
      setUnreadAlertsCount(0);
      if (user?.role !== 'official_pdo') {
        setAuthMode('official_pdo');
        setIsAuthOpen(true);
      }
      setSrAnnouncement(t('ಪಿ.ಡಿ.ಒ ಅಧಿಕೃತ ಕಚೇರಿ ಡೆಸ್ಕ್‌ಗೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.', 'Switched to PDO Official Administration Console.'));
    }
  }, [user, t]);

  // Global Keyboard Navigation Shortcuts for Inclusive Accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if citizen is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.altKey) {
        if (e.key === '1') {
          e.preventDefault();
          handleTabChange('track');
        } else if (e.key === '2') {
          e.preventDefault();
          handleTabChange('council');
        } else if (e.key === '3') {
          e.preventDefault();
          handleTabChange('reports');
        } else if (e.key === '4') {
          e.preventDefault();
          handleTabChange('lodge');
        } else if (e.key === '5') {
          e.preventDefault();
          handleTabChange('admin');
        } else if (e.key === 'l' || e.key === 'L') {
          e.preventDefault();
          // Cycle language: kn -> en -> both -> kn
          setLanguage(language === 'kn' ? 'en' : language === 'en' ? 'both' : 'kn');
        } else if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          setIsShareOpen(true);
        } else if (e.key === 'h' || e.key === 'H') {
          e.preventDefault();
          setIsScheduleOpen(true);
        } else if (e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          setIsLikedDocsOpen(true);
        } else if (e.key === 'k' || e.key === 'K') {
          e.preventDefault();
          setShowShortcutsHelp((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTabChange, language, setLanguage]);

  // Handle new complaint submitted by citizen
  const handleLodgeComplaint = (newComplaint: Complaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);
    setLatestAlert(newComplaint);
    setUnreadAlertsCount((prev) => prev + 1);
    setSrAnnouncement(t('ಹೊಸ ದೂರು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ.', 'New grievance lodged successfully.'));

    // Asynchronously synchronize with backend server
    api.submitComplaint(newComplaint).catch((err) => {
      console.warn('[Sync] Backend complaint submission sync notice:', err);
    });
  };

  // Handle complaint status updated by authorized PDO
  const handleUpdateStatus = (
    id: string,
    newStatus: ComplaintStatus,
    notes: string,
    actionOfficer: string
  ) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: newStatus,
              statusNotes: notes,
              actionTakenBy: actionOfficer,
              actionTakenAt: new Date().toLocaleString(),
              updatedAt: new Date().toLocaleString(),
            }
          : c
      )
    );
    setSrAnnouncement(t('ದೂರಿನ ಸ್ಥಿತಿ ನವೀಕರಿಸಲಾಗಿದೆ.', 'Grievance status updated by officer.'));

    // Asynchronously synchronize status update with backend server
    api.updateComplaintStatus(id, newStatus, notes, actionOfficer).catch((err) => {
      console.warn('[Sync] Backend status update sync notice:', err);
    });
  };

  // Handle council addition & removal for 5-year elections
  const handleAddCouncilMember = (newMember: CouncilMember) => {
    setCouncilMembers((prev) => [...prev, newMember]);
  };

  const handleRemoveCouncilMember = (id: string) => {
    setCouncilMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleArchive5YearTerm = () => {
    if (
      window.confirm(
        t(
          'ನೀವು 2021-2026 ರ ಅವಧಿಯನ್ನು ಮುಕ್ತಾಯಗೊಳಿಸಿ, ಮುಂದಿನ 5-ವರ್ಷಗಳ ಚುನಾವಣಾ ವಿಜೇತರ ಸೇರ್ಪಡೆಗೆ ತೆರೆಯಲು ಖಚಿತವಾಗಿದ್ದೀರಾ?',
          'Are you sure you want to mark the 2021-2026 council term as completed and open induction for the next 5-year term winners?'
        )
      )
    ) {
      setPanchayat((prev) => ({
        ...prev,
        currentTerm: '2026 - 2031 (15th Panchayat Term)',
        nextElectionYear: 2031,
      }));
      setCouncilMembers((prev) =>
        prev.map((m) =>
          m.role === 'pdo'
            ? m // PDO is permanent civil service officer
            : { ...m, status: 'term_completed', termEndYear: 2026 }
        )
      );
    }
  };

  const officeStatus = getOfficeStatus();

  // Dynamic accessibility classes
  const fontScaleClass =
    accessibility.fontScale === 'large'
      ? 'text-[17px]'
      : accessibility.fontScale === 'xlarge'
      ? 'text-[19px]'
      : accessibility.fontScale === 'jumbo'
      ? 'text-[21px]'
      : '';

  const highContrastClass = accessibility.highContrast ? 'high-contrast-mode' : '';
  const dyslexicClass = accessibility.dyslexicFont ? 'dyslexic-font-mode' : '';
  const reducedMotionClass = accessibility.reducedMotion ? 'motion-reduce-all' : '';

  return (
    <div
      className={`min-h-screen relative font-sans flex flex-col text-slate-900 selection:bg-emerald-200 ${fontScaleClass} ${highContrastClass} ${dyslexicClass} ${reducedMotionClass}`}
    >
      {/* Screen Reader Live Announcement Region */}
      <div
        id="sr-announcer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {srAnnouncement}
      </div>

      {/* Keyboard Accessibility Skip Links */}
      <div className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-2 focus-within:left-2 focus-within:z-50 focus-within:flex focus-within:gap-2">
        <a
          href="#main-content"
          className="bg-emerald-800 text-white px-4 py-2 rounded-lg font-bold shadow-lg border-2 border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-400"
        >
          {t('ಮುಖ್ಯ ವಿಷಯಕ್ಕೆ ಹೋಗಿ', 'Skip to Main Content')}
        </a>
        <a
          href="#accessibility-controls"
          className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold shadow-lg border-2 border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-300"
        >
          {t('ಪ್ರವೇಶಿಸುವಿಕೆ ಸೆಟ್ಟಿಂಗ್ಸ್', 'Accessibility Toolbar')}
        </a>
      </div>

      {/* Village Nature & Trees Background Atmosphere as requested */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-fixed transition-opacity duration-500"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2400&q=80')`,
          filter: 'brightness(0.92) contrast(1.05)',
        }}
      />

      {/* Atmospheric Nature Overlay Mask ensuring WCAG AA contrast for text */}
      <div
        className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-300 ${
          natureOverlayOpacity === 'normal'
            ? 'bg-gradient-to-b from-slate-50/95 via-emerald-50/90 to-slate-100/95'
            : natureOverlayOpacity === 'light'
            ? 'bg-gradient-to-b from-slate-50/85 via-emerald-50/75 to-slate-100/85'
            : 'bg-white/97'
        }`}
      />

      {/* Header with Karnataka Emblem, 0000111101 Helpline, and Navigation */}
      <Header
        panchayat={panchayat}
        user={user}
        unreadAlertsCount={unreadAlertsCount}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenAuth={() => {
          setAuthMode('citizen');
          setIsAuthOpen(true);
        }}
        onOpenLocation={() => setIsLocationOpen(true)}
        onOpenSchedule={() => setIsScheduleOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onLogout={() => {
          setUser(null);
          setSrAnnouncement(t('ಯಶಸ್ವಿಯಾಗಿ ನಿರ್ಗಮಿಸಲಾಗಿದೆ.', 'Logged out successfully.'));
        }}
      />

      {/* Main Content Area */}
      <main id="main-content" className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Comprehensive Accessibility Toolbar for Everyone */}
        <div id="accessibility-controls">
          <AccessibilityToolbar
            settings={accessibility}
            onUpdateSettings={handleUpdateAccessibility}
            onResetSettings={handleResetAccessibility}
            panchayat={panchayat}
            activeTabName={
              activeTab === 'lodge'
                ? t('ದೂರು ದಾಖಲಿಸಿ', 'Lodge Grievance')
                : activeTab === 'track'
                ? t('ದೂರುಗಳ ಸ್ಥಿತಿ ಪರಿಶೀಲನೆ (ಸಾರ್ವಜನಿಕ)', 'Track Grievance (Public)')
                : activeTab === 'council'
                ? t('ಗ್ರಾಮ ಪಂಚಾಯತ್ ಚುನಾಯಿತ ಮಂಡಳಿ (ಸಾರ್ವಜನಿಕ)', 'Council Members (Public)')
                : t('ಪಿ.ಡಿ.ಒ ಕಚೇರಿ (ಸುರಕ್ಷಿತ ಡೆಸ್ಕ್)', 'Officer Console (Secured Desk)')
            }
          />
        </div>

        {/* Public Access Status & Village Atmosphere Ribbon */}
        <div className="bg-white/90 backdrop-blur border border-emerald-800/20 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl shrink-0">
              <TreePine className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 font-kannada">
                  {t(
                    `${panchayat.nameKn} ವ್ಯಾಪ್ತಿಯ ${panchayat.villages.length} ಗ್ರಾಮಗಳ ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆ ವೇದಿಕೆ`,
                    `Public Grievance Redressal Platform for ${panchayat.villages.length} Villages of ${panchayat.nameEn}`
                  )}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  {panchayat.villages.length} {t('ಗ್ರಾಮಗಳು', 'Villages')} (&lt;10)
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                {t(
                  'ನೀರು, ಕಸ, ರಸ್ತೆ, ವಿದ್ಯುತ್, ಸಾಲ ಸಹಾಯಧನ, ಆಸ್ತಿ ವಿವಾದ, ನರೇಗಾ, ವಿದ್ಯಾರ್ಥಿವೇತನ ಮತ್ತು ಮಹಿಳಾ ಕಲ್ಯಾಣ ಕುರಿತ ದೂರುಗಳು.',
                  'Public complaints on water, waste, roads, electricity, loan subsidy, property disputes, scholarships, and women welfare.'
                )}
              </p>
            </div>
          </div>

          {/* Quick Actions & Accessibility Shortcuts Trigger */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Keyboard Shortcuts Dialog Trigger */}
            <button
              onClick={() => setShowShortcutsHelp((prev) => !prev)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50 hover:bg-emerald-50 text-slate-700 font-medium flex items-center gap-1.5 transition cursor-pointer"
              title={t('ಕೀಬೋರ್ಡ್ ಶಾರ್ಟ್‌ಕಟ್‌ಗಳು (Alt+K)', 'Keyboard Shortcuts for Accessibility (Alt+K)')}
            >
              <Keyboard className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">{t('ಕೀಬೋರ್ಡ್ ಶಾರ್ಟ್‌ಕಟ್‌ಗಳು', 'Shortcuts')}</span>
              <kbd className="text-[10px] bg-slate-200 text-slate-700 px-1 py-0.5 rounded font-mono font-bold">Alt+K</kbd>
            </button>

            {/* Office Hours Timetable Trigger */}
            <button
              onClick={() => setIsScheduleOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50 hover:bg-emerald-50 text-slate-700 font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('ವೇಳಾಪಟ್ಟಿ: ಸೋಮ-ಗುರು (10-5), ಶನಿ (10-1)', 'Hours: Mon-Thu (10-5), Sat (10-1)')}</span>
            </button>

            {/* Liked Documents & Access History Trigger */}
            <button
              onClick={() => setIsLikedDocsOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title={t('ಮೆಚ್ಚಿದ ದಾಖಲೆಗಳು & ಬಳಕೆಯ ಇತಿಹಾಸ (Alt+D)', 'Liked Documents & Access Tracking (Alt+D)')}
            >
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>{t('ಮೆಚ್ಚಿದ ದಾಖಲೆಗಳು', 'Liked Docs')}</span>
              <kbd className="text-[10px] bg-rose-200 text-rose-900 px-1 py-0.5 rounded font-mono font-bold">Alt+D</kbd>
            </button>

            {/* Direct Public Share Button */}
            <button
              onClick={() => setIsShareOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-700" />
              <span>{t('ಸಾರ್ವಜನಿಕ ಲಿಂಕ್', 'Public Link')}</span>
            </button>

            {/* Background Theme Opacity Toggle */}
            <button
              onClick={() =>
                setNatureOverlayOpacity((curr) =>
                  curr === 'normal' ? 'light' : curr === 'light' ? 'subtle' : 'normal'
                )
              }
              title={t('ಗ್ರಾಮೀಣ ಹಸಿರು ಹಿನ್ನೆಲೆ ಬದಲಾಯಿಸಿ', 'Toggle Village Nature Backdrop')}
              className="p-1.5 text-slate-500 hover:text-emerald-800 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Keyboard Shortcuts Modal / Panel */}
        {showShortcutsHelp && (
          <div className="bg-slate-900 text-white p-4 rounded-2xl border border-emerald-500/40 shadow-xl space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-amber-300" />
                <h3 className="text-xs font-bold font-kannada">
                  {t('ಅಂಗವಿಕಲತೆ & ಸುಲಭ ಬಳಕೆಗಾಗಿ ಕೀಬೋರ್ಡ್ ಶಾರ್ಟ್‌ಕಟ್‌ಗಳು', 'Inclusive Keyboard Shortcuts for Quick Navigation')}
                </h3>
              </div>
              <button
                onClick={() => setShowShortcutsHelp(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
              >
                ✕ {t('ಮುಚ್ಚಿ', 'Close')}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-[11px]">
              <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                <div className="font-mono text-amber-300 font-bold">Alt + 1</div>
                <div className="text-slate-300">{t('ಸ್ಥಿತಿ ಪರಿಶೀಲನೆ', 'Track Grievance')}</div>
              </div>
              <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                <div className="font-mono text-amber-300 font-bold">Alt + 2</div>
                <div className="text-slate-300">{t('ಮಂಡಳಿ ಸದಸ್ಯರು', 'Council Members')}</div>
              </div>
              <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                <div className="font-mono text-amber-300 font-bold">Alt + 3</div>
                <div className="text-slate-300">{t('ವರದಿಗಳು & ಆಡಿಟ್', 'Reports & Audit')}</div>
              </div>
              <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                <div className="font-mono text-amber-300 font-bold">Alt + 4</div>
                <div className="text-slate-300">{t('ದೂರು ಸಲ್ಲಿಸಿ', 'Lodge Complaint')}</div>
              </div>
              <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                <div className="font-mono text-amber-300 font-bold">Alt + 5</div>
                <div className="text-slate-300">{t('ಪಿ.ಡಿ.ಒ ಕಚೇರಿ', 'PDO Desk')}</div>
              </div>
              <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                <div className="font-mono text-emerald-400 font-bold">Alt + L</div>
                <div className="text-slate-300">{t('ಭಾಷೆ ಬದಲಾವಣೆ', 'Language')}</div>
              </div>
              <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                <div className="font-mono text-emerald-400 font-bold">Alt + H</div>
                <div className="text-slate-300">{t('ವೇಳಾಪಟ್ಟಿ', 'Schedule')}</div>
              </div>
              <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                <div className="font-mono text-rose-400 font-bold">Alt + D</div>
                <div className="text-slate-300">{t('ಮೆಚ್ಚಿದ ದಾಖಲೆ', 'Liked Docs')}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Lodge Complaint Form (1000 letters, Submit Note, Attachments, Anonymity - Secure Submission) */}
        {activeTab === 'lodge' && (
          <ComplaintForm
            panchayat={panchayat}
            user={user}
            onRequireAuth={() => {
              setAuthMode('citizen');
              setIsAuthOpen(true);
            }}
            onSubmitComplaint={handleLodgeComplaint}
          />
        )}

        {/* Tab 2: Grievance Status Tracker (100% Public & Unauthenticated Access for All Citizens) */}
        {activeTab === 'track' && (
          <ComplaintTracker
            complaints={complaints}
            user={user}
            onOpenComplaintForm={() => handleTabChange('lodge')}
          />
        )}

        {/* Tab 3: 5-Year Election Council Governance (100% Public & Unauthenticated Council Transparency) */}
        {activeTab === 'council' && (
          <ElectionCouncilView
            panchayat={panchayat}
            councilMembers={councilMembers}
            user={user}
            onAddMember={handleAddCouncilMember}
            onRemoveMember={handleRemoveCouncilMember}
            onArchiveTerm={handleArchive5YearTerm}
            onRequirePdoLogin={() => {
              setAuthMode('official_pdo');
              setIsAuthOpen(true);
            }}
          />
        )}

        {/* Tab 4: GramaSeva Governance Reports & Analytics (Public & Administrative Governance Audits) */}
        {activeTab === 'reports' && (
          <ReportAnalyticsView
            complaints={complaints}
            panchayat={panchayat}
            councilMembers={councilMembers}
            onOpenComplaintTracker={() => handleTabChange('track')}
          />
        )}

        {/* Tab 5: Authorized Officer / PDO Redressal Console (Strictly Secured Access Gate) */}
        {activeTab === 'admin' && (
          <AdminPortal
            complaints={complaints}
            panchayat={panchayat}
            user={user}
            onUpdateComplaintStatus={handleUpdateStatus}
            onRequirePdoLogin={() => {
              setAuthMode('official_pdo');
              setIsAuthOpen(true);
            }}
            onSwitchToPublicTrack={() => handleTabChange('track')}
            onOpenReports={() => handleTabChange('reports')}
          />
        )}
      </main>

      {/* Official Government Footer */}
      <footer className="relative z-10 bg-slate-900 text-slate-400 text-xs mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-slate-800">
            {/* Logo & Description */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-3">
                <KarnatakaEmblem size={42} />
                <div>
                  <div className="text-white font-bold font-kannada text-sm">
                    {t('ಕರ್ನಾಟಕ ಗ್ರಾಮ ಪಂಚಾಯತ್ ಜನಹಿತ ಪೋರ್ಟಲ್', 'Karnataka Gram Panchayat Janahita Portal')}
                  </div>
                  <div className="text-emerald-400 text-xs">
                    {t('ಗ್ರಾಮೀಣಾಭಿವೃದ್ಧಿ ಮತ್ತು ಪಂಚಾಯತ್ ರಾಜ್ ಇಲಾಖೆ (RDPR)', 'Rural Development & Panchayat Raj Department (RDPR)')}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                {t(
                  'ಗ್ರಾಮೀಣ ಕರ್ನಾಟಕದ ನಾಗರಿಕರಿಗೆ ಪಾರದರ್ಶಕ ಮತ್ತು ಜನಸ್ನೇಹಿ ಕುಂದುಕೊರತೆ ನಿವಾರಣಾ ವೇದಿಕೆ. ದೂರುದಾರರಿಗೆ ಸಂಪೂರ್ಣ ಅನಾಮಧೇಯತೆ ರಕ್ಷಣೆ, 1000-ಅಕ್ಷರಗಳ ವಿವರಣೆ, ದಾಖಲೆ ಲಗತ್ತು ಮತ್ತು 5-ವರ್ಷಗಳ ಚುನಾವಣಾ ಮಂಡಳಿ ಆಡಳಿತ.',
                  'A transparent, citizen-centric grievance redressal system empowering rural citizens of Karnataka. Built with automated whistleblower protection, 1000-character descriptions, file attachments, and 5-year election term governance.'
                )}
              </p>
            </div>

            {/* Helpline & Working Timings */}
            <div className="space-y-1.5 text-[11px]">
              <div className="font-bold text-white uppercase tracking-wider font-kannada">
                {t('ಸಹಾಯವಾಣಿ & ಕಚೇರಿ ವೇಳೆ', 'Helpline & Office Hours')}
              </div>
              <div>
                {t('ಪಂಚಾಯತಿ ಸಹಾಯವಾಣಿ:', 'Panchayat Helpline:')}{' '}
                <a
                  href="tel:0000111101"
                  className="font-mono font-bold text-amber-300 underline"
                >
                  0000111101
                </a>
              </div>
              <div>{t('ಸೋಮವಾರ – ಗುರುವಾರ: 10:00 AM – 5:00 PM', 'Monday – Thursday: 10:00 AM – 5:00 PM')}</div>
              <div>{t('ಶನಿವಾರ (ಅರ್ಧದಿನ): 10:00 AM – 1:00 PM', 'Saturday (Half Day): 10:00 AM – 1:00 PM')}</div>
              <div>{t('ಭಾನುವಾರ: ರಜಾದಿನ', 'Sunday: Holiday')}</div>
              <div>{t('ಊಟದ ವಿರಾಮ: 1:00 PM – 2:00 PM', 'Lunch Recess: 1:00 PM – 2:00 PM')}</div>
            </div>

            {/* Privacy & Legal */}
            <div className="space-y-1.5 text-[11px]">
              <div className="font-bold text-white uppercase tracking-wider font-kannada">
                {t('ಗೌಪ್ಯತೆ & ಕಾಯ್ದೆ', 'Privacy & Legal')}
              </div>
              <div>Karnataka Gram Swaraj & Panchayat Raj Act, 1993</div>
              <div className="text-emerald-400">
                {t('೧೦೦% ಅನಾಮಧೇಯ ದೂರುದಾರರ ರಕ್ಷಣೆ', '100% Anonymous Whistleblower Protection')}
              </div>
              <div>
                {t(
                  `ಒಳಪಟ್ಟ ಗ್ರಾಮಗಳು: ${panchayat.villages.length} ಗ್ರಾಮಗಳು (<10)`,
                  `Constituent Villages: ${panchayat.villages.length} Villages (<10)`
                )}
              </div>
              <div>{t('೫-ವರ್ಷಗಳ ಪ್ರಜಾಸತ್ತಾತ್ಮಕ ಚುನಾವಣೆ ನಿರ್ವಹಣೆ', '5-Year Democratic Election Cycle Management')}</div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
            <div>
              © 2026 {isKannada ? panchayat.nameKn : panchayat.nameEn} • {t('ಗ್ರಾಮೀಣಾಭಿವೃದ್ಧಿ ಮತ್ತು ಪಂಚಾಯತ್ ರಾಜ್ ಇಲಾಖೆ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ', 'Department of RDPR, Government of Karnataka')}.
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <button
                onClick={() => setIsShareOpen(true)}
                className="text-amber-400 hover:text-amber-300 underline font-bold cursor-pointer inline-flex items-center gap-1"
              >
                <Share2 className="w-3 h-3" />
                <span>{t('ಸಾರ್ವಜನಿಕ ಲಿಂಕ್', 'Public Link')}</span>
              </button>
              <span>•</span>
              <span>Helpline: 0000111101</span>
              <span>•</span>
              <span>{t('ಜನಹಿತ ಕುಂದುಕೊರತೆ ಪೋರ್ಟಲ್', 'Janahita Grievance Portal')}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Popups */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(session) => {
          setUser(session);
          setSrAnnouncement(
            session.role === 'official_pdo'
              ? t('ಪಿ.ಡಿ.ಒ ಅಧಿಕಾರಿಯಾಗಿ ಯಶಸ್ವಿಯಾಗಿ ಲಾಗಿನ್ ಆಗಿದ್ದೀರಿ.', 'Logged in as PDO Officer.')
              : t('ನಾಗರಿಕರಾಗಿ ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಂಡಿದೆ.', 'Citizen verification successful.')
          );
        }}
        initialMode={authMode}
      />

      <LocationPickerModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        panchayat={panchayat}
        onSelectPanchayat={(updated) => {
          setPanchayat(updated);
          setCouncilMembers(getCouncilMembersForPanchayat(updated));
          setSrAnnouncement(
            t(
              `ಗ್ರಾಮ ಪಂಚಾಯತಿಯನ್ನು ${updated.nameKn} ಗೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.`,
              `Gram Panchayat switched to ${updated.nameEn}.`
            )
          );
        }}
      />

      <OfficeHoursModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        helplineNumber={panchayat.helplineNumber}
      />

      <PublicShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        panchayat={panchayat}
      />

      <LikedDocumentsModal
        isOpen={isLikedDocsOpen}
        onClose={() => setIsLikedDocsOpen(false)}
        user={user}
      />

      {/* Real-time Complaint Notification Toast */}
      <NotificationToast
        complaint={latestAlert}
        onDismiss={() => setLatestAlert(null)}
        onView={(c) => {
          handleTabChange('track');
        }}
      />
    </div>
  );
}
