import { Beneficiary, Gender, AgeGroup, DisabilityType, IPLCStatus } from '../types';
import { calculateAgeGroup } from '../services/meEngine';

/**
 * Normalizes text for robust comparison:
 * - Lowercase
 * - Trims whitespaces & collapses multi-spaces
 * - Removes non-alphanumeric chars (excluding standard spaces)
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/gi, '') // remove special symbols/dots
    .replace(/\s+/g, ' ');
}

/**
 * Normalizes gender to standard form
 */
export function normalizeGender(gender: string | null | undefined): Gender {
  if (!gender) return 'Perempuan';
  const g = gender.toString().toLowerCase().trim();
  if (
    g.startsWith('l') || 
    g.startsWith('pria') || 
    g.startsWith('m') || 
    g === 'male' || 
    g === 'laki' || 
    g === 'cowok'
  ) {
    return 'Laki-laki';
  }
  return 'Perempuan';
}

/**
 * Generates the Strict Deduplication Composite Key
 * RULE:
 * Double counting occurs IF and ONLY IF (Nama, Jenis Kelamin, Alamat/Desa) are IDENTICAL.
 * If ANY of these 3 fields differs, they are considered DIFFERENT individuals.
 * NIK or ID is intentionally NOT used for deduplication identity comparison.
 */
export function getBeneficiaryIdentityKey(
  fullName: string,
  gender: string,
  villageOrAddress: string
): string {
  const normName = normalizeText(fullName);
  const normGender = normalizeGender(gender).toLowerCase();
  const normAddress = normalizeText(villageOrAddress);

  return `${normName}::${normGender}::${normAddress}`;
}

export interface ParsedImportRow {
  rowNumber: number;
  raw: Record<string, any>;
  
  // Mapped fields
  fullName: string;
  gender: Gender;
  village: string;
  regency: string;
  province: string;
  age: number;
  birthYear: number;
  ageGroup: AgeGroup;
  nikOrIdentifier: string;
  hasDisability: boolean;
  disabilityType?: DisabilityType;
  disabilityDifficultyLevel?: import('../types').DisabilityDifficultyLevel | string;
  disabilityBarrierNotes?: string;
  iplcStatus: IPLCStatus;
  customIplcCommunityName?: string;
  phone?: string;
  occupation?: string;

  // Validation & Deduplication status
  identityKey: string;
  status: 'valid_new' | 'duplicate_database' | 'duplicate_in_file' | 'invalid';
  validationErrors: string[];
  matchedExistingBeneficiary?: Beneficiary;
  duplicateOfRowNumber?: number;
  selectedForImport: boolean;
}

/**
 * Parses and maps arbitrary raw row keys from Excel/CSV to beneficiary fields
 */
export function mapRawRowToBeneficiaryFields(
  rawRow: Record<string, any>,
  rowNumber: number,
  defaultProvince: string = 'Kalimantan Barat',
  defaultRegency: string = 'Kabupaten Landak',
  defaultVillage: string = 'Desa Menjalin'
): {
  data: Partial<Beneficiary>;
  errors: string[];
} {
  const errors: string[] = [];

  // Helper to find value from possible key synonyms
  const findValue = (synonyms: string[]): any => {
    for (const key of Object.keys(rawRow)) {
      const cleanKey = key.trim().toLowerCase().replace(/[_\s-]+/g, '');
      for (const syn of synonyms) {
        const cleanSyn = syn.trim().toLowerCase().replace(/[_\s-]+/g, '');
        if (cleanKey === cleanSyn || cleanKey.includes(cleanSyn)) {
          const val = rawRow[key];
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            return val;
          }
        }
      }
    }
    return undefined;
  };

  // Full Name
  const rawName = findValue(['namalengkap', 'nama', 'fullname', 'peserta', 'beneficiaryname', 'name']);
  const fullName = rawName ? String(rawName).trim() : '';
  if (!fullName) {
    errors.push('Nama lengkap wajib diisi');
  }

  // Gender
  const rawGender = findValue(['jeniskelamin', 'gender', 'jk', 'sex', 'kelamin']);
  const gender: Gender = normalizeGender(rawGender);

  // Address / Village
  const rawVillage = findValue(['desa', 'kelurahan', 'alamat', 'village', 'address', 'lokasi', 'dusun', 'kampung']);
  const village = rawVillage ? String(rawVillage).trim() : defaultVillage;

  // Regency & Province
  const rawRegency = findValue(['kabupaten', 'kota', 'regency', 'kab', 'distrik']);
  const regency = rawRegency ? String(rawRegency).trim() : defaultRegency;

  const rawProvince = findValue(['provinsi', 'province', 'propinsi', 'prov']);
  const province = rawProvince ? String(rawProvince).trim() : defaultProvince;

  // Age Range / Age Group
  const rawAgeRange = findValue(['rentangusia', 'rentangumur', 'agegroup', 'kelompokusia', 'kategoriusia', 'rangeusia', 'rentang']);
  const rawAge = findValue(['usia', 'umur', 'age']);
  const rawBirthYear = findValue(['tahunlahir', 'tanggallahir', 'birthyear', 'thnlahir', 'dob']);

  let ageGroup: AgeGroup = '25-40';
  let age = 30;
  const currentYear = new Date().getFullYear();
  let birthYear = currentYear - 30;

  if (rawAgeRange !== undefined) {
    const rStr = String(rawAgeRange).trim().toLowerCase();
    if (rStr.includes('0-5') || rStr.includes('0 - 5') || rStr.includes('balita')) {
      ageGroup = '0-5';
      age = 3;
    } else if (rStr.includes('6-12') || rStr.includes('6 - 12') || rStr.includes('anak')) {
      ageGroup = '6-12';
      age = 9;
    } else if (rStr.includes('13-17') || rStr.includes('13 - 17') || rStr.includes('remaja')) {
      ageGroup = '13-17';
      age = 15;
    } else if (rStr.includes('18-24') || rStr.includes('18 - 24') || rStr.includes('pemuda') || rStr.includes('youth')) {
      ageGroup = '18-24';
      age = 21;
    } else if (rStr.includes('25-40') || rStr.includes('25 - 40') || rStr.includes('dewasa muda')) {
      ageGroup = '25-40';
      age = 32;
    } else if (rStr.includes('41-64') || rStr.includes('41 - 64') || rStr.includes('dewasa madya') || rStr.includes('25-64')) {
      ageGroup = '41-64';
      age = 50;
    } else if (rStr.includes('65') || rStr.includes('lansia') || rStr.includes('elderly')) {
      ageGroup = '65+';
      age = 68;
    }
  } else if (rawAge !== undefined) {
    const rawAgeStr = String(rawAge).trim();
    if (rawAgeStr.includes('-') || rawAgeStr.includes('+')) {
      if (rawAgeStr.includes('0-5')) ageGroup = '0-5';
      else if (rawAgeStr.includes('6-12')) ageGroup = '6-12';
      else if (rawAgeStr.includes('13-17')) ageGroup = '13-17';
      else if (rawAgeStr.includes('18-24')) ageGroup = '18-24';
      else if (rawAgeStr.includes('25-40')) ageGroup = '25-40';
      else if (rawAgeStr.includes('41-64')) ageGroup = '41-64';
      else if (rawAgeStr.includes('65')) ageGroup = '65+';
      else ageGroup = '25-40';
    } else if (!isNaN(Number(rawAge))) {
      age = Math.max(0, Math.min(120, Number(rawAge)));
      ageGroup = calculateAgeGroup(age);
    }
    birthYear = currentYear - age;
  } else if (rawBirthYear !== undefined) {
    const parsedYear = parseInt(String(rawBirthYear).substring(0, 4));
    if (!isNaN(parsedYear) && parsedYear > 1900 && parsedYear <= currentYear) {
      birthYear = parsedYear;
      age = currentYear - birthYear;
      ageGroup = calculateAgeGroup(age);
    }
  }

  // NIK / Identifier
  const rawNik = findValue(['nik', 'nomornik', 'noktp', 'ktp', 'identifier', 'idpeserta', 'id', 'nomoridentitas']);
  const nikOrIdentifier = rawNik 
    ? String(rawNik).trim() 
    : `ID-${Date.now().toString().slice(-4)}-${rowNumber}`;

  // Disability
  const rawDisability = findValue(['disabilitas', 'statusdisabilitas', 'hasdisability', 'penyandangdisabilitas', 'difabel']);
  let hasDisability = false;
  if (rawDisability !== undefined) {
    const disStr = String(rawDisability).toLowerCase().trim();
    if (disStr === 'ya' || disStr === 'yes' || disStr === 'true' || disStr === '1' || disStr.includes('disabilitas') || disStr.includes('difabel')) {
      hasDisability = true;
    }
  }

  // Disability Type
  const rawDisType = findValue(['ragamdisabilitas', 'jenisdisabilitas', 'disabilitytype', 'kategoridisabilitas']);
  let disabilityType: DisabilityType | undefined = undefined;
  if (hasDisability && rawDisType) {
    const t = String(rawDisType).toLowerCase();
    if (t.includes('fisik') || t.includes('motorik') || t.includes('kaki') || t.includes('tangan') || t.includes('tubuh')) {
      disabilityType = 'Fisik / Motorik / Mobilitas';
    } else if (t.includes('netra') || t.includes('mata') || t.includes('lihat') || t.includes('penglihatan') || t.includes('blind')) {
      disabilityType = 'Netra / Penglihatan';
    } else if (t.includes('rungu') || t.includes('dengar') || t.includes('tuli') || t.includes('deaf')) {
      disabilityType = 'Rungu / Pendengaran';
    } else if (t.includes('wicara') || t.includes('bicara') || t.includes('bisu')) {
      disabilityType = 'Wicara / Komunikasi';
    } else if (t.includes('intelektual') || t.includes('mental') || t.includes('psikososial') || t.includes('down')) {
      disabilityType = 'Intelektual / Mental / Psikososial';
    } else if (t.includes('ganda') || t.includes('majemuk')) {
      disabilityType = 'Ganda / Majemuk';
    } else {
      disabilityType = 'Lainnya';
    }
  } else if (hasDisability) {
    disabilityType = 'Fisik / Motorik / Mobilitas';
  }

  // Disability Barrier Notes
  const rawBarrier = findValue(['hambatan', 'kebutuhanakomodasi', 'catatanhambatan', 'barriernotes', 'kebutuhan']);
  const disabilityBarrierNotes = rawBarrier ? String(rawBarrier).trim() : undefined;

  // Disability Levels of Difficulty
  const rawDifficulty = findValue(['tingkatkesulitan', 'levelofdifficulty', 'levelsofdifficulty', 'difficultylevel', 'kesulitan', 'tingkatkesulitanhambatan']);
  let disabilityDifficultyLevel: import('../types').DisabilityDifficultyLevel | undefined = undefined;
  if (hasDisability && rawDifficulty) {
    const diffStr = String(rawDifficulty).toLowerCase().trim();
    if (diffStr.includes('1') || diffStr.includes('extremely') || diffStr.includes('ekstrem')) {
      disabilityDifficultyLevel = '1. Extremely difficult';
    } else if (diffStr.includes('2') || diffStr.includes('very') || diffStr.includes('sangatsulit')) {
      disabilityDifficultyLevel = '2. Very difficult';
    } else if (diffStr.includes('3') || diffStr.includes('fairly') || diffStr.includes('cukupsulit')) {
      disabilityDifficultyLevel = '3. Fairly difficult';
    } else if (diffStr.includes('4') || diffStr.includes('slightly') || diffStr.includes('sedikitsulit')) {
      disabilityDifficultyLevel = '4. Slightly difficult';
    } else if (diffStr.includes('5') || diffStr.includes('almost') || diffStr.includes('hampir')) {
      disabilityDifficultyLevel = '5. Almost no difficulty';
    } else if (diffStr.includes('6') || diffStr.includes('no difficulty') || diffStr.includes('tidakatau')) {
      disabilityDifficultyLevel = '6. No difficulty';
    } else {
      disabilityDifficultyLevel = '3. Fairly difficult';
    }
  } else if (hasDisability) {
    disabilityDifficultyLevel = '3. Fairly difficult';
  }

  // IPLC Status
  const rawIplc = findValue(['statusiplc', 'iplc', 'masyarakatadat', 'komunitaslokal', 'iplcstatus', 'adat']);
  let iplcStatus: IPLCStatus = 'Bukan IPLC (Non-IPLC)';
  if (rawIplc !== undefined) {
    const s = String(rawIplc).toLowerCase().trim();
    if (s.includes('adat') || s.includes('indigenous') || s === 'ip' || s === 'ya' || s === 'suku') {
      iplcStatus = 'Masyarakat Adat (Indigenous Peoples)';
    } else if (s.includes('lokal') || s.includes('local') || s === 'lc' || s.includes('komunitas')) {
      iplcStatus = 'Komunitas Lokal (Local Communities)';
    } else {
      iplcStatus = 'Bukan IPLC (Non-IPLC)';
    }
  }

  // Custom IPLC / Suku
  const rawCommunity = findValue(['namasuku', 'suku', 'komunitas', 'sukuadat', 'namakomunitas', 'communityname']);
  const customIplcCommunityName = rawCommunity ? String(rawCommunity).trim() : undefined;

  // Phone
  const rawPhone = findValue(['nohp', 'telepon', 'phone', 'whatsapp', 'wa', 'kontak', 'handphone']);
  const phone = rawPhone ? String(rawPhone).trim() : undefined;

  // Occupation
  const rawOccupation = findValue(['pekerjaan', 'occupation', 'profesi', 'job', 'mata_pencaharian']);
  const occupation = rawOccupation ? String(rawOccupation).trim() : undefined;

  // Target Group
  const rawTargetGroup = findValue(['targetgroup', 'kelompoktarget', 'targetkelompok', 'target', 'kategoritarget']);
  let targetGroup: import('../types').TargetGroup = 'Population of the project communities';
  if (rawTargetGroup) {
    const tgStr = String(rawTargetGroup).toLowerCase().trim();
    if (tgStr.includes('actor') || tgStr.includes('administration') || tgStr.includes('pemerintah') || tgStr.includes('dinas') || tgStr.includes('aparatur')) {
      targetGroup = 'Actors in the municipal, district and provincial administrations';
    } else if (tgStr.includes('ngo') || tgStr.includes('cso') || tgStr.includes('intermediar') || tgStr.includes('lsm') || tgStr.includes('organisasi masyarakat')) {
      targetGroup = 'Intermediaries: NGOs / CSOs';
    } else if (tgStr.includes('other') || tgStr.includes('lain')) {
      targetGroup = 'Other';
    } else {
      targetGroup = 'Population of the project communities';
    }
  }

  // Beneficiary Level
  const rawLevel = findValue(['beneficiarylevel', 'levelbeneficiaries', 'level', 'tingkat', 'tingkatdampingan', 'levelwilayah']);
  let beneficiaryLevel: import('../types').BeneficiaryLevel = 'Desa';
  if (rawLevel) {
    const lvlStr = String(rawLevel).toLowerCase().trim();
    if (lvlStr.includes('nasional') || lvlStr.includes('national')) {
      beneficiaryLevel = 'Nasional';
    } else if (lvlStr.includes('provinsi') || lvlStr.includes('prov')) {
      beneficiaryLevel = 'Provinsi';
    } else if (lvlStr.includes('kabupaten') || lvlStr.includes('kab') || lvlStr.includes('kota')) {
      beneficiaryLevel = 'Kabupaten';
    } else if (lvlStr.includes('kecamatan') || lvlStr.includes('kec')) {
      beneficiaryLevel = 'Kecamatan';
    } else {
      beneficiaryLevel = 'Desa';
    }
  }

  // Level Name
  const rawLevelName = findValue(['levelname', 'namalevel', 'namawilayah', 'namadinas', 'namainstansi', 'namalembaga', 'wilayahdinas']);
  const levelName = rawLevelName ? String(rawLevelName).trim() : village;

  // Institution or Agency
  const rawInst = findValue(['institutionoragency', 'instansi', 'dinas', 'lembaga', 'opd', 'organisasi', 'agency', 'institution']);
  const institutionOrAgency = rawInst ? String(rawInst).trim() : undefined;

  return {
    data: {
      fullName,
      gender,
      village,
      regency,
      province,
      age,
      birthYear,
      ageGroup,
      nikOrIdentifier,
      hasDisability,
      disabilityType,
      disabilityDifficultyLevel,
      disabilityBarrierNotes,
      iplcStatus,
      customIplcCommunityName,
      phone,
      occupation,
      targetGroup,
      beneficiaryLevel,
      levelName,
      institutionOrAgency
    },
    errors
  };
}

/**
 * Analyzes and deduplicates a batch of parsed rows against the database and within itself
 * using the strict (Nama + Gender + Alamat) composite rule.
 */
export function analyzeImportBeneficiaries(
  rawRows: Record<string, any>[],
  existingBeneficiaries: Beneficiary[],
  defaultProvince?: string,
  defaultRegency?: string,
  defaultVillage?: string
): {
  parsedRows: ParsedImportRow[];
  summary: {
    totalRows: number;
    validNewCount: number;
    duplicateDatabaseCount: number;
    duplicateInFileCount: number;
    invalidCount: number;
  };
} {
  // Build map of existing database by (Nama + Gender + Alamat)
  const dbIdentityMap = new Map<string, Beneficiary>();
  existingBeneficiaries.forEach(b => {
    const key = getBeneficiaryIdentityKey(b.fullName, b.gender, b.village);
    if (!dbIdentityMap.has(key)) {
      dbIdentityMap.set(key, b);
    }
  });

  const parsedRows: ParsedImportRow[] = [];
  const fileSeenIdentityMap = new Map<string, number>(); // key -> first rowNumber seen

  rawRows.forEach((raw, idx) => {
    const rowNumber = idx + 2; // considering 1-based indexing + header row
    const { data, errors } = mapRawRowToBeneficiaryFields(
      raw,
      rowNumber,
      defaultProvince,
      defaultRegency,
      defaultVillage
    );

    const identityKey = getBeneficiaryIdentityKey(
      data.fullName || '',
      data.gender || 'Perempuan',
      data.village || ''
    );

    let status: ParsedImportRow['status'] = 'valid_new';
    let matchedExisting: Beneficiary | undefined = undefined;
    let duplicateOfRowNumber: number | undefined = undefined;

    if (errors.length > 0) {
      status = 'invalid';
    } else if (dbIdentityMap.has(identityKey)) {
      status = 'duplicate_database';
      matchedExisting = dbIdentityMap.get(identityKey);
    } else if (fileSeenIdentityMap.has(identityKey)) {
      status = 'duplicate_in_file';
      duplicateOfRowNumber = fileSeenIdentityMap.get(identityKey);
    } else {
      status = 'valid_new';
      fileSeenIdentityMap.set(identityKey, rowNumber);
    }

    parsedRows.push({
      rowNumber,
      raw,
      fullName: data.fullName || '',
      gender: data.gender || 'Perempuan',
      village: data.village || '',
      regency: data.regency || '',
      province: data.province || '',
      age: data.age || 28,
      birthYear: data.birthYear || 1997,
      ageGroup: data.ageGroup || '25-40',
      nikOrIdentifier: data.nikOrIdentifier || '',
      hasDisability: !!data.hasDisability,
      disabilityType: data.disabilityType,
      disabilityDifficultyLevel: data.disabilityDifficultyLevel,
      disabilityBarrierNotes: data.disabilityBarrierNotes,
      iplcStatus: data.iplcStatus || 'Bukan IPLC (Non-IPLC)',
      customIplcCommunityName: data.customIplcCommunityName,
      phone: data.phone,
      occupation: data.occupation,
      identityKey,
      status,
      validationErrors: errors,
      matchedExistingBeneficiary: matchedExisting,
      duplicateOfRowNumber,
      selectedForImport: status === 'valid_new'
    });
  });

  const totalRows = parsedRows.length;
  const validNewCount = parsedRows.filter(r => r.status === 'valid_new').length;
  const duplicateDatabaseCount = parsedRows.filter(r => r.status === 'duplicate_database').length;
  const duplicateInFileCount = parsedRows.filter(r => r.status === 'duplicate_in_file').length;
  const invalidCount = parsedRows.filter(r => r.status === 'invalid').length;

  return {
    parsedRows,
    summary: {
      totalRows,
      validNewCount,
      duplicateDatabaseCount,
      duplicateInFileCount,
      invalidCount
    }
  };
}
