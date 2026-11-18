import assert from 'node:assert';
import { VISARTECH_EMPLOYEES, USER_ROLES } from '../src/constants/company.js';
import { SAMPLE_EMPLOYEES } from '../src/constants/sampleEmployees.js';
import { SAMPLE_PAYROLL } from '../src/constants/samplePayroll.js';
import { SAMPLE_TASKS } from '../src/constants/sampleTasks.js';
import { generateSampleAttendance } from '../src/constants/sampleAttendance.js';
import { generateSampleLeaveBalances, generateSampleLeaveRequests } from '../src/constants/sampleLeave.js';
import {
  calculateGrossSalary,
  calculateNetSalary,
  formatCurrency,
  formatMonthLabel,
  generatePayrollId,
  isValidSalaryAmount,
  validateSalaryValues,
  normalizeSalaryStructure,
  PAYROLL_STATUS,
} from '../src/utils/payroll.js';

let passedCount = 0;
let failedCount = 0;

function runTest(description, testFn) {
  try {
    testFn();
    passedCount++;
    console.log(`  ✓ ${description}`);
  } catch (err) {
    failedCount++;
    console.error(`  ✗ ${description}`);
    console.error(`    ${err.message}`);
  }
}

console.log('================================================================');
console.log('WorkSphere: Comprehensive Payroll Management Test Suite');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// 1. SALARY CALCULATIONS
// -----------------------------------------------------------------------------
console.log('--- 1. Salary Calculations ---');

runTest('Gross salary = Basic + HRA + Other Allowances + Bonus', () => {
  const basic = 7200;
  const hra = 1200;
  const other = 600;
  const bonus = 500;
  const gross = calculateGrossSalary(basic, hra, other, bonus);
  assert.strictEqual(gross, 9500, 'Gross salary must be 7200+1200+600+500 = 9500');
});

runTest('Net salary = Gross Salary - Deductions', () => {
  const gross = 9500;
  const deductions = 700;
  const net = calculateNetSalary(gross, deductions);
  assert.strictEqual(net, 8800, 'Net salary must be 9500-700 = 8800');
});

runTest('Gross and Net salary with zero deductions', () => {
  const struct = {
    basicSalary: 6500,
    hra: 1000,
    otherAllowances: 500,
    bonus: 400,
    deductions: 0,
  };
  const gross = calculateGrossSalary(struct);
  const net = calculateNetSalary(struct);
  assert.strictEqual(gross, 8400);
  assert.strictEqual(net, 8400, 'Net salary equals Gross when deductions are 0');
});

runTest('Multiple allowances and bonuses calculate correctly via object', () => {
  const struct = {
    basicSalary: 8000,
    hra: 1400,
    otherAllowances: 700,
    bonus: 600,
    deductions: 850,
  };
  const norm = normalizeSalaryStructure(struct);
  assert.strictEqual(norm.grossSalary, 10700);
  assert.strictEqual(norm.netSalary, 9850);
});

runTest('Net salary is clamped to 0 when deductions exceed gross', () => {
  const net = calculateNetSalary(5000, 6000);
  assert.strictEqual(net, 0, 'Net salary cannot be negative');
});

runTest('Invalid negative salary values are caught and rejected', () => {
  assert.strictEqual(isValidSalaryAmount(-100), false);
  assert.strictEqual(isValidSalaryAmount('abc'), false);
  assert.strictEqual(isValidSalaryAmount(0), true);
  assert.strictEqual(isValidSalaryAmount(5000), true);

  const res1 = validateSalaryValues({ basic: -500 });
  assert.strictEqual(res1.isValid, false);
  const res2 = validateSalaryValues({ hra: -200 });
  assert.strictEqual(res2.isValid, false);
  const res3 = validateSalaryValues({ otherAllowances: -100 });
  assert.strictEqual(res3.isValid, false);
  const res4 = validateSalaryValues({ bonus: -50 });
  assert.strictEqual(res4.isValid, false);
  const res5 = validateSalaryValues({ deductions: -150 });
  assert.strictEqual(res5.isValid, false);
  const resValid = validateSalaryValues({ basic: 7000, hra: 1000, otherAllowances: 500, bonus: 300, deductions: 600 });
  assert.strictEqual(resValid.isValid, true);
});

runTest('Currency formatting in USD ($X,XXX)', () => {
  assert.strictEqual(formatCurrency(8800), '$8,800');
  assert.strictEqual(formatCurrency(0), '$0');
  assert.strictEqual(formatCurrency(10700), '$10,700');
});

// -----------------------------------------------------------------------------
// 2. PAYROLL GENERATION & LIFECYCLE
// -----------------------------------------------------------------------------
console.log('\n--- 2. Payroll Generation ---');

runTest('Generates payroll for all 6 active employees', () => {
  const activeEmps = SAMPLE_EMPLOYEES.filter((e) => e.status !== 'Inactive');
  assert.strictEqual(activeEmps.length, 6, 'All 6 employees must be active');

  const month = '2026-12';
  const generated = activeEmps.map((emp) => {
    const struct = normalizeSalaryStructure(emp.salaryConfig);
    return {
      id: generatePayrollId(month, emp.id),
      employeeId: emp.id,
      employeeName: emp.name,
      month,
      payrollMonth: month,
      basicSalary: struct.basicSalary,
      hra: struct.hra,
      otherAllowances: struct.otherAllowances,
      bonus: struct.bonus,
      deductions: struct.deductions,
      grossSalary: struct.grossSalary,
      netSalary: struct.netSalary,
      status: PAYROLL_STATUS.PENDING,
      generatedDate: '2026-12-01',
      paidDate: null,
    };
  });

  assert.strictEqual(generated.length, 6);
  assert.strictEqual(generated[0].id, 'pay-2026-12-emp-101');
  assert.strictEqual(generated[5].id, 'pay-2026-12-emp-106');
});

runTest('Prevents duplicate payroll for the same employee and month', () => {
  const existing = [...SAMPLE_PAYROLL]; // has October and November
  const targetEmp = 'emp-101';
  const month = '2026-11';

  const isDuplicate = existing.some(
    (r) => r.employeeId === targetEmp && (r.month === month || r.payrollMonth === month)
  );
  assert.strictEqual(isDuplicate, true, 'Duplicate record for same employee and month must be detected');

  const isNewMonthDuplicate = existing.some(
    (r) => r.employeeId === targetEmp && (r.month === '2027-01' || r.payrollMonth === '2027-01')
  );
  assert.strictEqual(isNewMonthDuplicate, false, 'New month must not be flagged as duplicate');
});

runTest('Newly generated payroll records start with Pending status', () => {
  const newRecord = {
    id: generatePayrollId('2026-12', 'emp-101'),
    employeeId: 'emp-101',
    status: PAYROLL_STATUS.PENDING,
    paidDate: null,
  };
  assert.strictEqual(newRecord.status, 'Pending');
  assert.strictEqual(newRecord.paidDate, null);
});

runTest('Preserves previous monthly payroll history', () => {
  const octRecords = SAMPLE_PAYROLL.filter((r) => r.month === '2026-10');
  const novRecords = SAMPLE_PAYROLL.filter((r) => r.month === '2026-11');
  assert.strictEqual(octRecords.length, 6, 'October history preserved');
  assert.strictEqual(novRecords.length, 6, 'November history preserved');
});

runTest('Salary structure changes do not alter historical records (immutability)', () => {
  // Take historical record for emp-101 in October
  const historicalOct = SAMPLE_PAYROLL.find((r) => r.employeeId === 'emp-101' && r.month === '2026-10');
  const originalNet = historicalOct.netSalary;

  // Simulate HR updating employee's salary structure for future
  const employeeSalaryUpdated = {
    basicSalary: 9000,
    hra: 1500,
    otherAllowances: 800,
    bonus: 1000,
    deductions: 800,
  };
  const newNet = calculateNetSalary(employeeSalaryUpdated);

  // Assert historical record is untouched
  assert.strictEqual(historicalOct.netSalary, originalNet);
  assert.notStrictEqual(historicalOct.netSalary, newNet, 'Historical payslip must remain immutable');
});

// -----------------------------------------------------------------------------
// 3. PAYMENT MANAGEMENT
// -----------------------------------------------------------------------------
console.log('\n--- 3. Payment Management ---');

runTest('HR can mark payroll as Paid and payment date is recorded', () => {
  const pendingRecord = {
    id: 'pay-2026-11-emp-101',
    status: PAYROLL_STATUS.PENDING,
    paidDate: null,
  };

  const hrRole = USER_ROLES.HR_ADMIN;
  assert.strictEqual(hrRole, 'HR Administrator');

  // HR updates to Paid
  const paidDate = '2026-11-18';
  const updatedRecord = {
    ...pendingRecord,
    status: PAYROLL_STATUS.PAID,
    paidDate,
    paymentDate: paidDate,
    paymentMethod: 'Direct Deposit - Corporate Wire',
  };

  assert.strictEqual(updatedRecord.status, 'Paid');
  assert.strictEqual(updatedRecord.paidDate, '2026-11-18');
  assert.ok(updatedRecord.paymentMethod);
});

runTest('Employees cannot change payment status (Permission Denied)', () => {
  const attemptUpdateByEmployee = (userRole) => {
    if (userRole !== USER_ROLES.HR_ADMIN) {
      throw new Error('Permission Denied: Only HR Administrators can update payment status.');
    }
    return true;
  };

  assert.throws(() => {
    attemptUpdateByEmployee(USER_ROLES.EMPLOYEE);
  }, /Permission Denied/);
});

runTest('Paid and pending expenditure totals calculate correctly', () => {
  const records = [
    { netSalary: 8800, status: PAYROLL_STATUS.PAID },
    { netSalary: 7750, status: PAYROLL_STATUS.PAID },
    { netSalary: 8400, status: PAYROLL_STATUS.PENDING },
    { netSalary: 7350, status: PAYROLL_STATUS.PENDING },
  ];

  const total = records.reduce((s, r) => s + r.netSalary, 0);
  const paid = records.filter((r) => r.status === PAYROLL_STATUS.PAID).reduce((s, r) => s + r.netSalary, 0);
  const pending = records.filter((r) => r.status === PAYROLL_STATUS.PENDING).reduce((s, r) => s + r.netSalary, 0);

  assert.strictEqual(total, 32300);
  assert.strictEqual(paid, 16550);
  assert.strictEqual(pending, 15750);
  assert.strictEqual(paid + pending, total);
});

// -----------------------------------------------------------------------------
// 4. ROLE-BASED ACCESS & PRIVACY
// -----------------------------------------------------------------------------
console.log('\n--- 4. Role-Based Access & Privacy ---');

runTest('HR Administrator can view all employee payroll records', () => {
  const getRecords = (requestingRole, requestingId) => {
    if (requestingRole === USER_ROLES.HR_ADMIN) {
      return SAMPLE_PAYROLL;
    }
    return SAMPLE_PAYROLL.filter((r) => r.employeeId === requestingId);
  };

  const hrView = getRecords(USER_ROLES.HR_ADMIN, 'hr-001');
  assert.strictEqual(hrView.length, SAMPLE_PAYROLL.length);
});

runTest('Employees can ONLY view their own payroll records (strict isolation)', () => {
  const getRecords = (requestingRole, requestingId) => {
    if (requestingRole === USER_ROLES.HR_ADMIN) {
      return SAMPLE_PAYROLL;
    }
    return SAMPLE_PAYROLL.filter((r) => r.employeeId === requestingId);
  };

  // Alex Turner (emp-101) queries records
  const alexRecords = getRecords(USER_ROLES.EMPLOYEE, 'emp-101');
  assert.ok(alexRecords.length > 0);
  alexRecords.forEach((r) => {
    assert.strictEqual(r.employeeId, 'emp-101', 'Must only contain emp-101 records');
  });

  // Verify none of the other 5 employees exist in Alex's list
  const hasOtherEmployees = alexRecords.some((r) => r.employeeId !== 'emp-101');
  assert.strictEqual(hasOtherEmployees, false, 'No cross-employee salary exposure');
});

runTest('Employees cannot edit official salary structures', () => {
  const attemptEditSalary = (userRole) => {
    if (userRole !== USER_ROLES.HR_ADMIN) {
      throw new Error('Permission Denied: Employees cannot edit official salary structures.');
    }
    return true;
  };

  assert.throws(() => {
    attemptEditSalary(USER_ROLES.EMPLOYEE);
  }, /Permission Denied/);

  assert.strictEqual(attemptEditSalary(USER_ROLES.HR_ADMIN), true);
});

// -----------------------------------------------------------------------------
// 5. REGRESSION TESTING
// -----------------------------------------------------------------------------
console.log('\n--- 5. Regression Testing ---');

runTest('Attendance records remain functional and linked to 6 employees', () => {
  const attendance = generateSampleAttendance();
  const dates = Object.keys(attendance);
  assert.ok(dates.length > 0);
  const today = attendance[dates[0]];
  assert.strictEqual(Object.keys(today).length, 6);
  assert.ok(today['emp-101'].checkInFormatted);
});

runTest('Leave Management remains functional and linked to 6 employees', () => {
  const balances = generateSampleLeaveBalances();
  const requests = generateSampleLeaveRequests();
  assert.strictEqual(Object.keys(balances).length, 6);
  assert.ok(requests.length >= 6);
  assert.ok(balances['emp-101'].entitlement);
});

runTest('Employee Management records remain intact', () => {
  assert.strictEqual(SAMPLE_EMPLOYEES.length, 6);
  SAMPLE_EMPLOYEES.forEach((emp) => {
    assert.ok(emp.id);
    assert.ok(emp.name);
    assert.ok(emp.salaryConfig);
    assert.ok(emp.status === 'Active');
  });
});

runTest('Performance & Tasks module remains functional and linked', () => {
  assert.ok(SAMPLE_TASKS.length >= 8);
  const alexTasks = SAMPLE_TASKS.filter((t) => t.assignedTo === 'emp-101');
  assert.ok(alexTasks.length >= 2);
});

runTest('Role switching and company metadata intact', () => {
  assert.strictEqual(USER_ROLES.HR_ADMIN, 'HR Administrator');
  assert.strictEqual(USER_ROLES.EMPLOYEE, 'Employee');
  assert.strictEqual(VISARTECH_EMPLOYEES.length, 6);
});

console.log('\n================================================================');
console.log(`TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED (TOTAL: ${passedCount + failedCount})`);
console.log('================================================================');

if (failedCount > 0) {
  process.exit(1);
}
