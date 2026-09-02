import { useState, useEffect } from 'react';
import { useJobs } from '../../context/JobContext';
import { FiX, FiPlus, FiTrash2, FiUsers, FiBriefcase } from 'react-icons/fi';

export default function ManagementModal() {
  const {
    isManagementModalOpen,
    setIsManagementModalOpen,
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
  const [empDesignation, setEmpDesignation] = useState('Editor');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('Aszen@123');

  // New Client Form
  const [clientCode, setClientCode] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');

  useEffect(() => {
    if (isManagementModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isManagementModalOpen]);

  if (!isManagementModalOpen) return null;

  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!empName.trim() || !empEmail.trim()) return;
    addEmployee({
      name: empName.trim(),
      email: empEmail.trim(),
      designation: empDesignation,
      role: empDesignation === 'Manager' ? 'manager' : 'employee',
      password: empPassword,
    });
    setEmpName('');
    setEmpDesignation('Editor');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-auto max-h-[90vh] overflow-y-auto overscroll-contain">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              👑
            </div>
            <div>
              <h2 className="text-base font-bold font-sans">Admin Control Panel</h2>
              <p className="text-xs text-slate-400">Manage Clients & Employee Personnel</p>
            </div>
          </div>

          <button
            onClick={() => setIsManagementModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3">
          <button
            onClick={() => setActiveTab('employees')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'employees'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FiUsers className="w-4 h-4" /> Personnel ({editors.length})
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'clients'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FiBriefcase className="w-4 h-4" /> Clients ({clients.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {activeTab === 'employees' ? (
            <div>
              {/* Add Employee Form */}
              <form onSubmit={handleAddEmployee} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Add New Employee</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <select
                    value={empDesignation}
                    onChange={(e) => setEmpDesignation(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-semibold"
                  >
                    <option value="Manager">Manager</option>
                    <option value="Senior Editor">Senior Editor (Manager Level Access)</option>
                    <option value="QC Lead">QC Lead</option>
                    <option value="Pather">Pather</option>
                    <option value="Editor">Editor</option>
                  </select>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password (Default: Aszen@123)"
                    value={empPassword}
                    onChange={(e) => setEmpPassword(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <FiPlus className="w-4 h-4" /> Add Employee & Set Permissions
                </button>
              </form>

              {/* Employees List */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Employees & Designations</h3>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {editors.map((emp) => (
                    <div key={emp.id} className="p-3 flex items-center justify-between hover:bg-slate-50 text-xs">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{emp.name}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            emp.designation === 'Manager' || emp.role === 'manager'
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : emp.designation === 'Senior Editor'
                              ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {emp.designation || emp.role || 'Editor'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">{emp.email || 'No Email'}</div>
                      </div>
                      <button
                        onClick={() => deleteEmployee(emp.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
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
            <div>
              {/* Add Client Form */}
              <form onSubmit={handleAddClient} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Add New Client</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Client Code (e.g. BE)"
                    value={clientCode}
                    onChange={(e) => setClientCode(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Client Full Name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Contact Email / Info"
                    value={clientContact}
                    onChange={(e) => setClientContact(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <FiPlus className="w-4 h-4" /> Add Client
                </button>
              </form>

              {/* Clients List */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Clients</h3>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {clients.map((c) => (
                    <div key={c.id} className="p-3 flex items-center justify-between hover:bg-slate-50 text-xs">
                      <div>
                        <div className="font-bold text-slate-900"><span className="text-indigo-600 font-mono">[{c.code}]</span> {c.name}</div>
                        <div className="text-[11px] text-slate-500">{c.contact || 'No Contact Info'}</div>
                      </div>
                      <button
                        onClick={() => deleteClient(c.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
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
