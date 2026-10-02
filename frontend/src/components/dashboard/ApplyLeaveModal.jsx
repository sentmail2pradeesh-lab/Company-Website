import { useState, useMemo } from 'react';
import { useJobs } from '../../context/JobContext';
import { useAuth } from '../../context/AuthContext';
import { FiCalendar, FiClock, FiX, FiCheck, FiAlertCircle, FiUserCheck, FiPhone, FiSun } from 'react-icons/fi';
import { formatDateDMY, calculateWorkingDays, countSundays, isSunday } from '../../utils/dateUtils';

export default function ApplyLeaveModal({ isOpen, onClose }) {
  const { applyLeave, editors, getLeaveBalances } = useJobs();
  const { user } = useAuth();

  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDayPeriod, setHalfDayPeriod] = useState('First Half');
  const [reason, setReason] = useState('');
  const [backupEmployee, setBackupEmployee] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate live working days count (strictly excluding Sundays)
  const calculatedDays = useMemo(() => {
    return calculateWorkingDays(startDate, isHalfDay ? startDate : endDate, isHalfDay);
  }, [startDate, endDate, isHalfDay]);

  const skippedSundays = useMemo(() => {
    return countSundays(startDate, isHalfDay ? startDate : endDate);
  }, [startDate, endDate, isHalfDay]);

  // Current user balances (18 days annual quota)
  const balances = useMemo(() => {
    return getLeaveBalances(user?.email);
  }, [getLeaveBalances, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (calculatedDays <= 0) {
      if (isSunday(startDate) && (isHalfDay || startDate === endDate)) {
        setErrorMsg('The selected date is a Sunday (Company Weekly Holiday). You do not need to apply leave for Sundays.');
      } else if (skippedSundays > 0 && calculatedDays === 0) {
        setErrorMsg('The selected range contains only Sundays (Company Weekly Holidays). Please select working days.');
      } else {
        setErrorMsg('End Date cannot be earlier than Start Date.');
      }
      return;
    }

    if (!reason.trim()) {
      setErrorMsg('Please specify a reason for the leave application.');
      return;
    }

    if (calculatedDays > balances.available) {
      const confirmExceed = window.confirm(
        `You are applying for ${calculatedDays} day(s), but only have ${balances.available} day(s) remaining out of your 18-day annual allowance. Proceed with application for manager review?`
      );
      if (!confirmExceed) return;
    }

    setIsSubmitting(true);
    try {
      await applyLeave({
        leaveType: 'Leave',
        startDate,
        endDate: isHalfDay ? startDate : endDate,
        days: calculatedDays,
        isHalfDay,
        halfDayPeriod: isHalfDay ? halfDayPeriod : null,
        reason: reason.trim(),
        backupEmployee,
        emergencyContact,
      });

      // Reset form
      setReason('');
      setBackupEmployee('');
      setEmergencyContact('');
      setIsHalfDay(false);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit leave request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-2xl my-auto max-h-[92vh] overflow-y-auto overscroll-contain mobile-touch-scroll font-sans">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 pr-10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <FiCalendar className="w-3.5 h-3.5" /> Corporate Leave Application
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">Apply for Leave</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Submit your leave request. Every employee has 18 days of annual leave per calendar year.
          </p>
        </div>

        {/* Annual Balance Summary Card */}
        <div className="mb-5 p-4 bg-gradient-to-r from-indigo-50/80 via-slate-50 to-emerald-50/60 rounded-xl border border-indigo-100 flex items-center justify-between text-xs sm:text-sm">
          <div>
            <span className="text-slate-500 font-medium block text-xs">Annual Leave Allowance</span>
            <span className="text-slate-900 font-extrabold text-base font-mono">18 Days Total</span>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 font-bold font-mono text-xs border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {balances.available} Days Available
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">
              ({balances.used} Days Used)
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2 font-medium">
            <FiAlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Half-Day Switch */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="halfDayToggle"
                checked={isHalfDay}
                onChange={(e) => setIsHalfDay(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="halfDayToggle" className="text-xs sm:text-sm font-bold text-slate-800 cursor-pointer">
                Apply for Half Day (0.5 Day)
              </label>
            </div>

            {isHalfDay && (
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setHalfDayPeriod('First Half')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    halfDayPeriod === 'First Half'
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  1st Half (Morning)
                </button>
                <button
                  type="button"
                  onClick={() => setHalfDayPeriod('Second Half')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    halfDayPeriod === 'Second Half'
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  2nd Half (Afternoon)
                </button>
              </div>
            )}
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {isHalfDay ? 'Leave Date' : 'Start Date'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (isHalfDay || endDate < e.target.value) {
                    setEndDate(e.target.value);
                  }
                }}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white font-mono font-medium transition-all min-h-[44px]"
                required
              />
            </div>

            {!isHalfDay && (
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  End Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white font-mono font-medium transition-all min-h-[44px]"
                  required
                />
              </div>
            )}
          </div>

          {/* Timeline in DD/MM/YYYY & Sunday Holiday Notice */}
          <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-slate-700 font-mono">
            <div>
              <span className="text-slate-400 font-sans font-medium">Timeline: </span>
              <strong className="text-indigo-700 font-bold">{formatDateDMY(startDate)}</strong>
              {!isHalfDay && endDate && endDate !== startDate && (
                <>
                  <span className="text-slate-400 mx-1">→</span>
                  <strong className="text-indigo-700 font-bold">{formatDateDMY(endDate)}</strong>
                </>
              )}
              {isHalfDay && (
                <span className="text-indigo-600 font-sans font-semibold ml-1.5">
                  ({halfDayPeriod})
                </span>
              )}
            </div>
            {skippedSundays > 0 && (
              <span className="text-emerald-700 font-sans font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1 w-fit">
                <span>✓</span> {skippedSundays} Sunday{skippedSundays > 1 ? 's' : ''} Excluded (Holiday)
              </span>
            )}
          </div>

          {/* Computed Duration Banner */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between text-xs sm:text-sm font-semibold text-indigo-950">
            <span className="flex items-center gap-1.5 font-medium">
              <FiClock className="w-4 h-4 text-indigo-600" /> Total Duration:
            </span>
            {calculatedDays > 0 ? (
              <span className="font-mono font-extrabold text-base text-indigo-600">
                {calculatedDays} {calculatedDays === 1 ? 'Day' : 'Days'}
              </span>
            ) : (
              <span className="font-sans font-bold text-xs text-amber-700 bg-amber-100/70 px-2 py-1 rounded">
                0 Days (Sunday is already a holiday)
              </span>
            )}
          </div>

          {/* Handover / Backup Colleague */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Handover Colleague
              </label>
              <select
                value={backupEmployee}
                onChange={(e) => setBackupEmployee(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:bg-white font-medium transition-all min-h-[44px] cursor-pointer"
              >
                <option value="">Select backup colleague</option>
                {editors
                  .filter((ed) => ed.email?.toLowerCase() !== user?.email?.toLowerCase())
                  .map((ed) => (
                    <option key={ed.id} value={ed.name}>
                      {ed.name} ({ed.role})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Emergency Contact (Optional)
              </label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:bg-white font-medium transition-all min-h-[44px]"
              />
            </div>
          </div>

          {/* Reason for Leave */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason for Leave <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide reason for leave (e.g. personal appointment, family function, medical rest...)"
              className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:bg-white resize-none font-medium transition-all min-h-[90px]"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-1/2 py-3 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors cursor-pointer min-h-[46px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-1/2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[46px] disabled:opacity-50 active:scale-95"
            >
              <FiCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Leave Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
