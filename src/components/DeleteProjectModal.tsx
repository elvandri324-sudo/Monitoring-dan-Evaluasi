import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Project } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface DeleteProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (projectId: string) => void;
}

export default function DeleteProjectModal({
  project,
  isOpen,
  onClose,
  onConfirmDelete
}: DeleteProjectModalProps) {
  const { language } = useLanguage();
  const isId = language === 'id';

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
            <Trash2 className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {isId ? 'Hapus Proyek?' : 'Delete Project?'}
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {isId 
              ? <>Anda akan menghapus proyek <strong className="text-slate-900">"{project.title}" ({project.code})</strong>. Tindakan ini akan menghapus seluruh data kerangka logis (Logframe, Outcome, Output, Kegiatan) dan riwayat presensi yang terafiliasi dengan proyek ini.</>
              : <>You are about to delete project <strong className="text-slate-900">"{project.title}" ({project.code})</strong>. This will permanently remove all associated logframe data (outcomes, outputs, activities) and attendance records linked to this project.</>}
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{isId ? 'Data penerima manfaat unik master akan tetap tersimpan di database.' : 'Master unique beneficiary profiles will remain intact in the database.'}</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            {isId ? 'Batal' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete(project.id);
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md shadow-rose-500/20 transition flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            {isId ? 'Ya, Hapus Proyek' : 'Yes, Delete Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
