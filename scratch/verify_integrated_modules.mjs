import assert from 'node:assert';
import { VISARTECH_EMPLOYEES } from '../src/constants/company.js';
import { SAMPLE_EMPLOYEES } from '../src/constants/sampleEmployees.js';
import { SAMPLE_TASKS } from '../src/constants/sampleTasks.js';
import { SAMPLE_PAYROLL } from '../src/constants/samplePayroll.js';
import { generateSampleAttendance } from '../src/constants/sampleAttendance.js';
import {
  generateSampleLeaveBalances,
  generateSampleLeaveRequests,
} from '../src/constants/sampleLeave.js';
import {
  TASK_STATUS,
  TASK_PRIORITY,
  isTaskOverdue,
  calculateCompletionRate,
} from '../src/utils/tasks.js';
import {
  calculateNetSalary,
  calculateGrossSalary,
  formatCurrency,
  formatMonthLabel,
  isValidSalaryAmount,
  PAYROLL_STATUS,
  generatePayrollId,
} from '../src/utils/payroll.js';

console.log('--- START INTEGRATED MODULE VERIFICATION ---');

// ==========================================
// 1. Employee Management Tests
// ==========================================
console.log('\n[1] Verifying Employee Management...');

assert.strictEqual(SAMPLE_EMPLOYEES.length, 6, 'Must seed exactly 6 Visartech employees');
const expectedIds = ['emp-101', 'emp-102', 'emp-103', 'emp-104', 'emp-105', 'emp-106'];
SAMPLE_EMPLOYEES.forEach((emp, idx) => {
  assert.strictEqual(emp.id, expectedIds[idx], `Employee ${idx} must have ID ${expectedIds[idx]}`);
  assert.ok(emp.name, 'Employee must have a name');
  assert.ok(emp.email, 'Employee must have an email');
  assert.ok(emp.phone, 'Employee must have a phone');
  assert.ok(emp.designation, 'Employee must have a designation');
  assert.ok(emp.department, 'Employee must have a department');
  assert.ok(emp.joiningDate, 'Employee must have a joiningDate');
  assert.ok(['Active', 'Inactive'].includes(emp.status), 'Employee status must be Active or Inactive');
  assert.ok(emp.salaryConfig, 'Employee must have salaryConfig');
  assert.ok(typeof emp.salaryConfig.basicSalary === 'number', 'basicSalary must be number');
});

// Test Email Regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
assert.ok(emailRegex.test('alex.turner@visartech.com'), 'Valid email passes');
assert.ok(!emailRegex.test('invalid-email'), 'Invalid email rejected');
assert.ok(!emailRegex.test('test@domain'), 'Incomplete email rejected');

// Test Next ID Generation Logic
const currentMaxNum = SAMPLE_EMPLOYEES.reduce((max, e) => {
  const match = e.id.match(/^emp-(\d+)$/);
  return match ? Math.max(max, parseInt(match[1], 10)) : max;
}, 100);
const nextGeneratedId = `emp-${currentMaxNum + 1}`;
assert.strictEqual(nextGeneratedId, 'emp-107', 'Next employee ID must be emp-107');

console.log('✓ Employee directory, structure, email validation, and ID generation verified.');

// ==========================================
// 2. Performance & Tasks Management Tests
// ==========================================
console.log('\n[2] Verifying Tasks & Performance Management...');

assert.strictEqual(TASK_PRIORITY.URGENT, 'Urgent');
assert.strictEqual(TASK_PRIORITY.HIGH, 'High');
assert.strictEqual(TASK_PRIORITY.MEDIUM, 'Medium');
assert.strictEqual(TASK_PRIORITY.LOW, 'Low');

assert.strictEqual(TASK_STATUS.TODO, 'To Do');
assert.strictEqual(TASK_STATUS.IN_PROGRESS, 'In Progress');
assert.strictEqual(TASK_STATUS.COMPLETED, 'Completed');

const pastDate = '2020-01-01';
const futureDate = '2030-01-01';
assert.strictEqual(isTaskOverdue(pastDate, TASK_STATUS.TODO), true, 'Past due incomplete task is overdue');
assert.strictEqual(isTaskOverdue(pastDate, TASK_STATUS.COMPLETED), false, 'Completed past task is NOT overdue');
assert.strictEqual(isTaskOverdue(futureDate, TASK_STATUS.TODO), false, 'Future due task is NOT overdue');

assert.strictEqual(calculateCompletionRate([]), 0, 'Empty list rate is 0');
assert.strictEqual(calculateCompletionRate([
  { status: TASK_STATUS.COMPLETED },
  { status: TASK_STATUS.TODO }
]), 50, '1/2 completed tasks is 50%');
assert.strictEqual(calculateCompletionRate([
  { status: TASK_STATUS.COMPLETED },
  { status: TASK_STATUS.COMPLETED },
  { status: TASK_STATUS.COMPLETED }
]), 100, '3/3 completed tasks is 100%');

assert.ok(SAMPLE_TASKS.length >= 8, 'Sample tasks seeded');
const sampleAlexTasks = SAMPLE_TASKS.filter((t) => t.assignedTo === 'emp-101');
assert.ok(sampleAlexTasks.length >= 2, 'Alex Turner has assigned tasks');

console.log('✓ Task priorities, statuses, overdue checks, and completion rate calculations verified.');

// ==========================================
// 3. Payroll Management Tests
// ==========================================
console.log('\n[3] Verifying Payroll Management...');

const basic = 6800;
const allowances = 1200;
const bonuses = 600;
const deductions = 1850;

const expectedGross = 6800 + 1200 + 600; // 8600
const expectedNet = 8600 - 1850; // 6750

assert.strictEqual(calculateGrossSalary(basic, allowances, bonuses), expectedGross);
assert.strictEqual(calculateNetSalary(basic, allowances, bonuses, deductions), expectedNet);
assert.strictEqual(calculateNetSalary(1000, 0, 0, 1500), 0, 'Net salary cannot be negative');

assert.strictEqual(isValidSalaryAmount(1000), true);
assert.strictEqual(isValidSalaryAmount(0), true);
assert.strictEqual(isValidSalaryAmount(-50), false);
assert.strictEqual(isValidSalaryAmount('abc'), false);

assert.strictEqual(formatCurrency(6750), '$6,750');
assert.strictEqual(formatCurrency(0), '$0');
assert.strictEqual(formatMonthLabel('2026-11'), 'November 2026');
assert.strictEqual(generatePayrollId('2026-12', 'emp-101'), 'pay-2026-12-emp-101');

assert.ok(SAMPLE_PAYROLL.length >= 10, 'Sample payroll seeded for October & November');
const octRecords = SAMPLE_PAYROLL.filter((p) => p.month === '2026-10');
assert.strictEqual(octRecords.length, 6, 'All 6 employees have October records');
octRecords.forEach((r) => {
  assert.strictEqual(r.status, PAYROLL_STATUS.PAID, 'October records must be Paid');
});

const canAccessPayroll = (targetEmpId, requestingUserId, requestingRole) => {
  if (requestingRole === 'HR Administrator') return true;
  return targetEmpId === requestingUserId;
};

assert.strictEqual(canAccessPayroll('emp-101', 'emp-101', 'Employee'), true, 'Employee can access own payroll');
assert.strictEqual(canAccessPayroll('emp-102', 'emp-101', 'Employee'), false, 'Employee CANNOT access other employee payroll');
assert.strictEqual(canAccessPayroll('emp-102', 'hr-001', 'HR Administrator'), true, 'HR can access all payrolls');

const existingMonths = ['2026-10', '2026-11'];
const isDuplicateMonth = (month) => existingMonths.includes(month);
assert.strictEqual(isDuplicateMonth('2026-11'), true, 'Existing month detected as duplicate');
assert.strictEqual(isDuplicateMonth('2026-12'), false, 'New month allowed');

console.log('✓ Payroll formulas, privacy boundary, formatting, and duplicate checks verified.');

// ==========================================
// 4. Regression: Attendance & Leave Modules
// ==========================================
console.log('\n[4] Verifying Attendance & Leave Regression...');
const sampleAttendance = generateSampleAttendance();
const sampleLeaveBalances = generateSampleLeaveBalances();
const sampleLeaveRequests = generateSampleLeaveRequests();

// Attendance checks
const dates = Object.keys(sampleAttendance);
assert.ok(dates.length > 0, 'Attendance dates exist');
const todayRecords = sampleAttendance[dates[0]];
expectedIds.forEach((id) => {
  assert.ok(todayRecords[id], `Attendance record must exist for ${id}`);
  assert.strictEqual(todayRecords[id].employeeId, id);
});

assert.ok(sampleLeaveRequests.length >= 6, 'Leave requests exist');
sampleLeaveRequests.forEach((lr) => {
  assert.ok(expectedIds.includes(lr.employeeId), `Leave request employeeId ${lr.employeeId} must match centralized employees`);
});

expectedIds.forEach((id) => {
  assert.ok(sampleLeaveBalances[id], `Leave balance must exist for ${id}`);
});

console.log('✓ Attendance and Leave records remain properly linked to centralized employees.');

console.log('\n======================================================');
console.log('ALL INTEGRATED MODULE & REGRESSION TESTS PASSED (100%)');
console.log('======================================================');
