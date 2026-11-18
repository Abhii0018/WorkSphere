/**
 * WorkSphere - Company & Application Metadata
 * Visartech HR Management System
 */

export const COMPANY_INFO = {
  name: 'Visartech',
  industry: 'Technology and Digital Solutions',
  totalEmployees: 6,
  totalHrAdmins: 1,
  tagline: 'Smart HR & Workplace Operations',
};

export const USER_ROLES = {
  HR_ADMIN: 'HR Administrator',
  EMPLOYEE: 'Employee',
};

// Planned WorkSphere Modules (for modular scalability)
export const HR_MODULES = [
  {
    id: 'auth',
    title: 'Authentication & RBAC',
    description: 'Role-based access control, secure JWT login, and profile management',
    icon: 'shield-checkmark-outline',
    status: 'In Setup',
    roles: [USER_ROLES.HR_ADMIN, USER_ROLES.EMPLOYEE],
  },
  {
    id: 'employees',
    title: 'Employee Directory',
    description: 'Team member profiles, contact info, department tracking for 6 members',
    icon: 'people-outline',
    status: 'Planned',
    roles: [USER_ROLES.HR_ADMIN, USER_ROLES.EMPLOYEE],
  },
  {
    id: 'attendance',
    title: 'Attendance Management',
    description: 'Daily check-in / check-out, working hours, and real-time status tracking',
    icon: 'time-outline',
    status: 'Planned',
    roles: [USER_ROLES.HR_ADMIN, USER_ROLES.EMPLOYEE],
  },
  {
    id: 'leave',
    title: 'Leave Applications',
    description: 'Request time off, approval workflows, and leave balance summary',
    icon: 'calendar-outline',
    status: 'Planned',
    roles: [USER_ROLES.HR_ADMIN, USER_ROLES.EMPLOYEE],
  },
  {
    id: 'tasks',
    title: 'Performance & Tasks',
    description: 'Sprint tasks, milestones, deliverables, and performance reviews',
    icon: 'clipboard-outline',
    status: 'Planned',
    roles: [USER_ROLES.HR_ADMIN, USER_ROLES.EMPLOYEE],
  },
  {
    id: 'payroll',
    title: 'Payroll & Salaries',
    description: 'Salary breakdown, monthly pay slips, bonuses, and tax deductions',
    icon: 'wallet-outline',
    status: 'Planned',
    roles: [USER_ROLES.HR_ADMIN, USER_ROLES.EMPLOYEE],
  },
  {
    id: 'announcements',
    title: 'Announcements',
    description: 'Company-wide updates, events, and important push notifications',
    icon: 'megaphone-outline',
    status: 'Planned',
    roles: [USER_ROLES.HR_ADMIN, USER_ROLES.EMPLOYEE],
  },
  {
    id: 'feedback',
    title: 'Employee Feedback',
    description: 'Anonymous suggestions, quarterly satisfaction pulses, and HR queries',
    icon: 'chatbubbles-outline',
    status: 'Planned',
    roles: [USER_ROLES.HR_ADMIN, USER_ROLES.EMPLOYEE],
  },
];
