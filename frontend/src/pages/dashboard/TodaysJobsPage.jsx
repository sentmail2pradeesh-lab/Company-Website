import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import EditJobModal from '../../components/dashboard/EditJobModal';
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
  const navigate = useNavigate();
  const { jobs, setTimerModalState, setClientModalState, setAssignModalState, deleteJob, canAssignJob } = useJobs();

  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [editModalState, setEditModalState] = useState(null);

  // Helper to format working time below stage name/pill
  const getStageWorkingTime = (stageObj) => {
    if (!stageObj || !stageObj.startTime) return null;
    const start = new Date(stageObj.startTime).getTime();
    const end = stageObj.endTime ? new Date(stageObj.endTime).getTime() : Date.now();
    const gross = Math.floor((end - start) / 1000);
    const net = Math.max(0, gross - (stageObj.pausedDurationSeconds || 0));

    const hrs = Math.floor(net / 3600);
    const mins = Math.floor((net % 3600) / 60);
    const secs = net % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  // Filter jobs based on search term & status
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'BLENDING') {
      return job.stages.blending?.assignee && job.stages.blending?.status !== 'Complete';
    }
    if (filterStatus === 'LC') {
      return job.stages.lc?.assignee && job.stages.lc?.status !== 'Complete';
    }
    if (filterStatus === 'PATH') {
      return (
        (job.stages.path1?.assignee && job.stages.path1?.status !== 'Complete') ||
        (job.stages.path2?.assignee && job.stages.path2?.status !== 'Complete')
      );
    }
    if (filterStatus === 'EDITING') {
      return (
        (job.stages.editor1?.assignee && job.stages.editor1?.status !== 'Complete') ||
        (job.stages.editor2?.assignee && job.stages.editor2?.status !== 'Complete')
      );
    }
    if (filterStatus === 'QC') {
      return job.stages.fc?.assignee && job.stages.fc?.status !== 'Complete';
    }
    if (filterStatus === 'COMPLETE') {
      return Object.values(job.stages).every((s) => s.status === 'Complete' || !s.assignee);
    }
    return true;
  });

  const totalPages = Math.ceil(filteredJobs.length / entriesPerPage) || 1;
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const renderStageBadge = (jobId, stageKey, stageObj) => {
    if (!stageObj || !stageObj.assignee) {
      if (!canAssignJob) {
        return (
          <span className="px-2 py-1 rounded-md text-[10px] bg-slate-100 text-slate-400 font-medium italic block text-center">
            Unassigned
          </span>
        );
      }
      return (
        <button
          onClick={() => setAssignModalState({ jobId, stageKey })}
          className="px-2 py-1 rounded-md text-[10px] bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200 font-medium flex items-center justify-center gap-1 transition-colors mx-auto"
        >
          <FiUserPlus className="w-3 h-3" /> Assign
        </button>
      );
    }

    const { assignee, status } = stageObj;
    const isTimeTrackedStage = stageKey === 'path1' || stageKey === 'path2' || stageKey === 'editor1' || stageKey === 'editor2';
    const workingTimeStr = isTimeTrackedStage ? getStageWorkingTime(stageObj) : null;

    const pillStyles = {
      Pending: 'bg-[#FF4D5A] text-white',
      'In-Progress': 'bg-[#834BFF] text-white',
      Paused: 'bg-purple-600 text-white',
      Complete: 'bg-[#00CBB8] text-white',
    };

    return (
      <div className="flex flex-col items-center justify-center text-center gap-1 py-1">
        <div className="font-semibold text-slate-900 text-xs">
          {assignee}
        </div>

        <button
          onClick={() => setTimerModalState({ jobId, stageKey })}
          className={`px-3 py-0.5 rounded-md text-[10px] font-bold tracking-wide transition-all hover:scale-105 cursor-pointer ${
            pillStyles[status] || 'bg-slate-200 text-slate-700'
          }`}
          title={`Click to view details for ${assignee}`}
        >
          {status}
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
            Multi-stage production sheet table with Blending, Path 1, Path 2, Editors, LC, and FC active timers
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard/create-job')}
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

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {['ALL', 'BLENDING', 'LC', 'PATH', 'EDITING', 'QC', 'COMPLETE'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterStatus === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {st}
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

        {/* Jobs Data Table (Req 1 Order: Blending, Path 1, Path 2, Editor 1, Editor 2, LC, FC) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">ID #</th>
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3 min-w-[140px]">Folder Name</th>
                <th className="py-3 px-3 text-center">Output</th>
                <th className="py-3 px-3 text-center">Blending</th>
                <th className="py-3 px-3 text-center">Path 1</th>
                <th className="py-3 px-3 text-center">Path 2</th>
                <th className="py-3 px-3 text-center">Editor 1</th>
                <th className="py-3 px-3 text-center">Editor 2</th>
                <th className="py-3 px-3 text-center">LC</th>
                <th className="py-3 px-3 text-center">FC</th>
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
                    <td className="py-3 px-3">{renderStageBadge(job.id, 'blending', job.stages.blending)}</td>
                    <td className="py-3 px-3">{renderStageBadge(job.id, 'path1', job.stages.path1)}</td>
                    <td className="py-3 px-3">{renderStageBadge(job.id, 'path2', job.stages.path2)}</td>
                    <td className="py-3 px-3">{renderStageBadge(job.id, 'editor1', job.stages.editor1)}</td>
                    <td className="py-3 px-3">{renderStageBadge(job.id, 'editor2', job.stages.editor2)}</td>
                    <td className="py-3 px-3">{renderStageBadge(job.id, 'lc', job.stages.lc)}</td>
                    <td className="py-3 px-3">{renderStageBadge(job.id, 'fc', job.stages.fc)}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {canAssignJob && (
                          <button
                            onClick={() => setEditModalState({ jobId: job.id })}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors border border-indigo-100"
                            title="Modify / Edit Job Specifications"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setClientModalState({ jobId: job.id })}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          title="View Turnaround Timestamps"
                        >
                          <FiClock className="w-3.5 h-3.5" />
                        </button>
                        {canAssignJob && (
                          <button
                            onClick={() => deleteJob(job.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors border border-rose-100"
                            title="Delete Job"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
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

      {/* Edit Job Modal */}
      <EditJobModal editModalState={editModalState} setEditModalState={setEditModalState} />
    </div>
  );
}
