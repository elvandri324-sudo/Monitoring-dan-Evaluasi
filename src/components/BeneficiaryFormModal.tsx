import { useState, useEffect, FormEvent } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Sparkles, 
  HelpCircle,
  AlertCircle,
  AlertTriangle,
  Layers,
  MapPin,
  Building2
} from 'lucide-react';
import { Beneficiary, Gender, AgeGroup, DisabilityType, DisabilityDifficultyLevel, IPLCStatus, Project, TargetGroup, BeneficiaryLevel } from '../types';
import { calculateAgeGroup } from '../services/meEngine';
import { getBeneficiaryIdentityKey } from '../utils/beneficiaryDeduplication';
import { useLanguage } from '../context/LanguageContext';

interface BeneficiaryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (beneficiary: Omit<Beneficiary, 'id'> | Beneficiary) => void;
  editingBeneficiary?: Beneficiary | null;
  existingBeneficiaries: Beneficiary[];
  projects?: Project[];
}

export default function BeneficiaryFormModal({
  isOpen,
  onClose,
  onSave,
  editingBeneficiary,
  existingBeneficiaries,
  projects = []
}: BeneficiaryFormModalProps) {
  const { language } = useLanguage();
  const isId = language === 'id';

  const [fullName, setFullName] = useState('');
  const [nikOrIdentifier, setNikOrIdentifier] = useState('');
  const [gender, setGender] = useState<Gender>('Perempuan');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('25-40');
  const [hasDisability, setHasDisability] = useState<boolean>(false);
  const [disabilityType, setDisabilityType] = useState<DisabilityType>('Fisik / Motorik / Mobilitas');
  const [disabilityDifficultyLevel, setDisabilityDifficultyLevel] = useState<DisabilityDifficultyLevel>('3. Fairly difficult');
  const [disabilityBarrierNotes, setDisabilityBarrierNotes] = useState('');
  const [iplcStatus, setIplcStatus] = useState<IPLCStatus>('Masyarakat Adat (Indigenous Peoples)');
  const [customIplcCommunityName, setCustomIplcCommunityName] = useState('');
  
  // Target Group & Level of Beneficiaries
  const [targetGroup, setTargetGroup] = useState<TargetGroup>('Population of the project communities');
  const [beneficiaryLevel, setBeneficiaryLevel] = useState<BeneficiaryLevel>('Desa');
  const [levelName, setLevelName] = useState('Desa Menjalin');
  const [institutionOrAgency, setInstitutionOrAgency] = useState('');

  const [province, setProvince] = useState('Kalimantan Barat');
  const [regency, setRegency] = useState('Kabupaten Landak');
  const [village, setVillage] = useState('Desa Menjalin');
  const [occupation, setOccupation] = useState('');
  const [phone, setPhone] = useState('');

  // Collect level name suggestions from project target locations & villages
  const levelSuggestions = Array.from(
    new Set([
      ...projects.flatMap(p => p.targetVillages || []),
      ...projects.flatMap(p => p.targetLocations || []),
      'Mahu', 'Saparua', 'Paperu', 'Ouw', 'Kec. Saparua Timur', 'Kec. Saparua', 'Kab. Maluku Tengah',
      'Desa Menjalin', 'Desa Siding', 'Desa Menua Sadap', 'Desa Bagak Sahwa',
      'Kec. Menjalin', 'Kec. Siding', 'Kec. Putussibau Selatan',
      'Kabupaten Landak', 'Kabupaten Bengkayang', 'Kabupaten Kapuas Hulu',
      'Dinas Kehutanan', 'Dinas Pertanian', 'Bappeda', 'Kementerian LHK'
    ])
  ).filter(Boolean);

  useEffect(() => {
    if (editingBeneficiary) {
      setFullName(editingBeneficiary.fullName);
      setNikOrIdentifier(editingBeneficiary.nikOrIdentifier);
      setGender(editingBeneficiary.gender);
      setAgeGroup(editingBeneficiary.ageGroup || calculateAgeGroup(editingBeneficiary.age || 30));
      setHasDisability(editingBeneficiary.hasDisability);
      if (editingBeneficiary.disabilityType) setDisabilityType(editingBeneficiary.disabilityType);
      if (editingBeneficiary.disabilityDifficultyLevel) setDisabilityDifficultyLevel(editingBeneficiary.disabilityDifficultyLevel as DisabilityDifficultyLevel);
      setDisabilityBarrierNotes(editingBeneficiary.disabilityBarrierNotes || '');
      setIplcStatus(editingBeneficiary.iplcStatus);
      setCustomIplcCommunityName(editingBeneficiary.customIplcCommunityName || '');
      
      setTargetGroup((editingBeneficiary.targetGroup as TargetGroup) || 'Population of the project communities');
      setBeneficiaryLevel((editingBeneficiary.beneficiaryLevel as BeneficiaryLevel) || 'Desa');
      setLevelName(editingBeneficiary.levelName || editingBeneficiary.village || 'Desa Menjalin');
      setInstitutionOrAgency(editingBeneficiary.institutionOrAgency || '');

      setProvince(editingBeneficiary.province);
      setRegency(editingBeneficiary.regency);
      setVillage(editingBeneficiary.village);
      setOccupation(editingBeneficiary.occupation || '');
      setPhone(editingBeneficiary.phone || '');
    } else {
      setFullName('');
      setNikOrIdentifier('');
      setGender('Perempuan');
      setAgeGroup('25-40');
      setHasDisability(false);
      setDisabilityType('Fisik / Motorik / Mobilitas');
      setDisabilityDifficultyLevel('3. Fairly difficult');
      setDisabilityBarrierNotes('');
      setIplcStatus('Masyarakat Adat (Indigenous Peoples)');
      setCustomIplcCommunityName('');
      
      const defaultVil = projects[0]?.targetVillages?.[0] || 'Desa Menjalin';
      setTargetGroup('Population of the project communities');
      setBeneficiaryLevel('Desa');
      setLevelName(defaultVil);
      setInstitutionOrAgency('');

      setProvince(projects[0]?.province || 'Kalimantan Barat');
      setRegency(projects[0]?.targetLocations?.[0] || 'Kabupaten Landak');
      setVillage(defaultVil);
      setOccupation('');
      setPhone('');
    }
  }, [editingBeneficiary, isOpen, projects]);

  // When targetGroup changes, provide intelligent defaults for Level
  const handleTargetGroupChange = (newTg: TargetGroup) => {
    setTargetGroup(newTg);
    if (newTg === 'Population of the project communities') {
      setBeneficiaryLevel('Desa');
      if (!levelName || levelName.startsWith('Kab.') || levelName.startsWith('Kec.')) {
        setLevelName(village || projects[0]?.targetVillages?.[0] || 'Desa Menjalin');
      }
    } else if (newTg === 'Actors in the municipal, district and provincial administrations') {
      if (beneficiaryLevel === 'Desa') {
        setBeneficiaryLevel('Kabupaten');
        setLevelName(regency ? `Kab. ${regency.replace('Kabupaten ', '')}` : 'Kab. Maluku Tengah');
      }
    } else if (newTg === 'Intermediaries: NGOs / CSOs') {
      if (beneficiaryLevel === 'Desa') {
        setBeneficiaryLevel('Kabupaten');
      }
    }
  };

  // When beneficiaryLevel changes, adjust levelName suggestion
  const handleLevelChange = (newLevel: BeneficiaryLevel) => {
    setBeneficiaryLevel(newLevel);
    if (newLevel === 'Desa') {
      setLevelName(village || projects[0]?.targetVillages?.[0] || 'Mahu');
    } else if (newLevel === 'Kecamatan') {
      setLevelName('Kec. Saparua Timur');
    } else if (newLevel === 'Kabupaten') {
      setLevelName(regency ? `Kab. ${regency.replace('Kabupaten ', '')}` : 'Kab. Maluku Tengah');
    } else if (newLevel === 'Provinsi') {
      setLevelName(province ? `Provinsi ${province}` : 'Provinsi Maluku');
    } else if (newLevel === 'Nasional') {
      setLevelName('Tingkat Nasional (Kementerian / Lembaga Pusat)');
    }
  };

  // Strict M&E Zero Double-Counting check based on (Nama, Jenis Kelamin, Alamat/Desa)
  const currentIdentityKey = getBeneficiaryIdentityKey(fullName, gender, village);
  const duplicateBeneficiary = existingBeneficiaries.find(
    b => getBeneficiaryIdentityKey(b.fullName, b.gender, b.village) === currentIdentityKey && 
         (!editingBeneficiary || b.id !== editingBeneficiary.id)
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      alert(isId ? 'Mohon isi nama lengkap penerima manfaat!' : 'Please enter the beneficiary full name!');
      return;
    }

    if (duplicateBeneficiary) {
      const confirmSave = confirm(
        isId
          ? `PERINGATAN DOUBLE COUNTING M&E:\n` +
            `Penerima manfaat dengan Nama "${duplicateBeneficiary.fullName}", Jenis Kelamin "${duplicateBeneficiary.gender}", dan Desa "${duplicateBeneficiary.village}" SUDAH TERDAFTAR di database.\n\n` +
            `Sesuai aturan M&E Zero Double Counting, jika Nama, Jenis Kelamin, dan Alamat sama, data ini merupakan orang yang sama.\n\n` +
            `Apakah Anda tetap ingin menyimpan sebagai entri duplikat?`
          : `M&E ZERO DOUBLE-COUNTING WARNING:\n` +
            `A beneficiary named "${duplicateBeneficiary.fullName}", Gender "${duplicateBeneficiary.gender}", in Village "${duplicateBeneficiary.village}" IS ALREADY REGISTERED in the database.\n\n` +
            `Under Zero Double-Counting rules, identical Name, Gender, and Village are treated as the same individual.\n\n` +
            `Do you still wish to save this as a duplicate entry?`
      );
      if (!confirmSave) {
        return;
      }
    }

    let approxAge = 32;
    if (ageGroup === '0-5') approxAge = 3;
    else if (ageGroup === '6-12') approxAge = 9;
    else if (ageGroup === '13-17') approxAge = 15;
    else if (ageGroup === '18-24') approxAge = 21;
    else if (ageGroup === '25-40') approxAge = 32;
    else if (ageGroup === '41-64') approxAge = 50;
    else if (ageGroup === '65+') approxAge = 68;

    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - approxAge;

    const finalLevelName = levelName.trim() || (beneficiaryLevel === 'Desa' ? village : beneficiaryLevel);

    const payload: any = {
      fullName,
      nikOrIdentifier,
      gender,
      birthYear,
      age: approxAge,
      ageGroup,
      hasDisability,
      disabilityType: hasDisability ? disabilityType : undefined,
      disabilityDifficultyLevel: hasDisability ? disabilityDifficultyLevel : undefined,
      disabilityBarrierNotes: hasDisability ? disabilityBarrierNotes : undefined,
      iplcStatus,
      customIplcCommunityName: iplcStatus !== 'Bukan IPLC (Non-IPLC)' ? customIplcCommunityName : undefined,
      
      // Target Group & Level of Beneficiaries
      targetGroup,
      beneficiaryLevel,
      levelName: finalLevelName,
      institutionOrAgency: institutionOrAgency.trim() || undefined,

      province,
      regency,
      village,
      occupation,
      phone,
      createdAt: editingBeneficiary ? editingBeneficiary.createdAt : new Date().toISOString().split('T')[0]
    };

    if (editingBeneficiary) {
      payload.id = editingBeneficiary.id;
    }

    onSave(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
              {editingBeneficiary 
                ? (isId ? 'Edit Profil Penerima Manfaat' : 'Edit Beneficiary Profile') 
                : (isId ? 'Pendaftaran Penerima Manfaat Baru' : 'New Beneficiary Registration')}
            </span>
            <h3 className="font-bold text-slate-900 text-lg">
              {isId ? 'Formulir Disagregasi GESI, Target Group & Level' : 'GESI, Target Group & Level Disaggregation Form'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Double Counting Warning Banner */}
          {duplicateBeneficiary && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-start gap-2.5 text-amber-900 animate-in fade-in duration-150">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-bold block">{isId ? 'Peringatan M&E Zero Double-Counting:' : 'M&E Zero Double-Counting Warning:'}</span>
                <p>
                  {isId ? (
                    <>Individu dengan <strong>Nama: {duplicateBeneficiary.fullName}</strong>, <strong>Jenis Kelamin: {duplicateBeneficiary.gender}</strong>, dan <strong>Desa: {duplicateBeneficiary.village}</strong> sudah terdaftar di database.</>
                  ) : (
                    <>Individual with <strong>Name: {duplicateBeneficiary.fullName}</strong>, <strong>Gender: {duplicateBeneficiary.gender}</strong>, and <strong>Village: {duplicateBeneficiary.village}</strong> already exists.</>
                  )}
                </p>
                <p className="text-[11px] text-amber-700">
                  {isId 
                    ? 'Sesuai aturan M&E, jika Nama, Jenis Kelamin, dan Desa sama, maka merupakan orang yang sama (Double Counting).'
                    : 'Under standard M&E rules, identical demographic keys constitute double counting.'}
                </p>
              </div>
            </div>
          )}
          
          {/* Section 1: Identitas Dasar */}
          <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 text-xs block">
              1. {isId ? 'Identitas Unik & Biodata' : 'Unique Identity & Demographics'}
            </span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">
                  {isId ? 'Nama Lengkap *:' : 'Full Name *:'}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isId ? 'Nama sesuai KTP / Dokumen Resmi' : 'Full name as per official ID'}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  {isId ? 'NIK / No. Identitas Unik (Anti Double-Counting) *:' : 'National ID / Unique Identifier *:'}
                </label>
                <input
                  type="text"
                  required
                  value={nikOrIdentifier}
                  onChange={(e) => setNikOrIdentifier(e.target.value)}
                  placeholder={isId ? '16 digit NIK atau ID Komunitas/Pegawai' : '16-digit National ID or Staff Code'}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500"
                />
                {duplicateBeneficiary && (
                  <span className="text-[10px] text-rose-600 font-bold block mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {isId ? `NIK sudah dipakai oleh: ${duplicateBeneficiary.fullName}` : `ID already held by: ${duplicateBeneficiary.fullName}`}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">
                  {isId ? 'Jenis Kelamin *:' : 'Gender *:'}
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                >
                  <option value="Perempuan">{isId ? 'Perempuan (Women)' : 'Female (Perempuan)'}</option>
                  <option value="Laki-laki">{isId ? 'Laki-laki (Men)' : 'Male (Laki-laki)'}</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  {isId ? 'Rentang Usia (Standar GESI) *:' : 'Age Range (GESI Standard) *:'}
                </label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                  className="w-full p-2.5 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-emerald-900 bg-emerald-50/50 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="0-5">0-5 {isId ? 'Tahun (Balita / Anak Usia Dini)' : 'Years (Toddlers / Early)'}</option>
                  <option value="6-12">6-12 {isId ? 'Tahun (Anak-anak / Sekolah Dasar)' : 'Years (Children)'}</option>
                  <option value="13-17">13-17 {isId ? 'Tahun (Remaja / Adolescents)' : 'Years (Adolescents)'}</option>
                  <option value="18-24">18-24 {isId ? 'Tahun (Pemuda / Youth)' : 'Years (Youth)'}</option>
                  <option value="25-40">25-40 {isId ? 'Tahun (Dewasa Muda)' : 'Years (Young Adults)'}</option>
                  <option value="41-64">41-64 {isId ? 'Tahun (Dewasa Madya)' : 'Years (Middle-aged Adults)'}</option>
                  <option value="65+">65+ {isId ? 'Tahun (Lansia / Elderly)' : 'Years (Elderly)'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Disabilitas & Ragam Hambatan */}
          <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs block">
                2. {isId ? 'Status Disabilitas & Ragam Hambatan' : 'Disability Status & Barrier Types'}
              </span>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDisability}
                  onChange={(e) => setHasDisability(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="font-bold text-rose-700 text-xs">
                  {isId ? 'Penyandang Disabilitas' : 'Person with Disability (PwD)'}
                </span>
              </label>
            </div>

            {hasDisability && (
              <div className="space-y-3 pt-2 border-t border-slate-200/80">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">
                      {isId ? 'Ragam Hambatan Disabilitas:' : 'Disability Barrier Category:'}
                    </label>
                    <select
                      value={disabilityType}
                      onChange={(e) => setDisabilityType(e.target.value as DisabilityType)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                    >
                      <option value="Fisik / Motorik / Mobilitas">{isId ? 'Fisik / Motorik / Mobilitas (Pengguna Kursi Roda/Kruk/Amputasi)' : 'Physical / Mobility (Wheelchair/Crutches/Amputation)'}</option>
                      <option value="Netra / Penglihatan">{isId ? 'Netra / Penglihatan (Buta Total / Low Vision)' : 'Visual Impairment (Blind / Low Vision)'}</option>
                      <option value="Rungu / Pendengaran">{isId ? 'Rungu / Pendengaran (Tuli / Kurang Pendengaran)' : 'Hearing Impairment (Deaf / Hard of Hearing)'}</option>
                      <option value="Wicara / Komunikasi">{isId ? 'Wicara / Komunikasi (Bisu / Hambatan Artikulasi)' : 'Speech / Communication Impairment'}</option>
                      <option value="Intelektual / Mental / Psikososial">{isId ? 'Intelektual / Mental / Psikososial' : 'Intellectual / Psychosocial'}</option>
                      <option value="Ganda / Majemuk">{isId ? 'Ganda / Majemuk' : 'Multiple Disabilities'}</option>
                      <option value="Lainnya">{isId ? 'Lainnya' : 'Other'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 flex items-center justify-between">
                      <span>{isId ? 'Tingkat Kesulitan (Levels of Difficulty):' : 'Levels of Difficulty:'}</span>
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">WG Scale</span>
                    </label>
                    <select
                      value={disabilityDifficultyLevel}
                      onChange={(e) => setDisabilityDifficultyLevel(e.target.value as DisabilityDifficultyLevel)}
                      className="w-full p-2.5 bg-amber-50/60 border border-amber-300 rounded-lg text-xs font-semibold text-amber-950 focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="1. Extremely difficult">1. Extremely difficult {isId ? '(Sangat sulit / Ekstrem)' : ''}</option>
                      <option value="2. Very difficult">2. Very difficult {isId ? '(Sangat sulit)' : ''}</option>
                      <option value="3. Fairly difficult">3. Fairly difficult {isId ? '(Cukup sulit)' : ''}</option>
                      <option value="4. Slightly difficult">4. Slightly difficult {isId ? '(Sedikit sulit)' : ''}</option>
                      <option value="5. Almost no difficulty">5. Almost no difficulty {isId ? '(Hampir tidak ada kesulitan)' : ''}</option>
                      <option value="6. No difficulty">6. No difficulty {isId ? '(Tidak ada kesulitan)' : ''}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1">
                    {isId ? 'Deskripsi Spesifik Hambatan & Kebutuhan Akomodasi:' : 'Specific Barriers & Accommodation Needs:'}
                  </label>
                  <textarea
                    rows={2}
                    value={disabilityBarrierNotes}
                    onChange={(e) => setDisabilityBarrierNotes(e.target.value)}
                    placeholder={isId ? 'Contoh: Menggunakan kursi roda, memerlukan ramp jalan...' : 'e.g. Requires wheelchair ramp access and tactile materials...'}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Status IPLC (Masyarakat Adat & Komunitas Lokal) */}
          <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 text-xs block">
              3. {isId ? 'Status IPLC (Masyarakat Adat & Komunitas Lokal)' : 'IPLC Status (Indigenous & Local Communities)'}
            </span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">
                  {isId ? 'Kategori IPLC:' : 'IPLC Category:'}
                </label>
                <select
                  value={iplcStatus}
                  onChange={(e) => setIplcStatus(e.target.value as IPLCStatus)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                >
                  <option value="Masyarakat Adat (Indigenous Peoples)">🌿 {isId ? 'Masyarakat Adat (Indigenous Peoples)' : 'Indigenous Peoples (IP)'}</option>
                  <option value="Komunitas Lokal (Local Communities)">🏘️ {isId ? 'Komunitas Lokal (Local Communities)' : 'Local Communities (LC)'}</option>
                  <option value="Bukan IPLC (Non-IPLC)">{isId ? 'Bukan IPLC (Non-IPLC)' : 'Non-IPLC'}</option>
                </select>
              </div>

              {iplcStatus !== 'Bukan IPLC (Non-IPLC)' && (
                <div>
                  <label className="font-semibold block mb-1">
                    {isId ? 'Nama Suku / Komunitas Adat:' : 'Indigenous Tribe / Customary Group Name:'}
                  </label>
                  <input
                    type="text"
                    value={customIplcCommunityName}
                    onChange={(e) => setCustomIplcCommunityName(e.target.value)}
                    placeholder={isId ? 'Contoh: Suku Dayak Kanayatn, Masyarakat Adat Marapu...' : 'e.g., Dayak Kanayatn, Marapu Customary Community...'}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Lokasi Administrasi & Pekerjaan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="font-semibold block mb-1">
                {isId ? 'Provinsi:' : 'Province:'}
              </label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">
                {isId ? 'Kabupaten/Kota:' : 'Regency / City:'}
              </label>
              <input
                type="text"
                value={regency}
                onChange={(e) => setRegency(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">
                {isId ? 'Desa / Kelurahan / Lokasi Domisili:' : 'Village / Domicile Location:'}
              </label>
              <input
                type="text"
                list="village-suggestions"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder={isId ? 'Pilih atau ketik nama desa...' : 'Select or type village name...'}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                required
              />
              <datalist id="village-suggestions">
                {Array.from(new Set(projects.flatMap(p => p.targetVillages || []))).map(v => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </div>
            
            <div>
              <label className="font-semibold block mb-1">
                {isId ? 'Pekerjaan / Jabatan:' : 'Occupation / Position:'}
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder={isId ? 'Contoh: Petani / Staf Dinas / Camat' : 'e.g. Farmer / Department Staff / Head'}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-semibold block mb-1">
                {isId ? 'Nomor HP / WhatsApp:' : 'Phone / WhatsApp Number:'}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Section 5: Target Group & Level of Beneficiaries (BAGIAN PALING BAWAH) */}
          <div className="space-y-3 bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-700" />
              <span className="font-bold text-amber-900 text-xs">
                5. {isId ? 'Target Group & Level of Beneficiaries (Tingkat Wilayah / Dinas)' : 'Target Group & Level of Beneficiaries'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Target Group Dropdown */}
              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  {isId ? 'Target Group (Kelompok Sasaran) *:' : 'Target Group *:'}
                </label>
                <select
                  value={targetGroup}
                  onChange={(e) => handleTargetGroupChange(e.target.value as TargetGroup)}
                  className="w-full p-2.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 shadow-2xs"
                >
                  <option value="Population of the project communities">Population of the project communities</option>
                  <option value="Actors in the municipal, district and provincial administrations">Actors in the municipal, district and provincial administrations</option>
                  <option value="Intermediaries: NGOs / CSOs">Intermediaries: NGOs / CSOs</option>
                  <option value="Other">Other</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {targetGroup === 'Population of the project communities' && (isId ? '👥 Warga / masyarakat umum desa dampingan' : '👥 General community members in project villages')}
                  {targetGroup === 'Actors in the municipal, district and provincial administrations' && (isId ? '🏛️ Staf/pejabat dinas, camat, pemda kabupaten & provinsi' : '🏛️ Government officials & departmental staff')}
                  {targetGroup === 'Intermediaries: NGOs / CSOs' && (isId ? '🤝 Organisasi masyarakat sipil, LSM, fasilitator mitra' : '🤝 Civil society organizations & NGO intermediaries')}
                  {targetGroup === 'Other' && (isId ? '📌 Kelompok sasaran lainnya' : '📌 Other beneficiary categories')}
                </span>
              </div>

              {/* Beneficiary Level Dropdown */}
              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  {isId ? 'Tingkat Wilayah Dampingan (Level) *:' : 'Level of Beneficiary *:'}
                </label>
                <select
                  value={beneficiaryLevel}
                  onChange={(e) => handleLevelChange(e.target.value as BeneficiaryLevel)}
                  className="w-full p-2.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 shadow-2xs"
                >
                  <option value="Desa">{isId ? 'Desa / Kelurahan Dampingan (Penerima dari Desa)' : 'Village Level (Beneficiary from Village)'}</option>
                  <option value="Kecamatan">{isId ? 'Tingkat Kecamatan Dampingan (Camat / Staf Kecamatan)' : 'Sub-District Level (Kecamatan)'}</option>
                  <option value="Kabupaten">{isId ? 'Tingkat Kabupaten Dampingan (Dinas / Instansi Kab.)' : 'Regency / District Level (Kabupaten)'}</option>
                  <option value="Provinsi">{isId ? 'Tingkat Provinsi Dampingan (Dinas / Bappeda Prov.)' : 'Provincial Level (Provinsi)'}</option>
                  <option value="Nasional">{isId ? 'Tingkat Nasional (Kementerian / Lembaga Pusat)' : 'National Level (Nasional)'}</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {beneficiaryLevel === 'Desa' && (isId ? 'Penerima manfaat dari warga/komunitas desa dampingan' : 'Direct community beneficiaries in village')}
                  {beneficiaryLevel === 'Kecamatan' && (isId ? 'Aparatur / penyuluh / pejabat di tingkat kecamatan' : 'Sub-district administration personnel')}
                  {beneficiaryLevel === 'Kabupaten' && (isId ? 'Orang dinas / OPD / Bappeda tingkat kabupaten' : 'District/regency agency staff')}
                  {beneficiaryLevel === 'Provinsi' && (isId ? 'Orang dinas / Bappeda tingkat provinsi' : 'Provincial department/agency officials')}
                  {beneficiaryLevel === 'Nasional' && (isId ? 'Perwakilan kementerian / lembaga tingkat nasional' : 'National ministry/organization representatives')}
                </span>
              </div>
            </div>

            {/* Level of Beneficiaries Display Name & Institution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200/60">
              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  {isId ? 'Nama Level / Wilayah Dampingan (Level of Beneficiaries) *:' : 'Level of Beneficiaries (Name) *:'}
                </label>
                <input
                  type="text"
                  list="level-suggestions"
                  required
                  value={levelName}
                  onChange={(e) => setLevelName(e.target.value)}
                  placeholder={isId ? 'Contoh: Mahu / Saparua / Kec. Saparua Timur / Kab. Maluku Tengah' : 'e.g., Mahu / Saparua / Kec. Saparua Timur / Kab. Maluku Tengah'}
                  className="w-full p-2.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-amber-950 focus:ring-2 focus:ring-amber-500"
                />
                <datalist id="level-suggestions">
                  {levelSuggestions.map((sug, idx) => (
                    <option key={idx} value={sug} />
                  ))}
                </datalist>
                <span className="text-[10px] text-amber-800 mt-0.5 block">
                  {isId ? 'Tercatat di kolom "Level of Beneficiaries" (seperti Mahu, Saparua, Paperu, Ouw, Kec. Saparua Timur, Kab. Maluku Tengah)' : 'Shown in "Level of Beneficiaries" column'}
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  {isId ? 'Nama Organisasi / Kelompok / Komunitas / Instansi (Opsional):' : 'Organization / Group / Community / Agency (Optional):'}
                </label>
                <input
                  type="text"
                  value={institutionOrAgency}
                  onChange={(e) => setInstitutionOrAgency(e.target.value)}
                  placeholder={isId ? 'Contoh: Kelompok Tani Harapan / Kelompok Perempuan / KTH / Lembaga Adat / Dinas / LSM' : 'e.g. Farmer Group / Women Group / Customary Body / Agency / NGO'}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  {isId ? 'Dapat diisi untuk semua peserta: kelompok dampingan desa/komunitas (KTH, Poktan, dll.), lembaga adat, maupun instansi dinas/LSM' : 'Open for all: community groups, farmer groups, women groups, customary bodies, NGOs, or government agencies'}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              {isId ? 'Batal' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
            >
              {editingBeneficiary 
                ? (isId ? 'Simpan Perubahan' : 'Save Changes') 
                : (isId ? 'Daftarkan Penerima Manfaat' : 'Register Beneficiary')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
