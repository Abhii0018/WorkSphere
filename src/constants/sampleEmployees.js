/**
 * WorkSphere - Centralized Employee Seeds
 * Anchored to the 6 Visartech employees emp-101 through emp-106.
 */

import { VISARTECH_EMPLOYEES } from './company.js';

export const generateSampleEmployees = () => {
  return VISARTECH_EMPLOYEES.map((emp) => {
    const basic = emp.salary?.basic || 7000;
    const allowances = emp.salary?.allowances || 800;
    const bonuses = emp.salary?.bonuses || 500;
    const deductions = emp.salary?.deductions || 600;

    return {
      ...emp,
      title: emp.title,
      designation: emp.title,
      joinDate: emp.joinDate || '2023-01-15',
      joiningDate: emp.joinDate || '2023-01-15',
      salary: emp.salary,
      salaryConfig: {
        basicSalary: basic,
        allowances,
        bonuses,
        deductions,
      },
    };
  });
};

export const SAMPLE_EMPLOYEES = generateSampleEmployees();
