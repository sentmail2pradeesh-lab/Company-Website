import { useState, useEffect } from 'react';
import { useJobs } from '../../context/JobContext';
import { FiPlusCircle, FiX, FiCheck } from 'react-icons/fi';

export default function CreateJobModal() {
  const { isCreateModalOpen, setIsCreateModalOpen, createJob, editors, clients } = useJobs();

  const [client, setClient] = useState('');
  const [name, setName] = useState('');
  const [folderCount, setFolderCount] = useState('1');
  const [folderTargets, setFolderTargets] = useState([{ name: '', count: 25 }]);
  const [outputTarget, setOutputTarget] = useState('25');
  const [clientEntryTime, setClientEntryTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [clientTargetTime, setClientTargetTime] = useState('');

  const [blendingAssignee, setBlendingAssignee] = useState('');
  const [path1Assignee, setPath1Assignee] = useState('');
  const [path2Assignee, setPath2Assignee] = useState('');
  const [editor1Assignee, setEditor1Assignee] = useState('');
  const [editor2Assignee, setEditor2Assignee] = useState('');
  const [lcAssignee, setLcAssignee] = useState('');
  const [fcAssignee, setFcAssignee] = useState('');

  // Sync folderTargets array whenever folderCount changes
  useEffect(() => {
    const count = Math.max(1, parseInt(folderCount, 10) || 1);
    setFolderTargets((prev) => {
      const updated = [];
      for (let i = 0; i < count; i++) {
        updated.push({
          name: prev[i]?.name !== undefined ? prev[i].name : (count === 1 && name ? name : `Folder ${i + 1}`),
          count: prev[i]?.count !== undefined ? prev[i].count : (count === 1 && outputTarget ? Number(outputTarget) : 15),
        });
      }
      return updated;
    });
  }, [folderCount]);

  // Recalculate total outputs automatically when folder targets change
  useEffect(() => {
    if (Number(folderCount) > 1) {
      const sum = folderTargets.reduce((acc, f) => acc + (Number(f.count) || 0), 0);
      setOutputTarget(String(sum));
    }
  }, [folderTargets, folderCount]);

  const handleFolderNameChange = (index, val) => {
    setFolderTargets((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], name: val };
      return copy;
    });
    if (index === 0 && Number(folderCount) === 1) {
      setName(val);
    }
  };

  const handleFolderTargetChange = (index, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setFolderTargets((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], count: num };
      return copy;
    });
    if (index === 0 && Number(folderCount) === 1) {
      setOutputTarget(String(num));
    }
  };

  useEffect(() => {
    if (clients && clients.length > 0 && !client) {
      setClient(clients[0].code);
    }
  }, [clients, client]);

  useEffect(() => {
    if (isCreateModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCreateModalOpen]);

  if (!isCreateModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    let jobName = name.trim();
    if (Number(folderCount) > 1) {
      const folderNames = folderTargets.map((f, i) => (f.name || `Folder ${i + 1}`).trim()).filter(Boolean);
      if (!jobName) {
        jobName = folderNames.join(', ');
      } else {
        jobName = `${jobName} (${folderNames.join(', ')})`;
      }
    } else {
      if (!jobName && folderTargets[0]?.name) {
        jobName = folderTargets[0].name.trim();
      }
    }

    createJob({
      client: client || (clients[0]?.code || 'BE'),
      name: jobName || 'Untitled Job',
      folderCount: Number(folderCount) || 1,
      folderTargets,
      outputTarget: Number(outputTarget) || 0,
      clientEntryTime,
      clientTargetTime,
      blendingAssignee,
      path1Assignee,
      path2Assignee,
      editor1Assignee,
      editor2Assignee,
      lcAssignee,
      fcAssignee,
      qcAssignee: fcAssignee, // fallback compatibility
    });
    setIsCreateModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xl my-auto max-h-[90vh] overflow-y-auto overscroll-contain">
        {/* Close Button */}
        <button
          onClick={() => setIsCreateModalOpen(false)}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            <FiPlusCircle className="w-3.5 h-3.5" /> New Production Workflow
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-1">
            Create New Client Job
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter job details and assign team members for all pipeline stages.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Main Job Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Client ID / Code
              </label>
              {clients && clients.length > 0 ? (
                <select
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white font-mono font-bold"
                  required
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.code}>
                      [{c.code}] {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={client}
                  onChange={(e) => setClient(e.target.value.toUpperCase())}
                  placeholder="e.g. BE, CE, EPIC, RE"
                  className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white font-mono font-bold"
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Folder Count
              </label>
              <div className="flex items-center gap-1.5">
                {Number(folderCount) > 1 && (
                  <button
                    type="button"
                    onClick={() => setFolderCount(String(Math.max(1, Number(folderCount) - 1)))}
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    -
                  </button>
                )}
                <input
                  type="number"
                  min="1"
                  value={folderCount}
                  onChange={(e) => setFolderCount(e.target.value)}
                  className="w-full text-center bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white font-mono font-bold"
                  required
                />
                <button
                  type="button"
                  onClick={() => setFolderCount(String(Number(folderCount) + 1))}
                  className="w-9 h-9 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 flex items-center justify-center transition-colors cursor-pointer"
                  title="Add another folder"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Single Folder Name OR Multiple Folder Names Section */}
          {Number(folderCount) <= 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Folder / Job Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    handleFolderNameChange(0, e.target.value);
                  }}
                  placeholder="e.g. 1035 Nonchalant Dr"
                  className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Target Output Files Count
                </label>
                <input
                  type="number"
                  value={outputTarget}
                  onChange={(e) => {
                    setOutputTarget(e.target.value);
                    handleFolderTargetChange(0, Number(e.target.value) || 0);
                  }}
                  className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white font-mono font-bold"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Job / Project Title <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. 1035 Nonchalant Dr"
                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Total Outputs <span className="text-indigo-600 font-bold">({outputTarget} Files)</span>
                  </label>
                  <input
                    type="number"
                    value={outputTarget}
                    readOnly
                    className="w-full bg-slate-100 text-indigo-900 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Multiple Folder Names Card */}
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    📁 Folder Names &amp; Targets ({folderTargets.length} Folders)
                  </span>
                  <button
                    type="button"
                    onClick={() => setFolderCount(String(Number(folderCount) + 1))}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                  >
                    + Add Folder
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {folderTargets.map((ft, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-indigo-100 shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-indigo-900 border-b border-slate-100 pb-1">
                        <span>Folder #{idx + 1}</span>
                        {folderTargets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = folderTargets.filter((_, i) => i !== idx);
                              setFolderTargets(updated);
                              setFolderCount(String(updated.length));
                            }}
                            className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                            Folder Name
                          </label>
                          <input
                            type="text"
                            placeholder={`e.g. Living Room, Exterior...`}
                            value={ft.name}
                            onChange={(e) => handleFolderNameChange(idx, e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                            Files
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={ft.count}
                            onChange={(e) => handleFolderTargetChange(idx, e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-bold text-indigo-900 focus:outline-none focus:border-indigo-500 focus:bg-white text-center"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Client Entry Time (Received)
              </label>
              <input
                type="datetime-local"
                value={clientEntryTime}
                onChange={(e) => setClientEntryTime(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Client Target Delivery Time
              </label>
              <input
                type="datetime-local"
                value={clientTargetTime}
                onChange={(e) => setClientTargetTime(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Stage Assignments Grid */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
              Stage Personnel Assignments
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Blending Assigned</label>
                <select
                  value={blendingAssignee}
                  onChange={(e) => setBlendingAssignee(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {editors.map((ed) => (
                    <option key={ed.id} value={ed.name}>
                      {ed.name} ({ed.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Path 1 Assigned</label>
                <select
                  value={path1Assignee}
                  onChange={(e) => setPath1Assignee(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {editors.map((ed) => (
                    <option key={ed.id} value={ed.name}>
                      {ed.name} ({ed.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Path 2 Assigned</label>
                <select
                  value={path2Assignee}
                  onChange={(e) => setPath2Assignee(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {editors.map((ed) => (
                    <option key={ed.id} value={ed.name}>
                      {ed.name} ({ed.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Editor 1 Assigned</label>
                <select
                  value={editor1Assignee}
                  onChange={(e) => setEditor1Assignee(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {editors.map((ed) => (
                    <option key={ed.id} value={ed.name}>
                      {ed.name} ({ed.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Editor 2 Assigned</label>
                <select
                  value={editor2Assignee}
                  onChange={(e) => setEditor2Assignee(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {editors.map((ed) => (
                    <option key={ed.id} value={ed.name}>
                      {ed.name} ({ed.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">LC Assigned</label>
                <select
                  value={lcAssignee}
                  onChange={(e) => setLcAssignee(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {editors.map((ed) => (
                    <option key={ed.id} value={ed.name}>
                      {ed.name} ({ed.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">FC (Final QC) Assigned</label>
                <select
                  value={fcAssignee}
                  onChange={(e) => setFcAssignee(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {editors.map((ed) => (
                    <option key={ed.id} value={ed.name}>
                      {ed.name} ({ed.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1"
            >
              <FiCheck className="w-4 h-4" /> Create & Assign Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
