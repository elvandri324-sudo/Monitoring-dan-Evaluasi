import * as XLSX from 'xlsx';
import { 
  Beneficiary, 
  ActivityAttendance, 
  Project, 
  ReportItem, 
  DisaggregationSummary, 
  UserAccount, 
  ErrorReport,
  AccompaniedGroup 
} from '../types';

/**
 * Universal helper to trigger browser download of an XLSX workbook
 */
export function downloadWorkbook(workbook: XLSX.WorkBook, filename: string) {
  const cleanFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, cleanFilename, { bookType: 'xlsx', type: 'binary' });
}

/**
 * Export Beneficiaries Database to professional XLSX format
 */
export function exportBeneficiariesToXLSX(
  beneficiaries: Beneficiary[],
  projects: Project[] = [],
  filename: string = `Data_Penerima_Manfaat_${new Date().toISOString().slice(0, 10)}.xlsx`
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Master Beneficiaries
  const dataRows = beneficiaries.map((b, idx) => {
    return {
      'No': idx + 1,
      'ID Penerima Manfaat': b.id,
      'NIK / No. Identitas': b.nikOrIdentifier,
      'Nama Lengkap': b.fullName,
      'Target Group': b.targetGroup || 'Population of the project communities',
      'Level of Beneficiaries (Nama Wilayah / Lembaga)': b.levelName || b.village || '-',
      'Tingkat Wilayah Dampingan': b.beneficiaryLevel || 'Desa',
      'Instansi / Lembaga / OPD': b.institutionOrAgency || '-',
      'Jenis Kelamin': b.gender,
      'Rentang Usia': b.ageGroup || (b.age ? (b.age <= 5 ? '0-5' : b.age <= 12 ? '6-12' : b.age <= 17 ? '13-17' : b.age <= 24 ? '18-24' : b.age <= 40 ? '25-40' : b.age <= 64 ? '41-64' : '65+') : '25-40'),
      'Penyandang Disabilitas': b.hasDisability ? 'Ya (Disabilitas)' : 'Tidak (Non-Disabilitas)',
      'Ragam Hambatan Disabilitas': b.disabilityType || '-',
      'Tingkat Kesulitan': b.disabilityDifficultyLevel || '-',
      'Catatan Hambatan / Kebutuhan Akses': b.disabilityBarrierNotes || '-',
      'Status IPLC': b.iplcStatus,
      'Nama Komunitas Adat / Lokal': b.customIplcCommunityName || '-',
      'Desa / Kelurahan': b.village || '-',
      'Kabupaten / Kota': b.regency || '-',
      'Provinsi': b.province || '-',
      'Nomor HP / WhatsApp': b.phone || '-',
      'Pekerjaan / Mata Pencaharian': b.occupation || '-',
      'Tanggal Terdaftar': b.createdAt || '-'
    };
  });

  const ws = XLSX.utils.json_to_sheet(dataRows);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 18 }, // ID
    { wch: 22 }, // NIK
    { wch: 28 }, // Nama
    { wch: 36 }, // Target Group
    { wch: 30 }, // Level of Beneficiaries Name
    { wch: 24 }, // Tingkat Wilayah
    { wch: 28 }, // Instansi
    { wch: 15 }, // Gender
    { wch: 16 }, // Rentang Usia
    { wch: 22 }, // Disabilitas
    { wch: 28 }, // Ragam
    { wch: 26 }, // Tingkat Kesulitan
    { wch: 30 }, // Catatan
    { wch: 35 }, // IPLC
    { wch: 25 }, // Komunitas
    { wch: 20 }, // Desa
    { wch: 20 }, // Kabupaten
    { wch: 20 }, // Provinsi
    { wch: 18 }, // HP
    { wch: 24 }, // Pekerjaan
    { wch: 18 }  // Tanggal
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Penerima Manfaat');

  // Sheet 2: Ringkasan Agregasi Demografi & GESI
  const total = beneficiaries.length;
  const female = beneficiaries.filter(b => b.gender === 'Perempuan').length;
  const male = beneficiaries.filter(b => b.gender === 'Laki-laki').length;
  const pwd = beneficiaries.filter(b => b.hasDisability).length;
  const iplc = beneficiaries.filter(b => b.iplcStatus === 'Masyarakat Adat (Indigenous Peoples)' || b.iplcStatus === 'Komunitas Lokal (Local Communities)').length;

  const age0_5 = beneficiaries.filter(b => b.ageGroup === '0-5').length;
  const age6_12 = beneficiaries.filter(b => b.ageGroup === '6-12').length;
  const age13_17 = beneficiaries.filter(b => b.ageGroup === '13-17').length;
  const age18_24 = beneficiaries.filter(b => b.ageGroup === '18-24').length;
  const age25_40 = beneficiaries.filter(b => b.ageGroup === '25-40').length;
  const age41_64 = beneficiaries.filter(b => b.ageGroup === '41-64').length;
  const age65_plus = beneficiaries.filter(b => b.ageGroup === '65+').length;

  const summaryData = [
    { 'Parameter Demografi / GESI': 'Total Penerima Manfaat Terdaftar (Unik)', 'Jumlah (Jiwa)': total, 'Proporsi (%)': '100%' },
    { 'Parameter Demografi / GESI': 'Perempuan', 'Jumlah (Jiwa)': female, 'Proporsi (%)': total > 0 ? `${((female / total) * 100).toFixed(1)}%` : '0%' },
    { 'Parameter Demografi / GESI': 'Laki-laki', 'Jumlah (Jiwa)': male, 'Proporsi (%)': total > 0 ? `${((male / total) * 100).toFixed(1)}%` : '0%' },
    { 'Parameter Demografi / GESI': 'Penyandang Disabilitas (PwD)', 'Jumlah (Jiwa)': pwd, 'Proporsi (%)': total > 0 ? `${((pwd / total) * 100).toFixed(1)}%` : '0%' },
    { 'Parameter Demografi / GESI': 'Masyarakat Adat & Komunitas Lokal (IPLC)', 'Jumlah (Jiwa)': iplc, 'Proporsi (%)': total > 0 ? `${((iplc / total) * 100).toFixed(1)}%` : '0%' },
    { 'Parameter Demografi / GESI': '--- KELOMPOK RENTANG USIA ---', 'Jumlah (Jiwa)': '', 'Proporsi (%)': '' },
    { 'Parameter Demografi / GESI': 'Anak Balita (0-5 tahun)', 'Jumlah (Jiwa)': age0_5, 'Proporsi (%)': total > 0 ? `${((age0_5 / total) * 100).toFixed(1)}%` : '0%' },
    { 'Parameter Demografi / GESI': 'Anak-anak (6-12 tahun)', 'Jumlah (Jiwa)': age6_12, 'Proporsi (%)': total > 0 ? `${((age6_12 / total) * 100).toFixed(1)}%` : '0%' },
    { 'Parameter Demografi / GESI': 'Remaja Awal (13-17 tahun)', 'Jumlah (Jiwa)': age13_17, 'Proporsi (%)': total > 0 ? `${((age13_17 / total) * 100).toFixed(1)}%` : '0%' },
    { 'Parameter Demografi / GESI': 'Pemuda / Dewasa Muda (18-24 tahun)', 'Jumlah (Jiwa)': age18_24, 'Proporsi (%)': total > 0 ? `${((age18_24 / total) * 100).toFixed(1)}%` : '0%' },
    { 'Parameter Demografi / GESI': 'Dewasa Produktif (25-40 tahun)', 'Jumlah (Jiwa)': age25_40, 'Proporsi (%)': total > 0 ? `${((age25_40 / total) * 100).toFixed(1)}%` : '0%' },
    { 'Parameter Demografi / GESI': 'Dewasa Madya (41-64 tahun)', 'Jumlah (Jiwa)': age41_64, 'Proporsi (%)': total > 0 ? `${((age41_64 / total) * 100).toFixed(1)}%` : '0%' },
    { 'Parameter Demografi / GESI': 'Lansia (65+ tahun)', 'Jumlah (Jiwa)': age65_plus, 'Proporsi (%)': total > 0 ? `${((age65_plus / total) * 100).toFixed(1)}%` : '0%' }
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 45 }, { wch: 18 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan GESI');

  downloadWorkbook(wb, filename);
}

/**
 * Export Activity & Attendances Database to XLSX format
 */
export function exportActivityAttendanceToXLSX(
  projects: Project[],
  attendances: ActivityAttendance[],
  beneficiaries: Beneficiary[],
  filename: string = `Data_Kegiatan_dan_Presensi_${new Date().toISOString().slice(0, 10)}.xlsx`
) {
  const wb = XLSX.utils.book_new();
  const benMap = new Map(beneficiaries.map(b => [b.id, b]));

  // Sheet 1: Master Kegiatan
  const actRows: any[] = [];
  const actMap = new Map<string, { act: any; p: Project; op: any; oc: any }>();

  projects.forEach(p => {
    p.outcomes.forEach(oc => {
      oc.outputs.forEach(op => {
        op.activities.forEach(act => {
          actMap.set(act.id, { act, p, op, oc });
          const actAttendances = attendances.filter(a => a.activityId === act.id);
          const actBens = actAttendances.map(a => benMap.get(a.beneficiaryId)).filter(Boolean) as Beneficiary[];

          actRows.push({
            'ID Kegiatan': act.id,
            'Kode Kegiatan': act.code,
            'Nama Kegiatan': act.title,
            'Proyek': `[${p.code}] ${p.title}`,
            'Output Induk': `[${op.code}] ${op.title}`,
            'Outcome Induk': `[${oc.code}] ${oc.title}`,
            'Lokasi Pelaksanaan': act.location,
            'Kabupaten / Kota': act.regency || '-',
            'Provinsi': act.province || '-',
            'Tanggal Mulai': act.startDate,
            'Tanggal Selesai': act.endDate || act.startDate,
            'Penanggung Jawab': act.leadPerson || '-',
            'Status Pelaksanaan': act.status,
            'Alokasi Anggaran (IDR)': act.budgetAllocated,
            'Realisasi Anggaran (IDR)': act.budgetSpent,
            'Jumlah Peserta Hadir (Gross)': actAttendances.length,
            'Peserta Laki-laki': actBens.filter(b => b.gender === 'Laki-laki').length,
            'Peserta Perempuan': actBens.filter(b => b.gender === 'Perempuan').length,
            'Peserta Disabilitas': actBens.filter(b => b.hasDisability).length,
            'Peserta IPLC': actBens.filter(b => b.iplcStatus === 'Masyarakat Adat (Indigenous Peoples)' || b.iplcStatus === 'Komunitas Lokal (Local Communities)').length,
          });
        });
      });
    });
  });

  const wsAct = XLSX.utils.json_to_sheet(actRows);
  wsAct['!cols'] = [
    { wch: 16 }, { wch: 14 }, { wch: 35 }, { wch: 30 }, { wch: 30 }, { wch: 30 },
    { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 22 },
    { wch: 18 }, { wch: 22 }, { wch: 22 }, { wch: 15 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }
  ];
  XLSX.utils.book_append_sheet(wb, wsAct, 'Daftar Kegiatan');

  // Sheet 2: Presensi Peserta Lengkap
  const attRows = attendances.map((att, idx) => {
    const ben = benMap.get(att.beneficiaryId);
    const actInfo = actMap.get(att.activityId);

    return {
      'No': idx + 1,
      'ID Presensi': att.id,
      'ID Kegiatan': att.activityId,
      'Kode Kegiatan': actInfo ? actInfo.act.code : '-',
      'Nama Kegiatan': actInfo ? actInfo.act.title : '-',
      'NIK Peserta': ben?.nikOrIdentifier || '-',
      'Nama Lengkap Peserta': ben?.fullName || '-',
      'Jenis Kelamin': ben?.gender || '-',
      'Rentang Usia': ben?.ageGroup || '25-40',
      'Disabilitas': ben?.hasDisability ? 'Ya' : 'Tidak',
      'IPLC': ben?.iplcStatus || 'Bukan IPLC',
      'Desa / Kelurahan': ben?.village || '-',
      'Kabupaten / Kota': ben?.regency || '-',
      'Peran dalam Kegiatan': att.roleInActivity || 'Peserta',
      'Status Kehadiran': att.attendanceStatus,
      'Tanggal Kehadiran': att.attendanceDate,
      'Terverifikasi Oleh': att.verifiedBy || '-'
    };
  });

  const wsAtt = XLSX.utils.json_to_sheet(attRows);
  wsAtt['!cols'] = [
    { wch: 6 }, { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 32 },
    { wch: 22 }, { wch: 26 }, { wch: 14 }, { wch: 15 }, { wch: 12 }, { wch: 25 },
    { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, wsAtt, 'Daftar Presensi');

  downloadWorkbook(wb, filename);
}

/**
 * Export Logframe and Performance Indicators to XLSX
 */
export function exportLogframeToXLSX(
  projects: Project[],
  filename: string = `Data_Logframe_dan_Indikator_${new Date().toISOString().slice(0, 10)}.xlsx`
) {
  exportIndicatorAchievementsToXLSX({ projects, filename });
}

export interface IndicatorExportItem {
  id?: string;
  code: string;
  level: string;
  name: string;
  projectName?: string;
  parentContext?: string;
  definition?: string;
  baseline: number;
  target: number;
  actual: number;
  unit: string;
  status: string;
  meansOfVerification?: string;
  movDocuments?: any[];
  frequency?: string;
  lastUpdated?: string;
  progressHistory?: any[];
}

/**
 * Detailed export of Indicator Performance and Progress Achievements to XLSX
 */
export function exportIndicatorAchievementsToXLSX({
  projects,
  customIndicators,
  projectName,
  filename = `Capaian_Indikator_Kinerja_${new Date().toISOString().slice(0, 10)}.xlsx`
}: {
  projects?: Project[];
  customIndicators?: IndicatorExportItem[];
  projectName?: string;
  filename?: string;
}) {
  const wb = XLSX.utils.book_new();

  // Collect indicators
  const indicatorsList: IndicatorExportItem[] = [];

  if (customIndicators && customIndicators.length > 0) {
    indicatorsList.push(...customIndicators);
  } else if (projects && projects.length > 0) {
    projects.forEach(p => {
      // Goal Indicators
      p.goalIndicators?.forEach(ind => {
        indicatorsList.push({
          ...ind,
          level: 'Goal',
          projectName: p.title,
          parentContext: `Impact / Goal Statement: ${p.code} - ${p.goalStatement}`
        });
      });

      // Outcomes & Outputs & Activities
      p.outcomes.forEach(oc => {
        oc.indicators?.forEach(ind => {
          indicatorsList.push({
            ...ind,
            level: 'Outcome',
            projectName: p.title,
            parentContext: `Outcome: ${oc.code} - ${oc.title}`
          });
        });

        oc.outputs.forEach(op => {
          op.indicators?.forEach(ind => {
            indicatorsList.push({
              ...ind,
              level: 'Output',
              projectName: p.title,
              parentContext: `Output: ${op.code} - ${op.title}`
            });
          });

          op.activities.forEach(act => {
            act.indicators?.forEach(ind => {
              indicatorsList.push({
                ...ind,
                level: 'Activity',
                projectName: p.title,
                parentContext: `Kegiatan: ${act.code} - ${act.title}`
              });
            });
          });
        });
      });
    });
  }

  // --- SHEET 1: RINGKASAN CAPAIAN EKSEKUTIF ---
  const totalInds = indicatorsList.length;
  const goalCount = indicatorsList.filter(d => d.level === 'Goal' || d.level === 'Goal / Dampak').length;
  const outcomeCount = indicatorsList.filter(d => d.level === 'Outcome').length;
  const outputCount = indicatorsList.filter(d => d.level === 'Output').length;
  const activityCount = indicatorsList.filter(d => d.level === 'Activity').length;

  const achievedCount = indicatorsList.filter(d => {
    const pct = d.target > 0 ? (d.actual / d.target) * 100 : 0;
    return pct >= 100 || d.status === 'Tercapai' || d.status === 'Melampaui Target';
  }).length;

  const onTrackCount = indicatorsList.filter(d => {
    const pct = d.target > 0 ? (d.actual / d.target) * 100 : 0;
    return (pct >= 75 && pct < 100) || d.status === 'Sesuai Target (On-Track)';
  }).length;

  const delayedCount = indicatorsList.filter(d => {
    const pct = d.target > 0 ? (d.actual / d.target) * 100 : 0;
    return (pct < 75 && pct > 0) || d.status === 'Perlu Perhatian (Delayed)' || d.status === 'Tertunda';
  }).length;

  const notStartedCount = indicatorsList.filter(d => d.actual === 0 || d.status === 'Belum Dimulai').length;

  const avgProgress = totalInds > 0
    ? (indicatorsList.reduce((acc, curr) => acc + (curr.target > 0 ? (curr.actual / curr.target) * 100 : 0), 0) / totalInds).toFixed(1)
    : '0.0';

  const summaryRows = [
    { 'Parameter Evaluasi Capaian': 'Judul Dokumen / Proyek', 'Nilai / Statistik': projectName || 'Semua Proyek Aktif' },
    { 'Parameter Evaluasi Capaian': 'Tanggal Ekspor Data', 'Nilai / Statistik': new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
    { 'Parameter Evaluasi Capaian': 'Total Seluruh Indikator Terdaftar', 'Nilai / Statistik': totalInds },
    { 'Parameter Evaluasi Capaian': 'Rata-Rata Persentase Capaian (%)', 'Nilai / Statistik': `${avgProgress}%` },
    { 'Parameter Evaluasi Capaian': '---------------------------------------------------', 'Nilai / Statistik': '----------------------' },
    { 'Parameter Evaluasi Capaian': 'Status Capaian: Tercapai / Melampaui (100%+)', 'Nilai / Statistik': `${achievedCount} indikator (${totalInds > 0 ? ((achievedCount / totalInds) * 100).toFixed(1) : 0}%)` },
    { 'Parameter Evaluasi Capaian': 'Status Capaian: On-Track (75% - 99%)', 'Nilai / Statistik': `${onTrackCount} indikator (${totalInds > 0 ? ((onTrackCount / totalInds) * 100).toFixed(1) : 0}%)` },
    { 'Parameter Evaluasi Capaian': 'Status Capaian: Perlu Perhatian / Tertunda (<75%)', 'Nilai / Statistik': `${delayedCount} indikator (${totalInds > 0 ? ((delayedCount / totalInds) * 100).toFixed(1) : 0}%)` },
    { 'Parameter Evaluasi Capaian': 'Status Capaian: Belum Dimulai (0%)', 'Nilai / Statistik': `${notStartedCount} indikator (${totalInds > 0 ? ((notStartedCount / totalInds) * 100).toFixed(1) : 0}%)` },
    { 'Parameter Evaluasi Capaian': '---------------------------------------------------', 'Nilai / Statistik': '----------------------' },
    { 'Parameter Evaluasi Capaian': 'Distribusi Tingkat: Goal / Dampak (Impact)', 'Nilai / Statistik': `${goalCount} indikator` },
    { 'Parameter Evaluasi Capaian': 'Distribusi Tingkat: Outcome (Hasil Antara)', 'Nilai / Statistik': `${outcomeCount} indikator` },
    { 'Parameter Evaluasi Capaian': 'Distribusi Tingkat: Output (Keluaran Proyek)', 'Nilai / Statistik': `${outputCount} indikator` },
    { 'Parameter Evaluasi Capaian': 'Distribusi Tingkat: Activity (Tingkat Kegiatan)', 'Nilai / Statistik': `${activityCount} indikator` }
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 52 }, { wch: 38 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Capaian');

  // --- SHEET 2: MATRIKS CAPAIAN INDIKATOR LENGKAP ---
  const matrixRows = indicatorsList.map((ind, idx) => {
    const percent = ind.target > 0 ? Number(((ind.actual / ind.target) * 100).toFixed(1)) : 0;
    const gap = Number((ind.target - ind.actual).toFixed(1));
    const movDocsCount = ind.movDocuments ? ind.movDocuments.length : 0;

    return {
      'No': idx + 1,
      'Kode Indikator': ind.code,
      'Tingkat Level': ind.level,
      'Nama Indikator': ind.name,
      'Nama Proyek': ind.projectName || '-',
      'Konteks / Induk Elemen': ind.parentContext || '-',
      'Baseline': ind.baseline,
      'Target': ind.target,
      'Realisasi Aktual': ind.actual,
      'Capaian (%)': `${percent}%`,
      'Selisih / Gap': gap > 0 ? `Kurang ${gap}` : (gap < 0 ? `Melampaui ${Math.abs(gap)}` : 'Sesuai Target'),
      'Satuan Pengukuran': ind.unit,
      'Status Kemajuan': ind.status,
      'Frekuensi Pelaporan': ind.frequency || 'Semesteran',
      'Means of Verification (MoV)': ind.meansOfVerification || '-',
      'Jumlah Dokumen MoV': movDocsCount,
      'Definisi Operasional / Metodologi': ind.definition || '-',
      'Terakhir Diperbarui': ind.lastUpdated || '-'
    };
  });

  const wsMatrix = XLSX.utils.json_to_sheet(matrixRows);
  wsMatrix['!cols'] = [
    { wch: 6 },  // No
    { wch: 16 }, // Kode
    { wch: 14 }, // Level
    { wch: 42 }, // Nama
    { wch: 28 }, // Proyek
    { wch: 35 }, // Konteks
    { wch: 12 }, // Baseline
    { wch: 12 }, // Target
    { wch: 16 }, // Realisasi
    { wch: 14 }, // Capaian %
    { wch: 18 }, // Gap
    { wch: 18 }, // Satuan
    { wch: 24 }, // Status
    { wch: 20 }, // Frekuensi
    { wch: 32 }, // MoV
    { wch: 18 }, // Jumlah MoV
    { wch: 40 }, // Definisi
    { wch: 18 }  // Update
  ];
  XLSX.utils.book_append_sheet(wb, wsMatrix, 'Matriks Capaian Indikator');

  // --- SHEET 3: RIWAYAT PEMBARUAN BERKALA (PERIODIC UPDATES) ---
  const historyRows: any[] = [];
  indicatorsList.forEach(ind => {
    if (ind.progressHistory && ind.progressHistory.length > 0) {
      ind.progressHistory.forEach((hist: any, hIdx: number) => {
        historyRows.push({
          'Kode Indikator': ind.code,
          'Nama Indikator': ind.name,
          'Tingkat Level': ind.level,
          'Periode Pelaporan': hist.period || `Periode ${hIdx + 1}`,
          'Tanggal Catat': hist.date || hist.updatedAt || '-',
          'Nilai Capaian Periode Ini': hist.valueAdded || hist.periodActual || '-',
          'Capaian Kumulatif': hist.cumulativeActual ?? hist.actualValue ?? ind.actual,
          'Target Indikator': ind.target,
          'Satuan': ind.unit,
          'Dicatat Oleh': hist.recordedBy || hist.userName || 'Tim M&E',
          'Catatan / Analisis Progres': hist.notes || '-',
          'Jumlah Bukti MoV Dilampirkan': hist.movDocuments ? hist.movDocuments.length : 0
        });
      });
    }
  });

  if (historyRows.length > 0) {
    const wsHistory = XLSX.utils.json_to_sheet(historyRows);
    wsHistory['!cols'] = [
      { wch: 16 }, { wch: 36 }, { wch: 14 }, { wch: 22 }, { wch: 16 },
      { wch: 24 }, { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 20 },
      { wch: 40 }, { wch: 24 }
    ];
    XLSX.utils.book_append_sheet(wb, wsHistory, 'Riwayat Capaian Berkala');
  }

  downloadWorkbook(wb, filename);
}

/**
 * Export Project Reports List to XLSX
 */
export function exportReportsListToXLSX(
  reports: ReportItem[],
  projects: Project[] = [],
  filename: string = `Daftar_Laporan_Proyek_${new Date().toISOString().slice(0, 10)}.xlsx`
) {
  const wb = XLSX.utils.book_new();
  const projMap = new Map(projects.map(p => [p.id, p]));

  const rows = reports.map((r, idx) => {
    const proj = projMap.get(r.projectId);
    return {
      'No': idx + 1,
      'ID Laporan': r.id,
      'Judul Laporan': r.title,
      'Tipe Laporan': r.type,
      'Proyek': proj ? `[${proj.code}] ${proj.title}` : (r.projectId === 'all' ? 'Semua Proyek' : r.projectId),
      'Periode Pelaporan': r.period,
      'Tahun': r.year,
      'Batas Waktu Pengiriman': r.submissionDeadline,
      'Tanggal Diserahkan': r.submittedDate || '-',
      'Penyusun / Lead Person': r.authorOrLead,
      'Reviewer / Donor': r.reviewerOrDonor || '-',
      'Status Laporan': r.status,
      'Target Penerima (Jiwa)': r.targetBeneficiariesPeriod || 0,
      'Realisasi Penerima (Jiwa)': r.actualBeneficiariesPeriod || 0,
      'Realisasi Anggaran (IDR)': r.budgetSpentPeriod || 0,
      'Ringkasan Eksekutif': r.summaryHighlights,
      'Catatan Review': r.reviewNotes || '-',
      'Tanggal Dibuat': r.createdAt
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 }, { wch: 16 }, { wch: 35 }, { wch: 18 }, { wch: 30 },
    { wch: 22 }, { wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 22 },
    { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 22 },
    { wch: 40 }, { wch: 30 }, { wch: 18 }
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan Proyek');

  downloadWorkbook(wb, filename);
}

/**
 * Export User Accounts Database to XLSX
 */
export function exportUsersToXLSX(
  users: UserAccount[],
  projectsOrFilename?: Project[] | string,
  filenameParam?: string
) {
  const wb = XLSX.utils.book_new();
  const projects: Project[] = Array.isArray(projectsOrFilename) ? projectsOrFilename : [];
  const filename = typeof projectsOrFilename === 'string' 
    ? projectsOrFilename 
    : (filenameParam || `Daftar_Pengguna_M&E_${new Date().toISOString().slice(0, 10)}.xlsx`);

  const projMap = new Map(projects.map(p => [p.id, p]));

  const rows = users.map((u, idx) => {
    let projectAccessText = 'Semua Proyek (Global)';
    if (!u.assignedProjectIds.includes('all')) {
      projectAccessText = u.assignedProjectIds
        .map(id => projMap.get(id)?.title || id)
        .join(', ') || 'Belum Ditugaskan';
    }

    return {
      'No': idx + 1,
      'ID User': u.id,
      'Username': u.username,
      'Nama Lengkap': u.fullName,
      'Email': u.email,
      'Role / Peran': u.role,
      'Status Akun': u.status,
      'Nomor Telepon': u.phone || '-',
      'Akses Proyek': projectAccessText,
      'Tanggal Dibuat': u.createdAt,
      'Login Terakhir': u.lastLogin || 'Belum Pernah'
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 }, { wch: 14 }, { wch: 18 }, { wch: 28 }, { wch: 28 },
    { wch: 20 }, { wch: 14 }, { wch: 18 }, { wch: 35 }, { wch: 18 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Pengguna Sistem');

  downloadWorkbook(wb, filename);
}

/**
 * Export Error Reports & Issues to XLSX
 */
export function exportErrorReportsToXLSX(
  reports: ErrorReport[],
  filename: string = `Laporan_Error_SIMEV_${new Date().toISOString().slice(0, 10)}.xlsx`
) {
  const wb = XLSX.utils.book_new();

  const rows = reports.map((r, idx) => {
    return {
      'No': idx + 1,
      'ID Tiket': r.id,
      'Judul Kendala / Error': r.title,
      'Modul Sistem': r.module,
      'Tingkat Keparahan': r.severity,
      'Status Tiket': r.status,
      'Nama Pelapor': r.reportedBy,
      'Email Pelapor': r.reporterEmail || '-',
      'Deskripsi Kendala': r.description,
      'Langkah Reproduksi Error': r.stepsToReproduce || '-',
      'Perilaku yang Diharapkan': r.expectedBehavior || '-',
      'Perilaku Aktual yang Terjadi': r.actualBehavior || '-',
      'Informasi Sistem / Perangkat': r.systemInfo || '-',
      'Catatan Solusi / Penyelesaian': r.resolutionNotes || '-',
      'Tanggal Dilaporkan': r.createdAt,
      'Tanggal Diselesaikan': r.resolvedAt || '-'
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 }, { wch: 14 }, { wch: 35 }, { wch: 24 }, { wch: 18 },
    { wch: 18 }, { wch: 22 }, { wch: 25 }, { wch: 40 }, { wch: 35 },
    { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 35 }, { wch: 18 }, { wch: 18 }
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan Kendala Error');

  downloadWorkbook(wb, filename);
}

/**
 * Export Accompanied Community Groups & Detailed Member Rosters to XLSX
 */
export function exportAccompaniedGroupsToXLSX(
  groups: AccompaniedGroup[],
  beneficiaries: Beneficiary[] = [],
  projects: Project[] = [],
  filename: string = `Data_Kelompok_Dampingan_${new Date().toISOString().slice(0, 10)}.xlsx`
) {
  const wb = XLSX.utils.book_new();

  const benMap = new Map<string, Beneficiary>();
  beneficiaries.forEach(b => benMap.set(b.id, b));

  const projMap = new Map<string, Project>();
  projects.forEach(p => projMap.set(p.id, p));

  // Sheet 1: Master Daftar Kelompok
  const groupRows = groups.map((g, idx) => {
    const proj = projMap.get(g.projectId);
    const members = g.members.map(m => benMap.get(m.beneficiaryId));
    const womenCount = members.filter(b => b?.gender === 'Perempuan').length;
    const disCount = members.filter(b => b?.hasDisability).length;
    const iplcCount = members.filter(b => b?.iplcStatus && b.iplcStatus !== 'Bukan IPLC (Non-IPLC)').length;

    return {
      'No': idx + 1,
      'Kode Kelompok': g.code,
      'Nama Kelompok': g.name,
      'Jenis Kelompok': g.type,
      'Proyek Terkait': proj ? `[${proj.code}] ${proj.title}` : (g.projectId === 'all' ? 'Semua Proyek' : g.projectId),
      'Desa / Kelurahan': g.village,
      'Kecamatan': g.district || '-',
      'Kabupaten / Kota': g.regency,
      'Provinsi': g.province,
      'Status Legalitas': g.legalStatus || '-',
      'Nomor SK / Izin': g.legalDocumentNumber || '-',
      'Tanggal Pembentukan': g.establishmentDate || '-',
      'Nama Ketua': g.leaderName || '-',
      'No HP / WhatsApp': g.leaderPhone || '-',
      'Fokus Dampingan': g.focusArea || '-',
      'Status Kelompok': g.status,
      'Total Anggota': g.members.length,
      'Jumlah Perempuan': womenCount,
      'Jumlah Disabilitas': disCount,
      'Jumlah IPLC': iplcCount,
      'Catatan': g.notes || '-'
    };
  });

  const ws1 = XLSX.utils.json_to_sheet(groupRows);
  ws1['!cols'] = [
    { wch: 6 }, { wch: 16 }, { wch: 35 }, { wch: 28 }, { wch: 30 },
    { wch: 18 }, { wch: 18 }, { wch: 22 }, { wch: 20 }, { wch: 22 },
    { wch: 28 }, { wch: 16 }, { wch: 24 }, { wch: 18 }, { wch: 40 },
    { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 35 }
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'Master Kelompok');

  // Sheet 2: Seluruh Anggota Terinci
  const memberRows: any[] = [];
  let memberNo = 1;

  groups.forEach(g => {
    g.members.forEach(m => {
      const ben = benMap.get(m.beneficiaryId);
      memberRows.push({
        'No': memberNo++,
        'Kode Kelompok': g.code,
        'Nama Kelompok': g.name,
        'Jenis Kelompok': g.type,
        'Desa Kelompok': g.village,
        'Peran dalam Kelompok': m.roleInGroup,
        'ID Penerima Manfaat': m.beneficiaryId,
        'NIK / Identitas': ben ? ben.nikOrIdentifier : '-',
        'Nama Anggota': ben ? ben.fullName : '(Data Belum Terdaftar)',
        'Jenis Kelamin': ben ? ben.gender : '-',
        'Usia': ben ? ben.age : '-',
        'Rentang Usia': ben ? ben.ageGroup : '-',
        'Penyandang Disabilitas': ben ? (ben.hasDisability ? `Ya (${ben.disabilityType || 'Disabilitas'})` : 'Tidak') : '-',
        'Status IPLC': ben ? ben.iplcStatus : '-',
        'Masyarakat Adat / Suku': ben ? (ben.customIplcCommunityName || '-') : '-',
        'Desa Domisili': ben ? ben.village : '-',
        'Pekerjaan': ben ? (ben.occupation || '-') : '-',
        'No HP': ben ? (ben.phone || '-') : '-',
        'Tanggal Bergabung': m.joinedDate || '-',
        'Catatan Anggota': m.notes || '-'
      });
    });
  });

  const ws2 = XLSX.utils.json_to_sheet(memberRows);
  ws2['!cols'] = [
    { wch: 6 }, { wch: 16 }, { wch: 35 }, { wch: 28 }, { wch: 18 },
    { wch: 22 }, { wch: 16 }, { wch: 20 }, { wch: 28 }, { wch: 14 },
    { wch: 8 }, { wch: 12 }, { wch: 24 }, { wch: 25 }, { wch: 25 },
    { wch: 18 }, { wch: 24 }, { wch: 16 }, { wch: 16 }, { wch: 30 }
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'Daftar Anggota Kelompok');

  downloadWorkbook(wb, filename);
}

