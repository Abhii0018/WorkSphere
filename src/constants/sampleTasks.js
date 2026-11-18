/**
 * WorkSphere - Sample Tasks Dataset for Visartech
 * Provides realistic tasks and milestones across all 6 employees.
 */

import { TASK_STATUS, TASK_PRIORITY } from '../utils/tasks.js';

export const generateSampleTasks = () => {
  return [
    // 1. Alex Turner (emp-101) - Active sprint feature
    {
      id: 'task-101-1',
      title: 'Implement JWT Token Refresh Interceptor',
      description: 'Add auto-refresh axios interceptor for silent session token renewal on 401 unauthorized responses.',
      assignedTo: 'emp-101',
      assignedToName: 'Alex Turner',
      department: 'Digital Solutions Lab',
      assignedBy: 'Elena Rostova (Lead HR Manager)',
      priority: TASK_PRIORITY.HIGH,
      dueDate: '2026-11-25',
      status: TASK_STATUS.IN_PROGRESS,
      createdAt: '2026-11-15T10:00:00.000Z',
      completedAt: null,
      completionNote: null,
    },
    // 2. Alex Turner (emp-101) - Completed sprint item
    {
      id: 'task-101-2',
      title: 'Optimize Mobile Screen Re-rendering in Tabs',
      description: 'Apply React.memo and useCallback optimizations to Dashboard and Attendance tab screens.',
      assignedTo: 'emp-101',
      assignedToName: 'Alex Turner',
      department: 'Digital Solutions Lab',
      assignedBy: 'Elena Rostova (Lead HR Manager)',
      priority: TASK_PRIORITY.MEDIUM,
      dueDate: '2026-11-16',
      status: TASK_STATUS.COMPLETED,
      createdAt: '2026-11-12T09:00:00.000Z',
      completedAt: '2026-11-16T16:30:00.000Z',
      completionNote: 'Reduced redundant renders by 42% on Android test emulator.',
    },
    // 3. Alex Turner (emp-101) - Overdue task for testing overdue detection
    {
      id: 'task-101-3',
      title: 'Update Client API Documentation for v2.4',
      description: 'Document breaking payload changes and parameter deprecations for client partner integration.',
      assignedTo: 'emp-101',
      assignedToName: 'Alex Turner',
      department: 'Digital Solutions Lab',
      assignedBy: 'Elena Rostova (Lead HR Manager)',
      priority: TASK_PRIORITY.MEDIUM,
      dueDate: '2026-11-14', // Past due!
      status: TASK_STATUS.IN_PROGRESS,
      createdAt: '2026-11-08T11:00:00.000Z',
      completedAt: null,
      completionNote: null,
    },
    // 4. Alex Turner (emp-101) - To Do item
    {
      id: 'task-101-4',
      title: 'Profile Memory Leaks on Background Subscriptions',
      description: 'Ensure all setInterval and AsyncStorage listeners are cleanly unsubscribed upon unmount.',
      assignedTo: 'emp-101',
      assignedToName: 'Alex Turner',
      department: 'Digital Solutions Lab',
      assignedBy: 'Elena Rostova (Lead HR Manager)',
      priority: TASK_PRIORITY.LOW,
      dueDate: '2026-11-30',
      status: TASK_STATUS.TODO,
      createdAt: '2026-11-18T08:30:00.000Z',
      completedAt: null,
      completionNote: null,
    },
    // 5. Sarah Jenkins (emp-102) - UI/UX Design System
    {
      id: 'task-102-1',
      title: 'Design Mobile Dark Mode Corporate Palette',
      description: 'Prepare high-contrast dark theme token specification matching Visartech brand guidelines.',
      assignedTo: 'emp-102',
      assignedToName: 'Sarah Jenkins',
      department: 'Product Design',
      assignedBy: 'Elena Rostova (Lead HR Manager)',
      priority: TASK_PRIORITY.HIGH,
      dueDate: '2026-11-22',
      status: TASK_STATUS.IN_PROGRESS,
      createdAt: '2026-11-14T14:00:00.000Z',
      completedAt: null,
      completionNote: null,
    },
    {
      id: 'task-102-2',
      title: 'Export Vector App Icon Assets for Android',
      description: 'Generate adaptive icon foreground, background, and monochrome SVG assets.',
      assignedTo: 'emp-102',
      assignedToName: 'Sarah Jenkins',
      department: 'Product Design',
      assignedBy: 'Elena Rostova (Lead HR Manager)',
      priority: TASK_PRIORITY.MEDIUM,
      dueDate: '2026-11-15',
      status: TASK_STATUS.COMPLETED,
      createdAt: '2026-11-10T11:00:00.000Z',
      completedAt: '2026-11-15T15:20:00.000Z',
      completionNote: 'Assets delivered to mobile engineering repo.',
    },
    // 6. Michael Chen (emp-103) - Cloud & DevOps
    {
      id: 'task-103-1',
      title: 'Configure Automated CI/CD Docker Pipeline',
      description: 'Set up staging container deployment workflow with lint and test verification steps.',
      assignedTo: 'emp-103',
      assignedToName: 'Michael Chen',
      department: 'Infrastructure',
      assignedBy: 'Elena Rostova (Lead HR Manager)',
      priority: TASK_PRIORITY.HIGH,
      dueDate: '2026-11-26',
      status: TASK_STATUS.IN_PROGRESS,
      createdAt: '2026-11-16T13:00:00.000Z',
      completedAt: null,
      completionNote: null,
    },
    // 7. Priya Sharma (emp-104) - Full Stack Engineer
    {
      id: 'task-104-1',
      title: 'Audit MongoDB Aggregation Index Performance',
      description: 'Ensure compound indexes exist for frequent attendance and leave query ranges.',
      assignedTo: 'emp-104',
      assignedToName: 'Priya Sharma',
      department: 'Digital Solutions Lab',
      assignedBy: 'Elena Rostova (Lead HR Manager)',
      priority: TASK_PRIORITY.MEDIUM,
      dueDate: '2026-11-24',
      status: TASK_STATUS.IN_PROGRESS,
      createdAt: '2026-11-17T09:30:00.000Z',
      completedAt: null,
      completionNote: null,
    },
    // 8. David Miller (emp-105) - QA Automation
    {
      id: 'task-105-1',
      title: 'Automate End-to-End Leave Workflow Test',
      description: 'Create automated regression script validating leave balance deduction on approval.',
      assignedTo: 'emp-105',
      assignedToName: 'David Miller',
      department: 'Quality Assurance',
      assignedBy: 'Elena Rostova (Lead HR Manager)',
      priority: TASK_PRIORITY.HIGH,
      dueDate: '2026-11-28',
      status: TASK_STATUS.TODO,
      createdAt: '2026-11-18T08:00:00.000Z',
      completedAt: null,
      completionNote: null,
    },
    // 9. Olivia Taylor (emp-106) - Solutions Architect
    {
      id: 'task-106-1',
      title: 'Architect Microservice Boundary for Payroll Service',
      description: 'Draft technical RFC for payroll calculation engine with audit log integrity.',
      assignedTo: 'emp-106',
      assignedToName: 'Olivia Taylor',
      department: 'Client Tech Advisory',
      assignedBy: 'Elena Rostova (Lead HR Manager)',
      priority: TASK_PRIORITY.HIGH,
      dueDate: '2026-11-20',
      status: TASK_STATUS.COMPLETED,
      createdAt: '2026-11-11T10:00:00.000Z',
      completedAt: '2026-11-18T10:00:00.000Z',
      completionNote: 'RFC reviewed and shared with technical directors.',
    },
  ];
};


export const SAMPLE_TASKS = generateSampleTasks();
