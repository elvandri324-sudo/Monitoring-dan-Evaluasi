import { Project, Beneficiary, ActivityAttendance } from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-01',
    code: 'BIO-KLM-01',
    title: 'Konservasi Hutan Berbasis Masyarakat Adat & Komunitas Lokal (IPLC)',
    donor: 'Global Green Environment Facility (GGEF)',
    partnerOrg: 'Aliansi Konservasi Nusantara & AMAN Kalimantan',
    budgetTotal: 3450000000,
    budgetCurrency: 'IDR',
    startDate: '2024-01-15',
    endDate: '2026-12-31',
    status: 'Aktif',
    province: 'Kalimantan Barat',
    targetLocations: ['Kec. Menjalin (Landak)', 'Kec. Siding (Bengkayang)', 'Kec. Putussibau Selatan (Kapuas Hulu)'],
    targetVillages: ['Desa Menjalin', 'Desa Siding', 'Desa Menua Sadap', 'Desa Bagak Sahwa'],
    goalStatement: 'Terwujudnya pengelolaan hutan adat seluas 15.000 Ha yang berkelanjutan, terlindunginya hak kelola masyarakat adat (IPLC), dan peningkatan kesejahteraan inklusif bagi 1.500 KK.',
    goalIndicators: [
      {
        id: 'ind-g1',
        code: 'IND-GOAL.1',
        level: 'Goal',
        parentId: 'proj-01',
        name: 'Luas tutupan hutan adat yang dipertahankan dan terhindar dari deforestasi',
        definition: 'Hektar tutupan hutan primer dan sekunder terverifikasi citra satelit dan patroli adat',
        baseline: 8200,
        target: 15000,
        actual: 12450,
        unit: 'Hektar (Ha)',
        meansOfVerification: 'Peta spasial GIS & Laporan Patroli Adat',
        movDocuments: [
          {
            id: 'mov-g1-1',
            title: 'Peta Spasial Tutupan Hutan Adat GIS 2026',
            category: 'Kebijakan / SK / Perdes / Regulasi',
            fileName: 'Peta_Tutupan_Hutan_Adat_GIS_2026.pdf',
            fileSize: '4.8 MB',
            uploadedAt: '2026-06-30',
            uploadedBy: 'Rian Pangestu (GIS Officer)',
            notes: 'Hasil interpretasi citra satelit Sentinel-2 dan verifikasi ground check'
          },
          {
            id: 'mov-g1-2',
            title: 'Laporan Konsolidasi Patroli Hutan Adat Semester 1 2026',
            category: 'Laporan Naratif / Laporan Kegiatan',
            fileName: 'Laporan_Patroli_Adat_Sem1_2026.pdf',
            fileSize: '3.2 MB',
            uploadedAt: '2026-07-02',
            uploadedBy: 'Margaretha Simangunsong',
            notes: 'Laporan rekapitulasi patroli SMART patrol oleh 4 tim patroli pemuda adat'
          }
        ],
        frequency: 'Tahunan',
        status: 'Sesuai Target (On-Track)',
        lastUpdated: '2026-06-30'
      },
      {
        id: 'ind-g2',
        code: 'IND-GOAL.2',
        level: 'Goal',
        parentId: 'proj-01',
        name: 'Total penerima manfaat langsung terdeduplikasi dengan peningkatan pendapatan ramah lingkungan >20%',
        definition: 'Jumlah individu unik penerima manfaat dari pengelolaan hasil hutan bukan kayu (HHBK)',
        baseline: 200,
        target: 1800,
        actual: 1420,
        unit: 'Orang / Individu',
        disaggregationRequired: true,
        meansOfVerification: 'Survei baseline-endline ekonomi & presensi terverifikasi',
        frequency: 'Semesteran',
        status: 'Sesuai Target (On-Track)',
        lastUpdated: '2026-07-15'
      }
    ],
    outcomes: [
      {
        id: 'oc-1',
        projectId: 'proj-01',
        code: 'OC-1',
        title: 'Pengakuan Hukum & Penguatan Kelembagaan Wilayah Kelola Adat (IPLC)',
        description: 'Masyarakat adat dan komunitas lokal memiliki surat keputusan legalitas penetapan hutan adat dan tata kelola berkeadilan gender.',
        indicators: [
          {
            id: 'ind-oc1.1',
            code: 'IND-OC1.1',
            level: 'Outcome',
            parentId: 'oc-1',
            name: 'Jumlah SK Penetapan Hutan Adat yang diterbitkan KLHK & Pemda',
            definition: 'Surat Keputusan Menteri LHK atau Peraturan Bupati tentang wilayah adat',
            baseline: 1,
            target: 5,
            actual: 4,
            unit: 'Dokumen / Kebijakan',
            meansOfVerification: 'Salinan SK Resmi Kementerian LHK',
            movDocuments: [
              {
                id: 'mov-oc1-1',
                title: 'SK Menteri LHK Penetapan Hutan Adat Menjalin & Siding',
                category: 'Kebijakan / SK / Perdes / Regulasi',
                fileName: 'SK_KLHK_No_412_Menlhk_HutanAdat_2025.pdf',
                fileSize: '5.4 MB',
                uploadedAt: '2025-08-14',
                uploadedBy: 'Dr. Andreas B. Kurniawan',
                notes: 'SK Pengakuan Resmi Hutan Adat seluas 8.500 Ha dari Menteri Lingkungan Hidup dan Kehutanan'
              },
              {
                id: 'mov-oc1-2',
                title: 'Salinan Peraturan Daerah Pengakuan Masyarakat Adat',
                category: 'Kebijakan / SK / Perdes / Regulasi',
                fileName: 'Perda_Kab_Landak_No_04_2024_MHA.pdf',
                fileSize: '2.1 MB',
                uploadedAt: '2024-11-20',
                uploadedBy: 'Margaretha Simangunsong',
                notes: 'Perda Payung Hukum Masyarakat Hukum Adat'
              }
            ],
            frequency: 'Semesteran',
            status: 'Sesuai Target (On-Track)',
            lastUpdated: '2026-05-10'
          },
          {
            id: 'ind-oc1.2',
            code: 'IND-OC1.2',
            level: 'Outcome',
            parentId: 'oc-1',
            name: 'Keterlibatan perempuan dan kelompok disabilitas dalam lembaga adat pengambilan keputusan',
            definition: 'Persentase keterwakilan perempuan dan penyandang disabilitas di Badan Pengurus Hutan Adat',
            baseline: 8,
            target: 35,
            actual: 38,
            unit: 'Persentase (%)',
            meansOfVerification: 'Berita Acara Musyawarah Adat & Daftar Struktur Pengurus',
            frequency: 'Semesteran',
            status: 'Tercapai',
            lastUpdated: '2026-07-01'
          }
        ],
        outputs: [
          {
            id: 'op-1.1',
            outcomeId: 'oc-1',
            code: 'OP-1.1',
            title: 'Pemetaan Partisipatif & Pendokumentasian Kearifan Lokal',
            description: 'Tersedianya peta batas wilayah adat dan dokumen kearifan hukum adat Dayak Kanayatn & Iban.',
            targetDate: '2025-08-30',
            indicators: [
              {
                id: 'ind-op1.1.1',
                code: 'IND-OP1.1.1',
                level: 'Output',
                parentId: 'op-1.1',
                name: 'Peta partisipatif batas wilayah adat skala 1:25.000 tervalidasi',
                definition: 'Peta kartometrik dan toponimi yang disepakati desa sekitar',
                baseline: 1,
                target: 6,
                actual: 6,
                unit: 'Dokumen / Kebijakan',
                meansOfVerification: 'Peta cetak dan digital format SHP bersertifikat BIG',
                movDocuments: [
                  {
                    id: 'mov-op11-1',
                    title: 'Peta Cetak Kartometrik Batas Adat Dayak Kanayatn Skala 1:25.000',
                    category: 'Kebijakan / SK / Perdes / Regulasi',
                    fileName: 'Peta_Adat_Kanayatn_25k_Final.pdf',
                    fileSize: '8.2 MB',
                    uploadedAt: '2025-11-20',
                    uploadedBy: 'Rian Pangestu (GIS Officer)',
                    notes: 'Peta resolusi tinggi yang telah ditandatangani para tetua adat 4 desa perbatasan'
                  },
                  {
                    id: 'mov-op11-2',
                    title: 'Paket Shapefile Spasial Geodatabase Batas Wilayah Adat',
                    category: 'Tautan Link Cloud (Drive/Dropbox)',
                    fileUrl: 'https://drive.google.com/drive/folders/simev-kalbar-gis-shp-2025',
                    fileName: 'SHP_Geodatabase_WilayahAdat_Kalbar.zip',
                    fileSize: '45.6 MB',
                    uploadedAt: '2025-11-22',
                    uploadedBy: 'Rian Pangestu (GIS Officer)',
                    notes: 'Folder cloud berisi file shapefile .shp, .shx, .dbf, .prj terverifikasi Badan Informasi Geospasial'
                  }
                ],
                frequency: 'Triwulanan',
                status: 'Tercapai',
                lastUpdated: '2025-11-20'
              }
            ],
            activities: [
              {
                id: 'act-1.1.1',
                outputId: 'op-1.1',
                code: 'ACT-1.1.1',
                title: 'Pelatihan Pemetaan Spansial & GPS Partisipatif bagi Pemuda Adat (IPLC)',
                description: 'Pelatihan teknis drone mapping, penggunaan aplikasi geospasial seluler, dan pengenalan toponimi sejarah adat.',
                location: 'Balai Adat Desa Menjalin',
                province: 'Kalimantan Barat',
                regency: 'Kabupaten Landak',
                startDate: '2024-03-10',
                endDate: '2024-03-14',
                budgetAllocated: 65000000,
                budgetSpent: 62400000,
                status: 'Selesai',
                leadPerson: 'Rian Pangestu, ST (GIS Officer)',
                indicators: [
                  {
                    id: 'ind-act1.1.1',
                    code: 'IND-ACT1.1.1',
                    level: 'Activity',
                    parentId: 'act-1.1.1',
                    name: 'Jumlah pemuda & perempuan adat terlatih pemetaan spasial',
                    definition: 'Peserta yang menyelesaikan minimal 80% modul dan simulasi lapangan',
                    baseline: 0,
                    target: 40,
                    actual: 42,
                    unit: 'Orang / Individu',
                    meansOfVerification: 'Daftar presensi, foto kegiatan, dan hasil peta latihan',
                    movDocuments: [
                      {
                        id: 'mov-act111-1',
                        title: 'Daftar Presensi Tervalidasi Pelatihan Pemetaan Spasial',
                        category: 'Daftar Hadir / Absensi',
                        fileName: 'Absensi_Pelatihan_Pemetaan_Menjalin_2024.pdf',
                        fileSize: '1.8 MB',
                        uploadedAt: '2024-03-15',
                        uploadedBy: 'Margaretha Simangunsong',
                        notes: 'Daftar hadir 42 peserta pemuda & perempuan adat dengan kolom disabilitas terverifikasi'
                      },
                      {
                        id: 'mov-act111-2',
                        title: 'Dokumentasi Foto Lapangan Penggunaan GPS & Drone Mapping',
                        category: 'Dokumentasi Foto & Video',
                        fileName: 'Foto_Drone_GPS_Training_Kalbar.jpg',
                        fileSize: '3.5 MB',
                        uploadedAt: '2024-03-16',
                        uploadedBy: 'Rian Pangestu (GIS Officer)',
                        notes: 'Foto resolusi tinggi saat praktik navigasi waypoint di batas hutan adat'
                      },
                      {
                        id: 'mov-act111-3',
                        title: 'Modul Pelatihan Pemetaan Geospasial Partisipatif Bahasa Indonesia',
                        category: 'Materi & Modul Pelatihan',
                        fileName: 'Modul_Panduan_GIS_Masyarakat_Adat.pdf',
                        fileSize: '6.1 MB',
                        uploadedAt: '2024-03-08',
                        uploadedBy: 'Rian Pangestu (GIS Officer)',
                        notes: 'Panduan teknis pengoperasian QGIS dan Avenza Maps'
                      }
                    ],
                    frequency: 'Akhir Proyek',
                    status: 'Tercapai',
                    lastUpdated: '2024-03-15'
                  }
                ],
                createdAt: '2024-02-01'
              },
              {
                id: 'act-1.1.2',
                outputId: 'op-1.1',
                code: 'ACT-1.1.2',
                title: 'Musyawarah Adat Penetapan Tata Ruang Tradisional & Perlindungan Mata Air',
                description: 'Musyawarah inklusif menghadirkan tetua adat, tokoh perempuan, dan penyandang disabilitas desa.',
                location: 'Kec. Siding',
                province: 'Kalimantan Barat',
                regency: 'Kabupaten Bengkayang',
                startDate: '2024-06-20',
                endDate: '2024-06-22',
                budgetAllocated: 48000000,
                budgetSpent: 47200000,
                status: 'Selesai',
                leadPerson: 'Margaretha Simangunsong (Community Engagement)',
                indicators: [
                  {
                    id: 'ind-act1.1.2',
                    code: 'IND-ACT1.1.2',
                    level: 'Activity',
                    parentId: 'act-1.1.2',
                    name: 'Jumlah tetua dan warga IPLC yang menyepakati Berita Acara Adat',
                    definition: 'Partisipan musyawarah adat',
                    baseline: 0,
                    target: 60,
                    actual: 65,
                    unit: 'Orang / Individu',
                    meansOfVerification: 'Berita acara musyawarah bertandatangan',
                    movDocuments: [
                      {
                        id: 'mov-act112-1',
                        title: 'Berita Acara Kesepakatan Tata Ruang Adat Desa Siding',
                        category: 'Berita Acara / Notulensi',
                        fileName: 'Berita_Acara_Musyawarah_Adat_Siding.pdf',
                        fileSize: '3.4 MB',
                        uploadedAt: '2024-06-23',
                        uploadedBy: 'Margaretha Simangunsong',
                        notes: 'Ditandatangani oleh 65 tetua adat, kepala desa, dan ketua kelompok perempuan'
                      },
                      {
                        id: 'mov-act112-2',
                        title: 'Foto Musyawarah Adat Inklusif di Balai Desa Siding',
                        category: 'Dokumentasi Foto & Video',
                        fileName: 'Foto_Musyawarah_Inklusif_Siding.jpg',
                        fileSize: '2.9 MB',
                        uploadedAt: '2024-06-24',
                        uploadedBy: 'Margaretha Simangunsong',
                        notes: 'Dokumentasi kehadiran warga perempuan dan pemuda dalam sesi pemaparan zona lindung mata air'
                      }
                    ],
                    frequency: 'Akhir Proyek',
                    status: 'Tercapai',
                    lastUpdated: '2024-06-23'
                  }
                ],
                createdAt: '2024-05-10'
              }
            ]
          }
        ]
      },
      {
        id: 'oc-2',
        projectId: 'proj-01',
        code: 'OC-2',
        title: 'Pengembangan Usaha Agroforestri Berkelanjutan & HHBK Ramah Inklusi',
        description: 'Pemberdayaan ekonomi hasil hutan bukan kayu (madu hutan, tengkawang, kopi hutan, anyaman rotan) ramah disabilitas dan perempuan.',
        indicators: [
          {
            id: 'ind-oc2.1',
            code: 'IND-OC2.1',
            level: 'Outcome',
            parentId: 'oc-2',
            name: 'Jumlah unit usaha kelompok tani hutan adat (KTH) yang mandiri',
            definition: 'KTH yang memiliki izin usaha dan omzet stabil > Rp 15 juta/bulan',
            baseline: 1,
            target: 6,
            actual: 5,
            unit: 'Kelompok / Organisasi',
            meansOfVerification: 'Buku kas kelompok dan izin NIB Usaha',
            frequency: 'Semesteran',
            status: 'Sesuai Target (On-Track)',
            lastUpdated: '2026-06-10'
          }
        ],
        outputs: [
          {
            id: 'op-2.1',
            outcomeId: 'oc-2',
            code: 'OP-2.1',
            title: 'Peralatan & Pelatihan Pengolahan Pascapanen HHBK Inklusif',
            description: 'Fasilitasi mesin pemeras madu higienis, rumah pengeringan, dan sentra kerajinan ramah aksesibilitas fisik.',
            targetDate: '2025-12-31',
            indicators: [
              {
                id: 'ind-op2.1.1',
                code: 'IND-OP2.1.1',
                level: 'Output',
                parentId: 'op-2.1',
                name: 'Jumlah penerima manfaat terdeduplikasi yang memperoleh sertifikasi higienitas & pelatihan HHBK',
                definition: 'Individu unik terlatih',
                baseline: 0,
                target: 250,
                actual: 220,
                unit: 'Orang / Individu',
                meansOfVerification: 'Sertifikat kelulusan & presensi biometric/kartu',
                frequency: 'Triwulanan',
                status: 'Sesuai Target (On-Track)',
                lastUpdated: '2026-05-25'
              }
            ],
            activities: [
              {
                id: 'act-2.1.1',
                outputId: 'op-2.1',
                code: 'ACT-2.1.1',
                title: 'Pelatihan Pascapanen Madu Hutan Lestari & Pengemasan Ramah Disabilitas',
                description: 'Pelatihan teknik panen lestari madu lebah Apis dorsata tanpa menebang sarang dan packaging inklusif.',
                location: 'Kec. Putussibau Selatan',
                province: 'Kalimantan Barat',
                regency: 'Kabupaten Kapuas Hulu',
                startDate: '2025-02-15',
                endDate: '2025-02-18',
                budgetAllocated: 75000000,
                budgetSpent: 71800000,
                status: 'Selesai',
                leadPerson: 'Hendrikus Balan (Livelihood Specialist)',
                indicators: [
                  {
                    id: 'ind-act2.1.1',
                    code: 'IND-ACT2.1.1',
                    level: 'Activity',
                    parentId: 'act-2.1.1',
                    name: 'Peserta panen madu dan higienitas kemasan',
                    definition: 'Jumlah anggota KTH terlatih',
                    baseline: 0,
                    target: 50,
                    actual: 55,
                    unit: 'Orang / Individu',
                    meansOfVerification: 'Lembar absensi bertandatangan',
                    frequency: 'Akhir Proyek',
                    status: 'Tercapai',
                    lastUpdated: '2025-02-20'
                  }
                ],
                createdAt: '2025-01-10'
              },
              {
                id: 'act-2.1.2',
                outputId: 'op-2.1',
                code: 'ACT-2.1.2',
                title: 'Workshop Desain Kerajinan Anyaman Rotan bagi Kelompok Perempuan & Disabilitas Netra/Fisik',
                description: 'Peningkatan nilai tambah motif tenun Dayak tradisional berorientasi pasar ekspor berkelanjutan.',
                location: 'Desa Bagak Sahwa',
                province: 'Kalimantan Barat',
                regency: 'Kota Singkawang',
                startDate: '2025-07-05',
                endDate: '2025-07-08',
                budgetAllocated: 55000000,
                budgetSpent: 53900000,
                status: 'Selesai',
                leadPerson: 'Siti Nurhaliza (Inclusion Officer)',
                indicators: [
                  {
                    id: 'ind-act2.1.2',
                    code: 'IND-ACT2.1.2',
                    level: 'Activity',
                    parentId: 'act-2.1.2',
                    name: 'Partisipan perempuan dan penyandang disabilitas terlatih',
                    definition: 'Peserta aktif workshop',
                    baseline: 0,
                    target: 45,
                    actual: 48,
                    unit: 'Orang / Individu',
                    meansOfVerification: 'Presensi, dokumentasi video, katalog produk',
                    frequency: 'Akhir Proyek',
                    status: 'Tercapai',
                    lastUpdated: '2025-07-10'
                  }
                ],
                createdAt: '2025-06-01'
              }
            ]
          }
        ]
      }
    ],
    teamMembers: [
      {
        id: 'tm-1',
        name: 'Dr. Andreas B. Kurniawan',
        role: 'Project Manager / Team Leader',
        email: 'andreas.kurniawan@konservasinusantara.org',
        phone: '+62 812-4567-8901',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
        assignedOutcomes: ['oc-1', 'oc-2']
      },
      {
        id: 'tm-2',
        name: 'Margaretha Simangunsong, M.Sc',
        role: 'Senior M&E Specialist',
        email: 'margaretha.mne@konservasinusantara.org',
        phone: '+62 813-8899-2211',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
        assignedOutcomes: ['oc-1', 'oc-2']
      },
      {
        id: 'tm-3',
        name: 'Hendrikus Balan',
        role: 'Field Livelihood Coordinator',
        email: 'hendrikus.balan@konservasinusantara.org',
        phone: '+62 852-7711-3344',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
        assignedOutcomes: ['oc-2']
      },
      {
        id: 'tm-4',
        name: 'Siti Nurhaliza, S.Sos',
        role: 'Gender, Equality & Social Inclusion (GESI) Officer',
        email: 'siti.nurhaliza@konservasinusantara.org',
        phone: '+62 878-9900-1122',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80',
        assignedOutcomes: ['oc-1', 'oc-2']
      }
    ],
    createdAt: '2024-01-05'
  },
  {
    id: 'proj-02',
    code: 'FS-NTT-02',
    title: 'Inklusi Ketahanan Pangan & Adaptasi Iklim Ramah Disabilitas NTT',
    donor: 'Australian Aid & DFAT Climate Resilience Fund',
    partnerOrg: 'Konsorsium Inklusi Pangan NTT',
    budgetTotal: 2800000000,
    budgetCurrency: 'IDR',
    startDate: '2024-06-01',
    endDate: '2027-05-31',
    status: 'Aktif',
    province: 'Nusa Tenggara Timur',
    targetLocations: ['Kec. Rindi (Sumba Timur)', 'Kec. Mollo Utara (TTS)', 'Kec. Insana (TTU)'],
    targetVillages: ['Desa Haulasi', 'Desa Fatumnasi', 'Desa Kayuri', 'Desa Boking'],
    goalStatement: 'Meningkatkan ketahanan pangan dan kapasitas adaptasi iklim 1.200 keluarga rentan di NTT melalui pertanian ramah iklim dan teknologi inklusif disabilitas.',
    goalIndicators: [
      {
        id: 'ind-p2-g1',
        code: 'IND-P2-GOAL.1',
        level: 'Goal',
        parentId: 'proj-02',
        name: 'Penurunan indeks keparahan kerawanan pangan (FIES) keluarga dampingan',
        definition: 'Persentase rumah tangga dengan skor FIES kategori aman/moderat',
        baseline: 35,
        target: 80,
        actual: 62,
        unit: 'Persentase (%)',
        meansOfVerification: 'Survei tahunan FIES berbasis tablet CAPI',
        frequency: 'Tahunan',
        status: 'Sesuai Target (On-Track)',
        lastUpdated: '2026-06-15'
      }
    ],
    outcomes: [
      {
        id: 'oc-2-1',
        projectId: 'proj-02',
        code: 'OC-1',
        title: 'Penerapan Teknologi Pertanian Cerdas Iklim Aksesibel Disabilitas',
        description: 'Petani disabilitas, lansia, dan perempuan memiliki akses ke irigasi tetes gravitasi, benih lokal tahan kering, dan kebun gizi bertingkat.',
        indicators: [
          {
            id: 'ind-p2-oc1.1',
            code: 'IND-P2-OC1.1',
            level: 'Outcome',
            parentId: 'oc-2-1',
            name: 'Jumlah demplot kebun gizi aksesibel yang berproduksi mandiri',
            definition: 'Kebun dengan raised beds (bedengan bertingkat untuk kursi roda/tongkat) dan irigasi tetes',
            baseline: 0,
            target: 30,
            actual: 24,
            unit: 'Unit / Sarana',
            meansOfVerification: 'Laporan monitoring fisik dan catatan panen mingguan',
            frequency: 'Triwulanan',
            status: 'Sesuai Target (On-Track)',
            lastUpdated: '2026-07-10'
          }
        ],
        outputs: [
          {
            id: 'op-2-1.1',
            outcomeId: 'oc-2-1',
            code: 'OP-1.1',
            title: 'Distribusi Paket Sarana & Pelatihan Irigasi Tetes Ramah Disabilitas',
            description: 'Penyaluran sarana produksi pertanian dan pendampingan teknis lapangan.',
            targetDate: '2025-11-30',
            indicators: [
              {
                id: 'ind-p2-op1.1.1',
                code: 'IND-P2-OP1.1.1',
                level: 'Output',
                parentId: 'op-2-1.1',
                name: 'Penerima manfaat disabilitas & lansia penerima sarana kebun gizi',
                definition: 'Individu unik terverifikasi',
                baseline: 0,
                target: 180,
                actual: 155,
                unit: 'Orang / Individu',
                meansOfVerification: 'Berita acara serah terima & foto geotagging',
                frequency: 'Bulanan',
                status: 'Sesuai Target (On-Track)',
                lastUpdated: '2026-07-20'
              }
            ],
            activities: [
              {
                id: 'act-p2-1.1.1',
                outputId: 'op-2-1.1',
                code: 'ACT-1.1.1',
                title: 'Pelatihan Pembuatan Pupuk Organik Cair & Kebun Sayur Ramah Lansia/Disabilitas',
                description: 'Pelatihan praktis ramah ragam hambatan mobilitas dan netra dengan media audio & tactile.',
                location: 'Desa Haulasi, Kec. Miomaffo Timur',
                province: 'Nusa Tenggara Timur',
                regency: 'Kabupaten Timor Tengah Utara',
                startDate: '2025-04-12',
                endDate: '2025-04-14',
                budgetAllocated: 52000000,
                budgetSpent: 49500000,
                status: 'Selesai',
                leadPerson: 'Maria Fransiska, S.P (Agronomist)',
                indicators: [
                  {
                    id: 'ind-act-p2-1',
                    code: 'IND-ACT-P2-1',
                    level: 'Activity',
                    parentId: 'act-p2-1.1.1',
                    name: 'Peserta petani rentan dan pendamping keluarga',
                    definition: 'Jumlah partisipan',
                    baseline: 0,
                    target: 40,
                    actual: 44,
                    unit: 'Orang / Individu',
                    meansOfVerification: 'Presensi acara & dokumentasi',
                    frequency: 'Akhir Proyek',
                    status: 'Tercapai',
                    lastUpdated: '2025-04-15'
                  }
                ],
                createdAt: '2025-03-01'
              }
            ]
          }
        ]
      }
    ],
    teamMembers: [
      {
        id: 'tm-5',
        name: 'Drs. Yulius Tefa',
        role: 'Project Director',
        email: 'yulius.tefa@inklusi-ntt.org',
        phone: '+62 821-4455-6677',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
        assignedOutcomes: ['oc-2-1']
      },
      {
        id: 'tm-6',
        name: 'Maria Fransiska, S.P',
        role: 'Field Agriculture & Inclusion Lead',
        email: 'maria.fransiska@inklusi-ntt.org',
        phone: '+62 813-7788-9900',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
        assignedOutcomes: ['oc-2-1']
      }
    ],
    createdAt: '2024-05-15'
  }
];

export const INITIAL_BENEFICIARIES: Beneficiary[] = [
  // Beneficiaries Kalimantan Barat Project
  {
    id: 'ben-001',
    nikOrIdentifier: '6108041208940001',
    fullName: 'Yohanes Lawing',
    gender: 'Laki-laki',
    birthYear: 1994,
    age: 32,
    ageGroup: '25-40',
    targetGroup: 'Population of the project communities',
    beneficiaryLevel: 'Desa',
    levelName: 'Desa Menjalin',
    hasDisability: false,
    iplcStatus: 'Masyarakat Adat (Indigenous Peoples)',
    customIplcCommunityName: 'Suku Dayak Kanayatn',
    province: 'Kalimantan Barat',
    regency: 'Kabupaten Landak',
    village: 'Desa Menjalin',
    phone: '081255443321',
    occupation: 'Petani Karet & Tim Patroli Hutan Adat',
    createdAt: '2024-03-01'
  },
  {
    id: 'ben-002',
    nikOrIdentifier: '6108045503020003',
    fullName: 'Theresia Linda',
    gender: 'Perempuan',
    birthYear: 2002,
    age: 24,
    ageGroup: '18-24',
    targetGroup: 'Population of the project communities',
    beneficiaryLevel: 'Desa',
    levelName: 'Desa Menjalin',
    hasDisability: false,
    iplcStatus: 'Masyarakat Adat (Indigenous Peoples)',
    customIplcCommunityName: 'Suku Dayak Kanayatn',
    province: 'Kalimantan Barat',
    regency: 'Kabupaten Landak',
    village: 'Desa Menjalin',
    phone: '085244332211',
    occupation: 'Pemudi Adat / Petugas Pemetaan Spasial',
    createdAt: '2024-03-01'
  },
  {
    id: 'ben-003',
    nikOrIdentifier: '6101031505800002',
    fullName: 'Paulus Jantan',
    gender: 'Laki-laki',
    birthYear: 1980,
    age: 46,
    ageGroup: '41-64',
    targetGroup: 'Population of the project communities',
    beneficiaryLevel: 'Desa',
    levelName: 'Desa Menua Sadap',
    hasDisability: true,
    disabilityType: 'Fisik / Motorik / Mobilitas',
    disabilityDifficultyLevel: '3. Fairly difficult',
    disabilityBarrierNotes: 'Kaki kanan mengalami cedera permanen, menggunakan kruk/tongkat penyangga',
    iplcStatus: 'Masyarakat Adat (Indigenous Peoples)',
    customIplcCommunityName: 'Suku Dayak Iban',
    province: 'Kalimantan Barat',
    regency: 'Kabupaten Kapuas Hulu',
    village: 'Desa Menua Sadap',
    phone: '081399887766',
    occupation: 'Pemanen Madu Pohon Lalau & Pengrajin Bambu',
    createdAt: '2024-03-05'
  },
  {
    id: 'ben-004',
    nikOrIdentifier: '6101036811750004',
    fullName: 'Katarina Ubun',
    gender: 'Perempuan',
    birthYear: 1975,
    age: 51,
    ageGroup: '41-64',
    targetGroup: 'Population of the project communities',
    beneficiaryLevel: 'Desa',
    levelName: 'Desa Menua Sadap',
    hasDisability: false,
    iplcStatus: 'Masyarakat Adat (Indigenous Peoples)',
    customIplcCommunityName: 'Suku Dayak Iban',
    province: 'Kalimantan Barat',
    regency: 'Kabupaten Kapuas Hulu',
    village: 'Desa Menua Sadap',
    phone: '082144335566',
    occupation: 'Ketua Kelompok Perempuan Pengrajin Tenun Pewarna Alami',
    createdAt: '2024-03-05'
  },
  {
    id: 'ben-005',
    nikOrIdentifier: '6102061010550001',
    fullName: 'Akiang Petrus',
    gender: 'Laki-laki',
    birthYear: 1955,
    age: 71,
    ageGroup: '65+',
    targetGroup: 'Population of the project communities',
    beneficiaryLevel: 'Desa',
    levelName: 'Desa Siding',
    hasDisability: false,
    iplcStatus: 'Masyarakat Adat (Indigenous Peoples)',
    customIplcCommunityName: 'Suku Dayak Bakati',
    province: 'Kalimantan Barat',
    regency: 'Kabupaten Bengkayang',
    village: 'Desa Siding',
    phone: '085388776655',
    occupation: 'Tetua Adat / Penjaga Cerita Lisan Wilayah Adat',
    createdAt: '2024-03-10'
  },
  {
    id: 'ben-006',
    nikOrIdentifier: '6102064509050002',
    fullName: 'Maria Veronika',
    gender: 'Perempuan',
    birthYear: 2005,
    age: 21,
    ageGroup: '18-24',
    targetGroup: 'Population of the project communities',
    beneficiaryLevel: 'Desa',
    levelName: 'Desa Siding',
    hasDisability: true,
    disabilityType: 'Rungu / Pendengaran',
    disabilityDifficultyLevel: '2. Very difficult',
    disabilityBarrierNotes: 'Tuli, memerlukan bahasa isyarat visual dan materi bergambar',
    iplcStatus: 'Masyarakat Adat (Indigenous Peoples)',
    customIplcCommunityName: 'Suku Dayak Bakati',
    province: 'Kalimantan Barat',
    regency: 'Kabupaten Bengkayang',
    village: 'Desa Siding',
    phone: '089611223344',
    occupation: 'Pengrajin Anyaman Motif Adat',
    createdAt: '2024-03-10'
  },
  {
    id: 'ben-007',
    nikOrIdentifier: '6172011202150005',
    fullName: 'Gabriel Kenji',
    gender: 'Laki-laki',
    birthYear: 2015,
    age: 11,
    ageGroup: '6-12',
    targetGroup: 'Population of the project communities',
    beneficiaryLevel: 'Desa',
    levelName: 'Desa Bagak Sahwa',
    hasDisability: false,
    iplcStatus: 'Komunitas Lokal (Local Communities)',
    customIplcCommunityName: 'Komunitas Tani Tepian Hutan Singkawang',
    province: 'Kalimantan Barat',
    regency: 'Kota Singkawang',
    village: 'Desa Bagak Sahwa',
    phone: '-',
    occupation: 'Pelajar Sekolah Dasar (Pendidikan Konservasi Cilik)',
    createdAt: '2024-03-15'
  },
  {
    id: 'ben-008',
    nikOrIdentifier: '6172015206880001',
    fullName: 'Nur Aisyah',
    gender: 'Perempuan',
    birthYear: 1988,
    age: 38,
    ageGroup: '25-40',
    targetGroup: 'Population of the project communities',
    beneficiaryLevel: 'Desa',
    levelName: 'Desa Bagak Sahwa',
    hasDisability: false,
    iplcStatus: 'Komunitas Lokal (Local Communities)',
    customIplcCommunityName: 'Komunitas Perempuan Pengolah Tengkawang',
    province: 'Kalimantan Barat',
    regency: 'Kota Singkawang',
    village: 'Desa Bagak Sahwa',
    phone: '081299881122',
    occupation: 'Pengolah Lemak Tengkawang & Sabun Alami',
    createdAt: '2024-03-15'
  },
  {
    id: 'ben-009',
    nikOrIdentifier: '6108041001990008',
    fullName: 'Donatus Budi',
    gender: 'Laki-laki',
    birthYear: 1999,
    age: 27,
    ageGroup: '25-40',
    targetGroup: 'Intermediaries: NGOs / CSOs',
    beneficiaryLevel: 'Kecamatan',
    levelName: 'Kecamatan Menjalin',
    institutionOrAgency: 'Lembaga Pengelola Hutan Desa (LPHD)',
    hasDisability: false,
    iplcStatus: 'Bukan IPLC (Non-IPLC)',
    province: 'Kalimantan Barat',
    regency: 'Kabupaten Landak',
    village: 'Desa Hilir Kantor',
    phone: '082255667788',
    occupation: 'Penyuluh Kehutanan Swadaya Masyarakat (PKSM)',
    createdAt: '2024-03-20'
  },
  {
    id: 'ben-010',
    nikOrIdentifier: '6108044203600007',
    fullName: 'Nenek Paulina',
    gender: 'Perempuan',
    birthYear: 1960,
    age: 66,
    ageGroup: '65+',
    targetGroup: 'Population of the project communities',
    beneficiaryLevel: 'Desa',
    levelName: 'Desa Menjalin',
    hasDisability: true,
    disabilityType: 'Netra / Penglihatan',
    disabilityDifficultyLevel: '2. Very difficult',
    disabilityBarrierNotes: 'Low vision / penglihatan terbatas, terbiasa menenun dengan rabaan tekstur',
    iplcStatus: 'Masyarakat Adat (Indigenous Peoples)',
    customIplcCommunityName: 'Suku Dayak Kanayatn',
    province: 'Kalimantan Barat',
    regency: 'Kabupaten Landak',
    village: 'Desa Menjalin',
    phone: '-',
    occupation: 'Pengrajin Tradisional & Maestro Pewarna Alami',
    createdAt: '2024-04-01'
  },
  
  // Beneficiaries NTT Project
  {
    id: 'ben-011',
    nikOrIdentifier: '5302011504900001',
    fullName: 'Marten Kase',
    gender: 'Laki-laki',
    birthYear: 1990,
    age: 36,
    ageGroup: '25-40',
    targetGroup: 'Population of the project communities',
    beneficiaryLevel: 'Desa',
    levelName: 'Desa Fatumnasi',
    hasDisability: true,
    disabilityType: 'Fisik / Motorik / Mobilitas',
    disabilityDifficultyLevel: '1. Extremely difficult',
    disabilityBarrierNotes: 'Pengguna kursi roda akibat polio sejak anak-anak, mengelola kebun sayur bedengan tinggi',
    iplcStatus: 'Masyarakat Adat (Indigenous Peoples)',
    customIplcCommunityName: 'Masyarakat Adat Amanuban',
    province: 'Nusa Tenggara Timur',
    regency: 'Kabupaten Timor Tengah Selatan',
    village: 'Desa Fatumnasi',
    phone: '081339884422',
    occupation: 'Petani Sayur Hortikultura Inklusif',
    createdAt: '2024-06-10'
  },
  {
    id: 'ben-012',
    nikOrIdentifier: '5302015508820003',
    fullName: 'Elisabeth Nubatonis',
    gender: 'Perempuan',
    birthYear: 1982,
    age: 44,
    ageGroup: '41-64',
    targetGroup: 'Population of the project communities',
    beneficiaryLevel: 'Desa',
    levelName: 'Desa Fatumnasi',
    hasDisability: false,
    iplcStatus: 'Masyarakat Adat (Indigenous Peoples)',
    customIplcCommunityName: 'Masyarakat Adat Amanuban',
    province: 'Nusa Tenggara Timur',
    regency: 'Kabupaten Timor Tengah Selatan',
    village: 'Desa Fatumnasi',
    phone: '082146778899',
    occupation: 'Ketua Kelompok Wanita Tani (KWT) Mawar Inklusi',
    createdAt: '2024-06-10'
  },
  {
    id: 'ben-013',
    nikOrIdentifier: '5303021101030002',
    fullName: 'Dominggus Bano',
    gender: 'Laki-laki',
    birthYear: 2003,
    age: 23,
    ageGroup: '18-24',
    targetGroup: 'Population of the project communities',
    beneficiaryLevel: 'Desa',
    levelName: 'Desa Haulasi',
    hasDisability: false,
    iplcStatus: 'Komunitas Lokal (Local Communities)',
    customIplcCommunityName: 'Komunitas Tani Lembah Miomaffo',
    province: 'Nusa Tenggara Timur',
    regency: 'Kabupaten Timor Tengah Utara',
    village: 'Desa Haulasi',
    phone: '085239112233',
    occupation: 'Operator Instalasi Irigasi Tetes Surya',
    createdAt: '2024-06-15'
  },
  {
    id: 'ben-014',
    nikOrIdentifier: '5303024807570001',
    fullName: 'Mama Marta Taena',
    gender: 'Perempuan',
    birthYear: 1957,
    age: 69,
    ageGroup: '65+',
    targetGroup: 'Population of the project communities',
    beneficiaryLevel: 'Desa',
    levelName: 'Desa Haulasi',
    hasDisability: false,
    iplcStatus: 'Komunitas Lokal (Local Communities)',
    customIplcCommunityName: 'Komunitas Tani Lembah Miomaffo',
    province: 'Nusa Tenggara Timur',
    regency: 'Kabupaten Timor Tengah Utara',
    village: 'Desa Haulasi',
    phone: '-',
    occupation: 'Petani Pangan Lokal Sorgum & Kacang Hutan',
    createdAt: '2024-06-15'
  },
  {
    id: 'ben-015',
    nikOrIdentifier: '5303022003140004',
    fullName: 'Yosep Kolo',
    gender: 'Laki-laki',
    birthYear: 2014,
    age: 12,
    ageGroup: '6-12',
    targetGroup: 'Population of the project communities',
    beneficiaryLevel: 'Desa',
    levelName: 'Desa Haulasi',
    hasDisability: true,
    disabilityType: 'Intelektual / Mental / Psikososial',
    disabilityDifficultyLevel: '3. Fairly difficult',
    disabilityBarrierNotes: 'Hambatan perkembangan intelektual, didampingi keluarga dalam kegiatan kebun gizi',
    iplcStatus: 'Komunitas Lokal (Local Communities)',
    customIplcCommunityName: 'Komunitas Tani Lembah Miomaffo',
    province: 'Nusa Tenggara Timur',
    regency: 'Kabupaten Timor Tengah Utara',
    village: 'Desa Haulasi',
    phone: '-',
    occupation: 'Anak Penerima Manfaat Kebun Gizi Sekolah',
    createdAt: '2024-06-20'
  },
  {
    id: 'ben-016',
    nikOrIdentifier: '5311026010920005',
    fullName: 'Rambu Ana Hida',
    gender: 'Perempuan',
    birthYear: 1992,
    age: 34,
    ageGroup: '25-40',
    targetGroup: 'Population of the project communities',
    beneficiaryLevel: 'Desa',
    levelName: 'Desa Rindi',
    hasDisability: false,
    iplcStatus: 'Masyarakat Adat (Indigenous Peoples)',
    customIplcCommunityName: 'Masyarakat Adat Marapu Sumba',
    province: 'Nusa Tenggara Timur',
    regency: 'Kabupaten Sumba Timur',
    village: 'Desa Rindi',
    phone: '081338445566',
    occupation: 'Pengelola Lumbung Pangan Adat Marapu',
    createdAt: '2024-06-25'
  },
  {
    id: 'ben-017',
    nikOrIdentifier: '5311021404010006',
    fullName: 'Ir. Stefanus Kornelis, M.Si',
    gender: 'Laki-laki',
    birthYear: 1981,
    age: 45,
    ageGroup: '41-64',
    targetGroup: 'Actors in the municipal, district and provincial administrations',
    beneficiaryLevel: 'Kabupaten',
    levelName: 'Kabupaten Sumba Timur',
    institutionOrAgency: 'Dinas Pertanian dan Pangan Sumba Timur',
    hasDisability: false,
    iplcStatus: 'Bukan IPLC (Non-IPLC)',
    province: 'Nusa Tenggara Timur',
    regency: 'Kabupaten Sumba Timur',
    village: 'Kota Waingapu',
    phone: '082145667700',
    occupation: 'Kepala Bidang Sarana & Prasarana Pertanian',
    createdAt: '2024-06-25'
  },
  {
    id: 'ben-018',
    nikOrIdentifier: '5311025501980007',
    fullName: 'Rambu Yuliana',
    gender: 'Perempuan',
    birthYear: 1998,
    age: 28,
    ageGroup: '25-40',
    targetGroup: 'Population of the project communities',
    beneficiaryLevel: 'Desa',
    levelName: 'Desa Rindi',
    hasDisability: true,
    disabilityType: 'Wicara / Komunikasi',
    disabilityDifficultyLevel: '4. Slightly difficult',
    disabilityBarrierNotes: 'Bisu/hambatan wicara, berkomunikasi dengan teks visual dan gestur',
    iplcStatus: 'Masyarakat Adat (Indigenous Peoples)',
    customIplcCommunityName: 'Masyarakat Adat Marapu Sumba',
    province: 'Nusa Tenggara Timur',
    regency: 'Kabupaten Sumba Timur',
    village: 'Desa Rindi',
    phone: '085239998877',
    occupation: 'Peternak Ayam Kampung & Sayur Organik',
    createdAt: '2024-06-25'
  }
];

export const INITIAL_ATTENDANCES: ActivityAttendance[] = [
  // Activity 1: ACT-1.1.1 (Pelatihan Pemetaan Spasial Landak)
  {
    id: 'att-01',
    activityId: 'act-1.1.1',
    projectId: 'proj-01',
    beneficiaryId: 'ben-001', // Yohanes Lawing
    attendanceDate: '2024-03-10',
    roleInActivity: 'Peserta',
    attendanceStatus: 'Hadir Penuh',
    notes: 'Menguasai pengambilan titik koordinat GPS batas wilayah adat',
    verifiedBy: 'Rian Pangestu (GIS Officer)'
  },
  {
    id: 'att-02',
    activityId: 'act-1.1.1',
    projectId: 'proj-01',
    beneficiaryId: 'ben-002', // Theresia Linda (Youth Women)
    attendanceDate: '2024-03-10',
    roleInActivity: 'Peserta',
    attendanceStatus: 'Hadir Penuh',
    notes: 'Terpilih menjadi koordinator tim GIS pemuda desa',
    verifiedBy: 'Rian Pangestu (GIS Officer)'
  },
  {
    id: 'att-03',
    activityId: 'act-1.1.1',
    projectId: 'proj-01',
    beneficiaryId: 'ben-009', // Donatus Budi
    attendanceDate: '2024-03-10',
    roleInActivity: 'Fasilitator',
    attendanceStatus: 'Hadir Penuh',
    notes: 'Mendampingi simulasi alat ukur GPS Garmin',
    verifiedBy: 'Rian Pangestu (GIS Officer)'
  },

  // Activity 2: ACT-1.1.2 (Musyawarah Adat Siding Bengkayang)
  {
    id: 'att-04',
    activityId: 'act-1.1.2',
    projectId: 'proj-01',
    beneficiaryId: 'ben-005', // Akiang Petrus (Elder 71 yo)
    attendanceDate: '2024-06-20',
    roleInActivity: 'Narasumber',
    attendanceStatus: 'Hadir Penuh',
    notes: 'Memimpin pembacaan sumpah adat penjagaan hutan larangan',
    verifiedBy: 'Margaretha Simangunsong'
  },
  {
    id: 'att-05',
    activityId: 'act-1.1.2',
    projectId: 'proj-01',
    beneficiaryId: 'ben-006', // Maria Veronika (Disability Rungu)
    attendanceDate: '2024-06-20',
    roleInActivity: 'Peserta',
    attendanceStatus: 'Hadir Penuh',
    notes: 'Didampingi penerjemah isyarat komunitas',
    verifiedBy: 'Margaretha Simangunsong'
  },
  {
    id: 'att-06',
    activityId: 'act-1.1.2',
    projectId: 'proj-01',
    beneficiaryId: 'ben-001', // Yohanes Lawing (PARTISIPASI KEDUA -> ANTI DOUBLE COUNTING DEMO!)
    attendanceDate: '2024-06-20',
    roleInActivity: 'Peserta',
    attendanceStatus: 'Hadir Penuh',
    notes: 'Memberikan paparan hasil peta GPS dari Menjalin sebagai studi banding',
    verifiedBy: 'Margaretha Simangunsong'
  },

  // Activity 3: ACT-2.1.1 (Pelatihan Madu Hutan Kapuas Hulu)
  {
    id: 'att-07',
    activityId: 'act-2.1.1',
    projectId: 'proj-01',
    beneficiaryId: 'ben-003', // Paulus Jantan (Disability Fisik)
    attendanceDate: '2025-02-15',
    roleInActivity: 'Peserta',
    attendanceStatus: 'Hadir Penuh',
    notes: 'Menerima paket alat panen higienis dan sarung tangan pengaman',
    verifiedBy: 'Hendrikus Balan'
  },
  {
    id: 'att-08',
    activityId: 'act-2.1.1',
    projectId: 'proj-01',
    beneficiaryId: 'ben-004', // Katarina Ubun
    attendanceDate: '2025-02-15',
    roleInActivity: 'Peserta',
    attendanceStatus: 'Hadir Penuh',
    notes: 'Praktik filtrasi madu tanpa pemanasan langsung',
    verifiedBy: 'Hendrikus Balan'
  },
  {
    id: 'att-09',
    activityId: 'act-2.1.1',
    projectId: 'proj-01',
    beneficiaryId: 'ben-001', // Yohanes Lawing (PARTISIPASI KETIGA -> TETAP 1 UNIQUE BENEFICIARY!)
    attendanceDate: '2025-02-15',
    roleInActivity: 'Peserta',
    attendanceStatus: 'Hadir Penuh',
    notes: 'Mempelajari diversifikasi produk madu untuk KTH Menjalin',
    verifiedBy: 'Hendrikus Balan'
  },

  // Activity 4: ACT-2.1.2 (Workshop Kerajinan Anyaman Singkawang)
  {
    id: 'att-10',
    activityId: 'act-2.1.2',
    projectId: 'proj-01',
    beneficiaryId: 'ben-006', // Maria Veronika (PARTISIPASI KEDUA -> ANTI DOUBLE COUNTING!)
    attendanceDate: '2025-07-05',
    roleInActivity: 'Peserta',
    attendanceStatus: 'Hadir Penuh',
    notes: 'Menyelesaikan 3 set contoh motif anyaman bambu modern',
    verifiedBy: 'Siti Nurhaliza'
  },
  {
    id: 'att-11',
    activityId: 'act-2.1.2',
    projectId: 'proj-01',
    beneficiaryId: 'ben-008', // Nur Aisyah
    attendanceDate: '2025-07-05',
    roleInActivity: 'Peserta',
    attendanceStatus: 'Hadir Penuh',
    notes: 'Mengintegrasikan anyaman sebagai packaging sabun tengkawang',
    verifiedBy: 'Siti Nurhaliza'
  },
  {
    id: 'att-12',
    activityId: 'act-2.1.2',
    projectId: 'proj-01',
    beneficiaryId: 'ben-010', // Nenek Paulina (Elder 66 yo, Disabilitas Netra)
    attendanceDate: '2025-07-05',
    roleInActivity: 'Narasumber',
    attendanceStatus: 'Hadir Penuh',
    notes: 'Mentransfer ilmu pewarna alami daun renggat ke generasi muda',
    verifiedBy: 'Siti Nurhaliza'
  },
  {
    id: 'att-13',
    activityId: 'act-2.1.2',
    projectId: 'proj-01',
    beneficiaryId: 'ben-007', // Gabriel Kenji (Child 11 yo)
    attendanceDate: '2025-07-05',
    roleInActivity: 'Peserta',
    attendanceStatus: 'Hadir Penuh',
    notes: 'Mengikuti kelas pengenalan tanaman hutan ramah anak',
    verifiedBy: 'Siti Nurhaliza'
  },

  // NTT Project Activity: ACT-p2-1.1.1 (Pelatihan Kebun Sayur Ramah Disabilitas)
  {
    id: 'att-14',
    activityId: 'act-p2-1.1.1',
    projectId: 'proj-02',
    beneficiaryId: 'ben-011', // Marten Kase (Disability Fisik / Kursi Roda)
    attendanceDate: '2025-04-12',
    roleInActivity: 'Peserta',
    attendanceStatus: 'Hadir Penuh',
    notes: 'Mencoba bedengan bertingkat dengan aksesibilitas kursi roda',
    verifiedBy: 'Maria Fransiska'
  },
  {
    id: 'att-15',
    activityId: 'act-p2-1.1.1',
    projectId: 'proj-02',
    beneficiaryId: 'ben-012', // Elisabeth Nubatonis
    attendanceDate: '2025-04-12',
    roleInActivity: 'Peserta',
    attendanceStatus: 'Hadir Penuh',
    notes: 'Praktik fermentasi mikroorganisme lokal (MOL)',
    verifiedBy: 'Maria Fransiska'
  },
  {
    id: 'att-16',
    activityId: 'act-p2-1.1.1',
    projectId: 'proj-02',
    beneficiaryId: 'ben-013', // Dominggus Bano (Youth 23)
    attendanceDate: '2025-04-12',
    roleInActivity: 'Peserta',
    attendanceStatus: 'Hadir Penuh',
    notes: 'Instalasi pipa lateral irigasi tetes gravitasi',
    verifiedBy: 'Maria Fransiska'
  },
  {
    id: 'att-17',
    activityId: 'act-p2-1.1.1',
    projectId: 'proj-02',
    beneficiaryId: 'ben-014', // Mama Marta (Elder 69)
    attendanceDate: '2025-04-12',
    roleInActivity: 'Peserta',
    attendanceStatus: 'Hadir Penuh',
    notes: 'Menyediakan bibit lokal tanaman jewawut dan kacang nasi',
    verifiedBy: 'Maria Fransiska'
  },
  {
    id: 'att-18',
    activityId: 'act-p2-1.1.1',
    projectId: 'proj-02',
    beneficiaryId: 'ben-015', // Yosep Kolo (Child 12, Disability Intelektual)
    attendanceDate: '2025-04-12',
    roleInActivity: 'Peserta',
    attendanceStatus: 'Hadir Penuh',
    notes: 'Didampingi keluarga menanam bibit sayur bayam merah',
    verifiedBy: 'Maria Fransiska'
  },
  {
    id: 'att-19',
    activityId: 'act-p2-1.1.1',
    projectId: 'proj-02',
    beneficiaryId: 'ben-016', // Rambu Ana Hida (Sumba)
    attendanceDate: '2025-04-12',
    roleInActivity: 'Peserta',
    attendanceStatus: 'Hadir Penuh',
    notes: 'Kaji terap penanganan hama nabati menggunakan daun mimba',
    verifiedBy: 'Maria Fransiska'
  },
  {
    id: 'att-20',
    activityId: 'act-p2-1.1.1',
    projectId: 'proj-02',
    beneficiaryId: 'ben-018', // Rambu Yuliana (Disability Wicara)
    attendanceDate: '2025-04-12',
    roleInActivity: 'Peserta',
    attendanceStatus: 'Hadir Penuh',
    notes: 'Menerima panduan bergambar pembuatan pupuk cair',
    verifiedBy: 'Maria Fransiska'
  }
];
