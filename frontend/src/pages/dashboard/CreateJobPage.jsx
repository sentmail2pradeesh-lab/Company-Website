import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import { FiArrowLeft, FiCheck, FiPlusCircle, FiClock, FiUsers } from 'react-icons/fi';

export default function CreateJobPage() {
  const navigate = useNavigate();
  const { createJob, editors, clients } = useJobs();

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
      category: category || 'Photo Editing',
      name: jobName || 'Untitled Job',
      level: level || 'Basic',
      folderCount: Number(folderCount) || 1,
      folderTargets,
      outputTarget: totalOutputs,
      instruction,
      clientEntryTime: folderCreatedTime || new Date().toISOString().slice(0, 16),
      clientTargetTime: targetTime,

      // All 6 Stages explicitly mapped
      blendingAssignee,
      blendingFiles: Number(blendingFiles) || (blendingAssignee ? totalOutputs : 0),

      path1Assignee,
      path1Files: Number(path1Files) || (path1Assignee ? totalOutputs : 0),

      path2Assignee,
      path2Files: Number(path2Files) || 0,

      editor1Assignee,
      editor1Files: Number(editor1Files) || (editor1Assignee ? totalOutputs : 0),

      editor2Assignee,
      editor2Files: Number(editor2Files) || 0,

      lcAssignee,
      lcFiles: Number(lcFiles) || (lcAssignee ? totalOutputs : 0),

      fcAssignee,
      fcFiles: Number(fcFiles) || (fcAssignee ? totalOutputs : 0),
    });

    navigate('/dashboard/jobs');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
          >
            <FiArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
            Create Job
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete job specification, folder count breakdown, timestamps, and stage assignments.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-9 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Client & Job Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <FiPlusCircle className="w-4 h-4" /> 1. Client & Job Specification
            </h3>

            {/* Line 1: Client Details (Client, Category, Job Level) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Client</label>
                <select
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                  required
                >
                  <option value="">Choose Client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.code}>
                      [{c.code}] {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Folder / Job Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      handleFolderNameChange(0, e.target.value);
                    }}
                    placeholder="e.g. 1035 Nonchalant Dr"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Folder Count</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      value={folderCount}
                      onChange={(e) => handleFolderCountChange(e.target.value)}
                      placeholder="e.g. 1, 2"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500 focus:bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleFolderCountChange(2)}
                      className="px-3 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 shrink-0 transition-colors cursor-pointer"
                      title="Add more folders"
                    >
                      + Add Folders
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Outputs (Files Count)</label>
                  <input
                    type="number"
                    value={totalOutputs}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setTotalOutputs(val);
                      handleFolderTargetChange(0, val);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500 focus:bg-white"
                    required
                  />
                </div>
              </div>
            ) : (
              /* Multiple Folders View */
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Project / Order Batch Name <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. 1035 Nonchalant Dr (Leave blank to use folder names)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Folder Count</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleFolderCountChange(Math.max(1, Number(folderCount) - 1))}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                        title="Remove a folder"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={folderCount}
                        onChange={(e) => handleFolderCountChange(e.target.value)}
                        className="w-full text-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500 focus:bg-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleFolderCountChange(Number(folderCount) + 1)}
                        className="w-10 h-10 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 flex items-center justify-center transition-colors cursor-pointer"
                        title="Add a folder"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Total Outputs <span className="text-indigo-600 font-bold font-mono">({totalOutputs} Files)</span>
                    </label>
                    <input
                      type="number"
                      value={totalOutputs}
                      readOnly
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-indigo-900 font-mono font-bold focus:outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Multiple Folder Names & Target Outputs Card */}
                <div className="p-4 sm:p-5 bg-gradient-to-br from-indigo-50/70 via-slate-50 to-white rounded-2xl border border-indigo-200 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
                    <div>
                      <div className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                        📁 Multiple Folder Names &amp; Output Targets ({folderTargets.length} Folders)
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Please specify the unique folder name and target files count for each folder.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFolderCountChange(Number(folderCount) + 1)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-xs self-start sm:self-auto cursor-pointer"
                    >
                      + Add Another Folder
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                    {folderTargets.map((ft, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-white rounded-xl border border-indigo-100 hover:border-indigo-300 shadow-2xs transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
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
                              className="text-[10px] text-rose-500 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                              Folder Name
                            </label>
                            <input
                              type="text"
                              placeholder={`e.g. Folder ${idx + 1}, Living Room, Exterior...`}
                              value={ft.name}
                              onChange={(e) => handleFolderNameChange(idx, e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-semibold"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                              Target Files Count
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={ft.count}
                              onChange={(e) => handleFolderTargetChange(idx, e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-indigo-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
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
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <FiClock className="w-4 h-4" /> 2. Folder Creation & Target Timestamps
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Folder Created Time (Received)
                </label>
                <input
                  type="datetime-local"
                  value={folderCreatedTime}
                  onChange={(e) => setFolderCreatedTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client Target Delivery Time
                </label>
                <input
                  type="datetime-local"
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Stage Personnel Assignments */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <FiUsers className="w-4 h-4" /> 3. Stage Assignments & Files Count
            </h3>

            <div className="space-y-4">
              {/* STAGE LINE 1: Blending Stage in One Single Line */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Blending Stage (Line 1)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <select
                      value={blendingAssignee}
                      onChange={(e) => setBlendingAssignee(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                    >
                      <option value="">Choose Blending Designer</option>
                      {editors.map((ed) => (
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
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* STAGE LINE 2: Path Details (Path 1 & Path 2 in One Single Line) */}
              <div className="space-y-1.5">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                  Path Details (Line 2)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Path 1 */}
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase">Path 1 Stage</span>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={path1Assignee}
                        onChange={(e) => setPath1Assignee(e.target.value)}
                        className="col-span-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">Choose Pather 1</option>
                        {editors.map((ed) => (
                          <option key={ed.id} value={ed.name}>
                            {ed.name} ({ed.role})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Path 1 Files"
                        value={path1Files}
                        onChange={(e) => setPath1Files(e.target.value)}
                        className="col-span-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Path 2 */}
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase">Path 2 Stage</span>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={path2Assignee}
                        onChange={(e) => setPath2Assignee(e.target.value)}
                        className="col-span-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">Choose Pather 2</option>
                        {editors.map((ed) => (
                          <option key={ed.id} value={ed.name}>
                            {ed.name} ({ed.role})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Path 2 Files"
                        value={path2Files}
                        onChange={(e) => setPath2Files(e.target.value)}
                        className="col-span-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* STAGE LINE 3: Editing Details (Editor 1 & Editor 2 in One Single Line) */}
              <div className="space-y-1.5">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                  Editing Details (Line 3)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Editor 1 */}
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase">Editor 1 Stage</span>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={editor1Assignee}
                        onChange={(e) => setEditor1Assignee(e.target.value)}
                        className="col-span-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">Choose Editor 1</option>
                        {editors.map((ed) => (
                          <option key={ed.id} value={ed.name}>
                            {ed.name} ({ed.role})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Editor 1 Files"
                        value={editor1Files}
                        onChange={(e) => setEditor1Files(e.target.value)}
                        className="col-span-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Editor 2 */}
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-indigo-700 uppercase">Editor 2 Stage</span>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={editor2Assignee}
                        onChange={(e) => setEditor2Assignee(e.target.value)}
                        className="col-span-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">Choose Editor 2</option>
                        {editors.map((ed) => (
                          <option key={ed.id} value={ed.name}>
                            {ed.name} ({ed.role})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Editor 2 Files"
                        value={editor2Files}
                        onChange={(e) => setEditor2Files(e.target.value)}
                        className="col-span-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500 font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* STAGE LINE 4: QC Details (LC Stage & FC Stage in One Separate Line) */}
              <div className="space-y-1.5">
                <span className="text-xs font-extrabold text-indigo-700 uppercase tracking-wider block">
                  QC Details (Line 4 — LC & FC)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* LC */}
                  <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200/70 space-y-2">
                    <span className="text-[11px] font-bold text-purple-900 uppercase">LC Stage (Lightroom Correction)</span>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={lcAssignee}
                        onChange={(e) => setLcAssignee(e.target.value)}
                        className="col-span-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">Choose LC Personnel</option>
                        {editors.map((ed) => (
                          <option key={ed.id} value={ed.name}>
                            {ed.name} ({ed.role})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="LC Files"
                        value={lcFiles}
                        onChange={(e) => setLcFiles(e.target.value)}
                        className="col-span-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* FC */}
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/70 space-y-2">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase">FC Stage (Final Verification)</span>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={fcAssignee}
                        onChange={(e) => setFcAssignee(e.target.value)}
                        className="col-span-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">Choose FC Personnel</option>
                        {editors.map((ed) => (
                          <option key={ed.id} value={ed.name}>
                            {ed.name} ({ed.role})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="FC Files"
                        value={fcFiles}
                        onChange={(e) => setFcFiles(e.target.value)}
                        className="col-span-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500 font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Special Instruction */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">Instruction</label>
            <textarea
              rows="3"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Special instructions or client notes..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#00CBB8] hover:bg-[#00b5a4] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <FiCheck className="w-4 h-4" /> Submit Job
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/jobs')}
              className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
