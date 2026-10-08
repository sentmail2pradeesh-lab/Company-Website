import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import { FiArrowLeft, FiCheck, FiPlusCircle, FiClock, FiUsers } from 'react-icons/fi';

export default function CreateJobPage() {
  const navigate = useNavigate();
  const { createJob, createJobs, assignableEditors: rawAssignable, editors, clients } = useJobs();
  const assignableEditors = rawAssignable || editors.filter((e) => (e.designation || e.role || '').toLowerCase() !== 'developer');

  // Line 1: Client Details
  const [client, setClient] = useState('');
  const [category, setCategory] = useState('Photo Editing');
  const [level, setLevel] = useState('Basic');

  // Line 2: Folder Details
  const [name, setName] = useState('');
  const [folderCount, setFolderCount] = useState(1);
  const [folderTargets, setFolderTargets] = useState([{ name: 'Folder 1', count: 25 }]);
  const [totalOutputs, setTotalOutputs] = useState(25);

  // Timestamps
  const [folderCreatedTime, setFolderCreatedTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [targetTime, setTargetTime] = useState('');

  // Stage Assignees & Files Count
  // Line 1: Blending Stage
  const [blendingAssignee, setBlendingAssignee] = useState('');
  const [blendingFiles, setBlendingFiles] = useState('');

  // Line 2: Path Details (Path 1 & Path 2)
  const [path1Assignee, setPath1Assignee] = useState('');
  const [path1Files, setPath1Files] = useState('');

  const [path2Assignee, setPath2Assignee] = useState('');
  const [path2Files, setPath2Files] = useState('');

  // Line 3: Editing, LC & FC Details (Editor 1, Editor 2, LC, FC)
  const [editor1Assignee, setEditor1Assignee] = useState('');
  const [editor1Files, setEditor1Files] = useState('');

  const [editor2Assignee, setEditor2Assignee] = useState('');
  const [editor2Files, setEditor2Files] = useState('');

  const [lcAssignee, setLcAssignee] = useState('');
  const [lcFiles, setLcFiles] = useState('');

  const [fcAssignee, setFcAssignee] = useState('');
  const [fcFiles, setFcFiles] = useState('');

  const [instruction, setInstruction] = useState('');

  // Sync folderTargets array whenever folderCount changes
  useEffect(() => {
    const count = Math.max(1, Number(folderCount) || 1);
    setFolderTargets((prev) => {
      const updated = [];
      for (let i = 0; i < count; i++) {
        updated.push({
          name: prev[i]?.name !== undefined ? prev[i].name : (count === 1 && name ? name : `Folder ${i + 1}`),
          count: prev[i]?.count !== undefined ? prev[i].count : (count === 1 && totalOutputs ? totalOutputs : 15),
        });
      }
      return updated;
    });
  }, [folderCount]);

  // Recalculate total outputs automatically when folder targets change
  useEffect(() => {
    const sum = folderTargets.reduce((acc, f) => acc + (Number(f.count) || 0), 0);
    setTotalOutputs(sum);
  }, [folderTargets]);

  const handleFolderCountChange = (val) => {
    const num = Math.max(1, parseInt(val, 10) || 1);
    setFolderCount(num);
  };

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
      setTotalOutputs(num);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const count = Number(folderCount) || 1;
    const rawBatchName = name.trim();
    const firstFolderName = (folderTargets[0]?.name || '').trim();
    // If the batch name was auto-synced from Folder 1, ignore it as a prefix so folder names remain clean
    const isBatchNameAutoSynced = rawBatchName === firstFolderName;
    const effectiveBatchName = isBatchNameAutoSynced ? '' : rawBatchName;

    if (count > 1 && folderTargets.length > 1) {
      const jobsToCreate = folderTargets.map((ft, idx) => {
        const folderName = (ft.name || '').trim() || `Folder ${idx + 1}`;
        let resolvedName = folderName;
        if (effectiveBatchName && effectiveBatchName !== folderName && !folderName.toLowerCase().includes(effectiveBatchName.toLowerCase())) {
          resolvedName = `${effectiveBatchName} - ${folderName}`;
        }

        const folderFiles = Number(ft.count) || 0;
        const total = totalOutputs > 0 ? totalOutputs : 1;

        const calcStageFiles = (assignee, stageFilesInput) => {
          if (!assignee) return 0;
          if (stageFilesInput !== undefined && stageFilesInput !== '' && Number(stageFilesInput) > 0) {
            if (Number(stageFilesInput) === totalOutputs) {
              return folderFiles;
            }
            return Math.round((Number(stageFilesInput) / total) * folderFiles) || folderFiles;
          }
          return folderFiles;
        };

        return {
          client: client || (clients[0]?.code || 'BE'),
          category: category || 'Photo Editing',
          name: resolvedName,
          level: level || 'Basic',
          folderCount: 1,
          folderTargets: [{ name: resolvedName, count: folderFiles }],
          outputTarget: folderFiles,
          instruction,
          clientEntryTime: folderCreatedTime || new Date().toISOString().slice(0, 16),
          clientTargetTime: targetTime,

          blendingAssignee,
          blendingFiles: calcStageFiles(blendingAssignee, blendingFiles),

          path1Assignee,
          path1Files: calcStageFiles(path1Assignee, path1Files),

          path2Assignee,
          path2Files: calcStageFiles(path2Assignee, path2Files),

          editor1Assignee,
          editor1Files: calcStageFiles(editor1Assignee, editor1Files),

          editor2Assignee,
          editor2Files: calcStageFiles(editor2Assignee, editor2Files),

          lcAssignee,
          lcFiles: calcStageFiles(lcAssignee, lcFiles),

          fcAssignee,
          fcFiles: calcStageFiles(fcAssignee, fcFiles),
        };
      });

      await createJobs(jobsToCreate);
      navigate('/dashboard/jobs');
      return;
    }

    // Single folder
    let singleJobName = (folderTargets[0]?.name || name || 'Untitled Job').trim();
    const singleOutput = Number(folderTargets[0]?.count) || Number(totalOutputs) || 0;
    await createJob({
      client: client || (clients[0]?.code || 'BE'),
      category: category || 'Photo Editing',
      name: singleJobName,
      level: level || 'Basic',
      folderCount: 1,
      folderTargets: [{ name: singleJobName, count: singleOutput }],
      outputTarget: singleOutput,
      instruction,
      clientEntryTime: folderCreatedTime || new Date().toISOString().slice(0, 16),
      clientTargetTime: targetTime,

      blendingAssignee,
      blendingFiles: Number(blendingFiles) || (blendingAssignee ? singleOutput : 0),

      path1Assignee,
      path1Files: Number(path1Files) || (path1Assignee ? singleOutput : 0),

      path2Assignee,
      path2Files: Number(path2Files) || 0,

      editor1Assignee,
      editor1Files: Number(editor1Files) || (editor1Assignee ? singleOutput : 0),

      editor2Assignee,
      editor2Files: Number(editor2Files) || 0,

      lcAssignee,
      lcFiles: Number(lcFiles) || (lcAssignee ? singleOutput : 0),

      fcAssignee,
      fcFiles: Number(fcFiles) || (fcAssignee ? singleOutput : 0),
    });

    navigate('/dashboard/jobs');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-16">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-indigo-600 mb-2 transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
            Create Job
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete job specification, folder count breakdown, timestamps, and stage assignments.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-8 md:p-10 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Client & Job Information */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-xs">
                1
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  Client &amp; Job Specification
                </h3>
              </div>
            </div>

            {/* Line 1: Client Details (Client, Category, Job Level) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Client</label>
                <select
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm sm:text-[15px] min-h-[48px] text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer transition-all"
                  required
                >
                  <option value="">Choose Client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.code}{c.name && c.name !== c.code ? ` (${c.name})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm sm:text-[15px] min-h-[48px] text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer transition-all"
                  required
                >
                  <option value="Photo Editing">Photo Editing</option>
                  <option value="Real Estate Photo">Real Estate Photo</option>
                  <option value="Video Editing">Video Editing</option>
                  <option value="Floor Plan">Floor Plan</option>
                  <option value="Virtual Staging">Virtual Staging</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">Job Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm sm:text-[15px] min-h-[48px] text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer transition-all"
                  required
                >
                  <option value="Basic">Basic</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
            </div>

            {/* Line 2: Folder Details & Dynamic Multiple Folder Names */}
            {Number(folderCount) <= 1 ? (
              /* Single Folder View */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 pt-1">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Folder / Job Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      handleFolderNameChange(0, e.target.value);
                    }}
                    placeholder="e.g. 1035 Nonchalant Dr"
                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm sm:text-[15px] min-h-[48px] text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Folder Count</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={folderCount}
                      onChange={(e) => handleFolderCountChange(e.target.value)}
                      placeholder="e.g. 1, 2"
                      className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm sm:text-[15px] min-h-[48px] text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-center"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleFolderCountChange(2)}
                      className="px-4 py-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-bold border border-indigo-200 shrink-0 transition-colors cursor-pointer min-h-[48px]"
                      title="Add more folders"
                    >
                      + Add Folders
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">Total Outputs (Files Count)</label>
                  <input
                    type="number"
                    value={totalOutputs}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setTotalOutputs(val);
                      handleFolderTargetChange(0, val);
                    }}
                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm sm:text-[15px] min-h-[48px] text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-center"
                    required
                  />
                </div>
              </div>
            ) : (
              /* Multiple Folders View */
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">
                      Project / Order Batch Name <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. 1035 Nonchalant Dr (Leave blank to use folder names)"
                      className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm sm:text-[15px] min-h-[48px] text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">Folder Count</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleFolderCountChange(Math.max(1, Number(folderCount) - 1))}
                        className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg border border-slate-200 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
                        title="Remove a folder"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={folderCount}
                        onChange={(e) => handleFolderCountChange(e.target.value)}
                        className="w-full text-center bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm sm:text-[15px] min-h-[48px] text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleFolderCountChange(Number(folderCount) + 1)}
                        className="w-12 h-12 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-lg border border-indigo-200 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
                        title="Add a folder"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">
                      Total Outputs <span className="text-indigo-600 font-bold font-mono">({totalOutputs} Files)</span>
                    </label>
                    <input
                      type="number"
                      value={totalOutputs}
                      readOnly
                      className="w-full bg-indigo-50/60 border border-indigo-200 rounded-xl px-4 py-3.5 text-sm sm:text-[15px] min-h-[48px] text-indigo-900 font-mono font-bold focus:outline-none cursor-not-allowed text-center"
                    />
                  </div>
                </div>

                {/* Multiple Folder Names & Target Outputs Card */}
                <div className="p-4 sm:p-6 bg-gradient-to-br from-indigo-50/60 via-slate-50 to-white rounded-2xl border border-indigo-100 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
                    <div>
                      <div className="text-sm font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                        📁 Multiple Folders ({folderTargets.length} Separate Jobs)
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        Each folder will be automatically created as its own separate job in Todays Jobs table with assigned pipeline stages.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFolderCountChange(Number(folderCount) + 1)}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs self-stretch sm:self-auto justify-center cursor-pointer min-h-[42px] active:scale-95"
                    >
                      + Add Another Folder
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                    {folderTargets.map((ft, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-white rounded-xl border border-indigo-100 hover:border-indigo-300 shadow-2xs transition-all space-y-2.5"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-mono font-bold">
                              {idx + 1}
                            </span>
                            Folder #{idx + 1}
                          </span>
                          {folderTargets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = folderTargets.filter((_, i) => i !== idx);
                                setFolderTargets(updated);
                                setFolderCount(updated.length);
                              }}
                              className="text-xs text-rose-500 hover:text-rose-700 font-bold hover:underline cursor-pointer py-1 px-1.5"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Folder Name
                            </label>
                            <input
                              type="text"
                              placeholder={`e.g. Folder ${idx + 1}, Living Room...`}
                              value={ft.name}
                              onChange={(e) => handleFolderNameChange(idx, e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm min-h-[44px] text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium transition-all"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Target Files Count
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={ft.count}
                              onChange={(e) => handleFolderTargetChange(idx, e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm min-h-[44px] font-mono font-bold text-indigo-600 focus:outline-none focus:border-indigo-500 focus:bg-white text-center transition-all"
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
          </div>

          {/* Section 2: Folder Timestamps */}
          <div className="space-y-5 pt-2">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-xs">
                2
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  Folder Creation &amp; Target Timestamps
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  Folder Created Time (Received)
                </label>
                <input
                  type="datetime-local"
                  value={folderCreatedTime}
                  onChange={(e) => setFolderCreatedTime(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm sm:text-[15px] min-h-[48px] text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-mono transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  Client Target Delivery Time
                </label>
                <input
                  type="datetime-local"
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm sm:text-[15px] min-h-[48px] text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-mono transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Stage Personnel Assignments */}
          <div className="space-y-5 pt-2">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-xs">
                3
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  Stage Assignments &amp; Files Count
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              {/* STAGE LINE 1: Blending Stage in One Single Line */}
              <div className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-2.5">
                <span className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider block">
                  Blending Stage (Line 1)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <select
                      value={blendingAssignee}
                      onChange={(e) => setBlendingAssignee(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-[15px] min-h-[48px] text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer"
                    >
                      <option value="">Choose Blending Designer</option>
                      {assignableEditors.map((ed) => (
                        <option key={ed.id} value={ed.name}>
                          {ed.name} ({ed.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Blending Files"
                      value={blendingFiles}
                      onChange={(e) => setBlendingFiles(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-[15px] min-h-[48px] font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500 text-center"
                    />
                  </div>
                </div>
              </div>

              {/* STAGE LINE 2: Path Details (Path 1 & Path 2 in One Single Line) */}
              <div className="space-y-2">
                <span className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider block">
                  Path Details (Line 2)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {/* Path 1 */}
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-2.5">
                    <span className="text-xs font-bold text-slate-700 uppercase">Path 1 Stage</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <select
                        value={path1Assignee}
                        onChange={(e) => setPath1Assignee(e.target.value)}
                        className="sm:col-span-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-[14.5px] min-h-[46px] text-slate-900 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="">Choose Path Editor 1</option>
                        {assignableEditors.map((ed) => (
                          <option key={ed.id} value={ed.name}>
                            {ed.name} ({ed.role})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Files"
                        value={path1Files}
                        onChange={(e) => setPath1Files(e.target.value)}
                        className="sm:col-span-1 bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm min-h-[46px] font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500 text-center"
                      />
                    </div>
                  </div>

                  {/* Path 2 */}
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-2.5">
                    <span className="text-xs font-bold text-slate-700 uppercase">Path 2 Stage</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <select
                        value={path2Assignee}
                        onChange={(e) => setPath2Assignee(e.target.value)}
                        className="sm:col-span-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-[14.5px] min-h-[46px] text-slate-900 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="">Choose Path Editor 2</option>
                        {assignableEditors.map((ed) => (
                          <option key={ed.id} value={ed.name}>
                            {ed.name} ({ed.role})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Files"
                        value={path2Files}
                        onChange={(e) => setPath2Files(e.target.value)}
                        className="sm:col-span-1 bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm min-h-[46px] font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500 text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* STAGE LINE 3: Editing Details (Editor 1 & Editor 2 in One Single Line) */}
              <div className="space-y-2">
                <span className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider block">
                  Editing Details (Line 3)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {/* Editor 1 */}
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-2.5">
                    <span className="text-xs font-bold text-slate-700 uppercase">Editor 1 Stage</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <select
                        value={editor1Assignee}
                        onChange={(e) => setEditor1Assignee(e.target.value)}
                        className="sm:col-span-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-[14.5px] min-h-[46px] text-slate-900 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="">Choose Editor 1</option>
                        {assignableEditors.map((ed) => (
                          <option key={ed.id} value={ed.name}>
                            {ed.name} ({ed.role})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Files"
                        value={editor1Files}
                        onChange={(e) => setEditor1Files(e.target.value)}
                        className="sm:col-span-1 bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm min-h-[46px] font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500 text-center"
                      />
                    </div>
                  </div>

                  {/* Editor 2 */}
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-2.5">
                    <span className="text-xs font-bold text-indigo-700 uppercase">Editor 2 Stage</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <select
                        value={editor2Assignee}
                        onChange={(e) => setEditor2Assignee(e.target.value)}
                        className="sm:col-span-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-[14.5px] min-h-[46px] text-slate-900 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="">Choose Editor 2</option>
                        {assignableEditors.map((ed) => (
                          <option key={ed.id} value={ed.name}>
                            {ed.name} ({ed.role})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Files"
                        value={editor2Files}
                        onChange={(e) => setEditor2Files(e.target.value)}
                        className="sm:col-span-1 bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm min-h-[46px] font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500 text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* STAGE LINE 4: QC Details (LC Stage & FC Stage in One Separate Line) */}
              <div className="space-y-2">
                <span className="text-xs sm:text-sm font-extrabold text-indigo-700 uppercase tracking-wider block">
                  QC Details (Line 4 — LC &amp; FC)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {/* LC */}
                  <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200/80 space-y-2.5">
                    <span className="text-xs font-bold text-purple-900 uppercase">LC Stage (Lightroom Correction)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <select
                        value={lcAssignee}
                        onChange={(e) => setLcAssignee(e.target.value)}
                        className="sm:col-span-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-[14.5px] min-h-[46px] text-slate-900 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="">Choose LC Personnel</option>
                        {assignableEditors.map((ed) => (
                          <option key={ed.id} value={ed.name}>
                            {ed.name} ({ed.role})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Files"
                        value={lcFiles}
                        onChange={(e) => setLcFiles(e.target.value)}
                        className="sm:col-span-1 bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm min-h-[46px] font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500 text-center"
                      />
                    </div>
                  </div>

                  {/* FC */}
                  <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-2.5">
                    <span className="text-xs font-bold text-emerald-900 uppercase">FC Stage (Final Verification)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <select
                        value={fcAssignee}
                        onChange={(e) => setFcAssignee(e.target.value)}
                        className="sm:col-span-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-[14.5px] min-h-[46px] text-slate-900 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="">Choose FC Personnel</option>
                        {assignableEditors.map((ed) => (
                          <option key={ed.id} value={ed.name}>
                            {ed.name} ({ed.role})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Files"
                        value={fcFiles}
                        onChange={(e) => setFcFiles(e.target.value)}
                        className="sm:col-span-1 bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm min-h-[46px] font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500 text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Special Instruction */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-xs">
                4
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  Special Instructions &amp; Notes
                </h3>
              </div>
            </div>
            <textarea
              rows="3"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Provide special instructions, custom client guidelines, color preferences, or delivery notes..."
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl p-4 text-sm sm:text-[15px] min-h-[100px] text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 resize-none transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-4 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/dashboard/jobs')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all flex items-center justify-center min-h-[48px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-9 py-3.5 rounded-xl bg-[#00CBB8] hover:bg-[#00b5a4] text-white text-sm sm:text-base font-bold shadow-lg shadow-[#00CBB8]/25 transition-all flex items-center justify-center gap-2 min-h-[48px] cursor-pointer active:scale-95"
            >
              <FiCheck className="w-5 h-5" /> {Number(folderCount) > 1 ? `Submit ${folderCount} Separate Jobs` : 'Submit Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
