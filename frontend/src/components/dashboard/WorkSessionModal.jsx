import { useState, useEffect } from 'react';
import { FiX, FiClock, FiUser, FiCalendar, FiFileText } from 'react-icons/fi';
import { useJobs } from '../../context/JobContext';
import DatePickerDMY from '../common/DatePickerDMY';

const toLocalInput = (isoStr) => {
  if (!isoStr) return '';
  let str = String(isoStr).trim();
  if ((str.includes('T') || str.includes(' ')) && !str.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(str)) {
    str = str.replace(' ', 'T') + 'Z';
  }
  const d = new Date(str);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function WorkSessionModal({ isOpen, onClose, editingSession }) {
  const { addWorkSession, updateWorkSession, editors } = useJobs();

  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    date: new Date().toLocaleDateString('en-CA'),
    login_time: '',
    logout_time: '',
    notes: '',
  });

  useEffect(() => {
    const todayLocal = new Date().toLocaleDateString('en-CA');
    if (editingSession) {
      setFormData({
        user_name: editingSession.user_name || '',
        user_email: editingSession.user_email || '',
        date: editingSession.date || todayLocal,
        login_time: toLocalInput(editingSession.login_time),
        logout_time: toLocalInput(editingSession.logout_time),
        notes: editingSession.notes || '',
      });
    } else {
      setFormData({
        user_name: editors[0]?.name || '',
        user_email: editors[0]?.email || '',
        date: todayLocal,
        login_time: `${todayLocal}T09:00`,
        logout_time: `${todayLocal}T17:30`,
        notes: 'Manual entry',
      });
    }
  }, [editingSession, editors, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const loginIso = formData.login_time ? new Date(formData.login_time).toISOString() : new Date().toISOString();
    const logoutIso = formData.logout_time ? new Date(formData.logout_time).toISOString() : null;

    if (editingSession) {
      updateWorkSession(editingSession.id, {
        user_name: formData.user_name,
        user_email: formData.user_email,
        date: formData.date,
        login_time: loginIso,
        logout_time: logoutIso,
        notes: formData.notes,
      });
    } else {
      addWorkSession({
        user_name: formData.user_name,
        user_email: formData.user_email,
        date: formData.date,
        login_time: loginIso,
        logout_time: logoutIso,
        notes: formData.notes,
      });
    }
    onClose();
  };

  const handleEmployeeSelect = (name) => {
    const found = editors.find((e) => e.name.toLowerCase() === name.toLowerCase());
    setFormData((prev) => ({
      ...prev,
      user_name: name,
      user_email: found ? found.email : `${name.toLowerCase()}@aszen.com`,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 sm:space-y-5 max-h-[92vh] overflow-y-auto mobile-touch-scroll">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shrink-0">
              <FiClock className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {editingSession ? 'Edit Employee Work Log' : 'Add Manual Work Session'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Manage login/logout timestamps & calculate working hours
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 text-xs font-medium">
          {/* Employee Selection */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
              <FiUser className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> Employee Name
            </label>
            <select
              value={formData.user_name}
              onChange={(e) => handleEmployeeSelect(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-base sm:text-xs min-h-[42px] sm:min-h-0 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Select Employee --</option>
              {editors.map((emp) => (
                <option key={emp.id} value={emp.name}>
                  {emp.name} ({emp.email})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Login/Logout Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                <FiCalendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> Date
              </label>
              <DatePickerDMY
                required
                value={formData.date}
                onChange={(newDate) => setFormData({ ...formData, date: newDate })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-base sm:text-xs min-h-[42px] sm:min-h-0 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                <FiClock className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Login Time
              </label>
              <input
                type="datetime-local"
                required
                value={formData.login_time}
                onChange={(e) => setFormData({ ...formData, login_time: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-base sm:text-xs min-h-[42px] sm:min-h-0 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
              <FiClock className="w-3.5 h-3.5 text-rose-500 shrink-0" /> Logout Time (Leave empty if currently active)
            </label>
            <input
              type="datetime-local"
              value={formData.logout_time}
              onChange={(e) => setFormData({ ...formData, logout_time: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-base sm:text-xs min-h-[42px] sm:min-h-0 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
              <FiFileText className="w-3.5 h-3.5 text-slate-500 shrink-0" /> Notes / Shift Reason
            </label>
            <input
              type="text"
              placeholder="e.g. Regular shift, Overtime, Manager adjustment"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-base sm:text-xs min-h-[42px] sm:min-h-0 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold transition-colors text-center text-sm sm:text-xs min-h-[40px] sm:min-h-0 flex items-center justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-sm text-center text-sm sm:text-xs min-h-[40px] sm:min-h-0 flex items-center justify-center"
            >
              {editingSession ? 'Save Changes' : 'Add Work Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
