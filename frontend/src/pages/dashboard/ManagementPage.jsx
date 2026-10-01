import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  FiPlus,
  FiTrash2,
  FiUsers,
  FiBriefcase,
  FiArrowLeft,
  FiShield,
  FiKey,
  FiSliders,
  FiChevronDown,
  FiChevronUp,
  FiCheck,
  FiAlertCircle,
  FiCheckSquare,
  FiSquare,
  FiLock,
  FiUnlock,
  FiTerminal,
  FiCpu,
  FiDatabase,
  FiRefreshCw,
  FiServer,
  FiActivity,
} from 'react-icons/fi';

const PERMISSION_CONFIGS = [
  {
    key: 'can_create_job',
    title: 'Create Production Jobs',
    desc: 'Unlocks New Job button and job creation form for incoming orders.',
    icon: '🚀',
    badge: 'Job Creator',
  },
  {
    key: 'can_edit_job',
    title: 'Edit & Reassign Jobs',
    desc: 'Allows modifying targets, details, and assigning/reassigning pipeline stages.',
    icon: '✏️',
    badge: 'Job Editor',
  },
  {
    key: 'can_create_employee',
    title: 'Create & Manage Employees',
    desc: 'Allows adding new team personnel records and managing team members.',
    icon: '👥',
    badge: 'Personnel Mgr',
  },
  {
    key: 'can_delete_job',
    title: 'Delete Jobs',
    desc: 'Allows deleting jobs and removing them permanently from the system.',
    icon: '🗑️',
    badge: 'Job Deletion',
  },
  {
    key: 'can_manage_clients',
    title: 'Register & Manage Clients',
    desc: 'Allows creating new client codes and removing client accounts.',
    icon: '🏢',
    badge: 'Client Mgr',
  },
  {
    key: 'can_manage_work_hours',
    title: 'Manage Working Hours & Shifts',
    desc: 'Allows adding manual shift logs and adjusting employee attendance.',
    icon: '⏱️',
    badge: 'Shift Mgr',
  },
];

export default function ManagementPage() {
  const navigate = useNavigate();
  const { adminResetPassword, user: currentUser } = useAuth();
  const {
    editors,
    clients,
    addClient,
    deleteClient,
    addEmployee,
    deleteEmployee,
    updateEmployeePermissions,
    userRole,
  } = useJobs();

  const [activeTab, setActiveTab] = useState('employees'); // 'employees' | 'clients'

  // New Employee Form
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState('Editor');
  const [empEmail, setEmpEmail] = useState('');
  const [empInitialPerms, setEmpInitialPerms] = useState({
    can_create_job: false,
    can_edit_job: false,
    can_create_employee: false,
    can_delete_job: false,
    can_manage_clients: false,
    can_manage_work_hours: false,
  });

  const handleEmpRoleChange = (role) => {
    setEmpRole(role);
    if (role === 'Developer') {
      setEmpInitialPerms({
        can_create_job: false,
        can_edit_job: false,
        can_create_employee: false,
        can_delete_job: false,
        can_manage_clients: false,
        can_manage_work_hours: false,
      });
    }
  };

  // Developer Diagnostics State
  const [devPingStatus, setDevPingStatus] = useState(null);
  const [devTesting, setDevTesting] = useState(false);

  const testBackendHealth = async () => {
    setDevTesting(true);
    const start = Date.now();
    try {
      const res = await api.get('/clients');
      const latency = Date.now() - start;
      setDevPingStatus({
        ok: true,
        status: res.status,
        latency,
        time: new Date().toLocaleTimeString(),
        clientCount: Array.isArray(res.data?.clients) ? res.data.clients.length : 0,
      });
      showToast(`Backend connection healthy! Ping: ${latency}ms`);
    } catch (e) {
      setDevPingStatus({
        ok: false,
        error: e.message || 'Connection failed',
        time: new Date().toLocaleTimeString(),
      });
      showToast('Backend health test failed', 'error');
    } finally {
      setDevTesting(false);
    }
  };

  const handleClearCache = () => {
    localStorage.removeItem('aszen_activities');
    localStorage.removeItem('aszen_cached_jobs');
    showToast('Developer action: Local operational cache purged successfully!');
  };

  // Expanded permissions panel state
  const [expandedEmpId, setExpandedEmpId] = useState(null);
  const [savingEmpId, setSavingEmpId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // New Client Form
  const [clientCode, setClientCode] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');

  const showToast = (text, type = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    const cleanName = empName.trim();
    if (!cleanName) return;
    const cleanEmail = empEmail.trim() || `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'employee'}@vistaeditz.com`;
    const isDev = empRole === 'Developer';
    const finalPerms = isDev
      ? {
          can_create_job: false,
          can_edit_job: false,
          can_create_employee: false,
          can_delete_job: false,
          can_manage_clients: false,
          can_manage_work_hours: false,
        }
      : empInitialPerms;

    try {
      await addEmployee({
        name: cleanName,
        role: empRole,
        email: cleanEmail,
        is_approved: true,
        permissions: finalPerms,
      });
      setEmpName('');
      setEmpRole('Editor');
      setEmpEmail('');
      setEmpInitialPerms({
        can_create_job: false,
        can_edit_job: false,
        can_create_employee: false,
        can_delete_job: false,
        can_manage_clients: false,
        can_manage_work_hours: false,
      });
      showToast(`Employee "${cleanName}" saved permanently!`);
    } catch (err) {
      showToast('Failed to add employee record', 'error');
    }
  };

  const handleToggleApproval = async (emp) => {
    const newStatus = emp.is_approved === false ? true : false;
    setSavingEmpId(emp.id);
    try {
      await updateEmployeePermissions(emp.id, { is_approved: newStatus });
      showToast(
        newStatus
          ? `Permissions unlocked for ${emp.name} (Approved)`
          : `Access restricted for ${emp.name}`
      );
    } catch (err) {
      showToast('Failed to update employee status', 'error');
    } finally {
      setSavingEmpId(null);
    }
  };

  const handleToggleFeature = async (emp, permKey) => {
    const currentPerms = emp.permissions || {};
    const updatedPerms = {
      ...currentPerms,
      [permKey]: !currentPerms[permKey],
    };
    setSavingEmpId(emp.id);
    try {
      await updateEmployeePermissions(emp.id, {
        is_approved: true, // Auto-approve if granting permissions
        permissions: updatedPerms,
      });
      showToast(`Updated "${emp.name}" permissions.`);
    } catch (err) {
      showToast('Failed to update permissions', 'error');
    } finally {
      setSavingEmpId(null);
    }
  };

  const handleGrantAll = async (emp) => {
    const allOn = {
      can_create_job: true,
      can_edit_job: true,
      can_create_employee: true,
      can_delete_job: true,
      can_manage_clients: true,
      can_manage_work_hours: true,
    };
    setSavingEmpId(emp.id);
    try {
      await updateEmployeePermissions(emp.id, {
        is_approved: true,
        permissions: allOn,
      });
      showToast(`All permissions granted to ${emp.name}!`);
    } catch (err) {
      showToast('Failed to update permissions', 'error');
    } finally {
      setSavingEmpId(null);
    }
  };

  const handleRevokeAll = async (emp) => {
    const allOff = {
      can_create_job: false,
      can_edit_job: false,
      can_create_employee: false,
      can_delete_job: false,
      can_manage_clients: false,
      can_manage_work_hours: false,
    };
    setSavingEmpId(emp.id);
    try {
      await updateEmployeePermissions(emp.id, {
        is_approved: true,
        permissions: allOff,
      });
      showToast(`Reset ${emp.name} to Standard Editor access.`);
    } catch (err) {
      showToast('Failed to reset permissions', 'error');
    } finally {
      setSavingEmpId(null);
    }
  };

  const handleAddClient = (e) => {
    e.preventDefault();
    const cleanCode = clientCode.trim().toUpperCase();
    if (!cleanCode) return;
    const finalName = clientName.trim() || cleanCode;
    addClient({ code: cleanCode, name: finalName, contact: clientContact.trim() });
    setClientCode('');
    setClientName('');
    setClientContact('');
    showToast(`Client "${cleanCode}" registered successfully!`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-slideDown ${
            toastMsg.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toastMsg.type === 'error' ? <FiAlertCircle className="w-4 h-4" /> : <FiCheck className="w-4 h-4" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Top Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 mb-2 transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight flex items-center gap-2">
            <FiShield className="w-6 h-6 text-indigo-600" /> Admin Control & Permissions Panel
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Permanent personnel registry &amp; granular feature permissions release system.
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 sm:px-6 pt-3 sm:pt-4 overflow-x-auto mobile-touch-scroll">
          <button
            onClick={() => setActiveTab('employees')}
            className={`pb-3 px-5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'employees'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FiUsers className="w-4 h-4" /> Employee Personnel ({editors.length})
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`pb-3 px-5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'clients'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FiBriefcase className="w-4 h-4" /> Registered Clients ({clients.length})
          </button>
          <button
            onClick={() => setActiveTab('developer')}
            className={`pb-3 px-5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'developer'
                ? 'border-cyan-600 text-cyan-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FiTerminal className="w-4 h-4 text-cyan-600" /> Developer Options ({editors.filter((e) => (e.designation || e.role)?.toLowerCase() === 'developer').length})
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-6 sm:p-8">
          {activeTab === 'employees' ? (
            <div className="space-y-6">
              {/* Add Employee Form */}
              <form onSubmit={handleAddEmployee} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Add New Employee Record (Created Once &amp; Persisted)
                  </h3>
                  <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Auto-Persisted to Cloud &amp; Local Store
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul, Sneha"
                      value={empName}
                      onChange={(e) => setEmpName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-base sm:text-xs text-slate-800 focus:outline-none focus:border-indigo-500 min-h-[42px] sm:min-h-0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Role Designation</label>
                    <select
                      value={empRole}
                      onChange={(e) => handleEmpRoleChange(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-base sm:text-xs text-slate-800 focus:outline-none focus:border-indigo-500 min-h-[42px] sm:min-h-0 font-medium"
                    >
                      <option value="Editor">Editor</option>
                      <option value="Senior Editor">Senior Editor</option>
                      <option value="Pather">Pather</option>
                      <option value="QC Lead">QC Lead</option>
                      <option value="Project Manager">Project Manager</option>
                      <option value="Developer">Developer (Shift Attendance &amp; Leave Tracking)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Email Address <span className="text-slate-400 font-normal">(Optional - auto-generated if blank)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. employee@vistaeditz.com"
                      value={empEmail}
                      onChange={(e) => setEmpEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-base sm:text-xs text-slate-800 focus:outline-none focus:border-indigo-500 min-h-[42px] sm:min-h-0"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-200/60">
                  <div className="text-[11px] text-slate-500">
                    Default login password will be: <strong className="text-indigo-600 font-mono">Aszen@123</strong> (can be reset anytime).
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <FiPlus className="w-4 h-4" /> Save Personnel Record
                  </button>
                </div>
              </form>

              {/* Active Employees List with Granular Permissions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Active Personnel Registry &amp; Permissions ({editors.length})
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Click <strong>Permissions</strong> to toggle feature access for approved staff.
                  </span>
                </div>

                {editors.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                    No employee records found. Create employees above or have them register themselves on the login page!
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                    {editors.map((emp) => {
                      const perms = emp.permissions || {};
                      const isApproved = emp.is_approved !== false;
                      const activeCount = Object.values(perms).filter(Boolean).length;
                      const isExpanded = expandedEmpId === emp.id;
                      const isSaving = savingEmpId === emp.id;

                      return (
                        <div key={emp.id} className="transition-colors">
                          {/* Row Summary Bar */}
                          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 font-extrabold flex items-center justify-center text-sm border border-indigo-100 shrink-0 shadow-xs">
                                {emp.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-900 text-xs">{emp.name}</span>
                                  {isApproved ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Approved
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Restricted
                                    </span>
                                  )}
                                  {(emp.designation || emp.role)?.toLowerCase() === 'developer' ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-800 bg-cyan-50 border border-cyan-300 px-2 py-0.5 rounded-md shadow-2xs font-mono">
                                      💻 Developer
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                      {emp.designation || emp.role}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                                  {emp.email || 'No email registered'}
                                </div>

                                {/* Active Released Features Tags */}
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {isApproved && activeCount > 0 ? (
                                    PERMISSION_CONFIGS.filter((p) => perms[p.key]).map((p) => (
                                      <span
                                        key={p.key}
                                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100"
                                      >
                                        {p.icon} {p.badge}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic">
                                      {isApproved ? 'Standard Editor (Timer Only)' : 'Pending Admin Approval'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center flex-wrap">
                              {/* Permissions Accordion Toggle */}
                              <button
                                onClick={() => setExpandedEmpId(isExpanded ? null : emp.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                                  isExpanded
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                                }`}
                                title="Configure feature permissions"
                              >
                                <FiSliders className="w-3.5 h-3.5" />
                                <span>Permissions ({activeCount})</span>
                                {isExpanded ? <FiChevronUp className="w-3.5 h-3.5" /> : <FiChevronDown className="w-3.5 h-3.5" />}
                              </button>

                              {/* Reset Password */}
                              <button
                                onClick={async () => {
                                  const newPass = prompt(`Enter new password for ${emp.name}:`, 'Aszen@123');
                                  if (newPass) {
                                    try {
                                      await adminResetPassword(emp.id, newPass);
                                      showToast(`Password for ${emp.name} updated!`);
                                    } catch (e) {
                                      showToast(e.message || 'Failed to reset password', 'error');
                                    }
                                  }
                                }}
                                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 transition-colors cursor-pointer"
                                title="Reset Password"
                              >
                                <FiKey className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Employee */}
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete ${emp.name}?`)) {
                                    deleteEmployee(emp.id);
                                    showToast(`Deleted employee ${emp.name}`);
                                  }
                                }}
                                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                                title="Delete Employee"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded Permissions & Feature Release Panel */}
                          {isExpanded && (
                            <div className="p-5 bg-gradient-to-b from-indigo-50/40 via-slate-50 to-white border-t border-indigo-100/80 space-y-4 animate-fadeIn">
                              {/* Master Toggle Row */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-indigo-200/80 shadow-xs">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                      {isApproved ? <FiUnlock className="w-4 h-4 text-emerald-600" /> : <FiLock className="w-4 h-4 text-amber-600" />}
                                      Enable Permissions / Approved Employee Status
                                    </span>
                                    {isSaving && <span className="text-[10px] text-indigo-600 animate-pulse font-bold">Saving changes…</span>}
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    {isApproved
                                      ? 'Employee is approved. Toggle specific feature permissions below to release dashboard tools.'
                                      : 'Employee is currently restricted. Toggle ON to approve this employee and activate permissions.'}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleToggleApproval(emp)}
                                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                      isApproved
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                    }`}
                                  >
                                    {isApproved ? <FiCheck className="w-3.5 h-3.5" /> : null}
                                    {isApproved ? 'Permissions Enabled (Approved)' : 'Enable Permissions'}
                                  </button>
                                </div>
                              </div>

                              {/* Granular Feature Checkboxes Grid */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                    Feature Release Controls
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleGrantAll(emp)}
                                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                                    >
                                      Grant All
                                    </button>
                                    <span className="text-slate-300">|</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRevokeAll(emp)}
                                      className="text-[11px] font-bold text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
                                    >
                                      Reset to Basic
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                  {PERMISSION_CONFIGS.map((perm) => {
                                    const isEnabled = isApproved && !!perms[perm.key];
                                    return (
                                      <div
                                        key={perm.key}
                                        onClick={() => handleToggleFeature(emp, perm.key)}
                                        className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                                          isEnabled
                                            ? 'bg-white border-indigo-300 shadow-xs ring-1 ring-indigo-200'
                                            : 'bg-slate-50/80 border-slate-200 hover:bg-white hover:border-slate-300 opacity-80'
                                        }`}
                                      >
                                        <div>
                                          <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                              <span>{perm.icon}</span> {perm.title}
                                            </span>
                                            {isEnabled ? (
                                              <FiCheckSquare className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                                            ) : (
                                              <FiSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                            )}
                                          </div>
                                          <p className="text-[11px] text-slate-500 leading-relaxed">
                                            {perm.desc}
                                          </p>
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                                          <span className="text-[10px] font-semibold text-slate-400">
                                            Status:
                                          </span>
                                          <span
                                            className={`text-[10px] font-bold ${
                                              isEnabled ? 'text-indigo-600' : 'text-slate-400'
                                            }`}
                                          >
                                            {isEnabled ? 'Released & Active' : 'Locked'}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'clients' ? (
            <div className="space-y-6">
              {/* Add Client Form */}
              <form onSubmit={handleAddClient} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Add New Client</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Client Code is the primary identifier across all production jobs. Full name and email/phone are optional.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold uppercase tracking-wider font-mono">
                    Code Priority Mode
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
                      Client Code <span className="text-indigo-600 font-extrabold">* Required (Primary)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BE, RE, EPIC, LUX"
                      value={clientCode}
                      onChange={(e) => setClientCode(e.target.value.toUpperCase())}
                      className="w-full bg-white border-2 border-indigo-300 focus:border-indigo-600 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-indigo-950 font-mono font-black tracking-wider focus:outline-none shadow-xs min-h-[44px]"
                      required
                      autoFocus
                    />
                    <p className="text-[10px] text-indigo-600/80 mt-1 font-medium">Used across all job boards &amp; production sheets</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Client Full Name <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Blue Sky Edits (or leave blank)"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-base sm:text-xs text-slate-800 focus:outline-none focus:border-indigo-500 min-h-[42px] sm:min-h-0"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Defaults to Client Code if omitted</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Contact Email / Phone <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. orders@bluesky.com"
                      value={clientContact}
                      onChange={(e) => setClientContact(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-base sm:text-xs text-slate-800 focus:outline-none focus:border-indigo-500 min-h-[42px] sm:min-h-0"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Optional contact reference</p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <FiPlus className="w-4 h-4" /> Add Client Account
                </button>
              </form>

              {/* Registered Clients List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Registered Clients ({clients.length})
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Primary indexing: <strong>Client Code</strong>
                  </span>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {clients.map((c) => (
                    <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-xs border border-indigo-700 font-mono tracking-wider">
                          {c.code}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-indigo-950 tracking-wider">
                              {c.code}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[10px] font-bold uppercase tracking-wider font-mono">
                              Client Code
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-slate-700 mt-0.5">
                            {c.name && c.name !== c.code ? c.name : <span className="text-slate-400 italic">No formal name set</span>}
                            {c.contact && (
                              <span className="text-[11px] text-slate-500 font-normal ml-2">
                                • {c.contact}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteClient(c.id)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                        title="Delete Client"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Developer Options Hub */
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 p-6 rounded-2xl text-white border border-cyan-800/40 shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold mb-3">
                    <FiTerminal className="w-3.5 h-3.5" /> DEVELOPER SYSTEM ROLE &amp; SCOPE
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-sans tracking-tight text-white flex items-center gap-2.5">
                    <span>Developer Technical Profile &amp; Attendance</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-cyan-100/80 max-w-2xl mt-1.5 leading-relaxed">
                    Personnel registered under the <strong>Developer</strong> designation are dedicated to technical infrastructure, <strong>Shift Attendance (Login / Logoff time)</strong>, and <strong>Leave Management</strong>. Developers are completely excluded from creative tasks like Blending, Path 1 &amp; 2, Editing, LC, and QC to maintain clean operational queues.
                  </p>
                </div>
              </div>

              {/* 4 Feature Capability Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-cyan-50/50 border border-cyan-200/80">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-sm mb-2.5">
                    ⏱️
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Shift Attendance</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Login and logoff shift tracking with automated session duration calculation and history.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/80">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm mb-2.5">
                    🏖️
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Leave Management</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Full leave application workflow, leave balance tracking, and personal leave calendar access.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/80">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm mb-2.5">
                    🛡️
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Isolated Task Queues</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Zero interference with Blending, Path, or QC production sheets to preserve accurate team metrics.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-2.5">
                    🔄
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Realtime Synchronization</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Multi-session BroadcastChannel event dispatching with SQLite persistent storage and health probes.
                  </p>
                </div>
              </div>

              {/* System Diagnostics & Operational Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Diagnostics Panel */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <FiServer className="w-4 h-4 text-cyan-600" /> Backend API &amp; Health Probe
                    </h3>
                    <button
                      onClick={testBackendHealth}
                      disabled={devTesting}
                      className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <FiRefreshCw className={`w-3 h-3 ${devTesting ? 'animate-spin' : ''}`} />
                      <span>{devTesting ? 'Pinging...' : 'Ping Backend API'}</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                      <span className="text-slate-500 font-sans">API Endpoint:</span>
                      <span className="font-bold text-slate-800">http://localhost:5000/api</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                      <span className="text-slate-500 font-sans">Active Database Engine:</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> SQLite (backend/aszen.db)
                      </span>
                    </div>
                    {devPingStatus && (
                      <div className={`p-3 rounded-xl border ${devPingStatus.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                        <div className="flex items-center justify-between font-bold">
                          <span>Status: {devPingStatus.ok ? `200 OK (${devPingStatus.latency}ms latency)` : 'Error'}</span>
                          <span className="text-[10px]">{devPingStatus.time}</span>
                        </div>
                        {devPingStatus.ok && (
                          <div className="text-[11px] font-sans mt-1 text-emerald-700">
                            Connected. Database returns {devPingStatus.clientCount} registered client records.
                          </div>
                        )}
                        {devPingStatus.error && (
                          <div className="text-[11px] font-sans mt-1 text-rose-600">{devPingStatus.error}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Developer Actions Panel */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <FiCpu className="w-4 h-4 text-indigo-600" /> Operational Storage &amp; Tools
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div>
                        <div className="text-xs font-bold text-slate-800">Security Audit Logs</div>
                        <div className="text-[11px] text-slate-500">Inspect indelibly stored system audit records</div>
                      </div>
                      <button
                        onClick={() => navigate('/dashboard/audit-logs')}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        Open Logs
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div>
                        <div className="text-xs font-bold text-slate-800">Clear Local Storage Cache</div>
                        <div className="text-[11px] text-slate-500">Purge cached activities and client-side temp state</div>
                      </div>
                      <button
                        onClick={handleClearCache}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        Purge Cache
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registered Developers Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Registered Developer Accounts ({editors.filter((e) => (e.designation || e.role)?.toLowerCase() === 'developer').length})
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Accounts possessing developer credentials in this system
                  </span>
                </div>

                {editors.filter((e) => (e.designation || e.role)?.toLowerCase() === 'developer').length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                    No users registered with Developer role yet. Select <strong>Developer</strong> in the Add Employee form above to create one.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                    {editors
                      .filter((e) => (e.designation || e.role)?.toLowerCase() === 'developer')
                      .map((dev) => (
                        <div key={dev.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-700 font-extrabold flex items-center justify-center text-sm border border-cyan-200">
                              💻
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-xs">{dev.name}</span>
                                <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 border border-cyan-300 px-2 py-0.5 rounded-md font-mono">
                                  Developer
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">{dev.email || 'No email registered'}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={async () => {
                                const newPass = prompt(`Enter new password for ${dev.name}:`, 'Aszen@123');
                                if (newPass) {
                                  try {
                                    await adminResetPassword(dev.id, newPass);
                                    showToast(`Password for ${dev.name} updated!`);
                                  } catch (e) {
                                    showToast(e.message || 'Failed to reset password', 'error');
                                  }
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <FiKey className="w-3.5 h-3.5" /> Reset Password
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
