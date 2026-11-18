/**
 * WorkSphere - Task & Performance Utilities
 * Configured for Visartech (America/Chicago timezone)
 */

import { getChicagoDateKey } from './attendance.js';

export const TASK_STATUS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

export const TASK_PRIORITY = {
  URGENT: 'Urgent',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export const PRIORITY_COLORS = {
  Urgent: '#DC2626',  // Bright Red
  High: '#EF4444',    // Red
  Medium: '#F59E0B',  // Amber
  Low: '#10B981',     // Green
};

export const STATUS_COLORS = {
  'To Do': '#64748B',        // Slate
  'In Progress': '#0284C7',  // Sky Blue
  'Completed': '#10B981',    // Emerald
};

/**
 * Check if a task is overdue based on today's Chicago date
 */
export const isTaskOverdue = (dueDate, status) => {
  if (!dueDate || status === TASK_STATUS.COMPLETED) return false;
  const todayKey = getChicagoDateKey();
  return dueDate < todayKey;
};

/**
 * Calculate completion percentage safely
 */
export const calculateCompletionRate = (tasks = []) => {
  if (!Array.isArray(tasks) || tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === TASK_STATUS.COMPLETED).length;
  return Math.round((completed / tasks.length) * 100);
};
