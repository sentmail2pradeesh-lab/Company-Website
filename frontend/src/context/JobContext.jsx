import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_EDITORS, INITIAL_CLIENTS, INITIAL_JOBS, INITIAL_PRODUCTION_SHEETS } from '../data/mockJobs';
import { useAuth } from './AuthContext';
import { checkStageUnlockStatus } from '../utils/pipelineHelper';

const JobContext = createContext(null);

export function JobProvider({ children }) {
  const { user } = useAuth();
  const userRole = (user?.role || 'employee').toLowerCase();

  // Clear legacy mock data from local storage if old IDs (e.g. 19723) exist
  useEffect(() => {
    try {
      const savedJobs = localStorage.getItem('aszen_jobs');
      if (savedJobs) {
        const parsed = JSON.parse(savedJobs);
        if (parsed.some((j) => ['19723', '19722', '19721', '19720', '19719', '19718', '19717'].includes(j.id))) {
          localStorage.removeItem('aszen_jobs');
          localStorage.removeItem('aszen_prod_sheets');
          setJobs([]);
          setProductionSheets([]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Helper to ensure stage objects are safely structured
  const normalizeJobs = (jobList) => {
    if (!Array.isArray(jobList)) return [];
    return jobList.map((job) => {
      if (!job || !job.stages) return job;
      const normalizedStages = { ...job.stages };
      Object.keys(normalizedStages).forEach((key) => {
        const s = normalizedStages[key] || {};
        normalizedStages[key] = {
          assignee: s.assignee || '',
          status: s.status || (s.assignee ? 'Pending' : 'Unassigned'),
          filesCount: s.filesCount || 0,
          startTime: s.startTime || null,
          endTime: s.endTime || null,
          pausedDurationSeconds: s.pausedDurationSeconds || 0,
          pauseLogs: Array.isArray(s.pauseLogs) ? s.pauseLogs : [],
          outputCount: s.outputCount || 0,
          currentPauseStart: s.currentPauseStart || null,
        };
      });
      return { ...job, stages: normalizedStages };
    });
  };

  // State Management
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem('aszen_jobs');
    return saved ? normalizeJobs(JSON.parse(saved)) : INITIAL_JOBS;
  });

  const [editors, setEditors] = useState(() => {
    const saved = localStorage.getItem('aszen_editors');
    return saved ? JSON.parse(saved) : INITIAL_EDITORS;
  });

  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('aszen_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [productionSheets, setProductionSheets] = useState(() => {
    const saved = localStorage.getItem('aszen_prod_sheets');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTION_SHEETS;
  });

  // Modal active states
  const [timerModalState, setTimerModalState] = useState(null); // { jobId, stageKey }
  const [clientModalState, setClientModalState] = useState(null); // { jobId }
  const [assignModalState, setAssignModalState] = useState(null); // { jobId, stageKey }
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);

  // Real-time BroadcastChannel for 0ms cross-window / cross-tab updates
  const broadcastSync = useCallback((newJobs, newSheets, newEditors, newClients) => {
    try {
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('aszen_dashboard_realtime');
        channel.postMessage({
          type: 'REALTIME_UPDATE',
          jobs: newJobs,
          productionSheets: newSheets,
          editors: newEditors,
          clients: newClients,
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
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Persist state updates to LocalStorage & broadcast real-time
  const updateJobsState = (newJobs) => {
    const normalized = normalizeJobs(newJobs);
    setJobs([...normalized]);
    localStorage.setItem('aszen_jobs', JSON.stringify(normalized));
    broadcastSync(normalized, productionSheets, editors, clients);
  };

  const updateProdSheetsState = (newSheets, currentJobs = null) => {
    setProductionSheets(newSheets);
    localStorage.setItem('aszen_prod_sheets', JSON.stringify(newSheets));
    const targetJobs = currentJobs ? normalizeJobs(currentJobs) : jobs;
    broadcastSync(targetJobs, newSheets, editors, clients);
  };

  const updateEditorsState = (newEditors) => {
    setEditors(newEditors);
    localStorage.setItem('aszen_editors', JSON.stringify(newEditors));
    broadcastSync(jobs, productionSheets, newEditors, clients);
  };

  const updateClientsState = (newClients) => {
    setClients(newClients);
    localStorage.setItem('aszen_clients', JSON.stringify(newClients));
    broadcastSync(jobs, productionSheets, editors, newClients);
  };

  // Role Permissions
  const canCreateJob = userRole === 'admin' || userRole === 'manager';
  const canAssignJob = userRole === 'admin' || userRole === 'manager';
  const canDeleteJob = userRole === 'admin' || userRole === 'manager';
  const canManageClients = userRole === 'admin';
  const canManageEmployees = userRole === 'admin';

  // Check if current user can update a specific stage
  const canUpdateStage = (assigneeName) => {
    if (userRole === 'admin' || userRole === 'manager') return true;
    if (!user?.name || !assigneeName) return false;
    return user.name.toLowerCase() === assigneeName.toLowerCase();
  };

  // Metric Calculation Helpers
  const stats = {
    totalJobs: jobs.length,
    totalFiles: jobs.reduce((acc, j) => acc + (j.outputTarget || 0), 0),
    completedJobs: jobs.filter((j) =>
      Object.values(j.stages).every((s) => s.status === 'Complete' || !s.assignee)
    ).length,
    pendingJobs: jobs.filter((j) =>
      Object.values(j.stages).some((s) => s.status === 'Pending' || s.status === 'In-Progress' || s.status === 'Paused')
    ).length,
    blendingPendingJobs: jobs.filter((j) => j.stages.blending && (j.stages.blending.status === 'In-Progress' || j.stages.blending.status === 'Pending')).length,
    pathPendingJobs: jobs.filter((j) => (j.stages.path1 && j.stages.path1.status !== 'Complete') || (j.stages.path2 && j.stages.path2.status !== 'Complete')).length,
    editingPendingJobs: jobs.filter((j) => (j.stages.editor1 && j.stages.editor1.status !== 'Complete') || (j.stages.editor2 && j.stages.editor2.status !== 'Complete')).length,
    fcPendingJobs: jobs.filter((j) => j.stages.fc && (j.stages.fc.status === 'In-Progress' || j.stages.fc.status === 'Pending')).length,
    qcPendingJobs: jobs.filter((j) => j.stages.fc && (j.stages.fc.status === 'In-Progress' || j.stages.fc.status === 'Pending')).length,
  };

  // Job Actions
  const createJob = (newJobData) => {
    const newId = (1000 + jobs.length + 1).toString();

    const path1Files = Number(newJobData.path1Files) || Number(newJobData.outputTarget) || 0;
    const path2Files = Number(newJobData.path2Files) || 0;
    const editor1Files = Number(newJobData.editor1Files) || Number(newJobData.outputTarget) || 0;
    const editor2Files = Number(newJobData.editor2Files) || 0;
    const blendingFiles = Number(newJobData.blendingFiles) || Number(newJobData.outputTarget) || 0;
    const lcFiles = Number(newJobData.lcFiles) || Number(newJobData.outputTarget) || 0;
    const fcFiles = Number(newJobData.fcFiles) || Number(newJobData.outputTarget) || 0;

    const formattedJob = {
      id: newId,
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
    updateJobsState([formattedJob, ...jobs]);
    setIsCreateModalOpen(false);
  };

  const deleteJob = (jobId) => {
    if (!canDeleteJob) {
      alert('Only Admin or Manager can delete jobs.');
      return;
    }
    updateJobsState(jobs.filter((j) => j.id !== jobId));
  };

  const assignStage = (jobId, stageKey, assigneeName) => {
    if (!canAssignJob) {
      alert('Permission Denied: Only Manager or Admin can assign team members to job stages.');
      return;
    }
    const updated = jobs.map((j) => {
      if (j.id === jobId) {
        return {
          ...j,
          stages: {
            ...j.stages,
            [stageKey]: {
              ...j.stages[stageKey],
              assignee: assigneeName,
              status: j.stages[stageKey].status === 'Unassigned' ? 'Pending' : j.stages[stageKey].status,
            },
          },
        };
      }
      return j;
    });
    updateJobsState(updated);
    setAssignModalState(null);
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
    const updated = jobs.map((j) => {
      if (j.id === jobId) {
        return {
          ...j,
          stages: {
            ...j.stages,
            [stageKey]: {
              ...j.stages[stageKey],
              status: 'In-Progress',
              startTime: j.stages[stageKey].startTime || nowIso,
            },
          },
        };
      }
      return j;
    });
    updateJobsState(updated);
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
    const updated = jobs.map((j) => {
      if (j.id === jobId) {
        const currentStage = j.stages[stageKey];
        return {
          ...j,
          stages: {
            ...j.stages,
            [stageKey]: {
              ...currentStage,
              status: 'Paused',
              currentPauseStart: nowIso,
              pauseLogs: [
                ...(currentStage.pauseLogs || []),
                { reason: reason || 'Break', timestamp: nowIso, duration: 0 },
              ],
            },
          },
        };
      }
      return j;
    });
    updateJobsState(updated);
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
    const updated = jobs.map((j) => {
      if (j.id === jobId) {
        const currentStage = j.stages[stageKey];
        const pauseStart = currentStage.currentPauseStart ? new Date(currentStage.currentPauseStart) : now;
        const diffSeconds = Math.round((now - pauseStart) / 1000);

        const updatedLogs = [...(currentStage.pauseLogs || [])];
        if (updatedLogs.length > 0) {
          updatedLogs[updatedLogs.length - 1].duration = diffSeconds;
        }

        return {
          ...j,
          stages: {
            ...j.stages,
            [stageKey]: {
              ...currentStage,
              status: 'In-Progress',
              currentPauseStart: null,
              pausedDurationSeconds: (currentStage.pausedDurationSeconds || 0) + diffSeconds,
              pauseLogs: updatedLogs,
            },
          },
        };
      }
      return j;
    });
    updateJobsState(updated);
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

    const updated = jobs.map((j) => {
      if (j.id === jobId) {
        const currentStage = j.stages[stageKey];
        const updatedStage = {
          ...currentStage,
          status: 'Complete',
          endTime: nowIso,
          outputCount: Number(outputFilesCount) || j.outputTarget,
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
        return newJobObj;
      }
      return j;
    });

    updateJobsState(updated);

    // Auto-create a production sheet entry
    if (updatedTargetJob) {
      const stageObj = updatedTargetJob.stages[stageKey];
      const startMs = stageObj.startTime ? new Date(stageObj.startTime).getTime() : Date.now();
      const endMs = Date.now();
      const grossMinutes = Math.max(1, Math.round((endMs - startMs) / 60000));
      const pauseMins = Math.round((stageObj.pausedDurationSeconds || 0) / 60);

      const stageLabels = {
        path1: 'Path 1',
        path2: 'Path 2',
        editor1: 'Editor 1',
        editor2: 'Editor 2',
        qc: 'QC',
        fc: 'FC',
      };

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
      updateProdSheetsState([newEntry, ...productionSheets], updated);
    }

    setTimerModalState(null);
  };

  const updateClientTurnaround = (jobId, entryTime, targetTime, finishTime) => {
    const updated = jobs.map((j) => {
      if (j.id === jobId) {
        return {
          ...j,
          clientEntryTime: entryTime,
          clientTargetTime: targetTime,
          clientFinishTime: finishTime || j.clientFinishTime,
        };
      }
      return j;
    });
    updateJobsState(updated);
    setClientModalState(null);
  };

  // Client Management (Admin)
  const addClient = (clientData) => {
    const newClient = {
      id: `c-${Date.now().toString().slice(-4)}`,
      code: (clientData.code || 'NEW').toUpperCase(),
      name: clientData.name || 'New Client',
      contact: clientData.contact || '',
    };
    updateClientsState([...clients, newClient]);
  };

  const deleteClient = (clientId) => {
    updateClientsState(clients.filter((c) => c.id !== clientId));
  };

  // Employee Management (Admin)
  const addEmployee = (empData) => {
    const newEmp = {
      id: `e-${Date.now().toString().slice(-4)}`,
      name: empData.name || 'New Employee',
      role: empData.role || 'Editor',
      email: empData.email || '',
    };
    updateEditorsState([...editors, newEmp]);
  };

  const deleteEmployee = (empId) => {
    updateEditorsState(editors.filter((e) => e.id !== empId));
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        editors,
        clients,
        productionSheets,
        stats,
        userRole,
        canCreateJob,
        canAssignJob,
        canDeleteJob,
        canManageClients,
        canManageEmployees,
        canUpdateStage,
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
        deleteEmployee,
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
