import { useJobs } from '../../context/JobContext';
import { FiCheckSquare, FiAlertCircle, FiClock, FiCheckCircle } from 'react-icons/fi';

export default function QCPendingPage() {
  const { jobs, setTimerModalState, canUpdateStage } = useJobs();

  // QC / LC / FC Pending filter: jobs where lc, qc, or fc is in Pending or In-Progress
  const qcJobs = jobs.filter((j) => {
    if (!j.stages) return false;
    const isStageActive = (st) => st && (st.status === 'Pending' || st.status === 'In Progress' || st.status === 'In-Progress' || st.status === 'Paused');
    return isStageActive(j.stages.lc) || isStageActive(j.stages.fc) || isStageActive(j.stages.qc);
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Progress':
      case 'In-Progress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Paused':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Pending':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-2">
            <FiAlertCircle className="w-3.5 h-3.5" /> Quality Control & Verification Queue
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            LC & FC Pending Approvals
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dedicated verification queue for Lightroom Correction (LC) and Final Check (FC) approvals.
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold self-start sm:self-auto">
          {qcJobs.length} Jobs Awaiting Review
        </div>
      </div>

      {/* QC Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {qcJobs.length === 0 ? (
          <div className="col-span-2 bg-white rounded-2xl p-12 text-center text-slate-500 text-xs border border-slate-200 shadow-xs">
            <FiCheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">All Quality Checks Cleared</h3>
            <p className="mt-1 text-slate-500">All LC and FC verification approvals are complete for active production jobs.</p>
          </div>
        ) : (
          qcJobs.map((job) => {
            const stages = job.stages || {};
            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-600">Job #{job.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {job.client}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{job.name}</h3>
                  </div>
                  <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-slate-100 text-slate-800">
                    {job.outputTarget} Files
                  </span>
                </div>

                {/* Preceding Pipeline Stages Status Summary */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Upstream Pipeline Progression
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold">Blending</span>
                      <span className="text-slate-800 font-medium truncate block">{stages.blending?.assignee || 'Unassigned'}</span>
                      <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 border ${getStatusBadge(stages.blending?.status)}`}>
                        {stages.blending?.status || 'Unassigned'}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold">Path 1</span>
                      <span className="text-slate-800 font-medium truncate block">{stages.path1?.assignee || 'Unassigned'}</span>
                      <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 border ${getStatusBadge(stages.path1?.status)}`}>
                        {stages.path1?.status || 'Unassigned'}
                      </span>
                    </div>
                    {stages.path2?.assignee && (
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">Path 2</span>
                        <span className="text-slate-800 font-medium truncate block">{stages.path2?.assignee}</span>
                        <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 border ${getStatusBadge(stages.path2?.status)}`}>
                          {stages.path2?.status || 'Unassigned'}
                        </span>
                      </div>
                    )}
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold">Editor 1</span>
                      <span className="text-slate-800 font-medium truncate block">{stages.editor1?.assignee || 'Unassigned'}</span>
                      <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 border ${getStatusBadge(stages.editor1?.status)}`}>
                        {stages.editor1?.status || 'Unassigned'}
                      </span>
                    </div>
                    {stages.editor2?.assignee && (
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">Editor 2</span>
                        <span className="text-slate-800 font-medium truncate block">{stages.editor2?.assignee}</span>
                        <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 border ${getStatusBadge(stages.editor2?.status)}`}>
                          {stages.editor2?.status || 'Unassigned'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* LC & FC Verification Action Cards */}
                <div className="space-y-2.5 pt-1">
                  {/* LC Stage */}
                  {stages.lc && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-amber-900">LC (Lightroom Correction)</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200/80 text-amber-900">
                            {stages.lc.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          Assigned: <span className="font-semibold">{stages.lc.assignee || 'Unassigned'}</span> ({stages.lc.filesCount || job.outputTarget} files)
                        </p>
                      </div>
                      {canUpdateStage(stages.lc.assignee) ? (
                        <button
                          onClick={() => setTimerModalState({ jobId: job.id, stageKey: 'lc' })}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
                        >
                          <FiClock className="w-3.5 h-3.5" /> Action
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-amber-700 bg-amber-100/60 px-2.5 py-1 rounded-lg">
                          Locked
                        </span>
                      )}
                    </div>
                  )}

                  {/* FC Stage */}
                  {stages.fc && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/70 border border-rose-200">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-rose-900">FC (Final Check / QC)</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-200/80 text-rose-900">
                            {stages.fc.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-rose-800 mt-0.5">
                          Assigned: <span className="font-semibold">{stages.fc.assignee || 'Unassigned'}</span> ({stages.fc.filesCount || job.outputTarget} files)
                        </p>
                      </div>
                      {canUpdateStage(stages.fc.assignee) ? (
                        <button
                          onClick={() => setTimerModalState({ jobId: job.id, stageKey: 'fc' })}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
                        >
                          <FiClock className="w-3.5 h-3.5" /> Action
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-rose-700 bg-rose-100/60 px-2.5 py-1 rounded-lg">
                          Locked
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
