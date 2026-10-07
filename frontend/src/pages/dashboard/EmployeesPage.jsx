import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import { useAuth } from '../../context/AuthContext';
import {
  FiUsers,
  FiSearch,
  FiPlus,
  FiKey,
  FiTrash2,
  FiShield,
  FiClock,
  FiMail,
  FiDownload,
  FiCheckCircle,
  FiCopy,
  FiCheck,
  FiSliders,
  FiFilter,
  FiActivity,
  FiX,
  FiBriefcase,
  FiArrowRight,
} from 'react-icons/fi';

export default function EmployeesPage() {
  const navigate = useNavigate();
  const { adminResetPassword, user: currentUser } = useAuth();
  const {
    editors,
    jobs,
    workSessions,
    addEmployee,
    deleteEmployee,
    userRole,
    canManageEmployees,
  } = useJobs();

  const isManagerOrAdmin = userRole === 'admin' || userRole === 'manager' || !!canManageEmployees;

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('ALL');
  const [shiftFilter, setShiftFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'OFFLINE'

  // Add Employee Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('Editor');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Password reset prompt state
  const [copiedEmail, setCopiedEmail] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Helper: Format official Emp ID
  const getEmpId = (emp, idx) => {
    if (emp.empId) return emp.empId;
    if (typeof emp.id === 'number') return `VE-${String(emp.id).padStart(3, '0')}`;
    const cleanNum = String(emp.id).replace(/\D/g, '');
    if (cleanNum && cleanNum.length <= 4) return `VE-${cleanNum.padStart(3, '0')}`;
    return `VE-${String(idx + 1).padStart(3, '0')}`;
  };

  // Helper: Get clean normalized designation
  const getNormalizedDesignation = (emp) => {
    const desig = emp.designation || emp.role || 'Editor';
    if (desig.trim().toLowerCase() === 'pather') return 'Path Editor';
    return desig;
  };

  // Map of active work sessions for live shift calculation
  const activeSessionsByEmail = useMemo(() => {
    const map = new Map();
    (workSessions || []).forEach((session) => {
      if (session.status === 'Active' && session.user_email) {
        map.set(session.user_email.toLowerCase().trim(), session);
      }
    });
    return map;
  }, [workSessions]);

  // Map of active job counts assigned per editor
  const activeJobsByEditor = useMemo(() => {
    const map = new Map();
    (jobs || []).forEach((job) => {
      Object.values(job.stages || {}).forEach((stage) => {
        if (stage?.assignee && stage?.status !== 'Complete') {
          const assigneeName = stage.assignee.trim();
          map.set(assigneeName, (map.get(assigneeName) || 0) + 1);
        }
      });
    });
    return map;
  }, [jobs]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return (editors || []).filter((emp, idx) => {
      const empId = getEmpId(emp, idx).toLowerCase();
      const name = (emp.name || '').toLowerCase();
      const email = (emp.email || '').toLowerCase();
      const desig = getNormalizedDesignation(emp).toLowerCase();
      const term = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !term ||
        name.includes(term) ||
        email.includes(term) ||
        empId.includes(term) ||
        desig.includes(term);

      const matchesDesignation =
        selectedDesignation === 'ALL' ||
        getNormalizedDesignation(emp).toLowerCase() === selectedDesignation.toLowerCase();

      const isActiveOnShift = activeSessionsByEmail.has((emp.email || '').toLowerCase().trim());
      const matchesShift =
        shiftFilter === 'ALL' ||
        (shiftFilter === 'ACTIVE' && isActiveOnShift) ||
        (shiftFilter === 'OFFLINE' && !isActiveOnShift);

      return matchesSearch && matchesDesignation && matchesShift;
    });
  }, [editors, searchTerm, selectedDesignation, shiftFilter, activeSessionsByEmail]);

  // Statistics
  const totalEmployees = editors.length;
  const activeOnShiftCount = editors.filter((e) =>
    activeSessionsByEmail.has((e.email || '').toLowerCase().trim())
  ).length;
  const pathEditorsCount = editors.filter(
    (e) => getNormalizedDesignation(e).toLowerCase() === 'path editor'
  ).length;
  const qcLeadsCount = editors.filter((e) =>
    ['qc lead', 'senior editor'].includes(getNormalizedDesignation(e).toLowerCase())
  ).length;

  // Handle Add Employee
  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;

    setIsAdding(true);
    try {
      const cleanName = newEmpName.trim();
      const cleanEmail =
        newEmpEmail.trim() ||
        `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'employee'}@aszen.com`;

      await addEmployee({
        name: cleanName,
        email: cleanEmail,
        designation: newEmpRole,
        role: newEmpRole,
        is_approved: true,
      });

      showToast(`Employee "${cleanName}" added successfully!`);
      setNewEmpName('');
      setNewEmpEmail('');
      setNewEmpRole('Path Editor');
      setIsAddModalOpen(false);
    } catch (err) {
      showToast('Failed to add employee', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  // Handle Copy
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Handle Reset Password
  const handleResetPassword = async (emp) => {
    const newPass = prompt(`Enter new password for ${emp.name}:`, 'Aszen@123');
    if (newPass) {
      try {
        await adminResetPassword(emp.id, newPass);
        showToast(`Password for ${emp.name} updated!`);
      } catch (e) {
        showToast(e.message || 'Failed to reset password', 'error');
      }
    }
  };

  // Handle Delete Employee
  const handleDeleteEmployee = (emp) => {
    if (window.confirm(`Are you sure you want to remove ${emp.name} (${getNormalizedDesignation(emp)}) from the personnel registry?`)) {
      deleteEmployee(emp.id);
      showToast(`Removed employee ${emp.name}`);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (editors.length === 0) {
      showToast('No employee records to export', 'error');
      return;
    }
    const headers = ['Emp ID', 'Full Name', 'Designation', 'Office Email', 'Shift Status', 'Active Tasks', 'Account Status'];
    const rows = editors.map((emp, idx) => {
      const empId = getEmpId(emp, idx);
      const name = emp.name || 'Unnamed';
      const desig = getNormalizedDesignation(emp);
      const email = emp.email || 'N/A';
      const isActive = activeSessionsByEmail.has((emp.email || '').toLowerCase().trim());
      const shiftStatus = isActive ? 'Active On Shift' : 'Off Duty';
      const tasks = activeJobsByEditor.get(emp.name) || 0;
      const status = emp.is_approved !== false ? 'Approved' : 'Restricted';
      return [
        `"${empId}"`,
        `"${name}"`,
        `"${desig}"`,
        `"${email}"`,
        `"${shiftStatus}"`,
        tasks,
        `"${status}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vistaeditz_employees_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Employee roster exported to CSV!');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-bounce ${
            toastMsg.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toastMsg.type === 'error' ? <FiX className="w-4 h-4" /> : <FiCheckCircle className="w-4 h-4" />}
          <span>{toastMsg.msg}</span>
        </div>
      )}

      {/* Page Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
            <FiUsers className="w-3.5 h-3.5" /> Workforce Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-sans tracking-tight">
            Employee Directory &amp; Staff Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Official roster of creative editors, path editors, QC leads, and system personnel.
            Manage employee IDs, official office emails, and live shift attendance.
          </p>
        </div>

        {/* Top Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            title="Download CSV Roster"
          >
            <FiDownload className="w-4 h-4" /> Export CSV
          </button>

          <Link
            to="/dashboard/management"
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all"
            title="Configure Permissions on Admin Panel"
          >
            <FiSliders className="w-4 h-4 text-indigo-400" /> Feature Permissions Panel
          </Link>

          {isManagerOrAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <FiPlus className="w-4 h-4" /> Add Employee
            </button>
          )}
        </div>
      </div>

      {/* Quick Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Staff</div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{totalEmployees}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Active personnel profiles</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            On Shift Now
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">{activeOnShiftCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Currently logged in</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Path Editors</div>
          <div className="text-2xl font-black text-indigo-600 mt-1 font-mono">{pathEditorsCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Pen tool &amp; path specialists</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">QC &amp; Senior Leads</div>
          <div className="text-2xl font-black text-purple-600 mt-1 font-mono">{qcLeadsCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Quality check &amp; seniors</div>
        </div>
      </div>

      {/* Search, Filter & Controls Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by Emp ID, Name, Designation, or Office Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* Designation Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-semibold text-[11px]">Role:</span>
            <select
              value={selectedDesignation}
              onChange={(e) => setSelectedDesignation(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All Roles</option>
              <option value="Path Editor">Path Editor</option>
              <option value="Editor">Editor</option>
              <option value="Senior Editor">Senior Editor</option>
              <option value="QC Lead">QC Lead</option>
              <option value="Manager">Manager</option>
              <option value="Developer">Developer</option>
            </select>
          </div>

          {/* Shift Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-semibold text-[11px]">Shift:</span>
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">🟢 On Shift</option>
              <option value="OFFLINE">⚪ Off Duty</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table Listing */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <span>Personnel Directory</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold">
              {filteredEmployees.length} {filteredEmployees.length === 1 ? 'Record' : 'Records'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Showing official office details &amp; active shift indicators
          </span>
        </div>

        {filteredEmployees.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <FiUsers className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
            <div className="text-sm font-bold text-slate-700">No personnel records found</div>
            <div className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchTerm || selectedDesignation !== 'ALL' || shiftFilter !== 'ALL'
                ? 'Try adjusting your search criteria or resetting filters.'
                : 'No registered employees exist yet. Add your first team member above!'}
            </div>
            {(searchTerm || selectedDesignation !== 'ALL' || shiftFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDesignation('ALL');
                  setShiftFilter('ALL');
                }}
                className="mt-2 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto mobile-touch-scroll">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Emp ID</th>
                  <th className="py-3.5 px-4 sm:px-6">Employee Name</th>
                  <th className="py-3.5 px-4 sm:px-6">Designation</th>
                  <th className="py-3.5 px-4 sm:px-6">Mail ID (Office)</th>
                  <th className="py-3.5 px-4 sm:px-6">Shift Status</th>
                  <th className="py-3.5 px-4 sm:px-6">Active Tasks</th>
                  {isManagerOrAdmin && <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredEmployees.map((emp, idx) => {
                  const empId = getEmpId(emp, idx);
                  const desig = getNormalizedDesignation(emp);
                  const activeSession = activeSessionsByEmail.get((emp.email || '').toLowerCase().trim());
                  const activeTasks = activeJobsByEditor.get(emp.name) || 0;
                  const isApproved = emp.is_approved !== false;
                  const isDev = desig.toLowerCase() === 'developer';

                  return (
                    <tr key={emp.id || idx} className="hover:bg-indigo-50/20 transition-colors group">
                      {/* 1. Emp ID */}
                      <td className="py-4 px-4 sm:px-6 font-mono font-bold text-indigo-600">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-xs font-mono font-extrabold text-indigo-700 shadow-2xs">
                          {empId}
                        </span>
                      </td>

                      {/* 2. Employee Name with Avatar */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                              {emp.name ? emp.name.charAt(0).toUpperCase() : 'E'}
                            </div>
                            {activeSession && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" title="Active on shift" />
                            )}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                              {emp.name}
                              {isApproved ? (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Approved
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  Restricted
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {isDev ? 'Core Developer' : 'Creative Studio Staff'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Designation Badge (Always 'Path Editor' if pather) */}
                      <td className="py-4 px-4 sm:px-6">
                        {desig === 'Path Editor' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/90 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            Path Editor
                          </span>
                        ) : desig === 'QC Lead' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                            QC Lead
                          </span>
                        ) : desig === 'Senior Editor' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Senior Editor
                          </span>
                        ) : desig === 'Manager' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Manager
                          </span>
                        ) : desig === 'Developer' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-50 text-cyan-800 border border-cyan-300 shadow-2xs">
                            💻 Developer
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            {desig}
                          </span>
                        )}
                      </td>

                      {/* 4. Mail ID (Office) */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <FiMail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <a
                            href={`mailto:${emp.email}`}
                            className="font-medium text-slate-700 hover:text-indigo-600 transition-colors truncate max-w-[200px]"
                            title={emp.email}
                          >
                            {emp.email || 'No email registered'}
                          </a>
                          {emp.email && (
                            <button
                              onClick={() => handleCopy(emp.email)}
                              className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded hover:bg-slate-100"
                              title="Copy email address"
                            >
                              {copiedEmail === emp.email ? (
                                <FiCheck className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <FiCopy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 5. Shift & Attendance Status */}
                      <td className="py-4 px-4 sm:px-6">
                        {activeSession ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            On Shift
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            Off Duty
                          </span>
                        )}
                      </td>

                      {/* 6. Active Tasks Count */}
                      <td className="py-4 px-4 sm:px-6">
                        {activeTasks > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {activeTasks} Active
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">None</span>
                        )}
                      </td>

                      {/* 7. Actions */}
                      {isManagerOrAdmin && (
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Reset Password */}
                            <button
                              onClick={() => handleResetPassword(emp)}
                              className="p-2 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-400 hover:text-amber-600 border border-slate-200/80 hover:border-amber-200 transition-colors cursor-pointer"
                              title="Reset Password"
                            >
                              <FiKey className="w-3.5 h-3.5" />
                            </button>

                            {/* Jump to Permissions */}
                            <Link
                              to="/dashboard/management"
                              className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 border border-slate-200/80 hover:border-indigo-200 transition-colors"
                              title="Assign / View Permissions in Admin Panel"
                            >
                              <FiSliders className="w-3.5 h-3.5" />
                            </Link>

                            {/* Delete Employee */}
                            <button
                              onClick={() => handleDeleteEmployee(emp)}
                              className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 transition-colors cursor-pointer"
                              title="Delete Employee Record"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                <FiPlus className="w-5 h-5 text-indigo-600" />
                <span>Register New Employee</span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Tejas, Swetha, Rahul"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                <select
                  value={newEmpRole}
                  onChange={(e) => setNewEmpRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white cursor-pointer"
                >
                  <option value="Path Editor">Path Editor</option>
                  <option value="Editor">Editor</option>
                  <option value="Senior Editor">Senior Editor</option>
                  <option value="QC Lead">QC Lead</option>
                  <option value="Manager">Manager</option>
                  <option value="Developer">Developer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mail ID (Office) <span className="text-slate-400 font-normal">(Auto-generated if empty)</span>
                </label>
                <input
                  type="email"
                  placeholder={
                    newEmpName
                      ? `${newEmpName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'employee'}@aszen.com`
                      : 'employee@aszen.com'
                  }
                  value={newEmpEmail}
                  onChange={(e) => setNewEmpEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-[11px] text-indigo-800">
                Default password will be set to <strong className="font-mono">Aszen@123</strong>. The employee can change it upon initial login.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {isAdding ? 'Saving...' : 'Save Employee Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
