import { MoVDocument } from '../types';

export interface MoVDownloadMeta {
  projectCode?: string;
  projectTitle?: string;
  level?: string;
  outcomeTitle?: string;
  outputTitle?: string;
  activityTitle?: string;
  indicatorCode?: string;
  indicatorName?: string;
}

/**
 * Trigger browser download for an MoV Document:
 * - If fileData (base64/data URI) is available, download the real binary file
 * - If fileUrl (cloud link) is available, open or download shortcut
 * - If no binary exists (sample/registered doc), generate a formatted official M&E verification summary file
 */
export function downloadMoVDocument(doc: MoVDocument, meta?: MoVDownloadMeta): { success: boolean; message: string } {
  try {
    // 1. If real Base64 / Data URI is present
    if (doc.fileData) {
      const link = document.createElement('a');
      link.href = doc.fileData;
      link.download = doc.fileName || `${doc.title.replace(/[^a-z0-9_-]/gi, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true, message: `Mengunduh berkas asli: ${doc.fileName || doc.title}` };
    }

    // 2. If it is an external cloud link
    if (doc.fileUrl && !doc.fileName) {
      window.open(doc.fileUrl, '_blank', 'noopener,noreferrer');
      return { success: true, message: `Membuka tautan penyimpanan cloud: ${doc.title}` };
    }

    // 3. Fallback: Generate an official verification certificate and summary text document
    const separator = '='.repeat(78);
    const subSeparator = '-'.repeat(78);
    const dateStr = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const content = [
      separator,
      'SISTEM INFORMASI MONITORING & EVALUASI PROYEK (SIMEV)',
      'LEMBAR BUKTI VERIFIKASI RESMI (MEANS OF VERIFICATION - MoV)',
      separator,
      '',
      `TANGGAL CETAK/UNDUH : ${dateStr}`,
      `STATUS DOKUMEN       : TERVERIFIKASI & TERCATAT RESMI`,
      '',
      subSeparator,
      'A. INFORMASI BUKTI VERIFIKASI (MoV)',
      subSeparator,
      `ID Dokumen          : ${doc.id}`,
      `Judul Dokumen       : ${doc.title}`,
      `Kategori Bukti      : ${doc.category}`,
      `Nama Berkas Asli    : ${doc.fileName || 'Dokumen_MoV.pdf'}`,
      `Ukuran Berkas       : ${doc.fileSize || '1.5 MB'}`,
      `Tanggal Unggah      : ${doc.uploadedAt}`,
      `Diupload Oleh       : ${doc.uploadedBy}`,
      doc.fileUrl ? `Tautan Cloud        : ${doc.fileUrl}` : '',
      '',
      subSeparator,
      'B. HIERARKI LOGFRAME & SASARAN PROYEK',
      subSeparator,
      `Kode Proyek         : ${meta?.projectCode || '-'}`,
      `Nama Proyek         : ${meta?.projectTitle || '-'}`,
      `Tingkat (Level)     : ${meta?.level || 'Aktivitas'}`,
      meta?.outcomeTitle ? `Outcome Terkait     : ${meta.outcomeTitle}` : '',
      meta?.outputTitle ? `Output Terkait      : ${meta.outputTitle}` : '',
      meta?.activityTitle ? `Kegiatan Terkait    : ${meta.activityTitle}` : '',
      meta?.indicatorName ? `Indikator Sasaran   : ${meta.indicatorCode ? `[${meta.indicatorCode}] ` : ''}${meta.indicatorName}` : '',
      '',
      subSeparator,
      'C. CATATAN & DESKRIPSI VERIFIKASI',
      subSeparator,
      doc.notes ? doc.notes : 'Dokumen fisik/digital terarsip dalam repositori SIMEV dan telah memenuhi kaidah verifikasi capaian proyek.',
      '',
      separator,
      'Dokumen ini merupakan arsip resmi Sistem Monitoring & Evaluasi Proyek.',
      'Diterbitkan secara otomatis oleh SIMEV System.',
      separator
    ].filter(line => line !== null && line !== undefined).join('\r\n');

    const fileNameClean = (doc.fileName || `${doc.title}_MoV.txt`).replace(/[^a-zA-Z0-9._-]/g, '_');
    const finalFileName = fileNameClean.includes('.') ? fileNameClean : `${fileNameClean}.txt`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, message: `Berkas MoV "${doc.title}" berhasil diunduh.` };
  } catch (err: any) {
    console.error('Error downloading MoV document:', err);
    return { success: false, message: 'Gagal mengunduh berkas MoV.' };
  }
}

/**
 * Format bytes to human readable size
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
