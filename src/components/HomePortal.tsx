import { 
  BarChart3, 
  ShieldCheck, 
  Users, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  TreePine, 
  Wheat, 
  Sparkles, 
  MapPin, 
  Target, 
  Calendar, 
  TrendingUp, 
  HelpCircle,
  Award,
  Filter,
  Trash2
} from 'lucide-react';
import { Project, Beneficiary, ActivityAttendance } from '../types';
import { calculateDisaggregations, calculateLogframeProgress } from '../services/meEngine';
import { useLanguage } from '../context/LanguageContext';
import { formatGender, formatStatusProgress } from '../utils/bilingual';

interface HomePortalProps {
  projects: Project[];
  beneficiaries: Beneficiary[];
  attendances: ActivityAttendance[];
  onNavigate: (tab: 'home' | 'dashboard' | 'logframe' | 'activities' | 'beneficiaries' | 'team') => void;
  onSelectProject: (projectId: string) => void;
  onOpenReportModal: () => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  onDeleteProject?: (projectId: string) => void;
}

export default function HomePortal({
  projects,
  beneficiaries,
  attendances,
  onNavigate,
  onSelectProject,
  onOpenReportModal,
  isAdmin,
  setIsAdmin,
  onDeleteProject
}: HomePortalProps) {
  const { language } = useLanguage();
  const isId = language === 'id';
  const globalDisagg = calculateDisaggregations(beneficiaries, attendances, 'all');

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner with Executive Overview */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-10 border border-slate-700/60 shadow-xl">
        <div className="absolute -right-16 -bottom-16 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -top-20 w-80 h-80 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            {isId 
              ? 'Sistem Informasi Monitoring & Evaluasi Proyek Terintegrasi'
              : 'Integrated Project Monitoring & Evaluation Information System'}
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3 leading-tight">
            {isId
              ? 'M&E Dashboard & Logframe Management Berbasis Inklusi & Anti Double-Counting'
              : 'M&E Dashboard & Logframe Management with Inclusion & Anti Double-Counting'}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 max-w-3xl">
            {isId
              ? 'Sistem pelaporan kinerja proyek pembangunan berkelanjutan dengan pelacakan hierarki kerangka logis (Goal, Outcome, Output, Activity), penghitungan akurat penerima manfaat terdeduplikasi (Zero Double Counting), serta disagregasi komprehensif GESI (Gender, Usia 0-14, 15-24, 25-64, 65+, Ragam Hambatan Disabilitas) dan Status Masyarakat Adat & Komunitas Lokal (IPLC).'
              : 'Performance reporting system for sustainable development projects featuring logical framework hierarchy tracking (Goal, Outcome, Output, Activity), accurate deduplicated beneficiary calculation (Zero Double-Counting), and comprehensive GESI disaggregations (Gender, Age 0-14, 15-24, 25-64, 65+, Disability Types) & IPLC Status.'}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              id="hero-go-dashboard-btn"
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm shadow-lg shadow-emerald-900/40 transition hover:translate-y-[-1px]"
            >
              <BarChart3 className="w-4 h-4" />
              {isId ? 'Buka Dashboard Analitik' : 'Open Analytics Dashboard'}
            </button>

            <button
              id="hero-go-logframe-btn"
              onClick={() => onNavigate('logframe')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-medium text-sm border border-slate-600 transition"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              {isId ? 'Kelola Logframe & Indikator' : 'Manage Logframe & Indicators'}
            </button>

            <button
              id="hero-go-beneficiaries-btn"
              onClick={() => onNavigate('beneficiaries')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-medium text-sm border border-slate-600 transition"
            >
              <Users className="w-4 h-4 text-teal-400" />
              {isId ? 'Database Penerima Manfaat' : 'Beneficiary Database'}
            </button>
          </div>
        </div>
      </section>

      {/* Core KPI Cards with Anti Double-Counting Highlights */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Direct Unique Beneficiaries */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isId ? 'Penerima Manfaat Unik' : 'Unique Beneficiaries'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {globalDisagg.totalUniqueBeneficiaries.toLocaleString(isId ? 'id-ID' : 'en-US')}
            </span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Zero Double-Counting
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {isId ? (
              <>
                Deduplikasi dari total <strong>{globalDisagg.totalGrossParticipation}</strong> partisipasi kegiatan (
                <span className="text-indigo-600 font-medium">{globalDisagg.repeatedParticipantsCount}</span> partisipan multi-kegiatan)
              </>
            ) : (
              <>
                Deduplicated from <strong>{globalDisagg.totalGrossParticipation}</strong> gross participations (
                <span className="text-indigo-600 font-medium">{globalDisagg.repeatedParticipantsCount}</span> multi-activity attendees)
              </>
            )}
          </p>
        </div>

        {/* Metric 2: GESI Gender Disaggregation */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isId ? 'Disagregasi Gender' : 'Gender Disaggregation'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between text-slate-900 font-bold text-xl mb-1.5">
            <div className="flex items-center gap-1.5 text-pink-600">
              <span>♀ {globalDisagg.genderBreakdown.percentPerempuan}%</span>
              <span className="text-xs font-normal text-slate-500">
                ({globalDisagg.genderBreakdown.perempuan} {isId ? 'org' : 'ppl'})
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-600">
              <span>♂ {globalDisagg.genderBreakdown.percentLakiLaki}%</span>
              <span className="text-xs font-normal text-slate-500">
                ({globalDisagg.genderBreakdown.lakiLaki} {isId ? 'org' : 'ppl'})
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
            <div 
              className="bg-pink-500 h-full" 
              style={{ width: `${globalDisagg.genderBreakdown.percentPerempuan}%` }}
              title={`${isId ? 'Perempuan' : 'Female'}: ${globalDisagg.genderBreakdown.percentPerempuan}%`}
            ></div>
            <div 
              className="bg-blue-500 h-full" 
              style={{ width: `${globalDisagg.genderBreakdown.percentLakiLaki}%` }}
              title={`${isId ? 'Laki-laki' : 'Male'}: ${globalDisagg.genderBreakdown.percentLakiLaki}%`}
            ></div>
          </div>
        </div>

        {/* Metric 3: Disability Inclusivity & Barriers */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isId ? 'Inklusi Disabilitas' : 'Disability Inclusion'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {globalDisagg.disabilityBreakdown.disabilityCount}
            </span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              {globalDisagg.disabilityBreakdown.percentDisability}% {isId ? 'Partisipan' : 'Participants'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 truncate">
            {Object.keys(globalDisagg.disabilityBreakdown.barriers).length} {isId ? 'Ragam Hambatan (Fisik, Netra, Rungu, dll.)' : 'Barrier Types (Physical, Visual, Hearing, etc.)'}
          </p>
        </div>

        {/* Metric 4: IPLC Reach */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isId ? 'Cakupan IPLC (Masyarakat Adat)' : 'IPLC Outreach (Indigenous)'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <TreePine className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {globalDisagg.iplcBreakdown.indigenousPeoples + globalDisagg.iplcBreakdown.localCommunities}
            </span>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
              {globalDisagg.iplcBreakdown.percentIplcTotal}% {isId ? 'Komunitas' : 'Communities'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 truncate">
            {globalDisagg.iplcBreakdown.indigenousPeoples} {isId ? 'Masyarakat Adat' : 'Indigenous Peoples'} & {globalDisagg.iplcBreakdown.localCommunities} {isId ? 'Komunitas Lokal' : 'Local Communities'}
          </p>
        </div>
      </section>

      {/* Methodology & Standards Highlight Box */}
      <section className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-6 text-slate-800">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">
              {isId 
                ? 'Mekanisme Standar M&E: Anti Double-Counting & Disagregasi Lengkap'
                : 'M&E Standard Framework: Anti Double-Counting & Comprehensive Disaggregation'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700 pt-1">
              <div className="bg-white p-3 rounded-lg border border-emerald-100">
                <span className="font-semibold text-emerald-800 block mb-1">
                  1. {isId ? 'Anti Double-Counting Otomatis' : 'Automated Zero Double-Counting'}
                </span>
                {isId
                  ? 'Penerima manfaat dihitung secara unik (Net Unique Beneficiaries) berdasarkan NIK / ID Unik. Jika seseorang mengikuti 5 pelatihan berbeda, ia tercatat sebagai 5x partisipasi kotor, namun tetap dihitung tepat 1 penerima manfaat langsung.'
                  : 'Beneficiaries are uniquely calculated (Net Unique Beneficiaries) via Unique ID / NIK. Even if a participant attends 5 distinct workshops, they represent 5 gross participations but exactly 1 direct unique beneficiary.'}
              </div>
              <div className="bg-white p-3 rounded-lg border border-emerald-100">
                <span className="font-semibold text-emerald-800 block mb-1">
                  2. {isId ? '4 Kelompok Usia Standar' : '4 Standard Age Brackets'}
                </span>
                {isId ? 'Disagregasi usia secara ketat dikelompokkan ke dalam:' : 'Age disaggregation is strictly organized into:'}
                <div className="mt-1 flex flex-wrap gap-1 font-medium text-[11px]">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded">{isId ? '0-14 (Anak)' : '0-14 (Children)'}</span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded">{isId ? '15-24 (Pemuda)' : '15-24 (Youth)'}</span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded">{isId ? '25-64 (Dewasa)' : '25-64 (Adults)'}</span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded">{isId ? '65+ (Lansia)' : '65+ (Elderly)'}</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-emerald-100">
                <span className="font-semibold text-emerald-800 block mb-1">
                  3. {isId ? 'Ragam Hambatan Disabilitas & IPLC' : 'Disability Barriers & IPLC Status'}
                </span>
                {isId
                  ? 'Pencatatan hambatan spesifik (Fisik, Netra, Rungu, Wicara, Intelektual/Psikososial) serta status hukum adat (Masyarakat Adat / Komunitas Lokal) beserta nama komunitas adat terkait.'
                  : 'Detailed recording of specific barriers (Physical, Visual, Hearing, Speech, Psychosocial) alongside legal indigenous status (Indigenous Peoples / Local Communities) and community names.'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isId ? 'Daftar Proyek Aktif' : 'Active Projects List'}
            </h2>
            <p className="text-xs text-slate-500">
              {isId 
                ? 'Pilih proyek untuk melihat rincian logframe, indikator capaian, dan presensi kegiatan'
                : 'Select a project to inspect logframe hierarchy, indicator results, and activity attendances'}
            </p>
          </div>
          <button
            id="view-all-projects-btn"
            onClick={() => onNavigate('team')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            {isId ? 'Lihat Manajemen Proyek & Tim' : 'View Projects & Team Management'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map(project => {
            const logProgress = calculateLogframeProgress(project);
            const projDisagg = calculateDisaggregations(beneficiaries, attendances, project.id);

            return (
              <div 
                key={project.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-emerald-400 p-5 shadow-sm hover:shadow-md transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {project.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                      {project.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition line-clamp-2 mb-2">
                    {project.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                    {project.goalStatement}
                  </p>

                  {/* Project metadata pills */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4 bg-slate-50 p-2.5 rounded-lg">
                    <div>
                      <span className="text-[10px] text-slate-400 block">{isId ? 'Donor / Pendana:' : 'Donor / Funder:'}</span>
                      <span className="font-medium text-slate-800 truncate block">{project.donor}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">{isId ? 'Lokasi:' : 'Location:'}</span>
                      <span className="font-medium text-slate-800 truncate block">{project.province}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">{isId ? 'Anggaran Proyek:' : 'Project Budget:'}</span>
                      <span className="font-medium text-slate-800 truncate block">
                        Rp {(project.budgetTotal / 1000000000).toFixed(2)} {isId ? 'Miliar' : 'Billion'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">{isId ? 'Tim Pelaksana:' : 'Implementation Team:'}</span>
                      <span className="font-medium text-slate-800 truncate block">
                        {project.teamMembers.length} {isId ? 'Personil' : 'Personnel'}
                      </span>
                    </div>
                  </div>

                  {/* Logframe progress bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">{isId ? 'Capaian Logframe & Indikator' : 'Logframe & Indicator Achievement'}</span>
                      <span className="text-emerald-700">{logProgress.averageAchievement}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, logProgress.averageAchievement)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>{logProgress.achievedCount} {isId ? 'Tercapai' : 'Achieved'}</span>
                      <span>{logProgress.onTrackCount} {isId ? 'Sesuai Target' : 'On-Track'}</span>
                      <span>{logProgress.delayedCount} {isId ? 'Perlu Perhatian' : 'Needs Attention'}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom stats & action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-600">
                    <strong>{projDisagg.totalUniqueBeneficiaries}</strong> {isId ? 'Penerima Manfaat' : 'Beneficiaries'} ({projDisagg.genderBreakdown.percentPerempuan}% {isId ? 'Perempuan' : 'Female'}, {projDisagg.disabilityBreakdown.percentDisability}% {isId ? 'Disabilitas' : 'Disability'})
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject?.(project.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                        title={`${isId ? 'Hapus proyek' : 'Delete project'} ${project.code}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onSelectProject(project.id);
                        onNavigate('dashboard');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition shadow-sm"
                    >
                      {isId ? 'Buka Detail' : 'View Details'} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Action Navigation Grid */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          {isId ? 'Modul Sistem M&E Utama' : 'Core M&E System Modules'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => onNavigate('dashboard')}
            className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-200 cursor-pointer transition"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              {isId ? 'Dashboard Analitik' : 'Analytics Dashboard'}
            </h4>
            <p className="text-xs text-slate-600">
              {isId 
                ? 'Grafik interaktif disagregasi gender, piramida usia, IPLC, ragam hambatan disabilitas, dan tren.'
                : 'Interactive charts for gender breakdown, age pyramid, IPLC status, disability types, and trends.'}
            </p>
          </div>

          <div 
            onClick={() => onNavigate('logframe')}
            className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 cursor-pointer transition"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              {isId ? 'Logframe & Indikator' : 'Logframe & Indicators'}
            </h4>
            <p className="text-xs text-slate-600">
              {isId
                ? 'Manajemen hierarki Goal, Outcome, Output, Activity, Baseline, Target, dan update capaian aktual.'
                : 'Management of Goal, Outcome, Output, Activity hierarchy, baseline, targets, and periodic actuals.'}
            </p>
          </div>

          <div 
            onClick={() => onNavigate('activities')}
            className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-amber-50/50 hover:border-amber-200 cursor-pointer transition"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              {isId ? 'Kegiatan & Presensi' : 'Activities & Attendance'}
            </h4>
            <p className="text-xs text-slate-600">
              {isId
                ? 'Pencatatan sesi pelatihan, musyawarah, dan registrasi partisipan dengan deteksi double counting.'
                : 'Training sessions logging, workshops, and participant attendance with double-counting detection.'}
            </p>
          </div>

          <div 
            onClick={() => onNavigate('beneficiaries')}
            className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-purple-50/50 hover:border-purple-200 cursor-pointer transition"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              {isId ? 'Data Penerima Manfaat' : 'Beneficiary Database'}
            </h4>
            <p className="text-xs text-slate-600">
              {isId
                ? 'Master data individu terverifikasi NIK, status GESI, komunitas adat, riwayat keikutsertaan & ekspor.'
                : 'Master verified individual database with ID/NIK, GESI status, indigenous community, history & export.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
