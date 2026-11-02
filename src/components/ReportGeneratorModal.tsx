import { useState, useMemo, ChangeEvent } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  TreePine, 
  Users, 
  ShieldCheck, 
  Layers, 
  FileSpreadsheet,
  Upload,
  Database
} from 'lucide-react';
import { Project, Beneficiary, ActivityAttendance } from '../types';
import { calculateDisaggregations, calculateLogframeProgress } from '../services/meEngine';
import { useLanguage } from '../context/LanguageContext';

interface ReportGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  beneficiaries: Beneficiary[];
  attendances: ActivityAttendance[];
  selectedProjectId: string;
  onRestoreBackup?: (backupData: any) => void;
}

export default function ReportGeneratorModal({
  isOpen,
  onClose,
  projects,
  beneficiaries,
  attendances,
  selectedProjectId,
  onRestoreBackup
}: ReportGeneratorModalProps) {
  const { language } = useLanguage();
  const isId = language === 'id';

  const [reportType, setReportType] = useState<'executive' | 'disaggregation' | 'logframe' | 'backup'>('executive');
  const [targetScope, setTargetScope] = useState<string>(selectedProjectId || 'all');

  const activeProject = projects.find(p => p.id === targetScope);
  const disaggSummary = useMemo(() => {
    return calculateDisaggregations(beneficiaries, attendances, targetScope);
  }, [beneficiaries, attendances, targetScope]);

  const logProgress = useMemo(() => {
    if (activeProject) return calculateLogframeProgress(activeProject);
    return null;
  }, [activeProject]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadBackup = () => {
    const backupData = {
      app: 'SIMEV_PROJECT_MNE',
      version: '2.6',
      exportedAt: new Date().toISOString(),
      projects,
      beneficiaries,
      attendances
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SIMEV_Backup_Data_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRestoreFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.projects && json.beneficiaries && json.attendances) {
          if (onRestoreBackup) {
            onRestoreBackup(json);
            alert(isId ? 'Data backup berhasil dipulihkan!' : 'Backup data successfully restored!');
            onClose();
          }
        } else {
          alert(isId ? 'Format file JSON tidak valid untuk aplikasi SIMEV.' : 'Invalid JSON file format for SIMEV.');
        }
      } catch (err) {
        alert(isId ? 'Gagal membaca file JSON backup.' : 'Failed to read JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 print:p-0 print:shadow-none print:max-w-none">
        
        {/* Header with Close and Print Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">
                {isId ? 'Pusat Laporan & Evaluasi Kinerja (M&E)' : 'M&E Performance Report & Evaluation Hub'}
              </h2>
              <p className="text-xs text-slate-500">
                {isId 
                  ? 'Generate ringkasan formal, tabel disagregasi GESI/IPLC, logframe, atau backup database.'
                  : 'Generate formal executive summaries, GESI/IPLC disaggregations, logframes, or database backups.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              {isId ? 'Cetak / Simpan PDF' : 'Print / Save as PDF'}
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 text-slate-500 hover:text-slate-700 text-xs font-medium"
            >
              {isId ? 'Tutup ✕' : 'Close ✕'}
            </button>
          </div>
        </div>

        {/* Tab selector for report views */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs font-semibold print:hidden">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setReportType('executive')}
              className={`px-3 py-1.5 rounded-lg transition ${
                reportType === 'executive' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isId ? 'Ringkasan Eksekutif M&E' : 'Executive M&E Summary'}
            </button>
            <button
              onClick={() => setReportType('disaggregation')}
              className={`px-3 py-1.5 rounded-lg transition ${
                reportType === 'disaggregation' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isId ? 'Tabel Disagregasi GESI & IPLC' : 'GESI & IPLC Disaggregations'}
            </button>
            <button
              onClick={() => setReportType('logframe')}
              className={`px-3 py-1.5 rounded-lg transition ${
                reportType === 'logframe' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isId ? 'Matriks Capaian Logframe' : 'Logframe Progress Matrix'}
            </button>
            <button
              onClick={() => setReportType('backup')}
              className={`px-3 py-1.5 rounded-lg transition ${
                reportType === 'backup' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isId ? 'Backup & Restore Data' : 'Backup & Restore Data'}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px]">{isId ? 'Lingkup:' : 'Scope:'}</span>
            <select
              value={targetScope}
              onChange={(e) => setTargetScope(e.target.value)}
              className="p-1 bg-white border border-slate-300 rounded text-xs"
            >
              <option value="all">🌐 {isId ? 'Seluruh Portofolio' : 'Entire Portfolio'}</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.code}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Printable Report Content Body */}
        <div className="space-y-6 text-slate-800 text-xs leading-relaxed max-h-[65vh] overflow-y-auto pr-1 print:max-h-none print:overflow-visible">
          
          {/* Official Letterhead Header */}
          <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block">
                {isId ? 'SISTEM MONITORING & EVALUASI PROYEK (SIMEV)' : 'PROJECT MONITORING & EVALUATION SYSTEM'}
              </span>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 uppercase">
                {isId ? 'LAPORAN KINERJA PROYEK & DISAGREGASI PENERIMA MANFAAT' : 'PROJECT PERFORMANCE & BENEFICIARY DISAGGREGATION REPORT'}
              </h1>
              <p className="text-[11px] text-slate-500">
                {targetScope === 'all' ? (isId ? 'Portofolio Agregat Nasional' : 'Aggregated National Portfolio') : `${activeProject?.code}: ${activeProject?.title}`}
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              <div>{isId ? 'Tanggal Cetak' : 'Print Date'}: <strong>{new Date().toLocaleDateString(isId ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
              <div className="text-emerald-700 font-semibold">{isId ? 'Status: Data Terverifikasi' : 'Status: Verified Data'}</div>
            </div>
          </div>

          {/* Tab 1: Executive Summary */}
          {reportType === 'executive' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <h3 className="font-bold text-emerald-950 text-sm mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  {isId ? 'Narasi Evaluasi Capaian Kinerja (M&E Analysis)' : 'Performance Evaluation Narrative (M&E Analysis)'}
                </h3>
                <p className="text-slate-700 text-xs">
                  {isId ? (
                    <>
                      Berdasarkan pemantauan periode berjalan, proyek telah menjangkau sebanyak{' '}
                      <strong className="text-slate-900">{disaggSummary.totalUniqueBeneficiaries} orang penerima manfaat unik langsung</strong>{' '}
                      yang terdeduplikasi ketat (Zero Double Counting) dari total {disaggSummary.totalGrossParticipation} kehadiran kegiatan. Keterlibatan perempuan mencapai{' '}
                      <strong className="text-slate-900">{disaggSummary.genderBreakdown.percentPerempuan}%</strong> ({disaggSummary.genderBreakdown.perempuan} orang) dan partisipasi penyandang disabilitas sebesar{' '}
                      <strong className="text-slate-900">{disaggSummary.disabilityBreakdown.percentDisability}%</strong> ({disaggSummary.disabilityBreakdown.disabilityCount} orang). Selain itu, keterwakilan Masyarakat Adat dan Komunitas Lokal (IPLC) mendominasi sebesar{' '}
                      <strong className="text-slate-900">{disaggSummary.iplcBreakdown.percentIplcTotal}%</strong> dari total penerima manfaat.
                    </>
                  ) : (
                    <>
                      During the current monitoring period, the project has engaged{' '}
                      <strong className="text-slate-900">{disaggSummary.totalUniqueBeneficiaries} unique direct beneficiaries</strong>{' '}
                      under strict deduplication (Zero Double Counting) across {disaggSummary.totalGrossParticipation} gross session participations. Female participation stands at{' '}
                      <strong className="text-slate-900">{disaggSummary.genderBreakdown.percentPerempuan}%</strong> ({disaggSummary.genderBreakdown.perempuan} individuals) with persons with disabilities representing{' '}
                      <strong className="text-slate-900">{disaggSummary.disabilityBreakdown.percentDisability}%</strong> ({disaggSummary.disabilityBreakdown.disabilityCount} individuals). Indigenous Peoples and Local Communities (IPLC) represent{' '}
                      <strong className="text-slate-900">{disaggSummary.iplcBreakdown.percentIplcTotal}%</strong> of total unique beneficiaries.
                    </>
                  )}
                </p>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">{isId ? 'Penerima Manfaat Unik' : 'Unique Beneficiaries'}</span>
                  <span className="text-xl font-bold text-slate-900">{disaggSummary.totalUniqueBeneficiaries}</span>
                  <span className="text-[10px] text-emerald-700 font-semibold block">{isId ? 'Net Langsung' : 'Net Direct'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">{isId ? 'Total Partisipasi' : 'Gross Participation'}</span>
                  <span className="text-xl font-bold text-slate-900">{disaggSummary.totalGrossParticipation}</span>
                  <span className="text-[10px] text-slate-500 block">{isId ? 'Kehadiran Sesi' : 'Session Attendance'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">{isId ? 'Proporsi Perempuan' : 'Female Proportion'}</span>
                  <span className="text-xl font-bold text-pink-600">{disaggSummary.genderBreakdown.percentPerempuan}%</span>
                  <span className="text-[10px] text-slate-500 block">{disaggSummary.genderBreakdown.perempuan} {isId ? 'Orang' : 'People'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">{isId ? 'Inklusi Disabilitas' : 'Disability Inclusion'}</span>
                  <span className="text-xl font-bold text-amber-600">{disaggSummary.disabilityBreakdown.percentDisability}%</span>
                  <span className="text-[10px] text-slate-500 block">{disaggSummary.disabilityBreakdown.disabilityCount} {isId ? 'Orang' : 'People'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Disaggregation Tables */}
          {reportType === 'disaggregation' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                {isId ? 'Matriks Disagregasi Lengkap (Zero Double Counting)' : 'Comprehensive Disaggregation Matrix (Zero Double Counting)'}
              </h3>

              {/* Table 1: Gender x Age Group */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-2.5">{isId ? 'Kelompok Usia' : 'Age Group'}</th>
                      <th className="p-2.5">{isId ? 'Laki-laki (Men)' : 'Male'}</th>
                      <th className="p-2.5">{isId ? 'Perempuan (Women)' : 'Female'}</th>
                      <th className="p-2.5 text-right">{isId ? 'Total Unik' : 'Unique Total'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2 font-medium">{isId ? '0 - 5 Tahun (Balita)' : '0 - 5 Years (Toddlers)'}</td>
                      <td className="p-2">
                        {beneficiaries.filter(b => b.ageGroup === '0-5' && b.gender === 'Laki-laki').length}
                      </td>
                      <td className="p-2">
                        {beneficiaries.filter(b => b.ageGroup === '0-5' && b.gender === 'Perempuan').length}
                      </td>
                      <td className="p-2 text-right font-bold">{disaggSummary.ageGroupBreakdown['0-5'] || 0}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">{isId ? '6 - 12 Tahun (Anak-anak)' : '6 - 12 Years (Children)'}</td>
                      <td className="p-2">
                        {beneficiaries.filter(b => b.ageGroup === '6-12' && b.gender === 'Laki-laki').length}
                      </td>
                      <td className="p-2">
                        {beneficiaries.filter(b => b.ageGroup === '6-12' && b.gender === 'Perempuan').length}
                      </td>
                      <td className="p-2 text-right font-bold">{disaggSummary.ageGroupBreakdown['6-12'] || 0}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">{isId ? '13 - 17 Tahun (Remaja)' : '13 - 17 Years (Adolescents)'}</td>
                      <td className="p-2">
                        {beneficiaries.filter(b => b.ageGroup === '13-17' && b.gender === 'Laki-laki').length}
                      </td>
                      <td className="p-2">
                        {beneficiaries.filter(b => b.ageGroup === '13-17' && b.gender === 'Perempuan').length}
                      </td>
                      <td className="p-2 text-right font-bold">{disaggSummary.ageGroupBreakdown['13-17'] || 0}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">{isId ? '18 - 24 Tahun (Pemuda / Youth)' : '18 - 24 Years (Youth)'}</td>
                      <td className="p-2">
                        {beneficiaries.filter(b => b.ageGroup === '18-24' && b.gender === 'Laki-laki').length}
                      </td>
                      <td className="p-2">
                        {beneficiaries.filter(b => b.ageGroup === '18-24' && b.gender === 'Perempuan').length}
                      </td>
                      <td className="p-2 text-right font-bold">{disaggSummary.ageGroupBreakdown['18-24'] || 0}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">{isId ? '25 - 40 Tahun (Dewasa Muda)' : '25 - 40 Years (Young Adults)'}</td>
                      <td className="p-2">
                        {beneficiaries.filter(b => b.ageGroup === '25-40' && b.gender === 'Laki-laki').length}
                      </td>
                      <td className="p-2">
                        {beneficiaries.filter(b => b.ageGroup === '25-40' && b.gender === 'Perempuan').length}
                      </td>
                      <td className="p-2 text-right font-bold">{disaggSummary.ageGroupBreakdown['25-40'] || 0}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">{isId ? '41 - 64 Tahun (Dewasa Madya)' : '41 - 64 Years (Middle-aged)'}</td>
                      <td className="p-2">
                        {beneficiaries.filter(b => b.ageGroup === '41-64' && b.gender === 'Laki-laki').length}
                      </td>
                      <td className="p-2">
                        {beneficiaries.filter(b => b.ageGroup === '41-64' && b.gender === 'Perempuan').length}
                      </td>
                      <td className="p-2 text-right font-bold">{disaggSummary.ageGroupBreakdown['41-64'] || 0}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">{isId ? '65+ Tahun (Lansia / Elderly)' : '65+ Years (Elderly)'}</td>
                      <td className="p-2">
                        {beneficiaries.filter(b => b.ageGroup === '65+' && b.gender === 'Laki-laki').length}
                      </td>
                      <td className="p-2">
                        {beneficiaries.filter(b => b.ageGroup === '65+' && b.gender === 'Perempuan').length}
                      </td>
                      <td className="p-2 text-right font-bold">{disaggSummary.ageGroupBreakdown['65+'] || 0}</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold">
                      <td className="p-2">{isId ? 'TOTAL PENERIMA MANFAAT' : 'TOTAL BENEFICIARIES'}</td>
                      <td className="p-2">{disaggSummary.genderBreakdown.lakiLaki} ({disaggSummary.genderBreakdown.percentLakiLaki}%)</td>
                      <td className="p-2">{disaggSummary.genderBreakdown.perempuan} ({disaggSummary.genderBreakdown.percentPerempuan}%)</td>
                      <td className="p-2 text-right text-emerald-700">{disaggSummary.totalUniqueBeneficiaries}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Table 2: Disability Barriers & IPLC Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-lg p-3">
                  <span className="font-bold text-slate-800 block mb-2">{isId ? 'Rincian Ragam Hambatan Disabilitas:' : 'Disability Barrier Categories:'}</span>
                  <div className="space-y-1 text-xs">
                    {Object.entries(disaggSummary.disabilityBreakdown.barriers).map(([type, cnt]) => (
                      <div key={type} className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-600">{type}</span>
                        <span className="font-bold text-slate-900">{cnt} {isId ? 'org' : 'ppl'}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-1 text-slate-400">
                      <span>{isId ? 'Non-Disabilitas:' : 'Non-Disability:'}</span>
                      <span>{disaggSummary.disabilityBreakdown.nonDisabilityCount} {isId ? 'org' : 'ppl'}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3">
                  <span className="font-bold text-slate-800 block mb-2">{isId ? 'Status IPLC (Masyarakat Adat & Komunitas Lokal):' : 'IPLC Status (Indigenous & Local Communities):'}</span>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">{isId ? 'Masyarakat Adat (IP):' : 'Indigenous Peoples (IP):'}</span>
                      <span className="font-bold text-emerald-700">{disaggSummary.iplcBreakdown.indigenousPeoples} {isId ? 'org' : 'ppl'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">{isId ? 'Komunitas Lokal (LC):' : 'Local Communities (LC):'}</span>
                      <span className="font-bold text-teal-700">{disaggSummary.iplcBreakdown.localCommunities} {isId ? 'org' : 'ppl'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">{isId ? 'Bukan IPLC:' : 'Non-IPLC:'}</span>
                      <span className="font-bold text-slate-700">{disaggSummary.iplcBreakdown.nonIplc} {isId ? 'org' : 'ppl'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table 3: Pembagian per Desa / Kelurahan Dampingan */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-800 text-xs">
                    🏡 {isId ? 'Pembagian Penerima Manfaat per Desa / Kelurahan Dampingan' : 'Beneficiary Distribution by Village / Sub-District'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {disaggSummary.villageBreakdown.length} {isId ? 'Desa Terdaftar' : 'Registered Villages'}
                  </span>
                </div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <th className="p-2">{isId ? 'Desa / Kelurahan' : 'Village / Sub-District'}</th>
                      <th className="p-2 text-center">{isId ? 'Total Unik' : 'Unique Total'}</th>
                      <th className="p-2 text-center">{isId ? 'Laki-laki' : 'Male'}</th>
                      <th className="p-2 text-center">{isId ? 'Perempuan' : 'Female'}</th>
                      <th className="p-2 text-center">{isId ? 'Disabilitas' : 'Disability'}</th>
                      <th className="p-2 text-center">IPLC</th>
                      <th className="p-2 text-right">{isId ? 'Kontribusi (%)' : 'Contribution (%)'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {disaggSummary.villageBreakdown.map(v => (
                      <tr key={v.village}>
                        <td className="p-2 font-medium text-slate-900">{v.village}</td>
                        <td className="p-2 text-center font-bold">{v.totalUnique}</td>
                        <td className="p-2 text-center text-blue-600">{v.lakiLaki}</td>
                        <td className="p-2 text-center text-pink-600">{v.perempuan}</td>
                        <td className="p-2 text-center">{v.disabilityCount > 0 ? `♿ ${v.disabilityCount}` : '-'}</td>
                        <td className="p-2 text-center">{v.iplcCount > 0 ? `🌿 ${v.iplcCount}` : '-'}</td>
                        <td className="p-2 text-right font-semibold text-emerald-700">{v.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Logframe Matrix */}
          {reportType === 'logframe' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                {isId ? 'Matriks Capaian Indikator Kerangka Logis (Logframe)' : 'Logical Framework Indicator Achievement Matrix'}
              </h3>
              
              {activeProject ? (
                <div className="space-y-3">
                  {/* Goal Indicators */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-900 text-white font-bold px-3 py-2 text-xs">
                      GOAL / IMPACT: {activeProject.goalStatement}
                    </div>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          <th className="p-2">{isId ? 'Kode & Indikator' : 'Code & Indicator'}</th>
                          <th className="p-2">Baseline</th>
                          <th className="p-2">Target</th>
                          <th className="p-2">{isId ? 'Capaian Aktual' : 'Actual Reached'}</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeProject.goalIndicators?.map(ind => (
                          <tr key={ind.id}>
                            <td className="p-2 font-medium">{ind.code}: {ind.name}</td>
                            <td className="p-2">{ind.baseline} {ind.unit}</td>
                            <td className="p-2">{ind.target} {ind.unit}</td>
                            <td className="p-2 font-bold text-emerald-700">{ind.actual} {ind.unit}</td>
                            <td className="p-2">{ind.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Outcomes */}
                  {activeProject.outcomes.map(oc => (
                    <div key={oc.id} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-indigo-900 text-white font-bold px-3 py-2 text-xs">
                        {oc.code}: {oc.title}
                      </div>
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                            <th className="p-2">{isId ? 'Kode & Indikator' : 'Code & Indicator'}</th>
                            <th className="p-2">Baseline</th>
                            <th className="p-2">Target</th>
                            <th className="p-2">{isId ? 'Capaian Aktual' : 'Actual Reached'}</th>
                            <th className="p-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {oc.indicators.map(ind => (
                            <tr key={ind.id}>
                              <td className="p-2 font-medium">{ind.code}: {ind.name}</td>
                              <td className="p-2">{ind.baseline} {ind.unit}</td>
                              <td className="p-2">{ind.target} {ind.unit}</td>
                              <td className="p-2 font-bold text-indigo-700">{ind.actual} {ind.unit}</td>
                              <td className="p-2">{ind.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400">
                  {isId ? 'Pilih satu proyek spesifik untuk melihat matriks logframe.' : 'Select a specific project to view logframe matrix.'}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Backup & Restore */}
          {reportType === 'backup' && (
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">
                  {isId ? 'Backup & Restore Database SIMEV M&E' : 'Backup & Restore SIMEV M&E Database'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isId 
                    ? 'Simpan cadangan data lengkap (proyek, logframe, penerima manfaat, dan presensi kegiatan) ke dalam berkas JSON atau pulihkan data dari file cadangan sebelumnya.'
                    : 'Save full data backup (projects, logframes, beneficiaries, and attendance logs) to JSON file or restore from a previous backup.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 text-xs block">
                    {isId ? '1. Ekspor Cadangan Data (JSON)' : '1. Export Data Backup (JSON)'}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    {isId 
                      ? `Menyimpan ${projects.length} proyek, ${beneficiaries.length} penerima manfaat, dan ${attendances.length} catatan kehadiran.`
                      : `Saves ${projects.length} projects, ${beneficiaries.length} beneficiaries, and ${attendances.length} attendance logs.`}
                  </p>
                  <button
                    onClick={handleDownloadBackup}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    {isId ? 'Download File Backup JSON' : 'Download Backup JSON File'}
                  </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 text-xs block">
                    {isId ? '2. Pulihkan / Restore Data' : '2. Restore Data from Backup'}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    {isId 
                      ? 'Unggah file backup JSON yang pernah diunduh sebelumnya.'
                      : 'Upload a previously downloaded JSON backup file.'}
                  </p>
                  <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer">
                    <Upload className="w-4 h-4" />
                    {isId ? 'Pilih File JSON' : 'Choose JSON File'}
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleRestoreFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Formal Signatures block for printing */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 text-center text-xs mt-8">
            <div>
              <p className="text-slate-500 mb-12">{isId ? 'Disusun Oleh:' : 'Prepared By:'}</p>
              <p className="font-bold text-slate-900">M&E Specialist</p>
              <p className="text-[10px] text-slate-400">{isId ? 'Tim Monitoring & Evaluasi' : 'M&E Team'}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-12">{isId ? 'Disetujui Oleh:' : 'Approved By:'}</p>
              <p className="font-bold text-slate-900">Project Manager / Team Leader</p>
              <p className="text-[10px] text-slate-400">{isId ? 'Pimpinan Program' : 'Program Leadership'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
