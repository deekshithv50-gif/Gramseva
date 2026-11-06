import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'karnataka_green' | 'mysore_gold' | 'kaveri_blue' | 'dark_night' | 'high_contrast';

export interface ThemeConfig {
  id: ThemeId;
  nameEn: string;
  nameKn: string;
  badge: string;
  primaryColor: string;
  headerGradient: string;
  headerText: string;
  bgClass: string;
  cardClass: string;
  borderClass: string;
  accentBg: string;
  accentText: string;
  buttonPrimary: string;
  previewColors: [string, string, string];
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  karnataka_green: {
    id: 'karnataka_green',
    nameEn: 'Karnataka Green & Gold',
    nameKn: 'ಕರ್ನಾಟಕ ಹಸಿರು & ಚಿನ್ನ (ಅಧಿಕೃತ)',
    badge: 'Official RDPR',
    primaryColor: '#15803d',
    headerGradient: 'from-amber-600 via-emerald-800 to-amber-700',
    headerText: 'text-white',
    bgClass: 'bg-slate-50',
    cardClass: 'bg-white text-slate-900',
    borderClass: 'border-emerald-800/20',
    accentBg: 'bg-emerald-50',
    accentText: 'text-emerald-900',
    buttonPrimary: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    previewColors: ['#15803d', '#d97706', '#f0fdf4'],
  },
  mysore_gold: {
    id: 'mysore_gold',
    nameEn: 'Mysore Sandalwood & Gold',
    nameKn: 'ಮೈಸೂರು ಚಂದನ & ರಾಯಲ್ ಗೋಲ್ಡ್',
    badge: 'Heritage Palace',
    primaryColor: '#b45309',
    headerGradient: 'from-amber-800 via-yellow-700 to-rose-900',
    headerText: 'text-white',
    bgClass: 'bg-amber-50/40',
    cardClass: 'bg-[#fffdf7] text-slate-900',
    borderClass: 'border-amber-400/30',
    accentBg: 'bg-amber-100/60',
    accentText: 'text-amber-950',
    buttonPrimary: 'bg-amber-700 hover:bg-amber-800 text-white',
    previewColors: ['#b45309', '#eab308', '#fefce8'],
  },
  kaveri_blue: {
    id: 'kaveri_blue',
    nameEn: 'Kaveri Oceanic Blue',
    nameKn: 'ಕಾವೇರಿ ಸಾಗರ ನೀಲಿ & ಸಹ್ಯಾದ್ರಿ',
    badge: 'River Trust',
    primaryColor: '#1d4ed8',
    headerGradient: 'from-blue-900 via-sky-800 to-teal-800',
    headerText: 'text-white',
    bgClass: 'bg-sky-50/40',
    cardClass: 'bg-white text-slate-900',
    borderClass: 'border-blue-300/40',
    accentBg: 'bg-blue-50',
    accentText: 'text-blue-950',
    buttonPrimary: 'bg-blue-700 hover:bg-blue-800 text-white',
    previewColors: ['#1d4ed8', '#0ea5e9', '#f0f9ff'],
  },
  dark_night: {
    id: 'dark_night',
    nameEn: 'Night Governance (Dark)',
    nameKn: 'ರಾತ್ರಿ ಮೋಡ್ - ಡಾರ್ಕ್ ಗವರ್ನೆನ್ಸ್',
    badge: 'OLED Friendly',
    primaryColor: '#10b981',
    headerGradient: 'from-slate-900 via-zinc-900 to-neutral-900',
    headerText: 'text-emerald-400',
    bgClass: 'bg-slate-950 text-slate-100',
    cardClass: 'bg-slate-900 text-slate-100',
    borderClass: 'border-slate-800',
    accentBg: 'bg-slate-800/80',
    accentText: 'text-emerald-300',
    buttonPrimary: 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold',
    previewColors: ['#0f172a', '#10b981', '#1e293b'],
  },
  high_contrast: {
    id: 'high_contrast',
    nameEn: 'High Contrast (Pure White)',
    nameKn: 'ಸ್ವಚ್ಛ ಶ್ವೇತ & ಹೈ ಕಾಂಟ್ರಾಸ್ಟ್',
    badge: 'Accessible Senior',
    primaryColor: '#000000',
    headerGradient: 'from-black via-slate-900 to-black',
    headerText: 'text-amber-300',
    bgClass: 'bg-white text-black',
    cardClass: 'bg-white text-black border-2 border-black',
    borderClass: 'border-black',
    accentBg: 'bg-yellow-100',
    accentText: 'text-black',
    buttonPrimary: 'bg-black hover:bg-slate-800 text-white font-bold',
    previewColors: ['#000000', '#facc15', '#ffffff'],
  },
};

interface ThemeContextType {
  theme: ThemeConfig;
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  availableThemes: ThemeConfig[];
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem('gp_portal_theme');
      if (saved && Object.keys(THEMES).includes(saved)) {
        return saved as ThemeId;
      }
    } catch (e) {
      console.warn('Failed reading theme preference:', e);
    }
    return 'karnataka_green';
  });

  const setTheme = (id: ThemeId) => {
    if (THEMES[id]) {
      setThemeId(id);
      try {
        localStorage.setItem('gp_portal_theme', id);
      } catch (e) {
        console.warn('Failed saving theme preference:', e);
      }
    }
  };

  const currentTheme = THEMES[themeId] || THEMES.karnataka_green;
  const isDark = themeId === 'dark_night';

  useEffect(() => {
    // Sync class on root document element
    const root = document.documentElement;
    root.classList.remove('theme-karnataka_green', 'theme-mysore_gold', 'theme-kaveri_blue', 'theme-dark_night', 'theme-high_contrast');
    root.classList.add(`theme-${themeId}`);
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeId, isDark]);

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        themeId,
        setTheme,
        availableThemes: Object.values(THEMES),
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
