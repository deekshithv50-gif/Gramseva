import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppLanguage = 'kn' | 'en' | 'both';

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  // Translate helper: takes Kannada and English strings, returns active translation
  t: (kn: string, en: string) => string;
  // Format bilingual text based on active preference
  formatBilingual: (kn: string, en: string) => string;
  isKannada: boolean;
  isEnglish: boolean;
  isBoth: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem('gp_portal_language');
    if (saved === 'kn' || saved === 'en' || saved === 'both') {
      return saved as AppLanguage;
    }
    // Default to both or Kannada for local citizens
    return 'both';
  });

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('gp_portal_language', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language === 'kn' ? 'kn' : language === 'en' ? 'en' : 'kn-IN';
  }, [language]);

  const t = (kn: string, en: string): string => {
    if (language === 'kn') return kn;
    if (language === 'en') return en;
    return `${kn} / ${en}`;
  };

  const formatBilingual = (kn: string, en: string): string => {
    if (language === 'kn') return kn;
    if (language === 'en') return en;
    return `${kn} (${en})`;
  };

  const isKannada = language === 'kn';
  const isEnglish = language === 'en';
  const isBoth = language === 'both';

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatBilingual,
        isKannada,
        isEnglish,
        isBoth,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// UI Translations Dictionary for standardized terms
export const DICTIONARY = {
  portalTitle: {
    kn: 'ಕರ್ನಾಟಕ ಗ್ರಾಮ ಪಂಚಾಯತ್ ಜನಹಿತ ಪೋರ್ಟಲ್',
    en: 'Karnataka Gram Panchayat Janahita Portal',
  },
  govtDept: {
    kn: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ | ಗ್ರಾಮೀಣಾಭಿವೃದ್ಧಿ ಮತ್ತು ಪಂಚಾಯತ್ ರಾಜ್ ಇಲಾಖೆ (RDPR)',
    en: 'Govt. of Karnataka | Rural Development and Panchayat Raj Department (RDPR)',
  },
  helpline: {
    kn: 'ಅಧಿಕೃತ ಸಹಾಯವಾಣಿ',
    en: 'Official Helpline',
  },
  officeHours: {
    kn: 'ಕಚೇರಿ ಕಾರ್ಯಾವಧಿ',
    en: 'Office Working Hours',
  },
  trackGrievance: {
    kn: 'ಸ್ಥಿತಿ ಪರಿಶೀಲನೆ',
    en: 'Track Grievance',
  },
  lodgeComplaint: {
    kn: 'ದೂರು ದಾಖಲಿಸಿ',
    en: 'Lodge Complaint',
  },
  councilMembers: {
    kn: 'ಮಂಡಳಿ ಸದಸ್ಯರು',
    en: 'Council Members',
  },
  pdoOfficeDesk: {
    kn: 'ಪಿ.ಡಿ.ಒ ಕಚೇರಿ',
    en: 'PDO Officer Desk',
  },
  publicMode: {
    kn: 'ಸಾರ್ವಜನಿಕ ವೀಕ್ಷಣೆ',
    en: 'Public Mode',
  },
  noLoginNeeded: {
    kn: 'ಯಾವುದೇ ಲಾಗಿನ್ ಅಗತ್ಯವಿಲ್ಲ',
    en: 'No Login Required',
  },
  citizenLogin: {
    kn: 'ಪ್ರವೇಶ / Citizen Login',
    en: 'Citizen Login',
  },
  logout: {
    kn: 'ನಿರ್ಗಮನ',
    en: 'Logout',
  },
  whistleblowerAssurance: {
    kn: 'ದೂರುದಾರರ ಗೌಪ್ಯತೆ 100% ಖಚಿತ (Whistleblower)',
    en: '100% Anonymous Whistleblower Protection',
  },
  filterCategory: {
    kn: 'ದೂರಿನ ವರ್ಗ',
    en: 'Category',
  },
  filterStatus: {
    kn: 'ಸ್ಥಿತಿ',
    en: 'Status',
  },
  filterVillage: {
    kn: 'ಗ್ರಾಮ',
    en: 'Village',
  },
  searchPlaceholder: {
    kn: 'ದೂರು ಸಂಖ್ಯೆ (GP-KA-...), ವಿಷಯ, ಗ್ರಾಮ ಅಥವಾ ಮೊಬೈಲ್ ಮೂಲಕ ಹುಡುಕಿ...',
    en: 'Search complaint ID, keywords, village, or mobile...',
  },
  statuses: {
    submitted: { kn: 'ದಾಖಲಾಗಿದೆ', en: 'Submitted' },
    under_review: { kn: 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ', en: 'Under Review' },
    site_inspection: { kn: 'ಸ್ಥಳ ತಪಾಸಣೆ', en: 'Site Inspection' },
    action_initiated: { kn: 'ಕ್ರಮ ಜರುಗಿಸಲಾಗಿದೆ', en: 'Action Initiated' },
    resolved: { kn: 'ಪರಿಹರಿಸಲಾಗಿದೆ', en: 'Resolved' },
    rejected: { kn: 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ', en: 'Rejected' },
  },
  priorities: {
    normal: { kn: 'ಸಾಮಾನ್ಯ', en: 'Normal' },
    high: { kn: 'ಹೆಚ್ಚು', en: 'High' },
    urgent: { kn: 'ತುರ್ತು', en: 'Urgent' },
  },
};
