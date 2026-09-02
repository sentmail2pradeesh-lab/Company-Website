import { useState } from 'react';
import { useJobs } from '../../context/JobContext';
import { useAuth } from '../../context/AuthContext';
import WorkSessionModal from '../../components/dashboard/WorkSessionModal';
import {
  FiFileText,
  FiCheckCircle,
  FiSearch,
  FiCalendar,
  FiClock,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiLock,
  FiDownload,
} from 'react-icons/fi';

export default function ProductionSheetsPage() {
  const { productionSheets, workSessions, deleteWorkSession, userRole } = useJobs();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('working-hours'); // 'output-sheets' or 'working-hours'

  // Search & Filter state for Output Sheets
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-08-27');

  // Search & Filter state for Working Hours
  const [whSearchTerm, setWhSearchTerm] = useState('');
  const [whDateFilter, setWhDateFilter] = useState('');
  const [whMonthFilter, setWhMonthFilter] = useState('2026-09');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  const isManagerOrAdmin = userRole === 'admin' || userRole === 'manager';
  const currentUserEmail = (user?.email || '').toLowerCase();
  const currentUserName = user?.name || (user?.email ? user.email.split('.')[0] : 'Employee');

  // --- Output Sheets Filtering ---
  const filteredSheets = productionSheets.filter((sheet) => {
    const matchesSearch =
      sheet.editorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sheet.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sheet.jobId.includes(searchTerm);
    const matchesDate = !selectedDate || sheet.date === selectedDate;
    return matchesSearch && matchesDate;
  });

  const totalFiles = filteredSheets.reduce((acc, s) => acc + s.filesProcessed, 0);
  const totalActiveMins = filteredSheets.reduce((acc, s) => acc + s.activeMinutes, 0);

  // --- Working Hours Filtering ---
  const filteredWorkSessions = workSessions.filter((session) => {
    const sEmail = (session.user_email || '').toLowerCase();
    const sName = (session.user_name || '').toLowerCase();

    // Master Admin arun@aszen.com is excluded from production working hours records
    if (sEmail === 'arun@aszen.com') return false;

    // If logged in as employee, strictly filter to employee's own logs
    if (!isManagerOrAdmin) {
      if (sEmail !== currentUserEmail && !sName.includes(currentUserName.toLowerCase())) {
        return false;
      }
    } else {
      // Manager/Admin can search by employee name
      if (whSearchTerm && !sName.includes(whSearchTerm.toLowerCase()) && !sEmail.includes(whSearchTerm.toLowerCase())) {
        return false;
      }
    }

    if (whDateFilter && session.date !== whDateFilter) return false;
    if (whMonthFilter && session.date && !session.date.startsWith(whMonthFilter)) return false;

    return true;
  });

  // --- Employee Statistics Calculation ---
  const mySessions = workSessions.filter((s) => {
    const sEmail = (s.user_email || '').toLowerCase();
    const sName = (s.user_name || '').toLowerCase();
    return sEmail === currentUserEmail || sName.includes(currentUserName.toLowerCase());
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonthStr = '2026-09';

  // Today's hours
  const myTodaySessions = mySessions.filter((s) => s.date === todayStr);
  const myTodayHours = myTodaySessions.reduce((acc, s) => acc + (s.total_hours || 0), 0);

  // Days worked in current month
  const myMonthSessions = mySessions.filter((s) => (s.date || '').startsWith(currentMonthStr));
  const myDaysWorkedMonth = new Set(myMonthSessions.map((s) => s.date)).size;
  const myTotalMonthHours = myMonthSessions.reduce((acc, s) => acc + (s.total_hours || 0), 0);

  // Active shift for current user
  const myActiveSession = mySessions.find((s) => s.status === 'Active');

  const handleEdit = (session) => {
    setEditingSession(session);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingSession(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this working hour log?')) {
      deleteWorkSession(id);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Employee', 'Email', 'Role', 'Login Time', 'Logout Time', 'Total Hours', 'Status', 'Notes'];
    const rows = filteredWorkSessions.map((s) => [
      s.date,
      s.user_name,
      s.user_email,
      s.user_role,
      s.login_time ? new Date(s.login_time).toLocaleTimeString() : '-',
      s.logout_time ? new Date(s.logout_time).toLocaleTimeString() : '-',
      s.total_hours,
      s.status,
      `"${s.notes || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `working_hours_sheet_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 mb-2">
            <FiClock className="w-3.5 h-3.5" /> Production & Working Hour Sheets
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            Employee Login/Logout & Working Hours Sheets
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track daily login/logout timestamps, calculate net shift hours, and manage monthly working days.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('working-hours')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'working-hours'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FiClock className="w-3.5 h-3.5" /> Working Hours & Attendance
          </button>
          <button
            onClick={() => setActiveTab('output-sheets')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'output-sheets'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FiFileText className="w-3.5 h-3.5" /> Daily Output Sheets
          </button>
        </div>
      </div>

      {/* ================= TAB 1: EMPLOYEE WORKING HOURS & ATTENDANCE ================= */}
      {activeTab === 'working-hours' && (
        <div className="space-y-6">
          {/* Employee Self-View Summary Cards */}
          {!isManagerOrAdmin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600">
                  <FiClock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Today's Hours</div>
                  <div className="text-2xl font-black font-mono text-slate-900">
                    {myTodayHours > 0 ? `${myTodayHours} hrs` : myActiveSession ? 'Shift Active' : '0.0 hrs'}
                  </div>
                  <div className="text-[11px] text-indigo-600 font-medium mt-0.5">Calculated from login</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
                  <FiCalendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Days Worked (Month)</div>
                  <div className="text-2xl font-black font-mono text-emerald-600">
                    {myDaysWorkedMonth} Days
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">September 2026 total</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-600">
                  <FiFileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Monthly Total Hours</div>
                  <div className="text-2xl font-black font-mono text-purple-600">
                    {roundHours(myTotalMonthHours)} hrs
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">Net logged hours</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-cyan-50 text-cyan-600">
                  <FiUser className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Current Shift Status</div>
                  <div className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                    {myActiveSession ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span> Logged In
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                        Logged Out
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-1">Manual login/logout enabled</div>
                </div>
              </div>
            </div>
          )}

          {/* Manager / Admin Team Stats Banner */}
          {isManagerOrAdmin && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Total Logs</div>
                  <div className="text-xl font-bold font-mono text-slate-900">{filteredWorkSessions.length} Sessions</div>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Active Staff</div>
                  <div className="text-xl font-bold font-mono text-emerald-600">
                    {workSessions.filter((s) => s.status === 'Active').length} Logged In
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Total Hours Logged</div>
                  <div className="text-xl font-bold font-mono text-indigo-600">
                    {roundHours(filteredWorkSessions.reduce((acc, s) => acc + (s.total_hours || 0), 0))} hrs
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportToCSV}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <FiDownload className="w-4 h-4 text-indigo-600" /> Export CSV
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <FiPlus className="w-4 h-4" /> Add Manual Work Log
                </button>
              </div>
            </div>
          )}

          {/* Filter Bar & Working Hours Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4 overflow-hidden">
            <div className="p-5 pb-0 flex flex-col sm:flex-row items-center justify-between gap-4">
              {isManagerOrAdmin ? (
                <div className="relative flex-1 w-full sm:max-w-md">
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={whSearchTerm}
                    onChange={(e) => setWhSearchTerm(e.target.value)}
                    placeholder="Search by Employee Name or Email..."
                    className="w-full bg-slate-50 text-slate-800 pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <FiLock className="w-4 h-4 text-indigo-600" />
                  <span>My Working Hours Log (Read-only view)</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-600">Month:</span>
                  <input
                    type="month"
                    value={whMonthFilter}
                    onChange={(e) => setWhMonthFilter(e.target.value)}
                    className="bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-600">Date:</span>
                  <input
                    type="date"
                    value={whDateFilter}
                    onChange={(e) => setWhDateFilter(e.target.value)}
                    className="bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                  />
                  {whDateFilter && (
                    <button
                      onClick={() => setWhDateFilter('')}
                      className="text-indigo-600 text-xs font-semibold hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Read-Only Notice for Employees */}
            {!isManagerOrAdmin && (
              <div className="mx-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <FiLock className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  <strong>Notice:</strong> Working hours data is managed strictly by Managers and Admins. Employees can log in/out and review total calculated hours worked per shift.
                </span>
              </div>
            )}

            {/* Working Hours Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Login Time</th>
                    <th className="py-3 px-4">Logout Time</th>
                    <th className="py-3 px-4 text-center">Total Working Hours</th>
                    <th className="py-3 px-4 text-center">Shift Status</th>
                    <th className="py-3 px-4">Notes</th>
                    {isManagerOrAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
                  {filteredWorkSessions.length === 0 ? (
                    <tr>
                      <td colSpan={isManagerOrAdmin ? 8 : 7} className="py-8 text-center text-slate-400 text-xs">
                        No working hour session logs found for selected month / date filter.
                      </td>
                    </tr>
                  ) : (
                    filteredWorkSessions.map((session) => (
                      <tr key={session.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-500">{session.date}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div>{session.user_name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{session.user_email}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-emerald-700 font-semibold">
                          {formatTime(session.login_time)}
                        </td>
                        <td className="py-3 px-4 font-mono text-rose-700 font-semibold">
                          {session.logout_time ? formatTime(session.logout_time) : '-'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-extrabold text-indigo-700 text-sm">
                          {session.status === 'Active' ? (
                            <span className="text-emerald-600 animate-pulse font-sans text-xs">Shift Active</span>
                          ) : (
                            `${session.total_hours || 0} hrs`
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {session.status === 'Active' ? (
                            <span className="px-2.5 py-1 rounded-md text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Active
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md text-[11px] bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1">
                              <FiCheckCircle className="w-3 h-3 text-slate-500" /> Completed
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                          {session.notes || 'Shift Logged'}
                        </td>
                        {isManagerOrAdmin && (
                          <td className="py-3 px-4 text-right space-x-1">
                            <button
                              onClick={() => handleEdit(session)}
                              className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                              title="Edit Working Hour Log"
                            >
                              <FiEdit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(session.id)}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                              title="Delete Log"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: DAILY OUTPUT SHEETS ================= */}
      {activeTab === 'output-sheets' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4 overflow-hidden">
          <div className="p-5 pb-0 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full sm:max-w-md">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Editor, Client, or Job ID..."
                className="w-full bg-slate-50 text-slate-800 pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto text-xs text-slate-500">
              <FiCalendar className="w-4 h-4 text-indigo-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Role / Stage</th>
                  <th className="py-3 px-4">Job ID</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4 text-center">Files Processed</th>
                  <th className="py-3 px-4 text-center">Active Time</th>
                  <th className="py-3 px-4 text-center">Pause Duration</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
                {filteredSheets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                      No daily output logs found for selected date and filter.
                    </td>
                  </tr>
                ) : (
                  filteredSheets.map((sheet) => (
                    <tr key={sheet.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500">{sheet.date}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{sheet.editorName}</td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-indigo-700 border border-slate-200 font-mono text-[11px]">
                          {sheet.stage}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">#{sheet.jobId}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{sheet.client}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">
                        {sheet.filesProcessed}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-700">
                        {sheet.activeMinutes} mins
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-purple-700">
                        {sheet.pauseMinutes} mins
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2.5 py-1 rounded-md text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                          <FiCheckCircle className="w-3 h-3" /> {sheet.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for adding/editing work sessions (Manager/Admin) */}
      <WorkSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingSession={editingSession}
      />
    </div>
  );
}

// Helpers
function formatTime(isoStr) {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch (e) {
    return isoStr;
  }
}

function roundHours(val) {
  return Math.round((val || 0) * 10) / 10;
}
