import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';
import { Avatar, Badge, Button, Card } from '../common';
import AttendanceHistoryList from './AttendanceHistoryList';
import { useAttendance } from '../../context/AttendanceContext';

export const EmployeeAttendanceDetailModal = ({
  employee,
  visible,
  onClose,
}) => {
  const { getEmployeeHistory } = useAttendance();

  if (!employee) return null;

  const historyRecords = getEmployeeHistory(employee.id, 'ALL');

  // Calculate statistics for this specific employee
  const presentDays = historyRecords.filter((r) => r.status === 'Present').length;
  const lateDays = historyRecords.filter((r) => r.status === 'Late').length;
  const absentDays = historyRecords.filter((r) => r.status === 'Absent').length;
  const totalDays = historyRecords.length;
  const attendanceRate = totalDays > 0
    ? Math.round(((presentDays + lateDays) / totalDays) * 100)
    : 0;

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
            <View style={styles.headerLeft}>
              <Avatar
                name={employee.name}
                size={48}
                backgroundColor={employee.avatarColor}
                textColor="#FFFFFF"
              />
              <View style={styles.titleInfo}>
                <Text style={styles.employeeName}>{employee.name}</Text>
                <Text style={styles.employeeSub}>
                  {employee.id} • {employee.department}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Quick Stats Grid */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: theme.colors.success }]}>
                {presentDays}
              </Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: theme.colors.warning }]}>
                {lateDays}
              </Text>
              <Text style={styles.statLabel}>Late</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: theme.colors.danger }]}>
                {absentDays}
              </Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: theme.colors.primary }]}>
                {attendanceRate}%
              </Text>
              <Text style={styles.statLabel}>Rate</Text>
            </View>
          </View>

          {/* Title for History */}
          <View style={styles.historySectionHeader}>
            <Text style={styles.historySectionTitle}>Attendance Records History</Text>
            <Badge label={`${totalDays} Days`} variant="neutral" size="sm" />
          </View>

          {/* Scrollable Records */}
          <ScrollView
            style={styles.scrollList}
            showsVerticalScrollIndicator={false}
          >
            <AttendanceHistoryList records={historyRecords} />
          </ScrollView>

          {/* Close Action */}
          <Button
            title="Close Attendance Profile"
            onPress={onClose}
            variant="outline"
            size="md"
            style={styles.closeActionBtn}
          />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  employeeName: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  employeeSub: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: theme.spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statVal: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  historySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  historySectionTitle: {
    fontSize: theme.typography.size.sm + 1,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  scrollList: {
    maxHeight: 380,
    marginBottom: theme.spacing.md,
  },
  closeActionBtn: {
    width: '100%',
  },
});

export default EmployeeAttendanceDetailModal;
