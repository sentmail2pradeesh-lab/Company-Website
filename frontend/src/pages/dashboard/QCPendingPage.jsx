import { useJobs } from '../../context/JobContext';
import { FiCheckSquare, FiAlertCircle, FiClock, FiCheckCircle } from 'react-icons/fi';

export default function QCPendingPage() {
  const { jobs, setTimerModalState } = useJobs();

  // QC Pending filter: jobs where QC or FC is in Pending or In-Progress
  const qcJobs = jobs.filter(
    (j) =>
      (j.stages.qc && (j.stages.qc.status === 'Pending' || j.stages.qc.status === 'In-Progress')) ||
      (j.stages.fc && (j.stages.fc.status === 'Pending' || j.stages.fc.status === 'In-Progress'))
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-2">
            <FiAlertCircle className="w-3.5 h-3.5" /> Quality Control Queue
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            QC & FC Pending Approvals
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Direct verification view for QC leads (Arun QC, Arun DD) to review active stage outputs.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold">
          {qcJobs.length} Jobs Awaiting QC
        </div>
      </div>

      {/* QC Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {qcJobs.length === 0 ? (
          <div className="col-span-2 bg-white rounded-2xl p-12 text-center text-slate-500 text-xs border border-slate-200">
            <FiCheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            All QC and FC approvals are complete for today.
          </div>
        ) : (
          qcJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-600">Job #{job.id}</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{job.client} — {job.name}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-700">
                  {job.outputTarget} Files
                </span>
              </div>

              {/* Stage Progression Checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-slate-600 font-medium">Path 1 ({job.stages.path1?.assignee})</span>
                  <span className="text-emerald-700 font-semibold">{job.stages.path1?.status}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-slate-600 font-medium">Editor 1 ({job.stages.editor1?.assignee})</span>
                  <span className="text-emerald-700 font-semibold">{job.stages.editor1?.status}</span>
                </div>
                <div className="flex justify-between items-center bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                  <span className="text-rose-800 font-bold">QC ({job.stages.qc?.assignee})</span>
                  <button
                    onClick={() => setTimerModalState({ jobId: job.id, stageKey: 'qc' })}
                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] shadow-xs flex items-center gap-1"
                  >
                    <FiClock className="w-3 h-3" /> QC Action ({job.stages.qc?.status})
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
