import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles, Moon, Sun } from 'lucide-react';
import { useTheme, ThemeId } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export const ThemeSelector: React.FC = () => {
  const { theme, themeId, setTheme, availableThemes } = useTheme();
  const { t, isKannada } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300/80 bg-white/90 hover:bg-white text-xs font-semibold text-slate-800 shadow-2xs transition cursor-pointer"
        title={t('ಥೀಮ್ ಬದಲಾಯಿಸಿ / Change Portal Theme', 'Change Portal Theme Options')}
        aria-label="Select Portal Theme"
      >
        <Palette className="w-3.5 h-3.5 text-amber-600" />
        <span className="hidden sm:inline font-medium">
          {isKannada ? theme.nameKn.split(' ')[0] : theme.nameEn.split(' ')[0]}
        </span>
        {/* Color preview dot */}
        <span
          className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0 shadow-2xs"
          style={{ backgroundColor: theme.primaryColor }}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-2xl border border-slate-200 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1.5 border-b border-slate-100 mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-slate-800">
                {t('ಪೋರ್ಟಲ್ ಥೀಮ್ ಆಯ್ಕೆಮಾಡಿ', 'Choose Theme Style')}
              </span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
              5 {t('ಆಯ್ಕೆಗಳು', 'Options')}
            </span>
          </div>

          <div className="space-y-1.5">
            {availableThemes.map((th) => {
              const isSelected = th.id === themeId;
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => {
                    setTheme(th.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-emerald-50 border border-emerald-400/80 text-emerald-950 font-bold shadow-xs'
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Swatch Pill */}
                    <div className="flex -space-x-1 shrink-0 p-0.5 bg-slate-100 rounded-full border border-slate-200 shadow-2xs">
                      {th.previewColors.map((color, idx) => (
                        <span
                          key={idx}
                          className="w-3.5 h-3.5 rounded-full border border-white shrink-0"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    <div className="min-w-0 truncate">
                      <div className="text-xs leading-tight font-bold truncate">
                        {isKannada ? th.nameKn : th.nameEn}
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal leading-tight">
                        {th.badge}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="p-1 bg-emerald-600 text-white rounded-full shrink-0 shadow-2xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-center font-kannada">
            {t('ಬದಲಾವಣೆಗಳು ತಕ್ಷಣವೇ ಅನ್ವಯಿಸುತ್ತವೆ', 'Changes apply instantly across all pages')}
          </div>
        </div>
      )}
    </div>
  );
};
