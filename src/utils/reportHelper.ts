import { ReportItem, Project } from '../types';

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Downloads a report file:
 * - If fileData (Base64 / data URL) is present, triggers direct browser download of the real file
 * - If fileUrl (cloud link) is present without binary, opens the external cloud URL
 * - If neither is present, generates an official M&E Project Executive Report summary document (.txt / formatted document)
 */
export function downloadReportDocument(report: ReportItem, project?: Project): { success: boolean; message: string } {
  try {
    // 1. Direct download of uploaded binary file (Base64 data URL)
    if (report.fileData) {
      const link = document.createElement('a');
      link.href = report.fileData;
      link.download = report.fileName || `${report.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true, message: `Mengunduh berkas laporan: ${report.fileName || report.title}` };
    }

    // 2. Open cloud storage if it's a cloud link
    if (report.fileUrl && !report.fileName?.endsWith('.pdf') && !report.fileName?.endsWith('.docx')) {
      window.open(report.fileUrl, '_blank', 'noopener,noreferrer');
      return { success: true, message: `Membuka tautan cloud dokumen: ${report.title}` };
    }

    // 3. Fallback: Generate an official formatted M&E Report summary document
    const separator = '='.repeat(80);
    const subSeparator = '-'.repeat(80);
    const dateStr = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const keyAchievementsText = report.keyAchievements && report.keyAchievements.length > 0
      ? report.keyAchievements.map((ach, i) => `   ${i + 1}. ${ach}`).join('\r\n')
      : '   - Tidak ada catatan capaian khusus yang dicantumkan.';

    const content = [
      separator,
      'SISTEM INFORMASI MONITORING & EVALUASI (SIMEV)',
      'DOKUMEN RESMI LAPORAN PROYEK & CAPAIAN PROGRAM',
      separator,
      '',
      `TANGGAL CETAK / UNDUH : ${dateStr}`,
      `STATUS LAPORAN        : ${report.status.toUpperCase()}`,
      `KATEGORI LAPORAN      : ${report.type.toUpperCase()}`,
      `PERIODE LAPORAN       : ${report.period} (${report.year})`,
      '',
      subSeparator,
      '1. INFORMASI UMUM LAPORAN',
      subSeparator,
      `Judul Laporan         : ${report.title}`,
      `Kode Proyek           : ${project?.code || 'SIMEV-PROJ'}`,
      `Nama Proyek           : ${project?.title || 'Proyek Terkait'}`,
      `Penyusun / Tim Kerja  : ${report.authorOrLead}`,
      `Pemeriksa / Donor     : ${report.reviewerOrDonor || 'Tim Monev & Manajemen Program'}`,
      `Batas Waktu Penyerahan: ${report.submissionDeadline}`,
      `Tanggal Diserahkan    : ${report.submittedDate || 'Telah diverifikasi'}`,
      `Nama Berkas           : ${report.fileName || `${report.type}_${report.year}.pdf`}`,
      `Ukuran Berkas         : ${report.fileSize || '3.5 MB'}`,
      report.fileUrl ? `Tautan Penyimpanan    : ${report.fileUrl}` : '',
      '',
      subSeparator,
      '2. RINGKASAN EKSEKUTIF & CAPAIAN KUNCI',
      subSeparator,
      report.summaryHighlights,
      '',
      'Poin-Poin Capaian Utama:',
      keyAchievementsText,
      '',
      subSeparator,
      '3. TANTANGAN & LANGKAH MITIGASI',
      subSeparator,
      report.challengesAndMitigation || 'Tidak ada kendala kritis yang dilaporkan pada periode ini.',
      '',
      subSeparator,
      '4. METRIK & REALISASI PERIODE',
      subSeparator,
      `Target Penerima Manfaat : ${report.targetBeneficiariesPeriod ? report.targetBeneficiariesPeriod.toLocaleString('id-ID') + ' Jiwa' : 'Sesuai RKT'}`,
      `Realisasi Penerima Manfaat: ${report.actualBeneficiariesPeriod ? report.actualBeneficiariesPeriod.toLocaleString('id-ID') + ' Jiwa' : 'Sesuai RKT'}`,
      `Realisasi Anggaran      : ${report.budgetSpentPeriod ? 'Rp ' + report.budgetSpentPeriod.toLocaleString('id-ID') : '-'}`,
      report.ratingOrScore ? `Skor Kepatuhan Format  : ${report.ratingOrScore}%` : '',
      report.reviewNotes ? `Catatan Penilai        : ${report.reviewNotes}` : '',
      '',
      separator,
      'Dokumen ini merupakan ringkasan resmi laporan proyek yang diarsipkan dalam SIMEV.',
      'Sistem Informasi Monitoring & Evaluasi Proyek.',
      separator
    ].filter(line => line !== null && line !== undefined).join('\r\n');

    const cleanFileName = (report.fileName || `${report.type}_${report.year}_${report.title.slice(0, 30)}.txt`)
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    const finalFileName = cleanFileName.includes('.') ? cleanFileName : `${cleanFileName}.txt`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, message: `Mengunduh berkas rekap laporan: ${finalFileName}` };
  } catch (err) {
    console.error('Download report error:', err);
    return { success: false, message: 'Gagal mengunduh berkas laporan' };
  }
}
