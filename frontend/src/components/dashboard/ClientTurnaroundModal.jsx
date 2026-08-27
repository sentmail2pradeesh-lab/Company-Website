import { useState } from 'react';
import { useJobs } from '../../context/JobContext';
import { FiClock, FiX, FiCheckCircle } from 'react-icons/fi';

export default function ClientTurnaroundModal() {
  const { clientModalState, setClientModalState, jobs, updateClientTurnaround } = useJobs();

  if (!clientModalState) return null;

  const { jobId } = clientModalState;
  const job = jobs.find((j) => j.id === jobId);
  if (!job) return null;

  const [entryTime, setEntryTime] = useState(job.clientEntryTime || '');
  const [targetTime, setTargetTime] = useState(job.clientTargetTime || '');
  const [finishTime, setFinishTime] = useState(job.clientFinishTime || '');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setClientModalState(null)}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            <FiClock className="w-3.5 h-3.5" /> Admin Turnaround Tracker
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-1">
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
              className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
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
              className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
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
              className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
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

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setClientModalState(null)}
              className="w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-xs flex items-center justify-center gap-1"
            >
              <FiCheckCircle className="w-3.5 h-3.5" /> Save Timestamps
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
