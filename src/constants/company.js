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
  timeZone: 'America/Chicago',
  workStartTime: '09:00', // Standard workday start in Chicago time
  lateGraceMinutes: 15,   // Late after 09:15 AM
};

export const USER_ROLES = {
  HR_ADMIN: 'HR Administrator',
  EMPLOYEE: 'Employee',
};

// All 6 Visartech Employees
export const VISARTECH_EMPLOYEES = [
  {
    id: 'emp-101',
    name: 'Alex Turner',
    email: 'alex.turner@visartech.com',
    role: USER_ROLES.EMPLOYEE,
    department: 'Digital Solutions Lab',
    title: 'Senior Software Engineer',
    avatarColor: '#1E40AF',
    joinDate: '2023-03-15',
  },
  {
    id: 'emp-102',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@visartech.com',
    role: USER_ROLES.EMPLOYEE,
    department: 'Product Design',
    title: 'UI/UX Product Designer',
    avatarColor: '#7C3AED',
    joinDate: '2023-06-01',
  },
  {
    id: 'emp-103',
    name: 'Michael Chen',
    email: 'michael.chen@visartech.com',
    role: USER_ROLES.EMPLOYEE,
    department: 'Infrastructure',
    title: 'Cloud & DevOps Specialist',
    avatarColor: '#059669',
    joinDate: '2022-11-10',
  },
  {
    id: 'emp-104',
    name: 'Priya Sharma',
    email: 'priya.sharma@visartech.com',
    role: USER_ROLES.EMPLOYEE,
    department: 'Digital Solutions Lab',
    title: 'Full Stack Engineer',
    avatarColor: '#D97706',
    joinDate: '2024-01-20',
  },
  {
    id: 'emp-105',
    name: 'David Miller',
    email: 'david.miller@visartech.com',
    role: USER_ROLES.EMPLOYEE,
    department: 'Quality Assurance',
    title: 'QA Automation Engineer',
    avatarColor: '#DC2626',
    joinDate: '2023-08-14',
  },
  {
    id: 'emp-106',
    name: 'Olivia Taylor',
    email: 'olivia.taylor@visartech.com',
    role: USER_ROLES.EMPLOYEE,
    department: 'Client Tech Advisory',
    title: 'Solutions Architect',
    avatarColor: '#0284C7',
    joinDate: '2022-04-18',
  },
];

// HR Administrator Profile
export const VISARTECH_HR_ADMIN = {
  id: 'hr-001',
  name: 'Elena Rostova',
  email: 'elena.rostova@visartech.com',
  role: USER_ROLES.HR_ADMIN,
  department: 'People & Operations',
  title: 'Lead HR Manager',
  avatarColor: '#7C3AED',
  joinDate: '2021-09-01',
};

// Planned WorkSphere Modules (for modular scalability)
export const HR_MODULES = [
  {
    id: 'attendance',
    title: 'Attendance Management',
    description: 'Daily check-in / check-out in Chicago time, working hours, and real-time statistics',
    icon: 'time-outline',
    status: 'Active',
    roles: [USER_ROLES.HR_ADMIN, USER_ROLES.EMPLOYEE],
  },
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
    id: 'leave',
    title: 'Leave Applications',
    description: 'Request time off, approval workflows, and leave balance summary for 6 employees',
    icon: 'calendar-outline',
    status: 'Active',
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
