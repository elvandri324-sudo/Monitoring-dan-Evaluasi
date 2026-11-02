import { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  User, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  PlayCircle, 
  CalendarDays, 
  ListOrdered,
  Plus,
  ArrowUpRight,
  Filter,
  X,
  Sparkles
} from 'lucide-react';
import { Project, Activity, ActivityAttendance, Beneficiary } from '../types';
import { getAllActivitiesFromProjects } from '../services/meEngine';
import { useLanguage } from '../context/LanguageContext';

interface ActivityCalendarProps {
  projects: Project[];
  attendances: ActivityAttendance[];
  beneficiaries: Beneficiary[];
  selectedProjectId: string;
  onNavigate: (tab: 'dashboard' | 'activities' | 'beneficiaries' | 'indicators' | 'logframe' | 'team') => void;
  onOpenNewActivityModal?: () => void;
}

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES_ID = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const DAY_NAMES_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ActivityCalendar({
  projects,
  attendances,
  beneficiaries,
  selectedProjectId,
  onNavigate,
  onOpenNewActivityModal
}: ActivityCalendarProps) {
  const { language } = useLanguage();
  const isId = language === 'id';

  // Collect all activities
  const allActivitiesData = useMemo(() => {
    const list = getAllActivitiesFromProjects(projects);
    if (selectedProjectId !== 'all') {
      const activeProj = projects.find(p => p.id === selectedProjectId);
      if (activeProj) {
        return list.filter(item => item.projectName === activeProj.title);
      }
    }
    return list;
  }, [projects, selectedProjectId]);

  // Determine initial date
  const initialDate = useMemo(() => {
    if (allActivitiesData.length > 0) {
      const validDates = allActivitiesData
        .map(a => a.activity.startDate)
        .filter(Boolean)
        .sort();
      if (validDates.length > 0) {
        const d = new Date(validDates[0]);
        if (!isNaN(d.getTime())) return d;
      }
    }
    return new Date();
  }, [allActivitiesData]);

  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [viewMode, setViewMode] = useState<'calendar' | 'agenda'>('calendar');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedActivityItem, setSelectedActivityItem] = useState<{
    activity: Activity;
    projectName: string;
    outcomeCode: string;
    outputCode: string;
  } | null>(null);

  // Filter activities by status
  const filteredActivities = useMemo(() => {
    if (statusFilter === 'all') return allActivitiesData;
    return allActivitiesData.filter(item => item.activity.status === statusFilter);
  }, [allActivitiesData, statusFilter]);

  // Calendar math for current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const activitiesByDate = useMemo(() => {
    const map = new Map<string, typeof filteredActivities>();
    filteredActivities.forEach(item => {
      const dateStr = item.activity.startDate;
      if (!dateStr) return;
      const cleanDate = dateStr.slice(0, 10);
      if (!map.has(cleanDate)) {
        map.set(cleanDate, []);
      }
      map.get(cleanDate)!.push(item);
    });
    return map;
  }, [filteredActivities]);

  const getStatusLabel = (status: Activity['status']) => {
    if (!isId) {
      switch (status) {
        case 'Sedang Berjalan': return 'Ongoing';
        case 'Selesai': return 'Completed';
        case 'Tertunda': return 'Delayed';
        case 'Direncanakan': return 'Planned';
        default: return status;
      }
    }
    return status;
  };

  const getStatusStyle = (status: Activity['status']) => {
    switch (status) {
      case 'Sedang Berjalan':
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
          chip: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
        };
      case 'Selesai':
        return {
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          chip: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
        };
      case 'Tertunda':
        return {
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          chip: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
        };
      case 'Direncanakan':
      default:
        return {
          badge: 'bg-amber-100 text-amber-900 border-amber-200',
          dot: 'bg-amber-500',
          chip: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
        };
    }
  };

  const calendarCells = useMemo(() => {
    const cells: {
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      items: typeof filteredActivities;
    }[] = [];

    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, day);
      const dateStr = prevDate.toISOString().split('T')[0];
      cells.push({
        dayNumber: day,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        items: activitiesByDate.get(dateStr) || []
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const curDate = new Date(year, month, day);
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      const dateStr = `${year}-${mm}-${dd}`;
      cells.push({
        dayNumber: day,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        items: activitiesByDate.get(dateStr) || []
      });
    }

    const remaining = (7 - (cells.length % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
      const nextDate = new Date(year, month + 1, day);
      const dateStr = nextDate.toISOString().split('T')[0];
      cells.push({
        dayNumber: day,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        items: activitiesByDate.get(dateStr) || []
      });
    }

    return cells;
  }, [year, month, daysInMonth, firstDayIndex, daysInPrevMonth, activitiesByDate]);

  const sortedAgenda = useMemo(() => {
    return [...filteredActivities].sort((a, b) => {
      const dateA = a.activity.startDate || '9999-12-31';
      const dateB = b.activity.startDate || '9999-12-31';
      return dateA.localeCompare(dateB);
    });
  }, [filteredActivities]);

  const monthNames = isId ? MONTH_NAMES_ID : MONTH_NAMES_EN;
  const dayNames = isId ? DAY_NAMES_ID : DAY_NAMES_EN;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {isId ? 'Kalender Rencana Kegiatan' : 'Activity Plan Calendar'}
            </h2>
            <span className="px-2 py-0.5 bg-blue-100/70 text-blue-800 font-bold text-[10px] rounded-full">
              {filteredActivities.length} {isId ? 'Kegiatan Terjadwal' : 'Scheduled Activities'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {isId 
              ? 'Jadwal pelaksanaan teknis lapangan, alokasi anggaran, dan pemantauan timeline interaktif'
              : 'Field technical timeline, budget allocations, and interactive activity schedule'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-hidden text-xs py-0.5"
            >
              <option value="all">{isId ? 'Semua Status' : 'All Status'}</option>
              <option value="Direncanakan">📅 {isId ? 'Direncanakan' : 'Planned'}</option>
              <option value="Sedang Berjalan">⚡ {isId ? 'Sedang Berjalan' : 'Ongoing'}</option>
              <option value="Selesai">✅ {isId ? 'Selesai' : 'Completed'}</option>
              <option value="Tertunda">⚠️ {isId ? 'Tertunda' : 'Delayed'}</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'calendar'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>{isId ? 'Kalender' : 'Calendar'}</span>
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'agenda'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>{isId ? 'Agenda Timeline' : 'Timeline Agenda'}</span>
            </button>
          </div>

          {/* Quick Add Button */}
          {onOpenNewActivityModal && (
            <button
              onClick={onOpenNewActivityModal}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">+ {isId ? 'Rencana Kegiatan' : 'New Activity'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Month Navigator Header (Only in Calendar View) */}
      {viewMode === 'calendar' && (
        <div className="flex items-center justify-between bg-slate-50/80 px-4 py-2.5 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {monthNames[month]} {year}
            </h3>
            <button
              onClick={handleToday}
              className="px-2 py-0.5 text-[11px] font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-md transition"
            >
              {isId ? 'Bulan Ini' : 'This Month'}
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              title={isId ? 'Bulan Sebelumnya' : 'Previous Month'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              title={isId ? 'Bulan Berikutnya' : 'Next Month'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' ? (
        <div className="space-y-1">
          {/* Day Headers (Mon - Sun) */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center pb-1">
            {dayNames.map((dayName, idx) => (
              <div
                key={dayName}
                className={`text-[11px] font-bold py-1 ${
                  idx >= 5 ? 'text-rose-500' : 'text-slate-500'
                }`}
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarCells.map((cell, idx) => {
              const hasActivities = cell.items.length > 0;

              return (
                <div
                  key={`${cell.dateStr}-${idx}`}
                  className={`min-h-[90px] sm:min-h-[105px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition ${
                    cell.isCurrentMonth
                      ? 'bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-xs'
                      : 'bg-slate-50/40 border-slate-100 text-slate-400'
                  } ${cell.isToday ? 'ring-2 ring-blue-500 bg-blue-50/20' : ''}`}
                >
                  {/* Date Number Header */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                        cell.isToday
                          ? 'bg-blue-600 text-white'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {hasActivities && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>

                  {/* Activity Chips in this Day */}
                  <div className="space-y-1 overflow-y-auto max-h-[64px] pr-0.5">
                    {cell.items.slice(0, 2).map((item) => {
                      const style = getStatusStyle(item.activity.status);
                      return (
                        <div
                          key={item.activity.id}
                          onClick={() => setSelectedActivityItem(item)}
                          className={`px-1.5 py-1 rounded-lg border text-[10px] cursor-pointer font-medium leading-tight truncate transition flex items-center gap-1 ${style.chip}`}
                          title={`${item.activity.code}: ${item.activity.title} (${getStatusLabel(item.activity.status)})`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`}></span>
                          <span className="font-bold shrink-0">{item.activity.code}</span>
                          <span className="truncate">{item.activity.title}</span>
                        </div>
                      );
                    })}

                    {cell.items.length > 2 && (
                      <div
                        onClick={() => setSelectedActivityItem(cell.items[0])}
                        className="text-[9px] font-bold text-blue-600 hover:underline cursor-pointer text-center pt-0.5"
                      >
                        +{cell.items.length - 2} {isId ? 'lainnya' : 'more'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* AGENDA TIMELINE VIEW */
        <div className="space-y-3">
          {sortedAgenda.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold">{isId ? 'Tidak ada rencana kegiatan pada status ini.' : 'No planned activities for this status.'}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sortedAgenda.map((item) => {
                const style = getStatusStyle(item.activity.status);
                const participantCount = attendances.filter(a => a.activityId === item.activity.id).length;

                return (
                  <div
                    key={item.activity.id}
                    onClick={() => setSelectedActivityItem(item)}
                    className="py-3.5 px-3 rounded-xl hover:bg-slate-50/80 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-center min-w-[70px] shrink-0">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">
                          {item.activity.startDate ? new Date(item.activity.startDate).toLocaleString(isId ? 'id-ID' : 'en-US', { month: 'short' }) : (isId ? 'JADWAL' : 'DATE')}
                        </span>
                        <span className="text-base font-bold text-slate-900 block leading-none mt-0.5">
                          {item.activity.startDate ? new Date(item.activity.startDate).getDate() : '-'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded text-[10px] border border-blue-200">
                            {item.activity.code}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${style.badge}`}>
                            {getStatusLabel(item.activity.status)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            • {item.projectName}
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {item.activity.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {item.activity.location} ({item.activity.regency})
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            PIC: {item.activity.leadPerson}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Users className="w-3 h-3 text-emerald-600" />
                            {participantCount} {isId ? 'Hadir' : 'Attended'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span className="text-xs font-bold text-slate-800">
                        Rp {(item.activity.budgetAllocated / 1000000).toFixed(0)} {isId ? 'Jt' : 'M'}
                      </span>
                      <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-0.5 hover:underline">
                        {isId ? 'Lihat Detail' : 'View Details'} <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: DETAIL KEGIATAN TERPILIH */}
      {selectedActivityItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs">
                  {selectedActivityItem.activity.code}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyle(selectedActivityItem.activity.status).badge}`}>
                  {getStatusLabel(selectedActivityItem.activity.status)}
                </span>
              </div>
              <button
                onClick={() => setSelectedActivityItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {selectedActivityItem.projectName} • {selectedActivityItem.outputCode}
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {selectedActivityItem.activity.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedActivityItem.activity.description || (isId ? 'Tidak ada deskripsi tambahan untuk kegiatan ini.' : 'No additional description for this activity.')}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3.5 rounded-xl text-xs">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 block">{isId ? 'Jadwal Pelaksanaan' : 'Execution Schedule'}</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                  {selectedActivityItem.activity.startDate} {isId ? 's/d' : 'to'} {selectedActivityItem.activity.endDate}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 block">{isId ? 'Lokasi / Tempat' : 'Location / Venue'}</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {selectedActivityItem.activity.location}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 block">{isId ? 'Penanggung Jawab (PIC)' : 'Person in Charge (PIC)'}</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  {selectedActivityItem.activity.leadPerson}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 block">{isId ? 'Alokasi Anggaran' : 'Budget Allocation'}</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  Rp {selectedActivityItem.activity.budgetAllocated.toLocaleString(isId ? 'id-ID' : 'en-US')}
                </span>
              </div>
            </div>

            {/* Participant Attendance Count */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <span className="font-semibold text-emerald-900">{isId ? 'Peserta Terdaftar di Kegiatan Ini' : 'Registered Participants in this Activity'}</span>
              </div>
              <span className="font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-300">
                {attendances.filter(a => a.activityId === selectedActivityItem.activity.id).length} {isId ? 'Partisipan' : 'Participants'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedActivityItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                {isId ? 'Tutup' : 'Close'}
              </button>
              <button
                onClick={() => {
                  setSelectedActivityItem(null);
                  onNavigate('activities');
                }}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <span>{isId ? 'Kelola Presensi Kegiatan' : 'Manage Attendance'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
