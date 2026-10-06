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
import { getOperationalDate, isSameOperationalDay } from '../utils/dateUtils';

const LEGACY_MOCK_EMAILS = [
  'qa_perm_test@aszen.com',
  'testeditor@aszen.com',
  'devtester@aszen.com',
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
            (e) => !LEGACY_MOCK_EMAILS.includes((e.email || '').toLowerCase().trim())
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

      const jobCreatedAt = job.createdAt || job.created_at || job.clientEntryTime || new Date().toISOString();
      const jobOperationalDate = job.operationalDate || getOperationalDate(jobCreatedAt);

      return {
        ...job,
        id: String(job.id || job.jobNumber || ''),
        jobNumber: String(job.jobNumber || job.id || ''),
        client: job.client || job.client_code || 'BE',
        name: job.name || job.service || 'Untitled Job',
        service: job.service || job.name || 'Untitled Job',
        outputTarget: Number(job.outputTarget !== undefined ? job.outputTarget : (job.output_target || 0)),
        createdAt: jobCreatedAt,
        operationalDate: jobOperationalDate,
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
            (e) => !LEGACY_MOCK_EMAILS.includes((e.email || '').toLowerCase().trim())
          );
          return cleaned;
        }
      }
    } catch (e) {
      console.warn('Error reading aszen_editors from localStorage:', e);
    }
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
              !['1001', '1002', '1003', '1004', 'LR-101', 'LR-102', 'LR-103', 'LR-104'].includes(String(a.jobId || '')) &&
              !['act-1', 'act-2', 'act-3', 'act-4', 'act-5', 'act-6', 'act-7', 'act-8', 'act-9', 'act-10', 'act-11', 'act-12'].includes(String(a.id || ''))
          );
          if (cleaned.length > 0) {
            return cleaned;
          }
        }
      }
    } catch (e) {
      console.warn('Error reading aszen_activities from localStorage:', e);
    }
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
    } catch (e) {
      console.warn('Error reading aszen_leave_requests from localStorage:', e);
    }
    return [];
  });

  const [annualLeaveAllowance, setAnnualLeaveAllowance] = useState(() => {
    try {
      const saved = localStorage.getItem('aszen_annual_leave_allowance');
      if (saved && !isNaN(Number(saved)) && Number(saved) > 0) {
        return Number(saved);
      }
    } catch {}
    return 18;
  });

  const [customLeaveAllowances, setCustomLeaveAllowances] = useState(() => {
    try {
      const saved = localStorage.getItem('aszen_custom_leave_allowances');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {}
    return {};
  });

  // Modal active states
  const [timerModalState, setTimerModalState] = useState(null); // { jobId, stageKey }
  const [clientModalState, setClientModalState] = useState(null); // { jobId }
  const [assignModalState, setAssignModalState] = useState(null); // { jobId, stageKey }
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);

  // Real-time BroadcastChannel for 0ms cross-window / cross-tab updates
  const broadcastSync = useCallback((newJobs, newSheets, newEditors, newClients, newSessions, newActivities, newLeaves, newAnnualAllowance = null, newCustomAllowances = null) => {
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
          annualLeaveAllowance: newAnnualAllowance || annualLeaveAllowance,
          customLeaveAllowances: newCustomAllowances || customLeaveAllowances,
          timestamp: Date.now(),
        });
        setTimeout(() => {
          try { channel.close(); } catch {}
        }, 200);
      }
    } catch (e) {
      console.error('BroadcastChannel sync error:', e);
    }
  }, [annualLeaveAllowance, customLeaveAllowances]);

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
        if (data.workSessions) {
          setWorkSessions((prev) => {
            const isManagerOrAdmin = user?.role === 'admin' || user?.role === 'manager' || ['arun@aszen.com', 'gokul@aszen.com'].includes((user?.email || '').toLowerCase());
            if (isManagerOrAdmin && prev.length > (data.workSessions || []).length) {
              const map = new Map(prev.map((s) => [s.id || `${s.user_email}_${s.date}`, s]));
              (data.workSessions || []).forEach((s) => map.set(s.id || `${s.user_email}_${s.date}`, s));
              return Array.from(map.values());
            }
            return [...(data.workSessions || [])];
          });
        }
        if (data.activities) setActivities([...(data.activities || [])]);
        if (data.leaveRequests) setLeaveRequests([...(data.leaveRequests || [])]);
        if (data.annualLeaveAllowance) setAnnualLeaveAllowance(data.annualLeaveAllowance);
        if (data.customLeaveAllowances) setCustomLeaveAllowances(data.customLeaveAllowances);
      } else if (data && data.type === 'ANNUAL_LEAVE_ALLOWANCE_UPDATED') {
        setAnnualLeaveAllowance(data.allowance);
      } else if (data && data.type === 'CUSTOM_LEAVE_ALLOWANCES_UPDATED') {
        setCustomLeaveAllowances(data.allowances);
      } else if (data && data.type === 'ACTIVITY_LOGGED' && data.activity) {
        setActivities((prev) => [data.activity, ...prev.filter((a) => a.id !== data.activity.id).slice(0, 99)]);
      }
    };

    return () => {
      channel.close();
    };
  }, [user]);

  // Listen for cross-window LocalStorage updates
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'aszen_jobs' && e.newValue) setJobs([...normalizeJobs(JSON.parse(e.newValue))]);
      if (e.key === 'aszen_prod_sheets' && e.newValue) setProductionSheets(JSON.parse(e.newValue));
      if (e.key === 'aszen_editors' && e.newValue) setEditors(JSON.parse(e.newValue));
      if (e.key === 'aszen_clients' && e.newValue) setClients(JSON.parse(e.newValue));
      if (e.key === 'aszen_work_sessions' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setWorkSessions((prev) => {
              const isManagerOrAdmin = user?.role === 'admin' || user?.role === 'manager' || ['arun@aszen.com', 'gokul@aszen.com'].includes((user?.email || '').toLowerCase());
              if (isManagerOrAdmin && prev.length > parsed.length) {
                const map = new Map(prev.map((s) => [s.id || `${s.user_email}_${s.date}`, s]));
                parsed.forEach((s) => map.set(s.id || `${s.user_email}_${s.date}`, s));
                return Array.from(map.values());
              }
              return parsed;
            });
          }
        } catch {}
      }
      if (e.key === 'aszen_activities' && e.newValue) setActivities(JSON.parse(e.newValue));
      if (e.key === 'aszen_leave_requests' && e.newValue) setLeaveRequests(JSON.parse(e.newValue));
      if (e.key === 'aszen_annual_leave_allowance' && e.newValue) setAnnualLeaveAllowance(Number(e.newValue) || 18);
      if (e.key === 'aszen_custom_leave_allowances' && e.newValue) setCustomLeaveAllowances(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

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

  const importProductionSheets = async (incomingSheets) => {
    if (!Array.isArray(incomingSheets) || incomingSheets.length === 0) return [];

    const normalized = incomingSheets.map((item, idx) => ({
      id: item.id || `ps-imp-${Date.now()}-${idx}`,
      date: item.inputDate || item.date || new Date().toISOString().slice(0, 10),
      inputDate: item.inputDate || item.date || new Date().toISOString().slice(0, 10),
      propertyName: item.propertyName || item.name || 'Untitled Folder',
      service: item.service || item.stage || 'RE Editing',
      numberOfImages: Number(item.numberOfImages !== undefined ? item.numberOfImages : item.filesProcessed) || 0,
      filesProcessed: Number(item.numberOfImages !== undefined ? item.numberOfImages : item.filesProcessed) || 0,
      comments: item.comments || '',
      editorName: item.editorName || 'Unassigned',
      role: item.role || 'Editor',
      jobId: item.jobId ? String(item.jobId) : '',
      client: item.client || 'BE',
      stage: item.stage || item.service || 'RE Editing',
      activeMinutes: Number(item.activeMinutes) || 0,
      pauseMinutes: Number(item.pauseMinutes) || 0,
      status: item.status || 'Verified',
    }));

    const merged = [...normalized, ...productionSheets];
    setProductionSheets(merged);
    localStorage.setItem('aszen_prod_sheets', JSON.stringify(merged));
    broadcastSync(jobs, merged, editors, clients, workSessions);

    const token = sessionStorage.getItem('aszen_token') || localStorage.getItem('aszen_token');
    if (token) {
      try {
        await api.post('/jobs/production-sheets/import', { sheets: normalized });
      } catch (err) {
        console.error('Batch import sync error:', err);
      }
    }
    return normalized;
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
    const role = (user?.role || '').toLowerCase();
    if (role === 'admin' || ['arun@aszen.com', 'gokul@aszen.com'].includes((user?.email || '').toLowerCase())) {
      throw new Error('Admins are not permitted to submit leave requests. Leave applications are reserved for employees.');
    }

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

    const token = sessionStorage.getItem('aszen_token') || localStorage.getItem('aszen_token');
    if (token) {
      // Connect to server: Validate and persist on backend first so server errors bubble up
      const res = await api.post('/leaves', newLeave);
      const serverLeave = res.data?.leaveRequest || newLeave;
      const updated = [
        serverLeave,
        ...leaveRequests.filter((l) => String(l.id) !== String(serverLeave.id) && l.id !== newId),
      ];
      setLeaveRequests(updated);
      localStorage.setItem('aszen_leave_requests', JSON.stringify(updated));
      broadcastSync(jobs, productionSheets, editors, clients, workSessions, activities, updated);

      logActivity({
        actionType: 'LEAVE_REQUESTED',
        jobId: serverLeave.id,
        actorName: applicantName,
        actorEmail: applicantEmail,
        targetEmployee: applicantName,
        text: `Leave Request #${serverLeave.id} :: ${applicantName} applied for ${serverLeave.days} day(s) leave`,
      });

      return serverLeave;
    }

    // Offline / demo fallback
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

    return newLeave;
  };

  const updateLeaveStatus = async (leaveId, status, managerNotes = '') => {
    const role = (user?.role || '').toLowerCase();
    const isAuthAdmin = role === 'admin' || ['arun@aszen.com', 'gokul@aszen.com'].includes((user?.email || '').toLowerCase());
    if (status !== 'Cancelled' && !isAuthAdmin) {
      throw new Error('Permission denied. Only administrators can approve or reject leave requests.');
    }

    const reviewer = user?.name || (user?.email ? user.email.split('@')[0] : 'Manager');
    let targetLeave = null;

    const token = sessionStorage.getItem('aszen_token') || localStorage.getItem('aszen_token');
    if (token) {
      const res = await api.patch(`/leaves/${leaveId}/status`, { status, managerNotes });
      const serverLeave = res.data?.leaveRequest;
      const updated = leaveRequests.map((l) =>
        String(l.id) === String(leaveId)
          ? serverLeave || {
              ...l,
              status,
              reviewedBy: reviewer,
              reviewedAt: new Date().toISOString(),
              managerNotes: managerNotes || l.managerNotes,
            }
          : l
      );
      setLeaveRequests(updated);
      localStorage.setItem('aszen_leave_requests', JSON.stringify(updated));
      broadcastSync(jobs, productionSheets, editors, clients, workSessions, activities, updated);

      const targetEmp = serverLeave?.userName || 'Employee';
      const daysCount = serverLeave?.days || '';
      logActivity({
        actionType: status === 'Approved' ? 'LEAVE_APPROVED' : status === 'Cancelled' ? 'LEAVE_CANCELLED' : 'LEAVE_REJECTED',
        jobId: leaveId,
        actorName: reviewer,
        actorEmail: user?.email || '',
        targetEmployee: targetEmp,
        text: `Leave Request #${leaveId} :: ${targetEmp} ${daysCount} Day leave ${status} by ${reviewer}${managerNotes ? ` (${managerNotes})` : ''}`,
      });

      return serverLeave;
    }

    const updated = leaveRequests.map((l) => {
      if (String(l.id) === String(leaveId)) {
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
        actionType: status === 'Approved' ? 'LEAVE_APPROVED' : status === 'Cancelled' ? 'LEAVE_CANCELLED' : 'LEAVE_REJECTED',
        jobId: leaveId,
        actorName: reviewer,
        actorEmail: user?.email || '',
        targetEmployee: targetLeave.userName,
        text: `Leave Request #${leaveId} :: ${targetLeave.userName} ${targetLeave.days} Day leave ${status} by ${reviewer}${managerNotes ? ` (${managerNotes})` : ''}`,
      });
    }

    return targetLeave;
  };

  const cancelLeave = (leaveId) => {
    return updateLeaveStatus(leaveId, 'Cancelled', 'Cancelled by applicant');
  };

  const updateAnnualLeaveAllowance = (newAllowance) => {
    const num = Math.max(1, Number(newAllowance) || 18);
    setAnnualLeaveAllowance(num);
    localStorage.setItem('aszen_annual_leave_allowance', String(num));
    broadcastSync(jobs, productionSheets, editors, clients, workSessions, activities, leaveRequests, num, customLeaveAllowances);
    logActivity({
      actionType: 'LEAVE_QUOTA_UPDATED',
      actorName: user?.name || 'Admin',
      actorEmail: user?.email || '',
      text: `Company annual leave allowance updated to ${num} days/year by ${user?.name || 'Admin'}`,
      badgeColor: 'purple',
    });
  };

  const assignEmployeeLeaveDays = (employeeEmail, days) => {
    if (!employeeEmail) return;
    const email = employeeEmail.toLowerCase().trim();
    const num = Math.max(0, Number(days) || 0);
    const updated = { ...(customLeaveAllowances || {}), [email]: num };
    setCustomLeaveAllowances(updated);
    localStorage.setItem('aszen_custom_leave_allowances', JSON.stringify(updated));
    broadcastSync(jobs, productionSheets, editors, clients, workSessions, activities, leaveRequests, annualLeaveAllowance, updated);
    logActivity({
      actionType: 'EMPLOYEE_LEAVE_ASSIGNED',
      actorName: user?.name || 'Admin',
      actorEmail: user?.email || '',
      targetEmployee: email,
      text: `Annual leave quota for ${email} assigned to ${num} days by ${user?.name || 'Admin'}`,
      badgeColor: 'purple',
    });
  };

  const getLeaveBalances = (userEmail) => {
    const email = (userEmail || user?.email || '').toLowerCase().trim();
    const approved = leaveRequests.filter(
      (l) => (l.userEmail || '').toLowerCase().trim() === email && l.status === 'Approved'
    );
    const pending = leaveRequests.filter(
      (l) => (l.userEmail || '').toLowerCase().trim() === email && l.status === 'Pending'
    );

    const usedDays = approved.reduce((sum, l) => sum + (Number(l.days) || 1), 0);
    const pendingDays = pending.reduce((sum, l) => sum + (Number(l.days) || 1), 0);

    let total = 18;
    if (
      customLeaveAllowances &&
      typeof customLeaveAllowances === 'object' &&
      email in customLeaveAllowances &&
      customLeaveAllowances[email] !== undefined &&
      customLeaveAllowances[email] !== null &&
      !isNaN(customLeaveAllowances[email])
    ) {
      total = Math.max(0, Number(customLeaveAllowances[email]));
    } else if (
      annualLeaveAllowance !== undefined &&
      annualLeaveAllowance !== null &&
      !isNaN(annualLeaveAllowance)
    ) {
      total = Math.max(0, Number(annualLeaveAllowance));
    }

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
  const isApproved = userRole === 'admin' || user?.is_approved !== false;

  // Role, Designation & Dynamic Permissions Matrix:
  // Developer does NOT interfere with tasks like Blending, Editing, Jobs, etc.
  // Developer is restricted strictly to Login/Logoff shift attendance and Leave management.
  const canCreateJob = !isDeveloper && isApproved && (userRole === 'admin' || userRole === 'manager' || isSeniorEditor || !!perms.can_create_job);
  const canAssignJob = !isDeveloper && isApproved && (userRole === 'admin' || userRole === 'manager' || isSeniorEditor || !!perms.can_edit_job);
  const canEditJob = canAssignJob;
  const canDeleteJob = !isDeveloper && isApproved && (userRole === 'admin' || userRole === 'manager' || !!perms.can_delete_job);
  const canManageClients = !isDeveloper && isApproved && (userRole === 'admin' || !!perms.can_manage_clients);
  const canManageEmployees = !isDeveloper && isApproved && (userRole === 'admin' || !!perms.can_create_employee);
  const canManageWorkHours = !isDeveloper && isApproved && (userRole === 'admin' || userRole === 'manager' || !!perms.can_manage_work_hours);

  // Check if current user can update a specific stage (Developers do not update or execute tasks like blending)
  const canUpdateStage = (assigneeName) => {
    if (isDeveloper) return false;
    if (userRole === 'admin' || userRole === 'manager' || isSeniorEditor || !!perms.can_edit_job) return true;
    if (!user?.name || !assigneeName) return false;
    return user.name.toLowerCase() === assigneeName.toLowerCase();
  };

  // Assignable editors for production pipeline tasks (Developers are strictly excluded from tasks like Blending, Editing, Pathing, QC)
  const assignableEditors = useMemo(() => {
    return editors.filter((e) => (e.designation || e.role || '').toLowerCase() !== 'developer');
  }, [editors]);


  // Operational Workday (6:00 AM to 5:59 AM next morning)
  const [currentOperationalDate, setCurrentOperationalDate] = useState(() => getOperationalDate());

  // Rollover timer: Every 30 seconds checks if 6:00 AM occurred and updates operational date
  useEffect(() => {
    const checkOp = () => {
      const nowOp = getOperationalDate();
      if (nowOp !== currentOperationalDate) {
        setCurrentOperationalDate(nowOp);
      }
    };
    const timer = setInterval(checkOp, 30000);
    return () => clearInterval(timer);
  }, [currentOperationalDate]);

  // Today's jobs strictly matching the active 6:00 AM - 5:59 AM operational day window
  const todaysJobs = useMemo(() => {
    return jobs.filter((j) => {
      const opDate = j.operationalDate || getOperationalDate(j.createdAt || j.clientEntryTime);
      return opDate === currentOperationalDate;
    });
  }, [jobs, currentOperationalDate]);

  // Metric Calculation Helpers for the current day's active operational shift (resets cleanly each new day)
  const stats = useMemo(() => ({
    totalJobs: todaysJobs.length,
    totalFiles: todaysJobs.reduce((acc, j) => acc + (j.outputTarget || 0), 0),
    completedJobs: todaysJobs.filter((j) =>
      Object.values(j.stages || {}).every((s) => s?.status === 'Complete' || !s?.assignee)
    ).length,
    pendingJobs: todaysJobs.filter((j) =>
      Object.values(j.stages || {}).some((s) => s?.status === 'Pending' || s?.status === 'In-Progress' || s?.status === 'Paused')
    ).length,
    blendingPendingJobs: todaysJobs.filter((j) => j.stages?.blending && (j.stages.blending.status === 'In-Progress' || j.stages.blending.status === 'Pending')).length,
    pathPendingJobs: todaysJobs.filter((j) => (j.stages?.path1 && j.stages.path1.status !== 'Complete' && j.stages.path1.assignee) || (j.stages?.path2 && j.stages.path2.status !== 'Complete' && j.stages.path2.assignee)).length,
    editingPendingJobs: todaysJobs.filter((j) => (j.stages?.editor1 && j.stages.editor1.status !== 'Complete' && j.stages.editor1.assignee) || (j.stages?.editor2 && j.stages.editor2.status !== 'Complete' && j.stages.editor2.assignee)).length,
    lcPendingJobs: todaysJobs.filter((j) => j.stages?.lc && (j.stages.lc.status === 'In-Progress' || j.stages.lc.status === 'Pending')).length,
    fcPendingJobs: todaysJobs.filter((j) => j.stages?.fc && (j.stages.fc.status === 'In-Progress' || j.stages.fc.status === 'Pending')).length,
    qcPendingJobs: todaysJobs.filter((j) => (j.stages?.fc && (j.stages.fc.status === 'In-Progress' || j.stages.fc.status === 'Pending')) || (j.stages?.lc && (j.stages.lc.status === 'In-Progress' || j.stages.lc.status === 'Pending')) || (j.stages?.qc && (j.stages.qc.status === 'In-Progress' || j.stages.qc.status === 'Pending'))).length,
    allTimeTotalJobs: jobs.length,
    allTimeTotalFiles: jobs.reduce((acc, j) => acc + (j.outputTarget || 0), 0),
  }), [todaysJobs, jobs]);

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
      createdAt: newJobData.createdAt || new Date().toISOString(),
      operationalDate: getOperationalDate(newJobData.createdAt || new Date()),
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
        inputDate: new Date().toISOString().slice(0, 10),
        propertyName: updatedTargetJob.name || 'Untitled Folder',
        service: updatedTargetJob.service || stageLabels[stageKey] || 'RE Editing',
        numberOfImages: Number(outputFilesCount) || updatedTargetJob.outputTarget || 0,
        comments: updatedTargetJob.notes || '',
        editorName: stageObj.assignee || user?.name || 'Employee',
        role: stageLabels[stageKey] || stageKey,
        jobId: updatedTargetJob.id,
        client: updatedTargetJob.client,
        stage: stageLabels[stageKey] || stageKey,
        filesProcessed: Number(outputFilesCount) || updatedTargetJob.outputTarget || 0,
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
      const [jobsRes, sheetsRes, clientsRes, leavesRes] = await Promise.allSettled([
        api.get('/jobs'),
        api.get('/jobs/production-sheets'),
        api.get('/clients'),
        api.get('/leaves'),
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
      if (leavesRes.status === 'fulfilled' && Array.isArray(leavesRes.value.data?.leaveRequests)) {
        setLeaveRequests(leavesRes.value.data.leaveRequests);
        localStorage.setItem('aszen_leave_requests', JSON.stringify(leavesRes.value.data.leaveRequests));
      }
    } catch (e) {
      console.error('Refresh data error:', e);
    }
  }, []);

  // Smart background sync (every 45s if visible; sleeps when tab is hidden; refreshes on tab focus)
  useEffect(() => {
    if (!user) return;
    const syncIfVisible = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        refreshData();
      }
    };
    const interval = setInterval(syncIfVisible, 45000);
    window.addEventListener('focus', syncIfVisible);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', syncIfVisible);
    };
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
    const cleanCode = (clientData.code || '').trim().toUpperCase();
    if (!cleanCode) return;
    const finalName = (clientData.name || '').trim() || cleanCode;
    const cleanContact = (clientData.contact || '').trim();

    const token = sessionStorage.getItem('aszen_token');
    try {
      if (token) {
        const res = await api.post('/clients', {
          code: cleanCode,
          name: finalName,
          contact: cleanContact,
        });
        const created = res.data.client;
        const newClient = {
          id: created.id,
          code: created.code,
          name: created.name,
          contact: created.contact,
        };
        updateClientsState([...clients.filter((c) => c.code !== cleanCode), newClient]);
        return;
      }
    } catch (err) {
      console.error('Add client API error:', err);
    }

    // Demo fallback
    const newClient = {
      id: `c-${Date.now().toString().slice(-4)}`,
      code: cleanCode,
      name: finalName,
      contact: cleanContact,
    };
    updateClientsState([...clients.filter((c) => c.code !== cleanCode), newClient]);
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
                  !LEGACY_MOCK_EMAILS.includes((u.email || '').toLowerCase().trim())
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
            const isManagerOrAdmin = user?.role === 'admin' || user?.role === 'manager' || ['arun@aszen.com', 'gokul@aszen.com'].includes((user?.email || '').toLowerCase());
            setWorkSessions(res.data.sessions);
            if (isManagerOrAdmin) {
              localStorage.setItem('aszen_work_sessions', JSON.stringify(res.data.sessions));
            } else {
              // Employee tab: merge with cached sessions so we don't wipe out admin tab's view across tabs
              try {
                const cached = JSON.parse(localStorage.getItem('aszen_work_sessions') || '[]');
                const myEmail = (user?.email || '').toLowerCase();
                const others = cached.filter((s) => (s.user_email || '').toLowerCase() !== myEmail);
                localStorage.setItem('aszen_work_sessions', JSON.stringify([...res.data.sessions, ...others]));
              } catch {
                localStorage.setItem('aszen_work_sessions', JSON.stringify(res.data.sessions));
              }
            }
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Sync leave requests from backend API on mount / user change / interval / window focus
  const fetchLeaves = useCallback(async () => {
    const token = sessionStorage.getItem('aszen_token') || localStorage.getItem('aszen_token');
    if (!token) return;
    try {
      const res = await api.get('/leaves');
      if (Array.isArray(res.data?.leaveRequests)) {
        setLeaveRequests(res.data.leaveRequests);
        localStorage.setItem('aszen_leave_requests', JSON.stringify(res.data.leaveRequests));
      }
    } catch (e) {
      console.warn('Backend leaves sync notice:', e.message);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
    // Re-sync leaves on focus (automatic periodic polling is handled in refreshData)
    window.addEventListener('focus', fetchLeaves);
    return () => {
      window.removeEventListener('focus', fetchLeaves);
    };
  }, [fetchLeaves, user]);

  // Employee Management (Admin)
  const addEmployee = async (empData) => {
    const token = sessionStorage.getItem('aszen_token') || localStorage.getItem('aszen_token');
    const defaultPerms = empData.permissions || {
      can_create_job: false,
      can_edit_job: false,
      can_delete_job: false,
      can_create_employee: false,
      can_manage_clients: false,
      can_manage_work_hours: false,
    };
    const cleanName = (empData.name || '').trim();
    const cleanEmail = (empData.email || '').trim() || `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'employee'}@aszen.com`;
    try {
      if (token) {
        const res = await api.post('/auth/users', {
          name: cleanName,
          email: cleanEmail,
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
      name: cleanName || 'New Employee',
      role: empData.designation || empData.role || 'Editor',
      designation: empData.designation || 'Editor',
      email: cleanEmail,
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
      date: sessionData.date || new Date().toLocaleDateString('en-CA'),
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
        todaysJobs,
        allJobs: jobs,
        currentOperationalDate,
        operationalDate: currentOperationalDate,
        editors,
        assignableEditors,
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
        fetchLeaves,
        applyLeave,
        updateLeaveStatus,
        cancelLeave,
        getLeaveBalances,
        pendingLeaveCount,
        annualLeaveAllowance,
        customLeaveAllowances,
        updateAnnualLeaveAllowance,
        assignEmployeeLeaveDays,
        importProductionSheets,
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
