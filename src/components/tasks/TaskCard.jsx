import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';
import { Card, Badge, Avatar } from '../common';
import { PRIORITY_COLORS, STATUS_COLORS, isTaskOverdue } from '../../utils/tasks';
import { formatChicagoDate } from '../../utils/attendance';

export const TaskCard = ({ task, onPress, showAssignee = true, style }) => {
  if (!task) return null;

  const isOverdue = isTaskOverdue(task.dueDate, task.status);
  const priorityColor = PRIORITY_COLORS[task.priority] || theme.colors.primary;

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'info';
      default:
        return 'neutral';
    }
  };

  return (
    <Card
      style={[styles.card, style]}
      variant="elevated"
      padding="md"
      onPress={onPress}
    >
      {/* Top Header: Priority, Overdue indicator, Status */}
      <View style={styles.topRow}>
        <View style={styles.priorityBox}>
          <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
          <Text style={[styles.priorityText, { color: priorityColor }]}>
            {task.priority} Priority
          </Text>
        </View>

        <View style={styles.badgeGroup}>
          {isOverdue && (
            <Badge label="OVERDUE" variant="danger" size="sm" style={{ marginRight: 6 }} />
          )}
          <Badge label={task.status} variant={getStatusVariant(task.status)} size="sm" />
        </View>
      </View>

      {/* Title & Description */}
      <Text style={styles.title} numberOfLines={2}>
        {task.title}
      </Text>
      <Text style={styles.desc} numberOfLines={2}>
        {task.description}
      </Text>

      {/* Footer: Due date & Assignee */}
      <View style={styles.footerRow}>
        <View style={styles.dueDateRow}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={isOverdue ? theme.colors.danger : theme.colors.textMuted}
          />
          <Text style={[styles.dueDateText, isOverdue && { color: theme.colors.danger, fontWeight: '700' }]}>
            Due: {formatChicagoDate(task.dueDate)}
          </Text>
        </View>

        {showAssignee && (
          <View style={styles.assigneeRow}>
            <Avatar name={task.assignedToName} size={22} />
            <Text style={styles.assigneeName} numberOfLines={1}>
              {task.assignedToName}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  priorityBox: {
    flexDirection: 'row',
    alignItems: 'center',
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
    letterSpacing: 0.5,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.size.sm + 1,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
    lineHeight: 20,
    marginBottom: 4,
  },
  desc: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.xs + 2,
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDateText: {
    fontSize: theme.typography.size.xs - 1,
    color: theme.colors.textMuted,
  },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '45%',
  },
  assigneeName: {
    fontSize: theme.typography.size.xs - 1,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weight.medium,
  },
});

export default TaskCard;
