import { useState } from 'react';
import { useJobs } from '../../context/JobContext';
import { getProductionShiftDate } from '../../utils/pipelineHelper';
import {
  FiPieChart,
  FiClock,
  FiUsers,
  FiCalendar,
  FiPrinter,
  FiFilter,
  FiCheckCircle,
  FiBriefcase,
  FiLayers,
} from 'react-icons/fi';

export default function ClientHistorySummaryPage() {
  const { jobs, editors, clients } = useJobs();

  const todayStr = getProductionShiftDate(new Date());
  const currentMonthStr = todayStr.slice(0, 7); // YYYY-MM
  const currentYearStr = todayStr.slice(0, 4); // YYYY

  // Time & Range Filters
  const [timeFilterType, setTimeFilterType] = useState('TODAY'); // 'TODAY' | 'DATE' | 'MONTHLY' | 'YEARLY' | 'CUSTOM' | 'ALL'
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [selectedYear, setSelectedYear] = useState(currentYearStr);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  // Entity Filters
  const [selectedClient, setSelectedClient] = useState('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState('ALL');

  // Dynamic Lists for Filter Dropdowns
  const clientOptions = ['ALL', ...new Set([...(clients || []).map((c) => c.code), ...jobs.map((j) => j.client)])];
  const employeeOptions = [
    'ALL',
    ...new Set([
      ...(editors || []).map((e) => e.name),
      ...jobs.flatMap((j) => Object.values(j.stages || {}).map((s) => s.assignee)).filter(Boolean),
    ]),
  ];

  // Helper to extract job shift date string (YYYY-MM-DD)
  const getJobDateStr = (job) => {
    const iso = job.clientFinishTime || job.clientEntryTime || job.stages?.fc?.endTime || job.stages?.blending?.startTime;
    return getProductionShiftDate(iso);
  };

  // Filter Jobs based on Time, Client, and Employee criteria
  const filteredJobs = jobs.filter((job) => {
    const jobDate = getJobDateStr(job);

    // 1. Time Range Match
    let matchesTime = true;
    if (timeFilterType === 'TODAY') {
      matchesTime = jobDate === todayStr;
    } else if (timeFilterType === 'DATE') {
      matchesTime = jobDate === selectedDate;
    } else if (timeFilterType === 'MONTHLY') {
      matchesTime = jobDate.startsWith(selectedMonth);
    } else if (timeFilterType === 'YEARLY') {
      matchesTime = jobDate.startsWith(selectedYear);
    } else if (timeFilterType === 'CUSTOM') {
      matchesTime = jobDate >= startDate && jobDate <= endDate;
    }

    if (!matchesTime) return false;

    // 2. Client Match
    if (selectedClient !== 'ALL' && job.client !== selectedClient) {
      return false;
    }

    // 3. Employee Personnel Match
    if (selectedEmployee !== 'ALL') {
      const hasEmployeeInStages = Object.values(job.stages || {}).some(
        (stage) => stage?.assignee === selectedEmployee
      );
      if (!hasEmployeeInStages) return false;
    }

    return true;
  });

  // Calculate Metrics Summary
  const totalJobsCount = filteredJobs.length;
  const totalFilesDelivered = filteredJobs.reduce((acc, j) => acc + (j.outputTarget || 0), 0);

  const calculateTurnaroundMinutes = (startIso, endIso) => {
    if (!startIso || !endIso) return 0;
    const s = new Date(startIso).getTime();
    const e = new Date(endIso).getTime();
    if (isNaN(s) || isNaN(e) || e < s) return 0;
    return Math.round((e - s) / 60000);
  };

  const totalTurnaroundMins = filteredJobs.reduce(
    (acc, j) => acc + calculateTurnaroundMinutes(j.clientEntryTime, j.clientFinishTime),
    0
  );
  const avgTurnaroundMins = totalJobsCount > 0 ? Math.round(totalTurnaroundMins / totalJobsCount) : 0;

  const formatMinsToHM = (mins) => {
    if (!mins || mins <= 0) return 'N/A';
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hrs > 0) return `${hrs}h ${remainingMins}m`;
    return `${remainingMins}m`;
  };

  const formatTurnaroundText = (startIso, endIso) => {
    const mins = calculateTurnaroundMinutes(startIso, endIso);
    if (!mins || mins <= 0) return 'In Production';
    return formatMinsToHM(mins);
  };

  const getStageDuration = (stageObj) => {
    if (!stageObj || !stageObj.startTime) return 'N/A';
    const s = new Date(stageObj.startTime).getTime();
    const e = stageObj.endTime ? new Date(stageObj.endTime).getTime() : Date.now();
    const grossSec = Math.floor((e - s) / 1000);
    const netSec = Math.max(0, grossSec - (stageObj.pausedDurationSeconds || 0));
    const mins = Math.round(netSec / 60);
    if (mins < 1) return '< 1 min';
    return `${mins} mins`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 mb-2">
            <FiPieChart className="w-3.5 h-3.5" /> Client Audit & Performance Report
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            Client Summary & Turnaround Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete daily, monthly, yearly, and custom-range audit detailing client turnaround speeds, stage working times, and employee performance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shrink-0"
        >
          <FiPrinter className="w-4 h-4" /> Print / Export Report
        </button>
      </div>

      {/* FILTER CONTROL PANEL */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <FiFilter className="w-4 h-4 text-indigo-600" /> Filter Report Parameters
          </div>
          <div className="text-xs font-mono font-bold text-indigo-600">
            Showing {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* 1. Time Range Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTimeFilterType('TODAY')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeFilterType === 'TODAY'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Today's Summary Log (Default)
          </button>
          <button
            type="button"
            onClick={() => setTimeFilterType('DATE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeFilterType === 'DATE'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Specific Date
          </button>
          <button
            type="button"
            onClick={() => setTimeFilterType('MONTHLY')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeFilterType === 'MONTHLY'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setTimeFilterType('YEARLY')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeFilterType === 'YEARLY'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Yearly
          </button>
          <button
            type="button"
            onClick={() => setTimeFilterType('CUSTOM')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeFilterType === 'CUSTOM'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Custom Date Range
          </button>
          <button
            type="button"
            onClick={() => setTimeFilterType('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeFilterType === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Time
          </button>
        </div>

        {/* 2. Dynamic Input Controls & Entity Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Dynamic Date Inputs based on Tab */}
          {timeFilterType === 'DATE' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 font-bold border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {timeFilterType === 'MONTHLY' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Select Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 font-bold border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {timeFilterType === 'YEARLY' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Select Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 font-bold border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          )}

          {timeFilterType === 'CUSTOM' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 font-bold border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 font-bold border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}

          {/* Client Filter Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Filter by Client
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 font-bold border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
            >
              {clientOptions.map((code) => (
                <option key={code} value={code}>
                  {code === 'ALL' ? 'All Clients' : `Client [${code}]`}
                </option>
              ))}
            </select>
          </div>

          {/* Employee Personnel Filter Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Filter by Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 font-bold border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
            >
              {employeeOptions.map((emp) => (
                <option key={emp} value={emp}>
                  {emp === 'ALL' ? 'All Team Members' : emp}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* METRICS SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-lg shrink-0">
            <FiBriefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Filtered Jobs</div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">{totalJobsCount}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold text-lg shrink-0">
            <FiLayers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Delivered Files</div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">{totalFilesDelivered}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-bold text-lg shrink-0">
            <FiClock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Avg Turnaround Speed</div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">{formatMinsToHM(avgTurnaroundMins)}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-lg shrink-0">
            <FiUsers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Filters</div>
            <div className="text-xs font-bold text-indigo-600 font-mono mt-1">
              {timeFilterType} • {selectedClient} • {selectedEmployee}
            </div>
          </div>
        </div>
      </div>

      {/* CLIENT & JOB AUDIT CARDS */}
      <div className="space-y-5">
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-2">
            <FiPieChart className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Jobs Found Matching Criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your date range, client, or employee filters to view turnaround audit logs.
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const teamInvolved = [
              { stage: 'Blending', assignee: job.stages.blending?.assignee, duration: getStageDuration(job.stages.blending), status: job.stages.blending?.status },
              { stage: 'Path 1', assignee: job.stages.path1?.assignee, duration: getStageDuration(job.stages.path1), status: job.stages.path1?.status },
              { stage: 'Path 2', assignee: job.stages.path2?.assignee, duration: getStageDuration(job.stages.path2), status: job.stages.path2?.status },
              { stage: 'Editor 1', assignee: job.stages.editor1?.assignee, duration: getStageDuration(job.stages.editor1), status: job.stages.editor1?.status },
              { stage: 'Editor 2', assignee: job.stages.editor2?.assignee, duration: getStageDuration(job.stages.editor2), status: job.stages.editor2?.status },
              { stage: 'LC', assignee: job.stages.lc?.assignee, duration: getStageDuration(job.stages.lc), status: job.stages.lc?.status },
              { stage: 'FC', assignee: job.stages.fc?.assignee, duration: getStageDuration(job.stages.fc), status: job.stages.fc?.status },
            ].filter((t) => t.assignee);

            const totalTurnaroundText = formatTurnaroundText(job.clientEntryTime, job.clientFinishTime);
            const jobDate = getJobDateStr(job);

            return (
              <div
                key={job.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5"
              >
                {/* Job Top Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-600">
                      Job #{job.id} <span className="text-slate-300">•</span> Date: {jobDate}
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-0.5 font-display">
                      Client <span className="text-indigo-600">{job.client}</span> — {job.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Total Turnaround</div>
                      <div className="text-xs font-bold font-mono text-emerald-700">{totalTurnaroundText}</div>
                    </div>
                    <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Output Count</div>
                      <div className="text-xs font-bold font-mono text-indigo-600">{job.outputTarget} Files</div>
                    </div>
                  </div>
                </div>

                {/* Client Timestamps Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <div className="text-slate-500 font-semibold">Client Entry Time (Files Received):</div>
                    <div className="text-slate-900 font-mono font-bold mt-0.5">
                      {job.clientEntryTime ? new Date(job.clientEntryTime).toLocaleString() : 'Not Set'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-semibold">Target Delivery Deadline:</div>
                    <div className="text-amber-800 font-mono font-bold mt-0.5">
                      {job.clientTargetTime ? new Date(job.clientTargetTime).toLocaleString() : 'Flexible'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-semibold">Final Dispatch / Finish Time:</div>
                    <div className="text-emerald-700 font-mono font-bold mt-0.5">
                      {job.clientFinishTime ? new Date(job.clientFinishTime).toLocaleString() : 'In Production'}
                    </div>
                  </div>
                </div>

                {/* Team Member Stage Breakdown Matrix */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FiUsers className="w-4 h-4 text-indigo-600" /> Personnel Stage Allocation & Working Durations
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {teamInvolved.map((member, idx) => {
                      const isTargetEmployee = selectedEmployee !== 'ALL' && member.assignee === selectedEmployee;
                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                            isTargetEmployee
                              ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-200'
                              : 'bg-slate-50 border-slate-100'
                          }`}
                        >
                          <div>
                            <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">{member.stage}</div>
                            <div className="text-xs font-extrabold text-slate-900 mt-0.5">{member.assignee}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-mono text-indigo-600 font-bold">{member.duration}</div>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-md border font-semibold inline-block mt-0.5 ${
                                member.status === 'Complete'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : member.status === 'In-Progress'
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {member.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
