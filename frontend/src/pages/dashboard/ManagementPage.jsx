import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import { useAuth } from '../../context/AuthContext';
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
    if (!empName.trim()) return;
    try {
      await addEmployee({
        name: empName.trim(),
        role: empRole,
        email: empEmail.trim(),
        is_approved: true,
        permissions: empInitialPerms,
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
      showToast(`Employee "${empName.trim()}" added and saved permanently!`);
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
    if (!clientCode.trim() || !clientName.trim()) return;
    addClient({ code: clientCode.trim(), name: clientName.trim(), contact: clientContact.trim() });
    setClientCode('');
    setClientName('');
    setClientContact('');
    showToast(`Client "${clientCode.trim()}" registered successfully!`);
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
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-4">
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
                      placeholder="e.g. Lessy, Shwetha"
                      value={empName}
                      onChange={(e) => setEmpName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Role Designation</label>
                    <select
                      value={empRole}
                      onChange={(e) => setEmpRole(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Editor">Editor</option>
                      <option value="Senior Editor">Senior Editor</option>
                      <option value="Pather">Pather</option>
                      <option value="QC Lead">QC Lead</option>
                      <option value="Project Manager">Project Manager</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. employee@aszen.com"
                      value={empEmail}
                      onChange={(e) => setEmpEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
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
                                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                    {emp.designation || emp.role}
                                  </span>
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
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
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
          ) : (
            <div className="space-y-6">
              {/* Add Client Form */}
              <form onSubmit={handleAddClient} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Add New Client</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Client Code</label>
                    <input
                      type="text"
                      placeholder="e.g. BE, RE, EPIC"
                      value={clientCode}
                      onChange={(e) => setClientCode(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Client Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Blue Sky Edits"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Contact Email / Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. orders@bluesky.com"
                      value={clientContact}
                      onChange={(e) => setClientContact(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
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
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Clients ({clients.length})</h3>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {clients.map((c) => (
                    <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-100 font-mono">
                          {c.code}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{c.name}</div>
                          <div className="text-[11px] text-slate-500">Code: {c.code} • {c.contact || 'No Contact Listed'}</div>
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
          )}
        </div>
      </div>
    </div>
  );
}
