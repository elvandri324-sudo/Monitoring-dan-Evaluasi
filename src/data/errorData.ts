import { ErrorReport } from '../types';

export const INITIAL_ERROR_REPORTS: ErrorReport[] = [
  {
    id: 'err-001',
    title: 'Peringatan format NIK 16 digit saat impor Excel mitra lapangan',
    module: 'Penerima Manfaat & GESI',
    severity: 'Sedang (Medium)',
    status: 'Selesai (Resolved)',
    description: 'Ketika mengimpor file Excel dari lapangan dengan format sel teks angka ilmiah (misal 6.10804E+15), NIK terbaca sebagai format scientific notation.',
    stepsToReproduce: '1. Unduh template Excel\n2. Isi NIK 16 digit tanpa tanda kutip di Excel format General\n3. Unggah ke menu Import Penerima Manfaat',
    expectedBehavior: 'Sistem otomatis mengonversi scientific notation menjadi 16 digit string murni tanpa mengubah angka.',
    actualBehavior: 'Sempat terpotong digit akhirnya sebelum ada sanitizer otomatis.',
    systemInfo: 'Browser Chrome 124 / Windows 11 / Excel 365',
    reportedBy: 'Budi Santoso (Staff M&E)',
    reporterEmail: 'budi.santoso@monitoring.org',
    assignedTo: 'Elvandri (Lead M&E)',
    resolutionNotes: 'Sudah ditambahkan normalisasi string NIK dan regex auto-cleaning di parser XLSX.',
    createdAt: '2026-07-14 10:30',
    resolvedAt: '2026-07-15 14:20'
  },
  {
    id: 'err-002',
    title: 'Validasi rentang usia 7 kategori pada form manual',
    module: 'Penerima Manfaat & GESI',
    severity: 'Sedang (Medium)',
    status: 'Selesai (Resolved)',
    description: 'Permintaan penyesuaian formulir input penerima manfaat agar tidak memasukkan angka umur satuan manual tetapi langsung memilih 7 rentang usia standar (0-5, 6-12, 13-17, 18-24, 25-40, 41-64, 65+).',
    stepsToReproduce: '1. Buka menu Penerima Manfaat\n2. Klik Tambah Penerima Manfaat\n3. Periksa input usia',
    expectedBehavior: 'Pilihan dropdown / badge range 0-5, 6-12, 13-17, 18-24, 25-40, 41-64, 65+.',
    actualBehavior: 'Sebelumnya mewajibkan input angka tahun.',
    systemInfo: 'Semua platform web / browser',
    reportedBy: 'Siti Nurhaliza (Koordinator Kalbar)',
    reporterEmail: 'siti.nur@partner-kalbar.org',
    assignedTo: 'Elvandri (Lead M&E)',
    resolutionNotes: 'Telah diperbarui ke 7 rentang usia terstandar dengan dukungan ekspor XLSX.',
    createdAt: '2026-08-20 09:15',
    resolvedAt: '2026-08-22 11:00'
  },
  {
    id: 'err-003',
    title: 'Tombol ekspor XLSX untuk daftar kegiatan & presensi perlu disertakan',
    module: 'Ekspor / Impor Berkas',
    severity: 'Rendah (Low)',
    status: 'Dalam Investigasi',
    description: 'Koordinator meminta tombol unduh berkas XLSX langsung untuk daftar presensi peserta kegiatan agar mudah diarsip offline.',
    stepsToReproduce: '1. Buka menu Kegiatan\n2. Buka salah satu kegiatan\n3. Periksa tombol ekspor',
    expectedBehavior: 'Tersedia tombol Ekspor XLSX dengan format terstruktur rapi.',
    actualBehavior: 'Sedang diimplementasikan bersama modul ekspor menyeluruh.',
    systemInfo: 'Web Application',
    reportedBy: 'Drs. Yulius Tefa (Koordinator NTT)',
    reporterEmail: 'yulius.tefa@inklusi-ntt.org',
    assignedTo: 'Budi Santoso',
    createdAt: '2026-08-21 14:00'
  }
];
