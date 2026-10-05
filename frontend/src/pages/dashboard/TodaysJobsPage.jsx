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
  FiCalendar,
} from 'react-icons/fi';
import { getOperationalDate, formatDateDMY, formatOperationalShiftLabel } from '../../utils/dateUtils';
import DatePickerDMY from '../../components/common/DatePickerDMY';

export default function TodaysJobsPage() {
  const navigate = useNavigate();
  const { jobs, todaysJobs, operationalDate, setTimerModalState, setClientModalState, setAssignModalState, deleteJob, canAssignJob, canUpdateStage, refreshData } = useJobs();

  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETE'
  const [filterStage, setFilterStage] = useState('ALL'); // 'ALL' | 'blending' | 'path1' | 'path2' | 'editor1' | 'editor2' | 'lc' | 'fc'
  const [currentPage, setCurrentPage] = useState(1);
  const [editModalState, setEditModalState] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Operational Shift Date filter (defaults to today's 6:00 AM - 5:59 AM operational day)
  const [selectedDate, setSelectedDate] = useState(() => getOperationalDate());
  const [viewMode, setViewMode] = useState('shift'); // 'shift' (single day) or 'all' (all history)

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (refreshData) await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

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

  // Filter jobs based on operational shift date, search term, status filter, and stage dropdown
  const filteredJobs = jobs.filter((job) => {
    // 0. Operational Shift Date Filter (6:00 AM - 5:59 AM)
    if (viewMode === 'shift') {
      const jobOp = job.operationalDate || getOperationalDate(job.createdAt || job.clientEntryTime);
      if (jobOp !== selectedDate) return false;
    }

    const matchesSearch =
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const checkStageMatchesStatus = (stageObj, targetStatus) => {
      if (!stageObj || !stageObj.assignee) return false;
      if (targetStatus === 'PENDING') return stageObj.status === 'Pending';
      if (targetStatus === 'IN_PROGRESS') return stageObj.status === 'In-Progress' || stageObj.status === 'Paused';
      if (targetStatus === 'COMPLETE') return stageObj.status === 'Complete';
      return true;
    };

    // 1. If a specific stage is selected from dropdown (e.g. 'blending', 'path1', etc.)
    if (filterStage !== 'ALL') {
      const targetStageObj = job.stages[filterStage];
      if (!targetStageObj || !targetStageObj.assignee) return false;
      if (filterStatus === 'ALL') return true;
      return checkStageMatchesStatus(targetStageObj, filterStatus);
    }

    // 2. If 'All Stages' selected
    if (filterStatus === 'ALL') return true;

    if (filterStatus === 'PENDING') {
      return Object.values(job.stages).some((s) => s && s.assignee && s.status === 'Pending');
    }

    if (filterStatus === 'IN_PROGRESS') {
      return Object.values(job.stages).some((s) => s && s.assignee && (s.status === 'In-Progress' || s.status === 'Paused'));
    }

    if (filterStatus === 'COMPLETE') {
      const assignedStages = Object.values(job.stages).filter((s) => s && s.assignee);
      if (assignedStages.length === 0) return false;
      return assignedStages.every((s) => s.status === 'Complete');
    }

    return true;
  });

  const totalPages = Math.ceil(filteredJobs.length / entriesPerPage) || 1;
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const renderStageBadge = (jobId, stageKey, stageObj) => {
    if (!stageObj || !stageObj.assignee) {
      if (!canAssignJob) {
        return (
          <span className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 text-slate-400 font-medium italic block text-center">
            Unassigned
          </span>
        );
      }
      return (
        <button
          onClick={() => setAssignModalState({ jobId, stageKey })}
          className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 font-bold flex items-center justify-center gap-1 transition-all mx-auto cursor-pointer"
        >
          <FiUserPlus className="w-3.5 h-3.5" /> Assign
        </button>
      );
    }

    const { assignee, status } = stageObj;
    const isAllowedToUpdate = canUpdateStage(assignee);

    const pillStyles = {
      Pending: 'bg-[#FF4D5A] text-white shadow-xs',
      'In-Progress': 'bg-[#834BFF] text-white shadow-xs',
      Paused: 'bg-purple-600 text-white shadow-xs',
      Complete: 'bg-[#00CBB8] text-white shadow-xs',
    };

    return (
      <div className="flex flex-col items-center justify-center text-center gap-1 py-1">
        <div className="font-bold text-slate-900 text-xs sm:text-[13px]">
          {assignee}
        </div>

        {isAllowedToUpdate ? (
          <button
            onClick={() => setTimerModalState({ jobId, stageKey })}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold tracking-wide transition-all hover:scale-105 cursor-pointer shadow-xs ${
              pillStyles[status] || 'bg-slate-200 text-slate-700'
            }`}
            title={`Click to update stage for ${assignee}`}
          >
            {status}
          </button>
        ) : (
          <span
            className={`px-3 py-1 rounded-lg text-[11px] font-bold tracking-wide cursor-default ${
              pillStyles[status] || 'bg-slate-200 text-slate-700'
            }`}
            title={`Assigned to ${assignee}`}
          >
            {status}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight flex items-center gap-2.5">
            Todays Jobs{' '}
            <button
              type="button"
              onClick={handleRefresh}
              className="p-1.5 rounded-xl hover:bg-slate-200/70 text-indigo-600 transition-colors cursor-pointer"
              title="Refresh jobs"
            >
              <FiRefreshCw className={`w-4 h-4 transition-transform ${isRefreshing ? 'animate-spin' : 'hover:rotate-180'}`} />
            </button>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Multi-stage production sheet table with Blending, Path 1, Path 2, Editors, LC, and FC active timers
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard/create-job')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <FiPlus className="w-4 h-4" /> Create Job
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4 overflow-hidden">
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
              className="w-full bg-slate-50 text-slate-900 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'ALL', label: 'ALL' },
              { id: 'PENDING', label: 'PENDING' },
              { id: 'IN_PROGRESS', label: 'IN-PROGRESS' },
              { id: 'COMPLETE', label: 'COMPLETE' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilterStatus(st.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filterStatus === st.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Stage Sub-Filter Dropdown (Blending -> FC) */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 shrink-0">
            <span className="font-bold text-slate-700">Stage:</span>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Stages (Blending → FC)</option>
              <option value="blending">Blending Stage</option>
              <option value="path1">Path 1</option>
              <option value="path2">Path 2</option>
              <option value="editor1">Editor 1</option>
              <option value="editor2">Editor 2</option>
              <option value="lc">LC (Lighting & Color)</option>
              <option value="fc">FC / QC (Final Check)</option>
            </select>
          </div>

          {/* Show Entries Dropdown */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 shrink-0">
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              className="bg-slate-50 text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-semibold focus:outline-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span>entries</span>
          </div>
        </div>

        {/* Operational Shift & Historical Date Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
              <FiCalendar className="w-4 h-4 text-indigo-600" /> Shift Date:
            </span>
            <div className="w-36">
              <DatePickerDMY
                value={selectedDate}
                onChange={(newDate) => {
                  setSelectedDate(newDate);
                  setViewMode('shift');
                }}
                className="bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'all' ? 'shift' : 'all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                viewMode === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {viewMode === 'all' ? 'Showing: All History' : 'Show All History'}
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            {viewMode === 'shift' ? (
              <span>
                Viewing {filteredJobs.length} job(s) for <strong className="text-slate-800">{formatDateDMY(selectedDate)}</strong>
              </span>
            ) : (
              <span>
                Viewing <strong className="text-slate-800">All Historical Jobs</strong> ({filteredJobs.length} total)
              </span>
            )}
          </div>
        </div>

        {/* Jobs Data Table with 2-axis scrolling (horizontal & vertical) */}
        <div className="overflow-x-auto overflow-y-auto max-h-[620px] custom-scrollbar touch-pan-x touch-pan-y rounded-xl border border-slate-200" data-lenis-prevent>
          <table className="w-full text-left text-xs sm:text-sm min-w-[950px]">
            <thead className="sticky top-0 z-10 bg-slate-900 text-white uppercase tracking-wider font-bold border-b border-slate-800 text-[11px] sm:text-xs shadow-xs">
              <tr>
                <th className="py-3.5 px-3.5">ID #</th>
                <th className="py-3.5 px-3.5">Client</th>
                <th className="py-3.5 px-3.5 min-w-[140px]">Folder Name</th>
                <th className="py-3.5 px-3.5 text-center">Output</th>
                <th className="py-3.5 px-3.5 text-center">Blending</th>
                <th className="py-3.5 px-3.5 text-center">Path 1</th>
                <th className="py-3.5 px-3.5 text-center">Path 2</th>
                <th className="py-3.5 px-3.5 text-center">Editor 1</th>
                <th className="py-3.5 px-3.5 text-center">Editor 2</th>
                <th className="py-3.5 px-3.5 text-center">LC</th>
                <th className="py-3.5 px-3.5 text-center">FC</th>
                <th className="py-3.5 px-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
              {paginatedJobs.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400 text-sm">
                    No jobs match the current search filter.
                  </td>
                </tr>
              ) : (
                paginatedJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3.5 font-mono font-bold text-indigo-600 text-xs sm:text-sm">
                      #{job.id}
                    </td>
                    <td className="py-3.5 px-3.5 font-extrabold text-slate-900 text-xs sm:text-sm">
                      {job.client}
                    </td>
                    <td className="py-3.5 px-3.5 text-slate-800">
                      <div className="line-clamp-2 font-medium">{job.name}</div>
                    </td>
                    <td className="py-3.5 px-3.5 text-center font-mono font-bold text-slate-900 text-sm">
                      {job.outputTarget}
                    </td>
                    <td className="py-3.5 px-3.5">{renderStageBadge(job.id, 'blending', job.stages.blending)}</td>
                    <td className="py-3.5 px-3.5">{renderStageBadge(job.id, 'path1', job.stages.path1)}</td>
                    <td className="py-3.5 px-3.5">{renderStageBadge(job.id, 'path2', job.stages.path2)}</td>
                    <td className="py-3.5 px-3.5">{renderStageBadge(job.id, 'editor1', job.stages.editor1)}</td>
                    <td className="py-3.5 px-3.5">{renderStageBadge(job.id, 'editor2', job.stages.editor2)}</td>
                    <td className="py-3.5 px-3.5">{renderStageBadge(job.id, 'lc', job.stages.lc)}</td>
                    <td className="py-3.5 px-3.5">{renderStageBadge(job.id, 'fc', job.stages.fc)}</td>
                    <td className="py-3.5 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {canAssignJob && (
                          <button
                            onClick={() => setEditModalState({ jobId: job.id })}
                            className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors border border-indigo-100 cursor-pointer"
                            title="Modify / Edit Job Specifications"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setClientModalState({ jobId: job.id })}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          title="View Turnaround Timestamps"
                        >
                          <FiClock className="w-4 h-4" />
                        </button>
                        {canAssignJob && (
                          <button
                            onClick={() => deleteJob(job.id)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors border border-rose-100 cursor-pointer"
                            title="Delete Job"
                          >
                            <FiTrash2 className="w-4 h-4" />
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
        <div className="p-5 pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-500">
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
