require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Employee = require('./models/Employee');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');
const Task = require('./models/Task');
const Payroll = require('./models/Payroll');

const SEED_EMPLOYEES = [
  {
    employeeId: 'admin-001',
    name: 'Elena Rostova',
    email: 'elena.rostova@visartech.com',
    role: 'hr_admin',
    department: 'People Operations',
    designation: 'HR Administrator',
    phone: '+1 (312) 555-0100',
    joiningDate: '2022-01-10',
    status: 'Active',
    avatar: 'ER',
    location: 'Chicago, IL (Visartech HQ)',
    salary: {
      basicSalary: 8500,
      allowances: 2200,
      hra: 1500,
      deductions: 900,
      netSalary: 11300,
    },
  },
  {
    employeeId: 'emp-101',
    name: 'Alex Turner',
    email: 'alex.turner@visartech.com',
    role: 'employee',
    department: 'Digital Solutions Lab',
    designation: 'Senior Solutions Architect',
    phone: '+1 (312) 555-0101',
    joiningDate: '2023-03-15',
    status: 'Active',
    avatar: 'AT',
    location: 'Chicago, IL (Visartech HQ)',
    salary: {
      basicSalary: 7200,
      allowances: 1800,
      hra: 1200,
      deductions: 700,
      netSalary: 9500,
    },
  },
  {
    employeeId: 'emp-102',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@visartech.com',
    role: 'employee',
    department: 'Product Design',
    designation: 'UI/UX Product Designer',
    phone: '+1 (312) 555-0102',
    joiningDate: '2023-06-01',
    status: 'Active',
    avatar: 'SJ',
    location: 'Chicago, IL (Visartech HQ)',
    salary: {
      basicSalary: 6500,
      allowances: 1500,
      hra: 1000,
      deductions: 650,
      netSalary: 8350,
    },
  },
  {
    employeeId: 'emp-103',
    name: 'Michael Chen',
    email: 'michael.chen@visartech.com',
    role: 'employee',
    department: 'Infrastructure',
    designation: 'Cloud & DevOps Specialist',
    phone: '+1 (312) 555-0103',
    joiningDate: '2022-11-10',
    status: 'Active',
    avatar: 'MC',
    location: 'Chicago, IL (Visartech HQ)',
    salary: {
      basicSalary: 7000,
      allowances: 1650,
      hra: 1100,
      deductions: 700,
      netSalary: 9050,
    },
  },
  {
    employeeId: 'emp-104',
    name: 'Priya Sharma',
    email: 'priya.sharma@visartech.com',
    role: 'employee',
    department: 'Digital Solutions Lab',
    designation: 'Full Stack Engineer',
    phone: '+1 (312) 555-0104',
    joiningDate: '2024-01-20',
    status: 'Active',
    avatar: 'PS',
    location: 'Chicago, IL (Visartech HQ)',
    salary: {
      basicSalary: 6200,
      allowances: 1400,
      hra: 950,
      deductions: 600,
      netSalary: 7950,
    },
  },
  {
    employeeId: 'emp-105',
    name: 'David Miller',
    email: 'david.miller@visartech.com',
    role: 'employee',
    department: 'Quality Assurance',
    designation: 'QA Automation Lead',
    phone: '+1 (312) 555-0105',
    joiningDate: '2023-09-01',
    status: 'Active',
    avatar: 'DM',
    location: 'Chicago, IL (Visartech HQ)',
    salary: {
      basicSalary: 5800,
      allowances: 1300,
      hra: 900,
      deductions: 550,
      netSalary: 7450,
    },
  },
  {
    employeeId: 'emp-106',
    name: 'Olivia Taylor',
    email: 'olivia.taylor@visartech.com',
    role: 'employee',
    department: 'Client Tech Advisory',
    designation: 'Technical Project Consultant',
    phone: '+1 (312) 555-0106',
    joiningDate: '2022-08-15',
    status: 'Active',
    avatar: 'OT',
    location: 'Chicago, IL (Visartech HQ)',
    salary: {
      basicSalary: 8000,
      allowances: 2100,
      hra: 1400,
      deductions: 850,
      netSalary: 10650,
    },
  },
];

const SEED_ATTENDANCE = [
  // Today's attendance
  { employeeId: 'emp-101', date: '2026-03-18', checkIn: '08:55 AM', checkOut: '05:30 PM', status: 'Present', workingHours: '8.58 hrs', timezone: 'America/Chicago' },
  { employeeId: 'emp-102', date: '2026-03-18', checkIn: '09:05 AM', checkOut: '05:35 PM', status: 'Present', workingHours: '8.50 hrs', timezone: 'America/Chicago' },
  { employeeId: 'emp-103', date: '2026-03-18', checkIn: '09:30 AM', checkOut: '05:30 PM', status: 'Late', workingHours: '8.00 hrs', timezone: 'America/Chicago' },
  { employeeId: 'emp-104', date: '2026-03-18', checkIn: '08:50 AM', checkOut: '05:20 PM', status: 'Present', workingHours: '8.50 hrs', timezone: 'America/Chicago' },
  { employeeId: 'emp-105', date: '2026-03-18', checkIn: null, checkOut: null, status: 'Absent', workingHours: '0.00 hrs', timezone: 'America/Chicago' },
  { employeeId: 'emp-106', date: '2026-03-18', checkIn: '08:45 AM', checkOut: '05:15 PM', status: 'Present', workingHours: '8.50 hrs', timezone: 'America/Chicago' },

  // Yesterday's attendance
  { employeeId: 'emp-101', date: '2026-03-17', checkIn: '08:52 AM', checkOut: '05:30 PM', status: 'Present', workingHours: '8.63 hrs', timezone: 'America/Chicago' },
  { employeeId: 'emp-102', date: '2026-03-17', checkIn: '08:58 AM', checkOut: '05:30 PM', status: 'Present', workingHours: '8.53 hrs', timezone: 'America/Chicago' },
  { employeeId: 'emp-103', date: '2026-03-17', checkIn: '08:45 AM', checkOut: '05:15 PM', status: 'Present', workingHours: '8.50 hrs', timezone: 'America/Chicago' },
  { employeeId: 'emp-104', date: '2026-03-17', checkIn: '09:20 AM', checkOut: '05:30 PM', status: 'Late', workingHours: '8.17 hrs', timezone: 'America/Chicago' },
  { employeeId: 'emp-105', date: '2026-03-17', checkIn: '08:50 AM', checkOut: '05:20 PM', status: 'Present', workingHours: '8.50 hrs', timezone: 'America/Chicago' },
  { employeeId: 'emp-106', date: '2026-03-17', checkIn: '08:55 AM', checkOut: '05:30 PM', status: 'Present', workingHours: '8.58 hrs', timezone: 'America/Chicago' },
];

const SEED_LEAVES = [
  {
    id: 'lv-001',
    employeeId: 'emp-101',
    employeeName: 'Alex Turner',
    leaveType: 'Annual Leave',
    startDate: '2026-04-10',
    endDate: '2026-04-14',
    days: 5,
    reason: 'Family vacation trip',
    status: 'Approved',
    appliedOn: '2026-03-10',
    reviewNote: 'Approved. Project deliverables are covered.',
    reviewedAt: '2026-03-11',
    reviewedBy: 'Elena Rostova',
  },
  {
    id: 'lv-002',
    employeeId: 'emp-102',
    employeeName: 'Sarah Jenkins',
    leaveType: 'Sick Leave',
    startDate: '2026-03-05',
    endDate: '2026-03-06',
    days: 2,
    reason: 'Seasonal viral fever',
    status: 'Approved',
    appliedOn: '2026-03-04',
    reviewNote: 'Approved. Get well soon.',
    reviewedAt: '2026-03-04',
    reviewedBy: 'Elena Rostova',
  },
  {
    id: 'lv-003',
    employeeId: 'emp-103',
    employeeName: 'Michael Chen',
    leaveType: 'Casual Leave',
    startDate: '2026-03-25',
    endDate: '2026-03-26',
    days: 2,
    reason: 'Personal family matter',
    status: 'Pending',
    appliedOn: '2026-03-16',
    reviewNote: '',
  },
  {
    id: 'lv-004',
    employeeId: 'emp-105',
    employeeName: 'David Miller',
    leaveType: 'Sick Leave',
    startDate: '2026-03-18',
    endDate: '2026-03-18',
    days: 1,
    reason: 'Medical consultation appointment',
    status: 'Approved',
    appliedOn: '2026-03-17',
    reviewNote: 'Approved.',
    reviewedAt: '2026-03-17',
    reviewedBy: 'Elena Rostova',
  },
];

const SEED_TASKS = [
  {
    id: 'tsk-001',
    title: 'Architect Cloud API Gateway for Visartech Client Suite',
    description: 'Design and deploy scalable zero-trust API gateway routing across microservices.',
    assignedTo: 'emp-101',
    assignedByName: 'Elena Rostova (HR Admin)',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2026-03-28',
    category: 'Architecture',
    performanceRating: 5,
    feedback: 'Excellent system architecture draft submitted.',
  },
  {
    id: 'tsk-002',
    title: 'Mobile Design System & Dark Mode Audit',
    description: 'Refine typography tokens, component states, and accessibility contrast.',
    assignedTo: 'emp-102',
    assignedByName: 'Elena Rostova (HR Admin)',
    priority: 'Medium',
    status: 'Completed',
    dueDate: '2026-03-15',
    completedDate: '2026-03-14',
    category: 'UI/UX Design',
    performanceRating: 5,
    feedback: 'Clean visual polish and adherence to brand tokens.',
  },
  {
    id: 'tsk-003',
    title: 'Kubernetes Cluster Auto-scaling & CI/CD Pipeline',
    description: 'Implement automated canary deployments and Grafana performance monitors.',
    assignedTo: 'emp-103',
    assignedByName: 'Elena Rostova (HR Admin)',
    priority: 'Critical',
    status: 'In Progress',
    dueDate: '2026-03-31',
    category: 'Infrastructure',
    performanceRating: 4,
    feedback: 'On track, testing staging clusters.',
  },
  {
    id: 'tsk-004',
    title: 'Automated E2E Test Suite for Mobile App',
    description: 'Write Jest and Maestro integration tests for attendance and payroll modules.',
    assignedTo: 'emp-105',
    assignedByName: 'Elena Rostova (HR Admin)',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2026-04-05',
    category: 'QA Automation',
    performanceRating: 4,
  },
];

const SEED_PAYROLL = [
  // March 2026 Payroll
  {
    id: 'pay-101-2026-03',
    employeeId: 'emp-101',
    employeeName: 'Alex Turner',
    designation: 'Senior Solutions Architect',
    department: 'Digital Solutions Lab',
    month: '2026-03',
    year: 2026,
    basicSalary: 7200,
    allowances: 1800,
    hra: 1200,
    deductions: 700,
    tax: 450,
    netSalary: 9500,
    status: 'Paid',
    paymentDate: '2026-03-01',
    paymentMethod: 'Direct Deposit',
  },
  {
    id: 'pay-102-2026-03',
    employeeId: 'emp-102',
    employeeName: 'Sarah Jenkins',
    designation: 'UI/UX Product Designer',
    department: 'Product Design',
    month: '2026-03',
    year: 2026,
    basicSalary: 6500,
    allowances: 1500,
    hra: 1000,
    deductions: 650,
    tax: 380,
    netSalary: 8350,
    status: 'Paid',
    paymentDate: '2026-03-01',
    paymentMethod: 'Direct Deposit',
  },
  {
    id: 'pay-103-2026-03',
    employeeId: 'emp-103',
    employeeName: 'Michael Chen',
    designation: 'Cloud & DevOps Specialist',
    department: 'Infrastructure',
    month: '2026-03',
    year: 2026,
    basicSalary: 7000,
    allowances: 1650,
    hra: 1100,
    deductions: 700,
    tax: 420,
    netSalary: 9050,
    status: 'Paid',
    paymentDate: '2026-03-01',
    paymentMethod: 'Direct Deposit',
  },
  {
    id: 'pay-104-2026-03',
    employeeId: 'emp-104',
    employeeName: 'Priya Sharma',
    designation: 'Full Stack Engineer',
    department: 'Digital Solutions Lab',
    month: '2026-03',
    year: 2026,
    basicSalary: 6200,
    allowances: 1400,
    hra: 950,
    deductions: 600,
    tax: 350,
    netSalary: 7950,
    status: 'Pending',
    paymentDate: null,
    paymentMethod: 'Direct Deposit',
  },
  {
    id: 'pay-105-2026-03',
    employeeId: 'emp-105',
    employeeName: 'David Miller',
    designation: 'QA Automation Lead',
    department: 'Quality Assurance',
    month: '2026-03',
    year: 2026,
    basicSalary: 5800,
    allowances: 1300,
    hra: 900,
    deductions: 550,
    tax: 310,
    netSalary: 7450,
    status: 'Pending',
    paymentDate: null,
    paymentMethod: 'Direct Deposit',
  },
  {
    id: 'pay-106-2026-03',
    employeeId: 'emp-106',
    employeeName: 'Olivia Taylor',
    designation: 'Technical Project Consultant',
    department: 'Client Tech Advisory',
    month: '2026-03',
    year: 2026,
    basicSalary: 8000,
    allowances: 2100,
    hra: 1400,
    deductions: 850,
    tax: 520,
    netSalary: 10650,
    status: 'Pending',
    paymentDate: null,
    paymentMethod: 'Direct Deposit',
  },
];

async function seedDatabase() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB Atlas: ${conn.connection.name}`);

    // Seed Employees
    const empCount = await Employee.countDocuments();
    if (empCount === 0) {
      console.log('Seeding employees...');
      const defaultPasswordHash = await bcrypt.hash('visartech2026', 10);
      const employeesToInsert = SEED_EMPLOYEES.map(e => ({
        ...e,
        password: defaultPasswordHash,
      }));
      await Employee.insertMany(employeesToInsert);
      console.log(`Successfully seeded ${employeesToInsert.length} employees (Elena Rostova + 6 team members)!`);
    } else {
      console.log(`Employees collection already has ${empCount} documents.`);
    }

    // Seed Attendance
    const attCount = await Attendance.countDocuments();
    if (attCount === 0) {
      console.log('Seeding attendance...');
      await Attendance.insertMany(SEED_ATTENDANCE);
      console.log(`Successfully seeded ${SEED_ATTENDANCE.length} attendance records!`);
    } else {
      console.log(`Attendance collection already has ${attCount} documents.`);
    }

    // Seed Leaves
    const leaveCount = await Leave.countDocuments();
    if (leaveCount === 0) {
      console.log('Seeding leaves...');
      await Leave.insertMany(SEED_LEAVES);
      console.log(`Successfully seeded ${SEED_LEAVES.length} leave records!`);
    } else {
      console.log(`Leave collection already has ${leaveCount} documents.`);
    }

    // Seed Tasks
    const taskCount = await Task.countDocuments();
    if (taskCount === 0) {
      console.log('Seeding tasks...');
      await Task.insertMany(SEED_TASKS);
      console.log(`Successfully seeded ${SEED_TASKS.length} tasks!`);
    } else {
      console.log(`Task collection already has ${taskCount} documents.`);
    }

    // Seed Payroll
    const payCount = await Payroll.countDocuments();
    if (payCount === 0) {
      console.log('Seeding payroll...');
      await Payroll.insertMany(SEED_PAYROLL);
      console.log(`Successfully seeded ${SEED_PAYROLL.length} payroll records!`);
    } else {
      console.log(`Payroll collection already has ${payCount} documents.`);
    }

    console.log('🎉 MongoDB Atlas Seeding Completed Successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
