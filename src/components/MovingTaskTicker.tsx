import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronUp,
  ChevronDown,
  Pause,
  Play,
  ArrowUp,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface TaskUpdate {
  id: string;
  categoryIcon: string;
  titleKn: string;
  titleEn: string;
  statusKn: string;
  statusEn: string;
  village: string;
  timeAgo: string;
}

const DEFAULT_MOVING_TASKS: TaskUpdate[] = [
  {
    id: 'GP-KA-2026-WTR-108',
    categoryIcon: '💧',
    titleKn: 'ಮುಖ್ಯ ರಸ್ತೆಯ ಕುಡಿಯುವ ನೀರಿನ ಪೈಪ್‌ಲೈನ್ ದುರಸ್ತಿ ಕಾರ್ಯ ಪೂರ್ಣಗೊಂಡಿದೆ',
    titleEn: 'Main road drinking water pipeline repair task completed',
    statusKn: 'ಪರಿಹರಿಸಲಾಗಿದೆ',
    statusEn: 'Resolved',
    village: 'ನಂದಿ (Nandi)',
    timeAgo: '10 min ago',
  },
  {
    id: 'GP-KA-2026-RDS-109',
    categoryIcon: '🛣️',
    titleKn: 'ಕಾಂಕ್ರೀಟ್ ರಸ್ತೆ ದುರಸ್ತಿ & ಸ್ಥಳ ತಪಾಸಣೆ ಪಿ.ಡಿ.ಒ ರವರಿಂದ ಅನುಮೋದಿಸಲಾಗಿದೆ',
    titleEn: 'Concrete road site inspection task approved by PDO',
    statusKn: 'ಸ್ಥಳ ತಪಾಸಣೆ',
    statusEn: 'Site Inspection',
    village: 'ಬೋಗಾನಹಳ್ಳಿ (Boganahalli)',
    timeAgo: '25 min ago',
  },
  {
    id: 'GP-KA-2026-ELC-104',
    categoryIcon: '💡',
    titleKn: 'ವಾರ್ಡ್ ೨ ರ ಬೀದಿದೀಪ ದುರಸ್ತಿ ಕಾರ್ಯ ಯಶಸ್ವಿಯಾಗಿ ಮುಕ್ತಾಯಗೊಂಡಿದೆ',
    titleEn: 'Ward 2 streetlight repair task successfully completed',
    statusKn: 'ಪರಿಹರಿಸಲಾಗಿದೆ',
    statusEn: 'Resolved',
    village: 'ಸುಲ್ತಾನಪೇಟೆ (Sultanpet)',
    timeAgo: '1 hr ago',
  },
  {
    id: 'GP-KA-2026-SBM-112',
    categoryIcon: '♻️',
    titleKn: 'ಸ್ವಚ್ಛ ಭಾರತ: ಮನೆ-ಮನೆ ಕಸ ಸಂಗ್ರಹಣೆ ವಾಹನ ಮಾರ್ಗ ಪರಿಷ್ಕರಣೆ ಕಾರ್ಯ',
    titleEn: 'Swachh Bharat: Door-to-door waste collection vehicle route updated',
    statusKn: 'ಕ್ರಮ ಜರುಗಿಸಲಾಗಿದೆ',
    statusEn: 'Action Initiated',
    village: 'ಮುದ್ದೇನಹಳ್ಳಿ (Muddenahalli)',
    timeAgo: '2 hrs ago',
  },
  {
    id: 'GP-KA-2026-GS-2026',
    categoryIcon: '🏛️',
    titleKn: 'ವಿಶೇಷ ಗ್ರಾಮ ಸಭೆ: ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆ & ಅನುದಾನ ಪರಿಶೀಲನಾ ಕಾರ್ಯ',
    titleEn: 'Special Gram Sabha: Public grievance & fund audit task scheduled',
    statusKn: 'ಕಾರ್ಯಸೂಚಿ ನಿಗದಿ',
    statusEn: 'Scheduled Sat 10 AM',
    village: 'ಗ್ರಾಮ ಪಂಚಾಯತಿ ಕಚೇರಿ',
    timeAgo: 'Today',
  },
];

interface MovingTaskTickerProps {
  onSelectTask?: (taskId: string) => void;
}

export const MovingTaskTicker: React.FC<MovingTaskTickerProps> = ({ onSelectTask }) => {
  const { t, isKannada } = useLanguage();
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Cycle tasks from bottom to top every 3.8 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DEFAULT_MOVING_TASKS.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Track window scroll position to show floating "Move from Bottom to Top" button
  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > 280) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', checkScroll, { passive: true });
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % DEFAULT_MOVING_TASKS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + DEFAULT_MOVING_TASKS.length) % DEFAULT_MOVING_TASKS.length);
  };

  const currentTask = DEFAULT_MOVING_TASKS[currentIndex];

  return (
    <>
      {/* Moving Task Ticker Banner (Scrolls tasks upwards from bottom to top) */}
      <div className="bg-slate-900 text-white border-b border-slate-800 shadow-xs relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs">
          {/* Label Badge */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-600/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{t('ಲೈವ್ ಕಾರ್ಯಗಳು (ಕೆಳಗಿಂದ ಮೇಲಕ್ಕೆ)', 'Moving Tasks ↑')}</span>
            </span>
            <span className="text-amber-300 font-bold hidden md:inline text-[11px] font-kannada">
              {t('ನವೀಕರಣ:', 'Live Update:')}
            </span>
          </div>

          {/* Animated Vertical Task Slider (Smoothly moves from bottom to top) */}
          <div
            className="flex-1 min-w-0 h-6 overflow-hidden relative cursor-pointer"
            onClick={() => onSelectTask && onSelectTask(currentTask.id)}
            title={t('ದೂರಿನ ವಿವರ ನೋಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ', 'Click to view complaint task details')}
          >
            <div
              key={currentIndex}
              className="animate-in fade-in slide-in-from-bottom-3 duration-500 flex items-center gap-2 min-w-0"
            >
              <span className="text-sm shrink-0">{currentTask.categoryIcon}</span>
              <span className="font-mono text-emerald-400 font-bold shrink-0 text-[11px]">
                {currentTask.id}
              </span>
              <span className="text-slate-400 hidden lg:inline">•</span>
              <span className="truncate text-slate-200 font-medium text-xs">
                {isKannada ? currentTask.titleKn : currentTask.titleEn}
              </span>
              <span className="text-slate-400 hidden xl:inline">({currentTask.village})</span>
              <span className="ml-auto shrink-0 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {isKannada ? currentTask.statusKn : currentTask.statusEn}
              </span>
            </div>
          </div>

          {/* Controls: Prev, Play/Pause, Next */}
          <div className="flex items-center gap-1 shrink-0 text-slate-400">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
              title={t('ಹಿಂದಿನ ಕಾರ್ಯ', 'Previous Task')}
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              className="p-1 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
              title={isPaused ? t('ಪ್ಲೇ ಮಾಡಿ', 'Play') : t('ವಿರಾಮಗೊಳಿಸಿ', 'Pause')}
            >
              {isPaused ? <Play className="w-3 h-3 text-amber-400" /> : <Pause className="w-3 h-3" />}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
              title={t('ಮುಂದಿನ ಕಾರ್ಯ', 'Next Task')}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-500 pl-1 hidden sm:inline">
              {currentIndex + 1}/{DEFAULT_MOVING_TASKS.length}
            </span>
          </div>
        </div>
      </div>

      {/* Floating "Move Task / Scroll from Bottom to Top" Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-2xl border-2 border-emerald-300/40 hover:scale-105 active:scale-95 transition-all cursor-pointer animate-in fade-in slide-in-from-bottom-5"
          title={t('ಕೆಳಗಿನಿಂದ ಮೇಲಕ್ಕೆ ಹೋಗಿ / Move to Top of Portal', 'Scroll from bottom to top')}
          aria-label="Move to top"
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline font-kannada">
            {t('ಮೇಲಕ್ಕೆ ಹೋಗಿ', 'Move to Top')}
          </span>
        </button>
      )}
    </>
  );
};
