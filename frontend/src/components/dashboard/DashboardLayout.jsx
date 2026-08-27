import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import { useAuth } from '../../context/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import TaskTimerModal from './TaskTimerModal';
import ClientTurnaroundModal from './ClientTurnaroundModal';
import CreateJobModal from './CreateJobModal';
import JobAssignmentModal from './JobAssignmentModal';
import { FiPlus, FiHome } from 'react-icons/fi';

export default function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { setIsCreateModalOpen } = useJobs();
  const { user } = useAuth();
  const displayName = user?.name || (user?.email ? user.email.split('.')[0].split('@')[0] : 'Lessy');
  const formattedDisplayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  const userInitial = formattedDisplayName.charAt(0);

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Sleek Deep Executive Header Navigation */}
      <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-slate-900 text-white border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shadow-md">
        {/* Brand Logo & Quick Nav */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/vistaeditz_logo.svg"
              alt="Vista Editz Logo"
              className="h-9 w-auto max-w-[130px] object-contain rounded-lg shrink-0 group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Header Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg transition-all ${isActive ? 'bg-indigo-600 text-white shadow-sm font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`
              }
            >
              Dashboard
            </NavLink>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 transition-all"
            >
              Create Job
            </button>
            <NavLink
              to="/dashboard/jobs"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg transition-all ${isActive ? 'bg-indigo-600 text-white shadow-sm font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`
              }
            >
              Todays Job
            </NavLink>
          </nav>
        </div>

        {/* Header Right Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95"
          >
            <FiPlus className="w-4 h-4" /> <span className="hidden sm:inline">Create Job</span>
          </button>

          {/* User Profile Badge */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-white">Hi, {formattedDisplayName}</div>
              <div className="text-[10px] text-cyan-400 font-mono">{user?.email || `${formattedDisplayName.toLowerCase()}.aszen@gmail.com`}</div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-indigo-600 border border-indigo-500 flex items-center justify-center font-bold text-white text-xs shadow-sm">
              {userInitial}
            </div>

            <Link
              to="/"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Return to Main Website"
            >
              <FiHome className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <DashboardSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Main Page Area */}
      <main
        className={`pt-20 pb-12 px-4 sm:px-8 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}
      >
        <Outlet />
      </main>

      {/* Global Dashboard Modals */}
      <TaskTimerModal />
      <ClientTurnaroundModal />
      <CreateJobModal />
      <JobAssignmentModal />
    </div>
  );
}
