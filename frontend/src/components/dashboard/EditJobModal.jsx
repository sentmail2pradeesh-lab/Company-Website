import { useState, useEffect } from 'react';
import { useJobs } from '../../context/JobContext';
import { FiX, FiCheck, FiEdit } from 'react-icons/fi';

export default function EditJobModal({ editModalState, setEditModalState }) {
  const { jobs, updateJobsState, editors, clients, canAssignJob } = useJobs();

  const [client, setClient] = useState('');
  const [name, setName] = useState('');
  const [outputTarget, setOutputTarget] = useState('');

  // Stage Assignees
  const [path1Assignee, setPath1Assignee] = useState('');
  const [path2Assignee, setPath2Assignee] = useState('');
  const [editor1Assignee, setEditor1Assignee] = useState('');
  const [editor2Assignee, setEditor2Assignee] = useState('');
  const [blendingAssignee, setBlendingAssignee] = useState('');
  const [lcAssignee, setLcAssignee] = useState('');
  const [fcAssignee, setFcAssignee] = useState('');

  // Stage File Counts
  const [path1Files, setPath1Files] = useState('');
  const [path2Files, setPath2Files] = useState('');
  const [editor1Files, setEditor1Files] = useState('');
  const [editor2Files, setEditor2Files] = useState('');
  const [blendingFiles, setBlendingFiles] = useState('');
  const [lcFiles, setLcFiles] = useState('');
  const [fcFiles, setFcFiles] = useState('');

  const job = editModalState ? jobs.find((j) => j.id === editModalState.jobId) : null;

  useEffect(() => {
    if (job) {
      setClient(job.client || '');
      setName(job.name || '');
      setOutputTarget(job.outputTarget || 0);

      setPath1Assignee(job.stages?.path1?.assignee || '');
      setPath2Assignee(job.stages?.path2?.assignee || '');
      setEditor1Assignee(job.stages?.editor1?.assignee || '');
      setEditor2Assignee(job.stages?.editor2?.assignee || '');
      setBlendingAssignee(job.stages?.blending?.assignee || '');
      setLcAssignee(job.stages?.lc?.assignee || '');
      setFcAssignee(job.stages?.fc?.assignee || '');

      const tot = job.outputTarget || 0;
      setPath1Files(job.stages?.path1?.filesCount !== undefined ? job.stages.path1.filesCount : tot);
      setPath2Files(job.stages?.path2?.filesCount !== undefined ? job.stages.path2.filesCount : 0);
      setEditor1Files(job.stages?.editor1?.filesCount !== undefined ? job.stages.editor1.filesCount : tot);
      setEditor2Files(job.stages?.editor2?.filesCount !== undefined ? job.stages.editor2.filesCount : 0);
      setBlendingFiles(job.stages?.blending?.filesCount !== undefined ? job.stages.blending.filesCount : tot);
      setLcFiles(job.stages?.lc?.filesCount !== undefined ? job.stages.lc.filesCount : tot);
      setFcFiles(job.stages?.fc?.filesCount !== undefined ? job.stages.fc.filesCount : tot);
    }
  }, [job]);

  useEffect(() => {
    if (editModalState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [editModalState]);

  if (!editModalState || !job || !canAssignJob) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const totOutput = Number(outputTarget) || job.outputTarget || 0;

      const createStageObject = (existingStage, assigneeName, filesCountVal) => {
        const stage = existingStage || {};
        const count = Number(filesCountVal) || 0;
        const hasAssignee = Boolean(assigneeName);
        let newStatus = stage.status;
        if (!hasAssignee) {
          newStatus = 'Unassigned';
        } else if (newStatus === 'Unassigned' || !newStatus) {
          newStatus = 'Pending';
        }

        return {
          ...stage,
          assignee: assigneeName || '',
          status: newStatus,
          filesCount: count,
          pausedDurationSeconds: stage.pausedDurationSeconds || 0,
          pauseLogs: stage.pauseLogs || [],
          outputCount: stage.outputCount || 0,
        };
      };

      const updatedJobs = jobs.map((j) => {
        if (j.id === job.id) {
          return {
            ...j,
            client: client || j.client,
            name: name || j.name,
            outputTarget: totOutput,
            stages: {
              ...j.stages,
              blending: createStageObject(j.stages?.blending, blendingAssignee, blendingFiles),
              path1: createStageObject(j.stages?.path1, path1Assignee, path1Files),
              path2: createStageObject(j.stages?.path2, path2Assignee, path2Files),
              editor1: createStageObject(j.stages?.editor1, editor1Assignee, editor1Files),
              editor2: createStageObject(j.stages?.editor2, editor2Assignee, editor2Files),
              lc: createStageObject(j.stages?.lc, lcAssignee, lcFiles),
              fc: createStageObject(j.stages?.fc, fcAssignee, fcFiles),
            },
          };
        }
        return j;
      });

      updateJobsState(updatedJobs);
      setEditModalState(null);
    } catch (err) {
      console.error('Error updating job:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xl my-auto max-h-[90vh] overflow-y-auto overscroll-contain">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setEditModalState(null)}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            <FiEdit className="w-3.5 h-3.5" /> Modify Job Specification
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-1">
            Edit Job <span className="font-mono text-indigo-600">#{job.id}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Update stage assignments and files count for each editor/stage.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Client</label>
              <select
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-semibold"
                required
              >
                {clients.length > 0 ? (
                  clients.map((c) => (
                    <option key={c.id} value={c.code}>
                      [{c.code}] {c.name}
                    </option>
                  ))
                ) : (
                  <option value={client}>{client}</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Folder Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Outputs</label>
              <input
                type="number"
                value={outputTarget}
                onChange={(e) => setOutputTarget(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono font-bold"
                required
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Modify Stage Personnel & File Allocations
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Path 1 */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">Path 1 Stage</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={path1Assignee}
                    onChange={(e) => setPath1Assignee(e.target.value)}
                    className="col-span-2 bg-white text-slate-800 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Unassigned</option>
                    {editors.map((ed) => (
                      <option key={ed.id} value={ed.name}>
                        {ed.name} ({ed.role})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={path1Files}
                    onChange={(e) => setPath1Files(e.target.value)}
                    placeholder="Files"
                    className="col-span-1 bg-white text-slate-800 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none focus:border-indigo-500"
                    title="Files count for Path 1"
                  />
                </div>
              </div>

              {/* Path 2 */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">Path 2 Stage</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={path2Assignee}
                    onChange={(e) => setPath2Assignee(e.target.value)}
                    className="col-span-2 bg-white text-slate-800 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Unassigned</option>
                    {editors.map((ed) => (
                      <option key={ed.id} value={ed.name}>
                        {ed.name} ({ed.role})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={path2Files}
                    onChange={(e) => setPath2Files(e.target.value)}
                    placeholder="Files"
                    className="col-span-1 bg-white text-slate-800 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none focus:border-indigo-500"
                    title="Files count for Path 2"
                  />
                </div>
              </div>

              {/* Editor 1 */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">Editor 1 Stage</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={editor1Assignee}
                    onChange={(e) => setEditor1Assignee(e.target.value)}
                    className="col-span-2 bg-white text-slate-800 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Unassigned</option>
                    {editors.map((ed) => (
                      <option key={ed.id} value={ed.name}>
                        {ed.name} ({ed.role})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={editor1Files}
                    onChange={(e) => setEditor1Files(e.target.value)}
                    placeholder="Files"
                    className="col-span-1 bg-white text-slate-800 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none focus:border-indigo-500"
                    title="Files count for Editor 1"
                  />
                </div>
              </div>

              {/* Editor 2 */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 space-y-1.5">
                <label className="block text-[11px] font-bold text-indigo-700">Editor 2 Stage (Missed Editor)</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={editor2Assignee}
                    onChange={(e) => setEditor2Assignee(e.target.value)}
                    className="col-span-2 bg-white text-slate-800 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Unassigned</option>
                    {editors.map((ed) => (
                      <option key={ed.id} value={ed.name}>
                        {ed.name} ({ed.role})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={editor2Files}
                    onChange={(e) => setEditor2Files(e.target.value)}
                    placeholder="Files"
                    className="col-span-1 bg-white text-slate-800 border border-indigo-300 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none focus:border-indigo-500 font-bold"
                    title="Files count for Editor 2"
                  />
                </div>
              </div>

              {/* LC */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">LC (Lightroom Correction)</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={lcAssignee}
                    onChange={(e) => setLcAssignee(e.target.value)}
                    className="col-span-2 bg-white text-slate-800 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Unassigned</option>
                    {editors.map((ed) => (
                      <option key={ed.id} value={ed.name}>
                        {ed.name} ({ed.role})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={lcFiles}
                    onChange={(e) => setLcFiles(e.target.value)}
                    placeholder="Files"
                    className="col-span-1 bg-white text-slate-800 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none focus:border-indigo-500"
                    title="Files count for LC"
                  />
                </div>
              </div>

              {/* FC */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">FC (Final Correction)</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={fcAssignee}
                    onChange={(e) => setFcAssignee(e.target.value)}
                    className="col-span-2 bg-white text-slate-800 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Unassigned</option>
                    {editors.map((ed) => (
                      <option key={ed.id} value={ed.name}>
                        {ed.name} ({ed.role})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={fcFiles}
                    onChange={(e) => setFcFiles(e.target.value)}
                    placeholder="Files"
                    className="col-span-1 bg-white text-slate-800 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none focus:border-indigo-500"
                    title="Files count for FC"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditModalState(null)}
              className="w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1 transition-all"
            >
              <FiCheck className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
