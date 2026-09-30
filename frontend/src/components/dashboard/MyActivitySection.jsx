import { useState, useMemo } from 'react';
import { useJobs } from '../../context/JobContext';
import { useAuth } from '../../context/AuthContext';
import { FiActivity, FiFilter, FiUser, FiRefreshCw } from 'react-icons/fi';

export default function MyActivitySection() {
  const { activities, editors } = useJobs();
  const { user } = useAuth();

  const userRole = (user?.role || 'employee').toLowerCase();
  const isManagerOrAdmin = userRole === 'admin' || userRole === 'manager';
  const currentUserName = user?.name || (user?.email ? user.email.split('@')[0] : 'Staff');

  // Filter state: 'my' (only current user), 'all' (entire team), or specific employee name
  const [filterMode, setFilterMode] = useState(isManagerOrAdmin ? 'all' : 'my');
  const [selectedStaff, setSelectedStaff] = useState('ALL');

  const filteredActivities = useMemo(() => {
    let list = activities || [];

    if (filterMode === 'my' && !isManagerOrAdmin) {
      // For employees, show only events they acted in or were assigned to
      list = list.filter((act) => {
        const actor = (act.actorName || '').toLowerCase();
        const target = (act.targetEmployee || '').toLowerCase();
        const myName = currentUserName.toLowerCase();
        const myEmail = (user?.email || '').toLowerCase();
        const actEmail = (act.actorEmail || '').toLowerCase();
        return (
          actor === myName ||
          target === myName ||
          (actEmail && actEmail === myEmail) ||
          (act.text || '').toLowerCase().includes(myName)
        );
      });
    } else if (filterMode === 'my' && isManagerOrAdmin) {
      // Manager personal actions
      list = list.filter((act) => {
        const actor = (act.actorName || '').toLowerCase();
        const myName = currentUserName.toLowerCase();
        return actor === myName || (act.text || '').toLowerCase().includes(`by ${myName}`);
      });
    } else if (selectedStaff !== 'ALL') {
      // Specific staff selected by manager
      const staffName = selectedStaff.toLowerCase();
      list = list.filter((act) => {
        const actor = (act.actorName || '').toLowerCase();
        const target = (act.targetEmployee || '').toLowerCase();
        return (
          actor === staffName ||
          target === staffName ||
          (act.text || '').toLowerCase().includes(staffName)
        );
      });
    }

    return list;
  }, [activities, filterMode, selectedStaff, currentUserName, isManagerOrAdmin, user]);

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 sm:p-6 flex flex-col h-full min-h-[480px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-sans tracking-tight">
              My Activity
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 font-mono">
              {filteredActivities.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {filterMode === 'my'
              ? `Personal timeline for ${currentUserName} (${user?.designation || userRole})`
              : 'Live cross-team production and assignment stream'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {isManagerOrAdmin && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setFilterMode('all'); setSelectedStaff('ALL'); }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterMode === 'all' && selectedStaff === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All Team
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('my')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterMode === 'my'
                    ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                My Actions
              </button>
            </div>
          )}

          {isManagerOrAdmin && (
            <div className="relative">
              <select
                value={selectedStaff}
                onChange={(e) => {
                  setSelectedStaff(e.target.value);
                  if (e.target.value !== 'ALL') setFilterMode('staff');
                }}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ALL">Filter Staff: All</option>
                {editors.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="flex-1 overflow-y-auto mt-4 pr-1 mobile-touch-scroll max-h-[560px]">
        {filteredActivities.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <FiActivity className="w-8 h-8 text-slate-300 mb-2 animate-pulse" />
            <p className="text-xs font-semibold text-slate-600">No activity recorded yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Actions taken on jobs, QC reviews, and leave requests will stream here.
            </p>
          </div>
        ) : (
          <div className="relative space-y-4 before:absolute before:left-[72px] sm:before:left-[80px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-200/80">
            {filteredActivities.map((act) => {
              // Extract or format text parts
              return (
                <div
                  key={act.id}
                  className="relative flex items-start gap-3 sm:gap-4 text-xs group hover:bg-slate-50/70 p-1.5 rounded-xl transition-colors"
                >
                  {/* Left Column: Timestamp */}
                  <span className="w-16 sm:w-18 shrink-0 text-right font-mono text-[11px] font-semibold text-slate-500 pt-0.5">
                    {act.timeStr || 'now'}
                  </span>

                  {/* Middle Column: Ring indicator (◯) on vertical track */}
                  <div className="relative z-10 pt-1 shrink-0">
                    <span className="flex h-3 w-3 items-center justify-center rounded-full border-2 border-[#00CBB8] bg-white ring-2 ring-[#00CBB8]/20 transition-transform group-hover:scale-125" />
                  </div>

                  {/* Right Column: Activity description text */}
                  <div className="flex-1 min-w-0 pt-0.5 text-slate-700 leading-relaxed font-medium">
                    <FormattedActivityText text={act.text} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper to highlight Job #, employee names, and actions gracefully
function FormattedActivityText({ text }) {
  if (!text) return null;

  // Pattern matching: "Job #15780 :: QC Updated from varun to Dhanush by siva"
  const parts = text.split('::');

  if (parts.length === 2) {
    const prefix = parts[0].trim();
    const body = parts[1].trim();

    return (
      <span>
        <span className="font-bold text-slate-900 font-mono tracking-tight mr-1.5 bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded-md text-[11px] border border-slate-200/60">
          {prefix}
        </span>
        <span className="text-slate-400 font-bold mr-1.5">::</span>
        <span className="text-slate-800">{body}</span>
      </span>
    );
  }

  return <span>{text}</span>;
}
