import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  MapPin,
  Navigation,
  CheckCircle2,
  Building2,
  LocateFixed,
  Search,
  PlusCircle,
  Landmark,
  Users,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { GramPanchayatInfo, Village } from '../types';
import {
  KARNATAKA_DISTRICTS,
  PANCHAYAT_DIRECTORY,
  getGramPanchayatsByDistrictAndTaluk,
  createCustomGramPanchayat,
} from '../data/panchayatData';
import { useLanguage } from '../context/LanguageContext';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  panchayat: GramPanchayatInfo;
  onSelectPanchayat: (updatedPanchayat: GramPanchayatInfo) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  panchayat,
  onSelectPanchayat,
}) => {
  const { t, isKannada, isEnglish } = useLanguage();

  // District, Taluk, and Selected Gram Panchayat State
  const [selectedDistrict, setSelectedDistrict] = useState(panchayat.districtEn);
  const [selectedTaluk, setSelectedTaluk] = useState(panchayat.talukEn);
  const [selectedPanchayatId, setSelectedPanchayatId] = useState(panchayat.id);
  const [activeCandidate, setActiveCandidate] = useState<GramPanchayatInfo>(panchayat);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Custom GP creator mode
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customGpName, setCustomGpName] = useState('');
  const [customVillagesText, setCustomVillagesText] = useState('');

  // Geolocation
  const [geoStatus, setGeoStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // Sync state whenever modal opens or current panchayat changes
  useEffect(() => {
    if (isOpen) {
      setSelectedDistrict(panchayat.districtEn);
      setSelectedTaluk(panchayat.talukEn);
      setSelectedPanchayatId(panchayat.id);
      setActiveCandidate(panchayat);
      setIsCustomMode(false);
      setSearchQuery('');
    }
  }, [isOpen, panchayat]);

  // Current district object
  const currentDistrictObj = useMemo(() => {
    return (
      KARNATAKA_DISTRICTS.find(
        (d) =>
          d.districtEn.toLowerCase() === selectedDistrict.toLowerCase() ||
          d.name.toLowerCase().includes(selectedDistrict.toLowerCase())
      ) || KARNATAKA_DISTRICTS[0]
    );
  }, [selectedDistrict]);

  // Available Gram Panchayats for the chosen district and taluk
  const availablePanchayats = useMemo(() => {
    return getGramPanchayatsByDistrictAndTaluk(currentDistrictObj.districtEn, selectedTaluk);
  }, [currentDistrictObj.districtEn, selectedTaluk]);

  // Filtered by search query across all Karnataka if searching, or within taluk
  const displayedPanchayats = useMemo(() => {
    if (!searchQuery.trim()) {
      return availablePanchayats;
    }
    const q = searchQuery.toLowerCase().trim();
    return PANCHAYAT_DIRECTORY.filter(
      (p) =>
        p.nameEn.toLowerCase().includes(q) ||
        p.nameKn.includes(q) ||
        p.talukEn.toLowerCase().includes(q) ||
        p.talukKn.includes(q) ||
        p.districtEn.toLowerCase().includes(q) ||
        p.villages.some((v) => v.nameEn.toLowerCase().includes(q) || v.nameKn.includes(q))
    );
  }, [availablePanchayats, searchQuery]);

  // When district changes, update taluk and active panchayat
  const handleDistrictChange = (newDistrictEn: string) => {
    setSelectedDistrict(newDistrictEn);
    const distObj =
      KARNATAKA_DISTRICTS.find((d) => d.districtEn.toLowerCase() === newDistrictEn.toLowerCase()) ||
      KARNATAKA_DISTRICTS[0];
    const firstTaluk = distObj.taluks[0] || 'Main';
    setSelectedTaluk(firstTaluk);

    const gps = getGramPanchayatsByDistrictAndTaluk(distObj.districtEn, firstTaluk);
    if (gps.length > 0) {
      setSelectedPanchayatId(gps[0].id);
      setActiveCandidate(gps[0]);
    }
    setIsCustomMode(false);
  };

  // When taluk changes, update active panchayat
  const handleTalukChange = (newTaluk: string) => {
    setSelectedTaluk(newTaluk);
    const gps = getGramPanchayatsByDistrictAndTaluk(currentDistrictObj.districtEn, newTaluk);
    if (gps.length > 0) {
      setSelectedPanchayatId(gps[0].id);
      setActiveCandidate(gps[0]);
    }
    setIsCustomMode(false);
  };

  // Select a Gram Panchayat
  const handleSelectPanchayatCandidate = (gp: GramPanchayatInfo) => {
    setSelectedPanchayatId(gp.id);
    setActiveCandidate(gp);
    setSelectedDistrict(gp.districtEn);
    setSelectedTaluk(gp.talukEn);
    setIsCustomMode(false);
  };

  // Handle custom Gram Panchayat creation
  const handleCreateCustomGP = () => {
    if (!customGpName.trim()) return;

    const parsedVillages = customVillagesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const newGP = createCustomGramPanchayat(
      customGpName.trim(),
      currentDistrictObj.districtEn,
      currentDistrictObj.districtKn,
      selectedTaluk,
      selectedTaluk,
      parsedVillages.length > 0 ? parsedVillages : undefined
    );

    setActiveCandidate(newGP);
    setSelectedPanchayatId(newGP.id);
    setIsCustomMode(false);
  };

  // Geolocation handling
  const handleRequestGeoPermission = () => {
    setGeoStatus('requesting');
    if (!navigator.geolocation) {
      setGeoStatus('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeoStatus('granted');
      },
      (error) => {
        console.warn('Geolocation permission error:', error.message);
        setGeoStatus('denied');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Save and apply changes
  const handleConfirmLocation = () => {
    onSelectPanchayat(activeCandidate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 text-white p-4 sm:p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Landmark className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight font-kannada">
                {t(
                  'ಗ್ರಾಮ ಪಂಚಾಯತಿ ಬದಲಾವಣೆ (ಜಿಲ್ಲೆ ಮತ್ತು ತಾಲೂಕಿನ ಪ್ರಕಾರ)',
                  'Change Gram Panchayat by District & Taluk'
                )}
              </h3>
              <p className="text-xs text-emerald-200 font-medium">
                {t(
                  'ಕರ್ನಾಟಕದ ಜಿಲ್ಲೆ, ತಾಲೂಕು ಮತ್ತು ಗ್ರಾಮ ಪಂಚಾಯತಿಗಳ ಅಧಿಕೃತ ಪಟ್ಟಿ',
                  'Official Directory of Karnataka Districts, Taluks & Gram Panchayats'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title={t('ಮುಚ್ಚಿ', 'Close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          {/* Quick Search across all Karnataka GPs */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(
                'ಗ್ರಾಮ ಪಂಚಾಯತಿ ಅಥವಾ ಗ್ರಾಮದ ಹೆಸರನ್ನು ಹುಡುಕಿ (ಉದಾ: ನಂದಿ, ವರುಣಾ, ಮೇಲೂರು)...',
                'Search Gram Panchayat or village name (e.g. Nandi, Varuna, Meluru)...'
              )}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Cascading 3-Tier Hierarchy: District -> Taluk -> Gram Panchayat */}
          <div className="space-y-4">
            <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>
                {t(
                  'ಆಡಳಿತ ಶ್ರೇಣಿ ಆಯ್ಕೆ (ಜಿಲ್ಲೆ ➔ ತಾಲೂಕು ➔ ಗ್ರಾಮ ಪಂಚಾಯತಿ)',
                  'Administrative Hierarchy (District ➔ Taluk ➔ Gram Panchayat)'
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Step 1: District Selector */}
              <div>
                <label className="block text-slate-700 text-[11px] mb-1.5 font-bold">
                  {t('೧. ಜಿಲ್ಲೆ / Step 1: Select District *', '1. Select District *')}
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 px-3 py-2.5 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                >
                  {KARNATAKA_DISTRICTS.map((dist) => (
                    <option key={dist.districtEn} value={dist.districtEn}>
                      {dist.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Taluk Selector */}
              <div>
                <label className="block text-slate-700 text-[11px] mb-1.5 font-bold">
                  {t('೨. ತಾಲೂಕು / Step 2: Select Taluk *', '2. Select Taluk *')}
                </label>
                <select
                  value={selectedTaluk}
                  onChange={(e) => handleTalukChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 px-3 py-2.5 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                >
                  {currentDistrictObj.taluks.map((taluk) => (
                    <option key={taluk} value={taluk}>
                      {taluk} {t('ತಾಲೂಕು', 'Taluk')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 3: Gram Panchayat Grid / Cards according to District & Taluk */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-slate-800 text-xs font-extrabold font-kannada flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-emerald-700" />
                  <span>
                    {t(
                      `೩. ಗ್ರಾಮ ಪಂಚಾಯತಿ ಆಯ್ಕೆಮಾಡಿ (${currentDistrictObj.districtKn} > ${selectedTaluk}) *`,
                      `3. Select Gram Panchayat (${currentDistrictObj.districtEn} > ${selectedTaluk}) *`
                    )}
                  </span>
                </label>
                <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {displayedPanchayats.length} {t('ಲಭ್ಯವಿರುವ ಗ್ರಾ.ಪಂ', 'GPs available')}
                </span>
              </div>

              {/* List of Gram Panchayats matching current district & taluk */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1 bg-slate-50/70 rounded-xl border border-slate-200">
                {displayedPanchayats.map((gp) => {
                  const isSelected = selectedPanchayatId === gp.id && !isCustomMode;
                  return (
                    <button
                      key={gp.id}
                      type="button"
                      onClick={() => handleSelectPanchayatCandidate(gp)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/30 text-emerald-950 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-emerald-300 text-slate-800 hover:bg-emerald-50/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5 mb-1.5">
                        <div className="font-extrabold text-xs font-kannada leading-tight">
                          {isKannada ? gp.nameKn : gp.nameEn}
                        </div>
                        {isSelected ? (
                          <span className="p-1 rounded-full bg-emerald-600 text-white shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {gp.villages.length} {t('ಗ್ರಾಮಗಳು', 'villages')}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-600 font-medium">
                        {isKannada ? gp.nameEn : gp.nameKn}
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span className="truncate max-w-[130px]">{gp.talukEn} Taluk</span>
                        <span className="text-emerald-700 font-semibold">{gp.id}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Option to create or add custom Gram Panchayat */}
              <div className="pt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(!isCustomMode)}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-800 hover:text-emerald-950 font-bold hover:underline cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
                  <span>
                    {isCustomMode
                      ? t('ಪಟ್ಟಿಗೆ ಮರಳಿ / Back to List', 'Back to GP List')
                      : t(
                          '＋ ನಿಮ್ಮ ಗ್ರಾಮ ಪಂಚಾಯತಿ ಹೆಸರನ್ನು ಹೊಸದಾಗಿ ನಮೂದಿಸಿ',
                          '＋ Enter Custom Gram Panchayat Name'
                        )}
                  </span>
                </button>
              </div>

              {/* Custom Gram Panchayat Input Panel */}
              {isCustomMode && (
                <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-300 space-y-3 animate-in fade-in">
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>
                      {t(
                        'ಹೊಸ ಗ್ರಾಮ ಪಂಚಾಯತಿ ನಮೂದನೆ',
                        'Add Custom Gram Panchayat for This Taluk'
                      )}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={customGpName}
                      onChange={(e) => setCustomGpName(e.target.value)}
                      placeholder={t(
                        'ಗ್ರಾಮ ಪಂಚಾಯತಿ ಹೆಸರು (ಉದಾ: ಹಾರೋಹಳ್ಳಿ ಗ್ರಾಮ ಪಂಚಾಯತಿ)...',
                        'Gram Panchayat Name (e.g. Harohalli Gram Panchayat)...'
                      )}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <input
                      type="text"
                      value={customVillagesText}
                      onChange={(e) => setCustomVillagesText(e.target.value)}
                      placeholder={t(
                        'ವ್ಯಾಪ್ತಿಯ ಗ್ರಾಮಗಳು (ಅಲ್ಪವಿರಾಮದಿಂದ ಬೇರ್ಪಡಿಸಿ - ಗರಿಷ್ಠ ೭ ಗ್ರಾಮಗಳು)...',
                        'Constituent villages separated by comma (e.g. Village A, Village B)...'
                      )}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCustomGP}
                      disabled={!customGpName.trim()}
                      className="w-full py-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      {t('ಈ ಗ್ರಾಮ ಪಂಚಾಯತಿಯನ್ನು ಸೇರಿಸಿ', 'Add & Select This Gram Panchayat')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Currently Chosen Gram Panchayat Details Card */}
            <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-300/80 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-emerald-950 font-kannada">
                      {isKannada ? activeCandidate.nameKn : activeCandidate.nameEn}
                    </span>
                    <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                      {activeCandidate.currentTerm}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 font-medium mt-0.5">
                    {isKannada ? activeCandidate.nameEn : activeCandidate.nameKn} •{' '}
                    <span className="font-semibold text-emerald-900">
                      {activeCandidate.talukEn} Taluk, {activeCandidate.districtEn} District
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-500 font-mono block">
                    Code: {activeCandidate.id}
                  </span>
                  <span className="text-[11px] text-emerald-800 font-bold">
                    Helpline: {activeCandidate.helplineNumber}
                  </span>
                </div>
              </div>

              {/* PDO & Jurisdictional Officers */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-emerald-200/60">
                <span>
                  {t('ಪಿ.ಡಿ.ಒ ಅಧಿಕಾರಿ:', 'PDO Officer:')}{' '}
                  <strong className="text-slate-800">{activeCandidate.pdoName}</strong>
                </span>
                <span>
                  {t('ಸಂಪರ್ಕ:', 'Contact:')}{' '}
                  <span className="font-mono text-emerald-800 font-semibold">
                    {activeCandidate.pdoPhone}
                  </span>
                </span>
              </div>

              {/* Constituent Villages List (<10 Villages) */}
              <div className="pt-1.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 font-kannada flex items-center gap-1">
                    <Users className="w-3 h-3 text-emerald-700" />
                    <span>
                      {t('ಪಂಚಾಯತಿ ವ್ಯಾಪ್ತಿಯ ಗ್ರಾಮಗಳು', 'Constituent Villages')} (
                      {activeCandidate.villages.length} {t('ಗ್ರಾಮಗಳು - 10ಕ್ಕಿಂತ ಕಡಿಮೆ', 'Villages - Less than 10')}):
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto">
                  {activeCandidate.villages.map((v, idx) => (
                    <div
                      key={v.id}
                      className="p-1.5 rounded-lg border border-emerald-200/80 bg-white text-[11px] flex items-center justify-between"
                    >
                      <div className="truncate">
                        <span className="text-emerald-800 font-bold mr-1">{idx + 1}.</span>
                        <span className="font-semibold text-slate-800">
                          {isKannada ? v.nameKn : v.nameEn}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono shrink-0 ml-1">
                        W:{v.wardsCount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Geolocation Device GPS Option */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-700 shrink-0" />
                <div className="text-[11px] text-slate-600">
                  <span className="font-bold text-slate-800 block">
                    {t('ಸಾಧನದ ಜಿಪಿಎಸ್ ಸ್ಥಳ / Device GPS Pinpoint', 'Device GPS Pinpoint')}
                  </span>
                  <span>
                    {coordinates
                      ? `${coordinates.lat.toFixed(4)}° N, ${coordinates.lng.toFixed(4)}° E`
                      : t('ಸ್ಥಳ ಪತ್ತೆಹಚ್ಚಲು ಜಿಪಿಎಸ್ ಬಳಸಿ', 'Optional: Use GPS for spot accuracy')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRequestGeoPermission}
                disabled={geoStatus === 'requesting'}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 cursor-pointer shrink-0"
              >
                {geoStatus === 'granted'
                  ? `✓ ${t('ಪತ್ತೆಯಾಗಿದೆ', 'Located')}`
                  : geoStatus === 'requesting'
                  ? t('ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತಿದೆ...', 'Detecting...')
                  : t('ಜಿಪಿಎಸ್ ಅನುಮತಿ', 'Allow GPS')}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-600 truncate hidden sm:block">
            {t('ಆಯ್ಕೆಮಾಡಿದ ಪಂಚಾಯತಿ:', 'Selected:')}{' '}
            <strong className="text-emerald-900">{activeCandidate.nameEn}</strong> (
            {activeCandidate.talukEn}, {activeCandidate.districtEn})
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-100 transition cursor-pointer"
            >
              {t('ರದ್ದು', 'Cancel')}
            </button>
            <button
              onClick={handleConfirmLocation}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>
                {t(
                  'ಈ ಗ್ರಾಮ ಪಂಚಾಯತಿಗೆ ಬದಲಾಯಿಸಿ',
                  'Confirm & Switch Gram Panchayat'
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

