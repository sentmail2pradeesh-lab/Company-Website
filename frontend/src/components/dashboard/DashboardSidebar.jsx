import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiList,
  FiCheckSquare,
  FiUsers,
  FiFileText,
  FiPieChart,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { useJobs } from '../../context/JobContext';

export default function DashboardSidebar({ isCollapsed, setIsCollapsed }) {
  const { stats } = useJobs();

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: FiGrid, badge: null },
    { label: "Today's Jobs", path: '/dashboard/jobs', icon: FiList, badge: stats.totalJobs },
    { label: 'QC Pending', path: '/dashboard/qc-pending', icon: FiCheckSquare, badge: stats.qcPendingJobs, badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    { label: 'Assignments', path: '/dashboard/assignments', icon: FiUsers, badge: null },
    { label: 'Production Sheets', path: '/dashboard/production-sheets', icon: FiFileText, badge: null },
    { label: 'Client History & Summary', path: '/dashboard/client-summary', icon: FiPieChart, badge: null },
  ];

  return (
    <aside
      className={`fixed top-16 bottom-0 left-0 z-30 bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 flex flex-col shadow-md ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Top Toggle */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        {!isCollapsed && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Main Menu
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors ml-auto"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <FiChevronRight className="w-4 h-4" /> : <FiChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
              {!isCollapsed && item.badge !== null && item.badge !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold ${
                    item.badgeColor || 'bg-indigo-500/20 text-cyan-300 border-indigo-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer System Status */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Shift Status: Active</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
            ASZEN Engine v2.4
          </div>
        </div>
      )}
    </aside>
  );
}
