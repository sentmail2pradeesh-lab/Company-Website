import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import { useAuth } from '../../context/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import TaskTimerModal from './TaskTimerModal';
import ClientTurnaroundModal from './ClientTurnaroundModal';
import JobAssignmentModal from './JobAssignmentModal';
import ChangePasswordModal from './ChangePasswordModal';
import { FiPlus, FiSettings, FiLogOut, FiClock, FiKey, FiUser, FiMenu } from 'react-icons/fi';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const { canManageClients, canManageEmployees, canCreateJob, workSessions, isDeveloper } = useJobs();
  const { user, loading, logout, openLogin } = useAuth();

  // Redirect unauthenticated visitors to homepage with login popup
  useEffect(() => {
    if (!loading && !user) {
      openLogin();
      navigate('/', { replace: true });
    }
  }, [loading, user, openLogin, navigate]);

  const displayName = user?.name || (user?.email ? user.email.split('.')[0].split('@')[0] : 'User');
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
        let str = String(loginIso).trim();
        if ((str.includes('T') || str.includes(' ')) && !str.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(str)) {
          str = str.replace(' ', 'T') + 'Z';
        }
        const start = new Date(str).getTime();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F3FA]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-slate-500">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F0F3FA] text-slate-800 font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Top Navigation Header */}
      <header className="fixed top-0 left-0 right-0 h-16 z-30 bg-white text-slate-800 border-b border-slate-200/80 px-3 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs">
        {/* Mobile Hamburger & Logo + Desktop Left Navigation Links */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <FiMenu className="w-6 h-6" />
          </button>

          {/* Mobile Mini Logo */}
          <Link to="/dashboard" className="lg:hidden flex items-center shrink-0">
            <img src="/vistaeditz_logo.svg" alt="Vista Editz" className="h-7 w-auto" />
          </Link>

          {/* Desktop Left Side Navigation Links */}
          <div className={`hidden lg:flex items-center gap-8 transition-all duration-300 ${isSidebarCollapsed ? 'pl-20' : 'pl-60'}`}>
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
        </div>

        {/* Right Side Quick User Profile & Action Links */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Admin / Personnel Control Page Link */}
          {(canManageClients || canManageEmployees || isDeveloper || user?.role === 'developer' || (user?.designation || '').toLowerCase() === 'developer') && (
            <Link
              to="/dashboard/management"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all"
              title="Admin & Personnel Control Panel"
            >
              <FiSettings className="w-3.5 h-3.5" /> <span>Personnel Panel</span>
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
              className="bg-[#FF4D5A] hover:bg-[#E03E4B] text-white px-3 sm:px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer min-h-[38px]"
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
                  <div className="mt-1">
                    {(user?.designation || user?.role)?.toLowerCase() === 'developer' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-300 font-mono shadow-2xs">
                        💻 Developer
                      </span>
                    ) : (
                      <span className="text-[10px] text-indigo-600 font-bold">{user?.designation || user?.role}</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setIsChangePassOpen(true)}
                  className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FiKey className="w-4 h-4 text-indigo-500" /> Change Password
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2 transition-colors border-t border-slate-100 cursor-pointer"
                >
                  <FiLogOut className="w-4 h-4 text-rose-500" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar Navigation (Drawer on mobile, fixed on desktop) */}
      <DashboardSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Page Area */}
      <main
        className={`pt-20 pb-12 px-3 sm:px-6 lg:px-8 transition-all duration-300 ml-0 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
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
