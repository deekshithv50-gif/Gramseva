import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  Volume2,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
  MessageSquare,
  Copy,
  Check,
  Save,
  Trash2,
  Clock,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { UserSession } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { playSmsNotificationChime } from '../utils/smsSound';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (session: UserSession) => void;
  initialMode?: 'citizen' | 'official_pdo';
}

interface SavedCredentials {
  phoneNumber: string;
  userId: string;
  password?: string;
  isPdoMode?: boolean;
  rememberMe: boolean;
}

const SAVED_CREDENTIALS_KEY = 'gp_saved_login_credentials';
const OTP_EXPIRATION_SECONDS = 60;

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'citizen',
}) => {
  const { t } = useLanguage();
  // Step-based flow: step 1 for mobile number entry, step 2 for OTP entry
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [phoneNumber, setPhoneNumber] = useState('9845012345');
  const [otpValue, setOtpValue] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('7829');
  const [otpBannerVisible, setOtpBannerVisible] = useState(false);
  const [otpCopied, setOtpCopied] = useState(false);
  const [otpTimeRemaining, setOtpTimeRemaining] = useState<number>(OTP_EXPIRATION_SECONDS);
  const [isOtpExpired, setIsOtpExpired] = useState<boolean>(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');
  const [userCaptchaInput, setUserCaptchaInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [isPdoMode, setIsPdoMode] = useState(initialMode === 'official_pdo');

  // Generate randomized alphanumeric CAPTCHA
  const generateNewCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setUserCaptchaInput('');
    setErrorMsg('');
  };

  // Countdown timer for OTP expiration
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (step === 'otp' && otpTimeRemaining > 0) {
      timer = setInterval(() => {
        setOtpTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsOtpExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, otpTimeRemaining]);

  // Load remembered credentials on modal open
  useEffect(() => {
    if (isOpen) {
      generateNewCaptcha();
      setStep('mobile');
      setErrorMsg('');
      setSuccessNotice('');
      setShowPassword(false);
      setOtpCopied(false);
      setOtpTimeRemaining(OTP_EXPIRATION_SECONDS);
      setIsOtpExpired(false);

      try {
        const stored = localStorage.getItem(SAVED_CREDENTIALS_KEY);
        if (stored) {
          const creds: SavedCredentials = JSON.parse(stored);
          if (creds.rememberMe) {
            setPhoneNumber(creds.phoneNumber || '9845012345');
            setUserId(creds.userId || '');
            if (creds.password) setPassword(creds.password);
            setRememberMe(true);
            setHasSavedCredentials(true);
            if (creds.isPdoMode !== undefined) {
              setIsPdoMode(creds.isPdoMode);
            } else {
              setIsPdoMode(initialMode === 'official_pdo');
            }
            return;
          }
        }
      } catch (e) {
        console.error('Error loading saved credentials', e);
      }

      // Default fallback
      setIsPdoMode(initialMode === 'official_pdo');
      if (initialMode === 'official_pdo') {
        setPhoneNumber('9448123450');
        setUserId('pdo_nandi_officer');
        setPassword('admin123');
      } else {
        setPhoneNumber('9845012345');
        setUserId('citizen_nandi_01');
        setPassword('cit@123');
      }
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Format seconds to mm:ss
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // STEP 1: Submit mobile number & proceed to Step 2
  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setErrorMsg(t('ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ', 'Please enter valid 10-digit mobile number'));
      return;
    }

    if (!userId.trim()) {
      setUserId(isPdoMode ? 'pdo_nandi_officer' : `citizen_${cleaned.slice(6)}`);
    }

    if (!password || password.length < 4) {
      setErrorMsg(t('ಗುಪ್ತಪದ ಕನಿಷ್ಠ 4 ಅಕ್ಷರಗಳಿರಬೇಕು', 'Password must be at least 4 characters'));
      return;
    }

    // Generate fresh 4-digit OTP
    const random4 = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(random4);
    setOtpValue('');
    setOtpTimeRemaining(OTP_EXPIRATION_SECONDS);
    setIsOtpExpired(false);
    setOtpBannerVisible(true);
    setStep('otp');
    setErrorMsg('');

    // Play mobile SMS chime sound
    playSmsNotificationChime();
  };

  // STEP 2: Resend OTP and reset timer
  const handleResendOtp = () => {
    const random4 = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(random4);
    setOtpValue('');
    setOtpTimeRemaining(OTP_EXPIRATION_SECONDS);
    setIsOtpExpired(false);
    setOtpBannerVisible(true);
    setErrorMsg('');
    playSmsNotificationChime();

    setSuccessNotice(
      t(
        `ಹೊಸ ಒಟಿಪಿ ಕಳುಹಿಸಲಾಗಿದೆ (+91 ${phoneNumber}). SMS ಸಂದೇಶ ಪರಿಶೀಲಿಸಿ.`,
        `New OTP sent to +91 ${phoneNumber}. Check the SMS notification banner.`
      )
    );
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  // Copy OTP code to clipboard
  const handleCopyOtp = () => {
    navigator.clipboard.writeText(generatedOtp);
    setOtpCopied(true);
    setTimeout(() => setOtpCopied(false), 2000);
  };

  // Clear saved credentials
  const handleClearSavedCredentials = () => {
    try {
      localStorage.removeItem(SAVED_CREDENTIALS_KEY);
      setHasSavedCredentials(false);
      setPassword('');
      setSuccessNotice(t('ಉಳಿಸಿದ ವಿವರಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ', 'Saved login details cleared successfully'));
      setTimeout(() => setSuccessNotice(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // STEP 2: Verify OTP, CAPTCHA, and complete login
  const handleVerifyAndCompleteLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (isOtpExpired || otpTimeRemaining === 0) {
      setErrorMsg(t('ಒಟಿಪಿ ಅವಧಿ ಮುಗಿದಿದೆ. ದಯವಿಟ್ಟು "ಮರುಕಳುಹಿಸಿ" ಕ್ಲಿಕ್ ಮಾಡಿ ಹೊಸ ಒಟಿಪಿ ಪಡೆಯಿರಿ.', 'OTP expired. Please click "Resend OTP" to generate a fresh code.'));
      return;
    }

    if (otpValue !== generatedOtp) {
      setErrorMsg(t('ತಪ್ಪಾದ ಒಟಿಪಿ. ದಯವಿಟ್ಟು SMS ನಲ್ಲಿ ಬಂದಿರುವ ಕೋಡ್ ಪರಿಶೀಲಿಸಿ', 'Incorrect OTP. Please check the code received in the SMS notification.'));
      return;
    }

    if (userCaptchaInput.toUpperCase() !== captchaCode.toUpperCase()) {
      setErrorMsg(t('ಕ್ಯಾಪ್ಚಾ ಕೋಡ್ ಹೊಂದಾಣಿಕೆಯಾಗುತ್ತಿಲ್ಲ', 'Incorrect CAPTCHA code. Please refresh and try again.'));
      generateNewCaptcha();
      return;
    }

    // Save or clear remembered credentials
    try {
      if (rememberMe) {
        const credsToSave: SavedCredentials = {
          phoneNumber,
          userId: userId.trim(),
          password,
          isPdoMode,
          rememberMe: true,
        };
        localStorage.setItem(SAVED_CREDENTIALS_KEY, JSON.stringify(credsToSave));
      } else {
        localStorage.removeItem(SAVED_CREDENTIALS_KEY);
      }
    } catch (err) {
      console.error('Failed to persist login details', err);
    }

    // Create session
    const newSession: UserSession = {
      phoneNumber,
      userId: userId.trim(),
      isLoggedIn: true,
      role: isPdoMode ? 'official_pdo' : 'citizen',
      displayName: isPdoMode ? 'Panchayat Development Officer (PDO)' : `Citizen (${userId})`,
      verifiedAt: new Date().toISOString(),
    };

    onSuccess(newSession);
    onClose();
  };

  // Pronounce CAPTCHA audio
  const handlePlayCaptchaAudio = () => {
    if ('speechSynthesis' in window) {
      const textToSpeak = captchaCode.split('').join(' ');
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative">
        
        {/* ========================================================================= */}
        {/* TOP MOBILE SMS NOTIFICATION MESSAGE BANNER (Triggered when OTP is sent)    */}
        {/* ========================================================================= */}
        {otpBannerVisible && (
          <div className="bg-slate-900 border-b-2 border-emerald-500 text-white p-3.5 shadow-xl animate-in slide-in-from-top-3 duration-300">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-400/30">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] font-bold tracking-wider text-emerald-300 uppercase">
                      💬 VK-KARDPR • SMS
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] text-slate-300">{t('ಈಗಷ್ಟೇ ತಲುಪಿದೆ', 'Just now')}</span>
                  </div>
                  <div className="text-[11px] text-slate-200 mt-0.5">
                    {t('ಮೊಬೈಲ್ ಸಂದೇಶಕ್ಕೆ ಒಟಿಪಿ ಬಂದಿದೆ:', 'Mobile SMS received:')}{' '}
                    <span className="text-white font-mono font-bold">+91 {phoneNumber}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOtpBannerVisible(false)}
                className="text-slate-400 hover:text-white text-xs p-1"
                title={t('ಮುಚ್ಚಿ', 'Dismiss')}
              >
                ✕
              </button>
            </div>

            {/* Message Body Box */}
            <div className="mt-2.5 p-2.5 bg-slate-800/90 rounded-xl border border-slate-700 text-xs text-slate-200 space-y-1.5 font-sans">
              <p className="leading-relaxed">
                <span className="text-amber-300 font-bold">Govt of Karnataka RDPR:</span>{' '}
                {t(
                  `ಜನಹಿತ ಪೋರ್ಟಲ್ ಲಾಗಿನ್ ಒಟಿಪಿ: `,
                  `Your Janahita Portal Login OTP is `
                )}
                <span className="px-2 py-0.5 bg-emerald-700 text-white font-mono font-black text-sm rounded shadow-xs">
                  {generatedOtp}
                </span>
                . {t('ಇದು 60 ಸೆಕೆಂಡು ಮಾನ್ಯವಾಗಿರುತ್ತದೆ. ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.', 'Valid for 60 seconds. Do not share OTP.')}
              </p>

              {/* Quick Actions inside SMS card */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-700/80 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setOtpValue(generatedOtp);
                  }}
                  className="text-emerald-300 hover:text-white font-bold inline-flex items-center gap-1 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('ಸ್ವಯಂ ಭರ್ತಿ ಮಾಡಿ (Auto-Fill)', 'Auto-Fill OTP')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyOtp}
                  className="text-slate-300 hover:text-white font-mono inline-flex items-center gap-1 transition cursor-pointer"
                >
                  {otpCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{otpCopied ? t('ನಕಲಿಸಲಾಗಿದೆ', 'Copied!') : t('ಒಟಿಪಿ ನಕಲಿಸಿ', 'Copy')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight font-kannada">
                {isPdoMode ? t('ಪಿ.ಡಿ.ಒ ಅಧಿಕಾರಿಗಳ ಪ್ರವೇಶ', 'PDO Official Portal') : t('ನಾಗರಿಕರ ಲಾಗಿನ್', 'Citizen Entry')}
              </h3>
              <p className="text-xs text-emerald-200">
                {t('ಕರ್ನಾಟಕ ಗ್ರಾಮ ಪಂಚಾಯತಿ ಸುರಕ್ಷಿತ ಪ್ರವೇಶ', 'Karnataka Gram Panchayat Secure Verification')}
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

        {/* STEP-BASED PROGRESS INDICATOR */}
        <div className="px-5 pt-3.5 pb-2 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />
            
            {/* Step 1 Pill */}
            <button
              type="button"
              onClick={() => {
                if (step === 'otp') setStep('mobile');
              }}
              className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                step === 'mobile'
                  ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-600/30'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                step === 'otp' ? 'bg-emerald-600 text-white' : 'bg-white/30 text-white'
              }`}>
                {step === 'otp' ? <Check className="w-2.5 h-2.5" /> : '1'}
              </span>
              <span className="font-kannada">{t('ಹಂತ ೧: ಮೊಬೈಲ್ ಸಂಖ್ಯೆ', 'Step 1: Mobile')}</span>
            </button>

            {/* Step 2 Pill */}
            <div
              className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                step === 'otp'
                  ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-600/30'
                  : 'bg-slate-200 text-slate-500 border border-slate-300'
              }`}
            >
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-black/10">
                2
              </span>
              <span className="font-kannada">{t('ಹಂತ ೨: ಒಟಿಪಿ ನಮೂದು', 'Step 2: OTP Entry')}</span>
            </div>
          </div>
        </div>

        {/* Portal Role Switcher (Available on Step 1) */}
        {step === 'mobile' && (
          <div className="px-5 pt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setIsPdoMode(false);
                setErrorMsg('');
                if (!hasSavedCredentials) {
                  setPhoneNumber('9845012345');
                  setUserId('citizen_nandi_01');
                  setPassword('cit@123');
                }
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                !isPdoMode
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t('ನಾಗರಿಕ', 'Citizen')}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPdoMode(true);
                setErrorMsg('');
                if (!hasSavedCredentials) {
                  setPhoneNumber('9448123450');
                  setUserId('pdo_nandi_officer');
                  setPassword('admin123');
                }
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                isPdoMode
                  ? 'bg-slate-900 border-slate-900 text-white shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t('ಪಿ.ಡಿ.ಒ ಕಚೇರಿ', 'GP Officer Desk')}
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-5">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successNotice && (
            <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: MOBILE NUMBER ENTRY & SAVED CREDENTIALS                           */}
          {/* ========================================================================= */}
          {step === 'mobile' && (
            <form onSubmit={handleProceedToOtp} className="space-y-3.5 text-xs">
              {/* Mobile Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 font-kannada">
                  {t('ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ (ಹಂತ ೧) *', 'Enter Mobile Phone Number (Step 1) *')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-semibold text-xs">
                    +91
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="98XXXXXXXX"
                    className="w-full pl-12 pr-4 py-2.5 border border-slate-300 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                    autoFocus
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>{t('ಹಂತ ೨ ರಲ್ಲಿ ೬೦ ಸೆಕೆಂಡು ಮಾನ್ಯತೆಯ ಒಟಿಪಿ ಪರಿಶೀಲಿಸಲಾಗುವುದು.', 'In Step 2, you will enter the OTP.')}</span>
                  {hasSavedCredentials && (
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <Save className="w-3 h-3" /> {t('ವಿವರ ಉಳಿಸಲಾಗಿದೆ', 'Saved')}
                    </span>
                  )}
                </div>
              </div>

              {/* User ID */}
              <div>
                <label className="block text-slate-700 font-bold mb-1 font-kannada">
                  {t('ಬಳಕೆದಾರರ ಐಡಿ *', 'User ID *')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder={t('ನಿಮ್ಮ ಬಳಕೆದಾರರ ಐಡಿ ನಮೂದಿಸಿ', 'Enter your User ID')}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Password with Eye Visibility Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-bold font-kannada">
                    {t('ಪಾಸ್‌ವರ್ಡ್ *', 'Password *')}
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {showPassword ? t('ಪಾಸ್‌ವರ್ಡ್ ಗೋಚರವಾಗಿದೆ', 'Visible') : t('ಪಾಸ್‌ವರ್ಡ್ ಮರೆಯಾಗಿದೆ', 'Hidden')}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  
                  {/* Eye shape icon toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-2 p-1 text-slate-400 hover:text-slate-700 focus:outline-none cursor-pointer rounded"
                    title={showPassword ? t('ಪಾಸ್‌ವರ್ಡ್ ಮರೆಮಾಡಿ', 'Hide Password') : t('ಪಾಸ್‌ವರ್ಡ್ ತೋರಿಸಿ', 'Show Password')}
                    aria-label={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Login Details Checkbox */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-700 font-kannada">
                    {t('ಲಾಗಿನ್ ವಿವರಗಳನ್ನು ನೆನಪಿಡಿ (Save login details)', 'Remember login details')}
                  </span>
                </label>
                <Save className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Step 1 Submit Button */}
              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-sm mt-2"
              >
                <span>{t('ಹಂತ ೨ ಕ್ಕೆ ಮುಂದುವರಿಯಿರಿ: ಒಟಿಪಿ ಪಡೆಯಿರಿ', 'Proceed to Step 2: Get OTP')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Saved credentials clear link if present */}
              {hasSavedCredentials && (
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={handleClearSavedCredentials}
                    className="text-[11px] text-slate-400 hover:text-rose-600 inline-flex items-center gap-1 cursor-pointer transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{t('ಉಳಿಸಿದ ವಿವರಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ', 'Clear Saved Login Details')}</span>
                  </button>
                </div>
              )}
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: OTP ENTRY WITH SIMULATED TIMER & RESEND BUTTON                    */}
          {/* ========================================================================= */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyAndCompleteLogin} className="space-y-4">
              {/* Target Phone Summary & Edit Option */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">
                      {t('ಒಟಿಪಿ ಕಳುಹಿಸಲಾದ ಸಂಖ್ಯೆ', 'OTP Sent To')}
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-xs">
                      +91 {phoneNumber}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('mobile');
                    setOtpBannerVisible(false);
                    setErrorMsg('');
                  }}
                  className="text-xs text-emerald-800 hover:text-emerald-950 font-bold inline-flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>{t('ಸಂಖ್ಯೆ ಬದಲಾಯಿಸಿ', 'Edit')}</span>
                </button>
              </div>

              {/* OTP Input Field */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-800 font-kannada">
                    {t('೪-ಅಂಕಿಯ ಒಟಿಪಿ ನಮೂದಿಸಿ (ಹಂತ ೨) *', 'Enter 4-Digit OTP (Step 2) *')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setOtpValue(generatedOtp)}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{t('ಸ್ವಯಂ ಭರ್ತಿ', 'Auto-fill')}</span>
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={4}
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                  placeholder="0000"
                  className="w-full text-center tracking-widest font-mono text-2xl py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  required
                  autoFocus
                />
              </div>

              {/* SIMULATED TIMER & RESEND OTP SECTION */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  {/* Timer Display */}
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className={`w-4 h-4 ${isOtpExpired ? 'text-rose-600' : 'text-emerald-700'}`} />
                    {isOtpExpired ? (
                      <span className="text-rose-700 font-bold">
                        {t('ಒಟಿಪಿ ಅವಧಿ ಮುಗಿದಿದೆ (Expired)', 'OTP Expired')}
                      </span>
                    ) : (
                      <span className="text-slate-700">
                        {t('ಅವಧಿ ಮುಕ್ತಾಯ:', 'Expires in:')}{' '}
                        <span className={`font-mono font-bold ${otpTimeRemaining <= 15 ? 'text-amber-600 animate-pulse' : 'text-emerald-800'}`}>
                          {formatTimer(otpTimeRemaining)}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Resend Button with Timer Simulation */}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                      isOtpExpired
                        ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 shadow-xs animate-bounce'
                        : otpTimeRemaining <= 45
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    }`}
                    disabled={otpTimeRemaining > 45}
                    title={
                      otpTimeRemaining > 45
                        ? t(`${otpTimeRemaining - 45} ಸೆಕೆಂಡುಗಳ ನಂತರ ಮರುಕಳುಹಿಸಬಹುದು`, `Can resend in ${otpTimeRemaining - 45}s`)
                        : t('ಹೊಸ ಒಟಿಪಿ ಮರುಕಳುಹಿಸಿ', 'Resend New OTP')
                    }
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>
                      {isOtpExpired
                        ? t('ಒಟಿಪಿ ಮರುಕಳುಹಿಸಿ', 'Resend OTP Now')
                        : otpTimeRemaining > 45
                        ? `${t('ಮರುಕಳುಹಿಸಿ', 'Resend')} (${otpTimeRemaining - 45}s)`
                        : t('ಒಟಿಪಿ ಮರುಕಳುಹಿಸಿ', 'Resend OTP')}
                    </span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 leading-tight">
                  {isOtpExpired
                    ? t('ದಯವಿಟ್ಟು "ಒಟಿಪಿ ಮರುಕಳುಹಿಸಿ" ಬಟನ್ ಒತ್ತಿ ಹೊಸ ಕೋಡ್ ಪಡೆದುಕೊಳ್ಳಿ.', 'Please click "Resend OTP Now" to receive a fresh verification code.')
                    : t('SMS ಸಂದೇಶ ಬಂದಿಲ್ಲದಿದ್ದರೆ ಅಥವಾ ಅವಧಿ ಮೀರಿದರೆ ಮರುಕಳುಹಿಸಬಹುದು.', 'If you did not receive the SMS code or it expires, click Resend.')}
                </p>
              </div>

              {/* Security CAPTCHA Challenge */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-800 font-bold font-kannada">
                    {t('ಭದ್ರತಾ ಕ್ಯಾಪ್ಚಾ *', 'Security CAPTCHA *')}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePlayCaptchaAudio}
                      title={t('ಕ್ಯಾಪ್ಚಾ ಆಡಿಯೋ', 'Audio CAPTCHA')}
                      className="p-1 rounded hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={generateNewCaptcha}
                      title={t('ಕ್ಯಾಪ್ಚಾ ಬದಲಾಯಿಸಿ', 'Refresh CAPTCHA')}
                      className="p-1 rounded hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2 rounded-lg font-mono font-black text-amber-300 text-lg tracking-widest select-none shadow-inner border border-slate-700 italic">
                    {captchaCode}
                  </div>

                  <input
                    type="text"
                    maxLength={5}
                    value={userCaptchaInput}
                    onChange={(e) => setUserCaptchaInput(e.target.value.toUpperCase())}
                    placeholder="CAPTCHA"
                    className="flex-1 uppercase font-mono tracking-widest px-3 py-2 border border-slate-300 rounded-lg font-bold text-center text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
              </div>

              {/* Step 2 Action Buttons: Back and Verify */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep('mobile');
                    setOtpBannerVisible(false);
                  }}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('ಹಿಂದೆ (Step 1)', 'Back')}</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{t('ಒಟಿಪಿ ದೃಢೀಕರಿಸಿ & ಲಾಗಿನ್ ಆಗಿ', 'Verify OTP & Sign In')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

