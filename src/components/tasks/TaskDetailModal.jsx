import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';
import { Badge, Button, Input, Card, Avatar } from '../common';
import { TASK_STATUS, PRIORITY_COLORS, isTaskOverdue } from '../../utils/tasks';
import { formatChicagoDate } from '../../utils/attendance';
import { useTasks } from '../../context/TaskContext';

export const TaskDetailModal = ({
  task,
  visible,
  onClose,
  onEditPress,
  isHrAdmin = false,
}) => {
  const { updateTaskStatus, deleteTask } = useTasks();

  const [completionNote, setCompletionNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!task) return null;

  const isOverdue = isTaskOverdue(task.dueDate, task.status);
  const priorityColor = PRIORITY_COLORS[task.priority] || theme.colors.primary;

  const handleStatusChange = async (newStatus) => {
    if (newStatus === TASK_STATUS.COMPLETED && !showNoteInput && !task.completionNote) {
      setShowNoteInput(true);
      return;
    }

    setLoading(true);
    const result = await updateTaskStatus(task.id, newStatus, completionNote);
    setLoading(false);
    setShowNoteInput(false);
    setCompletionNote('');

    if (result.success) {
      Alert.alert('Status Updated', result.message, [{ text: 'OK', onPress: onClose }]);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to remove this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTask(task.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <View style={styles.priorityRow}>
                <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
                <Text style={[styles.priorityText, { color: priorityColor }]}>
                  {task.priority} Priority
                </Text>
                {isOverdue && (
                  <Badge label="OVERDUE" variant="danger" size="sm" style={{ marginLeft: 6 }} />
                )}
              </View>
              <Text style={styles.title}>{task.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Metadata Card */}
            <Card style={styles.metaCard} variant="flat" padding="md">
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Assigned To:</Text>
                <View style={styles.assigneeInline}>
                  <Avatar name={task.assignedToName} size={20} />
                  <Text style={styles.metaVal}>{task.assignedToName} ({task.assignedTo})</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Due Date:</Text>
                <Text style={[styles.metaVal, isOverdue && { color: theme.colors.danger, fontWeight: '700' }]}>
                  {formatChicagoDate(task.dueDate)}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Current Status:</Text>
                <Badge
                  label={task.status}
                  variant={
                    task.status === 'Completed'
                      ? 'success'
                      : task.status === 'In Progress'
                      ? 'info'
                      : 'neutral'
                  }
                  size="sm"
                />
              </View>
            </Card>

            {/* Description */}
            <Text style={styles.sectionHeading}>TASK DESCRIPTION</Text>
            <Card style={styles.descCard} variant="outlined" padding="md">
              <Text style={styles.descText}>{task.description}</Text>
            </Card>

            {/* Completion Note (if present) */}
            {task.completionNote && (
              <View style={{ marginTop: theme.spacing.md }}>
                <Text style={styles.sectionHeading}>COMPLETION NOTE</Text>
                <Card style={styles.noteCard} variant="flat" padding="md">
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Ionicons name="checkmark-done-circle" size={18} color={theme.colors.success} style={{ marginRight: 6 }} />
                    <Text style={styles.completedAtText}>
                      Completed on {formatChicagoDate(task.completedAt)}
                    </Text>
                  </View>
                  <Text style={styles.noteText}>&ldquo;{task.completionNote}&rdquo;</Text>
                </Card>
              </View>
            )}

            {/* Status Switcher Section */}
            <View style={styles.statusSection}>
              <Text style={styles.sectionHeading}>UPDATE TASK STATUS</Text>
              <View style={styles.statusTabs}>
                {[TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.COMPLETED].map((st) => {
                  const isCurrent = task.status === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      style={[styles.statusTabBtn, isCurrent && styles.statusTabBtnActive]}
                      onPress={() => handleStatusChange(st)}
                    >
                      <Text style={[styles.statusTabText, isCurrent && styles.statusTabTextActive]}>
                        {st}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Completion Note Prompt */}
              {showNoteInput && (
                <View style={styles.notePromptBox}>
                  <Input
                    label="Add optional completion note:"
                    placeholder="e.g., Code reviewed and merged into main..."
                    value={completionNote}
                    onChangeText={setCompletionNote}
                    multiline
                  />
                  <Button
                    title="Confirm Completion"
                    onPress={() => handleStatusChange(TASK_STATUS.COMPLETED)}
                    loading={loading}
                    variant="primary"
                    size="md"
                  />
                </View>
              )}
            </View>

            {/* HR Actions: Edit and Delete */}
            {isHrAdmin && (
              <View style={styles.hrActionsRow}>
                <Button
                  title="Edit Task"
                  onPress={() => {
                    onClose();
                    onEditPress && onEditPress(task);
                  }}
                  variant="outline"
                  size="md"
                  leftIcon={<Ionicons name="pencil-outline" size={16} color={theme.colors.primary} />}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Delete"
                  onPress={handleDelete}
                  variant="outline"
                  size="md"
                  leftIcon={<Ionicons name="trash-outline" size={16} color={theme.colors.danger} />}
                  style={{ flex: 1, borderColor: theme.colors.danger }}
                  textStyle={{ color: theme.colors.danger }}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </View>
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
    maxHeight: '90%',
    ...theme.shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    fontSize: theme.typography.size.xs - 1,
    fontWeight: theme.typography.weight.bold,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: theme.typography.size.md + 1,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
    lineHeight: 22,
  },
  closeBtn: {
    padding: theme.spacing.xs,
  },
  scrollBody: {
    paddingBottom: theme.spacing.xl,
  },
  metaCard: {
    backgroundColor: theme.colors.surfaceSubtle,
    marginBottom: theme.spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  metaLabel: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weight.medium,
  },
  metaVal: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textPrimary,
  },
  assigneeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  descCard: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  descText: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
  noteCard: {
    backgroundColor: theme.colors.successSubtle,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: theme.spacing.md,
  },
  completedAtText: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.success,
  },
  noteText: {
    fontSize: theme.typography.size.xs + 1,
    color: theme.colors.textPrimary,
    fontStyle: 'italic',
  },
  statusSection: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  statusTabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.md,
    padding: 3,
  },
  statusTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  statusTabBtnActive: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  statusTabText: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.textSecondary,
  },
  statusTabTextActive: {
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.primary,
  },
  notePromptBox: {
    marginTop: theme.spacing.md,
  },
  hrActionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
});

export default TaskDetailModal;
