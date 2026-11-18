import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VISARTECH_EMPLOYEES, COMPANY_INFO } from '../constants/company';
import { generateSampleAttendance } from '../constants/sampleAttendance';
import {
  getChicagoDateKey,
  formatChicagoTime,
  evaluateAttendanceStatus,
  calculateWorkingHours,
} from '../utils/attendance';

const STORAGE_KEY = '@worksphere_attendance_v1';

export const AttendanceContext = createContext({
  records: {},
  isLoading: true,
  checkIn: async () => {},
  checkOut: async () => {},
  getEmployeeTodayRecord: () => null,
  getEmployeeHistory: () => [],
  getAdminStatistics: () => ({}),
  resetAttendanceData: async () => {},
});

export const AttendanceProvider = ({ children }) => {
  const [records, setRecords] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and load persisted records from AsyncStorage
  const loadRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        setRecords(JSON.parse(savedData));
      } else {
        // Initialize with realistic Visartech sample records
        const initialSamples = generateSampleAttendance();
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialSamples));
        setRecords(initialSamples);
      }
    } catch (error) {
      console.error('Failed to load attendance records:', error);
      // Fallback in memory
      setRecords(generateSampleAttendance());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Persist updated records helper
  const saveRecords = async (updatedRecords) => {
    try {
      setRecords(updatedRecords);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
    } catch (error) {
      console.error('Failed to save attendance records:', error);
    }
  };

  /**
   * Reset attendance records back to sample defaults (for clean testing)
   */
  const resetAttendanceData = async () => {
    try {
      setIsLoading(true);
      const initialSamples = generateSampleAttendance();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialSamples));
      setRecords(initialSamples);
    } catch (error) {
      console.error('Failed to reset attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get today's attendance record for a specific employee
   */
  const getEmployeeTodayRecord = useCallback(
    (employeeId) => {
      const todayKey = getChicagoDateKey();
      return records[todayKey]?.[employeeId] || null;
    },
    [records]
  );

  /**
   * Employee Check-In action
   */
  const checkIn = async (employeeId, employeeName = 'Alex Turner') => {
    const todayKey = getChicagoDateKey();
    const currentTodayRecord = records[todayKey]?.[employeeId];

    // Rule 7: Prevent employees from checking in multiple times without checking out
    if (currentTodayRecord && currentTodayRecord.checkIn && !currentTodayRecord.checkOut) {
      return {
        success: false,
        error: 'Active Check-In Exists',
        message: `You are already checked in at ${currentTodayRecord.checkInFormatted}. You must check out before checking in again.`,
      };
    }

    if (currentTodayRecord && currentTodayRecord.checkIn && currentTodayRecord.checkOut) {
      return {
        success: false,
        error: 'Daily Shift Completed',
        message: `You have already checked out today at ${currentTodayRecord.checkOutFormatted}. Shift recorded: ${currentTodayRecord.workingHours}.`,
      };
    }

    const now = new Date();
    const formattedTime = formatChicagoTime(now);
    const status = evaluateAttendanceStatus(now);

    const newRecord = {
      employeeId,
      employeeName,
      date: todayKey,
      checkIn: now.toISOString(),
      checkInFormatted: formattedTime,
      checkOut: null,
      checkOutFormatted: null,
      status: status, // 'Present' or 'Late'
      workingHours: null,
      notes: status === 'Late' ? 'Late check-in recorded' : 'On-time check-in recorded',
    };

    const updated = {
      ...records,
      [todayKey]: {
        ...(records[todayKey] || {}),
        [employeeId]: newRecord,
      },
    };

    await saveRecords(updated);

    return {
      success: true,
      title: 'Check-In Successful',
      message: `Your check-in was recorded at ${formattedTime} (Chicago Time). Status: ${status}.`,
      record: newRecord,
    };
  };

  /**
   * Employee Check-Out action
   */
  const checkOut = async (employeeId) => {
    const todayKey = getChicagoDateKey();
    const currentTodayRecord = records[todayKey]?.[employeeId];

    // Rule 8: Prevent checkout before check-in
    if (!currentTodayRecord || !currentTodayRecord.checkIn) {
      return {
        success: false,
        error: 'Check-In Required',
        message: 'Cannot check out before checking in. Please check in first.',
      };
    }

    // Prevent multiple checkouts
    if (currentTodayRecord.checkOut) {
      return {
        success: false,
        error: 'Already Checked Out',
        message: `You have already checked out today at ${currentTodayRecord.checkOutFormatted}.`,
      };
    }

    const now = new Date();
    const formattedCheckOut = formatChicagoTime(now);
    const hoursCalc = calculateWorkingHours(currentTodayRecord.checkIn, now.toISOString());

    const updatedRecord = {
      ...currentTodayRecord,
      checkOut: now.toISOString(),
      checkOutFormatted: formattedCheckOut,
      workingHours: hoursCalc.formatted,
    };

    const updated = {
      ...records,
      [todayKey]: {
        ...(records[todayKey] || {}),
        [employeeId]: updatedRecord,
      },
    };

    await saveRecords(updated);

    return {
      success: true,
      title: 'Check-Out Successful',
      message: `Check-out recorded at ${formattedCheckOut}. Total working hours: ${hoursCalc.formatted}.`,
      record: updatedRecord,
    };
  };

  /**
   * Get employee attendance history across all recorded dates
   */
  const getEmployeeHistory = useCallback(
    (employeeId, statusFilter = 'ALL') => {
      const history = [];

      // Sort dates descending (newest first)
      const sortedDates = Object.keys(records).sort((a, b) => b.localeCompare(a));

      for (const dateKey of sortedDates) {
        const record = records[dateKey]?.[employeeId];
        if (record) {
          if (statusFilter === 'ALL' || record.status.toUpperCase() === statusFilter.toUpperCase()) {
            history.push(record);
          }
        }
      }

      return history;
    },
    [records]
  );

  /**
   * Calculate administrator attendance statistics for all 6 employees
   */
  const getAdminStatistics = useCallback(() => {
    const todayKey = getChicagoDateKey();
    const todayMap = records[todayKey] || {};

    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;

    const employeeRows = VISARTECH_EMPLOYEES.map((emp) => {
      const record = todayMap[emp.id];

      if (!record || record.status === 'Absent') {
        absentCount += 1;
        return {
          ...emp,
          date: todayKey,
          checkInFormatted: record?.checkInFormatted || '--',
          checkOutFormatted: record?.checkOutFormatted || '--',
          workingHours: record?.workingHours || '--',
          status: 'Absent',
          notes: record?.notes || 'No check-in recorded',
        };
      }

      if (record.status === 'Late') {
        lateCount += 1;
      } else {
        presentCount += 1;
      }

      // Calculate working hours if checked in but not checked out yet
      let currentHours = record.workingHours;
      if (!currentHours && record.checkIn) {
        const activeHours = calculateWorkingHours(record.checkIn, null);
        currentHours = `${activeHours.formatted} (ongoing)`;
      }

      return {
        ...emp,
        date: todayKey,
        checkInFormatted: record.checkInFormatted || '--',
        checkOutFormatted: record.checkOutFormatted || '--',
        workingHours: currentHours || '--',
        status: record.status,
        notes: record.notes || '',
      };
    });

    const totalEmployees = VISARTECH_EMPLOYEES.length; // 6
    const totalAttended = presentCount + lateCount;
    const attendancePercentage = Math.round((totalAttended / totalEmployees) * 100);

    return {
      todayKey,
      totalEmployees,
      presentCount,
      lateCount,
      absentCount,
      attendancePercentage,
      employeeRows,
    };
  }, [records]);

  return (
    <AttendanceContext.Provider
      value={{
        records,
        isLoading,
        checkIn,
        checkOut,
        getEmployeeTodayRecord,
        getEmployeeHistory,
        getAdminStatistics,
        resetAttendanceData,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => useContext(AttendanceContext);
