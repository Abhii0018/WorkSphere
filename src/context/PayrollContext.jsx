import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateSamplePayrollRecords } from '../constants/samplePayroll.js';
import {
  calculateGrossSalary,
  calculateNetSalary,
  getCurrentMonthKey,
  generatePayrollId,
  validateSalaryValues,
  normalizeSalaryStructure,
  PAYROLL_STATUS,
} from '../utils/payroll.js';
import { USER_ROLES } from '../constants/company.js';
import { payrollApi } from '../services/api.js';

const STORAGE_KEY = '@worksphere_payroll_v1';

export const PayrollContext = createContext({
  payrollRecords: [],
  isLoading: true,
  generateMonthlyPayroll: async () => {},
  generateCompanyMonthlyPayroll: async () => {},
  updatePaymentStatus: async () => {},
  getPayrollForEmployee: () => [],
  getAllPayrollRecords: () => [],
  getMonthlyExpenditureStats: () => ({}),
  getHrPayrollStats: () => ({}),
  resetPayrollData: async () => {},
});

export const PayrollProvider = ({ children }) => {
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from MongoDB Atlas with fallback to AsyncStorage
  const loadPayroll = useCallback(async () => {
    try {
      setIsLoading(true);

      try {
        const res = await payrollApi.getAll();
        if (res && res.success && res.data && res.data.length > 0) {
          setPayrollRecords(res.data);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
          return;
        }
      } catch (apiErr) {
        console.warn('[PayrollContext] MongoDB API unavailable, falling back to local storage:', apiErr.message);
      }

      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        setPayrollRecords(JSON.parse(savedData));
      } else {
        const initial = generateSamplePayrollRecords();
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        setPayrollRecords(initial);
      }
    } catch (error) {
      console.error('Failed to load payroll records:', error);
      setPayrollRecords(generateSamplePayrollRecords());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayroll();
  }, [loadPayroll]);

  const savePayroll = async (updatedRecords) => {
    try {
      setPayrollRecords(updatedRecords);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
    } catch (error) {
      console.error('Failed to save payroll records:', error);
    }
  };

  /**
   * Reset payroll records back to sample defaults
   */
  const resetPayrollData = async () => {
    try {
      setIsLoading(true);
      const initial = generateSamplePayrollRecords();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      setPayrollRecords(initial);
    } catch (error) {
      console.error('Failed to reset payroll data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Generate monthly payroll records for all active employees or specific target.
   * Can be called as:
   * 1) generateMonthlyPayroll(month, employeesList, userRole)
   * 2) generateMonthlyPayroll({ employee, month, userRole })
   */
  const generateMonthlyPayroll = async (arg1, arg2, arg3) => {
    // Determine calling signature
    let month = getCurrentMonthKey();
    let employeesList = [];
    let userRole = USER_ROLES.HR_ADMIN;

    if (typeof arg1 === 'object' && arg1 !== null && !Array.isArray(arg1) && arg1.employee) {
      // Single employee signature
      const { employee, month: m = getCurrentMonthKey(), userRole: r = USER_ROLES.HR_ADMIN } = arg1;
      month = m;
      userRole = r;
      employeesList = [employee];
    } else {
      // Batch signature: (month, employeesList, userRole)
      month = arg1 || getCurrentMonthKey();
      employeesList = Array.isArray(arg2) ? arg2 : [];
      userRole = arg3 || USER_ROLES.HR_ADMIN;
    }

    if (userRole !== USER_ROLES.HR_ADMIN) {
      throw new Error('Permission Denied: Only HR Administrators can generate payroll.');
    }

    if (!employeesList || employeesList.length === 0) {
      throw new Error('No eligible employees provided for payroll generation.');
    }

    const newRecords = [];
    let duplicateCount = 0;

    for (const emp of employeesList) {
      // Skip inactive employees if batch
      if (emp.status === 'Inactive') continue;

      // Rule 1: Prevent duplicate payroll generation for the same employee and month
      const existing = payrollRecords.find(
        (r) => r.employeeId === emp.id && (r.month === month || r.payrollMonth === month)
      );
      if (existing) {
        duplicateCount++;
        continue;
      }

      const struct = normalizeSalaryStructure(emp.salaryConfig || emp.salary || {});
      const validation = validateSalaryValues(struct);
      if (!validation.isValid) {
        throw new Error(`Invalid salary for ${emp.name}: ${validation.error}`);
      }

      const todayChicago = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });

      // Rule 3 & 4: Newly generated records must start with Pending status
      const record = {
        id: generatePayrollId(month, emp.id),
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department || 'Visartech',
        title: emp.title || emp.designation || 'Staff Member',
        month,
        payrollMonth: month,
        basicSalary: struct.basicSalary,
        hra: struct.hra,
        otherAllowances: struct.otherAllowances,
        allowances: struct.allowances,
        bonus: struct.bonus,
        deductions: struct.deductions,
        grossSalary: struct.grossSalary,
        netSalary: struct.netSalary,
        status: PAYROLL_STATUS.PENDING,
        generatedAt: new Date().toISOString(),
        generatedDate: todayChicago,
        paidDate: null,
        paymentDate: null,
        paymentMethod: null,
      };

      newRecords.push(record);
    }

    if (newRecords.length === 0) {
      throw new Error(`Payroll records for ${month} have already been generated for all active employees. Duplicate generation is prevented.`);
    }

    const updated = [...newRecords, ...payrollRecords];
    await savePayroll(updated);

    // Sync to MongoDB
    try {
      await payrollApi.generateMonthly(month);
    } catch (apiErr) {
      console.warn('[PayrollContext] Sync generate monthly to MongoDB failed:', apiErr.message);
    }

    return {
      success: true,
      count: newRecords.length,
      records: newRecords,
      duplicateCount,
    };
  };

  /**
   * Alias for generateMonthlyPayroll batch
   */
  const generateCompanyMonthlyPayroll = async (employeesList, month, userRole) => {
    return generateMonthlyPayroll(month, employeesList, userRole);
  };

  /**
   * Update payment status (HR only: Mark as Paid or Pending)
   */
  const updatePaymentStatus = async (
    recordId,
    newStatus = PAYROLL_STATUS.PAID,
    paymentDetails = {},
    userRole = USER_ROLES.HR_ADMIN
  ) => {
    // Rule 5: Only HR can update payment status
    if (userRole !== USER_ROLES.HR_ADMIN) {
      throw new Error('Permission Denied: Only HR Administrators can mark payroll as Paid or Pending.');
    }

    const index = payrollRecords.findIndex((r) => r.id === recordId);
    if (index === -1) {
      throw new Error('Payroll record not found.');
    }

    const currentRecord = payrollRecords[index];
    const isPaid = newStatus === PAYROLL_STATUS.PAID;
    const todayChicago = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });

    // Rule 6: Record the payment date when HR marks payroll as Paid
    const updatedRecord = {
      ...currentRecord,
      status: newStatus,
      paidDate: isPaid ? (paymentDetails.paidDate || paymentDetails.paymentDate || todayChicago) : null,
      paymentDate: isPaid ? (paymentDetails.paidDate || paymentDetails.paymentDate || todayChicago) : null,
      paymentMethod: isPaid ? (paymentDetails.paymentMethod || 'Direct Deposit - Corporate Wire') : null,
    };

    const updated = [...payrollRecords];
    updated[index] = updatedRecord;
    await savePayroll(updated);

    // Sync to MongoDB
    try {
      await payrollApi.updateStatus(recordId, newStatus, updatedRecord.paymentMethod);
    } catch (apiErr) {
      console.warn('[PayrollContext] Sync payment status to MongoDB failed:', apiErr.message);
    }

    return updatedRecord;
  };

  /**
   * Get payroll for specific employee
   * Rule 9: Employees must only access their own payroll information.
   */
  const getPayrollForEmployee = useCallback(
    (targetEmployeeId, requestingUserId, requestingUserRole) => {
      // If requesting user is Employee, strictly ensure targetEmployeeId === requestingUserId
      if (requestingUserRole === USER_ROLES.EMPLOYEE && requestingUserId !== targetEmployeeId) {
        return [];
      }

      return payrollRecords
        .filter((r) => r.employeeId === targetEmployeeId)
        .sort((a, b) => (b.month || '').localeCompare(a.month || ''));
    },
    [payrollRecords]
  );

  /**
   * Get all payroll records (HR only) with filtering
   */
  const getAllPayrollRecords = useCallback(
    ({ month = 'ALL', status = 'ALL', employeeId = 'ALL', search = '' } = {}) => {
      const q = search.trim().toLowerCase();

      return payrollRecords
        .filter((r) => {
          if (month !== 'ALL' && r.month !== month && r.payrollMonth !== month) return false;
          if (status !== 'ALL' && r.status.toUpperCase() !== status.toUpperCase()) return false;
          if (employeeId !== 'ALL' && r.employeeId !== employeeId) return false;

          if (q) {
            const matchName = r.employeeName?.toLowerCase().includes(q);
            const matchId = r.employeeId?.toLowerCase().includes(q);
            const matchDept = r.department?.toLowerCase().includes(q);
            if (!matchName && !matchId && !matchDept) return false;
          }

          return true;
        })
        .sort((a, b) => (b.month || '').localeCompare(a.month || ''));
    },
    [payrollRecords]
  );

  /**
   * Calculate monthly payroll expenditure analytics for HR Dashboard Summary Cards:
   * - Total monthly payroll
   * - Total employees included in payroll
   * - Paid payroll amount
   * - Pending payroll amount
   */
  const getMonthlyExpenditureStats = useCallback(
    (monthKey) => {
      const records = monthKey && monthKey !== 'ALL'
        ? payrollRecords.filter((r) => r.month === monthKey || r.payrollMonth === monthKey)
        : payrollRecords;

      const totalNetSalary = records.reduce((sum, r) => sum + (Number(r.netSalary) || 0), 0);
      const totalGrossSalary = records.reduce((sum, r) => sum + (Number(r.grossSalary) || 0), 0);

      const paidRecords = records.filter((r) => r.status === PAYROLL_STATUS.PAID);
      const pendingRecords = records.filter((r) => r.status === PAYROLL_STATUS.PENDING);

      const totalPaid = paidRecords.reduce((sum, r) => sum + (Number(r.netSalary) || 0), 0);
      const totalPending = pendingRecords.reduce((sum, r) => sum + (Number(r.netSalary) || 0), 0);

      // Distinct employees included
      const employeesSet = new Set(records.map((r) => r.employeeId));

      return {
        month: monthKey || 'ALL',
        totalMonthlyPayroll: totalNetSalary,
        totalNetSalary,
        totalGrossSalary,
        totalEmployees: employeesSet.size,
        totalEmployeesIncluded: employeesSet.size,
        paidPayrollAmount: totalPaid,
        totalPaid,
        pendingPayrollAmount: totalPending,
        totalPending,
        paidCount: paidRecords.length,
        pendingCount: pendingRecords.length,
        totalRecords: records.length,
      };
    },
    [payrollRecords]
  );

  const getHrPayrollStats = getMonthlyExpenditureStats;

  return (
    <PayrollContext.Provider
      value={{
        payrollRecords,
        isLoading,
        generateMonthlyPayroll,
        generateCompanyMonthlyPayroll,
        updatePaymentStatus,
        getPayrollForEmployee,
        getAllPayrollRecords,
        getMonthlyExpenditureStats,
        getHrPayrollStats,
        resetPayrollData,
      }}
    >
      {children}
    </PayrollContext.Provider>
  );
};

export const usePayroll = () => useContext(PayrollContext);
