import { useJobs } from '../../context/JobContext';
import { FiUsers } from 'react-icons/fi';

export default function AssignmentsPage() {
  const { editors, jobs } = useJobs();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 mb-2">
          <FiUsers className="w-3.5 h-3.5" /> Personnel Load & Duty Allocator
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
          Employee Job Assignments & Workload
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Overview of team members assigned to Path 1, Path 2, Primary Editing, Secondary Editing, QC, and FC.
        </p>
      </div>

      {/* Team Roster Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {editors.map((editor) => {
          // Find assigned active jobs for this editor
          const assignedJobs = jobs.filter((j) =>
            Object.entries(j.stages).some(
              ([stageKey, stageObj]) => stageObj.assignee === editor.name && stageObj.status !== 'Complete'
            )
          );

          return (
            <div
              key={editor.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 border border-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-sm">
                    {editor.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{editor.name}</h3>
                    <span className="text-xs text-slate-400">{editor.role}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {assignedJobs.length} Tasks
                </span>
              </div>

              {/* Active Assigned Tasks List */}
              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                <div className="text-slate-500 font-semibold mb-1">Assigned Pipeline Items:</div>
                {assignedJobs.length === 0 ? (
                  <div className="text-slate-400 text-xs italic">No active tasks currently assigned.</div>
                ) : (
                  assignedJobs.map((j) => (
                    <div key={j.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div>
                        <span className="font-mono text-indigo-600 font-bold">#{j.id}</span>
                        <span className="text-slate-700 ml-2 font-medium">{j.client}</span>
                      </div>
                      <span className="text-amber-700 font-mono text-[11px] font-bold">{j.outputTarget} Files</span>
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
