import { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_JOBS, INITIAL_EDITORS, INITIAL_PRODUCTION_SHEETS } from '../data/mockJobs';

const JobContext = createContext(null);

export function JobProvider({ children }) {
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem('aszen_jobs');
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  const [editors] = useState(INITIAL_EDITORS);
  const [productionSheets, setProductionSheets] = useState(() => {
    const saved = localStorage.getItem('aszen_prod_sheets');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTION_SHEETS;
  });

  // Modal active states
  const [timerModalState, setTimerModalState] = useState(null); // { jobId, stageKey }
  const [clientModalState, setClientModalState] = useState(null); // { jobId }
  const [assignModalState, setAssignModalState] = useState(null); // { jobId, stageKey }
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Persist state updates to LocalStorage for full persistence across page refreshes
  useEffect(() => {
    localStorage.setItem('aszen_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('aszen_prod_sheets', JSON.stringify(productionSheets));
  }, [productionSheets]);

  // Metric calculation helpers
  const stats = {
    totalJobs: jobs.length,
    totalFiles: jobs.reduce((acc, j) => acc + (j.outputTarget || 0), 0),
    completedJobs: jobs.filter((j) =>
      Object.values(j.stages).every((s) => s.status === 'Complete' || !s.assignee)
    ).length,
    pendingJobs: jobs.filter((j) =>
      Object.values(j.stages).some((s) => s.status === 'Pending' || s.status === 'In-Progress' || s.status === 'Paused')
    ).length,
    qcPendingJobs: jobs.filter((j) => j.stages.qc && j.stages.qc.status === 'In-Progress' || j.stages.qc.status === 'Pending').length,
    pathPendingJobs: jobs.filter((j) => (j.stages.path1 && j.stages.path1.status !== 'Complete') || (j.stages.path2 && j.stages.path2.status !== 'Complete')).length,
  };

  // Job Actions
  const createJob = (newJobData) => {
    const newId = (19700 + jobs.length + 1).toString();
    const formattedJob = {
      id: newId,
      client: newJobData.client || 'NEW',
      name: newJobData.name || 'Untitled Job',
      folderCount: Number(newJobData.folderCount) || 1,
      outputTarget: Number(newJobData.outputTarget) || 0,
      actualOutput: 0,
      clientEntryTime: newJobData.clientEntryTime || new Date().toISOString().slice(0, 16),
      clientTargetTime: newJobData.clientTargetTime || '',
      clientFinishTime: null,
      stages: {
        path1: { assignee: newJobData.path1Assignee || 'Shwetha', status: 'Pending', startTime: null, endTime: null, pausedDurationSeconds: 0, pauseLogs: [], outputCount: 0 },
        path2: { assignee: newJobData.path2Assignee || 'Tejas', status: 'Pending', startTime: null, endTime: null, pausedDurationSeconds: 0, pauseLogs: [], outputCount: 0 },
        editor1: { assignee: newJobData.editor1Assignee || 'Karan', status: 'Pending', startTime: null, endTime: null, pausedDurationSeconds: 0, pauseLogs: [], outputCount: 0 },
        editor2: { assignee: newJobData.editor2Assignee || 'Godwin', status: 'Pending', startTime: null, endTime: null, pausedDurationSeconds: 0, pauseLogs: [], outputCount: 0 },
        qc: { assignee: newJobData.qcAssignee || 'Arun QC', status: 'Pending', startTime: null, endTime: null, pausedDurationSeconds: 0, pauseLogs: [], outputCount: 0 },
        fc: { assignee: newJobData.fcAssignee || 'Arun DD', status: 'Pending', startTime: null, endTime: null, pausedDurationSeconds: 0, pauseLogs: [], outputCount: 0 },
      },
    };
    setJobs([formattedJob, ...jobs]);
    setIsCreateModalOpen(false);
  };

  const deleteJob = (jobId) => {
    setJobs(jobs.filter((j) => j.id !== jobId));
  };

  const assignStage = (jobId, stageKey, assigneeName) => {
    setJobs(
      jobs.map((j) => {
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
      })
    );
    setAssignModalState(null);
  };

  // Timer Actions (Start, Pause, Resume, Finish)
  const startStageTimer = (jobId, stageKey) => {
    const nowIso = new Date().toISOString();
    setJobs(
      jobs.map((j) => {
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
      })
    );
  };

  const pauseStageTimer = (jobId, stageKey, reason) => {
    const nowIso = new Date().toISOString();
    setJobs(
      jobs.map((j) => {
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
                  ...currentStage.pauseLogs,
                  { reason: reason || 'Break', timestamp: nowIso, duration: 0 },
                ],
              },
            },
          };
        }
        return j;
      })
    );
  };

  const resumeStageTimer = (jobId, stageKey) => {
    const now = new Date();
    setJobs(
      jobs.map((j) => {
        if (j.id === jobId) {
          const currentStage = j.stages[stageKey];
          const pauseStart = currentStage.currentPauseStart ? new Date(currentStage.currentPauseStart) : now;
          const diffSeconds = Math.round((now - pauseStart) / 1000);

          const updatedLogs = [...currentStage.pauseLogs];
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
      })
    );
  };

  const finishStageTimer = (jobId, stageKey, outputFilesCount) => {
    const nowIso = new Date().toISOString();
    setJobs(
      jobs.map((j) => {
        if (j.id === jobId) {
          const currentStage = j.stages[stageKey];
          const updatedStage = {
            ...currentStage,
            status: 'Complete',
            endTime: nowIso,
            outputCount: Number(outputFilesCount) || j.outputTarget,
          };

          // Also check if FC finishes the whole job
          let finishTime = j.clientFinishTime;
          if (stageKey === 'fc') {
            finishTime = nowIso;
          }

          return {
            ...j,
            clientFinishTime: finishTime,
            stages: {
              ...j.stages,
              [stageKey]: updatedStage,
            },
          };
        }
        return j;
      })
    );

    // Auto-create a production sheet entry
    const targetJob = jobs.find((j) => j.id === jobId);
    if (targetJob) {
      const stageObj = targetJob.stages[stageKey];
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
        editorName: stageObj.assignee || 'Employee',
        role: stageLabels[stageKey] || stageKey,
        jobId: targetJob.id,
        client: targetJob.client,
        stage: stageLabels[stageKey] || stageKey,
        filesProcessed: Number(outputFilesCount) || targetJob.outputTarget,
        activeMinutes: Math.max(0, grossMinutes - pauseMins),
        pauseMinutes: pauseMins,
        status: 'Verified',
      };
      setProductionSheets((prev) => [newEntry, ...prev]);
    }

    setTimerModalState(null);
  };

  const updateClientTurnaround = (jobId, entryTime, targetTime, finishTime) => {
    setJobs(
      jobs.map((j) => {
        if (j.id === jobId) {
          return {
            ...j,
            clientEntryTime: entryTime,
            clientTargetTime: targetTime,
            clientFinishTime: finishTime || j.clientFinishTime,
          };
        }
        return j;
      })
    );
    setClientModalState(null);
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        editors,
        productionSheets,
        stats,
        createJob,
        deleteJob,
        assignStage,
        startStageTimer,
        pauseStageTimer,
        resumeStageTimer,
        finishStageTimer,
        updateClientTurnaround,
        timerModalState,
        setTimerModalState,
        clientModalState,
        setClientModalState,
        assignModalState,
        setAssignModalState,
        isCreateModalOpen,
        setIsCreateModalOpen,
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
