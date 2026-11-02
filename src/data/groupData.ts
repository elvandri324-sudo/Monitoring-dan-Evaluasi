import { AccompaniedGroup } from '../types';

export const INITIAL_ACCOMPANIED_GROUPS: AccompaniedGroup[] = [
  {
    id: 'grp-001',
    projectId: 'proj-01',
    code: 'OPS-MHL-01',
    name: 'OPS Tirta & Sanitasi Lestari Menjalin',
    type: 'OPS (Organisasi Pengelola Sarana / Sanitasi)',
    province: 'Kalimantan Barat',
    regency: 'Kabupaten Landak',
    district: 'Kecamatan Menjalin',
    village: 'Desa Menjalin',
    establishmentDate: '2024-02-14',
    legalStatus: 'SK Kepala Desa',
    legalDocumentNumber: 'SK.Desa/Menjalin/14/II/2024',
    leaderName: 'Yohanes Lawing',
    leaderPhone: '081255443322',
    focusArea: 'Pengelolaan, Operasional & Pemeliharaan Sarana Air Bersih dan Sanitasi Komunal Berbasis Masyarakat',
    status: 'Aktif',
    notes: 'Kelompok aktif mengelola 3 titik bak penampung air bersih gravitasi dan 15 unit jamban sehat ramah disabilitas.',
    members: [
      {
        beneficiaryId: 'ben-001',
        roleInGroup: 'Ketua',
        joinedDate: '2024-02-14',
        notes: 'Penanggung jawab operasional harian dan teknis perpipaan'
      },
      {
        beneficiaryId: 'ben-002',
        roleInGroup: 'Sekretaris',
        joinedDate: '2024-02-14',
        notes: 'Pencatatan iuran pemeliharaan warga dan dokumentasi rapat'
      },
      {
        beneficiaryId: 'ben-010',
        roleInGroup: 'Anggota Inti',
        joinedDate: '2024-02-14',
        notes: 'Penasihat perempuan lansia dan pengawas akses air bagi difabel'
      },
      {
        beneficiaryId: 'ben-009',
        roleInGroup: 'Koordinator Lapangan',
        joinedDate: '2024-03-01',
        notes: 'Inspektur jaringan pipa transmisi dari mata air hutan adat'
      }
    ],
    createdAt: '2024-02-14'
  },
  {
    id: 'grp-002',
    projectId: 'proj-01',
    code: 'POKJA-SDG-01',
    name: 'Pokja AMPL & Sanitasi Total Desa Siding',
    type: 'POKJA (Kelompok Kerja)',
    province: 'Kalimantan Barat',
    regency: 'Kabupaten Bengkayang',
    district: 'Kecamatan Siding',
    village: 'Desa Siding',
    establishmentDate: '2024-03-10',
    legalStatus: 'SK Kepala Desa',
    legalDocumentNumber: '141/08/SK-KADES/SDG/2024',
    leaderName: 'Lusia Senen',
    leaderPhone: '085244112233',
    focusArea: 'Perencanaan, Advokasi Anggaran Dana Desa untuk Sanitasi & Verifikasi Stop BABS (Open Defecation Free)',
    status: 'Aktif',
    notes: 'Pokja lintas unsur: aparat desa, tokoh adat, kader posyandu, dan perwakilan disabilitas.',
    members: [
      {
        beneficiaryId: 'ben-004',
        roleInGroup: 'Ketua',
        joinedDate: '2024-03-10',
        notes: 'Koordinator advokasi musrenbangdes dan pemicuan STBM'
      },
      {
        beneficiaryId: 'ben-003',
        roleInGroup: 'Bendahara',
        joinedDate: '2024-03-10',
        notes: 'Pengelola kas stimulan jamban sehat bagi keluarga rentan'
      },
      {
        beneficiaryId: 'ben-005',
        roleInGroup: 'Anggota Inti',
        joinedDate: '2024-03-10',
        notes: 'Tokoh tetua adat pengarah sanksi sosial pembuangan sampah ke sungai'
      }
    ],
    createdAt: '2024-03-10'
  },
  {
    id: 'grp-003',
    projectId: 'proj-01',
    code: 'KADER-SBCC-01',
    name: 'Kader Perubahan Perilaku (SBCC) Higiene & Cuci Tangan RW 02 Menjalin',
    type: 'KADER Perubahan Perilaku (SBCC / Higiene)',
    province: 'Kalimantan Barat',
    regency: 'Kabupaten Landak',
    district: 'Kecamatan Menjalin',
    village: 'Desa Menjalin',
    establishmentDate: '2024-04-05',
    legalStatus: 'SK Kepala Desa',
    legalDocumentNumber: 'SK.Desa/Kader-SBCC/05/IV/2024',
    leaderName: 'Theresia Linda',
    leaderPhone: '082155887700',
    focusArea: 'Komunikasi Perubahan Perilaku (SBCC), Sosialisasi 5 Pilar STBM, dan Cuci Tangan Pakai Sabun (CTPS) di Sekolah & Rumah Tangga',
    status: 'Aktif',
    notes: 'Tim kader terlatih dalam teknik pemicuan partisipatif dan konseling door-to-door keluarga dengan balita stunting.',
    members: [
      {
        beneficiaryId: 'ben-002',
        roleInGroup: 'Ketua',
        joinedDate: '2024-04-05',
        notes: 'Fasilitator utama SBCC modul higiene sekolah dan posyandu'
      },
      {
        beneficiaryId: 'ben-010',
        roleInGroup: 'Kader Aktif',
        joinedDate: '2024-04-05',
        notes: 'Kader pembimbing kelompok ibu-ibu lansia dan disabilitas netra'
      },
      {
        beneficiaryId: 'ben-008',
        roleInGroup: 'Kader Aktif',
        joinedDate: '2024-04-20',
        notes: 'Pelatih pembuatan sabun cuci tangan alami dari minyak tengkawang'
      }
    ],
    createdAt: '2024-04-05'
  },
  {
    id: 'grp-004',
    projectId: 'proj-01',
    code: 'BS-BGS-01',
    name: 'Bank Sampah Berkah Sejahtera Bagak Sahwa',
    type: 'Bank Sampah',
    province: 'Kalimantan Barat',
    regency: 'Kota Singkawang',
    district: 'Kecamatan Singkawang Timur',
    village: 'Desa Bagak Sahwa',
    establishmentDate: '2024-05-18',
    legalStatus: 'Akta Notaris / Kemenkumham',
    legalDocumentNumber: 'AHU-0019284.AH.01.07.TAHUN.2024',
    leaderName: 'Nur Aisyah',
    leaderPhone: '081299881122',
    focusArea: 'Pengurangan Sampah Plastik Rumah Tangga, Pemilahan Sampah Bernilai Ekonomi, dan Sirkular Ekonomi Komunitas',
    status: 'Mandiri',
    notes: 'Memiliki 120 nasabah aktif terdaftar, menyerap 1.8 ton sampah anorganik per semester dan memproduksi ecobrick.',
    members: [
      {
        beneficiaryId: 'ben-008',
        roleInGroup: 'Ketua',
        joinedDate: '2024-05-18',
        notes: 'Direktur Bank Sampah dan penanggung jawab kerjasama off-taker daur ulang'
      },
      {
        beneficiaryId: 'ben-007',
        roleInGroup: 'Anggota Inti',
        joinedDate: '2024-05-18',
        notes: 'Duta cilik pilah sampah sekolah dasar dan pengumpul botol plastik'
      },
      {
        beneficiaryId: 'ben-006',
        roleInGroup: 'Kader Aktif',
        joinedDate: '2024-06-01',
        notes: 'Petugas pencatatan timbangan sampah dan pembukuan tabungan nasabah'
      }
    ],
    createdAt: '2024-05-18'
  },
  {
    id: 'grp-005',
    projectId: 'proj-02',
    code: 'POKDARWIS-FTN-01',
    name: 'Pokdarwis Ekowisata Hutan Bonsai & Tebing Fatumnasi',
    type: 'Pokdarwis (Kelompok Sadar Wisata)',
    province: 'Nusa Tenggara Timur',
    regency: 'Kabupaten Timor Tengah Selatan',
    district: 'Kecamatan Mollo Utara',
    village: 'Desa Fatumnasi',
    establishmentDate: '2024-06-20',
    legalStatus: 'SK Bupati',
    legalDocumentNumber: 'SK.Bup.TTS/Dispar/220/VI/2024',
    leaderName: 'Elisabeth Nubatonis',
    leaderPhone: '082146778899',
    focusArea: 'Pemanduan Ekowisata Berbasis Konservasi Hutan Adat Mutis, Pengelolaan Homestay Ramah Disabilitas, & Atraksi Budaya Amanuban',
    status: 'Aktif',
    notes: 'Pemenang anugerah desa wisata konservasi ramah gender dan disabilitas tingkat provinsi NTT 2025.',
    members: [
      {
        beneficiaryId: 'ben-012',
        roleInGroup: 'Ketua',
        joinedDate: '2024-06-20',
        notes: 'Koordinator manajemen paket wisata dan kuliner lokal non-beras'
      },
      {
        beneficiaryId: 'ben-011',
        roleInGroup: 'Sekretaris',
        joinedDate: '2024-06-20',
        notes: 'Pengelola reservasi digital ekowisata dan pemandu jalur aksesibel'
      },
      {
        beneficiaryId: 'ben-013',
        roleInGroup: 'Koordinator Lapangan',
        joinedDate: '2024-07-01',
        notes: 'Pemandu trekking dan operator konservasi mata air'
      }
    ],
    createdAt: '2024-06-20'
  },
  {
    id: 'grp-006',
    projectId: 'proj-02',
    code: 'KWT-MW-01',
    name: 'KWT Mawar Inklusi & Kebun Gizi Mandiri Fatumnasi',
    type: 'Kelompok Tani / KWT',
    province: 'Nusa Tenggara Timur',
    regency: 'Kabupaten Timor Tengah Selatan',
    district: 'Kecamatan Mollo Utara',
    village: 'Desa Fatumnasi',
    establishmentDate: '2024-05-10',
    legalStatus: 'SK Kepala Desa',
    legalDocumentNumber: 'SK-KADES/FTN/09/V/2024',
    leaderName: 'Elisabeth Nubatonis',
    leaderPhone: '082146778899',
    focusArea: 'Budidaya Hortikultura Bedengan Tinggi Adaptif Disabilitas, Pangan Lokal Sorgum, dan Olahan Pangan Bergizi',
    status: 'Mandiri',
    notes: 'Mengelola 2 hektar kebun gizi komunal dengan 80% anggota perempuan dan 2 penyandang disabilitas.',
    members: [
      {
        beneficiaryId: 'ben-012',
        roleInGroup: 'Ketua',
        joinedDate: '2024-05-10',
        notes: 'Ketua kelompok wanita tani dan penyuluh kebun gizi keluarga'
      },
      {
        beneficiaryId: 'ben-011',
        roleInGroup: 'Bendahara',
        joinedDate: '2024-05-10',
        notes: 'Manajer pembukuan hasil panen sayuran organik dan bibit'
      },
      {
        beneficiaryId: 'ben-014',
        roleInGroup: 'Anggota Inti',
        joinedDate: '2024-05-10',
        notes: 'Pengembang varietas benih lokal sorgum dan kacang-kacangan purba'
      }
    ],
    createdAt: '2024-05-10'
  },
  {
    id: 'grp-007',
    projectId: 'proj-02',
    code: 'LUMBUNG-RND-01',
    name: 'Lembaga Pengelola Lumbung Pangan Adat Marapu Rindi',
    type: 'Lembaga Adat / Komunitas Adat',
    province: 'Nusa Tenggara Timur',
    regency: 'Kabupaten Sumba Timur',
    district: 'Kecamatan Rindi',
    village: 'Desa Rindi',
    establishmentDate: '2024-06-25',
    legalStatus: 'SK Kepala Desa',
    legalDocumentNumber: 'SK.Desa/Rindi/25/VI/2024',
    leaderName: 'Rambu Ana Hida',
    leaderPhone: '081338445566',
    focusArea: 'Ketahanan Pangan Berbasis Kearifan Lokal Adat Marapu, Pengelolaan Stok Cadangan Pangan Saat Kemarau Panjang, dan Perlindungan Benih Asli',
    status: 'Aktif',
    notes: 'Menyimpan 12 ton cadangan gabah dan jagung lokal untuk mengantisipasi gagal panen akibat dampak perubahan iklim.',
    members: [
      {
        beneficiaryId: 'ben-016',
        roleInGroup: 'Ketua',
        joinedDate: '2024-06-25',
        notes: 'Kepala pengelola lumbung pangan dan penjaga ritual konservasi benih'
      },
      {
        beneficiaryId: 'ben-018',
        roleInGroup: 'Kader Aktif',
        joinedDate: '2024-06-25',
        notes: 'Pengatur jadwal pengeringan biji-bijian dan pengemasan kedap udara'
      },
      {
        beneficiaryId: 'ben-017',
        roleInGroup: 'Anggota',
        joinedDate: '2024-07-05',
        notes: 'Perwakilan pembina teknis dinas pertanian kabupaten'
      }
    ],
    createdAt: '2024-06-25'
  },
  {
    id: 'grp-008',
    projectId: 'proj-01',
    code: 'KUPS-TKW-01',
    name: 'KUPS Minyak Tengkawang Lestari Menua Sadap',
    type: 'KUPS / Lembaga Pengelola Hutan Desa (LPHD)',
    province: 'Kalimantan Barat',
    regency: 'Kabupaten Kapuas Hulu',
    district: 'Kecamatan Embaloh Hulu',
    village: 'Desa Menua Sadap',
    establishmentDate: '2024-07-12',
    legalStatus: 'SK Kepala Desa',
    legalDocumentNumber: 'SK.LPHD-MNS/12/VII/2024',
    leaderName: 'Donatus Budi',
    leaderPhone: '082255667788',
    focusArea: 'Pengolahan Hasil Hutan Bukan Kayu (HHBK) Lemak Tengkawang, Madu Hutan Liar, dan Ekspor Kosmetik Berkelanjutan',
    status: 'Rintisan / Pemula',
    notes: 'KUPS binaan yang menghubungkan panen buah tengkawang lestari warga dengan industri kosmetik ramah hutan.',
    members: [
      {
        beneficiaryId: 'ben-009',
        roleInGroup: 'Ketua',
        joinedDate: '2024-07-12',
        notes: 'Ketua operasional KUPS dan fasilitator rantai pasok HHBK'
      },
      {
        beneficiaryId: 'ben-006',
        roleInGroup: 'Sekretaris',
        joinedDate: '2024-07-12',
        notes: 'Quality control pengepresan minyak tengkawang murni dan sertifikasi organik'
      },
      {
        beneficiaryId: 'ben-008',
        roleInGroup: 'Bendahara',
        joinedDate: '2024-07-12',
        notes: 'Pengelola kemitraan pembeli (offtaker) sabun nabati'
      }
    ],
    createdAt: '2024-07-12'
  },
  {
    id: 'grp-009',
    projectId: 'proj-01',
    code: 'TPS3R-MHL-01',
    name: 'KSM Pengelola TPS3R Resik Lestari Menjalin',
    type: 'TPS3R (Tempat Pengolahan Sampah 3R)',
    province: 'Kalimantan Barat',
    regency: 'Kabupaten Landak',
    district: 'Kecamatan Menjalin',
    village: 'Desa Menjalin',
    establishmentDate: '2024-05-18',
    legalStatus: 'SK Kepala Desa',
    legalDocumentNumber: 'SK.Desa/Menjalin/18/V/2024',
    leaderName: 'Markus Tino',
    leaderPhone: '081344558899',
    focusArea: 'Operasional Fasilitas TPS3R, Pemilahan Sampah Organik & Anorganik, Pembuatan Kompos Padat/Cair, dan Edukasi 3R Tingkat Rumah Tangga',
    status: 'Aktif',
    notes: 'Mengelola fasilitas TPS3R desa dengan kapasitas olah 2 ton sampah per minggu dan memproduksi pupuk kompos organik untuk kelompok tani.',
    members: [
      {
        beneficiaryId: 'ben-007',
        roleInGroup: 'Ketua',
        joinedDate: '2024-05-18',
        notes: 'Koordinator operasional mesin pencacah organik dan logistik pengangkutan sampah'
      },
      {
        beneficiaryId: 'ben-002',
        roleInGroup: 'Sekretaris',
        joinedDate: '2024-05-18',
        notes: 'Pencatatan volume timbulan sampah harian dan neraca penjualan kompos'
      },
      {
        beneficiaryId: 'ben-001',
        roleInGroup: 'Koordinator Lapangan',
        joinedDate: '2024-05-18',
        notes: 'Teknisi perawatan mesin ayak dan pemilah sampah anorganik bernilai ekonomis'
      }
    ],
    createdAt: '2024-05-18'
  },
  {
    id: 'grp-010',
    projectId: 'proj-03',
    code: 'PDU-SPP-01',
    name: 'Unit Pengelola PDU Sirkular Paperu Sejahtera',
    type: 'PDU (Pusat Daur Ulang)',
    province: 'Maluku',
    regency: 'Kabupaten Maluku Tengah',
    district: 'Kecamatan Saparua',
    village: 'Desa Paperu',
    establishmentDate: '2024-08-01',
    legalStatus: 'SK Camat',
    legalDocumentNumber: 'SK.Camat/SPR/01/VIII/2024',
    leaderName: 'Frans Pattinama',
    leaderPhone: '082199887766',
    focusArea: 'Pengolahan dan Pencacahan Sampah Plastik Laut / Pesisir, Pengepresan Kardus & Logam, serta Penyaluran ke Industri Daur Ulang',
    status: 'Rintisan / Pemula',
    notes: 'Pusat Daur Ulang tingkat kawasan kepulauan untuk menyerap sampah bernilai dari 6 bank sampah unit pesisir.',
    members: [
      {
        beneficiaryId: 'ben-021',
        roleInGroup: 'Ketua',
        joinedDate: '2024-08-01',
        notes: 'Manajer fasilitas PDU dan penghubung offtaker daur ulang plastik'
      },
      {
        beneficiaryId: 'ben-022',
        roleInGroup: 'Bendahara',
        joinedDate: '2024-08-01',
        notes: 'Pengelola transaksi jual beli material daur ulang dengan nelayan & pemulung'
      }
    ],
    createdAt: '2024-08-01'
  }
];
