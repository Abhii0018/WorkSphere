/**
 * WorkSphere - MongoDB Backend API Client
 * Connects the React Native frontend to the Express + MongoDB Atlas backend
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default host configurations
const LAN_IP = '10.224.16.129';
const PORT = 5001;

// Auto-select base URL depending on platform
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    // 10.224.16.129 works for both physical Android devices on the Wi-Fi and emulators
    return `http://${LAN_IP}:${PORT}/api`;
  } else if (Platform.OS === 'ios') {
    return `http://${LAN_IP}:${PORT}/api`;
  }
  return `http://localhost:${PORT}/api`;
};

export const API_BASE_URL = getBaseUrl();

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  try {
    const token = await AsyncStorage.getItem('@worksphere_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }

  const config = {
    ...options,
    headers,
  };

  try {
    // 6 second timeout so UI responds swiftly even if network is slow
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    config.signal = controller.signal;

    const res = await fetch(url, config);
    clearTimeout(timeoutId);

    const data = await res.json();
    return data;
  } catch (error) {
    console.warn(`[WorkSphere API] Request failed for ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => request(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: (endpoint, body, options) => request(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),
  delete: (endpoint, options) => request(endpoint, { method: 'DELETE', ...options }),
};

// ==========================================
// Specialized API Services for Modules
// ==========================================

export const employeeApi = {
  getAll: (params) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get(`/employees${query}`);
  },
  getById: (id) => api.get(`/employees/${id}`),
  create: (employeeData) => api.post('/employees', employeeData),
  update: (id, updates) => api.put(`/employees/${id}`, updates),
};

export const attendanceApi = {
  getToday: (date) => api.get(`/attendance/today${date ? `?date=${date}` : ''}`),
  getEmployeeHistory: (employeeId) => api.get(`/attendance/employee/${employeeId}`),
  checkIn: (employeeId) => api.post('/attendance/check-in', { employeeId }),
  checkOut: (employeeId) => api.post('/attendance/check-out', { employeeId }),
};

export const leaveApi = {
  getEmployeeLeaves: (employeeId) => api.get(`/leaves/employee/${employeeId}`),
  getAllLeaves: () => api.get('/leaves/all'),
  apply: (leaveData) => api.post('/leaves', leaveData),
  updateStatus: (id, statusData) => api.put(`/leaves/${id}/status`, statusData),
};

export const taskApi = {
  getAll: (params) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get(`/tasks${query}`);
  },
  getEmployeeTasks: (employeeId) => api.get(`/tasks/employee/${employeeId}`),
  create: (taskData) => api.post('/tasks', taskData),
  updateStatus: (id, status) => api.put(`/tasks/${id}/status`, { status }),
  updatePerformance: (id, performanceRating, feedback) =>
    api.put(`/tasks/${id}/performance`, { performanceRating, feedback }),
};

export const payrollApi = {
  getAll: (params) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return api.get(`/payroll${query}`);
  },
  getSummary: (month) => api.get(`/payroll/summary${month ? `?month=${month}` : ''}`),
  getEmployeePayroll: (employeeId) => api.get(`/payroll/employee/${employeeId}`),
  generateMonthly: (month) => api.post('/payroll/generate', { month }),
  updateStatus: (id, status, paymentMethod) => api.put(`/payroll/${id}/status`, { status, paymentMethod }),
  updateStructure: (employeeId, structure) => api.put(`/payroll/structure/${employeeId}`, structure),
};

export default api;
