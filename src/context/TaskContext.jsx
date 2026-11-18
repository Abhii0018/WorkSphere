import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateSampleTasks } from '../constants/sampleTasks.js';
import { TASK_STATUS, TASK_PRIORITY, isTaskOverdue, calculateCompletionRate } from '../utils/tasks.js';
import { taskApi } from '../services/api.js';

const STORAGE_KEY = '@worksphere_tasks_v1';

export const TaskContext = createContext({
  tasks: [],
  isLoading: true,
  createTask: async () => {},
  updateTask: async () => {},
  updateTaskStatus: async () => {},
  deleteTask: async () => {},
  getTasksForEmployee: () => [],
  getAllTasks: () => [],
  getEmployeeTaskStats: () => ({}),
  getHrTaskStats: () => ({}),
  resetTaskData: async () => {},
});

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from MongoDB Atlas with fallback to AsyncStorage
  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);

      try {
        const res = await taskApi.getAll();
        if (res && res.success && res.data && res.data.length > 0) {
          setTasks(res.data);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
          return;
        }
      } catch (apiErr) {
        console.warn('[TaskContext] MongoDB API unavailable, falling back to local storage:', apiErr.message);
      }

      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        setTasks(JSON.parse(savedData));
      } else {
        const initial = generateSampleTasks();
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        setTasks(initial);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setTasks(generateSampleTasks());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const saveTasks = async (updatedTasks) => {
    try {
      setTasks(updatedTasks);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  };

  /**
   * Reset tasks back to sample defaults
   */
  const resetTaskData = async () => {
    try {
      setIsLoading(true);
      const initial = generateSampleTasks();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      setTasks(initial);
    } catch (error) {
      console.error('Failed to reset tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create and assign a new task (HR action)
   */
  const createTask = async ({
    title,
    description,
    assignedTo,
    assignedToName,
    department,
    priority = TASK_PRIORITY.MEDIUM,
    dueDate,
  }) => {
    if (!title || title.trim().length === 0) {
      return { success: false, error: 'Task title is required.' };
    }
    if (!assignedTo) {
      return { success: false, error: 'Please assign the task to an employee.' };
    }
    if (!dueDate) {
      return { success: false, error: 'Due date is required.' };
    }

    const newTask = {
      id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: title.trim(),
      description: description?.trim() || 'No detailed description provided.',
      assignedTo,
      assignedToName: assignedToName || 'Employee',
      department: department || 'Engineering',
      assignedBy: 'Elena Rostova (Lead HR Manager)',
      priority: priority || TASK_PRIORITY.MEDIUM,
      dueDate,
      status: TASK_STATUS.TODO,
      createdAt: new Date().toISOString(),
      completedAt: null,
      completionNote: null,
    };

    const updated = [newTask, ...tasks];
    await saveTasks(updated);

    // Sync to MongoDB
    try {
      await taskApi.create({
        title: newTask.title,
        description: newTask.description,
        assignedTo: newTask.assignedTo,
        priority: newTask.priority,
        dueDate: newTask.dueDate,
        category: newTask.department,
      });
    } catch (apiErr) {
      console.warn('[TaskContext] Sync task to MongoDB failed:', apiErr.message);
    }

    return {
      success: true,
      message: `Task assigned to ${newTask.assignedToName} successfully.`,
      task: newTask,
    };
  };

  /**
   * Edit task details (HR action)
   */
  const updateTask = async (taskId, updatedFields) => {
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) {
      return { success: false, error: 'Task not found.' };
    }

    const updatedTask = {
      ...tasks[index],
      ...updatedFields,
    };

    const updated = [...tasks];
    updated[index] = updatedTask;
    await saveTasks(updated);

    // Sync to MongoDB
    try {
      await taskApi.updateStatus(taskId, newStatus);
    } catch (apiErr) {
      console.warn('[TaskContext] Sync task status to MongoDB failed:', apiErr.message);
    }

    return {
      success: true,
      message: 'Task updated successfully.',
      task: updatedTask,
    };
  };

  /**
   * Update task status (Employee or HR action)
   */
  const updateTaskStatus = async (taskId, newStatus, completionNote = null) => {
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) {
      return { success: false, error: 'Task not found.' };
    }

    const currentTask = tasks[index];
    const isNowCompleted = newStatus === TASK_STATUS.COMPLETED;

    const updatedTask = {
      ...currentTask,
      status: newStatus,
      completedAt: isNowCompleted ? new Date().toISOString() : null,
      completionNote: isNowCompleted
        ? completionNote?.trim() || 'Marked completed by assignee.'
        : currentTask.completionNote,
    };

    const updated = [...tasks];
    updated[index] = updatedTask;
    await saveTasks(updated);

    // Sync to MongoDB
    try {
      await taskApi.updateStatus(taskId, newStatus);
    } catch (apiErr) {
      console.warn('[TaskContext] Sync task status to MongoDB failed:', apiErr.message);
    }

    return {
      success: true,
      message: `Task status updated to "${newStatus}".`,
      task: updatedTask,
    };
  };

  /**
   * Delete task (HR action)
   */
  const deleteTask = async (taskId) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    await saveTasks(updated);
    return { success: true, message: 'Task deleted successfully.' };
  };

  /**
   * Get tasks for specific employee with optional status filter
   */
  const getTasksForEmployee = useCallback(
    (employeeId, statusFilter = 'ALL') => {
      return tasks.filter((t) => {
        if (t.assignedTo !== employeeId) return false;
        if (statusFilter === 'ALL') return true;
        if (statusFilter === 'OVERDUE') {
          return isTaskOverdue(t.dueDate, t.status);
        }
        return t.status.toUpperCase() === statusFilter.toUpperCase();
      });
    },
    [tasks]
  );

  /**
   * Get all tasks company-wide (HR view) with multi-criteria filtering
   */
  const getAllTasks = useCallback(
    ({ employeeId = 'ALL', priority = 'ALL', status = 'ALL' } = {}) => {
      return tasks.filter((t) => {
        if (employeeId !== 'ALL' && t.assignedTo !== employeeId) return false;
        if (priority !== 'ALL' && t.priority.toUpperCase() !== priority.toUpperCase()) return false;
        if (status !== 'ALL') {
          if (status === 'OVERDUE') {
            return isTaskOverdue(t.dueDate, t.status);
          }
          return t.status.toUpperCase() === status.toUpperCase();
        }
        return true;
      });
    },
    [tasks]
  );

  /**
   * Performance overview metrics for a specific employee
   */
  const getEmployeeTaskStats = useCallback(
    (employeeId) => {
      const empTasks = tasks.filter((t) => t.assignedTo === employeeId);
      const total = empTasks.length;
      const completed = empTasks.filter((t) => t.status === TASK_STATUS.COMPLETED).length;
      const inProgress = empTasks.filter((t) => t.status === TASK_STATUS.IN_PROGRESS).length;
      const toDo = empTasks.filter((t) => t.status === TASK_STATUS.TODO).length;
      const overdue = empTasks.filter((t) => isTaskOverdue(t.dueDate, t.status)).length;
      const pending = inProgress + toDo;
      const completionRate = calculateCompletionRate(completed, total);

      return {
        totalTasks: total,
        completedTasks: completed,
        inProgressTasks: inProgress,
        toDoTasks: toDo,
        pendingTasks: pending,
        overdueTasks: overdue,
        completionRate,
      };
    },
    [tasks]
  );

  /**
   * Company-wide task & performance statistics for HR
   */
  const getHrTaskStats = useCallback(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === TASK_STATUS.COMPLETED).length;
    const inProgress = tasks.filter((t) => t.status === TASK_STATUS.IN_PROGRESS).length;
    const toDo = tasks.filter((t) => t.status === TASK_STATUS.TODO).length;
    const overdue = tasks.filter((t) => isTaskOverdue(t.dueDate, t.status)).length;
    const pending = inProgress + toDo;
    const completionRate = calculateCompletionRate(completed, total);

    return {
      totalTasks: total,
      completedTasks: completed,
      inProgressTasks: inProgress,
      toDoTasks: toDo,
      pendingTasks: pending,
      overdueTasks: overdue,
      completionRate,
    };
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        createTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        getTasksForEmployee,
        getAllTasks,
        getEmployeeTaskStats,
        getHrTaskStats,
        resetTaskData,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
