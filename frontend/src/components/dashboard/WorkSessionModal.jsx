import { useState, useEffect } from 'react';
import { FiX, FiClock, FiUser, FiCalendar, FiFileText } from 'react-icons/fi';
import { useJobs } from '../../context/JobContext';

export default function WorkSessionModal({ isOpen, onClose, editingSession }) {
  const { addWorkSession, updateWorkSession, editors } = useJobs();

  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    date: new Date().toISOString().slice(0, 10),
    login_time: '',
    logout_time: '',
    notes: '',
  });

  useEffect(() => {
    if (editingSession) {
      setFormData({
        user_name: editingSession.user_name || '',
        user_email: editingSession.user_email || '',
        date: editingSession.date || new Date().toISOString().slice(0, 10),
        login_time: editingSession.login_time ? editingSession.login_time.slice(0, 16) : '',
        logout_time: editingSession.logout_time ? editingSession.logout_time.slice(0, 16) : '',
        notes: editingSession.notes || '',
      });
    } else {
      setFormData({
        user_name: editors[0]?.name || 'Lalithaa',
        user_email: editors[0]?.email || 'Lalithaa@aszen.com',
        date: new Date().toISOString().slice(0, 10),
        login_time: `${new Date().toISOString().slice(0, 10)}T09:00`,
        logout_time: `${new Date().toISOString().slice(0, 10)}T17:30`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <FiClock className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingSession ? 'Edit Employee Work Log' : 'Add Manual Work Session'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage login/logout timestamps & calculate total working hours
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          {/* Employee Selection */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
              <FiUser className="w-3.5 h-3.5 text-indigo-500" /> Employee Name
            </label>
            <select
              value={formData.user_name}
              onChange={(e) => handleEmployeeSelect(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
            >
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
                <FiCalendar className="w-3.5 h-3.5 text-indigo-500" /> Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                <FiClock className="w-3.5 h-3.5 text-emerald-500" /> Login Time
              </label>
              <input
                type="datetime-local"
                required
                value={formData.login_time}
                onChange={(e) => setFormData({ ...formData, login_time: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
              <FiClock className="w-3.5 h-3.5 text-rose-500" /> Logout Time (Leave empty if currently active)
            </label>
            <input
              type="datetime-local"
              value={formData.logout_time}
              onChange={(e) => setFormData({ ...formData, logout_time: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
              <FiFileText className="w-3.5 h-3.5 text-slate-500" /> Notes / Shift Reason
            </label>
            <input
              type="text"
              placeholder="e.g. Regular shift, Overtime, Manager adjustment"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-sm"
            >
              {editingSession ? 'Save Changes' : 'Add Work Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
