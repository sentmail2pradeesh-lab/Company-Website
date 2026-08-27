import { Link } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import { FiExternalLink, FiFolder, FiCheckCircle } from 'react-icons/fi';

export default function TodaysJobsSummary() {
  const { jobs } = useJobs();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Sleek Dark Header Accent */}
      <div className="bg-slate-900 text-white p-4.5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold">
            Today's Jobs Overview
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Quick glance summary of client output & QC status
          </p>
        </div>

        <Link
          to="/dashboard/jobs"
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
        >
          View All <FiExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1 p-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="pb-2.5 px-2">ID #</th>
              <th className="pb-2.5 px-2">Client</th>
              <th className="pb-2.5 px-2">Folder</th>
              <th className="pb-2.5 px-2">Output</th>
              <th className="pb-2.5 px-2 text-right">QC Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {jobs.slice(0, 7).map((job) => {
              const qcPendingCount = job.stages.qc.status === 'Complete' ? 0 : 1;
              return (
                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-2 font-mono font-bold text-indigo-600">
                    #{job.id}
                  </td>
                  <td className="py-2.5 px-2 text-slate-900 font-bold">
                    {job.client}
                  </td>
                  <td className="py-2.5 px-2 text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <FiFolder className="w-3 h-3 text-amber-500" /> {job.folderCount}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-slate-900 font-mono font-bold">
                    {job.outputTarget}
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    {qcPendingCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                        {qcPendingCount} Pending
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium inline-flex items-center gap-1">
                        <FiCheckCircle className="w-3 h-3" /> QC Done
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
