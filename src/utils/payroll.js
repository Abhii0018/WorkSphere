/**
 * WorkSphere - Payroll & Salary Utilities
 * USD currency calculations, payroll lifecycle formatting & validations
 * Configured for Visartech (America/Chicago timezone)
 */

export const PAYROLL_STATUS = {
  PAID: 'Paid',
  PENDING: 'Pending',
};

/**
 * Calculate Gross Salary:
 * Gross Salary = Basic Salary + HRA + Other Allowances + Bonus
 */
export function calculateGrossSalary(...args) {
  if (args.length === 0) return 0;
  const first = args[0];

  if (typeof first === 'object' && first !== null) {
    const b = Number(first.basicSalary ?? first.basic ?? 0);
    const h = Number(first.hra ?? 0);
    const oa = Number(first.otherAllowances ?? (h === 0 ? (first.allowances ?? 0) : 0));
    const bon = Number(first.bonus ?? first.bonuses ?? 0);
    return Math.max(0, b + h + oa + bon);
  }

  // If called with 3 args: (basic, allowances, bonus)
  if (args.length === 3) {
    const b = Number(args[0]) || 0;
    const all = Number(args[1]) || 0;
    const bon = Number(args[2]) || 0;
    return Math.max(0, b + all + bon);
  }

  const b = Number(args[0]) || 0;
  const h = Number(args[1]) || 0;
  const oa = Number(args[2]) || 0;
  const bon = Number(args[3]) || 0;
  return Math.max(0, b + h + oa + bon);
}

/**
 * Calculate Net Salary:
 * Net Salary = Gross Salary - Deductions (clamped to min 0)
 */
export function calculateNetSalary(...args) {
  if (args.length === 0) return 0;
  const first = args[0];

  if (typeof first === 'object' && first !== null) {
    const gross = calculateGrossSalary(first);
    const d = Number(first.deductions ?? 0);
    return Math.max(0, gross - d);
  }

  // If called with 2 args: (gross, deductions)
  if (args.length === 2) {
    const g = Number(args[0]) || 0;
    const d = Number(args[1]) || 0;
    return Math.max(0, g - d);
  }

  // If called with 4 args: (basic, allowances, bonus, deductions)
  if (args.length === 4) {
    const b = Number(args[0]) || 0;
    const all = Number(args[1]) || 0;
    const bon = Number(args[2]) || 0;
    const d = Number(args[3]) || 0;
    return Math.max(0, b + all + bon - d);
  }

  // If called with 5 args: (basic, hra, otherAllowances, bonus, deductions)
  const gross = calculateGrossSalary(args[0], args[1], args[2], args[3]);
  const d = Number(args[4]) || 0;
  return Math.max(0, gross - d);
}

/**
 * Format currency in USD ($X,XXX)
 */
export const formatCurrency = (amount = 0) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Format month key "YYYY-MM" to readable label "November 2026"
 */
export const formatMonthLabel = (monthKey) => {
  if (!monthKey) return 'Current Month';
  const parts = monthKey.split('-');
  if (parts.length < 2) return monthKey;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const d = new Date(year, month, 1);
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d);
};

/**
 * Return current month key "YYYY-MM" in Chicago time
 */
export const getCurrentMonthKey = () => {
  const now = new Date();
  const chicagoStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Chicago' }); // YYYY-MM-DD
  return chicagoStr.substring(0, 7);
};

/**
 * Standard unique Payroll ID generator: pay-YYYY-MM-emp-XXX
 */
export const generatePayrollId = (monthKey, employeeId) => {
  return `pay-${monthKey}-${employeeId}`;
};

/**
 * Check if a salary value is non-negative and finite
 */
export const isValidSalaryAmount = (val) => {
  if (val === null || val === undefined || val === '') return false;
  const n = Number(val);
  return !isNaN(n) && isFinite(n) && n >= 0;
};

/**
 * Validate full salary structure values
 */
export const validateSalaryValues = (struct = {}) => {
  const { basicSalary, basic, hra, otherAllowances, allowances, bonus, bonuses, deductions } = struct;

  const b = basicSalary ?? basic;
  if (b != null && Number(b) < 0) return { isValid: false, error: 'Basic salary cannot be negative.' };

  if (hra != null && Number(hra) < 0) return { isValid: false, error: 'HRA cannot be negative.' };

  const oa = otherAllowances ?? allowances;
  if (oa != null && Number(oa) < 0) return { isValid: false, error: 'Allowances cannot be negative.' };

  const bon = bonus ?? bonuses;
  if (bon != null && Number(bon) < 0) return { isValid: false, error: 'Bonus cannot be negative.' };

  if (deductions != null && Number(deductions) < 0) return { isValid: false, error: 'Deductions cannot be negative.' };

  return { isValid: true };
};

/**
 * Normalize and compute a full salary structure representation
 */
export const normalizeSalaryStructure = (raw = {}) => {
  const basicSalary = Math.max(0, Number(raw.basicSalary ?? raw.basic ?? 0));
  const hra = Math.max(0, Number(raw.hra ?? 0));
  const otherAllowances = Math.max(0, Number(raw.otherAllowances ?? (hra === 0 ? (raw.allowances ?? 0) : 0)));
  const bonus = Math.max(0, Number(raw.bonus ?? raw.bonuses ?? 0));
  const deductions = Math.max(0, Number(raw.deductions ?? 0));

  const grossSalary = basicSalary + hra + otherAllowances + bonus;
  const netSalary = Math.max(0, grossSalary - deductions);

  return {
    basicSalary,
    hra,
    otherAllowances,
    bonus,
    deductions,
    grossSalary,
    netSalary,
    // Aliases for compatibility
    basic: basicSalary,
    allowances: hra + otherAllowances,
    bonuses: bonus,
  };
};
