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

// All 6 Visartech Employees (Centralized Roster)
export const VISARTECH_EMPLOYEES = [
  {
    id: 'emp-101',
    name: 'Alex Turner',
    email: 'alex.turner@visartech.com',
    phone: '+1 (312) 555-0101',
    role: USER_ROLES.EMPLOYEE,
    department: 'Digital Solutions Lab',
    title: 'Senior Software Engineer',
    avatarColor: '#1E40AF',
    joinDate: '2023-03-15',
    status: 'Active',
    salary: {
      basic: 7200,
      allowances: 800,
      bonuses: 500,
      deductions: 600,
    },
  },
  {
    id: 'emp-102',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@visartech.com',
    phone: '+1 (312) 555-0102',
    role: USER_ROLES.EMPLOYEE,
    department: 'Product Design',
    title: 'UI/UX Product Designer',
    avatarColor: '#7C3AED',
    joinDate: '2023-06-01',
    status: 'Active',
    salary: {
      basic: 6500,
      allowances: 700,
      bonuses: 400,
      deductions: 550,
    },
  },
  {
    id: 'emp-103',
    name: 'Michael Chen',
    email: 'michael.chen@visartech.com',
    phone: '+1 (312) 555-0103',
    role: USER_ROLES.EMPLOYEE,
    department: 'Infrastructure',
    title: 'Cloud & DevOps Specialist',
    avatarColor: '#059669',
    joinDate: '2022-11-10',
    status: 'Active',
    salary: {
      basic: 7000,
      allowances: 750,
      bonuses: 450,
      deductions: 600,
    },
  },
  {
    id: 'emp-104',
    name: 'Priya Sharma',
    email: 'priya.sharma@visartech.com',
    phone: '+1 (312) 555-0104',
    role: USER_ROLES.EMPLOYEE,
    department: 'Digital Solutions Lab',
    title: 'Full Stack Engineer',
    avatarColor: '#D97706',
    joinDate: '2024-01-20',
    status: 'Active',
    salary: {
      basic: 6200,
      allowances: 650,
      bonuses: 350,
      deductions: 500,
    },
  },
  {
    id: 'emp-105',
    name: 'David Miller',
    email: 'david.miller@visartech.com',
    phone: '+1 (312) 555-0105',
    role: USER_ROLES.EMPLOYEE,
    department: 'Quality Assurance',
    title: 'QA Automation Engineer',
    avatarColor: '#DC2626',
    joinDate: '2023-08-14',
    status: 'Active',
    salary: {
      basic: 5800,
      allowances: 600,
      bonuses: 300,
      deductions: 480,
    },
  },
  {
    id: 'emp-106',
    name: 'Olivia Taylor',
    email: 'olivia.taylor@visartech.com',
    phone: '+1 (312) 555-0106',
    role: USER_ROLES.EMPLOYEE,
    department: 'Client Tech Advisory',
    title: 'Solutions Architect',
    avatarColor: '#0284C7',
    joinDate: '2022-04-18',
    status: 'Active',
    salary: {
      basic: 8000,
      allowances: 900,
      bonuses: 600,
      deductions: 700,
    },
  },
];

// HR Administrator Profile
export const VISARTECH_HR_ADMIN = {
  id: 'hr-001',
  name: 'Elena Rostova',
  email: 'elena.rostova@visartech.com',
  phone: '+1 (312) 555-0100',
  role: USER_ROLES.HR_ADMIN,
  department: 'People & Operations',
  title: 'Lead HR Manager',
  avatarColor: '#7C3AED',
  joinDate: '2021-09-01',
  status: 'Active',
};

// WorkSphere Modules Status
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
    id: 'leave',
    title: 'Leave Applications',
    description: 'Request time off, approval workflows, and leave balance summary for 6 employees',
    icon: 'calendar-outline',
    status: 'Active',
    roles: [USER_ROLES.HR_ADMIN, USER_ROLES.EMPLOYEE],
  },
  {
    id: 'employees',
    title: 'Employee Directory',
    description: 'Team member profiles, contact info, department tracking, and staff management',
    icon: 'people-outline',
    status: 'Active',
    roles: [USER_ROLES.HR_ADMIN, USER_ROLES.EMPLOYEE],
  },
  {
    id: 'tasks',
    title: 'Performance & Tasks',
    description: 'Task assignment, milestone deliverables, priority tracking, and completion rates',
    icon: 'clipboard-outline',
    status: 'Active',
    roles: [USER_ROLES.HR_ADMIN, USER_ROLES.EMPLOYEE],
  },
  {
    id: 'payroll',
    title: 'Payroll & Salaries',
    description: 'Salary breakdown, monthly payroll generation, pay slips, and expenditure reports',
    icon: 'wallet-outline',
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
