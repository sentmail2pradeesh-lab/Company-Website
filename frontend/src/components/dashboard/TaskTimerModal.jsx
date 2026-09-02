import { useState, useEffect } from 'react';
import { useJobs } from '../../context/JobContext';
import { checkStageUnlockStatus } from '../../utils/pipelineHelper';
import {
  FiClock,
  FiPlay,
  FiPause,
  FiCheckCircle,
  FiX,
  FiAlertCircle,
  FiCalendar,
  FiLock,
  FiUserX,
} from 'react-icons/fi';

export default function TaskTimerModal() {
  const {
    timerModalState,
    setTimerModalState,
    jobs,
    canUpdateStage,
    startStageTimer,
    pauseStageTimer,
    resumeStageTimer,
    finishStageTimer,
  } = useJobs();

  const [pauseReason, setPauseReason] = useState('Lunch Break');
  const [showPauseSelect, setShowPauseSelect] = useState(false);
  const [outputCountInput, setOutputCountInput] = useState('');
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const jobId = timerModalState?.jobId;
  const stageKey = timerModalState?.stageKey;
  const job = jobs.find((j) => j.id === jobId);
  const stage = job?.stages ? job.stages[stageKey] : null;

  const stageNames = {
    blending: 'Blending Stage',
    lc: 'LC (Lighting & Color)',
    path1: 'Path 1 (Preparation & Clipping)',
    path2: 'Path 2 (Secondary Pathing)',
    editor1: 'Editor 1 (Primary Editing)',
    editor2: 'Editor 2 (Secondary Editing)',
    qc: 'QC (Quality Control)',
    fc: 'FC (Final Check & Dispatch)',
  };

  const displayName = stageKey ? stageNames[stageKey] || stageKey.toUpperCase() : '';

  // Body Scroll Lock & Modal State Reset
  useEffect(() => {
    if (timerModalState) {
      document.body.style.overflow = 'hidden';
      setShowFinishConfirm(false);
      setShowPauseSelect(false);
      setOutputCountInput('');
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [timerModalState]);

  useEffect(() => {
    let interval = null;
    if (stage?.status === 'In-Progress' && stage?.startTime) {
      const calculateTime = () => {
        const start = new Date(stage.startTime).getTime();
        const now = Date.now();
        const gross = Math.floor((now - start) / 1000);
        const net = Math.max(0, gross - (stage.pausedDurationSeconds || 0));
        setElapsedSeconds(net);
      };
      calculateTime();
      interval = setInterval(calculateTime, 1000);
    } else if (stage?.status === 'Complete' && stage?.startTime && stage?.endTime) {
      const start = new Date(stage.startTime).getTime();
      const end = new Date(stage.endTime).getTime();
      const gross = Math.floor((end - start) / 1000);
      const net = Math.max(0, gross - (stage.pausedDurationSeconds || 0));
      setElapsedSeconds(net);
    } else {
      setElapsedSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [stage]);

  if (!timerModalState || !job || !stage) return null;

  const canEdit = canUpdateStage(stage.assignee);
  const unlockInfo = checkStageUnlockStatus(job, stageKey);

  const formatHMS = (totalSec) => {
    if (isNaN(totalSec) || totalSec < 0) return '00:00:00';
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = Math.floor(totalSec % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (isoStr) => {
    if (!isoStr) return null;
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return null;
      return (
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) +
        ', ' +
        d.toLocaleDateString([], { month: 'short', day: 'numeric' })
      );
    } catch {
      return null;
    }
  };

  const handleStart = () => {
    if (!canEdit) {
      alert(`Permission Denied: Only ${stage.assignee || 'assigned personnel'}, Manager, or Admin can view/start this stage.`);
      return;
    }
    if (!unlockInfo.isUnlocked) {
      alert(`Stage Locked: ${unlockInfo.lockedReason}`);
      return;
    }
    startStageTimer(jobId, stageKey);
  };

  const handleConfirmPause = () => {
    if (!canEdit) return;
    pauseStageTimer(jobId, stageKey, pauseReason);
    setShowPauseSelect(false);
  };

  const handleResume = () => {
    if (!canEdit) return;
    resumeStageTimer(jobId, stageKey);
  };

  const handleFinishSubmit = (e) => {
    if (e) e.preventDefault();
    if (!canEdit) return;
    if (stage.status === 'Pending') {
      alert('Please start the task timer first before completing this task.');
      return;
    }
    const count = outputCountInput ? Number(outputCountInput) : (job.outputTarget || 0);
    finishStageTimer(jobId, stageKey, count);
    setShowFinishConfirm(false);
    setOutputCountInput('');
    setTimerModalState(null);
  };

  // Pipeline Status Steps Definition
  const statusSteps = [
    { key: 'Pending', label: 'Pending', icon: FiAlertCircle, color: 'rose' },
    { key: 'In-Progress', label: 'In Progress', icon: FiPlay, color: 'indigo' },
    { key: 'Paused', label: 'Paused', icon: FiPause, color: 'purple' },
    { key: 'Complete', label: 'Complete', icon: FiCheckCircle, color: 'emerald' },
  ];

  const getStepState = (stepKey) => {
    if (stage.status === stepKey) return 'active';
    if (stage.status === 'Complete') return 'completed';
    if (stage.status === 'In-Progress' && stepKey === 'Pending') return 'completed';
    if (stage.status === 'Paused' && (stepKey === 'Pending' || stepKey === 'In-Progress')) return 'completed';
    return 'upcoming';
  };

  const pauseLogs = Array.isArray(stage.pauseLogs) ? stage.pauseLogs : [];
  const lastPauseReason = pauseLogs.length > 0 ? pauseLogs[pauseLogs.length - 1]?.reason : 'Break';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 flex items-center justify-center animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col max-h-[88vh] min-h-0 my-auto overflow-hidden">
        {/* Sticky Header with Title & Close Button */}
        <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
              <FiClock className="w-4 h-4 text-indigo-600" /> Stage Work Tracker & Summary
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5 font-display">
              {displayName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Job <span className="font-mono font-bold text-indigo-600">#{job.id}</span> • Client{' '}
              <span className="font-bold text-slate-900">{job.client}</span> ({job.name})
            </p>
          </div>

          <button
            type="button"
            onClick={() => setTimerModalState(null)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Close Modal"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 overflow-y-auto overscroll-contain flex-1 space-y-5">
          {/* PERMISSION DENIED READ-ONLY RESTRICTION */}
          {!canEdit && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
                <FiUserX className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-rose-900">Access Restricted</h3>
                <p className="text-xs text-rose-700 mt-1 leading-relaxed font-medium">
                  This task is assigned to <span className="font-bold text-slate-900">{stage.assignee || 'another team member'}</span>.
                </p>
                <p className="text-xs text-rose-600 mt-0.5 font-semibold">
                  Only <span className="font-bold">{stage.assignee || 'the assigned employee'}</span>, Manager, or Admin can view or access this task summary.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTimerModalState(null)}
                className="mt-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
              >
                Close Summary
              </button>
            </div>
          )}

          {/* PERMITTED VIEW */}
          {canEdit && (
            <>
              {/* COMPLETED TASK SUMMARY VIEW */}
              {stage.status === 'Complete' ? (
                <div className="space-y-4">
                  {/* Teal Completion Header Banner */}
                  <div className="bg-emerald-600 text-white rounded-2xl p-5 border border-emerald-500 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-100">
                        <FiCheckCircle className="w-4 h-4 text-white" /> Task Completed & Verified
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-mono font-bold">
                        {stage.outputCount || job.outputTarget} Files Completed
                      </span>
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-white font-display mt-2">
                      Completed by {stage.assignee}
                    </div>
                    <p className="text-xs text-emerald-100 mt-1 font-medium">
                      All pipeline requirements finished. View complete start, end, and pause break logs below.
                    </p>
                  </div>

                  {/* Active Working Time Summary Box */}
                  <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 text-center shadow-inner">
                    <div className="text-[11px] uppercase tracking-wider text-indigo-300 font-bold mb-1">
                      Net Active Working Duration
                    </div>
                    <div className="font-mono text-4xl sm:text-5xl font-extrabold text-white tracking-tight my-1">
                      {formatHMS(elapsedSeconds)}
                    </div>
                    {(stage.pausedDurationSeconds || 0) > 0 && (
                      <div className="text-xs text-purple-300 font-mono mt-1 font-semibold">
                        Total Paused Break Duration: {formatHMS(stage.pausedDurationSeconds)}
                      </div>
                    )}
                  </div>

                  {/* Start & End Timestamps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        Task Start Timestamp
                      </div>
                      <div className="font-mono font-bold text-slate-900 mt-1 text-sm">
                        {formatTimestamp(stage.startTime) || 'Not Recorded'}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        Task Completion Timestamp
                      </div>
                      <div className="font-mono font-bold text-emerald-700 mt-1 text-sm">
                        {formatTimestamp(stage.endTime) || 'Not Recorded'}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Pause & Break Time Slots Log */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="flex items-center gap-1.5">
                        <FiCalendar className="w-3.5 h-3.5 text-indigo-600" /> Break & Pause Log History
                      </span>
                      <span className="font-mono text-purple-700 font-bold">
                        {pauseLogs.length} Break Slot{pauseLogs.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {pauseLogs.length === 0 ? (
                      <div className="text-xs text-slate-400 italic text-center py-2">
                        No pause breaks logged during this task execution.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {pauseLogs.map((log, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-2xs"
                          >
                            <div>
                              <span className="font-bold text-slate-900">{log.reason || 'Break'}</span>
                              <span className="text-slate-400 text-[11px] block font-mono mt-0.5">
                                Logged at: {formatTimestamp(log.timestamp) || 'Recorded'}
                              </span>
                            </div>
                            <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                              {log.duration ? formatHMS(log.duration) : 'Active'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* ACTIVE / IN-PROGRESS / PENDING TASK TRACKER VIEW */
                <>
                  {/* PIPELINE RESTRICTION ALERT (IF STAGE IS LOCKED BY ORDER) */}
                  {!unlockInfo.isUnlocked && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900 shadow-xs">
                      <FiLock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs space-y-0.5">
                        <div className="font-extrabold text-amber-800 uppercase tracking-wider">
                          🔒 Pipeline Flow Restricted
                        </div>
                        <p className="text-amber-700 leading-relaxed font-medium">
                          {unlockInfo.lockedReason}
                        </p>
                        <div className="text-[11px] text-amber-600 font-semibold mt-1">
                          Required Sequence: <span className="font-bold">Blending ➔ Path ➔ Editing ➔ LC ➔ FC</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* VISUAL PIPELINE STATUS BAR */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                      <span>Pipeline Status Progress</span>
                      <span className="text-slate-700 font-extrabold font-mono text-xs">
                        Current: {stage.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 relative">
                      {statusSteps.map((step) => {
                        const state = getStepState(step.key);
                        const StepIcon = step.icon;

                        let badgeStyle = 'bg-white border-slate-200 text-slate-400';
                        if (state === 'active') {
                          if (step.key === 'Pending') badgeStyle = 'bg-rose-500 text-white border-rose-600 shadow-sm ring-2 ring-rose-200';
                          else if (step.key === 'In-Progress') badgeStyle = 'bg-indigo-600 text-white border-indigo-700 shadow-sm ring-2 ring-indigo-200 animate-pulse';
                          else if (step.key === 'Paused') badgeStyle = 'bg-purple-600 text-white border-purple-700 shadow-sm ring-2 ring-purple-200';
                          else if (step.key === 'Complete') badgeStyle = 'bg-emerald-600 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-200';
                        } else if (state === 'completed') {
                          badgeStyle = 'bg-emerald-100 border-emerald-300 text-emerald-800 font-semibold';
                        }

                        const isCompleteStep = step.key === 'Complete';

                        return (
                          <div key={step.key} className="flex flex-col items-center text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (isCompleteStep && canEdit && stage.status !== 'Complete') {
                                  if (stage.status === 'Pending') {
                                    alert('Please start the task timer first before completing this task.');
                                    return;
                                  }
                                  setShowFinishConfirm(true);
                                }
                              }}
                              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${badgeStyle} ${
                                isCompleteStep && canEdit && stage.status !== 'Complete' ? 'cursor-pointer hover:scale-110 hover:border-emerald-500' : 'cursor-default'
                              }`}
                              title={isCompleteStep && canEdit && stage.status !== 'Complete' ? 'Click to Complete Stage' : undefined}
                            >
                              <StepIcon className="w-4 h-4" />
                            </button>
                            <span
                              className={`text-[10px] font-bold mt-1.5 ${
                                state === 'active'
                                  ? 'text-slate-900 font-extrabold'
                                  : state === 'completed'
                                  ? 'text-emerald-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Assigned Team Member & Target Info */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-slate-400 font-medium">Assigned Team Member</div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">{stage.assignee || 'Unassigned'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 font-medium">Target Output</div>
                      <div className="text-sm font-bold text-indigo-600 font-mono mt-0.5">{job.outputTarget} Files</div>
                    </div>
                  </div>

                  {/* Active Timer Box */}
                  <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 text-center relative shadow-inner">
                    <div className="text-[11px] uppercase tracking-wider text-indigo-300 font-bold mb-1">
                      Active Stage Working Time
                    </div>

                    <div className="font-mono text-4xl sm:text-5xl font-extrabold text-white tracking-tight my-2">
                      {formatHMS(elapsedSeconds)}
                    </div>

                    {/* Current Status Pill */}
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold">
                      {stage.status === 'In-Progress' && (
                        <span className="bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 font-bold">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" /> Active — In Progress
                        </span>
                      )}
                      {stage.status === 'Paused' && (
                        <span className="bg-purple-500/20 text-purple-200 border border-purple-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 font-semibold">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Paused ({lastPauseReason})
                        </span>
                      )}
                      {stage.status === 'Pending' && (
                        <span className="bg-rose-500/20 text-rose-200 border border-rose-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 font-medium">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Ready to Start (Pending)
                        </span>
                      )}
                    </div>

                    {(stage.pausedDurationSeconds || 0) > 0 && (
                      <div className="text-xs text-purple-300 mt-2 font-mono">
                        Total Paused Break Duration: {formatHMS(stage.pausedDurationSeconds)}
                      </div>
                    )}
                  </div>

                  {/* TIMESTAMPS LOG & TRACKING DETAILS */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/80 pb-2">
                      <FiCalendar className="w-3.5 h-3.5 text-indigo-600" /> Stage Timestamps & Activity Log
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Start Timestamp */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                        <div className="text-[11px] text-slate-400 font-medium">Task Started At</div>
                        <div className="font-mono font-bold text-slate-900 mt-0.5">
                          {formatTimestamp(stage.startTime) || <span className="text-slate-400 italic">Not Started</span>}
                        </div>
                      </div>

                      {/* Completion Timestamp */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                        <div className="text-[11px] text-slate-400 font-medium">Task Finished At</div>
                        <div className="font-mono font-bold text-slate-900 mt-0.5">
                          <span className="text-slate-400 italic">In Progress</span>
                        </div>
                      </div>
                    </div>

                    {/* Pause Break History Log */}
                    {pauseLogs.length > 0 && (
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-2">
                        <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center justify-between">
                          <span>Break & Pause Log History ({pauseLogs.length})</span>
                          <span className="font-mono">{formatHMS(stage.pausedDurationSeconds || 0)} Total</span>
                        </div>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                          {pauseLogs.map((log, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center bg-purple-50/60 p-2 rounded-lg text-[11px] text-purple-900 border border-purple-100"
                            >
                              <div>
                                <span className="font-bold">{log.reason || 'Break'}</span>
                                <span className="text-purple-600 ml-2 font-mono">
                                  ({formatTimestamp(log.timestamp) || 'Recorded'})
                                </span>
                              </div>
                              {log.duration ? (
                                <span className="font-mono font-bold text-purple-700">{formatHMS(log.duration)}</span>
                              ) : (
                                <span className="font-mono text-purple-500 italic">Active</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ACTION CONTROLS */}
                  {stage.status === 'Pending' && (
                    <div>
                      {unlockInfo.isUnlocked ? (
                        <button
                          onClick={handleStart}
                          className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                        >
                          <FiPlay className="w-4 h-4" /> Start Task Timer
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-3.5 rounded-xl bg-slate-200 text-slate-500 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-2 border border-slate-300"
                        >
                          <FiLock className="w-4 h-4 text-slate-400" /> Locked — Complete {unlockInfo.prereqName} First
                        </button>
                      )}
                    </div>
                  )}

                  {/* When stage is In-Progress: Show Pause Break and Finish Task */}
                  {stage.status === 'In-Progress' && !showFinishConfirm && !showPauseSelect && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowPauseSelect(true)}
                        className="py-3.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <FiPause className="w-4 h-4" /> Pause Break
                      </button>
                      <button
                        onClick={() => setShowFinishConfirm(true)}
                        className="py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <FiCheckCircle className="w-4 h-4" /> Finish Task
                      </button>
                    </div>
                  )}

                  {/* Pause Reason Selection */}
                  {showPauseSelect && (
                    <div className="bg-purple-50/60 rounded-2xl p-4 border border-purple-200">
                      <div className="text-xs font-bold text-purple-800 mb-2 flex items-center gap-1.5">
                        <FiPause className="w-4 h-4" /> Select Pause Reason
                      </div>
                      <select
                        value={pauseReason}
                        onChange={(e) => setPauseReason(e.target.value)}
                        className="w-full bg-white text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none mb-3 font-medium"
                      >
                        <option value="Lunch Break">Lunch Break</option>
                        <option value="Tea / Short Break">Tea / Short Break</option>
                        <option value="Waiting for Files / Instructions">Waiting for Files / Instructions</option>
                        <option value="Client Query Clarification">Client Query Clarification</option>
                        <option value="System Maintenance">System Maintenance</option>
                      </select>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowPauseSelect(false)}
                          className="w-1/2 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmPause}
                          className="w-1/2 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-xs"
                        >
                          Confirm Pause
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Resuming from Pause or Finishing from Pause */}
                  {stage.status === 'Paused' && !showFinishConfirm && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleResume}
                        className="py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
                      >
                        <FiPlay className="w-4 h-4" /> Resume Working Timer
                      </button>
                      <button
                        onClick={() => setShowFinishConfirm(true)}
                        className="py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-1.5 transition-all"
                      >
                        <FiCheckCircle className="w-4 h-4" /> Finish Task
                      </button>
                    </div>
                  )}

                  {/* Completion Confirmation Form */}
                  {showFinishConfirm && (
                    <form onSubmit={handleFinishSubmit} className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200">
                      <div className="text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
                        <FiCheckCircle className="w-4 h-4" /> Confirm Task Completion
                      </div>
                      <p className="text-xs text-slate-500 mb-3">Enter final completed file output count:</p>
                      <input
                        type="number"
                        value={outputCountInput}
                        placeholder={`Target: ${job.outputTarget}`}
                        onChange={(e) => setOutputCountInput(e.target.value)}
                        className="w-full bg-white text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none mb-3 font-mono font-bold"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowFinishConfirm(false)}
                          className="w-1/2 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="w-1/2 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs"
                        >
                          Submit Completion
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
