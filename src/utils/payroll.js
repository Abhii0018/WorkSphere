/**
 * WorkSphere - Payroll & Salary Utilities
 * USD currency calculations and monthly payroll formatting
 */

export const PAYROLL_STATUS = {
  PAID: 'Paid',
  PENDING: 'Pending',
};

export const calculateGrossSalary = (basic = 0, allowances = 0, bonuses = 0) => {
  if (typeof basic === 'object' && basic !== null) {
    const b = Number(basic.basic || basic.basicSalary) || 0;
    const a = Number(basic.allowances) || 0;
    const bon = Number(basic.bonuses) || 0;
    return b + a + bon;
  }
  const b = Number(basic) || 0;
  const a = Number(allowances) || 0;
  const bon = Number(bonuses) || 0;
  return b + a + bon;
};

export const calculateNetSalary = (basic = 0, allowances = 0, bonuses = 0, deductions = 0) => {
  if (typeof basic === 'object' && basic !== null) {
    const b = Number(basic.basic || basic.basicSalary) || 0;
    const a = Number(basic.allowances) || 0;
    const bon = Number(basic.bonuses) || 0;
    const d = Number(basic.deductions) || 0;
    return Math.max(0, b + a + bon - d);
  }
  const b = Number(basic) || 0;
  const a = Number(allowances) || 0;
  const bon = Number(bonuses) || 0;
  const d = Number(deductions) || 0;
  return Math.max(0, b + a + bon - d);
};

export const formatCurrency = (amount = 0) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatMonthLabel = (monthKey) => {
  // monthKey format "YYYY-MM" e.g. "2026-11"
  if (!monthKey) return 'Current Month';
  const parts = monthKey.split('-');
  if (parts.length < 2) return monthKey;
  const year = parts[0];
  const month = parseInt(parts[1], 10) - 1;
  const d = new Date(year, month, 1);
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d);
};

export const getCurrentMonthKey = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const generatePayrollId = (monthKey, employeeId) => {
  return `pay-${monthKey}-${employeeId}`;
};

export const isValidSalaryAmount = (val) => {
  if (val === null || val === undefined || val === '') return false;
  const n = Number(val);
  return !isNaN(n) && n >= 0;
};

export const validateSalaryValues = ({ basic, allowances, bonuses, deductions }) => {
  if (basic != null && Number(basic) < 0) return { isValid: false, error: 'Basic salary cannot be negative.' };
  if (allowances != null && Number(allowances) < 0) return { isValid: false, error: 'Allowances cannot be negative.' };
  if (bonuses != null && Number(bonuses) < 0) return { isValid: false, error: 'Bonuses cannot be negative.' };
  if (deductions != null && Number(deductions) < 0) return { isValid: false, error: 'Deductions cannot be negative.' };
  return { isValid: true };
};
