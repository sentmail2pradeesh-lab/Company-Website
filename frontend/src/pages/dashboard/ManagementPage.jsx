import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import { FiPlus, FiTrash2, FiUsers, FiBriefcase, FiArrowLeft, FiShield } from 'react-icons/fi';

export default function ManagementPage() {
  const navigate = useNavigate();
  const {
    editors,
    clients,
    addClient,
    deleteClient,
    addEmployee,
    deleteEmployee,
  } = useJobs();

  const [activeTab, setActiveTab] = useState('employees'); // 'employees' | 'clients'

  // New Employee Form
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState('Editor');
  const [empEmail, setEmpEmail] = useState('');

  // New Client Form
  const [clientCode, setClientCode] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');

  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!empName.trim()) return;
    addEmployee({ name: empName.trim(), role: empRole, email: empEmail.trim() });
    setEmpName('');
    setEmpRole('Editor');
    setEmpEmail('');
  };

  const handleAddClient = (e) => {
    e.preventDefault();
    if (!clientCode.trim() || !clientName.trim()) return;
    addClient({ code: clientCode.trim(), name: clientName.trim(), contact: clientContact.trim() });
    setClientCode('');
    setClientName('');
    setClientContact('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
          >
            <FiArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight flex items-center gap-2">
            <FiShield className="w-6 h-6 text-indigo-600" /> Admin Control Panel
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage system-wide clients and employee personnel records.
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-4">
          <button
            onClick={() => setActiveTab('employees')}
            className={`pb-3 px-5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'employees'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FiUsers className="w-4 h-4" /> Employee Personnel ({editors.length})
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`pb-3 px-5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
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
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Add New Employee</h3>
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
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
                >
                  <FiPlus className="w-4 h-4" /> Add Personnel Record
                </button>
              </form>

              {/* Active Employees List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Employees ({editors.length})</h3>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {editors.map((emp) => (
                    <div key={emp.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-100">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{emp.name}</div>
                          <div className="text-[11px] text-slate-500">{emp.role} • {emp.email || 'No Email Registered'}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteEmployee(emp.id)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                        title="Delete Employee"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
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
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Contact Info / Email</label>
                    <input
                      type="text"
                      placeholder="contact@client.com"
                      value={clientContact}
                      onChange={(e) => setClientContact(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
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
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 font-mono font-bold flex items-center justify-center text-xs border border-purple-100">
                          {c.code}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            <span className="text-indigo-600 font-mono">[{c.code}]</span> {c.name}
                          </div>
                          <div className="text-[11px] text-slate-500">{c.contact || 'No Contact Info'}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteClient(c.id)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                        title="Delete Client Account"
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
