import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Trash2,
  Milestone,
  Zap,
  Users,
  Wheat,
  Home,
  Briefcase,
  Accessibility,
  HeartHandshake,
  UserCheck,
  HelpCircle,
  Paperclip,
  UploadCloud,
  FileText,
  X,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  MapPin,
  Lock,
  Camera,
  FilePlus,
  Image as ImageIcon,
  FileCheck2,
  Info,
} from 'lucide-react';
import {
  ComplaintCategory,
  AttachedDocument,
  Complaint,
  GramPanchayatInfo,
  UserSession,
} from '../types';
import { COMPLAINT_CATEGORIES } from '../data/panchayatData';
import { useLanguage } from '../context/LanguageContext';

interface ComplaintFormProps {
  panchayat: GramPanchayatInfo;
  user: UserSession | null;
  onRequireAuth: () => void;
  onSubmitComplaint: (complaint: Complaint) => void;
}

// Map icons cleanly
const CATEGORY_ICONS: Record<ComplaintCategory, React.ElementType> = {
  water_requirements: Droplets,
  garbage_waste_management: Trash2,
  road_development: Milestone,
  electricity_problems: Zap,
  social_problems: Users,
  farmers_loan_delay: Wheat,
  property_family_dispute: Home,
  unemployment_mgnrega: Briefcase,
  scholarship_handicapped: Accessibility,
  womens_welfare: HeartHandshake,
  single_parent_support: UserCheck,
  other_grievance: HelpCircle,
};

export const ComplaintForm: React.FC<ComplaintFormProps> = ({
  panchayat,
  user,
  onRequireAuth,
  onSubmitComplaint,
}) => {
  const { t, isKannada, isEnglish } = useLanguage();
  const [selectedCategory, setSelectedCategory] =
    useState<ComplaintCategory>('water_requirements');
  const [selectedVillage, setSelectedVillage] = useState(
    panchayat.villages[0]?.nameEn || 'Nandi Village (Main)'
  );
  const [specificLocality, setSpecificLocality] = useState('');
  const [wardNumber, setWardNumber] = useState('01');
  const [title, setTitle] = useState('');
  // 1000 letters limit as requested:
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [documents, setDocuments] = useState<AttachedDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [acceptedSubmitNote, setAcceptedSubmitNote] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<Complaint | null>(null);
  const [formError, setFormError] = useState('');

  // Keep selected village in sync when Gram Panchayat changes
  useEffect(() => {
    if (panchayat.villages && panchayat.villages.length > 0) {
      const exists = panchayat.villages.some((v) => v.nameEn === selectedVillage);
      if (!exists) {
        setSelectedVillage(panchayat.villages[0].nameEn);
      }
    }
  }, [panchayat, selectedVillage]);

  const activeCategoryMeta = COMPLAINT_CATEGORIES.find(
    (c) => c.id === selectedCategory
  )!;

  // File processing helper
  const processFiles = (files: File[]) => {
    if (!files || files.length === 0) return;

    const newDocs: AttachedDocument[] = [];
    let hasSizeError = false;

    Array.from(files).forEach((file: File) => {
      // Check file size (< 10MB)
      if (file.size > 10 * 1024 * 1024) {
        hasSizeError = true;
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        newDocs.push({
          id: `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          dataUrl: reader.result as string,
          uploadedAt: new Date().toLocaleString(),
        });
        if (newDocs.length === files.length) {
          setDocuments((prev) => [...prev, ...newDocs]);
          setFormError('');
        }
      };
      reader.readAsDataURL(file);
    });

    if (hasSizeError) {
      setFormError(t('ಕೆಲವು ಫೈಲ್‌ಗಳು 10MB ಗಾತ್ರ ಮೀರಿವೆ (ಗರಿಷ್ಠ 10MB).', 'Some files exceeded the 10MB limit.'));
    }
  };

  // File upload input handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Helper to generate a verified e-petition memo document if user needs an official written statement
  const handleGenerateApplicationMemo = () => {
    const currentTitle = title.trim() || t('ಗ್ರಾಮ ಪಂಚಾಯತಿ ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆ ಅರ್ಜಿ', 'Public Grievance Petition Memo');
    const currentDesc = description.trim() || t('ಗ್ರಾಮ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ತುರ್ತು ಪರಿಹಾರ ಕೋರಿಕೆ', 'Request for urgent Gram Panchayat resolution');
    const timeStamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const memoText = `ಕರ್ನಾಟಕ ಸರ್ಕಾರ | ಗ್ರಾಮೀಣಾಭಿವೃದ್ಧಿ ಮತ್ತು ಪಂಚಾಯತ್ ರಾಜ್ ಇಲಾಖೆ
ನಂದಿ ಗ್ರಾಮ ಪಂಚಾಯತಿ - ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆ ಅಧಿಕೃತ ಅರ್ಜಿ ಪತ್ರ
============================================================
ದೂರು ವಿಷಯ / Title: ${currentTitle}
ಗ್ರಾಮ / Village: ${selectedVillage} (ವಾರ್ಡ್: ${wardNumber})
ಸ್ಥಳ ಗುರುತು / Landmark: ${specificLocality || 'ಗ್ರಾಮ ಕೇಂದ್ರ'}
ದೂರುದಾರರ ಗೌಪ್ಯ ಟೋಕನ್: CIT-TOKEN-${Math.floor(100000 + Math.random() * 900000)}
ಇಲಾಖೆ / Department: ${activeCategoryMeta.department}
ದಿನಾಂಕ / Date: ${timeStamp}

ದೂರಿನ ಸಾರಾಂಶ / Grievance Statement:
${currentDesc}

ಪರಿಶೀಲನೆ: ದೂರುದಾರರು ಸಲ್ಲಿಸಿದ ಈ ಅರ್ಜಿ ಪತ್ರವು ಅಧಿಕೃತ ದಾಖಲೆಯಾಗಿದ್ದು ಗ್ರಾಮ ಪಂಚಾಯತಿ Redressal Cell ಪರಿಶೀಲನೆಗೆ ಲಗತ್ತಿಸಲಾಗಿದೆ.
============================================================`;

    const blob = new Blob([memoText], { type: 'text/plain;charset=utf-8' });
    const reader = new FileReader();
    reader.onload = () => {
      const generatedDoc: AttachedDocument = {
        id: `doc_${Date.now()}_petition_memo`,
        name: `Gram_Panchayat_Petition_Memo_${Date.now().toString().slice(-4)}.txt`,
        size: blob.size,
        type: 'text/plain',
        dataUrl: reader.result as string,
        uploadedAt: new Date().toLocaleString(),
      };
      setDocuments((prev) => [...prev, generatedDoc]);
      setFormError('');
    };
    reader.readAsDataURL(blob);
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      onRequireAuth();
      return;
    }

    if (!title.trim()) {
      setFormError(t('ದಯವಿಟ್ಟು ದೂರಿನ ಶೀರ್ಷಿಕೆ ನಮೂದಿಸಿ.', 'Please enter complaint subject or title.'));
      return;
    }

    if (!description.trim() || description.trim().length < 15) {
      setFormError(t('ದಯವಿಟ್ಟು ಸಮಸ್ಯೆಯ ವಿವರವನ್ನು ಕನಿಷ್ಠ 15 ಅಕ್ಷರಗಳಲ್ಲಿ ಬರೆಯಿರಿ.', 'Please provide detailed description with at least 15 characters.'));
      return;
    }

    if (description.length > 1000) {
      setFormError(t('ವಿವರಣೆ 1000 ಅಕ್ಷರಗಳನ್ನು ಮೀರಬಾರದು.', 'Description cannot exceed 1000 letters.'));
      return;
    }

    // MANDATORY DOCUMENT REQUIREMENT ENFORCEMENT
    if (documents.length === 0) {
      setFormError(
        t(
          'ದೂರು ದಾಖಲಿಸಲು ಕನಿಷ್ಠ ಒಂದು ಪೂರಕ ದಾಖಲೆ ಅಥವಾ ಫೋಟೋ ಲಗತ್ತಿಸುವುದು ಕಡ್ಡಾಯವಾಗಿದೆ. ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಸ್ಥಳದಲ್ಲಿ ಫೈಲ್ ಲಗತ್ತಿಸಿ.',
          'Attaching at least one supporting document or photo is mandatory to lodge a complaint. Please add a document below.'
        )
      );
      const docSection = document.getElementById('complaint-document-upload-section');
      if (docSection) {
        docSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (!acceptedSubmitNote) {
      setFormError(t('ದಯವಿಟ್ಟು ಸಲ್ಲಿಕೆ ಟಿಪ್ಪಣಿ (Submit Note) ಅಂಗೀಕರಿಸಿ.', 'Please accept the declaration Note.'));
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    // Generate masked citizen ID to guarantee whistleblower privacy
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const citizenMaskedId = `CIT-ANON-***-${randomSuffix}`;

    const catShort = selectedCategory.slice(0, 3).toUpperCase();
    const newComplaintId = `GP-KA-2026-${catShort}-${Math.floor(100 + Math.random() * 900)}`;

    const newComplaint: Complaint = {
      id: newComplaintId,
      category: selectedCategory,
      title: title.trim(),
      description: description.trim(),
      village: selectedVillage,
      specificLocality: specificLocality.trim() || `${selectedVillage} Main`,
      wardNumber,
      citizenMaskedId,
      hasAcceptedSubmitNote: true,
      privateCitizenPhone: user.phoneNumber,
      privateCitizenUserId: user.userId,
      location: {
        district: panchayat.districtEn,
        taluk: panchayat.talukEn,
        gramPanchayat: panchayat.nameEn,
        village: selectedVillage,
        geoPermitted: true,
      },
      documents,
      status: 'submitted',
      submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      updatedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      priority,
    };

    setTimeout(() => {
      onSubmitComplaint(newComplaint);
      setSubmitSuccess(newComplaint);
      setIsSubmitting(false);

      // Reset fields
      setTitle('');
      setDescription('');
      setSpecificLocality('');
      setDocuments([]);
      setAcceptedSubmitNote(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Submission Success Dialog */}
      {submitSuccess && (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-6 shadow-lg animate-in zoom-in-95">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-600 text-white rounded-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-emerald-950 font-kannada">
                  {t('ದೂರು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ!', 'Complaint Lodged Successfully!')}
                </h3>
                <span className="font-mono font-bold bg-white text-emerald-900 border border-emerald-300 px-3 py-1 rounded-lg text-sm shadow-2xs">
                  ID: {submitSuccess.id}
                </span>
              </div>
              <p className="text-xs text-emerald-900">
                {t(
                  'ನಿಮ್ಮ ದೂರನ್ನು ಗ್ರಾಮ ಪಂಚಾಯತಿ ಅಧಿಕಾರಿಗಳಿಗೆ (PDO & Grievance Cell) ಗೌಪ್ಯವಾಗಿ ರವಾನಿಸಲಾಗಿದೆ. ದೂರುದಾರರ ಗೌಪ್ಯತೆ 100% ಸುರಕ್ಷಿತವಾಗಿದೆ.',
                  'Your grievance has been safely transmitted to the Panchayat desk with 100% whistleblower anonymity.'
                )}
              </p>
              <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500">{t('ಗೌಪ್ಯ ಟೋಕನ್ ಐಡಿ:', 'Anonymous Token:')}</span>{' '}
                  <span className="font-mono font-bold text-emerald-800">{submitSuccess.citizenMaskedId}</span>
                </div>
                <div>
                  <span className="text-slate-500">{t('ಗ್ರಾಮ:', 'Village:')}</span>{' '}
                  <span className="font-bold text-slate-800">{submitSuccess.village}</span>
                </div>
                <div>
                  <span className="text-slate-500">{t('ಇಲಾಖೆ:', 'Department:')}</span>{' '}
                  <span className="font-bold text-slate-800">{activeCategoryMeta.department}</span>
                </div>
                <div>
                  <span className="text-slate-500">{t('ನಿರೀಕ್ಷಿತ ಪರಿಹಾರ ಕಾಲ:', 'Resolution SLA:')}</span>{' '}
                  <span className="font-bold text-amber-700">
                    {activeCategoryMeta.slaDays} {t('ಕೆಲಸದ ದಿನಗಳು', 'Working Days')}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSubmitSuccess(null)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  {t('ಮತ್ತೊಂದು ದೂರು ದಾಖಲಿಸಿ', 'Lodge Another Complaint')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Complaint Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 text-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-semibold mb-2 border border-emerald-400/40">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('೧೦೦% ಗೌಪ್ಯತೆ ಮತ್ತು ರಕ್ಷಣೆ', '100% Whistleblower & Citizen Privacy Protected')}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight font-kannada">
                {t('ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆ ದೂರು ಅರ್ಜಿ', 'Public Grievance Redressal Form')}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-2xl">
                {t(
                  'ನೀರು, ಕಸ ವಿಲೇವಾರಿ, ರಸ್ತೆ, ವಿದ್ಯುತ್, ರೈತರ ಸಾಲ, ಕುಟುಂಬ ಆಸ್ತಿ ವಿವಾದ, ನರೇಗಾ ನಿರುದ್ಯೋಗ, ವಿದ್ಯಾರ್ಥಿವೇತನ ಮತ್ತು ಮಹಿಳಾ ಕಲ್ಯಾಣ ಕುರಿತ ದೂರುಗಳನ್ನು ನೇರವಾಗಿ ಗ್ರಾಮ ಪಂಚಾಯತಿಗೆ ಸಲ್ಲಿಸಿ.',
                  'Submit complaints regarding water, waste, roads, electricity, farmer loans, family property disputes, MGNREGA unemployment, scholarships, and women welfare directly to the Gram Panchayat.'
                )}
              </p>
            </div>

            {/* Helpline quick reminder */}
            <div className="bg-white/10 backdrop-blur border border-white/20 p-3 rounded-xl text-right">
              <div className="text-[11px] text-amber-300 font-medium">
                {t('ಪಂಚಾಯತಿ ಸಹಾಯವಾಣಿ', 'Panchayat Helpline')}
              </div>
              <div className="text-sm sm:text-base font-mono font-black text-white">
                {panchayat.helplineNumber}
              </div>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6">
          {formError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{formError}</span>
            </div>
          )}

          {/* User Sign In Alert if not logged in */}
          {!user && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-amber-950 font-kannada">
                    {t(
                      'ದೂರು ಸಲ್ಲಿಸಲು ಫೋನ್ ನಂಬರ್ ಮತ್ತು ಒಟಿಪಿ ಪರಿಶೀಲನೆ ಕಡ್ಡಾಯ',
                      'Mobile Number & OTP Verification Required to File Grievance'
                    )}
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    {t(
                      'ದೂರು ಸಲ್ಲಿಸಲು ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ಒಟಿಪಿ ಮೂಲಕ ಪರಿಶೀಲಿಸಿ. ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ವಿವರಗಳು ಪಂಚಾಯತಿ ಸದಸ್ಯರಿಗೆ ಅನಾಮಧೇಯವಾಗಿರುತ್ತವೆ.',
                      'Enter your phone number & verify OTP with User ID to lodge complaints. Your personal identity remains anonymous to GP members.'
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onRequireAuth}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shrink-0 transition cursor-pointer shadow-xs"
              >
                {t('ಲಾಗಿನ್ / ಪರಿಶೀಲನೆ', 'Sign In with Mobile')}
              </button>
            </div>
          )}

          {/* 1. Category Selection */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-kannada flex items-center gap-1.5">
                <span>{t('೧. ದೂರಿನ ವರ್ಗವನ್ನು ಆರಿಸಿ *', '1. Select Complaint Category *')}</span>
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                ({COMPLAINT_CATEGORIES.length} {t('ವರ್ಗಗಳು', 'Categories')})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {COMPLAINT_CATEGORIES.map((cat) => {
                const IconComponent = CATEGORY_ICONS[cat.id] || HelpCircle;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-600/30 text-emerald-950 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected
                            ? 'bg-emerald-700 text-white'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold font-kannada leading-snug line-clamp-1">
                        {isKannada ? cat.nameKn : cat.nameEn}
                      </div>
                      <div className="text-[11px] font-medium text-slate-600 leading-tight mt-0.5 line-clamp-1">
                        {isKannada ? cat.nameEn : cat.nameKn}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Category SLA & Department Banner */}
            <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-700">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">{t('ಸಂಬಂಧಿತ ಇಲಾಖೆ:', 'Department:')}</span>
                <span className="text-emerald-800 font-medium">{activeCategoryMeta.department}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="text-slate-500">{t('ಪರಿಹಾರ ಅವಧಿ:', 'Resolution SLA:')}</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {activeCategoryMeta.slaDays} {t('ಕೆಲಸದ ದಿನಗಳು', 'Working Days')}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Village & Location Details (<10 Constituent Villages) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 font-kannada">
                {t('ಗ್ರಾಮದ ಹೆಸರು *', 'Village Name *')}
              </label>
              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                className="w-full bg-white border border-slate-300 px-3 py-2.5 rounded-xl font-medium text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {panchayat.villages.map((v) => (
                  <option key={v.id} value={v.nameEn}>
                    {isKannada ? v.nameKn : v.nameEn} ({isKannada ? v.nameEn : v.nameKn})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {panchayat.nameEn} {t('ವ್ಯಾಪ್ತಿಯ ಗ್ರಾಮ', 'Constituent village')}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 font-kannada">
                {t('ವಾರ್ಡ್ ಸಂಖ್ಯೆ', 'Ward Number')}
              </label>
              <select
                value={wardNumber}
                onChange={(e) => setWardNumber(e.target.value)}
                className="w-full bg-white border border-slate-300 px-3 py-2.5 rounded-xl font-medium text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="01">Ward No. 01</option>
                <option value="02">Ward No. 02</option>
                <option value="03">Ward No. 03</option>
                <option value="04">Ward No. 04</option>
                <option value="05">Ward No. 05</option>
                <option value="06">Ward No. 06</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 font-kannada">
                {t('ನಿರ್ದಿಷ್ಟ ಸ್ಥಳ / ಗುರುತು *', 'Locality Landmark *')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={specificLocality}
                  onChange={(e) => setSpecificLocality(e.target.value)}
                  placeholder={t('ಉದಾ: ಹಳೆಯ ದೇವಸ್ಥಾನದ ಹತ್ತಿರ, ನೀರಿನ ಟ್ಯಾಂಕ್ ಬಳಿ', 'e.g. Near Old Temple / Water Tank / Survey 42')}
                  className="w-full pl-8 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* 3. Title & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-800 mb-1.5 font-kannada">
                {t('ದೂರಿನ ಮುಖ್ಯಾಂಶ / ಶೀರ್ಷಿಕೆ *', 'Complaint Title / Subject *')}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('ಉದಾ: ಕುಡಿಯುವ ನೀರಿನ ಪೈಪ್ ಒಡೆದಿದೆ, ರೈತರ ಸಾಲ ಸಬ್ಸಿಡಿ ವಿಳಂಬವಾಗಿದೆ', 'e.g. Urgent drinking water pipe burst, agricultural loan subsidy delayed')}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 font-kannada">
                {t('ಆದ್ಯತೆ', 'Priority')}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-white border border-slate-300 px-3 py-2.5 rounded-xl font-medium text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="normal">{t('ಸಾಮಾನ್ಯ', 'Normal')}</option>
                <option value="high">{t('ಹೆಚ್ಚಿನ ಆದ್ಯತೆ', 'High Priority')}</option>
                <option value="urgent">{t('ತುರ್ತು ಪರಿಸ್ಥಿತಿ', 'Urgent Emergency')}</option>
              </select>
            </div>
          </div>

          {/* 4. EXACT 1000 CHARACTERS CAPACITY GRIEVANCE TEXTAREA */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 font-kannada flex items-center gap-1.5">
                <span>{t('ದೂರಿನ ಸಂಪೂರ್ಣ ವಿವರ *', 'Detailed Grievance Description *')}</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  ({t('ಗರಿಷ್ಠ 1000 ಅಕ್ಷರಗಳು', 'Up to 1000 letters')})
                </span>
              </label>
              {/* Live Character Counter */}
              <div className="flex items-center gap-2">
                <div
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                    description.length > 900
                      ? 'bg-rose-100 text-rose-700'
                      : description.length > 700
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {description.length} / 1000 {t('ಅಕ್ಷರಗಳು', 'letters')}
                </div>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={description}
                maxLength={1000}
                rows={5}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t(
                  'ಸಮಸ್ಯೆಯ ಬಗ್ಗೆ ವಿವರವಾಗಿ ಬರೆಯಿರಿ (ನೀರಿನ ಸಮಸ್ಯೆ, ರಸ್ತೆ ಗುಂಡಿ, ಕಸ, ವಿದ್ಯುತ್, ರೈತರ ಸಾಲ ಅಥವಾ ಕುಟುಂಬ ಆಸ್ತಿ ವಿವಾದ ಇತ್ಯಾದಿ). ಗರಿಷ್ಠ 1000 ಅಕ್ಷರಗಳವರೆಗೆ ಬರೆಯಬಹುದು...',
                  'Provide all facts, dates, location landmarks, affected families, or assistance needed up to 1000 letters...'
                )}
                className="w-full p-3.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 leading-relaxed font-sans"
                required
              />

              {/* Character limit visual indicator line */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full transition-all duration-300 ${
                    description.length > 900
                      ? 'bg-rose-600'
                      : description.length > 700
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, (description.length / 1000) * 100)}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {t(
                'ನಿರ್ದಿಷ್ಟ ದಿನಾಂಕ, ಸಮಸ್ಯೆ ಆರಂಭವಾದ ಸಮಯ, ಗ್ರಾಮಸ್ಥರ ಮೇಲಾದ ಪರಿಣಾಮ ಇತ್ಯಾದಿ ವಿವರಗಳನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ನಮೂದಿಸಿ.',
                'Provide specific details: dates when problem began, exact location, impact on school children or farming, etc.'
              )}
            </p>
          </div>

          {/* 5. Document & Photo Attachment Section (STRICTLY MANDATORY) */}
          <div
            id="complaint-document-upload-section"
            className={`border-2 rounded-2xl p-4 sm:p-6 transition-all duration-200 space-y-4 ${
              documents.length === 0
                ? 'border-amber-300 bg-amber-50/40 shadow-xs'
                : 'border-emerald-200 bg-emerald-50/30'
            }`}
          >
            {/* Header with Title and Mandatory Status Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
              <div>
                <label className="text-xs sm:text-sm font-bold text-slate-900 font-kannada flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-emerald-700" />
                  <span>{t('ಪೂರಕ ದಾಖಲೆಗಳು ಅಥವಾ ಫೋಟೋ ಲಗತ್ತಿಸಿ (ಕಡ್ಡಾಯ) *', 'Attach Supporting Documents or Photo Evidence (Mandatory) *')}</span>
                </label>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {t(
                    'ದೂರಿನ ತ್ವರಿತ ಪರಿಶೀಲನೆಗೆ ಸ್ಥಳದ ಫೋಟೋ, ಲಿಖಿತ ಅರ್ಜಿ ಪತ್ರ, ರಶೀದಿ, ಬಿಲ್ ಅಥವಾ ಪಹಣಿ (RTC) ಲಗತ್ತಿಸುವುದು ಕಡ್ಡಾಯವಾಗಿದೆ.',
                    'Mandatory: Attach at least one photo of the site, written grievance letter, bill/receipt, or official certificate.'
                  )}
                </p>
              </div>

              {/* Status Badge */}
              <div>
                {documents.length === 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>{t('ಕಡ್ಡಾಯ: ೧ ದಾಖಲೆ ಅಗತ್ಯ', 'Mandatory: 1 Document Required')}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>{documents.length} {t('ದಾಖಲೆ ಲಗತ್ತಿಸಲಾಗಿದೆ', 'Document(s) Attached')}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Generous Drag-and-Drop Dropzone and Upload Actions Space */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all duration-200 ${
                isDragging
                  ? 'border-emerald-600 bg-emerald-100/70 scale-[1.01]'
                  : documents.length === 0
                  ? 'border-amber-400/90 bg-white/90 hover:border-emerald-500 hover:bg-emerald-50/20'
                  : 'border-emerald-300 bg-white/90 hover:border-emerald-500'
              }`}
            >
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-2xs">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-slate-800 font-kannada">
                    {t('ಫೈಲ್‌ಗಳನ್ನು ಇಲ್ಲಿಗೆ ಎಳೆದು ಬಿಡಿ ಅಥವಾ ಆಯ್ಕೆಮಾಡಿ', 'Drag & drop files here, or choose from device')}
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {t(
                      'ಫೋಟೋಗಳು (JPG, PNG, WEBP), ದಾಖಲೆಗಳು (PDF, DOC) - ಗರಿಷ್ಠ 10MB',
                      'Supports Photos (JPG, PNG, WEBP), Documents (PDF, DOCX) up to 10MB'
                    )}
                  </p>
                </div>

                {/* Main Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                  {/* File selector input */}
                  <label className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs">
                    <UploadCloud className="w-4 h-4" />
                    <span>{t('ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ', 'Choose File(s)')}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Direct Camera Capture button */}
                  <label className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>{t('ಕ್ಯಾಮೆರಾ / ಫೋಟೋ', 'Take Photo')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Instant Official Written Petition Memo Generator */}
                  <button
                    type="button"
                    onClick={handleGenerateApplicationMemo}
                    className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs"
                    title={t('ಲಿಖಿತ ಅರ್ಜಿ ಪತ್ರವನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸಿದ್ಧಪಡಿಸಿ ಲಗತ್ತಿಸಿ', 'Automatically generate and attach an official written grievance petition memo')}
                  >
                    <FilePlus className="w-4 h-4 text-amber-700" />
                    <span>{t('ಅರ್ಜಿ ಪತ್ರ ರಚಿಸಿ', 'Attach Petition Memo')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Uploaded Documents List */}
            {documents.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-700 font-bold px-1">
                  <span className="flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-700" />
                    <span>{t('ಲಗತ್ತಿಸಲಾದ ದಾಖಲೆಗಳ ಪಟ್ಟಿ:', 'Attached Supporting Documents:')}</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {documents.length} {t('ದಾಖಲೆ ಸಿದ್ಧವಾಗಿದೆ', 'document(s) ready')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-emerald-300 bg-white shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        {doc.type.startsWith('image/') && doc.dataUrl ? (
                          <img
                            src={doc.dataUrl}
                            alt="preview"
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-emerald-700" />
                          </div>
                        )}
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-800 truncate" title={doc.name}>
                            {doc.name}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span>{(doc.size / 1024).toFixed(1)} KB</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold">{t('ಲಗತ್ತಿಸಲಾಗಿದೆ', 'Attached')}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer shrink-0"
                        title={t('ತೆಗೆದುಹಾಕಿ', 'Remove')}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 6. SUBMIT NOTE & ANONYMITY DECLARATION */}
          <div className="bg-amber-50/80 border border-amber-300/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-950 font-kannada uppercase tracking-wide">
                  {t('ಸಲ್ಲಿಕೆ ಟಿಪ್ಪಣಿ ಮತ್ತು ಗೌಪ್ಯತೆ ಘೋಷಣೆ', 'Submit Note & Privacy Undertaking *')}
                </h4>
                <p className="text-[11px] text-slate-700 leading-relaxed font-kannada">
                  {t(
                    '೧. ನಾನು ಸಲ್ಲಿಸಿದ ಕುಂದುಕೊರತೆಯು ಸತ್ಯವಾಗಿದ್ದು, ಸಾರ್ವಜನಿಕ ಹಿತಾಸಕ್ತಿಯನ್ನು ಹೊಂದಿರುತ್ತದೆ ಎಂದು ಧೃಡೀಕರಿಸುತ್ತೇನೆ.',
                    '1. I affirm that the grievance submitted is true and represents legitimate public interest.'
                  )}
                  <br />
                  {t(
                    '೨. ದೂರುದಾರರ ರಕ್ಷಣೆ: ಗ್ರಾಮ ಪಂಚಾಯತಿ ಸದಸ್ಯರಿಗೆ ಅಥವಾ ಸ್ಥಳೀಯ ಜನಪ್ರತಿನಿಧಿಗಳಿಗೆ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ವಿವರಗಳು ಬಹಿರಂಗವಾಗುವುದಿಲ್ಲ.',
                    '2. Whistleblower Protection: Your personal identification is masked with an anonymous token.'
                  )}
                </p>
              </div>
            </div>

            <label className="flex items-start gap-2.5 pt-2 border-t border-amber-200/80 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedSubmitNote}
                onChange={(e) => setAcceptedSubmitNote(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 mt-0.5 shrink-0"
              />
              <span className="text-xs font-semibold text-slate-800 leading-tight select-none">
                {t(
                  'ನಾನು ಮೇಲಿನ ಸಲ್ಲಿಕೆ ಟಿಪ್ಪಣಿಯನ್ನು ಓದಿದ್ದು, ನಿಯಮಗಳಿಗೆ ಸಮ್ಮತಿಸುತ್ತೇನೆ.',
                  'I hereby acknowledge the Submit Note and affirm the facts stated.'
                )}
              </span>
            </label>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('ಗ್ರಾಮ ಪಂಚಾಯತಿ ಕಚೇರಿಗೆ ತಕ್ಷಣವೇ ರವಾನೆಯಾಗುತ್ತದೆ', 'Instant notification alert will be triggered to Gram Panchayat desk')}</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-bold text-sm transition cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>{t('ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...', 'Submitting...')}</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('ದೂರು ಸಲ್ಲಿಸಿ', 'Submit Grievance')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
