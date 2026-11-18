import React, { createContext, useContext, useState } from 'react';
import { USER_ROLES, VISARTECH_EMPLOYEES, VISARTECH_HR_ADMIN } from '../constants/company';

const DEMO_USERS = {
  [USER_ROLES.HR_ADMIN]: {
    ...VISARTECH_HR_ADMIN,
    company: 'Visartech',
    status: 'Active',
  },
  [USER_ROLES.EMPLOYEE]: {
    ...VISARTECH_EMPLOYEES[0],
    company: 'Visartech',
    status: 'Active',
  },
};

export const AuthContext = createContext({
  user: null,
  role: USER_ROLES.HR_ADMIN,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  switchRole: () => {},
  allEmployees: VISARTECH_EMPLOYEES,
});

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(USER_ROLES.HR_ADMIN);
  const [user, setUser] = useState(DEMO_USERS[USER_ROLES.HR_ADMIN]);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = (selectedRole = USER_ROLES.HR_ADMIN) => {
    setRole(selectedRole);
    setUser(DEMO_USERS[selectedRole]);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const switchRole = (newRole) => {
    setRole(newRole);
    setUser(DEMO_USERS[newRole]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        login,
        logout,
        switchRole,
        isHrAdmin: role === USER_ROLES.HR_ADMIN,
        isEmployee: role === USER_ROLES.EMPLOYEE,
        allEmployees: VISARTECH_EMPLOYEES,
        hrAdmin: VISARTECH_HR_ADMIN,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
