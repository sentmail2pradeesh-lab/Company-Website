import { useState } from 'react';
import { useJobs } from '../../context/JobContext';
import {
  FiPlus,
  FiSearch,
  FiClock,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiUserPlus,
} from 'react-icons/fi';

export default function TodaysJobsPage() {
  const { jobs, setIsCreateModalOpen, setTimerModalState, setClientModalState, setAssignModalState, deleteJob } = useJobs();

  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter jobs based on search term & status
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'QC_PENDING') {
      return job.stages.qc?.status === 'Pending' || job.stages.qc?.status === 'In-Progress';
    }
    if (filterStatus === 'PATH_PENDING') {
      return job.stages.path1?.status !== 'Complete' || job.stages.path2?.status !== 'Complete';
    }
    if (filterStatus === 'COMPLETE') {
      return Object.values(job.stages).every((s) => s.status === 'Complete' || !s.assignee);
    }
    return true;
  });

  const totalPages = Math.ceil(filteredJobs.length / entriesPerPage) || 1;
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  // Render clickable Stage Badge
  const renderStageBadge = (jobId, stageKey, stageObj) => {
    if (!stageObj || !stageObj.assignee) {
      return (
        <button
          onClick={() => setAssignModalState({ jobId, stageKey })}
          className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200 font-medium flex items-center gap-1 transition-colors"
        >
          <FiUserPlus className="w-3 h-3" /> Assign
        </button>
      );
    }

    const { assignee, status } = stageObj;

    const badgeStyles = {
      Pending: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
      'In-Progress': 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 font-bold',
      Paused: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      Complete: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    };

    return (
      <div className="flex flex-col items-start gap-0.5">
        <button
          onClick={() => setTimerModalState({ jobId, stageKey })}
          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all flex items-center gap-1 ${
            badgeStyles[status] || 'bg-slate-100 text-slate-600'
          }`}
          title={`Click to open timer for ${assignee}`}
        >
          <span>{assignee}</span>
          <span className="opacity-70 text-[9px] uppercase font-mono">({status})</span>
        </button>

        <button
          onClick={() => setAssignModalState({ jobId, stageKey })}
          className="text-[9px] text-slate-400 hover:text-slate-600 underline font-mono"
        >
          Reassign
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            Todays Jobs <FiRefreshCw className="w-4 h-4 text-indigo-600 cursor-pointer hover:rotate-180 transition-transform" />
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-stage production sheet table with Path 1, Path 2, Editors, QC, and FC active timers
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all hover:scale-[1.02]"
        >
          <FiPlus className="w-4 h-4" /> Create Job
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 pb-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Job ID, Client, or Folder Name..."
              className="w-full bg-slate-50 text-slate-800 pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {['ALL', 'PATH_PENDING', 'QC_PENDING', 'COMPLETE'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterStatus === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Show Entries Dropdown */}
          <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              className="bg-slate-50 text-slate-700 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span>entries</span>
          </div>
        </div>

        {/* Jobs Data Table with Dark Accent Header Row */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">ID #</th>
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3 min-w-[140px]">Folder Name</th>
                <th className="py-3 px-3 text-center">Output</th>
                <th className="py-3 px-3 text-center min-w-[110px]">Client Turnaround</th>
                <th className="py-3 px-3">Path 1</th>
                <th className="py-3 px-3">Path 2</th>
                <th className="py-3 px-3">Editor 1</th>
                <th className="py-3 px-3">Editor 2</th>
                <th className="py-3 px-3">QC</th>
                <th className="py-3 px-3">FC</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
              {paginatedJobs.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400 text-xs">
                    No jobs match the current search filter.
                  </td>
                </tr>
              ) : (
                paginatedJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-600">
                      #{job.id}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">
                      {job.client}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      <div className="line-clamp-2">{job.name}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                      {job.outputTarget}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setClientModalState({ jobId: job.id })}
                        className="px-2 py-1 rounded-md text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-mono flex items-center justify-center gap-1 mx-auto"
                        title="Click to view/edit client turnaround times"
                      >
                        <FiClock className="w-3 h-3 text-indigo-600" />
                        {job.clientFinishTime ? 'Completed' : 'Set Times'}
                      </button>
                    </td>
                    <td className="py-3 px-3">{renderStageBadge(job.id, 'path1', job.stages.path1)}</td>
                    <td className="py-3 px-3">{renderStageBadge(job.id, 'path2', job.stages.path2)}</td>
                    <td className="py-3 px-3">{renderStageBadge(job.id, 'editor1', job.stages.editor1)}</td>
                    <td className="py-3 px-3">{renderStageBadge(job.id, 'editor2', job.stages.editor2)}</td>
                    <td className="py-3 px-3">{renderStageBadge(job.id, 'qc', job.stages.qc)}</td>
                    <td className="py-3 px-3">{renderStageBadge(job.id, 'fc', job.stages.fc)}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setClientModalState({ jobId: job.id })}
                          className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          title="Edit Turnaround"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteJob(job.id)}
                          className="p-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                          title="Delete Job"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-5 pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Showing {filteredJobs.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to{' '}
            {Math.min(currentPage * entriesPerPage, filteredJobs.length)} of {filteredJobs.length} entries
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-lg font-mono text-xs ${
                  currentPage === i + 1 ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
