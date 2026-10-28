import React, { useState, useEffect } from 'react';
import {
  Eye,
  Type,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  Sliders,
  Phone,
  Check,
  ZapOff,
  Sun,
  Moon,
  HelpCircle,
  Languages,
} from 'lucide-react';
import { GramPanchayatInfo } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

export type FontScale = 'normal' | 'large' | 'xlarge' | 'jumbo';

export interface AccessibilitySettings {
  fontScale: FontScale;
  highContrast: boolean;
  dyslexicFont: boolean;
  reducedMotion: boolean;
  screenReaderActive: boolean;
}

interface AccessibilityToolbarProps {
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  onResetSettings: () => void;
  panchayat: GramPanchayatInfo;
  activeTabName: string;
}

export const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({
  settings,
  onUpdateSettings,
  onResetSettings,
  panchayat,
  activeTabName,
}) => {
  const { language, t, isKannada, isEnglish } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesisSupported, setSpeechSynthesisSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesisSupported(true);
    }
  }, []);

  // Text-to-Speech handler supporting Kannada & English specifically
  const handleToggleSpeak = () => {
    if (!speechSynthesisSupported) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      onUpdateSettings({ screenReaderActive: false });
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending utterances

    let speechText = '';
    let speechLang = 'en-US';

    if (isKannada) {
      speechLang = 'kn-IN';
      speechText = `ಕರ್ನಾಟಕ ಸರ್ಕಾರ, ${panchayat.nameKn} ಗ್ರಾಮ ಪಂಚಾಯತ್ ಜನಹಿತ ಪೋರ್ಟಲ್‌ಗೆ ಸುಸ್ವಾಗತ. ಪ್ರಸ್ತುತ ವೀಕ್ಷಣೆ: ${activeTabName}. ಸಾರ್ವಜನಿಕ ಸಹಾಯವಾಣಿ ಸಂಖ್ಯೆ 0 0 0 0 1 1 1 1 0 1. ಕಚೇರಿ ಕಾರ್ಯಾವಧಿ ಸೋಮವಾರದಿಂದ ಗುರುವಾರದವರೆಗೆ ಬೆಳಿಗ್ಗೆ 10 ರಿಂದ ಸಂಜೆ 5 ರವರೆಗೆ, ಮತ್ತು ಶನಿವಾರ ಬೆಳಿಗ್ಗೆ 10 ರಿಂದ ಮಧ್ಯಾಹ್ನ 1 ರವರೆಗೆ. ಸಾರ್ವಜನಿಕರು ಲಾಗಿನ್ ಇಲ್ಲದೆಯೇ ದೂರುಗಳ ಸ್ಥಿತಿ ಮತ್ತು ಚುನಾಯಿತ ಮಂಡಳಿ ಸದಸ್ಯರನ್ನು ನೇರವಾಗಿ ವೀಕ್ಷಿಸಬಹುದು.`;
    } else if (isEnglish) {
      speechLang = 'en-US';
      speechText = `Welcome to Government of Karnataka, ${panchayat.nameEn} Gram Panchayat Janahita Portal. Currently viewing: ${activeTabName}. Official citizen helpline is 0 0 0 0 1 1 1 1 0 1. Office hours are Monday through Thursday 10 AM to 5 PM, and Saturday 10 AM to 1 PM. You can openly track grievances and inspect elected council members without any login.`;
    } else {
      // Bilingual
      speechLang = 'kn-IN';
      speechText = `${panchayat.nameKn} ಗ್ರಾಮ ಪಂಚಾಯತ್ ಜನಹಿತ ಪೋರ್ಟಲ್. ${panchayat.nameEn} Gram Panchayat Janahita Portal. Official helpline 0 0 0 0 1 1 1 1 0 1. Currently viewing ${activeTabName}. Open public tracking and council directory available for all citizens.`;
    }

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = speechLang;
    utterance.rate = 0.9; // Slightly slower for clear pronunciation
    utterance.pitch = 1.0;

    // Try finding an installed voice matching the language
    const voices = window.speechSynthesis.getVoices();
    if (isKannada && voices.length > 0) {
      const knVoice = voices.find((v) => v.lang.startsWith('kn') || v.lang.includes('Kannada'));
      if (knVoice) utterance.voice = knVoice;
    } else if (isEnglish && voices.length > 0) {
      const enVoice = voices.find((v) => v.lang.startsWith('en-IN') || v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      onUpdateSettings({ screenReaderActive: true });
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      onUpdateSettings({ screenReaderActive: false });
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      onUpdateSettings({ screenReaderActive: false });
    };

    window.speechSynthesis.speak(utterance);
  };

  const hasNonDefaultSettings =
    settings.fontScale !== 'normal' ||
    settings.highContrast ||
    settings.dyslexicFont ||
    settings.reducedMotion;

  return (
    <aside
      aria-label="Accessibility & Assistive Features"
      className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 pt-2"
    >
      <div
        className={`rounded-2xl border transition-all shadow-xs ${
          settings.highContrast
            ? 'bg-black text-white border-yellow-400 shadow-md'
            : 'bg-emerald-950 text-white border-emerald-800/60'
        }`}
      >
        {/* Quick Accessibility Ribbon */}
        <div className="px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Left Title & Status */}
          <div className="flex items-center gap-2">
            <span
              className={`p-1 rounded-md inline-flex items-center gap-1 font-bold font-kannada ${
                settings.highContrast
                  ? 'bg-yellow-400 text-black'
                  : 'bg-emerald-800 text-emerald-100'
              }`}
            >
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('ಎಲ್ಲರಿಗೂ ಲಭ್ಯತೆ', 'Accessibility')}</span>
            </span>
            <span className="hidden lg:inline text-[11px] text-emerald-200/90">
              {t(
                'ಕಣ್ಣಿನ ದೃಷ್ಟಿ, ವಯೋವೃದ್ಧರು & ದಿವ್ಯಾಂಗರಿಗಾಗಿ ಸರಳೀಕೃತ ವ್ಯವಸ್ಥೆ (WCAG AAA)',
                'Optimized legibility for elders & screen-readers (WCAG AAA)'
              )}
            </span>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Toolbar Language Switcher - Strictly Kannada & English */}
            <LanguageSwitcher variant="toolbar" />

            {/* Font Size Selector Quick Buttons */}
            <div
              className={`flex items-center rounded-lg p-0.5 border ${
                settings.highContrast
                  ? 'bg-zinc-900 border-yellow-400 text-yellow-300'
                  : 'bg-emerald-900/80 border-emerald-700/60 text-white'
              }`}
              role="group"
              aria-label="Text Size Controls"
            >
              <span className="text-[10px] px-1.5 font-bold uppercase tracking-wider text-slate-300">
                {t('ಪಠ್ಯ:', 'Font:')}
              </span>
              {(['normal', 'large', 'xlarge', 'jumbo'] as FontScale[]).map((scale) => {
                const labels: Record<FontScale, { symbol: string; title: string }> = {
                  normal: { symbol: 'A', title: 'Normal Text (100%)' },
                  large: { symbol: 'A+', title: 'Large Text (115%)' },
                  xlarge: { symbol: 'A++', title: 'Extra Large (125%)' },
                  jumbo: { symbol: 'A+++', title: 'Maximum Legibility (140%)' },
                };
                const isSelected = settings.fontScale === scale;
                return (
                  <button
                    key={scale}
                    onClick={() => onUpdateSettings({ fontScale: scale })}
                    title={labels[scale].title}
                    aria-pressed={isSelected}
                    className={`px-2 py-0.5 text-xs font-bold rounded cursor-pointer transition ${
                      isSelected
                        ? settings.highContrast
                          ? 'bg-yellow-400 text-black shadow-xs font-black'
                          : 'bg-emerald-500 text-slate-950 shadow-xs'
                        : 'hover:bg-white/10 text-slate-200'
                    }`}
                  >
                    {labels[scale].symbol}
                  </button>
                );
              })}
            </div>

            {/* High Contrast Toggle Button */}
            <button
              onClick={() => onUpdateSettings({ highContrast: !settings.highContrast })}
              aria-pressed={settings.highContrast}
              title={t('ಹೈ-ಕಾಂಟ್ರಾಸ್ಟ್ ಮೋಡ್ ಬದಲಾಯಿಸಿ', 'Toggle High Contrast Mode')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer border ${
                settings.highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300 shadow-sm'
                  : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border-emerald-700/60'
              }`}
            >
              {settings.highContrast ? (
                <Sun className="w-3.5 h-3.5 text-black" aria-hidden="true" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
              )}
              <span>
                {settings.highContrast
                  ? t('ಕಾಂಟ್ರಾಸ್ಟ್ ಆನ್', 'Contrast On')
                  : t('ಹೈ-ಕಾಂಟ್ರಾಸ್ಟ್', 'Contrast')}
              </span>
            </button>

            {/* Text to Speech (Read Aloud) Button */}
            {speechSynthesisSupported && (
              <button
                onClick={handleToggleSpeak}
                aria-pressed={isSpeaking}
                title={isSpeaking ? 'Stop Audio Reader' : 'Read Page Aloud (ಧ್ವನಿ ಓದುಗ)'}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer border ${
                  isSpeaking
                    ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                    : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border-emerald-700/60'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t('ನಿಲ್ಲಿಸಿ', 'Stop')}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
                    <span>{t('ಧ್ವನಿ ಓದುಗ', 'Listen')}</span>
                  </>
                )}
              </button>
            )}

            {/* Expand Full Accessibility Options */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-controls="accessibility-panel-details"
              title="Toggle more accessibility preferences"
              className={`px-2 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer border ${
                isExpanded
                  ? 'bg-white/20 text-white border-white/40'
                  : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border-emerald-700/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{t('ಹೆಚ್ಚಿನ ಆಯ್ಕೆಗಳು', 'Options')}</span>
            </button>

            {/* Reset Defaults */}
            {hasNonDefaultSettings && (
              <button
                onClick={onResetSettings}
                title="Reset accessibility options to default"
                className="px-2 py-1 rounded-lg text-xs font-medium text-rose-300 hover:text-white hover:bg-rose-900/60 border border-rose-700/50 inline-flex items-center gap-1 transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                <span className="hidden sm:inline">{t('ರೀಸೆಟ್', 'Reset')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Expanded Accessibility Options Drawer */}
        {isExpanded && (
          <div
            id="accessibility-panel-details"
            className={`px-4 py-3.5 border-t text-xs space-y-3 ${
              settings.highContrast
                ? 'border-yellow-400/50 bg-zinc-950 text-white'
                : 'border-emerald-800 bg-emerald-900/40 text-emerald-100'
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Option 1: Dyslexia / High Readability Font */}
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                  settings.highContrast
                    ? 'border-zinc-700 bg-zinc-900'
                    : 'border-emerald-800 bg-emerald-950/70'
                }`}
              >
                <div>
                  <div className="font-bold">{t('ಸುಲಭ ಓದುವಿಕೆ', 'High Legibility')}</div>
                  <div className="text-[11px] text-slate-300">{t('ಹೆಚ್ಚುವರಿ ಅಕ್ಷರಗಳ ಅಂತರ', 'Wide letter spacing')}</div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ dyslexicFont: !settings.dyslexicFont })}
                  aria-pressed={settings.dyslexicFont}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                    settings.dyslexicFont
                      ? settings.highContrast
                        ? 'bg-yellow-400 text-black'
                        : 'bg-emerald-500 text-slate-950'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {settings.dyslexicFont ? t('ಆನ್', 'On') : t('ಆಫ್', 'Off')}
                </button>
              </div>

              {/* Option 2: Reduced Motion */}
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                  settings.highContrast
                    ? 'border-zinc-700 bg-zinc-900'
                    : 'border-emerald-800 bg-emerald-950/70'
                }`}
              >
                <div>
                  <div className="font-bold">{t('ಚಲನೆ ಕಡಿಮೆ ಮಾಡಿ', 'Reduce Motion')}</div>
                  <div className="text-[11px] text-slate-300">{t('ಅನಿಮೇಷನ್‌ಗಳನ್ನು ನಿಲ್ಲಿಸಿ', 'Pause animations')}</div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ reducedMotion: !settings.reducedMotion })}
                  aria-pressed={settings.reducedMotion}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                    settings.reducedMotion
                      ? settings.highContrast
                        ? 'bg-yellow-400 text-black'
                        : 'bg-emerald-500 text-slate-950'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {settings.reducedMotion ? t('ಆನ್', 'On') : t('ಆಫ್', 'Off')}
                </button>
              </div>

              {/* Option 3: Screen Reader Friendly Help */}
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                  settings.highContrast
                    ? 'border-zinc-700 bg-zinc-900'
                    : 'border-emerald-800 bg-emerald-950/70'
                }`}
              >
                <div>
                  <div className="font-bold">{t('ಸ್ಕ್ರೀನ್ ರೀಡರ್ ನೆರವು (ARIA)', 'Screen Reader (ARIA)')}</div>
                  <div className="text-[11px] text-slate-300">{t('ಕೀಬೋರ್ಡ್ Tab ನ್ಯಾವಿಗೇಶನ್', 'Keyboard Tab navigation')}</div>
                </div>
                <span className="text-[10px] bg-emerald-700/80 text-white px-2 py-0.5 rounded font-bold">
                  {t('ಸಕ್ರಿಯ', 'Active')}
                </span>
              </div>

              {/* Option 4: Direct Voice Helpline */}
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                  settings.highContrast
                    ? 'border-yellow-400/80 bg-zinc-900'
                    : 'border-amber-400/40 bg-amber-950/40'
                }`}
              >
                <div>
                  <div className="font-bold text-amber-300 font-mono">0000111101</div>
                  <div className="text-[11px] text-slate-300">{t('ಧ್ವನಿ ಸಹಾಯವಾಣಿ', 'Voice Helpline')}</div>
                </div>
                <a
                  href={`tel:${panchayat.helplineNumber}`}
                  className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs inline-flex items-center gap-1 shadow-2xs"
                >
                  <Phone className="w-3 h-3" />
                  <span>{t('ಕರೆ ಮಾಡಿ', 'Call')}</span>
                </a>
              </div>
            </div>

            {/* Accessibility & Language Notice */}
            <div className="pt-2 text-[11px] text-slate-300/90 flex items-center justify-between flex-wrap gap-2 border-t border-white/10">
              <span>
                💡 <strong>{t('ಅಧಿಕೃತ ಭಾಷಾ ನೀತಿ:', 'Official Language Policy:')}</strong>{' '}
                {t(
                  'ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಅಧಿಕೃತ ಮಾರ್ಗಸೂಚಿಗಳ ಪ್ರಕಾರ ಈ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಕೇವಲ ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್ ಭಾಷೆಗಳನ್ನು ಮಾತ್ರ ಒದಗಿಸಲಾಗಿದೆ.',
                  'In accordance with Govt. of Karnataka guidelines, this portal exclusively supports English and Kannada languages.'
                )}
              </span>
              <span className="font-mono text-amber-300">English & ಕನ್ನಡ (Only)</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

