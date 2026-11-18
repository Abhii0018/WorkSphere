import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import theme, { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../src/constants/theme.js';
import { COMPANY_INFO, USER_ROLES } from '../../src/constants/company.js';
import { useAuth } from '../../src/hooks/useAuth.js';
import { useTasks } from '../../src/context/TaskContext.jsx';
import { useEmployees } from '../../src/context/EmployeeContext.jsx';
import {
  TaskCard,
  TaskFormModal,
  TaskDetailModal,
  PerformanceStatsCard,
  Badge,
} from '../../src/components/index.js';
import { TASK_STATUS, TASK_PRIORITY } from '../../src/utils/tasks.js';

export default function TasksScreen() {
  const router = useRouter();
  const { user, isHrAdmin, switchRole } = useAuth();
  const { employees } = useEmployees();
  const {
    tasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getTasksForEmployee,
    getEmployeeTaskStats,
    getHrTaskStats,
    resetTaskData,
  } = useTasks();

  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'To Do' | 'In Progress' | 'Completed' | 'OVERDUE'
  const [priorityFilter, setPriorityFilter] = useState('ALL'); // 'ALL' | 'Low' | 'Medium' | 'High' | 'Urgent'
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');

  const [selectedTask, setSelectedTask] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const [formModalVisible, setFormModalVisible] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const employeeId = user?.id || 'emp-101';

  // Overall metrics depending on role
  const stats = isHrAdmin
    ? getHrTaskStats()
    : getEmployeeTaskStats(employeeId);

  // Base task list
  const baseTasks = isHrAdmin ? tasks : getTasksForEmployee(employeeId);

  // Filter tasks
  const filteredTasks = baseTasks.filter((t) => {
    // Status filter
    if (statusFilter === 'OVERDUE') {
      if (!t.isOverdue) return false;
    } else if (statusFilter !== 'ALL' && t.status !== statusFilter) {
      return false;
    }

    // Priority filter
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) {
      return false;
    }

    // Assignee filter (HR only)
    if (isHrAdmin && assigneeFilter !== 'ALL' && t.assignedTo !== assigneeFilter) {
      return false;
    }

    return true;
  });

  const handleRoleToggle = () => {
    const nextRole = isHrAdmin ? USER_ROLES.EMPLOYEE : USER_ROLES.HR_ADMIN;
    switchRole(nextRole);
  };

  const handleOpenDetail = (task) => {
    setSelectedTask(task);
    setDetailModalVisible(true);
  };

  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setFormModalVisible(true);
  };

  const handleOpenEditModal = (task) => {
    setDetailModalVisible(false);
    setTaskToEdit(task);
    setFormModalVisible(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (taskToEdit) {
        await updateTask(taskToEdit.id, taskData);
        Alert.alert('Success', 'Task updated successfully.');
      } else {
        await createTask({
          ...taskData,
          assignedBy: user?.name || 'Elena Rostova',
        });
        Alert.alert('Success', 'New task assigned successfully.');
      }
      setFormModalVisible(false);
      setTaskToEdit(null);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus, completionNote) => {
    try {
      await updateTaskStatus(taskId, newStatus, completionNote);
      // Update local selectedTask
      setSelectedTask((prev) =>
        prev && prev.id === taskId
          ? {
              ...prev,
              status: newStatus,
              completionNote: completionNote || prev.completionNote,
              completedAt: newStatus === TASK_STATUS.COMPLETED ? new Date().toISOString() : null,
              isOverdue: false,
            }
          : prev
      );
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setDetailModalVisible(false);
      Alert.alert('Success', 'Task deleted.');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleResetSampleTasks = () => {
    Alert.alert(
      'Reset Sample Tasks',
      'This will restore all default tasks across the 6 Visartech employees.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetTaskData();
            Alert.alert('Reset Complete', 'Task records restored to defaults.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={styles.screenTitle}>
              {isHrAdmin ? 'Task Management' : 'My Tasks & Performance'}
            </Text>
            <Text style={styles.subtitle}>
              {COMPANY_INFO.name} • {isHrAdmin ? 'Company-wide' : user?.name}
            </Text>
          </View>
          <Badge
            label={isHrAdmin ? 'HR Admin' : 'Employee'}
            variant={isHrAdmin ? 'primary' : 'info'}
            size="sm"
          />
        </View>

        {/* Demo Switcher Pill */}
        <View style={styles.roleBar}>
          <Text style={styles.roleBarText}>
            Logged in as <Text style={styles.bold}>{user?.name}</Text>
          </Text>
          <TouchableOpacity style={styles.roleToggleBtn} onPress={handleRoleToggle}>
            <Ionicons name="swap-horizontal" size={14} color={COLORS.primary} />
            <Text style={styles.roleToggleText}>Switch Role</Text>
          </TouchableOpacity>
        </View>

        {/* Performance & Metrics Card */}
        <PerformanceStatsCard
          stats={stats}
          title={isHrAdmin ? 'Company Task Performance' : 'My Performance Overview'}
          subtitle={isHrAdmin ? 'Aggregated metrics for all 6 employees' : 'Track your delivery speed and milestones'}
        />

        {/* Action Button for HR: Assign New Task */}
        {isHrAdmin && (
          <TouchableOpacity style={styles.createTaskBtn} onPress={handleOpenCreateModal}>
            <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
            <Text style={styles.createTaskBtnText}>Assign New Task</Text>
          </TouchableOpacity>
        )}

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {/* Status Pills */}
            {['ALL', TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.COMPLETED, 'OVERDUE'].map(
              (status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setStatusFilter(status)}
                  style={[
                    styles.filterPill,
                    statusFilter === status && styles.filterPillActive,
                    status === 'OVERDUE' && statusFilter === status && styles.filterPillOverdue,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      statusFilter === status && styles.filterPillTextActive,
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              )
            )}

            <View style={styles.filterDivider} />

            {/* Priority Pills */}
            {['ALL', TASK_PRIORITY.URGENT, TASK_PRIORITY.HIGH, TASK_PRIORITY.MEDIUM, TASK_PRIORITY.LOW].map(
              (prio) => (
                <TouchableOpacity
                  key={prio}
                  onPress={() => setPriorityFilter(prio)}
                  style={[
                    styles.filterPill,
                    priorityFilter === prio && styles.filterPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      priorityFilter === prio && styles.filterPillTextActive,
                    ]}
                  >
                    {prio === 'ALL' ? 'All Priority' : prio}
                  </Text>
                </TouchableOpacity>
              )
            )}

            {/* Assignee Filter (HR Only) */}
            {isHrAdmin && (
              <>
                <View style={styles.filterDivider} />
                <TouchableOpacity
                  onPress={() => setAssigneeFilter('ALL')}
                  style={[
                    styles.filterPill,
                    assigneeFilter === 'ALL' && styles.filterPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      assigneeFilter === 'ALL' && styles.filterPillTextActive,
                    ]}
                  >
                    All Staff
                  </Text>
                </TouchableOpacity>
                {employees.map((emp) => (
                  <TouchableOpacity
                    key={emp.id}
                    onPress={() => setAssigneeFilter(emp.id)}
                    style={[
                      styles.filterPill,
                      assigneeFilter === emp.id && styles.filterPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        assigneeFilter === emp.id && styles.filterPillTextActive,
                      ]}
                    >
                      {emp.name.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </ScrollView>
        </View>

        {/* Task List */}
        <View style={styles.listSection}>
          <View style={styles.listHeaderRow}>
            <Text style={styles.listTitle}>
              {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'}
            </Text>
            {isHrAdmin && (
              <TouchableOpacity onPress={handleResetSampleTasks}>
                <Text style={styles.resetText}>Reset Sample</Text>
              </TouchableOpacity>
            )}
          </View>

          {filteredTasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkbox-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>No Tasks Found</Text>
              <Text style={styles.emptySubtitle}>No tasks match your selected filter criteria.</Text>
            </View>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={() => handleOpenDetail(task)}
                showAssignee={isHrAdmin}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Task Detail Modal */}
      <TaskDetailModal
        visible={detailModalVisible}
        task={selectedTask}
        onClose={() => setDetailModalVisible(false)}
        isHrUser={isHrAdmin}
        onUpdateStatus={handleUpdateStatus}
        onEdit={(task) => handleOpenEditModal(task)}
        onDelete={handleDeleteTask}
      />

      {/* Task Create/Edit Modal */}
      <TaskFormModal
        visible={formModalVisible}
        task={taskToEdit}
        employees={employees}
        onClose={() => {
          setFormModalVisible(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: 8,
  },
  backBtn: {
    padding: 6,
    borderRadius: RADIUS.md,
  },
  headerTitleBox: {
    flex: 1,
  },
  screenTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  roleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.xs,
  },
  roleBarText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  bold: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  roleToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  createTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.xs,
  },
  createTaskBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  filterSection: {
    marginVertical: SPACING.xs,
  },
  filterScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterPillOverdue: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  filterDivider: {
    width: 1,
    height: 18,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  listSection: {
    marginTop: SPACING.sm,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  listTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resetText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
