/**
 * WorkSphere - Chicago Timezone & Attendance Calculations
 * Configured specifically for Visartech (America/Chicago timezone)
 */

export const CHICAGO_TIMEZONE = 'America/Chicago';

/**
 * Format a Date object or timestamp into Chicago localized date string
 * e.g., "Wednesday, Nov 18, 2026"
 */
export const formatChicagoDate = (date = new Date(), options = {}) => {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: CHICAGO_TIMEZONE,
    weekday: options.weekday || 'short',
    month: options.month || 'short',
    day: options.day || 'numeric',
    year: options.year || 'numeric',
  }).format(d);
};

/**
 * Format a Date object or timestamp into Chicago localized time string
 * e.g., "09:05 AM"
 */
export const formatChicagoTime = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: CHICAGO_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
};

/**
 * Get current date key in Chicago time: "YYYY-MM-DD"
 */
export const getChicagoDateKey = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: CHICAGO_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
};

/**
 * Get Chicago hours and minutes for comparison (e.g. 9 for 09:00)
 */
export const getChicagoTimeParts = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: CHICAGO_TIMEZONE,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(d);

  let hour = 0;
  let minute = 0;
  parts.forEach((p) => {
    if (p.type === 'hour') hour = parseInt(p.value, 10);
    if (p.type === 'minute') minute = parseInt(p.value, 10);
  });

  return { hour, minute };
};

/**
 * Determine if a check-in is 'Present' or 'Late' based on Visartech policy:
 * Work starts at 09:00 AM Chicago time. Grace period is 15 minutes (09:15 AM).
 */
export const evaluateAttendanceStatus = (checkInDate = new Date()) => {
  const { hour, minute } = getChicagoTimeParts(checkInDate);
  // After 9:15 AM is considered Late
  if (hour > 9 || (hour === 9 && minute > 15)) {
    return 'Late';
  }
  return 'Present';
};

/**
 * Calculate working hours between two timestamps or ISO strings
 * Returns: { hours, minutes, totalMinutes, formatted }
 */
export const calculateWorkingHours = (checkInTime, checkOutTime) => {
  if (!checkInTime) {
    return { hours: 0, minutes: 0, totalMinutes: 0, formatted: '--' };
  }

  const start = new Date(checkInTime).getTime();
  const end = checkOutTime ? new Date(checkOutTime).getTime() : new Date().getTime();

  if (isNaN(start) || isNaN(end) || end < start) {
    return { hours: 0, minutes: 0, totalMinutes: 0, formatted: '0h 0m' };
  }

  const diffMs = end - start;
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return {
    hours,
    minutes,
    totalMinutes,
    formatted: `${hours}h ${minutes}m`,
  };
};

/**
 * Format duration string from recorded hours and minutes or decimal
 */
export const formatDuration = (hours, minutes) => {
  if (hours == null && minutes == null) return '--';
  return `${hours || 0}h ${minutes || 0}m`;
};
