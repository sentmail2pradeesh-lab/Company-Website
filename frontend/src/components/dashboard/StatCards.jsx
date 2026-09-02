import { useJobs } from '../../context/JobContext';

export default function StatCards() {
  const { stats } = useJobs();

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
      {/* Coral Red Header Banner */}
      <div className="bg-[#FF4D5A] text-white px-6 py-4 font-bold text-lg">
        Jobs
      </div>

      {/* 2-Column Metric Grid */}
      <div className="p-5 grid grid-cols-2 gap-4">
        {/* 1. Total Jobs (Solid Blue) */}
        <div className="bg-[#3892F6] text-white rounded-2xl p-5 flex flex-col justify-between h-32 shadow-xs transition-transform hover:-translate-y-0.5">
          <div className="text-sm font-semibold text-white/95">
            Total Jobs
          </div>
          <div className="text-3xl font-extrabold font-mono tracking-tight">
            {stats.totalJobs}
          </div>
        </div>

        {/* 2. Total Files (Pastel Ice Blue) */}
        <div className="bg-[#E4F1FF] text-slate-800 rounded-2xl p-5 flex flex-col justify-between h-32 shadow-xs transition-transform hover:-translate-y-0.5">
          <div className="text-sm font-semibold text-slate-600">
            Total Files
          </div>
          <div className="text-3xl font-extrabold font-mono tracking-tight text-[#3892F6]">
            {stats.totalFiles}
          </div>
        </div>

        {/* 3. Completed Jobs (Pastel Mint Cyan) */}
        <div className="bg-[#D6F7F3] text-slate-800 rounded-2xl p-5 flex flex-col justify-between h-32 shadow-xs transition-transform hover:-translate-y-0.5">
          <div className="text-sm font-semibold text-slate-600">
            Completed Jobs
          </div>
          <div className="text-3xl font-extrabold font-mono tracking-tight text-[#00BFA5]">
            {stats.completedJobs}
          </div>
        </div>

        {/* 4. Pending Jobs (Pastel Coral Pink) */}
        <div className="bg-[#FFE6EA] text-slate-800 rounded-2xl p-5 flex flex-col justify-between h-32 shadow-xs transition-transform hover:-translate-y-0.5">
          <div className="text-sm font-semibold text-slate-600">
            Pending Jobs
          </div>
          <div className="text-3xl font-extrabold font-mono tracking-tight text-[#FF4D5A]">
            {stats.pendingJobs}
          </div>
        </div>

        {/* 5. QC Pending Jobs (Solid Coral Red) */}
        <div className="bg-[#FF4D5A] text-white rounded-2xl p-5 flex flex-col justify-between h-32 shadow-xs transition-transform hover:-translate-y-0.5">
          <div className="text-sm font-semibold text-white/95">
            QC Pending Jobs
          </div>
          <div className="text-3xl font-extrabold font-mono tracking-tight">
            {stats.qcPendingJobs}
          </div>
        </div>

        {/* 6. Path Pending Jobs (Solid Golden Orange) */}
        <div className="bg-[#FF9F00] text-white rounded-2xl p-5 flex flex-col justify-between h-32 shadow-xs transition-transform hover:-translate-y-0.5">
          <div className="text-sm font-semibold text-white/95">
            Path Pending Jobs
          </div>
          <div className="text-3xl font-extrabold font-mono tracking-tight">
            {stats.pathPendingJobs}
          </div>
        </div>
      </div>
    </div>
  );
}

