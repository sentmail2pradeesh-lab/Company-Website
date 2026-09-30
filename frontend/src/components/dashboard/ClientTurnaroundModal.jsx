import { useState, useEffect } from 'react';
import { useJobs } from '../../context/JobContext';
import { FiClock, FiX, FiCheckCircle } from 'react-icons/fi';

export default function ClientTurnaroundModal() {
  const { clientModalState, setClientModalState, jobs, updateClientTurnaround } = useJobs();

  const jobId = clientModalState?.jobId;
  const job = jobs.find((j) => j.id === jobId);

  const [entryTime, setEntryTime] = useState('');
  const [targetTime, setTargetTime] = useState('');
  const [finishTime, setFinishTime] = useState('');

  useEffect(() => {
    if (job) {
      setEntryTime(job.clientEntryTime || '');
      setTargetTime(job.clientTargetTime || '');
      setFinishTime(job.clientFinishTime || '');
    }
  }, [job]);

  useEffect(() => {
    if (clientModalState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [clientModalState]);

  if (!clientModalState || !job) return null;

  const calculateDuration = (start, end) => {
    if (!start || !end) return 'N/A';
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    if (isNaN(s) || isNaN(e) || e < s) return 'Invalid range';
    const diffMs = e - s;
    const hrs = Math.floor(diffMs / 3600000);
    const mins = Math.round((diffMs % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateClientTurnaround(jobId, entryTime, targetTime, finishTime);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl p-4 sm:p-7 border border-slate-200 shadow-xl my-auto max-h-[92vh] overflow-y-auto overscroll-contain mobile-touch-scroll">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setClientModalState(null)}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
          aria-label="Close modal"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4 sm:mb-5 pr-8">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            <FiClock className="w-3.5 h-3.5" /> Admin Turnaround Tracker
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            Client Timestamps & Turnaround
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Job <span className="font-mono font-bold text-indigo-600">#{job.id}</span> — Client <span className="font-bold text-slate-900">{job.client}</span> ({job.name})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Client Entry Time (Files Received)
            </label>
            <input
              type="datetime-local"
              value={entryTime}
              onChange={(e) => setEntryTime(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-base sm:text-xs focus:outline-none focus:border-indigo-500 focus:bg-white min-h-[42px] sm:min-h-0"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Client Target Deadline
            </label>
            <input
              type="datetime-local"
              value={targetTime}
              onChange={(e) => setTargetTime(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-base sm:text-xs focus:outline-none focus:border-indigo-500 focus:bg-white min-h-[42px] sm:min-h-0"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Final Client Dispatch / Finish Time
            </label>
            <input
              type="datetime-local"
              value={finishTime}
              onChange={(e) => setFinishTime(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-base sm:text-xs focus:outline-none focus:border-indigo-500 focus:bg-white min-h-[42px] sm:min-h-0"
            />
          </div>

          {/* Metrics summary */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Target Turnaround Window:</span>
              <span className="font-mono text-indigo-600 font-bold">{calculateDuration(entryTime, targetTime)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Actual Client Turnaround:</span>
              <span className="font-mono text-emerald-700 font-bold">{calculateDuration(entryTime, finishTime)}</span>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <button
              type="button"
              onClick={() => setClientModalState(null)}
              className="w-full sm:w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 min-h-[40px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-1/2 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-xs flex items-center justify-center gap-1 min-h-[40px] cursor-pointer"
            >
              <FiCheckCircle className="w-3.5 h-3.5" /> Save Timestamps
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
