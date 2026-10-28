import React from 'react';
import { Languages, Check } from 'lucide-react';
import { useLanguage, AppLanguage } from '../context/LanguageContext';

interface LanguageSwitcherProps {
  variant?: 'header' | 'compact' | 'pill' | 'toolbar';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { language, setLanguage, isKannada, isEnglish, isBoth } = useLanguage();

  const options: { id: AppLanguage; labelKn: string; labelEn: string; short: string }[] = [
    { id: 'kn', labelKn: 'ಕನ್ನಡ', labelEn: 'Kannada', short: 'ಕನ್ನಡ' },
    { id: 'en', labelKn: 'ಇಂಗ್ಲಿಷ್', labelEn: 'English', short: 'English' },
    { id: 'both', labelKn: 'ಕನ್ನಡ + Eng', labelEn: 'Bilingual', short: 'ದ್ವಿಭಾಷಾ' },
  ];

  if (variant === 'toolbar') {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300">
          <Languages className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
          <span className="hidden sm:inline">ಭಾಷೆ / Language:</span>
        </div>
        <div
          className="flex items-center bg-emerald-900/90 rounded-lg p-0.5 border border-emerald-700/60 text-xs"
          role="group"
          aria-label="Language selection: strictly English and Kannada"
        >
          {options.map((opt) => {
            const active = language === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setLanguage(opt.id)}
                aria-pressed={active}
                className={`px-2 py-0.5 rounded-md font-bold text-xs transition cursor-pointer ${
                  active
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
                title={`${opt.labelKn} (${opt.labelEn}) - Only English and Kannada`}
              >
                {opt.short}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Header / Pill variant
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`} title="Translate: Strictly English and Kannada / ಕೇವಲ ಇಂಗ್ಲಿಷ್ ಮತ್ತು ಕನ್ನಡ">
      <div className="flex items-center bg-slate-100 hover:bg-slate-200/80 border border-slate-300/80 rounded-xl p-0.5 shadow-2xs transition">
        <div className="px-1.5 py-1 text-slate-500 flex items-center gap-1">
          <Languages className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 hidden md:inline">
            Translate:
          </span>
        </div>

        {options.map((opt) => {
          const active = language === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setLanguage(opt.id)}
              aria-pressed={active}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer inline-flex items-center gap-1 ${
                active
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title={`Switch to ${opt.labelEn} / ${opt.labelKn} (Only English & Kannada)`}
            >
              {active && <Check className="w-3 h-3 text-amber-300" />}
              <span>{opt.short}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
