import { useJobs } from '../../context/JobContext';
import { FiBriefcase, FiFileText, FiCheckCircle, FiClock, FiAlertCircle, FiLayers } from 'react-icons/fi';

export default function StatCards() {
  const { stats } = useJobs();

  const cards = [
    {
      title: 'Total Jobs',
      value: stats.totalJobs,
      subtitle: 'Active production pipeline',
      badgeBg: 'bg-blue-50 text-blue-600 border-blue-100',
      icon: FiBriefcase,
    },
    {
      title: 'Total Files',
      value: stats.totalFiles,
      subtitle: 'Processed output target',
      badgeBg: 'bg-sky-50 text-sky-600 border-sky-100',
      icon: FiFileText,
    },
    {
      title: 'Completed Jobs',
      value: stats.completedJobs,
      subtitle: 'Fully dispatched & verified',
      badgeBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      icon: FiCheckCircle,
    },
    {
      title: 'Pending Jobs',
      value: stats.pendingJobs,
      subtitle: 'In-progress across stages',
      badgeBg: 'bg-pink-50 text-pink-600 border-pink-100',
      icon: FiClock,
    },
    {
      title: 'QC Pending Jobs',
      value: stats.qcPendingJobs,
      subtitle: 'Awaiting quality approval',
      badgeBg: 'bg-rose-50 text-rose-600 border-rose-100',
      icon: FiAlertCircle,
    },
    {
      title: 'Path Pending Jobs',
      value: stats.pathPendingJobs,
      subtitle: 'In Path 1 or Path 2 preparation',
      badgeBg: 'bg-amber-50 text-amber-600 border-amber-100',
      icon: FiLayers,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${card.badgeBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="text-3xl font-bold font-mono text-slate-900 tracking-tight my-2">
              {card.value}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              {card.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
}
