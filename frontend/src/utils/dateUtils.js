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
