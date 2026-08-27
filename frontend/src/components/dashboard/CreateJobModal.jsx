import { useState } from 'react';
import { useJobs } from '../../context/JobContext';
import { FiPlusCircle, FiX, FiCheck } from 'react-icons/fi';

export default function CreateJobModal() {
  const { isCreateModalOpen, setIsCreateModalOpen, createJob, editors } = useJobs();

  const [client, setClient] = useState('BE');
  const [name, setName] = useState('');
  const [folderCount, setFolderCount] = useState('1');
  const [outputTarget, setOutputTarget] = useState('25');
  const [clientEntryTime, setClientEntryTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [clientTargetTime, setClientTargetTime] = useState('');

  const [path1Assignee, setPath1Assignee] = useState('Shwetha');
  const [path2Assignee, setPath2Assignee] = useState('Tejas');
  const [editor1Assignee, setEditor1Assignee] = useState('Karan');
  const [editor2Assignee, setEditor2Assignee] = useState('Godwin');
  const [qcAssignee, setQcAssignee] = useState('Arun QC');
  const [fcAssignee, setFcAssignee] = useState('Arun DD');

  if (!isCreateModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    createJob({
      client,
      name,
      folderCount,
      outputTarget,
      clientEntryTime,
      clientTargetTime,
      path1Assignee,
      path2Assignee,
      editor1Assignee,
      editor2Assignee,
      qcAssignee,
      fcAssignee,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xl my-8">
        {/* Close Button */}
        <button
          onClick={() => setIsCreateModalOpen(false)}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
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
            Enter job details and assign team members for Path 1, Path 2, Editors, QC, and FC.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Main Job Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Client ID / Code
              </label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value.toUpperCase())}
                placeholder="e.g. BE, CE, EPIC, RE"
                className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Folder / Job Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 1035 Nonchalant Dr"
                className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Folder Count
              </label>
              <input
                type="number"
                value={folderCount}
                onChange={(e) => setFolderCount(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white font-mono"
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
                onChange={(e) => setOutputTarget(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white font-mono"
                required
              />
            </div>

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
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Path 1 Assigned</label>
                <select
                  value={path1Assignee}
                  onChange={(e) => setPath1Assignee(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-indigo-500"
                >
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
                  {editors.map((ed) => (
                    <option key={ed.id} value={ed.name}>
                      {ed.name} ({ed.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">QC Assigned</label>
                <select
                  value={qcAssignee}
                  onChange={(e) => setQcAssignee(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-indigo-500"
                >
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
