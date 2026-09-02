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
} from 'react-icons/fi';
import { useJobs } from '../../context/JobContext';

export default function DashboardSidebar({ isCollapsed, setIsCollapsed }) {
  const { stats, canCreateJob, canManageClients } = useJobs();
  const [jobsExpanded, setJobsExpanded] = useState(true);
  const [assignmentsExpanded, setAssignmentsExpanded] = useState(false);

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-50 bg-[#1C1D2D] text-slate-300 transition-all duration-300 flex flex-col shadow-xl border-r border-[#26283C] ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Logo Container Box (Dark Navy Background matching sidebar) */}
      <div className="h-16 bg-[#1C1D2D] px-4 border-b border-[#26283C] flex items-center justify-between shrink-0">
        <Link to="/dashboard" className="flex items-center justify-center w-full group">
          <img
            src="/vistaeditz_logo.svg"
            alt="Vista Editz Logo"
            className={`h-9 object-contain transition-all ${
              isCollapsed ? 'w-10 max-w-full' : 'max-w-[150px]'
            }`}
          />
        </Link>
      </div>

      {/* Navigation Items List */}
      <div className="flex-1 py-4 px-3 space-y-2 overflow-y-auto font-sans">
        {/* 1. Dashboard (Overview) */}
        <NavLink
          to="/dashboard"
          end
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
          {!isCollapsed && <span className="truncate">Dashboard</span>}
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
          {jobsExpanded && !isCollapsed && (
            <div className="ml-5 mt-1 space-y-1 border-l border-slate-700/60 pl-3">
              {canCreateJob && (
                <NavLink
                  to="/dashboard/create-job"
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
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#25273C] transition-all"
          >
            <div className="flex items-center gap-3.5 truncate">
              <FiGrid className="w-4 h-4 text-slate-400 shrink-0" />
              {!isCollapsed && <span>Assignments</span>}
            </div>
            {!isCollapsed && (
              <span className="text-slate-400 text-xs">
                {assignmentsExpanded ? <FiChevronDown className="w-3.5 h-3.5" /> : <FiChevronRight className="w-3.5 h-3.5" />}
              </span>
            )}
          </button>

          {assignmentsExpanded && !isCollapsed && (
            <div className="ml-5 mt-1 space-y-1 border-l border-slate-700/60 pl-3">
              <NavLink
                to="/dashboard/assignments"
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

        {/* 4. Client Summary */}
        <NavLink
          to="/dashboard/client-summary"
          className={({ isActive }) =>
            `flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold transition-all ${
              isActive
                ? 'bg-[#151623] text-white font-bold border-l-4 border-blue-500'
                : 'text-slate-400 hover:text-white hover:bg-[#25273C]'
            }`
          }
        >
          <FiPieChart className="w-4 h-4 text-slate-400 shrink-0" />
          {!isCollapsed && <span className="truncate">Client Summary</span>}
        </NavLink>

        {/* 5. Admin Panel (Admin Only) */}
        {canManageClients && (
          <NavLink
            to="/dashboard/management"
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#151623] text-indigo-400 font-bold border-l-4 border-indigo-500'
                  : 'text-slate-400 hover:text-white hover:bg-[#25273C]'
              }`
            }
          >
            <span className="text-indigo-400 text-sm">👑</span>
            {!isCollapsed && <span className="truncate">Admin Panel</span>}
          </NavLink>
        )}
      </div>

      {/* Collapse Toggle Footer Button */}
      <div className="p-3 border-t border-[#26283C] bg-[#171827] flex items-center justify-between">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg bg-[#25273C] hover:bg-[#31334E] text-slate-300 hover:text-white transition-colors w-full flex items-center justify-center gap-2 text-xs font-medium"
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
  );
}

