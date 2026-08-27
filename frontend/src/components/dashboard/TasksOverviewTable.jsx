import { useJobs } from '../../context/JobContext';
import { FiUsers } from 'react-icons/fi';

export default function TasksOverviewTable() {
  const { jobs, editors } = useJobs();

  // Compute live workload matrix per editor
  const editorWorkload = editors.map((editor) => {
    let pathCount = 0;
    let editingCount = 0;
    let qcCount = 0;

    jobs.forEach((j) => {
      // Check Path 1 & Path 2
      if (j.stages.path1?.assignee === editor.name && j.stages.path1?.status !== 'Complete') pathCount += (j.outputTarget || 1);
      if (j.stages.path2?.assignee === editor.name && j.stages.path2?.status !== 'Complete') pathCount += (j.outputTarget || 1);

      // Check Editor 1 & Editor 2
      if (j.stages.editor1?.assignee === editor.name && j.stages.editor1?.status !== 'Complete') editingCount += (j.outputTarget || 1);
      if (j.stages.editor2?.assignee === editor.name && j.stages.editor2?.status !== 'Complete') editingCount += (j.outputTarget || 1);

      // Check QC & FC
      if (j.stages.qc?.assignee === editor.name && j.stages.qc?.status !== 'Complete') qcCount += (j.outputTarget || 1);
      if (j.stages.fc?.assignee === editor.name && j.stages.fc?.status !== 'Complete') qcCount += (j.outputTarget || 1);
    });

    return {
      name: editor.name,
      role: editor.role,
      path: pathCount,
      editing: editingCount,
      qc: qcCount,
      totalActive: pathCount + editingCount + qcCount,
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Sleek Dark Header Accent */}
      <div className="bg-slate-900 text-white p-4.5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2">
            <FiUsers className="w-4 h-4 text-cyan-400" /> Tasks Overview & Editor Matrix
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Active file workloads for Pathing, Editing, and QC
          </p>
        </div>
        <span className="text-[11px] font-mono font-bold bg-white/10 text-cyan-300 px-2.5 py-0.5 rounded-full border border-white/10">
          {editors.length} Personnel
        </span>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto p-4 flex-1">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="pb-2.5 px-3">Editor</th>
              <th className="pb-2.5 px-3 text-center">Pathing</th>
              <th className="pb-2.5 px-3 text-center">Editing</th>
              <th className="pb-2.5 px-3 text-center">QC</th>
              <th className="pb-2.5 px-3 text-right">Active Load</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {editorWorkload.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-3">
                  <div className="font-semibold text-slate-900">{item.name}</div>
                  <div className="text-[10px] text-slate-400">{item.role}</div>
                </td>
                <td className="py-2.5 px-3 text-center font-mono">
                  {item.path > 0 ? (
                    <span className="text-amber-600 font-bold">{item.path}</span>
                  ) : (
                    <span className="text-slate-300">0</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-center font-mono">
                  {item.editing > 0 ? (
                    <span className="text-indigo-600 font-bold">{item.editing}</span>
                  ) : (
                    <span className="text-slate-300">0</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-center font-mono">
                  {item.qc > 0 ? (
                    <span className="text-rose-600 font-bold">{item.qc}</span>
                  ) : (
                    <span className="text-slate-300">0</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                      item.totalActive > 0
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    {item.totalActive}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
