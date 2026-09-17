import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { FiShield, FiArrowLeft, FiSearch, FiRefreshCw, FiClock, FiUser, FiActivity } from 'react-icons/fi';

export default function AuditLogsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = () => {
    setLoading(true);
    api
      .get('/jobs/audit-logs')
      .then((res) => {
        if (Array.isArray(res.data?.auditLogs)) {
          setLogs(res.data.auditLogs);
        }
      })
      .catch((err) => {
        console.error('Fetch audit logs error:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      (log.action || '').toLowerCase().includes(term) ||
      (log.userName || '').toLowerCase().includes(term) ||
      (log.userEmail || '').toLowerCase().includes(term) ||
      (log.details || '').toLowerCase().includes(term)
    );
  });

  const getActionBadge = (action) => {
    const act = (action || '').toUpperCase();
    if (act.includes('CREATED')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (act.includes('DELETED')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (act.includes('UPDATED')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-white rounded-2xl border border-slate-200 mt-12">
        <FiShield className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Access Denied</h2>
        <p className="text-xs text-slate-500 mt-1">Only Master Admin can access system security audit logs.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
          >
            <FiArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 font-sans">
            <FiShield className="w-6 h-6 text-indigo-600" /> Security & Audit Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Indelible system audit trail tracking all job, user, and client actions across the platform.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Logs
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search logs by action, user, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <span className="text-xs font-bold text-slate-500 px-2">{filteredLogs.length} Records</span>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Performed By</th>
                <th className="py-3.5 px-6">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400">
                    <FiActivity className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400">
                    No audit records found matching your search.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <FiClock className="w-3 h-3 text-slate-400" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-[10px] border border-indigo-100">
                          <FiUser className="w-3 h-3" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{log.userName}</div>
                          <div className="text-[10px] text-slate-400">{log.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-sans">
                      {log.details || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
