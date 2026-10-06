/**
 * Date and Timeline Utilities for Vista Editz
 * Provides standard DD/MM/YYYY formatting and Sunday holiday exclusion.
 */

export function formatDateDMY(dateStr) {
  if (!dateStr) return '';
  const str = String(dateStr).trim();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, m, d] = match;
    return `${d}/${m}/${y}`;
  }
  try {
    const d = new Date(str);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

export function isSunday(dateStr) {
  if (!dateStr) return false;
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  return dateObj.getDay() === 0;
}

export function countSundays(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return 0;
  const [sy, sm, sd] = startDateStr.split('-').map(Number);
  const [ey, em, ed] = endDateStr.split('-').map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);

  if (end < start) return 0;

  let sundays = 0;
  let cur = new Date(start);
  while (cur <= end) {
    if (cur.getDay() === 0) sundays++;
    cur.setDate(cur.getDate() + 1);
  }
  return sundays;
}

export function calculateWorkingDays(startDateStr, endDateStr, isHalfDay = false) {
  if (!startDateStr) return 0;
  if (isHalfDay) {
    const [y, m, d] = startDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.getDay() === 0 ? 0 : 0.5;
  }
  if (!endDateStr) return 0;

  const [sy, sm, sd] = startDateStr.split('-').map(Number);
  const [ey, em, ed] = endDateStr.split('-').map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);

  if (end < start) return 0;

  let workingDays = 0;
  let cur = new Date(start);
  while (cur <= end) {
    // Exclude Sundays (company holiday)
    if (cur.getDay() !== 0) {
      workingDays++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return workingDays;
}

/**
 * Calculates the operational workday date string (YYYY-MM-DD).
 * Operational day runs from 06:00:00 AM to 05:59:59 AM (next calendar morning).
 * Any activity occurring between 00:00 and 05:59 AM is grouped into the previous day's shift.
 */
export function getOperationalDate(dateInput = new Date()) {
  try {
    let d;
    if (dateInput instanceof Date) {
      d = new Date(dateInput.getTime());
    } else if (typeof dateInput === 'number') {
      d = new Date(dateInput);
    } else if (typeof dateInput === 'string' && dateInput.trim()) {
      let str = dateInput.trim();
      // If only YYYY-MM-DD without time, treat as that calendar day's base
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        return str;
      }
      if ((str.includes('T') || str.includes(' ')) && !str.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(str)) {
        str = str.replace(' ', 'T') + 'Z';
      }
      d = new Date(str);
    } else {
      d = new Date();
    }

    if (isNaN(d.getTime())) {
      d = new Date();
    }

    // Shift backward by 6 hours: 06:00 AM becomes 00:00 AM of that day
    const shifted = new Date(d.getTime() - 6 * 60 * 60 * 1000);
    const year = shifted.getFullYear();
    const month = String(shifted.getMonth() + 1).padStart(2, '0');
    const day = String(shifted.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/**
 * Checks if a given timestamp/date falls into a target operational date (YYYY-MM-DD).
 */
export function isSameOperationalDay(timestamp, targetOperationalDateStr) {
  if (!timestamp || !targetOperationalDateStr) return false;
  return getOperationalDate(timestamp) === targetOperationalDateStr;
}

/**
 * Returns human-friendly shift label for an operational date.
 */
export function formatOperationalShiftLabel(dateStr) {
  if (!dateStr) return '';
  const currentOp = getOperationalDate(new Date());
  const isToday = dateStr === currentOp;
  const dmy = formatDateDMY(dateStr);
  return isToday
    ? `Today's Shift (${dmy}, 06:00 AM - 05:59 AM)`
    : `Shift of ${dmy} (06:00 AM - 05:59 AM)`;
}

/**
 * Returns the current calendar date in local time as YYYY-MM-DD.
 * Unlike toISOString(), this is immune to UTC timezone offsets.
 */
export function getTodayLocalDateStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a DD/MM/YYYY or DD-MM-YYYY string into standard YYYY-MM-DD format.
 */
export function parseDMYToISO(dmyStr) {
  if (!dmyStr) return '';
  const match = String(dmyStr).trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    const day = parseInt(d, 10);
    const month = parseInt(m, 10);
    const year = parseInt(y, 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }
  return '';
}

/**
 * Formats an ISO datetime string or Date object to a readable 12-hour local time (e.g., 09:30 AM).
 */
export function formatTime(isoStr) {
  if (!isoStr) return '-';
  try {
    let str = String(isoStr).trim();
    if (!str) return '-';
    if ((str.includes('T') || str.includes(' ')) && !str.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(str)) {
      str = str.replace(' ', 'T') + 'Z';
    }
    const d = new Date(str);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return isoStr;
  }
}

