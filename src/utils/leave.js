/**
 * WorkSphere - Leave Management Utilities
 * Configured for Visartech (America/Chicago timezone)
 */

import { getChicagoDateKey, formatChicagoDate } from './attendance.js';

export const LEAVE_TYPES = {
  CASUAL: 'Casual Leave',
  SICK: 'Sick Leave',
  ANNUAL: 'Annual Leave',
  PERSONAL: 'Personal Leave',
};

// Map display names to balance object keys
export const LEAVE_TYPE_KEYS = {
  'Casual Leave': 'casual',
  'Sick Leave': 'sick',
  'Annual Leave': 'annual',
  'Personal Leave': 'personal',
};

export const LEAVE_TYPE_COLORS = {
  'Casual Leave': '#0284C7',   // Sky Blue
  'Sick Leave': '#EF4444',     // Rose / Red
  'Annual Leave': '#10B981',   // Emerald / Green
  'Personal Leave': '#8B5CF6', // Purple
};

export const DEFAULT_ENTITLEMENTS = {
  casual: 10,
  sick: 10,
  annual: 15,
  personal: 5,
};

/**
 * Calculate the number of calendar days between startDate and endDate (inclusive).
 * Note: Calendar days are used for this prototype.
 * e.g., 2026-11-20 to 2026-11-20 = 1 day.
 * 2026-11-20 to 2026-11-22 = 3 days.
 */
export const calculateLeaveDays = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return 0;

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (end < start) return 0;

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
};

/**
 * Validate a leave application before submission.
 * Checks:
 * 1. Required fields.
 * 2. Start date cannot be in the past (Chicago date).
 * 3. End date cannot be before start date.
 * 4. Overlapping with existing Pending or Approved applications for the same employee.
 * 5. Available balance for the selected leave type.
 */
export const validateLeaveApplication = (
  { leaveType, startDate, endDate, reason },
  employeeBalance,
  existingEmployeeRequests = []
) => {
  if (!leaveType) {
    return { isValid: false, error: 'Please select a leave type.' };
  }
  if (!startDate || !endDate) {
    return { isValid: false, error: 'Please select both start date and end date.' };
  }
  if (!reason || reason.trim().length === 0) {
    return { isValid: false, error: 'Please provide a reason for the leave.' };
  }

  const todayKey = getChicagoDateKey();

  // Rule: Start date cannot be in the past
  if (startDate < todayKey) {
    return {
      isValid: false,
      error: `Start date cannot be in the past. (Today in Chicago is ${formatChicagoDate(new Date())})`,
    };
  }

  // Rule: End date cannot be before start date
  if (endDate < startDate) {
    return {
      isValid: false,
      error: 'End date cannot be earlier than start date.',
    };
  }

  const days = calculateLeaveDays(startDate, endDate);
  if (days <= 0) {
    return { isValid: false, error: 'Invalid date selection.' };
  }

  // Rule: Prevent overlapping pending or approved leave requests
  const hasOverlap = existingEmployeeRequests.some((req) => {
    if (req.status !== 'Pending' && req.status !== 'Approved') return false;
    // Two intervals [s1, e1] and [s2, e2] overlap if s1 <= e2 && e1 >= s2
    return req.startDate <= endDate && req.endDate >= startDate;
  });

  if (hasOverlap) {
    return {
      isValid: false,
      error: 'You already have an active (Pending or Approved) leave request overlapping with these dates.',
    };
  }

  // Rule: Prevent applications exceeding available leave balance
  const typeKey = LEAVE_TYPE_KEYS[leaveType];
  const available = employeeBalance?.remaining?.[typeKey] ?? 0;

  if (days > available) {
    return {
      isValid: false,
      error: `Requested duration (${days} ${days === 1 ? 'day' : 'days'}) exceeds your available ${leaveType} balance (${available} ${available === 1 ? 'day' : 'days'} remaining).`,
    };
  }

  return { isValid: true, days };
};
