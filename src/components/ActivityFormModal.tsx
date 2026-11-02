import { useState, useEffect, FormEvent } from 'react';
import { 
  CalendarCheck2, 
  X, 
  MapPin, 
  Calendar, 
  DollarSign, 
  User, 
  Layers, 
  CheckCircle2,
  FolderKanban,
  FileText
} from 'lucide-react';
import { Project, Activity } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectId: string, outputId: string, activityData: Partial<Activity>) => void;
  projects: Project[];
  defaultProjectId?: string;
  defaultOutputId?: string;
  editingActivity?: Activity | null;
}

export default function ActivityFormModal({
  isOpen,
  onClose,
  onSave,
  projects,
  defaultProjectId,
  defaultOutputId,
  editingActivity
}: ActivityFormModalProps) {
  const { language } = useLanguage();
  const isId = language === 'id';

  // Determine selected project
  const initialProjectId = defaultProjectId && defaultProjectId !== 'all' 
    ? defaultProjectId 
    : (projects[0]?.id || '');
    
  const [selectedProjId, setSelectedProjId] = useState<string>(initialProjectId);
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string>('');
  const [selectedOutputId, setSelectedOutputId] = useState<string>(defaultOutputId || '');

  // Form Fields
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [province, setProvince] = useState('');
  const [regency, setRegency] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budgetAllocated, setBudgetAllocated] = useState<number>(50000000);
  const [budgetSpent, setBudgetSpent] = useState<number>(0);
  const [status, setStatus] = useState<'Direncanakan' | 'Sedang Berjalan' | 'Selesai' | 'Tertunda'>('Direncanakan');
  const [leadPerson, setLeadPerson] = useState('');

  const currentProject = projects.find(p => p.id === selectedProjId) || projects[0];

  // Cascading update when project changes
  useEffect(() => {
    if (currentProject) {
      const firstOutcome = currentProject.outcomes[0];
      if (firstOutcome) {
        setSelectedOutcomeId(firstOutcome.id);
        const firstOutput = firstOutcome.outputs[0];
        if (firstOutput) {
          setSelectedOutputId(defaultOutputId || firstOutput.id);
        }
      }
      setProvince(currentProject.province || 'Jawa Barat');
      setRegency(currentProject.targetLocations[0] || (isId ? 'Kabupaten Terkait' : 'Target Regency'));
      setLeadPerson(currentProject.teamMembers[0]?.name || 'Project Officer');
    }
  }, [currentProject, defaultOutputId, isId]);

  // When editing or opening
  useEffect(() => {
    if (editingActivity) {
      setCode(editingActivity.code);
      setTitle(editingActivity.title);
      setDescription(editingActivity.description || '');
      setLocation(editingActivity.location || '');
      setProvince(editingActivity.province || '');
      setRegency(editingActivity.regency || '');
      setStartDate(editingActivity.startDate || '');
      setEndDate(editingActivity.endDate || '');
      setBudgetAllocated(editingActivity.budgetAllocated || 0);
      setBudgetSpent(editingActivity.budgetSpent || 0);
      setStatus(editingActivity.status || 'Direncanakan');
      setLeadPerson(editingActivity.leadPerson || '');
    } else {
      // Auto generate code based on selected output
      const today = new Date().toISOString().split('T')[0];
      const targetOutput = currentProject?.outcomes
        .flatMap(o => o.outputs)
        .find(op => op.id === selectedOutputId);

      const count = (targetOutput?.activities.length || 0) + 1;
      const opCodeNum = targetOutput ? targetOutput.code.replace('OP-', '') : '1.1';
      
      setCode(`ACT-${opCodeNum}.${count}`);
      setTitle('');
      setDescription('');
      setLocation(isId ? 'Aula Pertemuan Desa / Gedung Komunitas' : 'Village Hall / Community Center');
      setStartDate(today);
      setEndDate(today);
      setBudgetAllocated(35000000);
      setBudgetSpent(0);
      setStatus('Direncanakan');
    }
  }, [isOpen, editingActivity, selectedOutputId, currentProject, isId]);

  if (!isOpen) return null;

  const currentOutcome = currentProject?.outcomes.find(o => o.id === selectedOutcomeId) || currentProject?.outcomes[0];
  const availableOutputs = currentOutcome?.outputs || [];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedProjId || !selectedOutputId) {
      alert(isId ? 'Mohon lengkapi judul kegiatan dan pastikan output proyek terpilih.' : 'Please fill in the activity title and ensure a project output is selected.');
      return;
    }

    onSave(selectedProjId, selectedOutputId, {
      id: editingActivity ? editingActivity.id : `act-${Date.now().toString().slice(-6)}`,
      outputId: selectedOutputId,
      code: code.trim() || `ACT-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      description: description.trim(),
      location: location.trim() || (isId ? 'Lokasi Kegiatan' : 'Activity Venue'),
      province: province.trim() || currentProject?.province || 'Jawa Barat',
      regency: regency.trim() || (isId ? 'Kabupaten Terkait' : 'Target Regency'),
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || startDate || new Date().toISOString().split('T')[0],
      budgetAllocated: Number(budgetAllocated) || 0,
      budgetSpent: Number(budgetSpent) || 0,
      status: status,
      leadPerson: leadPerson.trim() || 'Project Coordinator',
      indicators: editingActivity?.indicators || [],
      createdAt: editingActivity?.createdAt || new Date().toISOString()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingActivity 
                  ? (isId ? 'Edit Data Kegiatan' : 'Edit Activity Details')
                  : (isId ? 'Tambah Kegiatan Baru' : 'Add New Activity')}
              </h2>
              <p className="text-xs text-slate-500">
                {isId ? 'Input rencana kegiatan lapangan dan alokasikan ke kerangka logis (Output)' : 'Plan field activity and assign it to logframe outputs'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          {/* Hierarchy Selection: Project, Outcome, Output */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>{isId ? 'Hierarki Logframe Proyek' : 'Project Logframe Hierarchy'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Project Select */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  1. {isId ? 'Pilih Proyek' : 'Select Project'}
                </label>
                <select
                  value={selectedProjId}
                  onChange={(e) => setSelectedProjId(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.code} - {p.title}</option>
                  ))}
                </select>
              </div>

              {/* Outcome Select */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  2. {isId ? 'Pilih Outcome' : 'Select Outcome'}
                </label>
                <select
                  value={selectedOutcomeId}
                  onChange={(e) => setSelectedOutcomeId(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {currentProject?.outcomes.map(o => (
                    <option key={o.id} value={o.id}>{o.code}: {o.title.substring(0, 28)}...</option>
                  ))}
                </select>
              </div>

              {/* Output Select */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  3. {isId ? 'Pilih Output (Keluaran)' : 'Select Output'}
                </label>
                <select
                  value={selectedOutputId}
                  onChange={(e) => setSelectedOutputId(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {availableOutputs.map(op => (
                    <option key={op.id} value={op.id}>{op.code}: {op.title.substring(0, 28)}...</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Activity Core Info */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isId ? 'Kode Kegiatan *' : 'Activity Code *'}
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ACT-1.1.1"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-blue-700 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">
                {isId ? 'Nama / Judul Kegiatan *' : 'Activity Title / Name *'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isId ? 'Contoh: Pelatihan Fasilitator Pertanian Organik & Diversifikasi Pangan' : 'e.g., Organic Agriculture & Food Diversification Workshop'}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {isId ? 'Deskripsi / Sasaran Teknis Kegiatan' : 'Description / Technical Scope'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isId ? 'Jelaskan ruang lingkup, metodologi, dan tujuan pelaksanaan kegiatan ini...' : 'Describe the methodology, scope, and objectives of this activity...'}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Location & PIC */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isId ? 'Lokasi / Venue Spesifik' : 'Specific Venue / Location'}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={isId ? 'Gedung Balai Desa Sukajaya' : 'Community Hall'}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isId ? 'Kabupaten / Kota' : 'Regency / City'}
              </label>
              <input
                type="text"
                value={regency}
                onChange={(e) => setRegency(e.target.value)}
                placeholder={isId ? 'Kabupaten Garut' : 'Garut Regency'}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isId ? 'Penanggung Jawab (PIC)' : 'Person in Charge (PIC)'}
              </label>
              <input
                type="text"
                value={leadPerson}
                onChange={(e) => setLeadPerson(e.target.value)}
                placeholder={isId ? 'Nama PIC Lapangan' : 'Field Officer Name'}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Dates & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isId ? 'Tanggal Mulai' : 'Start Date'}
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isId ? 'Tanggal Selesai' : 'End Date'}
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isId ? 'Status Pelaksanaan' : 'Execution Status'}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Direncanakan">📅 {isId ? 'Direncanakan' : 'Planned'}</option>
                <option value="Sedang Berjalan">⚡ {isId ? 'Sedang Berjalan' : 'In Progress'}</option>
                <option value="Selesai">✅ {isId ? 'Selesai' : 'Completed'}</option>
                <option value="Tertunda">⚠️ {isId ? 'Tertunda' : 'Delayed'}</option>
              </select>
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isId ? 'Alokasi Anggaran (IDR)' : 'Allocated Budget (IDR)'}
              </label>
              <input
                type="number"
                min="0"
                step="1000000"
                value={budgetAllocated}
                onChange={(e) => setBudgetAllocated(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isId ? 'Realisasi Anggaran Terpakai (IDR)' : 'Actual Spent Budget (IDR)'}
              </label>
              <input
                type="number"
                min="0"
                step="1000000"
                value={budgetSpent}
                onChange={(e) => setBudgetSpent(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              {isId ? 'Batal' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {editingActivity 
                  ? (isId ? 'Simpan Perubahan' : 'Save Changes') 
                  : (isId ? 'Simpan Kegiatan Baru' : 'Save New Activity')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
