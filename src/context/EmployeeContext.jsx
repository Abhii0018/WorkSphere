import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateSampleEmployees } from '../constants/sampleEmployees.js';
import { USER_ROLES } from '../constants/company.js';

const STORAGE_KEY = '@worksphere_employees_v1';

export const EmployeeContext = createContext({
  employees: [],
  activeEmployees: [],
  inactiveEmployees: [],
  isLoading: true,
  addEmployee: async () => {},
  updateEmployee: async () => {},
  getEmployeeById: () => null,
  searchEmployees: () => [],
  resetEmployeeData: async () => {},
});

export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from AsyncStorage
  const loadEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        setEmployees(JSON.parse(savedData));
      } else {
        const initial = generateSampleEmployees();
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        setEmployees(initial);
      }
    } catch (error) {
      console.error('Failed to load employee records:', error);
      setEmployees(generateSampleEmployees());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const saveEmployees = async (updatedEmployees) => {
    try {
      setEmployees(updatedEmployees);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmployees));
    } catch (error) {
      console.error('Failed to save employee records:', error);
    }
  };

  /**
   * Reset employee records back to sample defaults (emp-101 through emp-106)
   */
  const resetEmployeeData = async () => {
    try {
      setIsLoading(true);
      const initial = generateSampleEmployees();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      setEmployees(initial);
    } catch (error) {
      console.error('Failed to reset employee records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Generate next unique employee ID (e.g. emp-107, emp-108)
   */
  const generateNextEmployeeId = () => {
    let maxNum = 100;
    employees.forEach((emp) => {
      const match = emp.id.match(/^emp-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    return `emp-${maxNum + 1}`;
  };

  /**
   * Add a new employee (HR only)
   */
  const addEmployee = async (employeeData, userRole = USER_ROLES.HR_ADMIN) => {
    if (userRole !== USER_ROLES.HR_ADMIN) {
      throw new Error('Permission Denied: Only HR Administrators can add employees.');
    }

    const {
      name,
      email,
      phone,
      department,
      title,
      designation,
      joinDate,
      joiningDate,
      salary,
      salaryConfig,
      status = 'Active',
      avatarColor = '#1E40AF',
    } = employeeData;

    // Validations
    if (!name || name.trim().length === 0) {
      throw new Error('Employee name is required.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      throw new Error('A valid corporate email address is required.');
    }

    // Check duplicate email
    const duplicateEmail = employees.some(
      (e) => e.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (duplicateEmail) {
      throw new Error('An employee with this email address already exists.');
    }

    if (!department || department.trim().length === 0) {
      throw new Error('Department is required.');
    }
    const finalTitle = (title || designation || '').trim();
    if (!finalTitle) {
      throw new Error('Job title / designation is required.');
    }

    // Validate salary values if provided
    const basic = Number(salary?.basic ?? salaryConfig?.basicSalary ?? 6000);
    const allowances = Number(salary?.allowances ?? salaryConfig?.allowances ?? 500);
    const bonuses = Number(salary?.bonuses ?? salaryConfig?.bonuses ?? 300);
    const deductions = Number(salary?.deductions ?? salaryConfig?.deductions ?? 450);

    if (basic < 0 || allowances < 0 || bonuses < 0 || deductions < 0) {
      throw new Error('Salary components must be non-negative values.');
    }

    const newId = generateNextEmployeeId();
    const dateJoined = joinDate || joiningDate || new Date().toISOString().split('T')[0];

    const newEmployee = {
      id: newId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '+1 (312) 555-0000',
      role: USER_ROLES.EMPLOYEE,
      department: department.trim(),
      title: finalTitle,
      designation: finalTitle,
      joinDate: dateJoined,
      joiningDate: dateJoined,
      status: status || 'Active',
      avatarColor: avatarColor || '#0284C7',
      salary: {
        basic,
        allowances,
        bonuses,
        deductions,
      },
      salaryConfig: {
        basicSalary: basic,
        allowances,
        bonuses,
        deductions,
      },
    };

    const updated = [...employees, newEmployee];
    await saveEmployees(updated);

    return newEmployee;
  };

  /**
   * Update existing employee details (HR only)
   */
  const updateEmployee = async (id, updatedFields, userRole = USER_ROLES.HR_ADMIN) => {
    if (userRole !== USER_ROLES.HR_ADMIN) {
      throw new Error('Permission Denied: Employees cannot edit official records.');
    }

    const index = employees.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error('Employee not found.');
    }

    // If email is changed, validate it
    if (updatedFields.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updatedFields.email.trim())) {
        throw new Error('Invalid email address format.');
      }
      const duplicateEmail = employees.some(
        (e) => e.id !== id && e.email.toLowerCase() === updatedFields.email.trim().toLowerCase()
      );
      if (duplicateEmail) {
        throw new Error('Email is already used by another employee.');
      }
    }

    // Validate salary if updating
    const salarySource = updatedFields.salaryConfig || updatedFields.salary;
    let newSalary = employees[index].salary;
    let newSalaryConfig = employees[index].salaryConfig;

    if (salarySource) {
      const basic = Number(salarySource.basic ?? salarySource.basicSalary ?? 0);
      const allowances = Number(salarySource.allowances ?? 0);
      const bonuses = Number(salarySource.bonuses ?? 0);
      const deductions = Number(salarySource.deductions ?? 0);

      if (basic < 0 || allowances < 0 || bonuses < 0 || deductions < 0) {
        throw new Error('Salary values cannot be negative.');
      }
      newSalary = { basic, allowances, bonuses, deductions };
      newSalaryConfig = { basicSalary: basic, allowances, bonuses, deductions };
    }

    const title = updatedFields.title || updatedFields.designation || employees[index].title;
    const joinDate = updatedFields.joinDate || updatedFields.joiningDate || employees[index].joinDate;

    const updatedEmployee = {
      ...employees[index],
      ...updatedFields,
      title,
      designation: title,
      joinDate,
      joiningDate: joinDate,
      salary: newSalary,
      salaryConfig: newSalaryConfig,
      // Ensure ID cannot be changed to preserve attendance/leave references
      id: employees[index].id,
    };

    const updated = [...employees];
    updated[index] = updatedEmployee;
    await saveEmployees(updated);

    return updatedEmployee;
  };

  /**
   * Get employee by ID
   */
  const getEmployeeById = useCallback(
    (id) => {
      return employees.find((e) => e.id === id) || null;
    },
    [employees]
  );

  /**
   * Search and filter employees
   */
  const searchEmployees = useCallback(
    (query = '', statusFilter = 'ALL') => {
      const q = query.trim().toLowerCase();
      return employees.filter((emp) => {
        // Status filter
        if (statusFilter !== 'ALL' && emp.status.toUpperCase() !== statusFilter.toUpperCase()) {
          return false;
        }
        // Search query filter (matches name, department, title, email, or id)
        if (!q) return true;
        return (
          emp.name.toLowerCase().includes(q) ||
          emp.department.toLowerCase().includes(q) ||
          (emp.title && emp.title.toLowerCase().includes(q)) ||
          emp.email.toLowerCase().includes(q) ||
          emp.id.toLowerCase().includes(q)
        );
      });
    },
    [employees]
  );

  const activeEmployees = employees.filter((e) => e.status !== 'Inactive');
  const inactiveEmployees = employees.filter((e) => e.status === 'Inactive');

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        activeEmployees,
        inactiveEmployees,
        isLoading,
        addEmployee,
        updateEmployee,
        getEmployeeById,
        searchEmployees,
        resetEmployeeData,
        totalEmployees: employees.length,
        activeEmployeesCount: activeEmployees.length,
        inactiveEmployeesCount: inactiveEmployees.length,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployees = () => useContext(EmployeeContext);
