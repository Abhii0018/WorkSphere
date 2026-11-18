import React, { createContext, useContext, useState } from 'react';
import { USER_ROLES } from '../constants/company';

const DEMO_USERS = {
  [USER_ROLES.HR_ADMIN]: {
    id: 'hr-001',
    name: 'Elena Rostova',
    email: 'elena.rostova@visartech.com',
    role: USER_ROLES.HR_ADMIN,
    department: 'People & Operations',
    title: 'Lead HR Manager',
    company: 'Visartech',
    status: 'Active',
  },
  [USER_ROLES.EMPLOYEE]: {
    id: 'emp-101',
    name: 'Alex Turner',
    email: 'alex.turner@visartech.com',
    role: USER_ROLES.EMPLOYEE,
    department: 'Digital Solutions Lab',
    title: 'Senior Software Engineer',
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
});

export const AuthProvider = ({ children }) => {
  // Pre-seed with default logged in demo user for immediate mobile testing
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
