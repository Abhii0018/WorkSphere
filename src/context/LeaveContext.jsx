import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  generateSampleLeaveBalances,
  generateSampleLeaveRequests,
} from '../constants/sampleLeave.js';
import {
  LEAVE_TYPE_KEYS,
  validateLeaveApplication,
} from '../utils/leave.js';
import { formatChicagoDate } from '../utils/attendance.js';
import { leaveApi } from '../services/api.js';

const STORAGE_KEY = '@worksphere_leave_v1';

export const LeaveContext = createContext({
  leaveRequests: [],
  leaveBalances: {},
  isLoading: true,
  applyLeave: async () => {},
  approveLeave: async () => {},
  rejectLeave: async () => {},
  cancelLeave: async () => {},
  getEmployeeBalance: () => ({}),
  getEmployeeLeaveRequests: () => [],
  getEmployeeLeaveStats: () => ({}),
  getHrLeaveStats: () => ({}),
  getAllLeaveRequests: () => [],
  resetLeaveData: async () => {},
});

export const LeaveProvider = ({ children }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load from MongoDB Atlas with fallback to AsyncStorage
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Try loading live leaves from MongoDB Atlas
      try {
        const res = await leaveApi.getAllLeaves();
        if (res && res.success && res.data && res.data.length > 0) {
          setLeaveRequests(res.data);
          const initialBalances = generateSampleLeaveBalances();
          setLeaveBalances(initialBalances);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
            requests: res.data,
            balances: initialBalances,
          }));
          return;
        }
      } catch (apiErr) {
        console.warn('[LeaveContext] MongoDB API unavailable, falling back to local storage:', apiErr.message);
      }

      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setLeaveRequests(parsed.requests || []);
        setLeaveBalances(parsed.balances || {});
      } else {
        const initialBalances = generateSampleLeaveBalances();
        const initialRequests = generateSampleLeaveRequests();
        const initialData = {
          balances: initialBalances,
          requests: initialRequests,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
        setLeaveBalances(initialBalances);
        setLeaveRequests(initialRequests);
      }
    } catch (error) {
      console.error('Failed to load leave records:', error);
      setLeaveBalances(generateSampleLeaveBalances());
      setLeaveRequests(generateSampleLeaveRequests());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save to AsyncStorage
  const saveData = async (updatedRequests, updatedBalances) => {
    try {
      setLeaveRequests(updatedRequests);
      setLeaveBalances(updatedBalances);
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ requests: updatedRequests, balances: updatedBalances })
      );
    } catch (error) {
      console.error('Failed to save leave records:', error);
    }
  };

  /**
   * Reset data back to default sample seeds (for testing and verification)
   */
  const resetLeaveData = async () => {
    try {
      setIsLoading(true);
      const initialBalances = generateSampleLeaveBalances();
      const initialRequests = generateSampleLeaveRequests();
      const initialData = {
        balances: initialBalances,
        requests: initialRequests,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      setLeaveBalances(initialBalances);
      setLeaveRequests(initialRequests);
    } catch (error) {
      console.error('Failed to reset leave data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get formatted leave balance for an employee
   */
  const getEmployeeBalance = useCallback(
    (employeeId) => {
      const empBalance = leaveBalances[employeeId] || {
        entitlement: { casual: 10, sick: 10, annual: 15, personal: 5 },
        used: { casual: 0, sick: 0, annual: 0, personal: 0 },
      };

      const remaining = {
        casual: Math.max(0, empBalance.entitlement.casual - empBalance.used.casual),
        sick: Math.max(0, empBalance.entitlement.sick - empBalance.used.sick),
        annual: Math.max(0, empBalance.entitlement.annual - empBalance.used.annual),
        personal: Math.max(0, empBalance.entitlement.personal - empBalance.used.personal),
      };

      const totalEntitled = Object.values(empBalance.entitlement).reduce((a, b) => a + b, 0);
      const totalUsed = Object.values(empBalance.used).reduce((a, b) => a + b, 0);
      const totalRemaining = Object.values(remaining).reduce((a, b) => a + b, 0);

      return {
        entitlement: empBalance.entitlement,
        used: empBalance.used,
        remaining,
        totalEntitled,
        totalUsed,
        totalRemaining,
      };
    },
    [leaveBalances]
  );

  /**
   * Apply for leave (Employee action)
   */
  const applyLeave = async ({
    employeeId,
    employeeName,
    department,
    leaveType,
    startDate,
    endDate,
    reason,
  }) => {
    const balance = getEmployeeBalance(employeeId);
    const existingRequests = leaveRequests.filter((r) => r.employeeId === employeeId);

    // Validation
    const validation = validateLeaveApplication(
      { leaveType, startDate, endDate, reason },
      balance,
      existingRequests
    );

    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const newRequest = {
      id: `leave-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      employeeId,
      employeeName,
      department: department || 'Visartech Team',
      leaveType,
      startDate,
      endDate,
      days: validation.days,
      reason: reason.trim(),
      status: 'Pending',
      appliedAt: new Date().toISOString(),
      appliedDateFormatted: formatChicagoDate(new Date()),
      reviewedBy: null,
      reviewedAt: null,
      hrComment: null,
    };

    // Notice: Pending requests do NOT deduct balance yet!
    const updatedRequests = [newRequest, ...leaveRequests];
    await saveData(updatedRequests, leaveBalances);

    // Sync to MongoDB
    try {
      await leaveApi.apply({
        employeeId,
        leaveType,
        startDate,
        endDate,
        days: validation.days,
        reason,
      });
    } catch (apiErr) {
      console.warn('[LeaveContext] Sync leave application to MongoDB failed:', apiErr.message);
    }

    return {
      success: true,
      message: `Leave application submitted for ${validation.days} ${validation.days === 1 ? 'day' : 'days'}. Status: Pending HR approval.`,
      request: newRequest,
    };
  };

  /**
   * Approve leave application (HR action)
   */
  const approveLeave = async (requestId, hrComment = '') => {
    const request = leaveRequests.find((r) => r.id === requestId);
    if (!request) {
      return { success: false, error: 'Leave request not found.' };
    }

    if (request.status === 'Approved') {
      return { success: false, error: 'Request is already approved.' };
    }

    const typeKey = LEAVE_TYPE_KEYS[request.leaveType];
    const empBalance = leaveBalances[request.employeeId] || {
      entitlement: { casual: 10, sick: 10, annual: 15, personal: 5 },
      used: { casual: 0, sick: 0, annual: 0, personal: 0 },
    };

    // Deduct balance upon approval
    const updatedUsed = {
      ...empBalance.used,
      [typeKey]: (empBalance.used[typeKey] || 0) + request.days,
    };

    const updatedBalances = {
      ...leaveBalances,
      [request.employeeId]: {
        ...empBalance,
        used: updatedUsed,
      },
    };

    const updatedRequests = leaveRequests.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'Approved',
          reviewedBy: 'Elena Rostova (Lead HR Manager)',
          reviewedAt: new Date().toISOString(),
          hrComment: hrComment.trim() || 'Approved by HR Operations',
        };
      }
      return r;
    });

    await saveData(updatedRequests, updatedBalances);

    // Sync to MongoDB
    try {
      await leaveApi.updateStatus(requestId, {
        status: 'Approved',
        reviewNote: hrComment.trim() || 'Approved by HR Operations',
        reviewedBy: 'Elena Rostova',
      });
    } catch (apiErr) {
      console.warn('[LeaveContext] Sync approve to MongoDB failed:', apiErr.message);
    }

    return {
      success: true,
      message: `Leave request approved for ${request.employeeName}. ${request.days} ${request.days === 1 ? 'day' : 'days'} deducted from ${request.leaveType}.`,
    };
  };

  /**
   * Reject leave application (HR action)
   */
  const rejectLeave = async (requestId, hrComment = '') => {
    const request = leaveRequests.find((r) => r.id === requestId);
    if (!request) {
      return { success: false, error: 'Leave request not found.' };
    }

    let updatedBalances = leaveBalances;

    // If previously approved, restore the deducted balance!
    if (request.status === 'Approved') {
      const typeKey = LEAVE_TYPE_KEYS[request.leaveType];
      const empBalance = leaveBalances[request.employeeId];
      if (empBalance) {
        const restoredUsed = {
          ...empBalance.used,
          [typeKey]: Math.max(0, (empBalance.used[typeKey] || 0) - request.days),
        };
        updatedBalances = {
          ...leaveBalances,
          [request.employeeId]: {
            ...empBalance,
            used: restoredUsed,
          },
        };
      }
    }

    const updatedRequests = leaveRequests.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'Rejected',
          reviewedBy: 'Elena Rostova (Lead HR Manager)',
          reviewedAt: new Date().toISOString(),
          hrComment: hrComment.trim() || 'Declined by HR Operations',
        };
      }
      return r;
    });

    await saveData(updatedRequests, updatedBalances);

    // Sync to MongoDB
    try {
      await leaveApi.updateStatus(requestId, {
        status: 'Approved',
        reviewNote: hrComment.trim() || 'Approved by HR Operations',
        reviewedBy: 'Elena Rostova',
      });
    } catch (apiErr) {
      console.warn('[LeaveContext] Sync approve to MongoDB failed:', apiErr.message);
    }

    return {
      success: true,
      message: `Leave request for ${request.employeeName} has been rejected.`,
    };
  };

  /**
   * Cancel leave application (Employee action)
   */
  const cancelLeave = async (requestId) => {
    const request = leaveRequests.find((r) => r.id === requestId);
    if (!request) {
      return { success: false, error: 'Leave request not found.' };
    }

    let updatedBalances = leaveBalances;

    // If an approved leave is cancelled, restore the appropriate balance
    if (request.status === 'Approved') {
      const typeKey = LEAVE_TYPE_KEYS[request.leaveType];
      const empBalance = leaveBalances[request.employeeId];
      if (empBalance) {
        const restoredUsed = {
          ...empBalance.used,
          [typeKey]: Math.max(0, (empBalance.used[typeKey] || 0) - request.days),
        };
        updatedBalances = {
          ...leaveBalances,
          [request.employeeId]: {
            ...empBalance,
            used: restoredUsed,
          },
        };
      }
    }

    const updatedRequests = leaveRequests.filter((r) => r.id !== requestId);
    await saveData(updatedRequests, updatedBalances);

    // Sync to MongoDB
    try {
      await leaveApi.updateStatus(requestId, {
        status: 'Approved',
        reviewNote: hrComment.trim() || 'Approved by HR Operations',
        reviewedBy: 'Elena Rostova',
      });
    } catch (apiErr) {
      console.warn('[LeaveContext] Sync approve to MongoDB failed:', apiErr.message);
    }

    return {
      success: true,
      message: 'Leave application cancelled successfully.',
    };
  };

  /**
   * Helper: Get requests for a specific employee
   */
  const getEmployeeLeaveRequests = useCallback(
    (employeeId, statusFilter = 'ALL') => {
      return leaveRequests
        .filter((r) => {
          if (r.employeeId !== employeeId) return false;
          if (statusFilter === 'ALL') return true;
          return r.status.toUpperCase() === statusFilter.toUpperCase();
        })
        .sort((a, b) => (b.appliedAt || '').localeCompare(a.appliedAt || ''));
    },
    [leaveRequests]
  );

  /**
   * Helper: Get summary metrics for an employee
   */
  const getEmployeeLeaveStats = useCallback(
    (employeeId) => {
      const balance = getEmployeeBalance(employeeId);
      const empRequests = leaveRequests.filter((r) => r.employeeId === employeeId);

      const pendingCount = empRequests.filter((r) => r.status === 'Pending').length;
      const approvedCount = empRequests.filter((r) => r.status === 'Approved').length;
      const rejectedCount = empRequests.filter((r) => r.status === 'Rejected').length;

      return {
        totalEntitled: balance.totalEntitled,
        totalUsed: balance.totalUsed,
        totalRemaining: balance.totalRemaining,
        pendingCount,
        approvedCount,
        rejectedCount,
        totalRequests: empRequests.length,
      };
    },
    [getEmployeeBalance, leaveRequests]
  );

  /**
   * Helper: Get company-wide HR metrics
   */
  const getHrLeaveStats = useCallback(() => {
    const pendingCount = leaveRequests.filter((r) => r.status === 'Pending').length;
    const approvedCount = leaveRequests.filter((r) => r.status === 'Approved').length;
    const rejectedCount = leaveRequests.filter((r) => r.status === 'Rejected').length;

    return {
      totalRequests: leaveRequests.length,
      pendingCount,
      approvedCount,
      rejectedCount,
    };
  }, [leaveRequests]);

  /**
   * Helper: Get all requests across company with filter
   */
  const getAllLeaveRequests = useCallback(
    (statusFilter = 'ALL') => {
      return leaveRequests
        .filter((r) => {
          if (statusFilter === 'ALL') return true;
          return r.status.toUpperCase() === statusFilter.toUpperCase();
        })
        .sort((a, b) => (b.appliedAt || '').localeCompare(a.appliedAt || ''));
    },
    [leaveRequests]
  );

  return (
    <LeaveContext.Provider
      value={{
        leaveRequests,
        leaveBalances,
        isLoading,
        applyLeave,
        approveLeave,
        rejectLeave,
        cancelLeave,
        getEmployeeBalance,
        getEmployeeLeaveRequests,
        getEmployeeLeaveStats,
        getHrLeaveStats,
        getAllLeaveRequests,
        resetLeaveData,
      }}
    >
      {children}
    </LeaveContext.Provider>
  );
};

export const useLeave = () => useContext(LeaveContext);
