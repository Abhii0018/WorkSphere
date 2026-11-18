/**
 * WorkSphere - Centralized Employee Seeds
 * Anchored to the 6 Visartech employees emp-101 through emp-106.
 */

import { VISARTECH_EMPLOYEES } from './company.js';
import { normalizeSalaryStructure } from '../utils/payroll.js';

export const generateSampleEmployees = () => {
  return VISARTECH_EMPLOYEES.map((emp) => {
    const normSalary = normalizeSalaryStructure(emp.salary);

    return {
      ...emp,
      title: emp.title,
      designation: emp.title,
      joinDate: emp.joinDate || '2023-01-15',
      joiningDate: emp.joinDate || '2023-01-15',
      salary: normSalary,
      salaryConfig: normSalary,
    };
  });
};

export const SAMPLE_EMPLOYEES = generateSampleEmployees();
