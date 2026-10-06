import { useState } from 'react';
import { useJobs } from '../../context/JobContext';
import { FiRefreshCw } from 'react-icons/fi';
import CopyableText from '../common/CopyableText';
import TableSkeleton from '../common/TableSkeleton';
import EmptyState from '../common/EmptyState';

export default function TodaysJobsSummary() {
  const { todaysJobs, refreshData, operationalDate } = useJobs();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const displayJobs = todaysJobs || [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (refreshData) await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 sm:p-6 flex flex-col h-full min-h-[380px]">
      {/* Top Header Row matching screenshot */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 mb-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-sans">
            Today jobs
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">
            Active Shift (06:00 AM – 05:59 AM) · Fresh Daily Queue
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            {displayJobs.length} active
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            className="text-slate-400 hover:text-indigo-600 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 cursor-pointer"
            title="Refresh jobs"
            aria-label="Refresh jobs"
          >
            <FiRefreshCw className={`w-4 h-4 transition-transform ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2-Axis Scroll Table Container */}
      <div className="overflow-x-auto overflow-y-auto max-h-[380px] custom-scrollbar touch-pan-x touch-pan-y flex-1" data-lenis-prevent>
        <table className="w-full text-left text-xs border border-slate-100 min-w-[480px]">
          <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs">
            <tr className="border-b border-slate-200 text-slate-700 font-bold text-xs bg-slate-50">
              <th className="py-2.5 px-4 border-r border-slate-100 w-28 bg-slate-50">ID #</th>
              <th className="py-2.5 px-4 border-r border-slate-100 bg-slate-50">Client</th>
              <th className="py-2.5 px-4 border-r border-slate-100 bg-slate-50">Folder</th>
              <th className="py-2.5 px-4 border-r border-slate-100 bg-slate-50">Output</th>
              <th className="py-2.5 px-4 bg-slate-50">QC Pending</th>
            </tr>
          </thead>
          {isRefreshing ? (
            <TableSkeleton rows={4} cols={5} />
          ) : (
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {displayJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <EmptyState
                      icon="calendar"
                      title="No jobs logged for today yet"
                      description="Dashboard is ready for the new operational day's shift (06:00 AM – 05:59 AM)."
                    />
                  </td>
                </tr>
              ) : (
                displayJobs.slice(0, 30).map((job) => {
                  const qcPendingCount = (job.stages?.fc?.status === 'Complete' || job.stages?.qc?.status === 'Complete') ? 0 : 1;
                  return (
                    <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 border-r border-slate-100">
                        <CopyableText text={job.id} prefix="#" className="text-indigo-600 font-bold" />
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-semibold border-r border-slate-100">
                        {job.client}
                      </td>
                      <td className="py-3 px-4 text-slate-700 border-r border-slate-100">
                        {job.name || job.folderCount}
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-mono font-semibold border-r border-slate-100">
                        {job.outputTarget}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {qcPendingCount > 0 ? (
                          <span className="text-rose-600 font-bold">{qcPendingCount}</span>
                        ) : (
                          <span className="text-emerald-600 font-bold">0</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}


