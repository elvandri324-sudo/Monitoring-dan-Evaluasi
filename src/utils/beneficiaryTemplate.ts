import * as XLSX from 'xlsx';

export interface BeneficiaryTemplateRow {
  'Nama Lengkap *': string;
  'Jenis Kelamin * (Laki-laki / Perempuan)': string;
  'Desa / Kelurahan / Alamat *': string;
  'Kabupaten / Kota': string;
  'Provinsi': string;
  'Rentang Usia (0-5 / 6-12 / 13-17 / 18-24 / 25-40 / 41-64 / 65+)': string;
  'NIK / No Identitas': string;
  'Penyandang Disabilitas (Ya / Tidak)': string;
  'Ragam Disabilitas': string;
  'Tingkat Kesulitan (1. Extremely difficult / 2. Very difficult / 3. Fairly difficult / 4. Slightly difficult / 5. Almost no difficulty / 6. No difficulty)': string;
  'Catatan Hambatan / Akomodasi': string;
  'Status IPLC (Masyarakat Adat / Komunitas Lokal / Bukan IPLC)': string;
  'Nama Suku / Komunitas Adat': string;
  'Pekerjaan': string;
  'Nomor HP / WhatsApp': string;
  'Target Group (Population of project communities / Actors in administrations / Intermediaries / Other)': string;
  'Level of Beneficiaries (Desa / Kecamatan / Kabupaten / Provinsi / Nasional)': string;
  'Nama Wilayah / Dinas / Lembaga': string;
  'Instansi / Lembaga / OPD (Opsional)': string;
}

export const SAMPLE_BENEFICIARY_TEMPLATE: BeneficiaryTemplateRow[] = [
  {
    'Nama Lengkap *': 'Marta Kristina',
    'Jenis Kelamin * (Laki-laki / Perempuan)': 'Perempuan',
    'Desa / Kelurahan / Alamat *': 'Desa Menjalin',
    'Kabupaten / Kota': 'Kabupaten Landak',
    'Provinsi': 'Kalimantan Barat',
    'Rentang Usia (0-5 / 6-12 / 13-17 / 18-24 / 25-40 / 41-64 / 65+)': '25-40',
    'NIK / No Identitas': '6108016509950001',
    'Penyandang Disabilitas (Ya / Tidak)': 'Tidak',
    'Ragam Disabilitas': '',
    'Tingkat Kesulitan (1. Extremely difficult / 2. Very difficult / 3. Fairly difficult / 4. Slightly difficult / 5. Almost no difficulty / 6. No difficulty)': '',
    'Catatan Hambatan / Akomodasi': '',
    'Status IPLC (Masyarakat Adat / Komunitas Lokal / Bukan IPLC)': 'Masyarakat Adat (Indigenous Peoples)',
    'Nama Suku / Komunitas Adat': 'Suku Dayak Kanayatn',
    'Pekerjaan': 'Petani Karet & Tenun Tradisional',
    'Nomor HP / WhatsApp': '081299887766',
    'Target Group (Population of project communities / Actors in administrations / Intermediaries / Other)': 'Population of the project communities',
    'Level of Beneficiaries (Desa / Kecamatan / Kabupaten / Provinsi / Nasional)': 'Desa',
    'Nama Wilayah / Dinas / Lembaga': 'Desa Menjalin',
    'Instansi / Lembaga / OPD (Opsional)': ''
  },
  {
    'Nama Lengkap *': 'Stefanus Robert',
    'Jenis Kelamin * (Laki-laki / Perempuan)': 'Laki-laki',
    'Desa / Kelurahan / Alamat *': 'Desa Menjalin',
    'Kabupaten / Kota': 'Kabupaten Landak',
    'Provinsi': 'Kalimantan Barat',
    'Rentang Usia (0-5 / 6-12 / 13-17 / 18-24 / 25-40 / 41-64 / 65+)': '25-40',
    'NIK / No Identitas': '6108011204900002',
    'Penyandang Disabilitas (Ya / Tidak)': 'Ya',
    'Ragam Disabilitas': 'Fisik / Motorik / Mobilitas',
    'Tingkat Kesulitan (1. Extremely difficult / 2. Very difficult / 3. Fairly difficult / 4. Slightly difficult / 5. Almost no difficulty / 6. No difficulty)': '2. Very difficult',
    'Catatan Hambatan / Akomodasi': 'Menggunakan tongkat kruk saat pelatihan',
    'Status IPLC (Masyarakat Adat / Komunitas Lokal / Bukan IPLC)': 'Masyarakat Adat (Indigenous Peoples)',
    'Nama Suku / Komunitas Adat': 'Suku Dayak Kanayatn',
    'Pekerjaan': 'Pengrajin Rotan & Bambu',
    'Nomor HP / WhatsApp': '081344556677',
    'Target Group (Population of project communities / Actors in administrations / Intermediaries / Other)': 'Population of the project communities',
    'Level of Beneficiaries (Desa / Kecamatan / Kabupaten / Provinsi / Nasional)': 'Desa',
    'Nama Wilayah / Dinas / Lembaga': 'Desa Menjalin',
    'Instansi / Lembaga / OPD (Opsional)': ''
  },
  {
    'Nama Lengkap *': 'Ir. Hendra Saputra, M.Si',
    'Jenis Kelamin * (Laki-laki / Perempuan)': 'Laki-laki',
    'Desa / Kelurahan / Alamat *': 'Ngabang',
    'Kabupaten / Kota': 'Kabupaten Landak',
    'Provinsi': 'Kalimantan Barat',
    'Rentang Usia (0-5 / 6-12 / 13-17 / 18-24 / 25-40 / 41-64 / 65+)': '41-64',
    'NIK / No Identitas': '6108011905800005',
    'Penyandang Disabilitas (Ya / Tidak)': 'Tidak',
    'Ragam Disabilitas': '',
    'Tingkat Kesulitan (1. Extremely difficult / 2. Very difficult / 3. Fairly difficult / 4. Slightly difficult / 5. Almost no difficulty / 6. No difficulty)': '',
    'Catatan Hambatan / Akomodasi': '',
    'Status IPLC (Masyarakat Adat / Komunitas Lokal / Bukan IPLC)': 'Bukan IPLC (Non-IPLC)',
    'Nama Suku / Komunitas Adat': '',
    'Pekerjaan': 'Kepala Bidang Pengelolaan DAS & Konservasi',
    'Nomor HP / WhatsApp': '081122334455',
    'Target Group (Population of project communities / Actors in administrations / Intermediaries / Other)': 'Actors in the municipal, district and provincial administrations',
    'Level of Beneficiaries (Desa / Kecamatan / Kabupaten / Provinsi / Nasional)': 'Kabupaten',
    'Nama Wilayah / Dinas / Lembaga': 'Kabupaten Landak',
    'Instansi / Lembaga / OPD (Opsional)': 'Dinas Lingkungan Hidup & Kehutanan'
  },
  {
    'Nama Lengkap *': 'Yohanes Budi',
    'Jenis Kelamin * (Laki-laki / Perempuan)': 'Laki-laki',
    'Desa / Kelurahan / Alamat *': 'Desa Rebak',
    'Kabupaten / Kota': 'Kabupaten Landak',
    'Provinsi': 'Kalimantan Barat',
    'Rentang Usia (0-5 / 6-12 / 13-17 / 18-24 / 25-40 / 41-64 / 65+)': '41-64',
    'NIK / No Identitas': '6108031005770004',
    'Penyandang Disabilitas (Ya / Tidak)': 'Tidak',
    'Ragam Disabilitas': '',
    'Tingkat Kesulitan (1. Extremely difficult / 2. Very difficult / 3. Fairly difficult / 4. Slightly difficult / 5. Almost no difficulty / 6. No difficulty)': '',
    'Catatan Hambatan / Akomodasi': '',
    'Status IPLC (Masyarakat Adat / Komunitas Lokal / Bukan IPLC)': 'Masyarakat Adat (Indigenous Peoples)',
    'Nama Suku / Komunitas Adat': 'Suku Dayak Kanayatn',
    'Pekerjaan': 'Ketua Kelompok Tani Hutan',
    'Nomor HP / WhatsApp': '082155667788',
    'Target Group (Population of project communities / Actors in administrations / Intermediaries / Other)': 'Intermediaries: NGOs / CSOs',
    'Level of Beneficiaries (Desa / Kecamatan / Kabupaten / Provinsi / Nasional)': 'Kecamatan',
    'Nama Wilayah / Dinas / Lembaga': 'Kecamatan Menjalin',
    'Instansi / Lembaga / OPD (Opsional)': 'Yayasan Konservasi Borneo'
  }
];

/**
 * Downloads standard Excel (.xlsx) template
 */
export function downloadExcelTemplate() {
  const ws = XLSX.utils.json_to_sheet(SAMPLE_BENEFICIARY_TEMPLATE);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 25 }, // Nama Lengkap
    { wch: 24 }, // Jenis Kelamin
    { wch: 25 }, // Desa / Alamat
    { wch: 20 }, // Kabupaten
    { wch: 20 }, // Provinsi
    { wch: 28 }, // Rentang Usia
    { wch: 20 }, // NIK / Identitas
    { wch: 22 }, // Disabilitas
    { wch: 24 }, // Ragam Disabilitas
    { wch: 30 }, // Tingkat Kesulitan
    { wch: 32 }, // Catatan Hambatan
    { wch: 35 }, // Status IPLC
    { wch: 25 }, // Suku
    { wch: 28 }, // Pekerjaan
    { wch: 20 }, // No HP
    { wch: 38 }, // Target Group (Paling Kanan)
    { wch: 26 }, // Level of Beneficiaries (Paling Kanan)
    { wch: 28 }, // Nama Wilayah / Dinas (Paling Kanan)
    { wch: 32 }  // Instansi (Paling Kanan)
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template Penerima Manfaat');

  // Also add an Instruction sheet
  const instructions = [
    { 'Panduan Pengisian': 'ATURAN DATA PENERIMA MANFAAT & ANTI DOUBLE COUNTING M&E' },
    { 'Panduan Pengisian': '1. Sistem mendeteksi duplikasi berdasarkan: (Nama Lengkap + Jenis Kelamin + Desa/Alamat).' },
    { 'Panduan Pengisian': '2. Jika salah satu berbeda (misal nama sama namun desa berbeda, atau gender berbeda), maka dihitung sebagai individu baru yang berbeda.' },
    { 'Panduan Pengisian': '3. NIK/ID tidak dijadikan patokan unik utama, sehingga data tetap akurat walau NIK tidak lengkap.' },
    { 'Panduan Pengisian': '4. Kolom bertanda bintang (*) adalah kolom wajib diisi (Nama, Jenis Kelamin, Desa/Alamat).' },
    { 'Panduan Pengisian': '5. Target Group: Population of the project communities, Actors in the municipal, district and provincial administrations, Intermediaries: NGOs / CSOs, atau Other.' },
    { 'Panduan Pengisian': '6. Level of Beneficiaries: Desa, Kecamatan, Kabupaten, Provinsi, atau Nasional.' },
    { 'Panduan Pengisian': '7. Jenis kelamin: Laki-laki atau Perempuan.' },
    { 'Panduan Pengisian': '8. Rentang Usia (PILIH SALAH SATU): 0-5, 6-12, 13-17, 18-24, 25-40, 41-64, 65+ (Tidak perlu menulis angka umur).' },
    { 'Panduan Pengisian': '9. Status Disabilitas: Ya atau Tidak. Jika Ya, lengkapi kolom Ragam Disabilitas & Tingkat Kesulitan (1. Extremely difficult / 2. Very difficult / 3. Fairly difficult / 4. Slightly difficult / 5. Almost no difficulty / 6. No difficulty).' },
    { 'Panduan Pengisian': '10. Status IPLC: Masyarakat Adat, Komunitas Lokal, atau Bukan IPLC.' }
  ];
  const wsInst = XLSX.utils.json_to_sheet(instructions);
  wsInst['!cols'] = [{ wch: 95 }];
  XLSX.utils.book_append_sheet(wb, wsInst, 'Petunjuk & Aturan M&E');

  XLSX.writeFile(wb, `Template_Import_Penerima_Manfaat_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Downloads standard CSV template
 */
export function downloadCSVTemplate() {
  const headers = Object.keys(SAMPLE_BENEFICIARY_TEMPLATE[0]);
  const rows = SAMPLE_BENEFICIARY_TEMPLATE.map(r => 
    headers.map(h => `"${String((r as any)[h] || '').replace(/"/g, '""')}"`).join(',')
  );

  const csvContent = '\uFEFF' + [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Template_Import_Penerima_Manfaat_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses XLSX, XLS, or CSV File buffer or ArrayBuffer
 */
export async function parseBeneficiaryFile(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Parse to JSON objects (header row as keys)
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
          defval: '',
          raw: false
        });

        resolve(jsonData);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
