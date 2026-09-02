import { useJobs } from '../../context/JobContext';
import { FiRefreshCw } from 'react-icons/fi';

export default function TodaysJobsSummary() {
  const { jobs } = useJobs();

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-6 flex flex-col h-full min-h-[480px]">
      {/* Top Header Row matching screenshot */}
      <div className="flex items-center justify-between pb-6">
        <h2 className="text-lg font-bold text-slate-900 font-sans">
          Today jobs
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="text-slate-400 hover:text-slate-700 transition-colors p-1"
          title="Refresh jobs"
        >
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs border border-slate-100">
          <thead>
            <tr className="border-b border-slate-200 text-slate-700 font-bold text-xs bg-slate-50/50">
              <th className="py-3 px-4 border-r border-slate-100 w-24">ID #</th>
              <th className="py-3 px-4 border-r border-slate-100">Client</th>
              <th className="py-3 px-4 border-r border-slate-100">Folder</th>
              <th className="py-3 px-4 border-r border-slate-100">Output</th>
              <th className="py-3 px-4">QC Pending</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                  No jobs logged for today yet.
                </td>
              </tr>
            ) : (
              jobs.slice(0, 10).map((job) => {
                const qcPendingCount = (job.stages.fc?.status === 'Complete' || job.stages.qc?.status === 'Complete') ? 0 : 1;
                return (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 border-r border-slate-100">
                      #{job.id}
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
        </table>
      </div>
    </div>
  );
}

