import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import { useAuth } from '../../context/AuthContext';
import WorkSessionModal from '../../components/dashboard/WorkSessionModal';
import ExportPdfModal from '../../components/dashboard/ExportPdfModal';
import ImportProductionModal from '../../components/dashboard/ImportProductionModal';
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
  FiPrinter,
  FiUploadCloud,
  FiLayers,
  FiBriefcase,
} from 'react-icons/fi';
import { getOperationalDate, formatDateDMY, formatOperationalShiftLabel, formatTime } from '../../utils/dateUtils';
import DatePickerDMY from '../../components/common/DatePickerDMY';
import StatusChip from '../../components/common/StatusChip';
import CopyableText from '../../components/common/CopyableText';
import EmptyState from '../../components/common/EmptyState';

export default function ProductionSheetsPage() {
  const {
    productionSheets,
    workSessions,
    deleteWorkSession,
    userRole,
    canManageWorkHours,
    operationalDate,
    importProductionSheets,
    clients,
  } = useJobs();
  const { user } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(() => (tabParam === 'output-sheets' ? 'output-sheets' : 'working-hours'));

  // Sync tab state when URL query parameter changes
  useEffect(() => {
    if (tabParam === 'output-sheets' || tabParam === 'working-hours') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Output Sheets Sub-Tab: 'all-sheets' | 'client-wise'
  const [outputSubTab, setOutputSubTab] = useState('all-sheets');

  // Client-Wise selection state
  const [selectedClientCode, setSelectedClientCode] = useState(() => {
    return (clients && clients.length > 0 ? clients[0].code : 'BE');
  });

  // Client filter for "All Production Sheet" tab
  const [allTabClientFilter, setAllTabClientFilter] = useState('ALL');

  // Search & Filter state for Output Sheets
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => getOperationalDate());

  // Search & Filter state for Working Hours (defaults strictly to today's 6:00 AM - 5:59 AM operational day)
  const [whSearchTerm, setWhSearchTerm] = useState('');
  const [whDateFilter, setWhDateFilter] = useState(() => getOperationalDate());
  const [whMonthFilter, setWhMonthFilter] = useState(() => new Date().toISOString().slice(0, 7));

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const isManagerOrAdmin = userRole === 'admin' || userRole === 'manager' || !!canManageWorkHours;
  const currentUserEmail = (user?.email || '').toLowerCase();
  const currentUserName = user?.name || (user?.email ? user.email.split('.')[0] : 'Employee');

  // Consolidated client list (merges registered clients with any ad-hoc clients present in sheets)
  const availableClients = useMemo(() => {
    const list = Array.isArray(clients) ? [...clients] : [];
    const knownCodes = new Set(list.map((c) => (c.code || '').toUpperCase()));

    (productionSheets || []).forEach((s) => {
      const code = (s.client || '').trim().toUpperCase();
      if (code && !knownCodes.has(code)) {
        knownCodes.add(code);
        list.push({ id: `auto-${code}`, code: code, name: `Client ${code}` });
      }
    });

    if (list.length === 0) {
      return [{ id: 1, code: 'BE', name: 'Bright Estate Media' }];
    }
    return list;
  }, [clients, productionSheets]);

  // Count logged output sheets per client for badge statistics
  const clientSheetCounts = useMemo(() => {
    const counts = {};
    (productionSheets || []).forEach((s) => {
      const c = (s.client || 'BE').toUpperCase();
      counts[c] = (counts[c] || 0) + 1;
    });
    return counts;
  }, [productionSheets]);

  // Ensure selectedClientCode always falls back to a valid client
  const activeClientCode = useMemo(() => {
    if (selectedClientCode && availableClients.some((c) => c.code.toUpperCase() === selectedClientCode.toUpperCase())) {
      return selectedClientCode;
    }
    return availableClients[0]?.code || 'BE';
  }, [selectedClientCode, availableClients]);

  // --- Output Sheets Filtering: All Sheets Tab ---
  const allFilteredSheets = useMemo(() => {
    return (productionSheets || []).filter((sheet) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (sheet.editorName || '').toLowerCase().includes(term) ||
        (sheet.client || '').toLowerCase().includes(term) ||
        (sheet.jobId || '').toLowerCase().includes(term) ||
        (sheet.propertyName || '').toLowerCase().includes(term) ||
        (sheet.service || '').toLowerCase().includes(term) ||
        (sheet.comments || '').toLowerCase().includes(term);

      const sheetDate = sheet.inputDate || sheet.date || '';
      const matchesDate = !selectedDate || sheetDate === selectedDate;

      const matchesClient =
        allTabClientFilter === 'ALL' ||
        (sheet.client || '').toUpperCase() === allTabClientFilter.toUpperCase();

      return matchesSearch && matchesDate && matchesClient;
    });
  }, [productionSheets, searchTerm, selectedDate, allTabClientFilter]);

  // --- Output Sheets Filtering: Client-Wise Tab ---
  const clientFilteredSheets = useMemo(() => {
    return (productionSheets || []).filter((sheet) => {
      const sheetClient = (sheet.client || 'BE').toUpperCase();
      const matchesClient = sheetClient === activeClientCode.toUpperCase();
      if (!matchesClient) return false;

      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (sheet.editorName || '').toLowerCase().includes(term) ||
        (sheet.jobId || '').toLowerCase().includes(term) ||
        (sheet.propertyName || '').toLowerCase().includes(term) ||
        (sheet.service || '').toLowerCase().includes(term) ||
        (sheet.comments || '').toLowerCase().includes(term);

      const sheetDate = sheet.inputDate || sheet.date || '';
      const matchesDate = !selectedDate || sheetDate === selectedDate;

      return matchesSearch && matchesDate;
    });
  }, [productionSheets, activeClientCode, searchTerm, selectedDate]);

  // Active sheets depending on active sub-tab
  const activeDisplaySheets = outputSubTab === 'client-wise' ? clientFilteredSheets : allFilteredSheets;

  // Aggregate Metrics for All Sheets Tab
  const allTotalFiles = useMemo(
    () =>
      allFilteredSheets.reduce(
        (acc, s) => acc + (Number(s.numberOfImages !== undefined ? s.numberOfImages : s.filesProcessed) || 0),
        0
      ),
    [allFilteredSheets]
  );
  const allTotalActiveMins = useMemo(
    () => allFilteredSheets.reduce((acc, s) => acc + (s.activeMinutes || 0), 0),
    [allFilteredSheets]
  );

  // Aggregate Metrics for Client-Wise Tab
  const clientTotalFiles = useMemo(
    () =>
      clientFilteredSheets.reduce(
        (acc, s) => acc + (Number(s.numberOfImages !== undefined ? s.numberOfImages : s.filesProcessed) || 0),
        0
      ),
    [clientFilteredSheets]
  );
  const clientTotalActiveMins = useMemo(
    () => clientFilteredSheets.reduce((acc, s) => acc + (s.activeMinutes || 0), 0),
    [clientFilteredSheets]
  );

  // Active summary KPI metrics to display
  const displayTotalSheets = outputSubTab === 'client-wise' ? clientFilteredSheets.length : allFilteredSheets.length;
  const displayTotalFiles = outputSubTab === 'client-wise' ? clientTotalFiles : allTotalFiles;
  const displayTotalActiveMins = outputSubTab === 'client-wise' ? clientTotalActiveMins : allTotalActiveMins;

  // Active client object for name display
  const activeClientObj = useMemo(() => {
    return availableClients.find((c) => c.code.toUpperCase() === activeClientCode.toUpperCase()) || {
      code: activeClientCode,
      name: `Client ${activeClientCode}`,
    };
  }, [availableClients, activeClientCode]);

  // --- Working Hours Filtering (Memoized) ---
  const filteredWorkSessions = useMemo(() => {
    return workSessions.filter((session) => {
      const sEmail = (session.user_email || '').toLowerCase();
      const sName = (session.user_name || '').toLowerCase();

      // Master Admin & Admin management authority accounts are excluded from working hours attendance records
      if (['arun@aszen.com', 'gokul@aszen.com'].includes(sEmail) || (session.user_role || '').toLowerCase() === 'admin') return false;

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

      const sessionOpDate = session.date || (session.login_time ? getOperationalDate(session.login_time) : '');
      if (whDateFilter && sessionOpDate !== whDateFilter) return false;
      if (whMonthFilter && sessionOpDate && !sessionOpDate.startsWith(whMonthFilter)) return false;

      return true;
    });
  }, [workSessions, isManagerOrAdmin, currentUserEmail, currentUserName, whSearchTerm, whDateFilter, whMonthFilter]);

  // --- Employee Statistics Calculation (Memoized) ---
  const mySessions = useMemo(() => {
    return workSessions.filter((s) => {
      const sEmail = (s.user_email || '').toLowerCase();
      const sName = (s.user_name || '').toLowerCase();
      return sEmail === currentUserEmail || sName.includes(currentUserName.toLowerCase());
    });
  }, [workSessions, currentUserEmail, currentUserName]);

  const todayStr = useMemo(() => getOperationalDate(), []);
  const currentMonthStr = useMemo(() => todayStr.slice(0, 7), [todayStr]);
  const monthDisplayName = useMemo(() => new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' }), []);

  // Today's hours (calculated strictly based on active operational shift: 06:00 AM - 05:59 AM)
  const myTodaySessions = useMemo(() => {
    return mySessions.filter((s) => (s.date || (s.login_time ? getOperationalDate(s.login_time) : '')) === todayStr);
  }, [mySessions, todayStr]);
  const myTodayHours = useMemo(() => myTodaySessions.reduce((acc, s) => acc + (s.total_hours || 0), 0), [myTodaySessions]);

  // Days worked in current month
  const myMonthSessions = useMemo(() => {
    return mySessions.filter((s) => (s.date || '').startsWith(currentMonthStr));
  }, [mySessions, currentMonthStr]);
  const myDaysWorkedMonth = useMemo(() => new Set(myMonthSessions.map((s) => s.date)).size, [myMonthSessions]);
  const myTotalMonthHours = useMemo(() => myMonthSessions.reduce((acc, s) => acc + (s.total_hours || 0), 0), [myMonthSessions]);

  // Active shift for current user
  const myActiveSession = useMemo(() => mySessions.find((s) => s.status === 'Active'), [mySessions]);

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

  const escapeCsvVal = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Employee', 'Email', 'Role', 'Login Time', 'Logout Time', 'Total Hours', 'Status', 'Notes'];
    const rows = filteredWorkSessions.map((s) => [
      escapeCsvVal(s.date || ''),
      escapeCsvVal(s.user_name || ''),
      escapeCsvVal(s.user_email || ''),
      escapeCsvVal(s.user_role || ''),
      escapeCsvVal(formatTime(s.login_time)),
      escapeCsvVal(formatTime(s.logout_time)),
      s.total_hours || 0,
      escapeCsvVal(s.status || ''),
      escapeCsvVal(s.notes || ''),
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `working_hours_sheet_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const exportProductionSheetsToCSV = () => {
    const dataToExport = outputSubTab === 'client-wise' ? clientFilteredSheets : allFilteredSheets;
    const fileLabel = outputSubTab === 'client-wise'
      ? `client_${activeClientCode}_${selectedDate || 'all'}`
      : `all_clients_${allTabClientFilter !== 'ALL' ? allTabClientFilter + '_' : ''}${selectedDate || 'all'}`;

    const headers = [
      'Input Date',
      'Property name',
      'Service',
      'Number Of Images',
      'Comments',
      'Job ID',
      'Client',
      'Editor Name',
      'Role/Stage',
      'Active Minutes',
      'Status',
    ];
    const rows = dataToExport.map((s) => [
      escapeCsvVal(s.inputDate || s.date || ''),
      escapeCsvVal(s.propertyName || s.name || 'untitled folder'),
      escapeCsvVal(s.service || s.stage || 'RE Editing'),
      s.numberOfImages !== undefined ? s.numberOfImages : s.filesProcessed || 0,
      escapeCsvVal(s.comments || ''),
      escapeCsvVal(s.jobId ? `#${s.jobId}` : ''),
      escapeCsvVal(s.client || ''),
      escapeCsvVal(s.editorName || ''),
      escapeCsvVal(s.role || s.stage || ''),
      s.activeMinutes || 0,
      escapeCsvVal(s.status || 'Verified'),
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `production_sheet_${fileLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleTabChange('working-hours')}
            className={`px-4 py-2.5 sm:py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[40px] cursor-pointer ${
              activeTab === 'working-hours'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FiClock className="w-3.5 h-3.5" /> Working Hours & Attendance
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('output-sheets')}
            className={`px-4 py-2.5 sm:py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[40px] cursor-pointer ${
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
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">{monthDisplayName} total</div>
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
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FiDownload className="w-4 h-4 text-indigo-600" /> Export CSV
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
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
                    className="bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-slate-600">Date:</span>
                  <div className="w-32">
                    <DatePickerDMY
                      value={whDateFilter}
                      onChange={(d) => setWhDateFilter(d)}
                      className="bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setWhDateFilter(getOperationalDate())}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      whDateFilter === getOperationalDate()
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Filter to today's active shift (06:00 AM - 05:59 AM)"
                  >
                    Today's Shift
                  </button>
                  {whDateFilter && (
                    <button
                      type="button"
                      onClick={() => setWhDateFilter('')}
                      className="text-slate-500 hover:text-slate-800 text-xs font-semibold hover:underline cursor-pointer ml-1"
                      title="Show all records for selected month"
                    >
                      All Month
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Active Filter Notice */}
            <div className="mx-5 px-3 py-2 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-900 text-xs flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 font-medium">
                <FiClock className="w-3.5 h-3.5 text-indigo-600" />
                {whDateFilter ? (
                  <span>
                    Viewing records for <strong>{formatOperationalShiftLabel(whDateFilter)}</strong>
                  </span>
                ) : (
                  <span>
                    Viewing all records for month <strong>{whMonthFilter}</strong> ({filteredWorkSessions.length} sessions)
                  </span>
                )}
              </span>
              {whDateFilter !== getOperationalDate() && (
                <button
                  type="button"
                  onClick={() => setWhDateFilter(getOperationalDate())}
                  className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                >
                  Reset to Today's Shift
                </button>
              )}
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

            {/* Working Hours Table with 2-axis scrolling */}
            <div className="overflow-x-auto overflow-y-auto max-h-[580px] custom-scrollbar touch-pan-x touch-pan-y" data-lenis-prevent>
              <table className="w-full text-left text-xs min-w-[780px]">
                <thead className="sticky top-0 z-10 bg-slate-900 text-white uppercase tracking-wider font-semibold border-b border-slate-800 shadow-xs">
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
                      <td colSpan={isManagerOrAdmin ? 8 : 7} className="py-8">
                        <EmptyState
                          icon="clock"
                          title="No working hours logged"
                          description={
                            whDateFilter
                              ? `No active shift or session records found for ${formatDateDMY(whDateFilter)}.`
                              : `No sessions recorded for month ${whMonthFilter}.`
                          }
                          actionLabel={whDateFilter !== getOperationalDate() ? "Reset to Today's Shift" : undefined}
                          onAction={whDateFilter !== getOperationalDate() ? () => setWhDateFilter(getOperationalDate()) : undefined}
                        />
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
                          <StatusChip status={session.status === 'Active' ? 'Active' : 'Completed'} />
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                          {session.notes || 'Shift Logged'}
                        </td>
                        {isManagerOrAdmin && (
                          <td className="py-3 px-4 text-right space-x-1">
                            <button
                              onClick={() => handleEdit(session)}
                              className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer"
                              title="Edit Working Hour Log"
                            >
                              <FiEdit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(session.id)}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
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
        <div className="space-y-6">
          {/* Sub-Tabs: All Production Sheet vs. Client-Wise Production */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setOutputSubTab('all-sheets')}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  outputSubTab === 'all-sheets'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <FiLayers className="w-4 h-4" /> All Production Sheet
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    outputSubTab === 'all-sheets' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {productionSheets.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOutputSubTab('client-wise')}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  outputSubTab === 'client-wise'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <FiBriefcase className="w-4 h-4" /> Client-Wise Production
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    outputSubTab === 'client-wise' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {availableClients.length} Clients
                </span>
              </button>
            </div>

            <div className="text-xs text-slate-500 px-3 py-1 font-medium hidden md:block">
              {outputSubTab === 'all-sheets'
                ? 'Consolidated view across all client output sheets'
                : `Dedicated view & import for client [${activeClientCode}] - ${activeClientObj.name}`}
            </div>
          </div>

          {/* CLIENT-WISE SUB-TAB: Interactive Client Workspace Pills */}
          {outputSubTab === 'client-wise' && (
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiBriefcase className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Select Client Workspace
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  Click a client to view records, export dedicated reports, or import data
                </span>
              </div>

              {/* Horizontal Scrollable Client Badges */}
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar">
                {availableClients.map((c) => {
                  const isSelected = activeClientCode.toUpperCase() === c.code.toUpperCase();
                  const count = clientSheetCounts[c.code.toUpperCase()] || 0;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setSelectedClientCode(c.code)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg text-[10px] font-black font-mono flex items-center justify-center ${
                          isSelected ? 'bg-indigo-700 text-white' : 'bg-white text-indigo-700 border border-slate-200'
                        }`}
                      >
                        {c.code}
                      </span>
                      <span>{c.name || `Client ${c.code}`}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isSelected ? 'bg-indigo-500/50 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Daily Output Summary Cards (Dynamic Scoped Values) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600">
                <FiFileText className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  {outputSubTab === 'client-wise' ? `[${activeClientCode}] Sheets Logged` : 'Total Output Sheets'}
                </div>
                <div className="text-2xl font-black font-mono text-slate-900">{displayTotalSheets}</div>
                <div className="text-[11px] text-indigo-600 font-medium mt-0.5">
                  {outputSubTab === 'client-wise' ? `For ${activeClientObj.name}` : 'Across all clients'}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
                <FiCheckCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  {outputSubTab === 'client-wise' ? `[${activeClientCode}] Files Processed` : 'Files Processed'}
                </div>
                <div className="text-2xl font-black font-mono text-emerald-600">{displayTotalFiles}</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Total output count</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-600">
                <FiClock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  {outputSubTab === 'client-wise' ? `[${activeClientCode}] Active Time` : 'Total Active Time'}
                </div>
                <div className="text-2xl font-black font-mono text-purple-600">{displayTotalActiveMins} mins</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {Math.round((displayTotalActiveMins / 60) * 10) / 10} hours total
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar & Production Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4 overflow-hidden">
            <div className="p-5 pb-0 flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:max-w-xl">
                <div className="relative flex-1 w-full">
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={
                      outputSubTab === 'client-wise'
                        ? `Search within [${activeClientCode}] by Editor, Property, or Job ID...`
                        : 'Search by Editor, Client, Property, or Job ID...'
                    }
                    className="w-full bg-slate-50 text-slate-800 pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Client Dropdown Filter in All Sheets View */}
                {outputSubTab === 'all-sheets' && (
                  <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
                    <FiBriefcase className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <select
                      value={allTabClientFilter}
                      onChange={(e) => setAllTabClientFilter(e.target.value)}
                      className="bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer w-full sm:w-auto"
                      title="Filter All Production Sheets by Client"
                    >
                      <option value="ALL">All Clients ({productionSheets.length})</option>
                      {availableClients.map((c) => (
                        <option key={c.code} value={c.code}>
                          [{c.code}] {c.name} ({clientSheetCounts[c.code.toUpperCase()] || 0})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Date & Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto text-xs text-slate-500 justify-start lg:justify-end">
                <FiCalendar className="w-4 h-4 text-indigo-600" />
                <div className="w-32">
                  <DatePickerDMY
                    value={selectedDate}
                    onChange={(d) => setSelectedDate(d)}
                    className="bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDate(getOperationalDate())}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedDate === getOperationalDate()
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Filter to today's active shift (06:00 AM - 05:59 AM)"
                >
                  Today's Shift
                </button>
                {selectedDate && (
                  <button
                    type="button"
                    onClick={() => setSelectedDate('')}
                    className="text-slate-500 hover:text-slate-800 text-xs font-semibold hover:underline px-1 cursor-pointer"
                  >
                    All History
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
                  title={
                    outputSubTab === 'client-wise'
                      ? `Import previous data directly into Client [${activeClientCode}]`
                      : 'Import previous production sheets'
                  }
                >
                  <FiUploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Import {outputSubTab === 'client-wise' ? `[${activeClientCode}] Data` : 'Previous Data'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsExportPdfOpen(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
                  title="Export selected columns to PDF"
                >
                  <FiPrinter className="w-3.5 h-3.5" /> Export PDF
                </button>

                <button
                  type="button"
                  onClick={exportProductionSheetsToCSV}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
                  title="Export sheets to CSV"
                >
                  <FiDownload className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>
            </div>

            {/* Scope Information Bar */}
            <div className="mx-5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-700">
                  {outputSubTab === 'client-wise' ? `Client Workspace: [${activeClientCode}] ${activeClientObj.name}` : 'Consolidated All Clients View'}
                </span>
                <span className="text-slate-400">•</span>
                <span>
                  Showing <strong>{activeDisplaySheets.length}</strong> matching entries
                  {selectedDate ? ` for date ${formatDateDMY(selectedDate)}` : ' (All Dates)'}
                </span>
              </div>
              {outputSubTab === 'client-wise' && (
                <button
                  type="button"
                  onClick={() => setOutputSubTab('all-sheets')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                >
                  Switch to Consolidated View
                </button>
              )}
            </div>

            {/* Daily Output Sheets Table with 2-axis scrolling */}
            <div className="overflow-x-auto overflow-y-auto max-h-[580px] custom-scrollbar touch-pan-x touch-pan-y" data-lenis-prevent>
              <table className="w-full text-left text-xs min-w-[1050px]">
                <thead className="sticky top-0 z-10 bg-slate-900 text-white uppercase tracking-wider font-semibold border-b border-slate-800 shadow-xs text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Input Date</th>
                    <th className="py-3 px-4 min-w-[160px]">Property name</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4 text-center">Number Of Images</th>
                    <th className="py-3 px-4 min-w-[140px]">Comments</th>
                    <th className="py-3 px-3">Job ID</th>
                    <th className="py-3 px-3">Client</th>
                    <th className="py-3 px-4">Editor Name</th>
                    <th className="py-3 px-3 text-center">Active Time</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
                  {activeDisplaySheets.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8">
                        <EmptyState
                          icon="document"
                          title={
                            outputSubTab === 'client-wise'
                              ? `No output sheets for Client [${activeClientCode}]`
                              : 'No daily output sheets found'
                          }
                          description={
                            searchTerm
                              ? `No records match "${searchTerm}". Try adjusting your search.`
                              : outputSubTab === 'client-wise'
                              ? `No output entries have been logged or imported for ${activeClientObj.name} yet.`
                              : 'No daily production output logs found for this date.'
                          }
                          actionLabel={
                            searchTerm
                              ? 'Clear Search'
                              : outputSubTab === 'client-wise'
                              ? `Import [${activeClientCode}] Data`
                              : undefined
                          }
                          onAction={
                            searchTerm
                              ? () => setSearchTerm('')
                              : outputSubTab === 'client-wise'
                              ? () => setIsImportModalOpen(true)
                              : undefined
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    activeDisplaySheets.map((sheet) => (
                      <tr key={sheet.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                          {sheet.inputDate || sheet.date}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <CopyableText text={sheet.propertyName || sheet.name || 'untitled folder'} className="font-bold text-slate-900" />
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-indigo-700 border border-slate-200 font-mono text-[11px] font-semibold whitespace-nowrap">
                            {sheet.service || sheet.stage || 'RE Editing'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-extrabold text-emerald-700 text-sm">
                          {sheet.numberOfImages !== undefined ? sheet.numberOfImages : sheet.filesProcessed || 0}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px] max-w-[180px] truncate" title={sheet.comments}>
                          {sheet.comments || '—'}
                        </td>
                        <td className="py-3 px-3">
                          {sheet.jobId ? (
                            <CopyableText text={sheet.jobId} prefix="#" className="text-indigo-600 font-bold font-mono" />
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {sheet.client ? (
                            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[11px] font-bold border border-indigo-200">
                              {sheet.client}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-medium">
                          {sheet.editorName || 'Staff'}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-600 whitespace-nowrap">
                          {sheet.activeMinutes || 0} mins
                        </td>
                        <td className="py-3 px-4 text-right">
                          <StatusChip status={sheet.status || 'Verified'} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal for adding/editing work sessions (Manager/Admin) */}
      <WorkSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingSession={editingSession}
      />

      {/* Modal for Exporting PDF with Selectable Fields */}
      <ExportPdfModal
        isOpen={isExportPdfOpen}
        onClose={() => setIsExportPdfOpen(false)}
        data={activeDisplaySheets}
        defaultTitle={
          outputSubTab === 'client-wise'
            ? `Client [${activeClientCode}] - Production Sheet${selectedDate ? ` - ${formatDateDMY(selectedDate)}` : ''}`
            : allTabClientFilter !== 'ALL'
            ? `Client [${allTabClientFilter}] - Production Sheet${selectedDate ? ` - ${formatDateDMY(selectedDate)}` : ''}`
            : `All Clients - Production Sheet${selectedDate ? ` - ${formatDateDMY(selectedDate)}` : ''}`
        }
      />

      {/* Modal for Importing Previous Production Data */}
      <ImportProductionModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={importProductionSheets}
        defaultClientCode={
          outputSubTab === 'client-wise'
            ? activeClientCode
            : allTabClientFilter !== 'ALL'
            ? allTabClientFilter
            : 'BE'
        }
        isClientLocked={outputSubTab === 'client-wise'}
      />
    </div>
  );
}

// Helpers
function roundHours(val) {
  return Math.round((val || 0) * 10) / 10;
}
