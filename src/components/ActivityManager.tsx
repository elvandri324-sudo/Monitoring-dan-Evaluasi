import { useState, useMemo } from 'react';
import { 
  CalendarCheck2, 
  Plus, 
  Users, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  UserCheck, 
  ShieldAlert, 
  Filter, 
  Layers, 
  ArrowRight, 
  Sparkles, 
  Edit2,
  Trash2
} from 'lucide-react';
import { Project, Activity, Beneficiary, ActivityAttendance } from '../types';
import { getAllActivitiesFromProjects, calculateDisaggregations } from '../services/meEngine';
import { useLanguage } from '../context/LanguageContext';
import { formatGender, formatIplcStatus, formatAgeGroup } from '../utils/bilingual';

interface ActivityManagerProps {
  projects: Project[];
  beneficiaries: Beneficiary[];
  attendances: ActivityAttendance[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  isAdmin: boolean;
  onAddAttendance: (attendance: Omit<ActivityAttendance, 'id'>) => void;
  onRemoveAttendance: (attendanceId: string) => void;
  onOpenNewActivityModal: () => void;
  onOpenEditActivityModal?: (activity: Activity, projectId: string, outputId: string) => void;
  onDeleteActivity?: (projectId: string, activityId: string) => void;
  onOpenNewBeneficiaryModal: () => void;
}

export default function ActivityManager({
  projects,
  beneficiaries,
  attendances,
  selectedProjectId,
  setSelectedProjectId,
  isAdmin,
  onAddAttendance,
  onRemoveAttendance,
  onOpenNewActivityModal,
  onOpenEditActivityModal,
  onDeleteActivity,
  onOpenNewBeneficiaryModal
}: ActivityManagerProps) {
  const { language } = useLanguage();
  const isId = language === 'id';

  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [searchBeneficiaryQuery, setSearchBeneficiaryQuery] = useState('');
  const [selectedBeneficiaryIdToAdd, setSelectedBeneficiaryIdToAdd] = useState('');
  const [participantRoleInput, setParticipantRoleInput] = useState<any>('Peserta');
  const [participantNotesInput, setParticipantNotesInput] = useState('');

  // Get all activities across selected project or all projects
  const allActivitiesList = useMemo(() => {
    const list = getAllActivitiesFromProjects(projects);
    if (selectedProjectId !== 'all') {
      const activeProj = projects.find(p => p.id === selectedProjectId);
      if (activeProj) {
        return list.filter(item => item.projectName === activeProj.title);
      }
    }
    return list;
  }, [projects, selectedProjectId]);

  // Set default selected activity if not set
  const activeActivityItem = useMemo(() => {
    if (selectedActivityId) {
      return allActivitiesList.find(a => a.activity.id === selectedActivityId) || allActivitiesList[0];
    }
    return allActivitiesList[0];
  }, [allActivitiesList, selectedActivityId]);

  const activeActivity = activeActivityItem?.activity;

  // Find project of active activity
  const activeProject = useMemo(() => {
    if (!activeActivity) return projects[0];
    return projects.find(p => 
      p.outcomes.some(oc => 
        oc.outputs.some(op => 
          op.activities.some(act => act.id === activeActivity.id)
        )
      )
    ) || projects[0];
  }, [projects, activeActivity]);

  // Attendances for current active activity
  const currentActivityAttendances = useMemo(() => {
    if (!activeActivity) return [];
    return attendances.filter(a => a.activityId === activeActivity.id);
  }, [attendances, activeActivity]);

  // Beneficiaries in current activity
  const currentParticipants = useMemo(() => {
    return currentActivityAttendances.map(att => {
      const ben = beneficiaries.find(b => b.id === att.beneficiaryId);
      // Count total activities attended across all projects
      const totalActivitiesAttended = attendances.filter(a => a.beneficiaryId === att.beneficiaryId).length;
      return {
        attendance: att,
        beneficiary: ben,
        totalActivitiesAttended
      };
    });
  }, [currentActivityAttendances, beneficiaries, attendances]);

  // Check selected beneficiary for double-counting warning
  const previewBeneficiary = beneficiaries.find(b => b.id === selectedBeneficiaryIdToAdd);
  const previewPastAttendances = useMemo(() => {
    if (!previewBeneficiary) return [];
    return attendances.filter(a => a.beneficiaryId === previewBeneficiary.id);
  }, [previewBeneficiary, attendances]);

  const isAlreadyInThisActivity = useMemo(() => {
    if (!previewBeneficiary || !activeActivity) return false;
    return currentActivityAttendances.some(a => a.beneficiaryId === previewBeneficiary.id);
  }, [previewBeneficiary, activeActivity, currentActivityAttendances]);

  const handleAddParticipant = () => {
    if (!previewBeneficiary || !activeActivity || !activeProject) return;
    if (isAlreadyInThisActivity) {
      alert(isId ? 'Partisipan ini sudah terdaftar di kegiatan ini!' : 'This participant is already registered for this activity!');
      return;
    }

    onAddAttendance({
      activityId: activeActivity.id,
      projectId: activeProject.id,
      beneficiaryId: previewBeneficiary.id,
      attendanceDate: activeActivity.startDate || new Date().toISOString().split('T')[0],
      roleInActivity: participantRoleInput,
      attendanceStatus: 'Hadir Penuh',
      notes: participantNotesInput || (isId ? 'Partisipasi kegiatan terverifikasi' : 'Verified activity participation'),
      verifiedBy: activeActivity.leadPerson || 'M&E Officer'
    });

    setSelectedBeneficiaryIdToAdd('');
    setParticipantNotesInput('');
    setSearchBeneficiaryQuery('');
  };

  // Activity Disaggregation Stats
  const activityDisagg = useMemo(() => {
    if (!activeActivity) return null;
    return calculateDisaggregations(beneficiaries, attendances, undefined, activeActivity.id);
  }, [beneficiaries, attendances, activeActivity]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-xs">
              M&E Field Operations
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              {isId ? 'Kegiatan & Presensi Partisipan' : 'Activities & Participant Attendance'}
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            {isId 
              ? 'Pencatatan kehadiran kegiatan dengan verifikasi anti double-counting otomatis terhadap database penerima manfaat.'
              : 'Record activity attendance with automated anti double-counting verification against the beneficiary database.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button
                id="btn-add-new-activity-header"
                onClick={onOpenNewActivityModal}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>{isId ? '+ Tambah Kegiatan Baru' : '+ Add New Activity'}</span>
              </button>

              <button
                onClick={onOpenNewBeneficiaryModal}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{isId ? '+ Penerima Manfaat' : '+ Beneficiary'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Grid: Activity List on Left, Active Activity Details & Roster on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Activity Selector Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {isId ? 'Daftar Kegiatan' : 'Activity List'} ({allActivitiesList.length})
              </span>
              <div className="flex items-center gap-1">
                {isAdmin && (
                  <button
                    onClick={onOpenNewActivityModal}
                    className="p-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[10px] font-bold flex items-center gap-0.5"
                    title={isId ? 'Tambah Kegiatan Baru' : 'Add New Activity'}
                  >
                    <Plus className="w-3 h-3" /> {isId ? 'Tambah' : 'Add'}
                  </button>
                )}
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="text-[11px] bg-slate-50 border border-slate-300 rounded px-2 py-1"
                >
                  <option value="all">{isId ? 'Semua Proyek' : 'All Projects'}</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.code}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {allActivitiesList.map(({ activity, projectName }) => {
                const isSelected = activeActivity?.id === activity.id;
                const partCount = attendances.filter(a => a.activityId === activity.id).length;

                return (
                  <div
                    key={activity.id}
                    onClick={() => setSelectedActivityId(activity.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-amber-50/80 border-amber-400 shadow-2xs ring-1 ring-amber-400/30'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded text-[10px]">
                        {activity.code}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">
                        {activity.status}
                      </span>
                    </div>

                    <h4 className="font-semibold text-slate-900 line-clamp-2 mb-1.5">
                      {activity.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>{activity.location}</span>
                      <span className="font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {partCount} {isId ? 'Partisipan' : 'Participants'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Activity Detail, Anti Double Counting Roster & Registration (8 Cols) */}
        {activeActivity ? (
          <div className="lg:col-span-8 space-y-4">
            {/* Activity Overview Header */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {activeActivity.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {activeActivity.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">
                    {activeProject?.title}
                  </span>
                  {isAdmin && (
                    <div className="flex items-center gap-1.5 ml-2">
                      <button
                        onClick={() => {
                          if (onOpenEditActivityModal && activeProject) {
                            onOpenEditActivityModal(activeActivity, activeProject.id, activeActivity.outputId);
                          }
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-200 transition"
                        title={isId ? 'Edit detail kegiatan ini' : 'Edit activity details'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{isId ? 'Edit' : 'Edit'}</span>
                      </button>
                      <button
                        onClick={() => {
                          const confirmMsg = isId 
                            ? `Apakah Anda yakin ingin menghapus kegiatan "${activeActivity.title}" beserta data presensinya?`
                            : `Are you sure you want to delete activity "${activeActivity.title}" and its attendances?`;
                          if (confirm(confirmMsg)) {
                            onDeleteActivity?.(activeProject.id, activeActivity.id);
                          }
                        }}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-1 border border-rose-200 transition"
                        title={isId ? 'Hapus kegiatan ini' : 'Delete activity'}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>{isId ? 'Hapus' : 'Delete'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-900">
                {activeActivity.title}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeActivity.description}
              </p>

              {/* Activity details row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">{isId ? 'Lokasi:' : 'Location:'}</span>
                  <span className="font-semibold text-slate-800">{activeActivity.location}, {activeActivity.regency}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">{isId ? 'Tanggal:' : 'Date:'}</span>
                  <span className="font-semibold text-slate-800">{activeActivity.startDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">{isId ? 'Penanggung Jawab (PIC):' : 'Lead Person (PIC):'}</span>
                  <span className="font-semibold text-slate-800">{activeActivity.leadPerson}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">{isId ? 'Anggaran Kegiatan:' : 'Allocated Budget:'}</span>
                  <span className="font-semibold text-slate-800">Rp {(activeActivity.budgetAllocated / 1000000).toFixed(1)} {isId ? 'Jt' : 'M'}</span>
                </div>
              </div>

              {/* Disaggregation quick badge strip */}
              {activityDisagg && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-semibold text-[11px]">{isId ? 'Disagregasi Peserta:' : 'Participant Disaggregation:'}</span>
                  <span className="px-2 py-0.5 rounded bg-pink-50 text-pink-700 border border-pink-200 text-[11px]">
                    ♀ {activityDisagg.genderBreakdown.perempuan} {isId ? 'Perempuan' : 'Female'} ({activityDisagg.genderBreakdown.percentPerempuan}%)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px]">
                    ♂ {activityDisagg.genderBreakdown.lakiLaki} {isId ? 'Laki-laki' : 'Male'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[11px]">
                    ♿ {activityDisagg.disabilityBreakdown.disabilityCount} {isId ? 'Disabilitas' : 'Disabilities'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px]">
                    🌿 {activityDisagg.iplcBreakdown.indigenousPeoples + activityDisagg.iplcBreakdown.localCommunities} IPLC
                  </span>
                </div>
              )}
            </div>

            {/* Participant Attendance Roster with Anti-Double Counting Notice */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    {isId ? `Daftar Presensi Partisipan (${currentParticipants.length} orang terdaftar)` : `Participant Attendance Roster (${currentParticipants.length} registered)`}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isId 
                      ? 'Sistem mendeteksi apakah penerima manfaat pernah mengikuti kegiatan proyek lainnya untuk mencegah double-counting.'
                      : 'The system automatically tracks prior participant engagements to prevent double-counting in project indicators.'}
                  </p>
                </div>
              </div>

              {/* Form Input Partisipan / Add Participant */}
              {isAdmin && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">
                    {isId ? '+ Input Partisipan ke Kegiatan Ini' : '+ Add Participant to This Activity'}
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {isId ? 'Pilih Penerima Manfaat dari Database:' : 'Select Beneficiary from Database:'}
                      </label>
                      <select
                        value={selectedBeneficiaryIdToAdd}
                        onChange={(e) => setSelectedBeneficiaryIdToAdd(e.target.value)}
                        className="w-full text-xs p-2 bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">{isId ? '-- Cari & Pilih Penerima Manfaat --' : '-- Search & Select Beneficiary --'}</option>
                        {beneficiaries.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.fullName} ({formatGender(b.gender, language)}, {b.age} {isId ? 'thn' : 'yo'}, {formatIplcStatus(b.iplcStatus, language)}) - NIK: {b.nikOrIdentifier}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {isId ? 'Peran dalam Kegiatan:' : 'Role in Activity:'}
                      </label>
                      <select
                        value={participantRoleInput}
                        onChange={(e) => setParticipantRoleInput(e.target.value)}
                        className="w-full text-xs p-2 bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Peserta">{isId ? 'Peserta' : 'Participant'}</option>
                        <option value="Narasumber">{isId ? 'Narasumber / Tetua Adat' : 'Resource Person / Elder'}</option>
                        <option value="Fasilitator">{isId ? 'Fasilitator' : 'Facilitator'}</option>
                        <option value="Penerima Bantuan Langsung">{isId ? 'Penerima Bantuan Langsung' : 'Direct Aid Recipient'}</option>
                        <option value="Relawan">{isId ? 'Relawan' : 'Volunteer'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Anti Double-Counting Alert Box for Preview Beneficiary */}
                  {previewBeneficiary && (
                    <div className={`p-3 rounded-lg border text-xs ${
                      previewPastAttendances.length > 0 
                        ? 'bg-amber-50/90 border-amber-300 text-amber-900' 
                        : 'bg-emerald-50/90 border-emerald-300 text-emerald-900'
                    }`}>
                      <div className="flex items-start gap-2">
                        {previewPastAttendances.length > 0 ? (
                          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-bold">
                            {previewPastAttendances.length > 0 ? (
                              isId 
                                ? `⚠️ Informasi Anti Double-Counting: ${previewBeneficiary.fullName} sebelumnya sudah tercatat di ${previewPastAttendances.length} kegiatan lain!`
                                : `⚠️ Anti Double-Counting Notice: ${previewBeneficiary.fullName} has already participated in ${previewPastAttendances.length} other activities!`
                            ) : (
                              isId 
                                ? `✅ Partisipan Baru: ${previewBeneficiary.fullName} baru pertama kali mengikuti kegiatan proyek.`
                                : `✅ New Direct Participant: ${previewBeneficiary.fullName} is attending project activities for the first time.`
                            )}
                          </p>
                          <p className="text-[11px] mt-0.5 opacity-90">
                            {previewPastAttendances.length > 0 ? (
                              isId 
                                ? 'Menambahkan partisipan ini akan menambah Partisipasi Kegiatan (+1) namun jumlah Penerima Manfaat Langsung Unik Portofolio TIDAK BERTAMBAH (Anti Double-Counting Terjaga).'
                                : 'Adding this participant increments Activity Participation count (+1) but Unique Direct Beneficiary count remains constant (Anti Double-Counting enforced).'
                            ) : (
                              isId 
                                ? 'Akan menambah Partisipasi Kegiatan (+1) dan menambah Penerima Manfaat Langsung Unik (+1).'
                                : 'Will increment both Activity Participation count (+1) and Unique Direct Beneficiaries count (+1).'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      placeholder={isId ? 'Catatan keikutsertaan / hasil verifikasi...' : 'Participation notes / verification details...'}
                      value={participantNotesInput}
                      onChange={(e) => setParticipantNotesInput(e.target.value)}
                      className="flex-1 text-xs p-2 bg-white rounded-lg border border-slate-300"
                    />

                    <button
                      onClick={handleAddParticipant}
                      disabled={!selectedBeneficiaryIdToAdd}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> {isId ? 'Simpan Presensi' : 'Save Attendance'}
                    </button>
                  </div>
                </div>
              )}

              {/* Participants Table */}
              {currentParticipants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <th className="py-2.5 px-3">{isId ? 'Nama & NIK' : 'Name & ID'}</th>
                        <th className="py-2.5 px-2">{isId ? 'Gender & Usia' : 'Gender & Age'}</th>
                        <th className="py-2.5 px-2">{isId ? 'Disabilitas' : 'Disability'}</th>
                        <th className="py-2.5 px-2">{isId ? 'Status IPLC' : 'IPLC Status'}</th>
                        <th className="py-2.5 px-2">{isId ? 'Frekuensi Partisipasi' : 'Participation Count'}</th>
                        <th className="py-2.5 px-3 text-right">{isId ? 'Aksi' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentParticipants.map(({ attendance, beneficiary, totalActivitiesAttended }) => {
                        if (!beneficiary) return null;

                        return (
                          <tr key={attendance.id} className="hover:bg-slate-50 transition">
                            <td className="py-2.5 px-3 font-medium text-slate-900">
                              <div className="font-bold">{beneficiary.fullName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">NIK: {beneficiary.nikOrIdentifier}</div>
                            </td>
                            <td className="py-2.5 px-2 text-slate-700">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                beneficiary.gender === 'Perempuan' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {formatGender(beneficiary.gender, language)}
                              </span>
                              <span className="ml-1 text-[11px] text-slate-500">
                                {beneficiary.age} {isId ? 'thn' : 'yo'} ({formatAgeGroup(beneficiary.ageGroup, language)})
                              </span>
                            </td>
                            <td className="py-2.5 px-2">
                              {beneficiary.hasDisability ? (
                                <div>
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800">
                                    ♿ {beneficiary.disabilityType}
                                  </span>
                                  {beneficiary.disabilityBarrierNotes && (
                                    <div className="text-[10px] text-slate-500 line-clamp-1" title={beneficiary.disabilityBarrierNotes}>
                                      {beneficiary.disabilityBarrierNotes}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[11px]">{isId ? 'Non-Disabilitas' : 'Non-Disability'}</span>
                              )}
                            </td>
                            <td className="py-2.5 px-2">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {formatIplcStatus(beneficiary.iplcStatus, language)}
                              </span>
                              {beneficiary.customIplcCommunityName && (
                                <div className="text-[10px] text-slate-500 font-medium">
                                  {beneficiary.customIplcCommunityName}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-2">
                              {totalActivitiesAttended > 1 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]" title={isId ? 'Partisipan ini sudah mengikuti beberapa kegiatan berbeda, dihitung 1 unik' : 'Attended multiple activities, counted once uniquely'}>
                                  {totalActivitiesAttended}x {isId ? 'Kegiatan (Multi)' : 'Activities (Multi)'}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                                  1x {isId ? 'Kegiatan (Tunggal)' : 'Activity (Single)'}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {isAdmin && (
                                <button
                                  onClick={() => onRemoveAttendance(attendance.id)}
                                  className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold"
                                  title={isId ? 'Hapus dari daftar hadir kegiatan ini' : 'Remove from attendance roster'}
                                >
                                  {isId ? 'Hapus' : 'Delete'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-xs">
                  {isId ? 'Belum ada presensi partisipan pada kegiatan ini.' : 'No participants registered for this activity yet.'}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            {isId ? 'Pilih kegiatan di sebelah kiri untuk melihat presensi partisipan.' : 'Select an activity on the left to view attendance roster.'}
          </div>
        )}
      </div>
    </div>
  );
}
