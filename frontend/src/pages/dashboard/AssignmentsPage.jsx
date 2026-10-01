import { useJobs } from '../../context/JobContext';
import { FiUsers } from 'react-icons/fi';

export default function AssignmentsPage() {
  const { assignableEditors: rawAssignable, editors, jobs } = useJobs();
  const productionStaff = rawAssignable || editors.filter((e) => (e.designation || e.role || '').toLowerCase() !== 'developer');

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 mb-2">
          <FiUsers className="w-3.5 h-3.5" /> Personnel Load & Duty Allocator
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-sans tracking-tight">
          Employee Job Assignments & Workload
        </h1>
        <p className="text-sm text-slate-400 mt-1 font-medium">
          Overview of team members assigned to Path 1, Path 2, Primary Editing, Secondary Editing, QC, and FC.
        </p>
      </div>

      {/* Team Roster Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {productionStaff.map((editor) => {
          // Find assigned active jobs for this editor
          const assignedJobs = jobs.filter((j) =>
            Object.entries(j.stages || {}).some(
              ([stageKey, stageObj]) => stageObj?.assignee === editor.name && stageObj?.status !== 'Complete'
            )
          );

          return (
            <div
              key={editor.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4 hover:border-indigo-200 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 border border-indigo-500 flex items-center justify-center font-bold text-white text-base shadow-sm">
                    {editor.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{editor.name}</h3>
                    <span className="text-xs font-medium text-slate-500">{editor.role}</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {assignedJobs.length} Tasks
                </span>
              </div>

              {/* Active Assigned Tasks List */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1.5">
                  Assigned Pipeline Items:
                </div>
                {assignedJobs.length === 0 ? (
                  <div className="text-slate-400 text-xs italic py-2">No active tasks currently assigned.</div>
                ) : (
                  assignedJobs.map((j) => (
                    <div key={j.id} className="flex justify-between items-center bg-slate-50 hover:bg-slate-100/70 p-3 rounded-xl border border-slate-100 gap-2 transition-colors">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="font-mono text-indigo-600 font-bold text-xs sm:text-sm shrink-0">#{j.id}</span>
                        <span className="text-slate-800 font-medium text-xs sm:text-sm truncate" title={`${j.client} - ${j.name || ''}`}>
                          {j.client} <span className="text-slate-400 font-normal">({j.name || 'Job'})</span>
                        </span>
                      </div>
                      <span className="text-amber-800 font-mono text-xs font-bold shrink-0 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        {j.outputTarget} Files
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
