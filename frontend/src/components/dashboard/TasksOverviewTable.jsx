import { useJobs } from '../../context/JobContext';

export default function TasksOverviewTable() {
  const { jobs, editors } = useJobs();

  // Compute live workload matrix per editor dynamically from job creation file counts
  const editorWorkload = editors.map((editor) => {
    let blendingCount = 0;
    let pathCount = 0;
    let editingCount = 0;
    let lcFcCount = 0;

    jobs.forEach((j) => {
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

      // Check LC (Lightroom Correction) & FC / QC
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
      totalActive: blendingCount + pathCount + editingCount + lcFcCount,
    };
  });

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
      {/* Purple Header Banner */}
      <div className="bg-[#834BFF] text-white px-5 py-3.5 font-bold text-base flex justify-between items-center">
        <span>Tasks Overview</span>
        <span className="text-xs font-medium text-purple-200">Active Workload</span>
      </div>

      {/* Clean Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider bg-slate-50/60">
              <th className="py-2.5 px-4">Editor</th>
              <th className="py-2.5 px-2 text-center">Blend</th>
              <th className="py-2.5 px-2 text-center">Path</th>
              <th className="py-2.5 px-2 text-center">Edit</th>
              <th className="py-2.5 px-3 text-center">LC/FC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {editorWorkload.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 px-4 font-semibold text-slate-800">
                  <span className="block truncate max-w-[110px]" title={item.name}>{item.name}</span>
                </td>
                <td className="py-2.5 px-2 text-center font-mono text-slate-600">
                  {item.blend}
                </td>
                <td className="py-2.5 px-2 text-center font-mono text-slate-600">
                  {item.path}
                </td>
                <td className="py-2.5 px-2 text-center font-mono text-slate-600">
                  {item.editing}
                </td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-600">
                  {item.lc}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
