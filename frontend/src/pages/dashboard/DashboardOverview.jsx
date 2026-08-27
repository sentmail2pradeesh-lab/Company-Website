import StatCards from '../../components/dashboard/StatCards';
import TodaysJobsSummary from '../../components/dashboard/TodaysJobsSummary';
import TasksOverviewTable from '../../components/dashboard/TasksOverviewTable';
import { useJobs } from '../../context/JobContext';
import { FiPlus, FiActivity } from 'react-icons/fi';

export default function DashboardOverview() {
  const { setIsCreateModalOpen } = useJobs();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 mb-2">
            <FiActivity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> Live Production Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            Production & Job Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Real-time stage tracking for Path 1, Path 2, Editor 1, Editor 2, QC, and FC production with active timer management.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="relative z-10 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
        >
          <FiPlus className="w-4 h-4" /> Create New Job
        </button>
      </div>

      {/* KPI Stat Cards Grid */}
      <StatCards />

      {/* Two Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tasks Overview Matrix */}
        <div className="lg:col-span-5">
          <TasksOverviewTable />
        </div>

        {/* Right Column: Today's Jobs Summary Table */}
        <div className="lg:col-span-7">
          <TodaysJobsSummary />
        </div>
      </div>
    </div>
  );
}
