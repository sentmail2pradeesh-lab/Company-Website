import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import { useAuth } from '../../context/AuthContext';
import { FiActivity, FiFilter, FiUser, FiRefreshCw } from 'react-icons/fi';

export default function MyActivitySection() {
  const { activities, editors, jobs, refreshData, resetToSystemActivities } = useJobs();
  const { user } = useAuth();

  const userRole = (user?.role || 'employee').toLowerCase();
  const isAdmin = userRole === 'admin';
  const currentUserName = user?.name || (user?.email ? user.email.split('@')[0] : 'Staff');
  const myName = currentUserName.toLowerCase().trim();
  const myEmail = (user?.email || '').toLowerCase().trim();

  // Admin defaults to 'all' to view team stream; employees are strictly locked to their own timeline
  const [filterMode, setFilterMode] = useState(isAdmin ? 'all' : 'my');
  const [selectedStaff, setSelectedStaff] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (refreshData) await refreshData();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const filteredActivities = useMemo(() => {
    let list = activities || [];

    // Strictly enforce employee restriction: non-admins can NEVER view full team actions
    if (!isAdmin) {
      return list.filter((act) => {
        const actor = (act.actorName || '').toLowerCase().trim();
        const target = (act.targetEmployee || '').toLowerCase().trim();
        const prev = (act.previousAssignee || '').toLowerCase().trim();
        const actEmail = (act.actorEmail || '').toLowerCase().trim();
        const text = (act.text || '').toLowerCase();
        const details = (act.details || '').toLowerCase();

        // 1. Direct actor, target, or email match
        if (actor === myName || target === myName || prev === myName) return true;
        if (myEmail && actEmail === myEmail) return true;

        // 2. Name explicitly mentioned in activity text or details
        if (myName && (text.includes(myName) || details.includes(myName))) return true;

        // 3. Job assignment match: if the activity references a job assigned to this employee
        if (act.jobId && jobs && jobs.length > 0) {
          const matchedJob = jobs.find(
            (j) => String(j.id) === String(act.jobId) || String(j.jobId) === String(act.jobId)
          );
          if (matchedJob) {
            const stageAssignees = Object.values(matchedJob.stages || {})
              .map((st) => st?.assignee)
              .filter(Boolean);

            const assignees = [
              matchedJob.assignedTo,
              matchedJob.editor,
              matchedJob.designer,
              matchedJob.qcAssigned,
              matchedJob.fcAssigned,
              ...stageAssignees,
            ]
              .filter(Boolean)
              .map((n) => String(n).toLowerCase().trim());

            if (assignees.includes(myName) || (myEmail && assignees.includes(myEmail))) {
              return true;
            }
          }
        }

        return false;
      });
    }

    // Admin view controls
    if (filterMode === 'my') {
      return list.filter((act) => {
        const actor = (act.actorName || '').toLowerCase().trim();
        const actEmail = (act.actorEmail || '').toLowerCase().trim();
        return (
          actor === myName ||
          (myEmail && actEmail === myEmail) ||
          (act.text || '').toLowerCase().includes(`by ${myName}`)
        );
      });
    }

    if (selectedStaff !== 'ALL') {
      const staffName = selectedStaff.toLowerCase().trim();
      return list.filter((act) => {
        const actor = (act.actorName || '').toLowerCase().trim();
        const target = (act.targetEmployee || '').toLowerCase().trim();
        const text = (act.text || '').toLowerCase();
        const details = (act.details || '').toLowerCase();
        return (
          actor === staffName ||
          target === staffName ||
          text.includes(staffName) ||
          details.includes(staffName)
        );
      });
    }

    // Admin viewing all team members' actions
    return list;
  }, [activities, filterMode, selectedStaff, myName, myEmail, isAdmin, jobs]);

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 sm:p-6 flex flex-col h-full min-h-[480px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-sans tracking-tight">
              {isAdmin && filterMode === 'all' && selectedStaff === 'ALL' ? 'Team Activity Stream' : 'My Activity'}
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 font-mono">
              {filteredActivities.length}
            </span>
            <button
              type="button"
              onClick={handleRefresh}
              className="text-slate-400 hover:text-indigo-600 transition-colors w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 cursor-pointer ml-1"
              title="Refresh Activity Stream"
              aria-label="Refresh Activity Stream"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isAdmin
              ? filterMode === 'my'
                ? `Personal timeline for ${currentUserName} (Admin)`
                : selectedStaff !== 'ALL'
                ? `Activity stream for ${selectedStaff}`
                : 'Live cross-team production, job updates, and assignment stream'
              : `Personal timeline for ${currentUserName} — showing your actions and assigned tasks`}
          </p>
        </div>

        {/* Filters - ONLY Admin can view other team members or switch filters */}
        {isAdmin && (
          <div className="flex items-center gap-2 flex-wrap">
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
          </div>
        )}
      </div>

      {/* Activity Timeline List */}
      <div className="flex-1 overflow-y-auto mt-4 pr-1 mobile-touch-scroll max-h-[560px]">
        {filteredActivities.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <FiActivity className="w-8 h-8 text-slate-300 mb-2 animate-pulse" />
            <p className="text-xs font-semibold text-slate-600">No activity recorded yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Actions taken on jobs, stage updates, and leave requests will stream here.
            </p>
          </div>
        ) : (
          <div className="relative space-y-4 before:absolute before:left-[72px] sm:before:left-[80px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-200/80">
            {filteredActivities.map((act) => {
              return (
                <div
                  key={act.id}
                  className="relative flex items-start gap-3 sm:gap-4 text-xs group hover:bg-slate-50/70 p-1.5 rounded-xl transition-colors"
                >
                  {/* Left Column: Timestamp & Role indicator */}
                  <div className="w-16 sm:w-20 shrink-0 text-right font-mono text-[11px] font-semibold text-slate-500 pt-0.5 flex flex-col items-end">
                    <span>{act.timeStr || 'now'}</span>
                    {(act.actorRole || '').toLowerCase() === 'developer' && (
                      <span className="text-[9px] font-bold text-cyan-800 bg-cyan-50 border border-cyan-300 px-1 py-0.2 rounded mt-0.5 leading-tight">
                        💻 Dev
                      </span>
                    )}
                  </div>

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

// Helper to highlight Job #, Leave Request #, employee names, and actions gracefully
function FormattedActivityText({ text }) {
  if (!text) return null;

  // Pattern matching: "Job #1001 :: LC Stage reassigned from varun to Dhanush by siva"
  const parts = text.split('::');

  if (parts.length === 2) {
    const prefix = parts[0].trim();
    const body = parts[1].trim();
    const isJob = prefix.startsWith('Job');
    const isLeave = prefix.startsWith('Leave');
    const destination = isJob ? '/dashboard/todays-jobs' : isLeave ? '/dashboard/leaves' : null;

    return (
      <span className="inline-flex items-center flex-wrap gap-1.5">
        {destination ? (
          <Link
            to={destination}
            className="font-bold font-mono tracking-tight bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-indigo-700 px-1.5 py-0.5 rounded text-[11px] border border-slate-200/70 transition-colors inline-block cursor-pointer shadow-2xs"
            title={`Open ${isJob ? "Today's Jobs" : 'Leave Requests'}`}
          >
            {prefix}
          </Link>
        ) : (
          <span className="font-bold font-mono tracking-tight bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px] border border-slate-200/60">
            {prefix}
          </span>
        )}
        <span className="text-slate-400 font-bold">::</span>
        <span className="text-slate-800 font-medium">{body}</span>
      </span>
    );
  }

  return <span>{text}</span>;
}
