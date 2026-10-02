import { useState, useMemo } from 'react';
import { useJobs } from '../../context/JobContext';
import { useAuth } from '../../context/AuthContext';
import ApplyLeaveModal from '../../components/dashboard/ApplyLeaveModal';
import {
  FiCalendar,
  FiPlus,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiUserCheck,
  FiAlertCircle,
  FiInfo,
  FiFilter,
  FiUser,
  FiCheck,
  FiX,
  FiFileText,
} from 'react-icons/fi';

import { formatDateDMY } from '../../utils/dateUtils';

export default function LeaveManagementPage() {
  const { leaveRequests, updateLeaveStatus, cancelLeave, getLeaveBalances, pendingLeaveCount, editors } = useJobs();
  const { user } = useAuth();

  const userRole = (user?.role || 'employee').toLowerCase();
  const myEmail = (user?.email || '').toLowerCase();
  const isManagerOrAdmin =
    userRole === 'admin' ||
    userRole === 'manager' ||
    ['arun@aszen.com', 'gokul@aszen.com'].includes(myEmail);

  const [activeTab, setActiveTab] = useState('my-leaves'); // 'my-leaves' | 'approvals'
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [approvalFilter, setApprovalFilter] = useState('Pending'); // 'Pending' | 'All' | 'Approved' | 'Rejected'
  const [selectedLeaveForReview, setSelectedLeaveForReview] = useState(null);
  const [managerNotes, setManagerNotes] = useState('');
  const [reviewAction, setReviewAction] = useState('Approved'); // 'Approved' | 'Rejected'

  // Current employee leave balances (18 days annual quota)
  const balances = useMemo(() => {
    return getLeaveBalances(user?.email);
  }, [getLeaveBalances, user]);

  // Current employee leave requests
  const myRequests = useMemo(() => {
    return leaveRequests
      .filter((l) => (l.userEmail || '').toLowerCase() === myEmail)
      .sort((a, b) => new Date(b.createdAt || b.appliedAt || 0) - new Date(a.createdAt || a.appliedAt || 0));
  }, [leaveRequests, myEmail]);

  // Team leave requests for managers/admins
  const teamRequests = useMemo(() => {
    let list = [...leaveRequests].sort(
      (a, b) => new Date(b.createdAt || b.appliedAt || 0) - new Date(a.createdAt || a.appliedAt || 0)
    );
    if (approvalFilter !== 'All') {
      list = list.filter((l) => l.status === approvalFilter);
    }
    return list;
  }, [leaveRequests, approvalFilter]);

  // Employees on leave today
  const todayStr = new Date().toISOString().slice(0, 10);
  const onLeaveToday = useMemo(() => {
    return leaveRequests.filter((l) => {
      if (l.status !== 'Approved') return false;
      const start = l.startDate ? l.startDate.slice(0, 10) : '';
      const end = l.endDate ? l.endDate.slice(0, 10) : start;
      return todayStr >= start && todayStr <= end;
    });
  }, [leaveRequests, todayStr]);

  const handleOpenReview = (leave, action) => {
    setSelectedLeaveForReview(leave);
    setReviewAction(action);
    setManagerNotes(action === 'Approved' ? 'Approved, all good.' : 'Cannot approve due to high workload.');
  };

  const handleConfirmReview = async () => {
    if (!selectedLeaveForReview) return;
    await updateLeaveStatus(selectedLeaveForReview.id, reviewAction, managerNotes);
    setSelectedLeaveForReview(null);
    setManagerNotes('');
  };

  const handleCancelRequest = (leaveId) => {
    if (window.confirm('Are you sure you want to cancel this leave application?')) {
      cancelLeave(leaveId);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-sans">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Leave Management
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono">
              18 Days / Year
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Company leave allowance is 18 days per calendar year. Apply for leave and track team coverage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPolicyModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FiInfo className="w-4 h-4 text-slate-500" />
            <span>Leave Policy</span>
          </button>

          <button
            type="button"
            onClick={() => setIsApplyModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <FiPlus className="w-4 h-4" />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* Leave Balance Metric Cards (18 Days Single Annual System) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Annual Allowance */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span>Annual Allowance</span>
            <span className="text-blue-600 font-mono">ALLOTMENT</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              18
            </span>
            <span className="text-xs font-semibold text-slate-400">Days / Year</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full w-full" />
          </div>
          <span className="text-[11px] text-slate-400 block mt-2 font-medium">Standard company annual quota</span>
        </div>

        {/* Card 2: Available Leave */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">
            <span>Available Balance</span>
            <span className="text-emerald-700 font-mono">REMAINING</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">
              {balances.available}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 18 Days Left</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.max(0, (balances.available / 18) * 100))}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 block mt-2 font-medium">
            {Math.round((balances.available / 18) * 100)}% of quota available
          </span>
        </div>

        {/* Card 3: Leaves Taken */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span>Leaves Taken</span>
            <span className="text-indigo-600 font-mono">APPROVED</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {balances.used}
            </span>
            <span className="text-xs font-semibold text-slate-400">Days Used</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (balances.used / 18) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 block mt-2 font-medium">Approved leaves this year</span>
        </div>

        {/* Card 4: Pending Approvals */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span>Pending Review</span>
            <span className="text-amber-600 font-mono">IN QUEUE</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">
              {balances.pending || 0}
            </span>
            <span className="text-xs font-semibold text-slate-400">Days</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, ((balances.pending || 0) / 18) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 block mt-2 font-medium">
            {pendingLeaveCount} request(s) awaiting decision
          </span>
        </div>
      </div>

      {/* Who is on Leave Today Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900">Who is on Leave Today</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {onLeaveToday.length}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">{todayStr}</span>
        </div>

        {onLeaveToday.length === 0 ? (
          <div className="py-3 text-center text-xs sm:text-sm font-semibold text-slate-500 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Full team present today — zero staff on active leave.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {onLeaveToday.map((ol) => (
              <div
                key={ol.id}
                className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-center justify-between text-xs sm:text-sm"
              >
                <div>
                  <div className="font-bold text-slate-900 capitalize">{ol.userName}</div>
                  <div className="text-xs text-amber-800 font-semibold mt-0.5">
                    {ol.days} {ol.days === 1 ? 'day' : 'days'} leave
                  </div>
                  {ol.backupEmployee && (
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Covered by: <span className="font-semibold text-slate-700">{ol.backupEmployee}</span>
                    </div>
                  )}
                </div>
                <div className="text-right text-xs font-mono text-slate-500">
                  Until: <span className="font-bold text-slate-800">{formatDateDMY(ol.endDate)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 px-5 pt-3 bg-slate-50/50">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('my-leaves')}
              className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'my-leaves'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>My Leave Requests</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-100 text-slate-600">
                {myRequests.length}
              </span>
            </button>

            {isManagerOrAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('approvals')}
                className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'approvals'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Team Approval Queue</span>
                {pendingLeaveCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500 text-white animate-pulse">
                    {pendingLeaveCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {activeTab === 'approvals' && isManagerOrAdmin && (
            <div className="flex items-center gap-1.5 pb-2 text-xs sm:text-sm">
              <span className="text-slate-400 font-semibold mr-1">Filter:</span>
              {['Pending', 'Approved', 'Rejected', 'All'].map((flt) => (
                <button
                  key={flt}
                  type="button"
                  onClick={() => setApprovalFilter(flt)}
                  className={`px-3 py-1 rounded-lg font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
                    approvalFilter === flt
                      ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {flt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab 1: My Leave Requests */}
        {activeTab === 'my-leaves' && (
          <div className="p-4 sm:p-5">
            {myRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FiCalendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700">No leave requests found</p>
                <p className="text-xs text-slate-400 mt-1">You haven't submitted any leave applications yet.</p>
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs sm:text-sm hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  + Apply for Leave
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto mobile-touch-scroll">
                <table className="w-full text-left text-xs sm:text-sm min-w-[650px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold text-xs uppercase tracking-wider">
                      <th className="py-3.5 px-3.5">Ref #</th>
                      <th className="py-3.5 px-3.5">Leave Dates</th>
                      <th className="py-3.5 px-3 text-center">Duration</th>
                      <th className="py-3.5 px-3.5">Reason</th>
                      <th className="py-3.5 px-3.5">Handover Colleague</th>
                      <th className="py-3.5 px-3.5 text-center">Status</th>
                      <th className="py-3.5 px-3.5">Manager Remarks</th>
                      <th className="py-3.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {myRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-3.5">
                          <span className="font-mono font-bold text-indigo-600 block">#{req.id}</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {formatDateDMY(req.createdAt || req.appliedAt)}
                          </span>
                        </td>
                        <td className="py-3.5 px-3.5 font-mono text-slate-700 font-medium">
                          {formatDateDMY(req.startDate)}
                          {req.endDate && req.endDate !== req.startDate && ` → ${formatDateDMY(req.endDate)}`}
                          {req.isHalfDay && (
                            <span className="block text-xs text-indigo-600 font-bold">
                              ({req.halfDayPeriod || 'Half Day'})
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-center font-bold text-slate-900 font-mono text-sm">
                          {req.days} {req.days === 1 ? 'Day' : 'Days'}
                        </td>
                        <td className="py-3.5 px-3.5 text-slate-700 max-w-[220px] truncate" title={req.reason}>
                          {req.reason}
                        </td>
                        <td className="py-3.5 px-3.5 text-slate-700">
                          {req.backupEmployee ? (
                            <span className="font-semibold text-slate-800">{req.backupEmployee}</span>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3.5 text-center">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="py-3.5 px-3.5 text-slate-500 text-xs">
                          {req.managerNotes ? (
                            <span>
                              <span className="font-bold text-slate-700">{req.reviewedBy}:</span> {req.managerNotes}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          {req.status === 'Pending' && (
                            <button
                              type="button"
                              onClick={() => handleCancelRequest(req.id)}
                              className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Team Approval Queue (Manager/Admin only) */}
        {activeTab === 'approvals' && isManagerOrAdmin && (
          <div className="p-4 sm:p-5">
            {teamRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FiCheckCircle className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
                <p className="text-sm font-bold text-slate-700">No requests in this queue</p>
                <p className="text-xs text-slate-400 mt-1">All employee leave applications are currently processed.</p>
              </div>
            ) : (
              <div className="overflow-x-auto mobile-touch-scroll">
                <table className="w-full text-left text-xs sm:text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold text-xs uppercase tracking-wider">
                      <th className="py-3.5 px-3.5">Employee</th>
                      <th className="py-3.5 px-3.5">Leave Dates</th>
                      <th className="py-3.5 px-3 text-center">Duration</th>
                      <th className="py-3.5 px-3.5">Reason</th>
                      <th className="py-3.5 px-3.5">Handover Colleague</th>
                      <th className="py-3.5 px-3.5 text-center">Status</th>
                      <th className="py-3.5 px-3.5 text-right">Review Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {teamRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-3.5">
                          <span className="font-bold text-slate-900 block capitalize">{req.userName}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{req.userEmail}</span>
                        </td>
                        <td className="py-3.5 px-3.5 font-mono text-slate-700">
                          {formatDateDMY(req.startDate)}
                          {req.endDate && req.endDate !== req.startDate && ` → ${formatDateDMY(req.endDate)}`}
                          {req.isHalfDay && (
                            <span className="block text-xs text-indigo-600 font-bold">
                              ({req.halfDayPeriod || 'Half Day'})
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-center font-bold text-slate-900 font-mono text-sm">
                          {req.days} {req.days === 1 ? 'Day' : 'Days'}
                        </td>
                        <td className="py-3.5 px-3.5 text-slate-700 max-w-[220px] truncate" title={req.reason}>
                          {req.reason}
                        </td>
                        <td className="py-3.5 px-3.5 text-slate-700">
                          {req.backupEmployee ? (
                            <span className="font-semibold text-slate-800">{req.backupEmployee}</span>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3.5 text-center">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="py-3.5 px-3.5 text-right">
                          {req.status === 'Pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenReview(req, 'Approved')}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                                title="Approve Leave"
                              >
                                <FiCheck className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenReview(req, 'Rejected')}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                                title="Reject Leave"
                              >
                                <FiX className="w-3.5 h-3.5" /> Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic font-medium">
                              Reviewed by {req.reviewedBy || 'Manager'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Confirmation Modal */}
      {selectedLeaveForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {reviewAction === 'Approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedLeaveForReview(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs sm:text-sm text-slate-600 space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-bold text-slate-900">{selectedLeaveForReview.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration:</span>
                <span className="font-bold text-slate-900">
                  {selectedLeaveForReview.days} {selectedLeaveForReview.days === 1 ? 'Day' : 'Days'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dates:</span>
                <span className="font-mono text-slate-700">{formatDateDMY(selectedLeaveForReview.startDate)} → {formatDateDMY(selectedLeaveForReview.endDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reason:</span>
                <span className="text-slate-800 font-medium truncate max-w-[200px]">{selectedLeaveForReview.reason}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Manager Remarks / Notes
              </label>
              <textarea
                rows={2}
                value={managerNotes}
                onChange={(e) => setManagerNotes(e.target.value)}
                placeholder="Remarks visible to employee..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedLeaveForReview(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReview}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-xs transition-all cursor-pointer ${
                  reviewAction === 'Approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {reviewAction}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Policy Modal */}
      {isPolicyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FiInfo className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base sm:text-lg text-slate-900">Corporate Annual Leave Policy</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPolicyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div>
                <span className="font-bold text-slate-900 block mb-0.5">Annual Leave Allowance:</span>
                <p>
                  Every employee is entitled to exactly <strong className="text-slate-900">18 days of annual leave</strong> per calendar year. Leaves are unified and not categorized into separate types.
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-0.5">Half-Day Leaves:</span>
                <p>
                  Employees can apply for half-day leaves (0.5 day) for either the morning session (1st half) or afternoon session (2nd half).
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-0.5">Advance Notice:</span>
                <p>
                  Leave applications should be submitted at least 2 business days in advance whenever possible so client production schedules and team capacity are smoothly planned.
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-0.5">Work Handover:</span>
                <p>
                  Before proceeding on leave, employees should specify an active colleague for stage handover to prevent any QC, Blending, or dispatch delays.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPolicyModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Understood &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      <ApplyLeaveModal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} />
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'Approved') {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Approved
      </span>
    );
  }
  if (status === 'Rejected') {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
        Rejected
      </span>
    );
  }
  if (status === 'Cancelled') {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
        Cancelled
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
      Pending
    </span>
  );
}
