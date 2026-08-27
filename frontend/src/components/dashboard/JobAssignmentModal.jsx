import { useState } from 'react';
import { useJobs } from '../../context/JobContext';
import { FiUserCheck, FiX, FiCheck } from 'react-icons/fi';

export default function JobAssignmentModal() {
  const { assignModalState, setAssignModalState, jobs, editors, assignStage } = useJobs();

  if (!assignModalState) return null;

  const { jobId, stageKey } = assignModalState;
  const job = jobs.find((j) => j.id === jobId);
  if (!job) return null;

  const stage = job.stages[stageKey];
  if (!stage) return null;

  const [selectedAssignee, setSelectedAssignee] = useState(stage.assignee || editors[0]?.name || '');

  const stageLabels = {
    path1: 'Path 1 (Prep & Masking)',
    path2: 'Path 2 (Secondary Pathing)',
    editor1: 'Editor 1 (Primary Edit)',
    editor2: 'Editor 2 (Secondary Edit)',
    qc: 'QC (Quality Control)',
    fc: 'FC (Final Verification)',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    assignStage(jobId, stageKey, selectedAssignee);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setAssignModalState(null)}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            <FiUserCheck className="w-3.5 h-3.5" /> Reassign Stage Personnel
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-1">
            {stageLabels[stageKey]}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Job <span className="font-mono font-bold text-indigo-600">#{job.id}</span> • Client <span className="font-bold text-slate-900">{job.client}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Team Member
            </label>
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
            >
              {editors.map((ed) => (
                <option key={ed.id} value={ed.name}>
                  {ed.name} — {ed.role} ({ed.activeCount} active tasks)
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAssignModalState(null)}
              className="w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1"
            >
              <FiCheck className="w-4 h-4" /> Assign Personnel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
