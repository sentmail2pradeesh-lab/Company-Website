import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  FiBox,
  FiGrid,
  FiChevronRight,
  FiChevronLeft,
  FiChevronDown,
  FiFileText,
  FiPieChart,
  FiCalendar,
  FiX,
} from 'react-icons/fi';
import { useJobs } from '../../context/JobContext';

export default function DashboardSidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const { stats, canCreateJob, canManageClients, canManageEmployees, pendingLeaveCount, userRole } = useJobs();
  const isManagerOrAdmin = userRole === 'admin' || userRole === 'manager' || canManageEmployees;
  const [jobsExpanded, setJobsExpanded] = useState(true);
  const [assignmentsExpanded, setAssignmentsExpanded] = useState(false);

  const closeMobile = () => {
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden animate-fadeIn"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#1C1D2D] text-slate-300 transition-all duration-300 flex flex-col shadow-xl border-r border-[#26283C] max-w-[85vw] ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20 w-64' : 'w-64'}`}
      >
        {/* Top Logo Container Box */}
        <div className="h-16 bg-[#1C1D2D] px-4 border-b border-[#26283C] flex items-center justify-between shrink-0">
          <Link to="/dashboard" onClick={closeMobile} className="flex items-center justify-center flex-1 group">
            <img
              src="/vistaeditz_logo.svg"
              alt="Vista Editz Logo"
              className={`h-9 object-contain transition-all ${
                isCollapsed ? 'lg:w-10 max-w-full' : 'max-w-[150px]'
              }`}
            />
          </Link>
          {/* Close button on mobile */}
          <button
            type="button"
            onClick={closeMobile}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#25273C] transition-colors ml-2 cursor-pointer"
            aria-label="Close sidebar"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 py-4 px-3 space-y-2 overflow-y-auto mobile-touch-scroll font-sans">
          {/* 1. Dashboard (Overview) */}
          <NavLink
            to="/dashboard"
            end
            onClick={closeMobile}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#151623] text-white font-bold border-l-4 border-blue-500 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#25273C]'
              }`
            }
          >
            {/* Blue Diamond Active Icon */}
            <span className="text-blue-500 text-sm font-bold shrink-0">◆</span>
            {(!isCollapsed || isMobileOpen) && <span className="truncate">Dashboard</span>}
          </NavLink>

        {/* 2. Jobs Menu Group (Collapsible / Expandable) */}
        <div>
          <button
            onClick={() => setJobsExpanded(!jobsExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#25273C] transition-all"
          >
            <div className="flex items-center gap-3.5 truncate">
              <FiBox className="w-4 h-4 text-slate-400 shrink-0" />
              {!isCollapsed && <span>Jobs</span>}
            </div>
            {!isCollapsed && (
              <span className="text-slate-400 text-xs">
                {jobsExpanded ? <FiChevronDown className="w-3.5 h-3.5" /> : <FiChevronRight className="w-3.5 h-3.5" />}
              </span>
            )}
          </button>

          {/* Expanded Jobs Submenu Links */}
          {jobsExpanded && (!isCollapsed || isMobileOpen) && (
            <div className="ml-5 mt-1 space-y-1 border-l border-slate-700/60 pl-3">
              {canCreateJob && (
                <NavLink
                  to="/dashboard/create-job"
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `block py-2 px-3 rounded-md text-xs font-medium transition-all ${
                      isActive ? 'text-blue-400 font-bold bg-[#151623]' : 'text-slate-400 hover:text-slate-200'
                    }`
                  }
                >
                  + Create New Job
                </NavLink>
              )}
              <NavLink
                to="/dashboard/jobs"
                onClick={closeMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between py-2 px-3 rounded-md text-xs font-medium transition-all ${
                    isActive ? 'text-blue-400 font-bold bg-[#151623]' : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                <span>Today's Jobs</span>
                {stats.totalJobs > 0 && (
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 font-mono font-bold px-1.5 py-0.5 rounded">
                    {stats.totalJobs}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/dashboard/qc-pending"
                onClick={closeMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between py-2 px-3 rounded-md text-xs font-medium transition-all ${
                    isActive ? 'text-rose-400 font-bold bg-[#151623]' : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                <span>QC Pending</span>
                {stats.qcPendingJobs > 0 && (
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 font-mono font-bold px-1.5 py-0.5 rounded">
                    {stats.qcPendingJobs}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/dashboard/production-sheets"
                onClick={closeMobile}
                className={({ isActive }) =>
                  `block py-2 px-3 rounded-md text-xs font-medium transition-all ${
                    isActive ? 'text-blue-400 font-bold bg-[#151623]' : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                Production Sheets
              </NavLink>
            </div>
          )}
        </div>

        {/* 3. Assignments Menu Group */}
        <div>
          <button
            onClick={() => setAssignmentsExpanded(!assignmentsExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#25273C] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3.5 truncate">
              <FiGrid className="w-4 h-4 text-slate-400 shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span>Assignments</span>}
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <span className="text-slate-400 text-xs">
                {assignmentsExpanded ? <FiChevronDown className="w-3.5 h-3.5" /> : <FiChevronRight className="w-3.5 h-3.5" />}
              </span>
            )}
          </button>

          {assignmentsExpanded && (!isCollapsed || isMobileOpen) && (
            <div className="ml-5 mt-1 space-y-1 border-l border-slate-700/60 pl-3">
              <NavLink
                to="/dashboard/assignments"
                onClick={closeMobile}
                className={({ isActive }) =>
                  `block py-2 px-3 rounded-md text-xs font-medium transition-all ${
                    isActive ? 'text-blue-400 font-bold bg-[#151623]' : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                Assignments Matrix
              </NavLink>
            </div>
          )}
        </div>

        {/* 4. Leave Management (matching reference screenshot) */}
        <NavLink
          to="/dashboard/leave"
          onClick={closeMobile}
          className={({ isActive }) =>
            `flex items-center justify-between px-4 py-3 rounded-lg text-xs font-semibold transition-all ${
              isActive
                ? 'bg-[#151623] text-white font-bold border-l-4 border-blue-500 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-[#25273C]'
            }`
          }
        >
          <div className="flex items-center gap-3.5 truncate">
            <FiCalendar className="w-4 h-4 text-slate-400 shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span className="truncate">Leave</span>}
          </div>
          {(!isCollapsed || isMobileOpen) && isManagerOrAdmin && pendingLeaveCount > 0 && (
            <span className="text-[10px] bg-rose-500 text-white font-mono font-bold px-1.5 py-0.5 rounded-full animate-pulse">
              {pendingLeaveCount}
            </span>
          )}
        </NavLink>

        {/* 5. Client Summary */}
        <NavLink
          to="/dashboard/client-summary"
          onClick={closeMobile}
          className={({ isActive }) =>
            `flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold transition-all ${
              isActive
                ? 'bg-[#151623] text-white font-bold border-l-4 border-blue-500'
                : 'text-slate-400 hover:text-white hover:bg-[#25273C]'
            }`
          }
        >
          <FiPieChart className="w-4 h-4 text-slate-400 shrink-0" />
          {(!isCollapsed || isMobileOpen) && <span className="truncate">Client Summary</span>}
        </NavLink>

        {/* 5. Admin Panel & Audit Logs (Admin Only) */}
        {(canManageClients || canManageEmployees) && (
          <>
            <NavLink
              to="/dashboard/management"
              onClick={closeMobile}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#151623] text-indigo-400 font-bold border-l-4 border-indigo-500'
                    : 'text-slate-400 hover:text-white hover:bg-[#25273C]'
                }`
              }
            >
              <span className="text-indigo-400 text-sm">👑</span>
              {(!isCollapsed || isMobileOpen) && <span className="truncate">Admin Panel</span>}
            </NavLink>

            <NavLink
              to="/dashboard/audit-logs"
              onClick={closeMobile}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#151623] text-emerald-400 font-bold border-l-4 border-emerald-500'
                    : 'text-slate-400 hover:text-white hover:bg-[#25273C]'
                }`
              }
            >
              <span className="text-emerald-400 text-sm">🛡️</span>
              {(!isCollapsed || isMobileOpen) && <span className="truncate">Audit Logs</span>}
            </NavLink>
          </>
        )}
      </div>

      {/* Collapse Toggle Footer Button - Desktop Only */}
      <div className="hidden lg:flex p-3 border-t border-[#26283C] bg-[#171827] items-center justify-between">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg bg-[#25273C] hover:bg-[#31334E] text-slate-300 hover:text-white transition-colors w-full flex items-center justify-center gap-2 text-xs font-medium cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <FiChevronRight className="w-4 h-4" />
          ) : (
            <>
              <FiChevronLeft className="w-4 h-4" /> <span>Collapse Menu</span>
            </>
          )}
        </button>
      </div>
    </aside>
    </>
  );
}

