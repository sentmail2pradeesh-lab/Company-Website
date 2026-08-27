import { useState, useEffect } from 'react';
import { useJobs } from '../../context/JobContext';
import { FiClock, FiPlay, FiPause, FiCheckCircle, FiX } from 'react-icons/fi';

export default function TaskTimerModal() {
  const { timerModalState, setTimerModalState, jobs, startStageTimer, pauseStageTimer, resumeStageTimer, finishStageTimer } = useJobs();

  const [pauseReason, setPauseReason] = useState('Lunch Break');
  const [showPauseSelect, setShowPauseSelect] = useState(false);
  const [outputCountInput, setOutputCountInput] = useState('');
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  if (!timerModalState) return null;

  const { jobId, stageKey } = timerModalState;
  const job = jobs.find((j) => j.id === jobId);
  if (!job) return null;

  const stage = job.stages[stageKey];
  if (!stage) return null;

  const stageNames = {
    path1: 'Path 1 (Preparation)',
    path2: 'Path 2 (Masking/Pathing)',
    editor1: 'Editor 1 (Primary Edit)',
    editor2: 'Editor 2 (Secondary Edit)',
    qc: 'QC (Quality Control)',
    fc: 'FC (Final Check)',
  };

  useEffect(() => {
    let interval = null;
    if (stage.status === 'In-Progress' && stage.startTime) {
      const calculateTime = () => {
        const start = new Date(stage.startTime).getTime();
        const now = Date.now();
        const gross = Math.floor((now - start) / 1000);
        const net = Math.max(0, gross - (stage.pausedDurationSeconds || 0));
        setElapsedSeconds(net);
      };
      calculateTime();
      interval = setInterval(calculateTime, 1000);
    } else if (stage.status === 'Complete' && stage.startTime && stage.endTime) {
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

  const formatHMS = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    startStageTimer(jobId, stageKey);
  };

  const handleConfirmPause = () => {
    pauseStageTimer(jobId, stageKey, pauseReason);
    setShowPauseSelect(false);
  };

  const handleResume = () => {
    resumeStageTimer(jobId, stageKey);
  };

  const handleFinishSubmit = (e) => {
    e.preventDefault();
    const count = outputCountInput ? Number(outputCountInput) : job.outputTarget;
    finishStageTimer(jobId, stageKey, count);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setTimerModalState(null)}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            <FiClock className="w-3.5 h-3.5" /> Stage Timer & Time Tracker
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-1">
            {stageNames[stageKey]}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Job <span className="font-mono font-bold text-indigo-600">#{job.id}</span> • Client <span className="font-bold text-slate-900">{job.client}</span> ({job.name})
          </p>
        </div>

        {/* Employee Info Card */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 mb-5 flex items-center justify-between text-xs">
          <div>
            <div className="text-slate-400">Assigned Team Member</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{stage.assignee || 'Unassigned'}</div>
          </div>
          <div className="text-right">
            <div className="text-slate-400">Target Output</div>
            <div className="text-sm font-bold text-indigo-600 font-mono mt-0.5">{job.outputTarget} Files</div>
          </div>
        </div>

        {/* Timer Box */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center mb-5 relative">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">
            Active Working Time
          </div>

          <div className="font-mono text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight my-2">
            {formatHMS(elapsedSeconds)}
          </div>

          {/* Status Badge */}
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold">
            {stage.status === 'In-Progress' && (
              <span className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Active — In Progress
              </span>
            )}
            {stage.status === 'Paused' && (
              <span className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> Paused ({stage.pauseLogs[stage.pauseLogs.length - 1]?.reason || 'Break'})
              </span>
            )}
            {stage.status === 'Pending' && (
              <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Ready to Start
              </span>
            )}
            {stage.status === 'Complete' && (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 font-semibold">
                <FiCheckCircle className="w-3.5 h-3.5" /> Stage Completed
              </span>
            )}
          </div>

          {stage.pausedDurationSeconds > 0 && (
            <div className="text-xs text-purple-700 mt-2 font-mono">
              Total Paused Break: {formatHMS(stage.pausedDurationSeconds)}
            </div>
          )}
        </div>

        {/* Action Controls */}
        {stage.status === 'Pending' && (
          <button
            onClick={handleStart}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-xs flex items-center justify-center gap-2 transition-all"
          >
            <FiPlay className="w-4 h-4" /> Start Task Timer
          </button>
        )}

        {stage.status === 'In-Progress' && !showFinishConfirm && !showPauseSelect && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowPauseSelect(true)}
              className="py-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <FiPause className="w-4 h-4" /> Pause Break
            </button>
            <button
              onClick={() => setShowFinishConfirm(true)}
              className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <FiCheckCircle className="w-4 h-4" /> Finish Task
            </button>
          </div>
        )}

        {/* Pause Reason Selection */}
        {showPauseSelect && (
          <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-200">
            <div className="text-xs font-bold text-purple-800 mb-2 flex items-center gap-1.5">
              <FiPause className="w-4 h-4" /> Select Pause Reason
            </div>
            <select
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              className="w-full bg-white text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none mb-3"
            >
              <option value="Lunch Break">Lunch Break</option>
              <option value="Tea / Short Break">Tea / Short Break</option>
              <option value="Waiting for Files / Instructions">Waiting for Files / Instructions</option>
              <option value="Client Query Clarification">Client Query Clarification</option>
              <option value="System Maintenance">System Maintenance</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setShowPauseSelect(false)}
                className="w-1/2 py-2 rounded-lg bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPause}
                className="w-1/2 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700"
              >
                Confirm Pause
              </button>
            </div>
          </div>
        )}

        {/* Resuming */}
        {stage.status === 'Paused' && (
          <button
            onClick={handleResume}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-xs flex items-center justify-center gap-2 transition-all"
          >
            <FiPlay className="w-4 h-4" /> Resume Working Timer
          </button>
        )}

        {/* Completion Form */}
        {showFinishConfirm && (
          <form onSubmit={handleFinishSubmit} className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200">
            <div className="text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
              <FiCheckCircle className="w-4 h-4" /> Confirm Task Completion
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Enter final completed file output count:
            </p>
            <input
              type="number"
              value={outputCountInput}
              placeholder={`Target: ${job.outputTarget}`}
              onChange={(e) => setOutputCountInput(e.target.value)}
              className="w-full bg-white text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none mb-3 font-mono"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowFinishConfirm(false)}
                className="w-1/2 py-2 rounded-lg bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
              >
                Submit Completion
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
