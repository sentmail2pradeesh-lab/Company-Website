import { useState, useMemo, useEffect } from 'react';
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
  FiRefreshCw,
  FiSliders,
  FiUsers,
  FiSave,
} from 'react-icons/fi';

import { formatDateDMY, getTodayLocalDateStr } from '../../utils/dateUtils';
import StatusChip from '../../components/common/StatusChip';
import CopyableText from '../../components/common/CopyableText';
import EmptyState from '../../components/common/EmptyState';

export default function LeaveManagementPage() {
  const {
    leaveRequests,
    fetchLeaves,
    updateLeaveStatus,
    cancelLeave,
    getLeaveBalances,
    pendingLeaveCount,
    editors,
    annualLeaveAllowance,
    customLeaveAllowances,
    updateAnnualLeaveAllowance,
    assignEmployeeLeaveDays,
  } = useJobs();
  const { user } = useAuth();

  const userRole = (user?.role || 'employee').toLowerCase();
  const myEmail = (user?.email || '').toLowerCase().trim();
  const isAdmin = userRole === 'admin' || ['arun@aszen.com', 'gokul@aszen.com'].includes(myEmail);

  // Admin cannot apply for leave; admin starts directly in approvals or quota assignment
  const [activeTab, setActiveTab] = useState(isAdmin ? 'approvals' : 'my-leaves');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [approvalFilter, setApprovalFilter] = useState('Pending'); // 'Pending' | 'All' | 'Approved' | 'Rejected'
  const [selectedLeaveForReview, setSelectedLeaveForReview] = useState(null);
  const [managerNotes, setManagerNotes] = useState('');
  const [reviewAction, setReviewAction] = useState('Approved'); // 'Approved' | 'Rejected'
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Admin Yearly Leave Quota State
  const [globalQuotaInput, setGlobalQuotaInput] = useState(annualLeaveAllowance || 18);
  const [quotaSavedMsg, setQuotaSavedMsg] = useState('');
  const [employeeQuotaInputs, setEmployeeQuotaInputs] = useState({});

  useEffect(() => {
    setGlobalQuotaInput(annualLeaveAllowance || 18);
  }, [annualLeaveAllowance]);

  const eligibleStaff = useMemo(() => {
    return (editors || []).filter((emp) => {
      const email = (emp.email || '').toLowerCase().trim();
      const role = (emp.role || '').toLowerCase();
      return role !== 'admin' && !['arun@aszen.com', 'gokul@aszen.com'].includes(email);
    });
  }, [editors]);

  // Sync leave requests immediately on component mount
  useEffect(() => {
    if (typeof fetchLeaves === 'function') {
      fetchLeaves();
    }
  }, [fetchLeaves]);

  const handleManualRefresh = async () => {
    if (typeof fetchLeaves === 'function') {
      setIsRefreshing(true);
      try {
        await fetchLeaves();
      } finally {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  // Current employee leave balances
  const balances = useMemo(() => {
    return getLeaveBalances(user?.email);
  }, [getLeaveBalances, user]);

  // Current employee leave requests
  const myRequests = useMemo(() => {
    return leaveRequests
      .filter((l) => (l.userEmail || '').toLowerCase().trim() === myEmail)
      .sort((a, b) => new Date(b.createdAt || b.appliedAt || 0) - new Date(a.createdAt || a.appliedAt || 0));
  }, [leaveRequests, myEmail]);

  // Team leave requests for admin
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
  const todayStr = getTodayLocalDateStr();
  const onLeaveToday = useMemo(() => {
    return leaveRequests.filter((l) => {
      if (l.status !== 'Approved') return false;
      const start = l.startDate ? l.startDate.slice(0, 10) : '';
      const end = l.endDate ? l.endDate.slice(0, 10) : start;
      return todayStr >= start && todayStr <= end;
    });
  }, [leaveRequests, todayStr]);

  const handleOpenReview = (leave, action) => {
    if (!isAdmin) return;
    setSelectedLeaveForReview(leave);
    setReviewAction(action);
    setManagerNotes(action === 'Approved' ? 'Approved, all good.' : 'Cannot approve due to high workload.');
  };

  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const handleConfirmReview = async () => {
    if (!selectedLeaveForReview || !isAdmin) return;
    try {
      setIsSubmittingReview(true);
      await updateLeaveStatus(selectedLeaveForReview.id, reviewAction, managerNotes);
      setSelectedLeaveForReview(null);
      setManagerNotes('');
    } catch (err) {
      console.error('Failed to update leave status:', err);
      alert(err.response?.data?.message || err.message || 'Failed to update leave status. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleCancelRequest = (leaveId) => {
    if (window.confirm('Are you sure you want to cancel this leave application?')) {
      cancelLeave(leaveId);
    }
  };

  const handleSaveGlobalQuota = (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    const num = Math.max(1, Number(globalQuotaInput) || 18);
    updateAnnualLeaveAllowance(num);
    setQuotaSavedMsg(`Standard company allowance updated to ${num} days/year!`);
    setTimeout(() => setQuotaSavedMsg(''), 3000);
  };

  const handleSaveEmployeeQuota = (empEmail, val) => {
    if (!isAdmin || !empEmail) return;
    const num = Math.max(0, Number(val) || 0);
    assignEmployeeLeaveDays(empEmail, num);
    setQuotaSavedMsg(`Assigned ${num} annual leave days to ${empEmail}`);
    setTimeout(() => setQuotaSavedMsg(''), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-sans">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isAdmin ? 'Leave Management & Approvals' : 'Leave Management'}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono">
              {isAdmin ? `${annualLeaveAllowance || 18} Days / Year Standard` : `${balances.total || 18} Days / Year`}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            {isAdmin
              ? 'Administrator portal: Review employee leave requests, approve or reject applications, and assign yearly leave days alone.'
              : `Company annual leave allowance is ${balances.total || 18} days. Apply for leave and track review status.`}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Refresh Leave Data from Server"
            className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FiRefreshCw className={`w-4 h-4 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPolicyModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FiInfo className="w-4 h-4 text-slate-500" />
            <span>Leave Policy</span>
          </button>

          {/* ADMIN CANNOT APPLY FOR LEAVE - only employees can apply */}
          {!isAdmin && (
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <FiPlus className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
          )}
        </div>
      </div>

      {/* Leave Metric Cards */}
      {isAdmin ? (
        /* Admin Overview Metric Cards */
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Card 1: Standard Company Annual Quota */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span>Standard Quota</span>
              <span className="text-blue-600 font-mono">ANNUAL</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                {annualLeaveAllowance || 18}
              </span>
              <span className="text-xs font-semibold text-slate-400">Days / Staff</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full w-full" />
            </div>
            <span className="text-[11px] text-slate-400 block mt-2 font-medium">Configured standard allowance</span>
          </div>

          {/* Card 2: Total Leave Applications */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
              <span>Total Requests</span>
              <span className="text-indigo-700 font-mono">ALL TIME</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 font-mono">
                {leaveRequests.length}
              </span>
              <span className="text-xs font-semibold text-slate-400">Applications</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full w-full" />
            </div>
            <span className="text-[11px] text-slate-400 block mt-2 font-medium">Logged across team</span>
          </div>

          {/* Card 3: Pending Approvals */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">
              <span>Pending Review</span>
              <span className="text-amber-700 font-mono">IN QUEUE</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">
                {pendingLeaveCount}
              </span>
              <span className="text-xs font-semibold text-slate-400">Awaiting Decision</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, pendingLeaveCount * 25)}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400 block mt-2 font-medium">Requires Admin approval/rejection</span>
          </div>

          {/* Card 4: Staff on Leave Today */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">
              <span>On Leave Today</span>
              <span className="text-emerald-700 font-mono">ACTIVE</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">
                {onLeaveToday.length}
              </span>
              <span className="text-xs font-semibold text-slate-400">Staff Away</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, onLeaveToday.length * 20)}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400 block mt-2 font-medium">Currently on scheduled leave</span>
          </div>
        </div>
      ) : (
        /* Employee Personal Metric Cards */
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Card 1: Annual Allowance */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span>Annual Allowance</span>
              <span className="text-blue-600 font-mono">ALLOTMENT</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                {balances.total}
              </span>
              <span className="text-xs font-semibold text-slate-400">Days / Year</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full w-full" />
            </div>
            <span className="text-[11px] text-slate-400 block mt-2 font-medium">Assigned annual quota</span>
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
              <span className="text-xs font-semibold text-slate-400">/ {balances.total} Days Left</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.max(0, (balances.available / (balances.total || 18)) * 100))}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400 block mt-2 font-medium">
              {Math.round((balances.available / (balances.total || 18)) * 100)}% of quota available
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
                style={{ width: `${Math.min(100, (balances.used / (balances.total || 18)) * 100)}%` }}
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
                style={{ width: `${Math.min(100, ((balances.pending || 0) / (balances.total || 18)) * 100)}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400 block mt-2 font-medium">
              {balances.pending || 0} day(s) awaiting decision
            </span>
          </div>
        </div>
      )}

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
            {!isAdmin ? (
              /* Non-Admin Employee Tab */
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
            ) : (
              /* Admin Only Tabs */
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('approvals')}
                  className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'approvals'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FiCheckCircle className="w-4 h-4 text-indigo-600" />
                  <span>Team Approval Queue</span>
                  {pendingLeaveCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500 text-white animate-pulse">
                      {pendingLeaveCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('yearly-quota')}
                  className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'yearly-quota'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FiSliders className="w-4 h-4 text-indigo-600" />
                  <span>Assign Yearly Leave Days</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Admin Only
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('all-records')}
                  className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'all-records'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FiFileText className="w-4 h-4 text-indigo-600" />
                  <span>All Leave Records</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-100 text-slate-600">
                    {leaveRequests.length}
                  </span>
                </button>
              </>
            )}
          </div>

          {(activeTab === 'approvals' || activeTab === 'all-records') && isAdmin && (
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

        {/* Tab 1: My Leave Requests (Employees only) */}
        {!isAdmin && activeTab === 'my-leaves' && (
          <div className="p-4 sm:p-5">
            {myRequests.length === 0 ? (
              <EmptyState
                icon="calendar"
                title="No leave requests found"
                description="You haven't submitted any leave applications yet."
                actionLabel="+ Apply for Leave"
                onAction={() => setIsApplyModalOpen(true)}
              />
            ) : (
              <div className="overflow-x-auto overflow-y-auto max-h-[520px] custom-scrollbar touch-pan-x touch-pan-y" data-lenis-prevent>
                <table className="w-full text-left text-xs sm:text-sm min-w-[650px]">
                  <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 shadow-2xs">
                    <tr className="text-slate-400 font-bold text-xs uppercase tracking-wider">
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
                          <CopyableText text={req.id} prefix="#" className="font-mono font-bold text-indigo-600 block" />
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

        {/* Tab 2: Team Approval Queue (Admin only) */}
        {isAdmin && activeTab === 'approvals' && (
          <div className="p-4 sm:p-5">
            {teamRequests.length === 0 ? (
              <EmptyState
                icon="check"
                title="No requests in this queue"
                description={
                  approvalFilter !== 'All'
                    ? `No leave requests with status "${approvalFilter}".`
                    : 'All employee leave applications are currently processed.'
                }
                actionLabel={approvalFilter !== 'All' ? 'View All Requests' : undefined}
                onAction={approvalFilter !== 'All' ? () => setApprovalFilter('All') : undefined}
              />
            ) : (
              <div className="overflow-x-auto overflow-y-auto max-h-[520px] custom-scrollbar touch-pan-x touch-pan-y" data-lenis-prevent>
                <table className="w-full text-left text-xs sm:text-sm min-w-[700px]">
                  <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 shadow-2xs">
                    <tr className="text-slate-400 font-bold text-xs uppercase tracking-wider">
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
                              Reviewed by {req.reviewedBy || 'Admin'}
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

        {/* Tab 3: Assign Yearly Leave Days Alone (Admin Only) */}
        {isAdmin && activeTab === 'yearly-quota' && (
          <div className="p-5 sm:p-6 space-y-6">
            {quotaSavedMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-bold animate-fadeIn flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{quotaSavedMsg}</span>
              </div>
            )}

            {/* Global Company Standard Yearly Allowance */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Company Standard Yearly Leave Allowance
                  </h3>
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">
                    Global Base
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Define the baseline yearly leave days entitled to all team members per calendar year. Employees without a custom allowance inherit this value.
                </p>

                <form onSubmit={handleSaveGlobalQuota} className="flex items-center gap-3">
                  <div>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={globalQuotaInput}
                      onChange={(e) => setGlobalQuotaInput(e.target.value)}
                      className="w-28 bg-white border border-slate-300 rounded-xl px-3 py-2 text-base font-bold font-mono text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                      required
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">Days / Year</span>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <FiSave className="w-3.5 h-3.5" /> Save Global Allowance
                  </button>
                </form>
              </div>
            </div>

            {/* Individual Employee Yearly Leave Days Roster */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Assign Yearly Leave Days per Employee
                  </h3>
                  <p className="text-xs text-slate-500">
                    Admin alone can customize and assign individual annual leave quotas for specific team members.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {eligibleStaff.length} Staff Members
                </span>
              </div>

              <div className="overflow-x-auto overflow-y-auto max-h-[460px] custom-scrollbar border border-slate-200/80 rounded-2xl shadow-xs" data-lenis-prevent>
                <table className="w-full text-left text-xs sm:text-sm min-w-[650px]">
                  <thead className="sticky top-0 z-10 bg-slate-100/90 backdrop-blur-xs border-b border-slate-200 shadow-2xs">
                    <tr className="text-slate-500 font-bold text-xs uppercase tracking-wider">
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-3 text-center">Approved Taken</th>
                      <th className="py-3 px-3 text-center">Available Balance</th>
                      <th className="py-3 px-4 text-right">Assign Yearly Days</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
                    {eligibleStaff.map((emp) => {
                      const empEmail = (emp.email || '').toLowerCase().trim();
                      const currentAssigned =
                        customLeaveAllowances[empEmail] !== undefined
                          ? customLeaveAllowances[empEmail]
                          : annualLeaveAllowance || 18;
                      const empBalances = getLeaveBalances(empEmail);
                      const inputValue =
                        employeeQuotaInputs[empEmail] !== undefined
                          ? employeeQuotaInputs[empEmail]
                          : currentAssigned;

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">{emp.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{emp.email}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                              {emp.role || 'Staff'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                            {empBalances.used} Days
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {empBalances.available} Days Left
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <input
                                type="number"
                                min="0"
                                max="60"
                                value={inputValue}
                                onChange={(e) =>
                                  setEmployeeQuotaInputs((prev) => ({
                                    ...prev,
                                    [empEmail]: e.target.value,
                                  }))
                                }
                                className="w-18 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-900 text-center focus:outline-none focus:border-indigo-500 focus:bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveEmployeeQuota(empEmail, inputValue)}
                                className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold text-xs border border-indigo-200 transition-all cursor-pointer shadow-2xs"
                                title="Assign quota to this employee"
                              >
                                Save
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: All Leave Records (Admin only) */}
        {isAdmin && activeTab === 'all-records' && (
          <div className="p-4 sm:p-5">
            {teamRequests.length === 0 ? (
              <EmptyState
                icon="document"
                title="No leave records"
                description={
                  approvalFilter !== 'All'
                    ? `No applications with status "${approvalFilter}".`
                    : 'No leave applications recorded in the system yet.'
                }
                actionLabel={approvalFilter !== 'All' ? 'View All Records' : undefined}
                onAction={approvalFilter !== 'All' ? () => setApprovalFilter('All') : undefined}
              />
            ) : (
              <div className="overflow-x-auto overflow-y-auto max-h-[520px] custom-scrollbar touch-pan-x touch-pan-y" data-lenis-prevent>
                <table className="w-full text-left text-xs sm:text-sm min-w-[700px]">
                  <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 shadow-2xs">
                    <tr className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                      <th className="py-3.5 px-3.5">Ref #</th>
                      <th className="py-3.5 px-3.5">Employee</th>
                      <th className="py-3.5 px-3.5">Leave Dates</th>
                      <th className="py-3.5 px-3 text-center">Duration</th>
                      <th className="py-3.5 px-3.5">Reason</th>
                      <th className="py-3.5 px-3.5 text-center">Status</th>
                      <th className="py-3.5 px-3.5">Reviewer Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {teamRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-3.5">
                          <CopyableText text={req.id} prefix="#" className="font-mono font-bold text-indigo-600 block" />
                          <span className="text-[11px] text-slate-400 font-mono">
                            {formatDateDMY(req.createdAt || req.appliedAt)}
                          </span>
                        </td>
                        <td className="py-3.5 px-3.5">
                          <span className="font-bold text-slate-900 block capitalize">{req.userName}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{req.userEmail}</span>
                        </td>
                        <td className="py-3.5 px-3.5 font-mono text-slate-700">
                          {formatDateDMY(req.startDate)}
                          {req.endDate && req.endDate !== req.startDate && ` → ${formatDateDMY(req.endDate)}`}
                        </td>
                        <td className="py-3.5 px-3 text-center font-bold text-slate-900 font-mono">
                          {req.days} {req.days === 1 ? 'Day' : 'Days'}
                        </td>
                        <td className="py-3.5 px-3.5 text-slate-700 max-w-[200px] truncate" title={req.reason}>
                          {req.reason}
                        </td>
                        <td className="py-3.5 px-3.5 text-center">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="py-3.5 px-3.5 text-slate-500 text-xs">
                          {req.managerNotes ? (
                            <span>
                              <span className="font-bold text-slate-700">{req.reviewedBy || 'Admin'}:</span> {req.managerNotes}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">—</span>
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
                disabled={isSubmittingReview}
                onClick={handleConfirmReview}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-xs transition-all cursor-pointer ${
                  isSubmittingReview ? 'opacity-60 cursor-not-allowed' : ''
                } ${
                  reviewAction === 'Approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isSubmittingReview ? 'Updating...' : `Confirm ${reviewAction}`}
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

      {/* Apply Leave Modal - only rendered for employees */}
      {!isAdmin && <ApplyLeaveModal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} />}
    </div>
  );
}

function StatusBadge({ status }) {
  return <StatusChip status={status} size="sm" />;
}
