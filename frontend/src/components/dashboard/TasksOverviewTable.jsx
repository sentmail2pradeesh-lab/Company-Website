import { useMemo } from 'react';
import { useJobs } from '../../context/JobContext';

export default function TasksOverviewTable() {
  const { todaysJobs, jobs, assignableEditors: rawAssignable, editors, operationalDate } = useJobs();
  const activeJobs = todaysJobs || jobs;

  // Compute live workload matrix per editor for today's operational shift (excludes developers)
  const editorWorkload = useMemo(() => {
    const productionStaff = rawAssignable || editors.filter((e) => (e.designation || e.role || '').toLowerCase() !== 'developer');
    return productionStaff.map((editor) => {
      let blendingCount = 0;
      let pathCount = 0;
      let editingCount = 0;
      let lcFcCount = 0;

      activeJobs.forEach((j) => {
        const stages = j.stages || {};

        // Check Blending
        if (stages.blending?.assignee === editor.name) {
          blendingCount += (stages.blending.filesCount !== undefined ? Number(stages.blending.filesCount) : (Number(j.outputTarget) || 0));
        }

        // Check Path 1 & Path 2
        if (stages.path1?.assignee === editor.name) {
          pathCount += (stages.path1.filesCount !== undefined ? Number(stages.path1.filesCount) : (Number(j.outputTarget) || 0));
        }
        if (stages.path2?.assignee === editor.name) {
          pathCount += (stages.path2.filesCount !== undefined ? Number(stages.path2.filesCount) : 0);
        }

        // Check Editor 1 & Editor 2
        if (stages.editor1?.assignee === editor.name) {
          editingCount += (stages.editor1.filesCount !== undefined ? Number(stages.editor1.filesCount) : (Number(j.outputTarget) || 0));
        }
        if (stages.editor2?.assignee === editor.name) {
          editingCount += (stages.editor2.filesCount !== undefined ? Number(stages.editor2.filesCount) : 0);
        }

        // Check LC & FC
        if (stages.lc?.assignee === editor.name) {
          lcFcCount += (stages.lc.filesCount !== undefined ? Number(stages.lc.filesCount) : (Number(j.outputTarget) || 0));
        }
        if (stages.fc?.assignee === editor.name) {
          lcFcCount += (stages.fc.filesCount !== undefined ? Number(stages.fc.filesCount) : (Number(j.outputTarget) || 0));
        }
        if (stages.qc?.assignee === editor.name && !stages.fc) {
          lcFcCount += (stages.qc.filesCount !== undefined ? Number(stages.qc.filesCount) : (Number(j.outputTarget) || 0));
        }
      });

      return {
        name: editor.name,
        role: editor.role,
        blend: blendingCount,
        path: pathCount,
        editing: editingCount,
        lc: lcFcCount,
      };
    });
  }, [activeJobs, editors, rawAssignable]);

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
      {/* Purple Header Banner */}
      <div className="bg-[#834BFF] text-white px-5 py-3.5 font-bold text-base flex justify-between items-center">
        <span>Tasks Overview</span>
        <span className="text-xs font-medium text-purple-200">Today's Shift</span>
      </div>

      {/* Clean Table Container with 2-axis scrolling (horizontal & vertical) */}
      <div className="overflow-x-auto overflow-y-auto max-h-[380px] custom-scrollbar touch-pan-x touch-pan-y" data-lenis-prevent>
        <table className="w-full text-left text-xs min-w-[340px]">
          <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 shadow-2xs">
            <tr className="text-slate-600 font-bold text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-4 bg-slate-50">Editor</th>
              <th className="py-2.5 px-2 text-center bg-slate-50">Blend</th>
              <th className="py-2.5 px-2 text-center bg-slate-50">Path</th>
              <th className="py-2.5 px-2 text-center bg-slate-50">Edit</th>
              <th className="py-2.5 px-3 text-center bg-slate-50">LC/FC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {editorWorkload.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-400 font-medium text-xs">
                  No active personnel registered yet
                </td>
              </tr>
            ) : (
              editorWorkload.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-semibold text-slate-800 capitalize">
                    <span className="block truncate max-w-[110px]" title={item.name}>
                      {item.name}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono">
                    <span className={item.blend > 0 ? "font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]" : "text-slate-400 font-normal"}>
                      {item.blend}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono">
                    <span className={item.path > 0 ? "font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[11px]" : "text-slate-400 font-normal"}>
                      {item.path}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono">
                    <span className={item.editing > 0 ? "font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[11px]" : "text-slate-400 font-normal"}>
                      {item.editing}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">
                    <span className={item.lc > 0 ? "font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]" : "text-slate-400 font-normal"}>
                      {item.lc}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
