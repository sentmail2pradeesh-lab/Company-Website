import { useState } from 'react';
import { useJobs } from '../../context/JobContext';
import {
  FiPieChart,
  FiClock,
  FiUsers,
  FiCalendar,
  FiPrinter,
} from 'react-icons/fi';

export default function ClientHistorySummaryPage() {
  const { jobs } = useJobs();

  const [selectedDate, setSelectedDate] = useState('2026-08-27');
  const [selectedClient, setSelectedClient] = useState('ALL');

  const clientCodes = ['ALL', ...new Set(jobs.map((j) => j.client))];

  const summaryJobs = jobs.filter((job) => {
    const matchesClient = selectedClient === 'ALL' || job.client === selectedClient;
    return matchesClient;
  });

  const formatTurnaround = (startIso, endIso) => {
    if (!startIso || !endIso) return 'In-Progress';
    const s = new Date(startIso).getTime();
    const e = new Date(endIso).getTime();
    if (isNaN(s) || isNaN(e) || e < s) return 'Pending';
    const diffMs = e - s;
    const hrs = Math.floor(diffMs / 3600000);
    const mins = Math.round((diffMs % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  };

  const getStageDuration = (stageObj) => {
    if (!stageObj || !stageObj.startTime || !stageObj.endTime) return 'N/A';
    const s = new Date(stageObj.startTime).getTime();
    const e = new Date(stageObj.endTime).getTime();
    const grossSec = Math.floor((e - s) / 1000);
    const netSec = Math.max(0, grossSec - (stageObj.pausedDurationSeconds || 0));
    const mins = Math.round(netSec / 60);
    return `${mins} mins`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 mb-2">
            <FiPieChart className="w-3.5 h-3.5" /> Full Audit & Turnaround Report
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            Client Daily History & Summary Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete daily audit detailing personnel involvement (Path 1, Path 2, Editors, QC, FC), stage durations, and turnaround speed.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs flex items-center gap-2 transition-colors shrink-0"
        >
          <FiPrinter className="w-4 h-4" /> Print / Export Report
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Select Client:</label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="bg-slate-50 text-slate-800 font-bold border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500"
          >
            {clientCodes.map((code) => (
              <option key={code} value={code}>
                {code === 'ALL' ? 'All Clients Summary' : `Client ${code}`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <FiCalendar className="w-4 h-4 text-indigo-600" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Client Summary Cards */}
      <div className="space-y-5">
        {summaryJobs.map((job) => {
          const teamInvolved = [
            { stage: 'Path 1', assignee: job.stages.path1?.assignee, duration: getStageDuration(job.stages.path1), status: job.stages.path1?.status },
            { stage: 'Path 2', assignee: job.stages.path2?.assignee, duration: getStageDuration(job.stages.path2), status: job.stages.path2?.status },
            { stage: 'Editor 1', assignee: job.stages.editor1?.assignee, duration: getStageDuration(job.stages.editor1), status: job.stages.editor1?.status },
            { stage: 'Editor 2', assignee: job.stages.editor2?.assignee, duration: getStageDuration(job.stages.editor2), status: job.stages.editor2?.status },
            { stage: 'QC', assignee: job.stages.qc?.assignee, duration: getStageDuration(job.stages.qc), status: job.stages.qc?.status },
            { stage: 'FC', assignee: job.stages.fc?.assignee, duration: getStageDuration(job.stages.fc), status: job.stages.fc?.status },
          ].filter((t) => t.assignee);

          const totalTurnaroundText = formatTurnaround(job.clientEntryTime, job.clientFinishTime);

          return (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5"
            >
              {/* Job Top Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-600">
                    Job #{job.id} <span className="text-slate-300">•</span> Date: {selectedDate}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    Client <span className="text-indigo-600">{job.client}</span> — {job.name}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Turnaround</div>
                    <div className="text-xs font-bold font-mono text-emerald-700">{totalTurnaroundText}</div>
                  </div>
                  <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Output Count</div>
                    <div className="text-xs font-bold font-mono text-indigo-600">{job.outputTarget} Files</div>
                  </div>
                </div>
              </div>

              {/* Client Timestamps Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <div className="text-slate-500 font-medium">Client Entry Time (Files Received):</div>
                  <div className="text-slate-900 font-mono font-bold mt-0.5">
                    {job.clientEntryTime ? new Date(job.clientEntryTime).toLocaleString() : 'Not Set'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Target Delivery Deadline:</div>
                  <div className="text-amber-800 font-mono font-bold mt-0.5">
                    {job.clientTargetTime ? new Date(job.clientTargetTime).toLocaleString() : 'Flexible'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 font-medium">Final Dispatch / Finish Time:</div>
                  <div className="text-emerald-700 font-mono font-bold mt-0.5">
                    {job.clientFinishTime ? new Date(job.clientFinishTime).toLocaleString() : 'In Production'}
                  </div>
                </div>
              </div>

              {/* Team Member Stage Breakdown Matrix */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FiUsers className="w-4 h-4 text-indigo-600" /> Team Members Involved & Working Times
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {teamInvolved.map((member, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase">{member.stage}</div>
                        <div className="text-xs font-bold text-slate-900 mt-0.5">{member.assignee}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono text-indigo-600 font-bold">{member.duration}</div>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-md border font-medium ${
                            member.status === 'Complete'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {member.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
