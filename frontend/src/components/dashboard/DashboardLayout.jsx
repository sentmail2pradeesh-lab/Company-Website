import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import { useAuth } from '../../context/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import TaskTimerModal from './TaskTimerModal';
import ClientTurnaroundModal from './ClientTurnaroundModal';
import JobAssignmentModal from './JobAssignmentModal';
import { FiPlus, FiSettings, FiLogOut } from 'react-icons/fi';

export default function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { canManageClients, canCreateJob } = useJobs();
  const { user, logout } = useAuth();
  const displayName = user?.name || (user?.email ? user.email.split('.')[0].split('@')[0] : 'Lessy');
  const formattedDisplayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#F0F3FA] text-slate-800 font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* ASZEN Design Clean White Top Navigation Header */}
      <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-white text-slate-800 border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between shadow-xs">
        {/* Left Side Navigation Links */}
        <div className="flex items-center gap-8 pl-64">
          <nav className="flex items-center gap-8 text-sm font-semibold">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `transition-colors ${
                  isActive ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              Dashboard
            </NavLink>

            {canCreateJob && (
              <NavLink
                to="/dashboard/create-job"
                className={({ isActive }) =>
                  `transition-colors ${
                    isActive ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`
                }
              >
                Create Job
              </NavLink>
            )}

            <NavLink
              to="/dashboard/jobs"
              className={({ isActive }) =>
                `transition-colors ${
                  isActive ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              Todays Job
            </NavLink>
          </nav>
        </div>

        {/* Right Side Quick User Profile Badge (Vibrant Coral Red Pill) */}
        <div className="flex items-center gap-3">
          {/* Admin Control Page Link */}
          {canManageClients && (
            <Link
              to="/dashboard/management"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all"
              title="Admin Control Panel Page"
            >
              <FiSettings className="w-3.5 h-3.5" /> <span>Admin Panel</span>
            </Link>
          )}

          {canCreateJob && (
            <Link
              to="/dashboard/create-job"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
            >
              <FiPlus className="w-4 h-4" /> <span>New Job</span>
            </Link>
          )}

          {/* Clean Coral Red Badge: "Hi, Lessy" without role text */}
          <div className="bg-[#FF4D5A] text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all">
            <span>Hi, {formattedDisplayName}</span>
            <span className="text-[10px] opacity-90">∨</span>
          </div>

          {/* Header Logout Button */}
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border border-slate-200/80 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            title="Log Out"
          >
            <FiLogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <DashboardSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Main Page Area */}
      <main
        className={`pt-20 pb-12 px-4 sm:px-8 transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Outlet />
      </main>

      {/* Global Dashboard Modals */}
      <TaskTimerModal />
      <ClientTurnaroundModal />
      <JobAssignmentModal />
    </div>
  );
}

