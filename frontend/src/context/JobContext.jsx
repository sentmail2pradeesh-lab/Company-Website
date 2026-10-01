import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axios';
import {
  INITIAL_EDITORS,
  INITIAL_CLIENTS,
  INITIAL_JOBS,
  INITIAL_PRODUCTION_SHEETS,
  INITIAL_WORK_SESSIONS,
  INITIAL_ACTIVITIES,
  INITIAL_LEAVE_REQUESTS,
} from '../data/mockJobs';
import { useAuth } from './AuthContext';
import { checkStageUnlockStatus } from '../utils/pipelineHelper';

const LEGACY_MOCK_EMAILS = [
  'shwetha@aszen.com',
  'qa_perm_test@aszen.com',
  'testeditor@aszen.com',
  'karan@aszen.com',
  'varun@aszen.com',
  'siva@aszen.com',
  'dhanush@aszen.com',
  'chaithra@aszen.com',
  'sanjay@aszen.com',
  'david@aszen.com',
  'pallabi@aszen.com',
  'madhura@aszen.com',
  'selvi@aszen.com',
  'yogapriya@aszen.com',
  'ajith@aszen.com',
  'lalitha@aszen.com',
  'arun@aszen.com',
];

const LEGACY_MOCK_NAMES = [
  'david',
  'siva',
  'varun',
  'sanjay',
  'pallabi',
  'chaithra',
  'madhura',
  'selvi',
  'yoga priya',
  'ajith',
  'lalitha',
  'dhanush',
  'karan',
  'arun',
];

const JobContext = createContext(null);

export function JobProvider({ children }) {
  const { user } = useAuth();

  // Permanently purge previous-system legacy users & associated mock data from browser localStorage
  useEffect(() => {
    try {
      // 1. Purge previous-system legacy employees from cached local storage
      const savedEditors = localStorage.getItem('aszen_editors');
      if (savedEditors) {
        const parsed = JSON.parse(savedEditors);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(
            (e) =>
              !LEGACY_MOCK_EMAILS.includes((e.email || '').toLowerCase().trim()) &&
              !LEGACY_MOCK_NAMES.includes((e.name || '').toLowerCase().trim())
          );
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('aszen_editors', JSON.stringify(cleaned));
            setEditors(cleaned);
          }
        }
      }

      // 2. Purge legacy mock jobs (1001-1004) and production sheets
      const savedJobs = localStorage.getItem('aszen_jobs');
      if (savedJobs) {
        const parsed = JSON.parse(savedJobs);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(
            (j) => !['1001', '#1001', '1002', '#1002', '1003', '#1003', '1004', '#1004', '19723', '19722', '19721', '19720', '19719', '19718', '19717'].includes(String(j.id || j.jobNumber || ''))
          );
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('aszen_jobs', JSON.stringify(cleaned));
            setJobs(normalizeJobs(cleaned));
          }
        }
      }

      // 3. Purge legacy mock activities
      const savedActivities = localStorage.getItem('aszen_activities');
      if (savedActivities) {
        const parsed = JSON.parse(savedActivities);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(
            (a) =>
              !LEGACY_MOCK_EMAILS.includes((a.actorEmail || '').toLowerCase().trim()) &&
              !LEGACY_MOCK_NAMES.includes((a.actorName || '').toLowerCase().trim()) &&
              !['1001', '1002', '1003', '1004', 'LR-101', 'LR-102', 'LR-103', 'LR-104'].includes(String(a.jobId || '')) &&
              !['act-1', 'act-2', 'act-3', 'act-4', 'act-5', 'act-6', 'act-7', 'act-8', 'act-9', 'act-10', 'act-11', 'act-12'].includes(String(a.id || ''))
          );
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('aszen_activities', JSON.stringify(cleaned));
            setActivities(cleaned);
          }
        }
      }

      // 4. Purge legacy mock leave requests (LR-101 to LR-104)
      const savedLeaves = localStorage.getItem('aszen_leave_requests');
      if (savedLeaves) {
        const parsed = JSON.parse(savedLeaves);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(
            (l) =>
              !LEGACY_MOCK_EMAILS.includes((l.userEmail || '').toLowerCase().trim()) &&
              !['LR-101', 'LR-102', 'LR-103', 'LR-104'].includes(String(l.id || ''))
          );
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('aszen_leave_requests', JSON.stringify(cleaned));
            setLeaveRequests(cleaned);
          }
        }
      }

      // 5. Purge legacy work sessions of previous-system test accounts
      const savedSessions = localStorage.getItem('aszen_work_sessions');
      if (savedSessions) {
        const parsed = JSON.parse(savedSessions);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(
            (s) => !LEGACY_MOCK_EMAILS.includes((s.user_email || '').toLowerCase().trim())
          );
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('aszen_work_sessions', JSON.stringify(cleaned));
            setWorkSessions(cleaned);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);


  const STANDARD_STAGES = ['blending', 'path1', 'path2', 'editor1', 'editor2', 'lc', 'fc'];

  // Helper to ensure stage objects and standard fields are safely structured
  const normalizeJobs = (jobList) => {
    if (!Array.isArray(jobList)) return [];
    return jobList.map((job) => {
      if (!job) return job;
      const rawStages = job.stages || {};
      const normalizedStages = { ...rawStages };

      // Ensure all standard stages exist
      STANDARD_STAGES.forEach((key) => {
        if (!normalizedStages[key]) {
          normalizedStages[key] = {
            assignee: '',
            status: 'Unassigned',
            filesCount: 0,
            startTime: null,
            endTime: null,
            pausedDurationSeconds: 0,
            pauseLogs: [],
            outputCount: 0,
            currentPauseStart: null,
          };
        }
      });

      Object.keys(normalizedStages).forEach((key) => {
        const s = normalizedStages[key] || {};
        normalizedStages[key] = {
          assignee: s.assignee || '',
          status: s.status || (s.assignee ? 'Pending' : 'Unassigned'),
          filesCount: Number(s.filesCount) || 0,
          startTime: s.startTime || null,
          endTime: s.endTime || null,
          pausedDurationSeconds: Number(s.pausedDurationSeconds) || 0,
          pauseLogs: Array.isArray(s.pauseLogs) ? s.pauseLogs : [],
          outputCount: Number(s.outputCount) || 0,
          currentPauseStart: s.currentPauseStart || null,
        };
      });

      return {
        ...job,
        id: String(job.id || job.jobNumber || ''),
        jobNumber: String(job.jobNumber || job.id || ''),
        client: job.client || job.client_code || 'BE',
        name: job.name || job.service || 'Untitled Job',
        service: job.service || job.name || 'Untitled Job',
        outputTarget: Number(job.outputTarget !== undefined ? job.outputTarget : (job.output_target || 0)),
        stages: normalizedStages,
      };
    });
  };

  // State Management
  const [jobs, setJobs] = useState(() => {
    try {
      const saved = localStorage.getItem('aszen_jobs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(
            (j) => !['1001', '#1001', '1002', '#1002', '1003', '#1003', '1004', '#1004', '19723', '19722', '19721', '19720', '19719', '19718', '19717'].includes(String(j.id || j.jobNumber || '')) && !String(j.id || j.jobNumber || '').startsWith('1578')
          );
          if (cleaned.length > 0) {
            return normalizeJobs(cleaned);
          }
        }
      }
    } catch {}
    localStorage.setItem('aszen_jobs', JSON.stringify([]));
    return [];
  });

  const [editors, setEditors] = useState(() => {
    try {
      const saved = localStorage.getItem('aszen_editors');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter(
            (e) =>
              !LEGACY_MOCK_EMAILS.includes((e.email || '').toLowerCase().trim()) &&
              !LEGACY_MOCK_NAMES.includes((e.name || '').toLowerCase().trim())
          );
          return cleaned;
        }
      }
    } catch {}
    localStorage.setItem('aszen_editors', JSON.stringify([]));
    return [];
  });

  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('aszen_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [productionSheets, setProductionSheets] = useState(() => {
    const saved = localStorage.getItem('aszen_prod_sheets');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTION_SHEETS;
  });

  const [workSessions, setWorkSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('aszen_work_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((s) => !LEGACY_MOCK_EMAILS.includes((s.user_email || '').toLowerCase().trim()));
        }
      }
    } catch {}
    return [];
  });

  const [activities, setActivities] = useState(() => {
    try {
      const saved = localStorage.getItem('aszen_activities');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(
            (a) =>
              !LEGACY_MOCK_EMAILS.includes((a.actorEmail || '').toLowerCase().trim()) &&
              !LEGACY_MOCK_NAMES.includes((a.actorName || '').toLowerCase().trim()) &&
              !['1001', '1002', '1003', '1004', 'LR-101', 'LR-102', 'LR-103', 'LR-104'].includes(String(a.jobId || '')) &&
              !['act-1', 'act-2', 'act-3', 'act-4', 'act-5', 'act-6', 'act-7', 'act-8', 'act-9', 'act-10', 'act-11', 'act-12'].includes(String(a.id || ''))
          );
          if (cleaned.length > 0) {
            return cleaned;
          }
        }
      }
    } catch {}
    localStorage.setItem('aszen_activities', JSON.stringify([]));
    return [];
  });

  const [leaveRequests, setLeaveRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('aszen_leave_requests');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(
            (l) =>
              !LEGACY_MOCK_EMAILS.includes((l.userEmail || '').toLowerCase().trim()) &&
              !['LR-101', 'LR-102', 'LR-103', 'LR-104'].includes(String(l.id || ''))
          );
          return cleaned;
        }
      }
    } catch {}
    localStorage.setItem('aszen_leave_requests', JSON.stringify([]));
    return [];
  });

  // Modal active states
  const [timerModalState, setTimerModalState] = useState(null); // { jobId, stageKey }
  const [clientModalState, setClientModalState] = useState(null); // { jobId }
  const [assignModalState, setAssignModalState] = useState(null); // { jobId, stageKey }
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);

  // Real-time BroadcastChannel for 0ms cross-window / cross-tab updates
  const broadcastSync = useCallback((newJobs, newSheets, newEditors, newClients, newSessions, newActivities, newLeaves) => {
    try {
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('aszen_dashboard_realtime');
        channel.postMessage({
          type: 'REALTIME_UPDATE',
          jobs: newJobs,
          productionSheets: newSheets,
          editors: newEditors,
          clients: newClients,
          workSessions: newSessions,
          activities: newActivities,
          leaveRequests: newLeaves,
          timestamp: Date.now(),
        });
        setTimeout(() => {
          try { channel.close(); } catch {}
        }, 200);
      }
    } catch (e) {
      console.error('BroadcastChannel sync error:', e);
    }
  }, []);

  // Listen for real-time BroadcastChannel updates from other open windows/tabs
  useEffect(() => {
    if (!('BroadcastChannel' in window)) return;
    const channel = new BroadcastChannel('aszen_dashboard_realtime');

    channel.onmessage = (event) => {
      const data = event.data;
      if (data && data.type === 'REALTIME_UPDATE') {
        if (data.jobs) setJobs([...normalizeJobs(data.jobs)]);
        if (data.productionSheets) setProductionSheets([...(data.productionSheets || [])]);
        if (data.editors) setEditors([...(data.editors || [])]);
        if (data.clients) setClients([...(data.clients || [])]);
        if (data.workSessions) setWorkSessions([...(data.workSessions || [])]);
        if (data.activities) setActivities([...(data.activities || [])]);
        if (data.leaveRequests) setLeaveRequests([...(data.leaveRequests || [])]);
      } else if (data && data.type === 'ACTIVITY_LOGGED' && data.activity) {
        setActivities((prev) => [data.activity, ...prev.filter((a) => a.id !== data.activity.id).slice(0, 99)]);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  // Listen for cross-window LocalStorage updates
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'aszen_jobs' && e.newValue) setJobs([...normalizeJobs(JSON.parse(e.newValue))]);
      if (e.key === 'aszen_prod_sheets' && e.newValue) setProductionSheets(JSON.parse(e.newValue));
      if (e.key === 'aszen_editors' && e.newValue) setEditors(JSON.parse(e.newValue));
      if (e.key === 'aszen_clients' && e.newValue) setClients(JSON.parse(e.newValue));
      if (e.key === 'aszen_work_sessions' && e.newValue) setWorkSessions(JSON.parse(e.newValue));
      if (e.key === 'aszen_activities' && e.newValue) setActivities(JSON.parse(e.newValue));
      if (e.key === 'aszen_leave_requests' && e.newValue) setLeaveRequests(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Persist state updates to LocalStorage, SQLite/Postgres Backend & broadcast real-time
  const updateJobsState = (newJobs, targetJobToSync = null, targetStageToSync = null) => {
    const normalized = normalizeJobs(newJobs);
    setJobs([...normalized]);
    localStorage.setItem('aszen_jobs', JSON.stringify(normalized));
    broadcastSync(normalized, productionSheets, editors, clients, workSessions, activities, leaveRequests);

    const token = sessionStorage.getItem('aszen_token') || localStorage.getItem('aszen_token');
    if (token) {
      if (targetStageToSync?.jobId && targetStageToSync?.stageKey) {
        // Granular PATCH updates only the specific stage to prevent overwriting other concurrent editors
        api
          .patch(`/jobs/${targetStageToSync.jobId}/stages/${targetStageToSync.stageKey}`, targetStageToSync.data)
          .catch((err) => {
            console.error('Stage patch error:', err);
          });
      } else if (targetJobToSync) {
        api.put(`/jobs/${targetJobToSync.id || targetJobToSync.jobNumber}`, targetJobToSync).catch(() => {});
      }
    }
  };

  const updateProdSheetsState = (newSheets, currentJobs = null, newEntryToSync = null) => {
    setProductionSheets(newSheets);
    localStorage.setItem('aszen_prod_sheets', JSON.stringify(newSheets));
    const targetJobs = currentJobs ? normalizeJobs(currentJobs) : jobs;
    broadcastSync(targetJobs, newSheets, editors, clients, workSessions);

    const token = sessionStorage.getItem('aszen_token') || localStorage.getItem('aszen_token');
    if (token && newEntryToSync) {
      api.post('/jobs/production-sheets', newEntryToSync).catch(() => {});
    }
  };

  const updateEditorsState = (newEditors) => {
    setEditors(newEditors);
    localStorage.setItem('aszen_editors', JSON.stringify(newEditors));
    broadcastSync(jobs, productionSheets, newEditors, clients, workSessions);
  };

  const updateClientsState = (newClients) => {
    setClients(newClients);
    localStorage.setItem('aszen_clients', JSON.stringify(newClients));
    broadcastSync(jobs, productionSheets, editors, newClients, workSessions);
  };

  const updateWorkSessionsState = (newSessions) => {
    setWorkSessions(newSessions);
    localStorage.setItem('aszen_work_sessions', JSON.stringify(newSessions));
    broadcastSync(jobs, productionSheets, editors, clients, newSessions, activities, leaveRequests);
  };

  const updateActivitiesState = (newActivities) => {
    setActivities(newActivities);
    localStorage.setItem('aszen_activities', JSON.stringify(newActivities));
    broadcastSync(jobs, productionSheets, editors, clients, workSessions, newActivities, leaveRequests);
  };

  const updateLeaveRequestsState = (newLeaves) => {
    setLeaveRequests(newLeaves);
    localStorage.setItem('aszen_leave_requests', JSON.stringify(newLeaves));
    broadcastSync(jobs, productionSheets, editors, clients, workSessions, activities, newLeaves);
  };

  const formatTimeAmPm = (dateObj = new Date()) => {
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).toLowerCase();
  };

  const logActivity = useCallback((data) => {
    const actor = data.actorName || user?.name || (user?.email ? user.email.split('@')[0] : 'Staff');
    const actorRole = data.actorRole || user?.designation || user?.role || 'Employee';
    const now = new Date();
    const newAct = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now.toISOString(),
      timeStr: data.timeStr || formatTimeAmPm(now),
      jobId: String(data.jobId || ''),
      actionType: data.actionType || 'GENERAL_ACTIVITY',
      actorName: actor,
      actorEmail: data.actorEmail || user?.email || '',
      actorRole: actorRole,
      targetEmployee: data.targetEmployee || actor,
      previousAssignee: data.previousAssignee || '',
      text: data.text || `Action performed by ${actor}`,
      badgeColor: data.badgeColor || 'teal',
    };

    setActivities((prev) => {
      const updated = [newAct, ...prev.slice(0, 99)];
      localStorage.setItem('aszen_activities', JSON.stringify(updated));
      return updated;
    });

    try {
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('aszen_dashboard_realtime');
        channel.postMessage({ type: 'ACTIVITY_LOGGED', activity: newAct });
        setTimeout(() => { try { channel.close(); } catch {} }, 200);
      }
    } catch {}

    return newAct;
  }, [user]);

  const resetToSystemActivities = useCallback(() => {
    localStorage.setItem('aszen_activities', JSON.stringify([]));
    setActivities([]);
  }, []);

  const applyLeave = async (leaveData) => {
    const applicantName = leaveData.userName || user?.name || (user?.email ? user.email.split('@')[0] : 'Employee');
    const applicantEmail = leaveData.userEmail || user?.email || '';
    const newId = `LR-${Math.floor(100 + Math.random() * 900)}`;

    const newLeave = {
      id: newId,
      userEmail: applicantEmail,
      userName: applicantName,
      userRole: user?.designation || user?.role || 'Editor',
      leaveType: 'Leave',
      startDate: leaveData.startDate,
      endDate: leaveData.endDate || leaveData.startDate,
      days: Number(leaveData.days) || 1.0,
      isHalfDay: !!leaveData.isHalfDay,
      halfDayPeriod: leaveData.halfDayPeriod || '',
      reason: leaveData.reason || '',
      backupEmployee: leaveData.backupEmployee || '',
      emergencyContact: leaveData.emergencyContact || '',
      status: 'Pending',
      appliedAt: new Date().toISOString(),
      reviewedBy: '',
      reviewedAt: null,
      managerNotes: '',
    };

    const updated = [newLeave, ...leaveRequests];
    setLeaveRequests(updated);
    localStorage.setItem('aszen_leave_requests', JSON.stringify(updated));
    broadcastSync(jobs, productionSheets, editors, clients, workSessions, activities, updated);

    logActivity({
      actionType: 'LEAVE_REQUESTED',
      jobId: newId,
      actorName: applicantName,
      actorEmail: applicantEmail,
      targetEmployee: applicantName,
      text: `Leave Request #${newId} :: ${applicantName} applied for ${newLeave.days} day(s) leave`,
    });

    const token = sessionStorage.getItem('aszen_token') || localStorage.getItem('aszen_token');
    if (token) {
      try {
        await api.post('/leaves', newLeave);
      } catch (e) {
        console.warn('Backend leave sync notice:', e.message);
      }
    }

    return newLeave;
  };

  const updateLeaveStatus = async (leaveId, status, managerNotes = '') => {
    const reviewer = user?.name || (user?.email ? user.email.split('@')[0] : 'Manager');
    let targetLeave = null;

    const updated = leaveRequests.map((l) => {
      if (l.id === leaveId) {
        targetLeave = {
          ...l,
          status,
          reviewedBy: reviewer,
          reviewedAt: new Date().toISOString(),
          managerNotes: managerNotes || l.managerNotes,
        };
        return targetLeave;
      }
      return l;
    });

    setLeaveRequests(updated);
    localStorage.setItem('aszen_leave_requests', JSON.stringify(updated));
    broadcastSync(jobs, productionSheets, editors, clients, workSessions, activities, updated);

    if (targetLeave) {
      logActivity({
        actionType: status === 'Approved' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
        jobId: leaveId,
        actorName: reviewer,
        actorEmail: user?.email || '',
        targetEmployee: targetLeave.userName,
        text: `Leave Request #${leaveId} :: ${targetLeave.userName} ${targetLeave.days} Day leave ${status} by ${reviewer}${managerNotes ? ` (${managerNotes})` : ''}`,
      });

      const token = sessionStorage.getItem('aszen_token') || localStorage.getItem('aszen_token');
      if (token) {
        try {
          await api.patch(`/leaves/${leaveId}/status`, { status, managerNotes });
        } catch (e) {
          console.warn('Backend leave status sync notice:', e.message);
        }
      }
    }

    return targetLeave;
  };

  const cancelLeave = (leaveId) => {
    return updateLeaveStatus(leaveId, 'Cancelled', 'Cancelled by applicant');
  };

  const getLeaveBalances = (userEmail) => {
    const email = (userEmail || user?.email || '').toLowerCase();
    const approved = leaveRequests.filter(
      (l) => (l.userEmail || '').toLowerCase() === email && l.status === 'Approved'
    );
    const pending = leaveRequests.filter(
      (l) => (l.userEmail || '').toLowerCase() === email && l.status === 'Pending'
    );

    const usedDays = approved.reduce((sum, l) => sum + (Number(l.days) || 1), 0);
    const pendingDays = pending.reduce((sum, l) => sum + (Number(l.days) || 1), 0);
    const total = 18;
    const available = Math.max(0, total - usedDays);

    return {
      total,
      used: usedDays,
      available,
      pending: pendingDays,
      // For backwards compatibility:
      casual: { total, used: usedDays, available },
      sick: { total, used: usedDays, available },
      paid: { total, used: usedDays, available },
      compOff: { total, used: usedDays, available },
    };
  };

  const pendingLeaveCount = useMemo(() => {
    return leaveRequests.filter((l) => l.status === 'Pending').length;
  }, [leaveRequests]);



  const userRole = (user?.role || 'employee').toLowerCase();
  const userDesignation = user?.designation || 'Editor';
  const isDeveloper = userRole === 'developer' || userDesignation.toLowerCase() === 'developer';
  const isSeniorEditor = userDesignation.toLowerCase() === 'senior editor';
  const perms = user?.permissions || {};
  const isApproved = userRole === 'admin' || isDeveloper || user?.is_approved !== false;

  // Role, Designation & Dynamic Permissions Matrix (Admin & Developer can manage platform operations)
  const canCreateJob = isApproved && (userRole === 'admin' || userRole === 'manager' || isDeveloper || isSeniorEditor || !!perms.can_create_job);
  const canAssignJob = isApproved && (userRole === 'admin' || userRole === 'manager' || isDeveloper || isSeniorEditor || !!perms.can_edit_job);
  const canEditJob = canAssignJob;
  const canDeleteJob = isApproved && (userRole === 'admin' || userRole === 'manager' || isDeveloper || !!perms.can_delete_job);
  const canManageClients = isApproved && (userRole === 'admin' || isDeveloper || !!perms.can_manage_clients);
  const canManageEmployees = isApproved && (userRole === 'admin' || isDeveloper || !!perms.can_create_employee);
  const canManageWorkHours = isApproved && (userRole === 'admin' || userRole === 'manager' || isDeveloper || !!perms.can_manage_work_hours);

  // Check if current user can update a specific stage
  const canUpdateStage = (assigneeName) => {
    if (userRole === 'admin' || userRole === 'manager' || isDeveloper || isSeniorEditor || !!perms.can_edit_job) return true;
    if (!user?.name || !assigneeName) return false;
    return user.name.toLowerCase() === assigneeName.toLowerCase();
  };


  // Metric Calculation Helpers (Memoized to prevent unnecessary component re-renders)
  const stats = useMemo(() => ({
    totalJobs: jobs.length,
    totalFiles: jobs.reduce((acc, j) => acc + (j.outputTarget || 0), 0),
    completedJobs: jobs.filter((j) =>
      Object.values(j.stages || {}).every((s) => s?.status === 'Complete' || !s?.assignee)
    ).length,
    pendingJobs: jobs.filter((j) =>
      Object.values(j.stages || {}).some((s) => s?.status === 'Pending' || s?.status === 'In-Progress' || s?.status === 'Paused')
    ).length,
    blendingPendingJobs: jobs.filter((j) => j.stages?.blending && (j.stages.blending.status === 'In-Progress' || j.stages.blending.status === 'Pending')).length,
    pathPendingJobs: jobs.filter((j) => (j.stages?.path1 && j.stages.path1.status !== 'Complete' && j.stages.path1.assignee) || (j.stages?.path2 && j.stages.path2.status !== 'Complete' && j.stages.path2.assignee)).length,
    editingPendingJobs: jobs.filter((j) => (j.stages?.editor1 && j.stages.editor1.status !== 'Complete' && j.stages.editor1.assignee) || (j.stages?.editor2 && j.stages.editor2.status !== 'Complete' && j.stages.editor2.assignee)).length,
    lcPendingJobs: jobs.filter((j) => j.stages?.lc && (j.stages.lc.status === 'In-Progress' || j.stages.lc.status === 'Pending')).length,
    fcPendingJobs: jobs.filter((j) => j.stages?.fc && (j.stages.fc.status === 'In-Progress' || j.stages.fc.status === 'Pending')).length,
    qcPendingJobs: jobs.filter((j) => (j.stages?.fc && (j.stages.fc.status === 'In-Progress' || j.stages.fc.status === 'Pending')) || (j.stages?.lc && (j.stages.lc.status === 'In-Progress' || j.stages.lc.status === 'Pending')) || (j.stages?.qc && (j.stages.qc.status === 'In-Progress' || j.stages.qc.status === 'Pending'))).length,
  }), [jobs]);

  // Job Actions
  const createJob = async (newJobData) => {
    const existingIds = jobs.map((j) => parseInt(String(j.id || j.jobNumber || 0), 10)).filter((n) => !isNaN(n));
    const highestId = existingIds.length > 0 ? Math.max(1000, ...existingIds) : 1000;
    const newId = (highestId + 1).toString();

    const path1Files = Number(newJobData.path1Files) || Number(newJobData.outputTarget) || 0;
    const path2Files = Number(newJobData.path2Files) || 0;
    const editor1Files = Number(newJobData.editor1Files) || Number(newJobData.outputTarget) || 0;
    const editor2Files = Number(newJobData.editor2Files) || 0;
    const blendingFiles = Number(newJobData.blendingFiles) || Number(newJobData.outputTarget) || 0;
    const lcFiles = Number(newJobData.lcFiles) || Number(newJobData.outputTarget) || 0;
    const fcFiles = Number(newJobData.fcFiles) || Number(newJobData.outputTarget) || 0;

    const formattedJob = {
      id: newId,
      jobNumber: newId,
      client: newJobData.client || 'BE',
      category: newJobData.category || 'Photo Editing',
      name: newJobData.name || 'Untitled Job',
      level: newJobData.level || 'Level 1',
      folderCount: Number(newJobData.folderCount) || 1,
      folderTargets: newJobData.folderTargets || [],
      outputTarget: Number(newJobData.outputTarget) || 0,
      actualOutput: 0,
      instruction: newJobData.instruction || '',
      clientEntryTime: newJobData.clientEntryTime || new Date().toISOString().slice(0, 16),
      clientTargetTime: newJobData.clientTargetTime || '',
      clientFinishTime: null,
      stages: {
        blending: {
          assignee: newJobData.blendingAssignee || '',
          status: newJobData.blendingAssignee ? 'Pending' : 'Unassigned',
          filesCount: blendingFiles,
          startTime: null,
          endTime: null,
          pausedDurationSeconds: 0,
          pauseLogs: [],
          outputCount: 0,
        },
        path1: {
          assignee: newJobData.path1Assignee || '',
          status: newJobData.path1Assignee ? 'Pending' : 'Unassigned',
          filesCount: path1Files,
          startTime: null,
          endTime: null,
          pausedDurationSeconds: 0,
          pauseLogs: [],
          outputCount: 0,
        },
        path2: {
          assignee: newJobData.path2Assignee || '',
          status: newJobData.path2Assignee ? 'Pending' : 'Unassigned',
          filesCount: path2Files,
          startTime: null,
          endTime: null,
          pausedDurationSeconds: 0,
          pauseLogs: [],
          outputCount: 0,
        },
        editor1: {
          assignee: newJobData.editor1Assignee || '',
          status: newJobData.editor1Assignee ? 'Pending' : 'Unassigned',
          filesCount: editor1Files,
          startTime: null,
          endTime: null,
          pausedDurationSeconds: 0,
          pauseLogs: [],
          outputCount: 0,
        },
        editor2: {
          assignee: newJobData.editor2Assignee || '',
          status: newJobData.editor2Assignee ? 'Pending' : 'Unassigned',
          filesCount: editor2Files,
          startTime: null,
          endTime: null,
          pausedDurationSeconds: 0,
          pauseLogs: [],
          outputCount: 0,
        },
        lc: {
          assignee: newJobData.lcAssignee || '',
          status: newJobData.lcAssignee ? 'Pending' : 'Unassigned',
          filesCount: lcFiles,
          startTime: null,
          endTime: null,
          pausedDurationSeconds: 0,
          pauseLogs: [],
          outputCount: 0,
        },
        fc: {
          assignee: newJobData.fcAssignee || '',
          status: newJobData.fcAssignee ? 'Pending' : 'Unassigned',
          filesCount: fcFiles,
          startTime: null,
          endTime: null,
          pausedDurationSeconds: 0,
          pauseLogs: [],
          outputCount: 0,
        },
      },
    };

    const token = sessionStorage.getItem('aszen_token') || localStorage.getItem('aszen_token');
    if (token) {
      try {
        const res = await api.post('/jobs', formattedJob);
        if (res.data?.job) {
          const createdJob = normalizeJobs([res.data.job])[0];
          updateJobsState([createdJob, ...jobs.filter((j) => j.id !== createdJob.id)]);
          setIsCreateModalOpen(false);
          return createdJob;
        }
      } catch (err) {
        console.error('Create job API error:', err);
      }
    }

    updateJobsState([formattedJob, ...jobs]);
    setIsCreateModalOpen(false);

    logActivity({
      actionType: 'JOB_CREATED',
      jobId: newId,
      actorName: user?.name || 'Staff',
      actorRole: user?.designation || user?.role || 'Staff',
      text: `Job #${newId} :: Order and Job Created by ${user?.name || 'Staff'}`,
    });

    return formattedJob;
  };

  const deleteJob = async (jobId) => {
    if (!canDeleteJob) {
      alert('Only Admin or Manager can delete jobs.');
      return;
    }
    const token = sessionStorage.getItem('aszen_token') || localStorage.getItem('aszen_token');
    if (token && jobId) {
      try {
        await api.delete(`/jobs/${jobId}`);
      } catch (err) {
        console.error('Delete job API error:', err);
      }
    }
    updateJobsState(jobs.filter((j) => j.id !== jobId && j.jobNumber !== jobId));

    const actor = user?.name || (user?.email ? user.email.split('@')[0] : 'Staff');
    logActivity({
      actionType: 'JOB_DELETED',
      jobId: String(jobId),
      actorName: actor,
      actorRole: user?.designation || user?.role || 'Staff',
      targetEmployee: actor,
      text: `Job #${jobId} :: Job Deleted by ${actor}`,
    });
  };

  const assignStage = (jobId, stageKey, assigneeName) => {
    if (!canAssignJob) {
      alert('Permission Denied: Only Manager or Admin can assign team members to job stages.');
      return;
    }
    let targetStagePayload = null;
    let prevAssignee = '';
    const updated = jobs.map((j) => {
      if (j.id === jobId) {
        prevAssignee = j.stages[stageKey]?.assignee || '';
        const nextStatus = j.stages[stageKey].status === 'Unassigned' ? 'Pending' : j.stages[stageKey].status;
        const updatedJob = {
          ...j,
          stages: {
            ...j.stages,
            [stageKey]: {
              ...j.stages[stageKey],
              assignee: assigneeName,
              status: nextStatus,
            },
          },
        };
        targetStagePayload = {
          jobId,
          stageKey,
          data: {
            assignee: assigneeName,
            status: nextStatus,
          },
        };
        return updatedJob;
      }
      return j;
    });
    updateJobsState(updated, null, targetStagePayload);
    setAssignModalState(null);

    const actor = user?.name || (user?.email ? user.email.split('@')[0] : 'Staff');
    const stageLabels = {
      blending: 'Blending',
      path1: 'Path 1',
      path2: 'Path 2',
      editor1: 'Editor 1',
      editor2: 'Editor 2',
      lc: 'LC Stage',
      fc: 'FC Stage',
      qc: 'QC Stage',
    };
    const stageLabel = stageLabels[stageKey] || stageKey.toUpperCase();
    const isReassign = Boolean(prevAssignee && prevAssignee !== assigneeName);
    logActivity({
      actionType: isReassign ? 'STAGE_REASSIGNED' : 'STAGE_ASSIGNED',
      jobId,
      actorName: actor,
      actorRole: user?.designation || user?.role || 'Staff',
      targetEmployee: assigneeName,
      previousAssignee: prevAssignee,
      text: isReassign
        ? `Job #${jobId} :: ${stageLabel} reassigned from ${prevAssignee} to ${assigneeName} by ${actor}`
        : `Job #${jobId} :: ${stageLabel} assigned to ${assigneeName} by ${actor}`,
    });
  };

  // Timer Actions (Start, Pause, Resume, Finish)
  const startStageTimer = (jobId, stageKey) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      const stage = job.stages ? job.stages[stageKey] : null;
      if (stage && !canUpdateStage(stage.assignee)) {
        alert(`Permission Denied: Only ${stage.assignee || 'the assigned employee'}, Manager, or Admin can update this stage.`);
        return;
      }
      const unlockInfo = checkStageUnlockStatus(job, stageKey);
      if (!unlockInfo.isUnlocked) {
        alert(`Stage Locked: ${unlockInfo.lockedReason}`);
        return;
      }
    }
    const nowIso = new Date().toISOString();
    let targetStagePayload = null;
    const updated = jobs.map((j) => {
      if (j.id === jobId) {
        const sTime = j.stages[stageKey].startTime || nowIso;
        const updatedJob = {
          ...j,
          stages: {
            ...j.stages,
            [stageKey]: {
              ...j.stages[stageKey],
              status: 'In-Progress',
              startTime: sTime,
            },
          },
        };
        targetStagePayload = {
          jobId,
          stageKey,
          data: {
            status: 'In-Progress',
            startTime: sTime,
          },
        };
        return updatedJob;
      }
      return j;
    });
    updateJobsState(updated, null, targetStagePayload);

    const actor = user?.name || (user?.email ? user.email.split('@')[0] : 'Staff');
    const stageLabels = {
      blending: 'Blending',
      path1: 'Path 1',
      path2: 'Path 2',
      editor1: 'Editor 1',
      editor2: 'Editor 2',
      lc: 'LC Stage',
      fc: 'FC Stage',
      qc: 'QC Stage',
    };
    const stageLabel = stageLabels[stageKey] || stageKey.toUpperCase();
    const stageObj = job?.stages ? job.stages[stageKey] : null;
    const assignee = stageObj?.assignee || actor;
    logActivity({
      actionType: 'STAGE_STARTED',
      jobId,
      actorName: actor,
      actorRole: user?.designation || user?.role || 'Staff',
      targetEmployee: assignee,
      text: `Job #${jobId} :: ${stageLabel} started by ${actor}`,
    });
  };

  const pauseStageTimer = (jobId, stageKey, reason) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      const stage = job.stages ? job.stages[stageKey] : null;
      if (stage && !canUpdateStage(stage.assignee)) {
        alert(`Permission Denied: Only ${stage.assignee || 'the assigned employee'}, Manager, or Admin can update this stage.`);
        return;
      }
    }
    const nowIso = new Date().toISOString();
    let targetStagePayload = null;
    const updated = jobs.map((j) => {
      if (j.id === jobId) {
        const currentStage = j.stages[stageKey];
        const newLogs = [
          ...(currentStage.pauseLogs || []),
          { reason: reason || 'Break', timestamp: nowIso, duration: 0 },
        ];
        const updatedJob = {
          ...j,
          stages: {
            ...j.stages,
            [stageKey]: {
              ...currentStage,
              status: 'Paused',
              currentPauseStart: nowIso,
              pauseLogs: newLogs,
            },
          },
        };
        targetStagePayload = {
          jobId,
          stageKey,
          data: {
            status: 'Paused',
            currentPauseStart: nowIso,
            pauseLogs: newLogs,
          },
        };
        return updatedJob;
      }
      return j;
    });
    updateJobsState(updated, null, targetStagePayload);

    const actor = user?.name || (user?.email ? user.email.split('@')[0] : 'Staff');
    const stageLabels = {
      blending: 'Blending',
      path1: 'Path 1',
      path2: 'Path 2',
      editor1: 'Editor 1',
      editor2: 'Editor 2',
      lc: 'LC Stage',
      fc: 'FC Stage',
      qc: 'QC Stage',
    };
    const stageLabel = stageLabels[stageKey] || stageKey.toUpperCase();
    const stageObj = job?.stages ? job.stages[stageKey] : null;
    const assignee = stageObj?.assignee || actor;
    logActivity({
      actionType: 'STAGE_PAUSED',
      jobId,
      actorName: actor,
      actorRole: user?.designation || user?.role || 'Staff',
      targetEmployee: assignee,
      text: `Job #${jobId} :: ${stageLabel} paused (${reason || 'Break'}) by ${actor}`,
    });
  };

  const resumeStageTimer = (jobId, stageKey) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      const stage = job.stages ? job.stages[stageKey] : null;
      if (stage && !canUpdateStage(stage.assignee)) {
        alert(`Permission Denied: Only ${stage.assignee || 'the assigned employee'}, Manager, or Admin can update this stage.`);
        return;
      }
    }
    const now = new Date();
    let targetStagePayload = null;
    const updated = jobs.map((j) => {
      if (j.id === jobId) {
        const currentStage = j.stages[stageKey];
        const pauseStart = currentStage.currentPauseStart ? new Date(currentStage.currentPauseStart) : now;
        const diffSeconds = Math.round((now - pauseStart) / 1000);

        const updatedLogs = [...(currentStage.pauseLogs || [])];
        if (updatedLogs.length > 0) {
          updatedLogs[updatedLogs.length - 1].duration = diffSeconds;
        }

        const newPausedDuration = (currentStage.pausedDurationSeconds || 0) + diffSeconds;
        const updatedJob = {
          ...j,
          stages: {
            ...j.stages,
            [stageKey]: {
              ...currentStage,
              status: 'In-Progress',
              currentPauseStart: null,
              pausedDurationSeconds: newPausedDuration,
              pauseLogs: updatedLogs,
            },
          },
        };
        targetStagePayload = {
          jobId,
          stageKey,
          data: {
            status: 'In-Progress',
            currentPauseStart: null,
            pausedDurationSeconds: newPausedDuration,
            pauseLogs: updatedLogs,
          },
        };
        return updatedJob;
      }
      return j;
    });
    updateJobsState(updated, null, targetStagePayload);

    const actor = user?.name || (user?.email ? user.email.split('@')[0] : 'Staff');
    const stageLabels = {
      blending: 'Blending',
      path1: 'Path 1',
      path2: 'Path 2',
      editor1: 'Editor 1',
      editor2: 'Editor 2',
      lc: 'LC Stage',
      fc: 'FC Stage',
      qc: 'QC Stage',
    };
    const stageLabel = stageLabels[stageKey] || stageKey.toUpperCase();
    const stageObj = job?.stages ? job.stages[stageKey] : null;
    const assignee = stageObj?.assignee || actor;
    logActivity({
      actionType: 'STAGE_RESUMED',
      jobId,
      actorName: actor,
      actorRole: user?.designation || user?.role || 'Staff',
      targetEmployee: assignee,
      text: `Job #${jobId} :: ${stageLabel} resumed by ${actor}`,
    });
  };

  const finishStageTimer = (jobId, stageKey, outputFilesCount) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      const stage = job.stages ? job.stages[stageKey] : null;
      if (stage && !canUpdateStage(stage.assignee)) {
        alert(`Permission Denied: Only ${stage.assignee || 'the assigned employee'}, Manager, or Admin can update this stage.`);
        return;
      }
    }
    const nowIso = new Date().toISOString();
    let updatedTargetJob = null;
    let targetStagePayload = null;

    const updated = jobs.map((j) => {
      if (j.id === jobId) {
        const currentStage = j.stages[stageKey];
        const outCount = Number(outputFilesCount) || j.outputTarget;
        const updatedStage = {
          ...currentStage,
          status: 'Complete',
          endTime: nowIso,
          outputCount: outCount,
        };

        let finishTime = j.clientFinishTime;
        if (stageKey === 'fc') {
          finishTime = nowIso;
        }

        const newJobObj = {
          ...j,
          clientFinishTime: finishTime,
          stages: {
            ...j.stages,
            [stageKey]: updatedStage,
          },
        };
        updatedTargetJob = newJobObj;
        targetStagePayload = {
          jobId,
          stageKey,
          data: {
            status: 'Complete',
            endTime: nowIso,
            outputCount: outCount,
          },
        };
        return newJobObj;
      }
      return j;
    });

    updateJobsState(updated, null, targetStagePayload);

    const stageLabels = {
      blending: 'Blending',
      lc: 'LC Stage',
      path1: 'Path 1',
      path2: 'Path 2',
      editor1: 'Editor 1',
      editor2: 'Editor 2',
      qc: 'QC Stage',
      fc: 'FC Stage',
    };

    // Auto-create a production sheet entry
    if (updatedTargetJob) {
      const stageObj = updatedTargetJob.stages[stageKey];
      const startMs = stageObj.startTime ? new Date(stageObj.startTime).getTime() : Date.now();
      const endMs = Date.now();
      const grossMinutes = Math.max(1, Math.round((endMs - startMs) / 60000));
      const pauseMins = Math.round((stageObj.pausedDurationSeconds || 0) / 60);

      const newEntry = {
        id: `ps-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().slice(0, 10),
        editorName: stageObj.assignee || user?.name || 'Employee',
        role: stageLabels[stageKey] || stageKey,
        jobId: updatedTargetJob.id,
        client: updatedTargetJob.client,
        stage: stageLabels[stageKey] || stageKey,
        filesProcessed: Number(outputFilesCount) || updatedTargetJob.outputTarget,
        activeMinutes: Math.max(0, grossMinutes - pauseMins),
        pauseMinutes: pauseMins,
        status: 'Verified',
      };
      updateProdSheetsState([newEntry, ...productionSheets], updated, newEntry);
    }

    const actor = user?.name || (user?.email ? user.email.split('@')[0] : 'Staff');
    const stageObj = updatedTargetJob ? updatedTargetJob.stages[stageKey] : null;
    const assignee = stageObj?.assignee || actor;
    const fileCount = Number(outputFilesCount) || (updatedTargetJob ? updatedTargetJob.outputTarget : 0);
    logActivity({
      actionType: 'STAGE_COMPLETED',
      jobId,
      actorName: actor,
      actorRole: user?.designation || user?.role || 'Staff',
      targetEmployee: assignee,
      text: `Job #${jobId} :: ${stageLabels[stageKey] || stageKey} completed by ${actor}${fileCount ? ` (${fileCount} files)` : ''}`,
    });

    setTimerModalState(null);
  };

  const updateClientTurnaround = (jobId, entryTime, targetTime, finishTime) => {
    let targetJob = null;
    const updated = jobs.map((j) => {
      if (j.id === jobId) {
        const updatedJob = {
          ...j,
          clientEntryTime: entryTime,
          clientTargetTime: targetTime,
          clientFinishTime: finishTime || j.clientFinishTime,
        };
        targetJob = updatedJob;
        return updatedJob;
      }
      return j;
    });
    updateJobsState(updated, targetJob);

    const actor = user?.name || (user?.email ? user.email.split('@')[0] : 'Staff');
    logActivity({
      actionType: 'TURNAROUND_UPDATED',
      jobId,
      actorName: actor,
      actorRole: user?.designation || user?.role || 'Staff',
      targetEmployee: actor,
      text: `Job #${jobId} :: Target Delivery Time updated by ${actor}`,
    });

    setClientModalState(null);
  };

  // Live Refresh data function without page reload
  const refreshData = useCallback(async () => {
    try {
      const [jobsRes, sheetsRes, clientsRes] = await Promise.allSettled([
        api.get('/jobs'),
        api.get('/jobs/production-sheets'),
        api.get('/clients'),
      ]);
      if (jobsRes.status === 'fulfilled' && Array.isArray(jobsRes.value.data?.jobs)) {
        const normalized = normalizeJobs(jobsRes.value.data.jobs);
        setJobs(normalized);
        localStorage.setItem('aszen_jobs', JSON.stringify(normalized));
      }
      if (sheetsRes.status === 'fulfilled' && Array.isArray(sheetsRes.value.data?.productionSheets)) {
        setProductionSheets(sheetsRes.value.data.productionSheets);
        localStorage.setItem('aszen_prod_sheets', JSON.stringify(sheetsRes.value.data.productionSheets));
      }
      if (clientsRes.status === 'fulfilled' && Array.isArray(clientsRes.value.data?.clients)) {
        const mapped = clientsRes.value.data.clients.map((c) => ({
          id: c.id,
          code: c.code,
          name: c.name,
          contact: c.contact,
        }));
        setClients(mapped);
        localStorage.setItem('aszen_clients', JSON.stringify(mapped));
      }
    } catch (e) {
      console.error('Refresh data error:', e);
    }
  }, []);

  // Periodic active-tab background sync (every 20s for seamless cross-workstation real-time updates)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refreshData();
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [user, refreshData]);

  // Sync jobs from backend API on mount / user change
  useEffect(() => {
    api
      .get('/jobs')
      .then((res) => {
        if (Array.isArray(res.data?.jobs)) {
          const normalized = normalizeJobs(res.data.jobs);
          setJobs(normalized);
          localStorage.setItem('aszen_jobs', JSON.stringify(normalized));
        }
      })
      .catch(() => {});
  }, [user]);

  // Sync production sheets from backend API on mount / user change
  useEffect(() => {
    api
      .get('/jobs/production-sheets')
      .then((res) => {
        if (Array.isArray(res.data?.productionSheets)) {
          setProductionSheets(res.data.productionSheets);
          localStorage.setItem('aszen_prod_sheets', JSON.stringify(res.data.productionSheets));
        }
      })
      .catch(() => {});
  }, [user]);

  // Sync clients from backend API on mount / user change
  useEffect(() => {
    api
      .get('/clients')
      .then((res) => {
        if (Array.isArray(res.data?.clients)) {
          const mapped = res.data.clients.map((c) => ({
            id: c.id,
            code: c.code,
            name: c.name,
            contact: c.contact,
          }));
          setClients(mapped);
          localStorage.setItem('aszen_clients', JSON.stringify(mapped));
        }
      })
      .catch(() => {
        // Offline fallback
      });
  }, [user]);

  // Client Management (Admin)
  const addClient = async (clientData) => {
    const token = sessionStorage.getItem('aszen_token');
    try {
      if (token) {
        const res = await api.post('/clients', {
          code: (clientData.code || 'NEW').toUpperCase(),
          name: clientData.name || 'New Client',
          contact: clientData.contact || '',
        });
        const created = res.data.client;
        const newClient = {
          id: created.id,
          code: created.code,
          name: created.name,
          contact: created.contact,
        };
        updateClientsState([...clients, newClient]);
        return;
      }
    } catch (err) {
      console.error('Add client API error:', err);
    }

    // Demo fallback
    const newClient = {
      id: `c-${Date.now().toString().slice(-4)}`,
      code: (clientData.code || 'NEW').toUpperCase(),
      name: clientData.name || 'New Client',
      contact: clientData.contact || '',
    };
    updateClientsState([...clients, newClient]);
  };

  const deleteClient = async (clientId) => {
    const token = sessionStorage.getItem('aszen_token') || localStorage.getItem('aszen_token');
    try {
      if (token && clientId) {
        const idToPass = typeof clientId === 'number' ? clientId : parseInt(String(clientId).replace('c-', ''), 10);
        if (!isNaN(idToPass) && idToPass > 0) {
          await api.delete(`/clients/${idToPass}`);
        }
      }
    } catch (err) {
      console.error('Delete client API error:', err);
    }
    updateClientsState(clients.filter((c) => c.id !== clientId));
  };

  // Sync registered users/editors from backend API on mount / user change
  useEffect(() => {
    const token = sessionStorage.getItem('aszen_token') || localStorage.getItem('aszen_token');
    if (token) {
      api
        .get('/auth/users')
        .then((res) => {
          if (Array.isArray(res.data?.users)) {
            const mapped = res.data.users
              .filter(
                (u) =>
                  u.role !== 'admin' &&
                  !LEGACY_MOCK_EMAILS.includes((u.email || '').toLowerCase().trim()) &&
                  !LEGACY_MOCK_NAMES.includes((u.name || '').toLowerCase().trim())
              )
              .map((u) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.designation || (u.role === 'manager' ? 'Manager' : 'Editor'),
                designation: u.designation || (u.role === 'manager' ? 'Manager' : 'Editor'),
                is_approved: u.is_approved !== false,
                permissions: u.permissions || {},
              }));

            setEditors(mapped);
            localStorage.setItem('aszen_editors', JSON.stringify(mapped));
          }
        })
        .catch(() => {
          // Offline fallback
        });
    }
  }, [user]);

  // Sync work sessions from backend API on mount / user change
  useEffect(() => {
    const token = sessionStorage.getItem('aszen_token') || localStorage.getItem('aszen_token');
    if (token) {
      api
        .get('/work-hours/all')
        .then((res) => {
          if (Array.isArray(res.data?.sessions)) {
            setWorkSessions(res.data.sessions);
            localStorage.setItem('aszen_work_sessions', JSON.stringify(res.data.sessions));
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Employee Management (Admin)
  const addEmployee = async (empData) => {
    const token = sessionStorage.getItem('aszen_token') || localStorage.getItem('aszen_token');
    const isEmpDev = (empData.designation || empData.role || '').toLowerCase() === 'developer';
    const defaultPerms = empData.permissions || (isEmpDev ? {
      can_create_job: true,
      can_edit_job: true,
      can_delete_job: true,
      can_create_employee: true,
      can_manage_clients: true,
      can_manage_work_hours: true,
    } : {
      can_create_job: false,
      can_edit_job: false,
      can_delete_job: false,
      can_create_employee: false,
      can_manage_clients: false,
      can_manage_work_hours: false,
    });
    try {
      if (token) {
        const res = await api.post('/auth/users', {
          name: empData.name,
          email: empData.email,
          designation: empData.designation || empData.role || 'Editor',
          password: empData.password || 'Aszen@123',
          is_approved: empData.is_approved !== undefined ? empData.is_approved : true,
          permissions: defaultPerms,
        });
        const created = res.data.user;
        const newEmp = {
          id: created.id,
          name: created.name,
          email: created.email,
          role: created.designation || created.role,
          designation: created.designation || created.role,
          is_approved: created.is_approved !== false,
          permissions: created.permissions || defaultPerms,
        };
        const updatedList = [newEmp, ...editors.filter((e) => e.email !== newEmp.email && e.id !== newEmp.id)];
        updateEditorsState(updatedList);
        logActivity({
          actionType: 'USER_CREATED',
          actorName: user?.name || 'Admin',
          targetEmployee: newEmp.name,
          text: `User Profile #${newEmp.id} :: New Employee ${newEmp.name} (${newEmp.role}) added to users list by ${user?.name || 'Admin'}`,
        });
        return newEmp;
      }
    } catch (err) {
      console.error('Add user API error:', err);
    }

    // Demo fallback
    const newEmp = {
      id: `e-${Date.now().toString().slice(-4)}`,
      name: empData.name || 'New Employee',
      role: empData.designation || empData.role || 'Editor',
      designation: empData.designation || 'Editor',
      email: empData.email || '',
      is_approved: empData.is_approved !== undefined ? empData.is_approved : true,
      permissions: defaultPerms,
    };
    const updatedList = [newEmp, ...editors.filter((e) => e.email !== newEmp.email && e.id !== newEmp.id)];
    updateEditorsState(updatedList);
    logActivity({
      actionType: 'USER_CREATED',
      actorName: user?.name || 'Admin',
      targetEmployee: newEmp.name,
      text: `User Profile #${newEmp.id} :: New Employee ${newEmp.name} (${newEmp.role}) added to users list by ${user?.name || 'Admin'}`,
    });
    return newEmp;
  };

  const updateEmployeePermissions = async (empId, updateData) => {
    const token = sessionStorage.getItem('aszen_token') || localStorage.getItem('aszen_token');
    try {
      if (token && empId) {
        const idToPass = typeof empId === 'number' ? empId : parseInt(String(empId).replace('e-', ''), 10);
        if (!isNaN(idToPass) && idToPass > 0) {
          const res = await api.patch(`/auth/users/${idToPass}/permissions`, updateData);
          if (res.data?.user) {
            const updated = res.data.user;
            const updatedList = editors.map((e) =>
              (e.id === empId || e.id === updated.id)
                ? {
                    ...e,
                    is_approved: updated.is_approved !== false,
                    permissions: updated.permissions || {},
                    designation: updated.designation || e.designation,
                    role: updated.designation || e.role,
                  }
                : e
            );
            updateEditorsState(updatedList);
            return res.data.user;
          }
        }
      }
    } catch (err) {
      console.error('Update employee permissions API error:', err);
      throw err;
    }

    // Demo / offline fallback
    const updatedList = editors.map((e) =>
      e.id === empId
        ? {
            ...e,
            is_approved: updateData.is_approved !== undefined ? updateData.is_approved : e.is_approved,
            permissions: { ...(e.permissions || {}), ...(updateData.permissions || {}) },
            designation: updateData.designation || e.designation,
            role: updateData.designation || e.role,
          }
        : e
    );
    updateEditorsState(updatedList);
  };

  const deleteEmployee = async (empId) => {
    const token = sessionStorage.getItem('aszen_token') || localStorage.getItem('aszen_token');
    try {
      if (token && empId) {
        const idToPass = typeof empId === 'number' ? empId : parseInt(String(empId).replace('e-', ''), 10);
        if (!isNaN(idToPass) && idToPass > 0) {
          await api.delete(`/auth/users/${idToPass}`);
        }
      }
    } catch (err) {
      console.error('Delete user API error:', err);
    }
    updateEditorsState(editors.filter((e) => e.id !== empId));
  };

  // Work Session / Attendance Management (Manager & Admin Only)
  const addWorkSession = async (sessionData) => {
    if (userRole !== 'admin' && userRole !== 'manager') {
      alert('Permission Denied: Only Manager or Admin can add working hour logs.');
      return;
    }
    const token = sessionStorage.getItem('aszen_token') || localStorage.getItem('aszen_token');
    const loginDt = sessionData.login_time || new Date().toISOString();
    const logoutDt = sessionData.logout_time || null;
    let hours = Number(sessionData.total_hours) || 0;
    if (!hours && loginDt && logoutDt) {
      hours = Math.max(0, Math.round(((new Date(logoutDt) - new Date(loginDt)) / 3600000) * 100) / 100);
    }
    const newSession = {
      id: `ws-${Date.now().toString().slice(-4)}`,
      user_name: sessionData.user_name || 'Employee',
      user_email: sessionData.user_email || `${(sessionData.user_name || 'employee').toLowerCase().replace(/\s+/g, '')}@vistaeditz.com`,
      user_role: 'employee',
      date: sessionData.date || new Date().toISOString().slice(0, 10),
      login_time: loginDt,
      logout_time: logoutDt,
      total_hours: hours,
      status: logoutDt ? 'Completed' : 'Active',
      notes: sessionData.notes || `Added by ${user?.name || userRole}`,
    };

    if (token) {
      try {
        const res = await api.post('/work-hours/manual', newSession);
        if (res.data?.session) {
          updateWorkSessionsState([res.data.session, ...workSessions.filter((s) => s.id !== res.data.session.id)]);
          return;
        }
      } catch (err) {
        console.error('Add work session API error:', err);
      }
    }

    updateWorkSessionsState([newSession, ...workSessions]);
  };

  const updateWorkSession = async (id, updatedFields) => {
    if (userRole !== 'admin' && userRole !== 'manager') {
      alert('Permission Denied: Only Manager or Admin can edit working hour logs.');
      return;
    }
    const token = sessionStorage.getItem('aszen_token') || localStorage.getItem('aszen_token');
    const numericId = typeof id === 'number' ? id : parseInt(String(id).replace('ws-', ''), 10);
    if (token && !isNaN(numericId) && numericId > 0) {
      try {
        await api.put(`/work-hours/${numericId}`, updatedFields);
      } catch (err) {
        console.error('Update work session API error:', err);
      }
    }
    const updated = workSessions.map((ws) => {
      if (ws.id === id) {
        const merged = { ...ws, ...updatedFields };
        if (merged.login_time && merged.logout_time) {
          const delta = new Date(merged.logout_time) - new Date(merged.login_time);
          merged.total_hours = Math.max(0, Math.round((delta / 3600000) * 100) / 100);
          merged.status = 'Completed';
        }
        return merged;
      }
      return ws;
    });
    updateWorkSessionsState(updated);
  };

  const deleteWorkSession = async (id) => {
    if (userRole !== 'admin' && userRole !== 'manager' && !isDeveloper) {
      alert('Permission Denied: Only Manager, Developer, or Admin can delete working hour logs.');
      return;
    }
    const token = sessionStorage.getItem('aszen_token') || localStorage.getItem('aszen_token');
    const numericId = typeof id === 'number' ? id : parseInt(String(id).replace('ws-', ''), 10);
    if (token && !isNaN(numericId) && numericId > 0) {
      try {
        await api.delete(`/work-hours/${numericId}`);
      } catch (err) {
        console.error('Delete work session API error:', err);
      }
    }
    updateWorkSessionsState(workSessions.filter((ws) => ws.id !== id));
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        editors,
        clients,
        productionSheets,
        workSessions,
        stats,
        userRole,
        userDesignation,
        isDeveloper,
        canCreateJob,
        canAssignJob,
        canEditJob,
        canDeleteJob,
        canManageClients,
        canManageEmployees,
        canManageWorkHours,
        canUpdateStage,
        isApproved,
        updateJobsState,
        createJob,
        deleteJob,
        assignStage,
        startStageTimer,
        pauseStageTimer,
        resumeStageTimer,
        finishStageTimer,
        updateClientTurnaround,
        addClient,
        deleteClient,
        addEmployee,
        updateEmployeePermissions,
        deleteEmployee,
        addWorkSession,
        updateWorkSession,
        deleteWorkSession,
        timerModalState,
        setTimerModalState,
        clientModalState,
        setClientModalState,
        assignModalState,
        setAssignModalState,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isManagementModalOpen,
        setIsManagementModalOpen,
        refreshData,
        activities,
        logActivity,
        resetToSystemActivities,
        leaveRequests,
        applyLeave,
        updateLeaveStatus,
        cancelLeave,
        getLeaveBalances,
        pendingLeaveCount,
      }}
    >
      {children}
    </JobContext.Provider>
  );

}

export function useJobs() {
  const ctx = useContext(JobContext);
  if (!ctx) throw new Error('useJobs must be used within JobProvider');
  return ctx;
}
