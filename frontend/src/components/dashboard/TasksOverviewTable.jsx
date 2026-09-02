import { useJobs } from '../../context/JobContext';

export default function TasksOverviewTable() {
  const { jobs, editors } = useJobs();

  // Compute live workload matrix per editor dynamically from job creation file counts
  const editorWorkload = editors.map((editor) => {
    let pathCount = 0;
    let editingCount = 0;
    let lcCount = 0;

    jobs.forEach((j) => {
      // Check Path 1 & Path 2
      if (j.stages.path1?.assignee === editor.name) {
        pathCount += (j.stages.path1.filesCount !== undefined ? j.stages.path1.filesCount : (j.outputTarget || 0));
      }
      if (j.stages.path2?.assignee === editor.name) {
        pathCount += (j.stages.path2.filesCount !== undefined ? j.stages.path2.filesCount : (j.outputTarget || 0));
      }

      // Check Editor 1 & Editor 2 (Designer 1 & 2)
      if (j.stages.editor1?.assignee === editor.name) {
        editingCount += (j.stages.editor1.filesCount !== undefined ? j.stages.editor1.filesCount : (j.outputTarget || 0));
      }
      if (j.stages.editor2?.assignee === editor.name) {
        editingCount += (j.stages.editor2.filesCount !== undefined ? j.stages.editor2.filesCount : (j.outputTarget || 0));
      }

      // Check Blending (Lightroom Correction) & FC (Final Correction)
      if (j.stages.blending?.assignee === editor.name) {
        lcCount += (j.stages.blending.filesCount !== undefined ? j.stages.blending.filesCount : (j.outputTarget || 0));
      }
      if (j.stages.fc?.assignee === editor.name) {
        lcCount += (j.stages.fc.filesCount !== undefined ? j.stages.fc.filesCount : (j.outputTarget || 0));
      }
    });

    return {
      name: editor.name,
      role: editor.role,
      path: pathCount,
      editing: editingCount,
      qc: lcCount,
      totalActive: pathCount + editingCount + lcCount,
    };
  });

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
      {/* Purple Header Banner matching screenshot */}
      <div className="bg-[#834BFF] text-white px-6 py-4 font-bold text-lg">
        Tasks Overview
      </div>

      {/* Clean Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider bg-slate-50/50">
              <th className="py-3 px-6">Editor</th>
              <th className="py-3 px-4 text-center">Path</th>
              <th className="py-3 px-4 text-center">Editing</th>
              <th className="py-3 px-6 text-center">LC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {editorWorkload.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-6 font-medium text-slate-800">
                  {item.name}
                </td>
                <td className="py-3 px-4 text-center font-mono font-medium">
                  {item.path}
                </td>
                <td className="py-3 px-4 text-center font-mono font-medium">
                  {item.editing}
                </td>
                <td className="py-3 px-6 text-center font-mono font-medium">
                  {item.qc}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

