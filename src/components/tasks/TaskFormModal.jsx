import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';
import { Button, Input } from '../common';
import { TASK_PRIORITY, TASK_STATUS } from '../../utils/tasks';
import { useTasks } from '../../context/TaskContext';
import { getChicagoDateKey } from '../../utils/attendance';

export const TaskFormModal = ({
  visible,
  onClose,
  initialTask = null,
  employees = [],
}) => {
  const { createTask, updateTask } = useTasks();
  const isEditing = !!initialTask;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState(TASK_PRIORITY.MEDIUM);
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setAssignedTo(initialTask.assignedTo || '');
      setPriority(initialTask.priority || TASK_PRIORITY.MEDIUM);
      setDueDate(initialTask.dueDate || '');
    } else {
      setTitle('');
      setDescription('');
      setAssignedTo(employees[0]?.id || 'emp-101');
      setPriority(TASK_PRIORITY.MEDIUM);
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setDueDate(getChicagoDateKey(d));
    }
  }, [initialTask, visible, employees]);

  const handleSubmit = async () => {
    setLoading(true);
    const assignedEmp = employees.find((e) => e.id === assignedTo);

    let result;
    if (isEditing) {
      result = await updateTask(initialTask.id, {
        title,
        description,
        assignedTo,
        assignedToName: assignedEmp?.name || initialTask.assignedToName,
        department: assignedEmp?.department || initialTask.department,
        priority,
        dueDate,
      });
    } else {
      result = await createTask({
        title,
        description,
        assignedTo,
        assignedToName: assignedEmp?.name || 'Staff Member',
        department: assignedEmp?.department || 'Engineering',
        priority,
        dueDate,
      });
    }
    setLoading(false);

    if (result.success) {
      Alert.alert(isEditing ? 'Task Updated' : 'Task Created', result.message, [
        { text: 'OK', onPress: onClose },
      ]);
    } else {
      Alert.alert('Validation Error', result.error);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {isEditing ? 'Edit Task Details' : 'Create & Assign Task'}
              </Text>
              <Text style={styles.subtitle}>Visartech Sprint Milestone Management</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Task Title */}
            <Input
              label="Task Title *"
              placeholder="e.g., Integrate JWT refresh interceptor"
              value={title}
              onChangeText={setTitle}
            />

            {/* Description */}
            <Input
              label="Detailed Instructions / Acceptance Criteria"
              placeholder="Describe deliverables and testing notes..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              inputStyle={{ height: 75 }}
            />

            {/* Assignee Selection */}
            <Text style={styles.fieldLabel}>Assign To Team Member *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.assigneesRow}
            >
              {employees.map((emp) => {
                const isSelected = assignedTo === emp.id;
                return (
                  <TouchableOpacity
                    key={emp.id}
                    style={[styles.assigneeChip, isSelected && styles.assigneeChipActive]}
                    onPress={() => setAssignedTo(emp.id)}
                  >
                    <Text style={[styles.assigneeChipText, isSelected && styles.assigneeChipTextActive]}>
                      {emp.name}
                    </Text>
                    <Text style={[styles.assigneeChipDept, isSelected && { color: '#FFFFFF' }]}>
                      {emp.id}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Priority Selection */}
            <Text style={styles.fieldLabel}>Priority Level</Text>
            <View style={styles.priorityRow}>
              {[TASK_PRIORITY.HIGH, TASK_PRIORITY.MEDIUM, TASK_PRIORITY.LOW].map((p) => {
                const isSelected = priority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityBtn,
                      isSelected && styles.priorityBtnActive,
                      isSelected && p === 'High' && { backgroundColor: theme.colors.danger },
                      isSelected && p === 'Medium' && { backgroundColor: theme.colors.warning },
                      isSelected && p === 'Low' && { backgroundColor: theme.colors.success },
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text style={[styles.priorityBtnText, isSelected && { color: '#FFFFFF', fontWeight: '700' }]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Due Date */}
            <Input
              label="Due Date (YYYY-MM-DD) *"
              placeholder="2026-11-30"
              value={dueDate}
              onChangeText={setDueDate}
              leftIcon={<Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} />}
            />

            {/* Submit */}
            <Button
              title={isEditing ? 'Save Changes' : 'Assign Task'}
              onPress={handleSubmit}
              loading={loading}
              variant="primary"
              size="lg"
              style={styles.submitBtn}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    maxHeight: '92%',
    ...theme.shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.size.lg + 1,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: theme.spacing.xs,
  },
  scrollBody: {
    paddingBottom: theme.spacing.xxxl,
  },
  fieldLabel: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.textPrimary,
    marginBottom: 6,
    marginTop: 4,
  },
  assigneesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  assigneeChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  assigneeChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  assigneeChipText: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textPrimary,
  },
  assigneeChipTextActive: {
    color: '#FFFFFF',
  },
  assigneeChipDept: {
    fontSize: 9,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: theme.spacing.md,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  priorityBtnActive: {
    borderWidth: 0,
  },
  priorityBtnText: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.textSecondary,
  },
  submitBtn: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
});

export default TaskFormModal;
