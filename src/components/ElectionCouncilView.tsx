import React, { useState } from 'react';
import {
  Users,
  Award,
  Calendar,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  Trash2,
  Building,
  Briefcase,
  Vote,
  Sparkles,
  Globe,
} from 'lucide-react';
import { CouncilMember, GramPanchayatInfo, UserSession } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ElectionCouncilViewProps {
  panchayat: GramPanchayatInfo;
  councilMembers: CouncilMember[];
  user: UserSession | null;
  onAddMember: (member: CouncilMember) => void;
  onRemoveMember: (id: string) => void;
  onArchiveTerm: () => void;
  onRequirePdoLogin: () => void;
}

export const ElectionCouncilView: React.FC<ElectionCouncilViewProps> = ({
  panchayat,
  councilMembers,
  user,
  onAddMember,
  onRemoveMember,
  onArchiveTerm,
  onRequirePdoLogin,
}) => {
  const { t, isKannada, isEnglish } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'president' | 'vice_president' | 'ward_member'>('ward_member');
  const [newMemberVillage, setNewMemberVillage] = useState(panchayat.villages[0]?.nameEn || '');
  const [newMemberWard, setNewMemberWard] = useState('Ward No. 01');
  const [newMemberStartYear, setNewMemberStartYear] = useState(2026);
  const [newMemberEndYear, setNewMemberEndYear] = useState(2031);

  // Pending join requests from newly elected winners after 5-year election
  const [pendingJoinRequests, setPendingJoinRequests] = useState([
    {
      id: 'REQ-01',
      name: 'Sri M. Ramesh (Newly Elected Member)',
      nameKn: 'ಶ್ರೀ ಎಂ. ರಮೇಶ್ (ಹೊಸ ಚುನಾಯಿತ ಸದಸ್ಯರು)',
      ward: 'Ward No. 05',
      village: 'Muddenahalli',
      electionYear: 2026,
      submittedAt: '2026-09-14',
    },
    {
      id: 'REQ-02',
      name: 'Smt. Kavitha Manjunath',
      nameKn: 'ಶ್ರೀಮತಿ ಕವಿತಾ ಮಂಜುನಾಥ್',
      ward: 'Ward No. 07',
      village: 'Yelagere Gate',
      electionYear: 2026,
      submittedAt: '2026-09-15',
    },
  ]);

  const isPdo = user?.role === 'official_pdo';

  const handleApproveJoinRequest = (req: typeof pendingJoinRequests[0]) => {
    const newMember: CouncilMember = {
      id: `MEM_${Date.now()}`,
      name: req.name,
      nameKn: req.nameKn,
      role: 'ward_member',
      roleTitleEn: 'Elected Ward Member (5-Yr Term)',
      roleTitleKn: 'ಚುನಾಯಿತ ವಾರ್ಡ್ ಸದಸ್ಯರು (೫ ವರ್ಷಗಳ ಅವಧಿ)',
      villageRepresented: req.village,
      wardNumber: req.ward,
      phone: panchayat.helplineNumber,
      termStartYear: req.electionYear,
      termEndYear: req.electionYear + 5,
      status: 'active',
    };
    onAddMember(newMember);
    setPendingJoinRequests((prev) => prev.filter((r) => r.id !== req.id));
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    let roleTitleEn = 'Elected Ward Member';
    let roleTitleKn = 'ಚುನಾಯಿತ ವಾರ್ಡ್ ಸದಸ್ಯರು';
    if (newMemberRole === 'president') {
      roleTitleEn = 'Gram Panchayat President (Adhyaksha)';
      roleTitleKn = 'ಗ್ರಾಮ ಪಂಚಾಯತಿ ಅಧ್ಯಕ್ಷರು';
    } else if (newMemberRole === 'vice_president') {
      roleTitleEn = 'Gram Panchayat Vice President (Upadhyaksha)';
      roleTitleKn = 'ಗ್ರಾಮ ಪಂಚಾಯತಿ ಉಪಾಧ್ಯಕ್ಷರು';
    }

    const newMember: CouncilMember = {
      id: `MEM_${Date.now()}`,
      name: newMemberName.trim(),
      nameKn: newMemberName.trim(),
      role: newMemberRole,
      roleTitleEn,
      roleTitleKn,
      villageRepresented: newMemberVillage,
      wardNumber: newMemberWard,
      phone: panchayat.helplineNumber,
      termStartYear: newMemberStartYear,
      termEndYear: newMemberEndYear,
      status: 'active',
    };

    onAddMember(newMember);
    setShowAddModal(false);
    setNewMemberName('');
  };

  return (
    <div className="space-y-6">
      {/* 5-Year Term Governance Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Vote className="w-3.5 h-3.5" />
              <span>{t('೫ ವರ್ಷಗಳ ಚುನಾಯಿತ ಆಡಳಿತ ಮಂಡಳಿ', '5-Year Democratic Council Term')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight font-kannada">
              {t(
                'ಗ್ರಾಮ ಪಂಚಾಯತಿ ಚುನಾಯಿತ ಸದಸ್ಯರ ಮಂಡಳಿ',
                'Elected Gram Panchayat Council Roster'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 max-w-2xl">
              {t(
                'ಕರ್ನಾಟಕ ಗ್ರಾಮ ಸ್ವರಾಜ್ ಮತ್ತು ಪಂಚಾಯತ್ ರಾಜ್ ಅಧಿನಿಯಮದ ಪ್ರಕಾರ, ಗ್ರಾಮ ಪಂಚಾಯತಿ ಚುನಾವಣೆಗಳು ಪ್ರತಿ ೫ ವರ್ಷಗಳಿಗೊಮ್ಮೆ ನಡೆಯುತ್ತವೆ. ಚುನಾಯಿತ ವಿಜೇತರು ಅಧಿಕೃತವಾಗಿ ಮಂಡಳಿಯನ್ನು ಮುನ್ನಡೆಸುತ್ತಾರೆ.',
                'Under the Karnataka Gram Swaraj and Panchayat Raj Act, Gram Panchayat democratic elections occur every 5 years. Elected representatives lead development and civic services.'
              )}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur border border-white/20 p-4 rounded-xl text-center shrink-0">
            <div className="text-xs text-amber-300 font-bold">
              {t('ಪ್ರಸ್ತುತ ಆಡಳಿತ ಅವಧಿ', 'Current Council Term')}
            </div>
            <div className="text-lg font-black font-mono mt-0.5 text-white">
              {panchayat.currentTerm}
            </div>
            <div className="text-[11px] text-emerald-200 mt-1 font-mono">
              {t('ಮುಂದಿನ ಚುನಾವಣೆ:', 'Next Election:')} Dec {panchayat.nextElectionYear}
            </div>
          </div>
        </div>

        {/* Administration Actions for PDO */}
        <div className="mt-5 pt-4 border-t border-emerald-700/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-100">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>
              {t(
                'ಮಂಡಳಿ ಆಡಳಿತ ಅಧಿಕಾರ: ಪಂಚಾಯತ್ ಅಭಿವೃದ್ಧಿ ಅಧಿಕಾರಿ (PDO Desk)',
                'Administration Control: Panchayat Development Officer (PDO Desk)'
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isPdo ? (
              <>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{t('ವಿಜೇತರನ್ನು ಸೇರಿಸಿ', 'Add Election Winner')}</span>
                </button>
                <button
                  onClick={onArchiveTerm}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                  title="Archive Previous Term Members"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>{t('ಅವಧಿ ಪೂರ್ಣ', 'Complete 5-Yr Term')}</span>
                </button>
              </>
            ) : (
              <button
                onClick={onRequirePdoLogin}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg transition cursor-pointer inline-flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5 text-amber-300" />
                <span>{t('ಪಿ.ಡಿ.ಒ ಲಾಗಿನ್', 'Switch to PDO Admin')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pending Join Requests Section */}
      {pendingJoinRequests.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Vote className="w-5 h-5 text-amber-700" />
              <div>
                <h3 className="text-xs font-bold text-amber-950 font-kannada">
                  {t(
                    'ಹೊಸದಾಗಿ ಚುನಾಯಿತರಾದ ಸದಸ್ಯರ ಪ್ರವೇಶ ವಿನಂತಿಗಳು',
                    'Pending Winner Inductions'
                  )}{' '}
                  ({pendingJoinRequests.length})
                </h3>
                <p className="text-[11px] text-amber-800">
                  {t(
                    'ಇತ್ತೀಚಿನ ಚುನಾವಣೆಯಲ್ಲಿ ವಿಜೇತರಾದ ಸದಸ್ಯರು ಪಿ.ಡಿ.ಒ ಪರಿಶೀಲನೆಗೆ ಕಾಯುತ್ತಿದ್ದಾರೆ.',
                    'Newly elected winners awaiting PDO verification and onboarding.'
                  )}
                </p>
              </div>
            </div>
            {!isPdo && (
              <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded">
                {t('ಪಿ.ಡಿ.ಒ ಅನುಮೋದನೆ ಅಗತ್ಯ', 'PDO Approval Required')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {pendingJoinRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 bg-white rounded-xl border border-amber-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">
                    {isKannada ? req.nameKn : req.name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-kannada">
                    {req.ward} ({req.village})
                  </div>
                  <div className="text-[10px] text-emerald-800 font-mono mt-0.5">
                    {t('ಚುನಾವಣಾ ವರ್ಷ:', 'Election Year:')} {req.electionYear} (Term {req.electionYear}–{req.electionYear + 5})
                  </div>
                </div>

                {isPdo ? (
                  <button
                    onClick={() => handleApproveJoinRequest(req)}
                    className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-2xs"
                  >
                    {t('ಅಂಗೀಕರಿಸಿ', 'Induct')}
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 font-semibold italic">
                    {t('ಬಾಕಿ ಇದೆ', 'Pending')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Council Members Roster Cards */}
      <div className="space-y-3">
        {/* Open Public Access Notification */}
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="text-emerald-950 font-medium">
              <strong className="font-bold font-kannada">{t('ಸಾರ್ವಜನಿಕ ಮುಕ್ತ ಮಾಹಿತಿ:', 'Public Notice:')}</strong>{' '}
              {t(
                'ಮಂಡಳಿ ಅಧ್ಯಕ್ಷರು, ಉಪಾಧ್ಯಕ್ಷರು ಮತ್ತು ವಾರ್ಡ್ ಸದಸ್ಯರ ಅಧಿಕೃತ ಮಾಹಿತಿ, ಪ್ರತಿನಿಧಿಸುವ ಗ್ರಾಮ ಹಾಗೂ ಸಂಪರ್ಕ ವಿವರಗಳನ್ನು ಸಾರ್ವಜನಿಕರು ಮುಕ್ತವಾಗಿ ಪರಿಶೀಲಿಸಬಹುದು.',
                'Citizens can openly view profiles, constituent villages, and contact channels of all elected representatives without logging in.'
              )}
            </span>
          </div>
          <span className="hidden sm:inline text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full shrink-0">
            {t('ಮುಕ್ತ ಸಾರ್ವಜನಿಕ ಪ್ರವೇಶ', 'Open Public Access')}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 font-kannada flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-700" />
            <span>
              {t('ಪ್ರಸ್ತುತ ಮಂಡಳಿಯ ಸದಸ್ಯರು', 'Active Council Members')} ({councilMembers.length})
            </span>
          </h3>
          <span className="text-xs text-slate-500">
            {t('ಸಹಾಯವಾಣಿ:', 'Helpline:')}{' '}
            <span className="font-mono font-bold text-emerald-800">{panchayat.helplineNumber}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {councilMembers.map((member) => {
            const isPdoRole = member.role === 'pdo';
            const isPres = member.role === 'president';
            const isVice = member.role === 'vice_president';

            return (
              <div
                key={member.id}
                className={`p-5 rounded-2xl border transition relative overflow-hidden flex flex-col justify-between ${
                  isPdoRole
                    ? 'bg-slate-900 text-white border-slate-800 shadow-sm'
                    : isPres
                    ? 'bg-amber-50/70 border-amber-300 text-slate-900 shadow-xs'
                    : isVice
                    ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-emerald-300 text-slate-900'
                }`}
              >
                <div>
                  {/* Role Header Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isPdoRole
                          ? 'bg-amber-400 text-slate-950'
                          : isPres
                          ? 'bg-amber-200 text-amber-900'
                          : isVice
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isKannada ? member.roleTitleKn : isEnglish ? member.roleTitleEn : member.roleTitleKn}
                    </span>

                    <span
                      className={`text-[10px] font-mono font-semibold ${
                        isPdoRole ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {member.termStartYear} – {member.termEndYear}
                    </span>
                  </div>

                  {/* Name & Title */}
                  <h4
                    className={`text-base font-extrabold leading-snug ${
                      isPdoRole ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {isKannada && member.nameKn ? member.nameKn : member.name}
                  </h4>
                  <div
                    className={`text-xs mt-0.5 font-kannada ${
                      isPdoRole ? 'text-amber-200' : 'text-emerald-900'
                    }`}
                  >
                    {isKannada ? member.roleTitleKn : member.roleTitleEn}
                  </div>

                  {/* Village / Ward info */}
                  <div
                    className={`mt-3 pt-3 border-t text-xs space-y-1 ${
                      isPdoRole
                        ? 'border-slate-800 text-slate-300'
                        : 'border-slate-100 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{t('ಗ್ರಾಮ:', 'Village:')}</span>
                      <span className="font-bold">{member.villageRepresented}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('ವಾರ್ಡ್:', 'Ward:')}</span>
                      <span className="font-bold">{member.wardNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('ಸಂಪರ್ಕ:', 'Contact:')}</span>
                      <span className="font-mono font-bold">{member.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Remove option for PDO */}
                {isPdo && !isPdoRole && (
                  <div className="mt-3 pt-2 border-t border-slate-200 flex justify-end">
                    <button
                      onClick={() => onRemoveMember(member.id)}
                      className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold inline-flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{t('ಅವಧಿ ಮುಕ್ತಾಯ / ತೆಗೆಯಿರಿ', 'End Term / Remove')}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Election Winner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white p-5 flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold font-kannada">
                  {t('೫ ವರ್ಷಗಳ ಚುನಾವಣಾ ವಿಜೇತರನ್ನು ಸೇರಿಸಿ', 'Add 5-Year Election Winner')}
                </h3>
                <p className="text-xs text-emerald-200">
                  {t('ಮಂಡಳಿಯ ಅಧಿಕೃತ ಪಟ್ಟಿಗೆ ಸೇರ್ಪಡೆ', 'Induct into official council directory')}
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualAdd} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1 font-kannada">
                  {t('ಚುನಾಯಿತ ಸದಸ್ಯರ ಹೆಸರು *', 'Full Name *')}
                </label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Sri / Smt. Name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 font-kannada">
                  {t('ಹುದ್ದೆ *', 'Designation / Role *')}
                </label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="ward_member">{t('ವಾರ್ಡ್ ಸದಸ್ಯರು', 'Ward Member')}</option>
                  <option value="president">{t('ಗ್ರಾಮ ಪಂಚಾಯತಿ ಅಧ್ಯಕ್ಷರು', 'Gram Panchayat President (Adhyaksha)')}</option>
                  <option value="vice_president">{t('ಗ್ರಾಮ ಪಂಚಾಯತಿ ಉಪಾಧ್ಯಕ್ಷರು', 'Vice President (Upadhyaksha)')}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 font-kannada">
                    {t('ಗ್ರಾಮ', 'Village')}
                  </label>
                  <select
                    value={newMemberVillage}
                    onChange={(e) => setNewMemberVillage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {panchayat.villages.map((v) => (
                      <option key={v.id} value={v.nameEn}>
                        {isKannada ? v.nameKn : v.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 font-kannada">
                    {t('ವಾರ್ಡ್', 'Ward No.')}
                  </label>
                  <input
                    type="text"
                    value={newMemberWard}
                    onChange={(e) => setNewMemberWard(e.target.value)}
                    placeholder="Ward No. 01"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {t('ಅವಧಿ ಆರಂಭ ವರ್ಷ', 'Term Start Year')}
                  </label>
                  <input
                    type="number"
                    value={newMemberStartYear}
                    onChange={(e) => setNewMemberStartYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {t('ಅವಧಿ ಮುಕ್ತಾಯ ವರ್ಷ', 'Term End Year')}
                  </label>
                  <input
                    type="number"
                    value={newMemberEndYear}
                    onChange={(e) => setNewMemberEndYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
                >
                  {t('ರದ್ದು', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs"
                >
                  {t('ಮಂಡಳಿಗೆ ಸೇರಿಸಿ', 'Induct Member')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

