import { useState, useEffect, FormEvent } from 'react';
import { Project } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  editingProject?: Project | null;
}

export default function ProjectFormModal({
  isOpen,
  onClose,
  onSave,
  editingProject
}: ProjectFormModalProps) {
  const { language } = useLanguage();
  const isId = language === 'id';

  const [code, setCode] = useState('PROJ-03');
  const [title, setTitle] = useState('');
  const [donor, setDonor] = useState('');
  const [partnerOrg, setPartnerOrg] = useState('');
  const [budgetTotal, setBudgetTotal] = useState<number>(2000000000);
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2027-12-31');
  const [province, setProvince] = useState('Sulawesi Selatan');
  const [targetLocations, setTargetLocations] = useState('Kec. Pangkajene, Kec. Tanete');
  const [targetVillages, setTargetVillages] = useState('Desa Manakku, Desa Taraweang, Kelurahan Bonto Langkasa');
  const [goalStatement, setGoalStatement] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Selesai' | 'Perencanaan' | 'Masa Perpanjangan'>('Aktif');

  useEffect(() => {
    if (editingProject) {
      setCode(editingProject.code);
      setTitle(editingProject.title);
      setDonor(editingProject.donor);
      setPartnerOrg(editingProject.partnerOrg);
      setBudgetTotal(editingProject.budgetTotal);
      setStartDate(editingProject.startDate);
      setEndDate(editingProject.endDate);
      setProvince(editingProject.province);
      setTargetLocations(editingProject.targetLocations?.join(', ') || '');
      setTargetVillages(editingProject.targetVillages?.join(', ') || editingProject.targetLocations?.join(', ') || '');
      setGoalStatement(editingProject.goalStatement);
      setStatus(editingProject.status);
    } else {
      setCode(`PROJ-0${Math.floor(Math.random() * 90 + 10)}`);
      setTitle('');
      setDonor('');
      setPartnerOrg('');
      setBudgetTotal(2500000000);
      setStartDate('2025-01-01');
      setEndDate('2027-12-31');
      setProvince('Papua Barat');
      setTargetLocations('Kec. Misool, Kec. Salawati');
      setTargetVillages('Desa Gamta, Desa Magey, Kelurahan Yellu');
      setGoalStatement('');
      setStatus('Aktif');
    }
  }, [editingProject, isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title || !code) {
      alert(isId ? 'Mohon isi kode dan judul proyek!' : 'Please fill in the project code and title!');
      return;
    }

    const locArray = targetLocations.split(',').map(s => s.trim()).filter(Boolean);
    const villageArray = targetVillages.split(',').map(s => s.trim()).filter(Boolean);

    const projectData: Project = {
      id: editingProject ? editingProject.id : `proj-${Date.now()}`,
      code,
      title,
      donor: donor || (isId ? 'Lembaga Donor Internasional' : 'International Donor Agency'),
      partnerOrg: partnerOrg || (isId ? 'Konsorsium Mitra Lokal' : 'Local Partner Consortium'),
      budgetTotal: Number(budgetTotal),
      budgetCurrency: 'IDR',
      startDate,
      endDate,
      status,
      province,
      targetLocations: locArray.length > 0 ? locArray : [isId ? 'Wilayah Intervensi Proyek' : 'Project Target Area'],
      targetVillages: villageArray.length > 0 ? villageArray : (locArray.length > 0 ? locArray : ['Desa Dampingan 1', 'Desa Dampingan 2']),
      goalStatement: goalStatement || (isId ? 'Meningkatkan kesejahteraan masyarakat dan keberlanjutan lingkungan hidup.' : 'Improve community welfare and ecological sustainability.'),
      goalIndicators: editingProject ? editingProject.goalIndicators : [
        {
          id: `ind-g-${Date.now()}`,
          code: `${code}-GOAL.1`,
          level: 'Goal',
          parentId: `proj-${Date.now()}`,
          name: isId ? 'Penerima manfaat langsung terjangkau program' : 'Direct beneficiaries reached by program',
          definition: isId ? 'Jumlah individu unik penerima manfaat langsung' : 'Total unique direct individual beneficiaries',
          baseline: 0,
          target: 1000,
          actual: 0,
          unit: 'Orang / Individu',
          meansOfVerification: isId ? 'Database presensi dan survei' : 'Attendance logs and surveys',
          frequency: 'Tahunan',
          status: 'Belum Dimulai',
          lastUpdated: new Date().toISOString().split('T')[0]
        }
      ],
      outcomes: editingProject ? editingProject.outcomes : [
        {
          id: `oc-${Date.now()}`,
          projectId: `proj-${Date.now()}`,
          code: 'OC-1',
          title: isId ? 'Penguatan Kapasitas dan Kemandirian Komunitas Dampingan' : 'Capacity Building and Community Self-Reliance',
          description: isId ? 'Peningkatan kapasitas teknis dan kelembagaan masyarakat lokal.' : 'Institutional and technical capacity building of local communities.',
          indicators: [],
          outputs: []
        }
      ],
      teamMembers: editingProject ? editingProject.teamMembers : [
        {
          id: `tm-${Date.now()}`,
          name: 'Project Coordinator',
          role: 'Project Manager',
          email: 'pm@project.org',
          phone: '+62 812-3456-7890',
          assignedOutcomes: []
        }
      ],
      createdAt: editingProject ? editingProject.createdAt : new Date().toISOString().split('T')[0]
    };

    onSave(projectData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                editingProject ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {editingProject 
                  ? (isId ? 'Edit Data Proyek' : 'Edit Project Data') 
                  : (isId ? 'Tambah Proyek M&E Baru' : 'Add New M&E Project')}
              </span>
              {editingProject && (
                <span className="font-mono text-xs font-bold text-slate-500">{editingProject.code}</span>
              )}
            </div>
            <h3 className="font-bold text-slate-900 text-lg mt-1">
              {editingProject 
                ? (isId ? 'Ubah Nama & Profil Proyek' : 'Edit Project Name & Profile') 
                : (isId ? 'Profil Proyek & Inisiasi Logframe' : 'Project Profile & Logframe Setup')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg hover:bg-slate-100 transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold block mb-1 text-slate-700">
                {isId ? 'Kode Proyek *:' : 'Project Code *:'}
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="PROJ-01"
                className="w-full p-2 border border-slate-300 rounded-lg font-bold font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="font-semibold block mb-1 text-slate-700">
                {isId ? 'Nama / Judul Lengkap Proyek *:' : 'Project Full Name / Title *:'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isId ? 'Contoh: Program Pemberdayaan Petani Kopi Berkelanjutan...' : 'e.g. Sustainable Community Forestry Program...'}
                className="w-full p-2 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">
              {isId ? 'Pernyataan Tujuan Dampak (Impact / Goal Statement):' : 'Impact / Goal Statement:'}
            </label>
            <textarea
              rows={2}
              value={goalStatement}
              onChange={(e) => setGoalStatement(e.target.value)}
              placeholder={isId ? 'Jelaskan dampak jangka panjang yang ingin dicapai proyek...' : 'Describe the long-term impact the project aims to achieve...'}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">
                {isId ? 'Lembaga Donor / Pendana:' : 'Donor / Funding Agency:'}
              </label>
              <input
                type="text"
                value={donor}
                onChange={(e) => setDonor(e.target.value)}
                placeholder="USAID / EU / Ford Foundation..."
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">
                {isId ? 'Mitra Pelaksana:' : 'Implementing Partner:'}
              </label>
              <input
                type="text"
                value={partnerOrg}
                onChange={(e) => setPartnerOrg(e.target.value)}
                placeholder={isId ? 'Nama Yayasan / LSM Mitra' : 'Partner NGO / Consortium'}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold block mb-1">
                {isId ? 'Total Anggaran (IDR):' : 'Total Budget (IDR):'}
              </label>
              <input
                type="number"
                value={budgetTotal}
                onChange={(e) => setBudgetTotal(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">
                {isId ? 'Tanggal Mulai:' : 'Start Date:'}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">
                {isId ? 'Tanggal Selesai:' : 'End Date:'}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">
                {isId ? 'Provinsi Utama:' : 'Primary Province:'}
              </label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">
                {isId ? 'Status Proyek:' : 'Project Status:'}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                <option value="Aktif">{isId ? 'Aktif' : 'Active'}</option>
                <option value="Perencanaan">{isId ? 'Perencanaan' : 'Planning'}</option>
                <option value="Masa Perpanjangan">{isId ? 'Masa Perpanjangan' : 'Extension Period'}</option>
                <option value="Selesai">{isId ? 'Selesai' : 'Completed'}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">
              {isId ? 'Kecamatan / Wilayah Intervensi:' : 'Sub-Districts / Target Areas:'}
            </label>
            <input
              type="text"
              value={targetLocations}
              onChange={(e) => setTargetLocations(e.target.value)}
              placeholder={isId ? 'Contoh: Kec. Pangkajene, Kec. Tanete, Kab. Barru' : 'e.g., Pangkajene District, Tanete District'}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-emerald-950 text-xs block">
                🏡 {isId ? 'Nama Desa / Kelurahan Dampingan:' : 'Target Village / Sub-District Names:'}
              </label>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                {isId ? 'Wajib untuk pembagian penerima manfaat' : 'Required for disaggregation'}
              </span>
            </div>
            <input
              type="text"
              value={targetVillages}
              onChange={(e) => setTargetVillages(e.target.value)}
              placeholder={isId ? 'Contoh: Desa Menjalin, Desa Siding, Kelurahan Harapan Baru (Pisahkan dengan koma)' : 'e.g. Menjalin Village, Siding Village, Harapan Baru (Comma separated)'}
              className="w-full p-2.5 bg-white border border-emerald-300 focus:ring-2 focus:ring-emerald-500 rounded-lg text-xs font-semibold text-slate-800"
              required
            />
            <p className="text-[11px] text-emerald-800 leading-tight">
              {isId 
                ? 'Daftar desa/kelurahan ini akan digunakan secara otomatis untuk mengelompokkan dan menghitung disagregasi penerima manfaat per wilayah dampingan.'
                : 'This village list will be used automatically to categorize and compute beneficiary disaggregations per target area.'}
            </p>
          </div>

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
              {editingProject 
                ? (isId ? 'Simpan Perubahan' : 'Save Changes') 
                : (isId ? 'Simpan Proyek' : 'Save Project')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
