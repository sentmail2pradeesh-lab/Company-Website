import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import { useAuth } from '../../context/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import TaskTimerModal from './TaskTimerModal';
import ClientTurnaroundModal from './ClientTurnaroundModal';
import JobAssignmentModal from './JobAssignmentModal';
import ChangePasswordModal from './ChangePasswordModal';
import { FiPlus, FiSettings, FiLogOut, FiClock, FiKey, FiUser } from 'react-icons/fi';

export default function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const { canManageClients, canCreateJob, workSessions } = useJobs();
  const { user, logout } = useAuth();
  const displayName = user?.name || (user?.email ? user.email.split('.')[0].split('@')[0] : 'Lessy');
  const formattedDisplayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  // Live timer for active session
  const [elapsedStr, setElapsedStr] = useState('0h 0m');

  const myEmail = (user?.email || '').toLowerCase();
  const activeSession = workSessions.find(
    (s) => (s.user_email || '').toLowerCase() === myEmail && s.status === 'Active'
  );

  useEffect(() => {
    const updateTimer = () => {
      const loginIso = activeSession?.login_time || sessionStorage.getItem('aszen_login_timestamp');
      if (loginIso) {
        const start = new Date(loginIso).getTime();
        const now = Date.now();
        const diffMins = Math.max(0, Math.floor((now - start) / 60000));
        const hrs = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        setElapsedStr(`${hrs}h ${mins}m`);
      } else {
        setElapsedStr('Active');
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 30000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {}
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

        {/* Right Side Quick User Profile Badge & Work Session Timer */}
        <div className="flex items-center gap-3">
          {/* Active Work Session Live Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <FiClock className="w-3.5 h-3.5" />
            <span>Shift: {elapsedStr}</span>
          </div>

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

          {/* User Profile Badge & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen((v) => !v)}
              className="bg-[#FF4D5A] hover:bg-[#E03E4B] text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <span>Hi, {formattedDisplayName}</span>
              <span className={`text-[10px] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}>∨</span>
            </button>

            {isUserMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 text-xs animate-fadeIn"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="font-bold text-slate-900">{user?.name || formattedDisplayName}</div>
                  <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                  <div className="text-[10px] text-indigo-600 font-bold mt-0.5">{user?.designation || user?.role}</div>
                </div>

                <button
                  onClick={() => setIsChangePassOpen(true)}
                  className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 font-semibold flex items-center gap-2 transition-colors"
                >
                  <FiKey className="w-4 h-4 text-indigo-500" /> Change Password
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2 transition-colors border-t border-slate-100"
                >
                  <FiLogOut className="w-4 h-4 text-rose-500" /> Logout
                </button>
              </div>
            )}
          </div>
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
      <ChangePasswordModal isOpen={isChangePassOpen} onClose={() => setIsChangePassOpen(false)} />

    </div>
  );
}

