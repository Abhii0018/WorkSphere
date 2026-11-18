import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateSamplePayrollRecords } from '../constants/samplePayroll.js';
import { calculateNetSalary, getCurrentMonthKey, validateSalaryValues } from '../utils/payroll.js';
import { USER_ROLES } from '../constants/company.js';

const STORAGE_KEY = '@worksphere_payroll_v1';

export const PayrollContext = createContext({
  payrollRecords: [],
  isLoading: true,
  generateMonthlyPayroll: async () => {},
  generateCompanyMonthlyPayroll: async () => {},
  updatePaymentStatus: async () => {},
  getPayrollForEmployee: () => [],
  getAllPayrollRecords: () => [],
  getHrPayrollStats: () => ({}),
  resetPayrollData: async () => {},
});

export const PayrollProvider = ({ children }) => {
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from AsyncStorage
  const loadPayroll = useCallback(async () => {
    try {
      setIsLoading(true);
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
   * Generate monthly payroll record for an individual employee (HR action)
   */
  const generateMonthlyPayroll = async ({
    employee,
    month = getCurrentMonthKey(),
    customBreakdown = null,
    userRole = USER_ROLES.HR_ADMIN,
  }) => {
    if (userRole !== USER_ROLES.HR_ADMIN) {
      return { success: false, error: 'Permission Denied: Only HR Administrators can generate payroll.' };
    }

    if (!employee || !employee.id) {
      return { success: false, error: 'Valid employee reference required.' };
    }

    // Rule: Prevent duplicate payroll generation for the same employee and month
    const existingRecord = payrollRecords.find(
      (r) => r.employeeId === employee.id && r.month === month
    );
    if (existingRecord) {
      return {
        success: false,
        error: `Payroll for ${employee.name} for ${month} has already been generated.`,
      };
    }

    const basicSalary = Number(customBreakdown?.basic ?? employee.salary?.basic ?? 6000);
    const allowances = Number(customBreakdown?.allowances ?? employee.salary?.allowances ?? 500);
    const bonuses = Number(customBreakdown?.bonuses ?? employee.salary?.bonuses ?? 300);
    const deductions = Number(customBreakdown?.deductions ?? employee.salary?.deductions ?? 400);

    // Rule: Validate that salary values are non-negative
    const validation = validateSalaryValues({
      basic: basicSalary,
      allowances,
      bonuses,
      deductions,
    });
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const netSalary = calculateNetSalary({
      basic: basicSalary,
      allowances,
      bonuses,
      deductions,
    });

    // Rule: Do not automatically mark payroll as Paid when generated (start as Pending)
    const newRecord = {
      id: `pay-${month}-${employee.id}`,
      employeeId: employee.id,
      employeeName: employee.name,
      department: employee.department || 'Visartech',
      title: employee.title || 'Staff Member',
      month,
      basicSalary,
      allowances,
      bonuses,
      deductions,
      netSalary,
      status: 'Pending',
      paymentDate: null,
      paymentMethod: 'Direct Deposit',
      generatedAt: new Date().toISOString(),
      generatedBy: 'Elena Rostova (Lead HR Manager)',
    };

    const updated = [newRecord, ...payrollRecords];
    await savePayroll(updated);

    return {
      success: true,
      message: `Payroll for ${employee.name} for ${month} generated successfully ($${netSalary.toLocaleString()} Net).`,
      record: newRecord,
    };
  };

  /**
   * Generate monthly payroll records for all active employees (HR action)
   */
  const generateCompanyMonthlyPayroll = async (
    employeesList,
    month = getCurrentMonthKey(),
    userRole = USER_ROLES.HR_ADMIN
  ) => {
    if (userRole !== USER_ROLES.HR_ADMIN) {
      return { success: false, error: 'Permission Denied: Only HR Administrators can generate company payroll.' };
    }

    const newRecords = [];
    let skippedCount = 0;

    employeesList.forEach((emp) => {
      if (emp.status === 'Inactive') return;

      const exists = payrollRecords.some(
        (r) => r.employeeId === emp.id && r.month === month
      );
      if (exists) {
        skippedCount++;
        return;
      }

      const basicSalary = Number(emp.salary?.basic ?? 6000);
      const allowances = Number(emp.salary?.allowances ?? 500);
      const bonuses = Number(emp.salary?.bonuses ?? 300);
      const deductions = Number(emp.salary?.deductions ?? 400);
      const netSalary = calculateNetSalary({
        basic: basicSalary,
        allowances,
        bonuses,
        deductions,
      });

      newRecords.push({
        id: `pay-${month}-${emp.id}`,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department || 'Visartech',
        title: emp.title || 'Staff Member',
        month,
        basicSalary,
        allowances,
        bonuses,
        deductions,
        netSalary,
        status: 'Pending',
        paymentDate: null,
        paymentMethod: 'Direct Deposit',
        generatedAt: new Date().toISOString(),
        generatedBy: 'Elena Rostova (Lead HR Manager)',
      });
    });

    if (newRecords.length === 0) {
      return {
        success: false,
        error: `All active employees already have payroll records generated for ${month}.`,
      };
    }

    const updated = [...newRecords, ...payrollRecords];
    await savePayroll(updated);

    return {
      success: true,
      message: `Generated ${newRecords.length} payroll records for ${month}. (${skippedCount} already existed).`,
      count: newRecords.length,
    };
  };

  /**
   * Update payment status (HR only)
   */
  const updatePaymentStatus = async (
    recordId,
    newStatus,
    paymentDate = null,
    userRole = USER_ROLES.HR_ADMIN
  ) => {
    // Rule: Only HR can update payment status
    if (userRole !== USER_ROLES.HR_ADMIN) {
      return { success: false, error: 'Permission Denied: Only HR Administrators can update payment status.' };
    }

    const index = payrollRecords.findIndex((r) => r.id === recordId);
    if (index === -1) {
      return { success: false, error: 'Payroll record not found.' };
    }

    const currentRecord = payrollRecords[index];
    const isPaid = newStatus === 'Paid';

    const updatedRecord = {
      ...currentRecord,
      status: newStatus,
      paymentDate: isPaid ? (paymentDate || new Date().toISOString().split('T')[0]) : null,
    };

    const updated = [...payrollRecords];
    updated[index] = updatedRecord;
    await savePayroll(updated);

    return {
      success: true,
      message: `Payroll marked as ${newStatus} for ${currentRecord.employeeName}.`,
      record: updatedRecord,
    };
  };

  /**
   * Get payroll for specific employee
   * Rule: Employees must never see another employee's salary!
   */
  const getPayrollForEmployee = useCallback(
    (targetEmployeeId, requestingUserId, requestingUserRole) => {
      // If user is employee, strictly enforce that they can only access their own records
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
   * Get all payroll records (HR only) with month and status filter
   */
  const getAllPayrollRecords = useCallback(
    ({ month = 'ALL', status = 'ALL' } = {}) => {
      return payrollRecords
        .filter((r) => {
          if (month !== 'ALL' && r.month !== month) return false;
          if (status !== 'ALL' && r.status.toUpperCase() !== status.toUpperCase()) return false;
          return true;
        })
        .sort((a, b) => (b.month || '').localeCompare(a.month || ''));
    },
    [payrollRecords]
  );

  /**
   * Company-wide payroll expenditure metrics for HR
   */
  const getHrPayrollStats = useCallback(
    (month = getCurrentMonthKey()) => {
      const monthRecords = payrollRecords.filter((r) => r.month === month);
      const totalExpenditure = monthRecords.reduce((sum, r) => sum + r.netSalary, 0);
      const totalPaid = monthRecords
        .filter((r) => r.status === 'Paid')
        .reduce((sum, r) => sum + r.netSalary, 0);
      const totalPending = monthRecords
        .filter((r) => r.status === 'Pending')
        .reduce((sum, r) => sum + r.netSalary, 0);

      const paidCount = monthRecords.filter((r) => r.status === 'Paid').length;
      const pendingCount = monthRecords.filter((r) => r.status === 'Pending').length;

      return {
        month,
        recordCount: monthRecords.length,
        totalExpenditure,
        totalPaid,
        totalPending,
        paidCount,
        pendingCount,
      };
    },
    [payrollRecords]
  );

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
        getHrPayrollStats,
        resetPayrollData,
      }}
    >
      {children}
    </PayrollContext.Provider>
  );
};

export const usePayroll = () => useContext(PayrollContext);
