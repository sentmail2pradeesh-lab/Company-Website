/**
 * Pipeline Stage Order Helper
 * Enforces stage dependency sequence:
 * 1. Blending
 * 2. Path (Path 1 / Path 2)
 * 3. Editing (Editor 1 / Editor 2)
 * 4. LC (Lighting & Color)
 * 5. FC (Final Check)
 */

export const checkStageUnlockStatus = (job, stageKey) => {
  if (!job || !job.stages) return { isUnlocked: true, lockedReason: '' };

  const stages = job.stages;

  // A stage is considered "satisfied" if it is completed or unassigned (not allocated)
  const isSatisfied = (key) => {
    const s = stages[key];
    if (!s) return true;
    if (!s.assignee) return true; // Unassigned stages do not block downstream steps
    return s.status === 'Complete';
  };

  // Step 1: Blending
  if (stageKey === 'blending') {
    return { isUnlocked: true, lockedReason: '' };
  }

  // Step 2: Path (path1, path2) -> Requires Blending to be completed
  if (stageKey === 'path1' || stageKey === 'path2') {
    if (!isSatisfied('blending')) {
      return {
        isUnlocked: false,
        lockedReason: 'Blending stage is currently incomplete. Blending must be Completed before starting Path stage!',
        prereqName: 'Blending Stage',
      };
    }
    return { isUnlocked: true, lockedReason: '' };
  }

  // Step 3: Editing (editor1, editor2) -> Requires Blending & Path stages to be completed
  if (stageKey === 'editor1' || stageKey === 'editor2') {
    if (!isSatisfied('blending')) {
      return {
        isUnlocked: false,
        lockedReason: 'Blending stage must be Completed first before starting Editing!',
        prereqName: 'Blending Stage',
      };
    }
    if (!isSatisfied('path1') || !isSatisfied('path2')) {
      return {
        isUnlocked: false,
        lockedReason: 'Path stages (Path 1 / Path 2) must be Completed before starting Editing!',
        prereqName: 'Path Stages',
      };
    }
    return { isUnlocked: true, lockedReason: '' };
  }

  // Step 4: LC (Lighting & Color) -> Requires Editing (and earlier) to be completed
  if (stageKey === 'lc') {
    if (!isSatisfied('blending')) {
      return {
        isUnlocked: false,
        lockedReason: 'Blending stage must be Completed first before starting LC!',
        prereqName: 'Blending Stage',
      };
    }
    if (!isSatisfied('path1') || !isSatisfied('path2')) {
      return {
        isUnlocked: false,
        lockedReason: 'Path stages must be Completed before starting LC!',
        prereqName: 'Path Stages',
      };
    }
    if (!isSatisfied('editor1') || !isSatisfied('editor2')) {
      return {
        isUnlocked: false,
        lockedReason: 'Editing stages (Editor 1 / Editor 2) must be Completed before starting LC!',
        prereqName: 'Editing Stages',
      };
    }
    return { isUnlocked: true, lockedReason: '' };
  }

  // Step 5: FC (Final Check) -> Requires LC (and all earlier) to be completed
  if (stageKey === 'fc') {
    if (!isSatisfied('blending')) {
      return {
        isUnlocked: false,
        lockedReason: 'Blending stage must be Completed first before starting FC!',
        prereqName: 'Blending Stage',
      };
    }
    if (!isSatisfied('path1') || !isSatisfied('path2')) {
      return {
        isUnlocked: false,
        lockedReason: 'Path stages must be Completed before starting FC!',
        prereqName: 'Path Stages',
      };
    }
    if (!isSatisfied('editor1') || !isSatisfied('editor2')) {
      return {
        isUnlocked: false,
        lockedReason: 'Editing stages must be Completed before starting FC!',
        prereqName: 'Editing Stages',
      };
    }
    if (!isSatisfied('lc')) {
      return {
        isUnlocked: false,
        lockedReason: 'LC (Lightroom Correction) stage must be Completed before starting FC!',
        prereqName: 'LC Stage',
      };
    }
    return { isUnlocked: true, lockedReason: '' };
  }

  return { isUnlocked: true, lockedReason: '' };
};

/**
 * Operational Workday / Production Shift Date Helper
 * Shift Cutoff Window: 6:00 AM to 6:00 AM Next Day (One Day)
 * Any task running or completed between 00:00 AM and 05:59 AM belongs to YESTERDAY'S 6 AM - 6 AM Shift.
 */
export const getProductionShiftDate = (dateOrIsoStr, cutoffHour = 6) => {
  const d = dateOrIsoStr ? new Date(dateOrIsoStr) : new Date();
  if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);

  if (d.getHours() < cutoffHour) {
    d.setDate(d.getDate() - 1);
  }
  return d.toISOString().slice(0, 10);
};

export const getShiftLabel = (dateOrIsoStr, cutoffHour = 6) => {
  const shiftDate = getProductionShiftDate(dateOrIsoStr, cutoffHour);
  const nowShiftDate = getProductionShiftDate(new Date(), cutoffHour);
  if (shiftDate === nowShiftDate) return "Today's Shift (6 AM - 6 AM)";
  return shiftDate;
};
