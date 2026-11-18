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
import { useAttendance } from '../../context/AttendanceContext';
import { useLeave } from '../../context/LeaveContext';
import { useTasks } from '../../context/TaskContext';
import { usePayroll } from '../../context/PayrollContext';
import { formatCurrency } from '../../utils/payroll';
import { USER_ROLES } from '../../constants/company';

export const EmployeeProfileModal = ({
  employee,
  visible,
  onClose,
  onEditPress,
  userRole = USER_ROLES.HR_ADMIN,
  currentUserId,
}) => {
  const [activeTab, setActiveTab] = useState('PROFILE'); // 'PROFILE' | 'ATTENDANCE' | 'LEAVE' | 'TASKS' | 'PAYROLL'

  const { getEmployeeTodayRecord, getEmployeeHistory } = useAttendance();
  const { getEmployeeBalance, getEmployeeLeaveStats } = useLeave();
  const { getEmployeeTaskStats, getTasksForEmployee } = useTasks();
  const { getPayrollForEmployee } = usePayroll();

  if (!employee) return null;

  const isHrAdmin = userRole === USER_ROLES.HR_ADMIN;
  const isViewingSelf = currentUserId === employee.id;
  const canViewPayroll = isHrAdmin || isViewingSelf;

  // Cross-module data
  const attendanceToday = getEmployeeTodayRecord(employee.id);
  const attendanceHistory = getEmployeeHistory(employee.id, 'ALL');
  const leaveBalance = getEmployeeBalance(employee.id);
  const leaveStats = getEmployeeLeaveStats(employee.id);
  const taskStats = getEmployeeTaskStats(employee.id);
  const assignedTasks = getTasksForEmployee(employee.id, 'ALL');
  const payslips = canViewPayroll ? getPayrollForEmployee(employee.id, currentUserId, userRole) : [];

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
            <Avatar
              name={employee.name}
              size={54}
              backgroundColor={employee.avatarColor}
              textColor="#FFFFFF"
            />
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{employee.name}</Text>
                <Badge
                  label={employee.status || 'Active'}
                  variant={employee.status === 'Active' ? 'success' : 'neutral'}
                  size="sm"
                />
              </View>
              <Text style={styles.titleText}>{employee.title}</Text>
              <Text style={styles.idText}>
                {employee.id} • {employee.department}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Sub Navigation Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'PROFILE' && styles.tabBtnActive]}
              onPress={() => setActiveTab('PROFILE')}
            >
              <Text style={[styles.tabText, activeTab === 'PROFILE' && styles.tabTextActive]}>
                Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'ATTENDANCE' && styles.tabBtnActive]}
              onPress={() => setActiveTab('ATTENDANCE')}
            >
              <Text style={[styles.tabText, activeTab === 'ATTENDANCE' && styles.tabTextActive]}>
                Attendance
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'LEAVE' && styles.tabBtnActive]}
              onPress={() => setActiveTab('LEAVE')}
            >
              <Text style={[styles.tabText, activeTab === 'LEAVE' && styles.tabTextActive]}>
                Leaves
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'TASKS' && styles.tabBtnActive]}
              onPress={() => setActiveTab('TASKS')}
            >
              <Text style={[styles.tabText, activeTab === 'TASKS' && styles.tabTextActive]}>
                Tasks
              </Text>
            </TouchableOpacity>

            {canViewPayroll && (
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'PAYROLL' && styles.tabBtnActive]}
                onPress={() => setActiveTab('PAYROLL')}
              >
                <Text style={[styles.tabText, activeTab === 'PAYROLL' && styles.tabTextActive]}>
                  Payroll
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Tab Content Body */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* TAB 1: Profile & Professional Info */}
            {activeTab === 'PROFILE' && (
              <View>
                <Card style={styles.sectionCard} variant="flat" padding="md">
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email</Text>
                    <Text style={styles.detailVal}>{employee.email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Phone</Text>
                    <Text style={styles.detailVal}>{employee.phone || 'Not provided'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Department</Text>
                    <Text style={styles.detailVal}>{employee.department}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Designation</Text>
                    <Text style={styles.detailVal}>{employee.title}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Joining Date</Text>
                    <Text style={styles.detailVal}>{employee.joinDate || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Employment Status</Text>
                    <Text style={[styles.detailVal, { color: employee.status === 'Active' ? theme.colors.success : theme.colors.danger }]}>
                      {employee.status || 'Active'}
                    </Text>
                  </View>
                </Card>

                {/* Edit Button for HR Administrator */}
                {isHrAdmin ? (
                  <Button
                    title="Edit Official Information"
                    onPress={() => {
                      onClose();
                      onEditPress && onEditPress(employee);
                    }}
                    variant="outline"
                    size="md"
                    leftIcon={<Ionicons name="pencil-outline" size={18} color={theme.colors.primary} />}
                    style={{ marginTop: theme.spacing.md }}
                  />
                ) : (
                  <Text style={styles.readOnlyNotice}>
                    Official information is managed by Visartech HR Operations.
                  </Text>
                )}
              </View>
            )}

            {/* TAB 2: Attendance Summary */}
            {activeTab === 'ATTENDANCE' && (
              <View>
                <Card style={styles.sectionCard} variant="flat" padding="md">
                  <Text style={styles.cardHeaderTitle}>Today&apos;s Attendance</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <Badge
                      label={attendanceToday?.status || 'Not Checked In'}
                      variant={
                        attendanceToday?.status === 'Present'
                          ? 'success'
                          : attendanceToday?.status === 'Late'
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                    />
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Check-In Time</Text>
                    <Text style={styles.detailVal}>{attendanceToday?.checkInFormatted || '--:--'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Check-Out Time</Text>
                    <Text style={styles.detailVal}>{attendanceToday?.checkOutFormatted || '--:--'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Working Hours</Text>
                    <Text style={[styles.detailVal, { color: theme.colors.primary, fontWeight: '700' }]}>
                      {attendanceToday?.workingHours || '--'}
                    </Text>
                  </View>
                </Card>

                <View style={styles.miniStatsRow}>
                  <View style={styles.miniStatBox}>
                    <Text style={styles.miniStatVal}>{attendanceHistory.length}</Text>
                    <Text style={styles.miniStatLabel}>Total Shifts</Text>
                  </View>
                  <View style={styles.miniStatBox}>
                    <Text style={[styles.miniStatVal, { color: theme.colors.success }]}>
                      {attendanceHistory.filter((r) => r.status === 'Present').length}
                    </Text>
                    <Text style={styles.miniStatLabel}>Present</Text>
                  </View>
                  <View style={styles.miniStatBox}>
                    <Text style={[styles.miniStatVal, { color: theme.colors.warning }]}>
                      {attendanceHistory.filter((r) => r.status === 'Late').length}
                    </Text>
                    <Text style={styles.miniStatLabel}>Late</Text>
                  </View>
                </View>
              </View>
            )}

            {/* TAB 3: Leave Summary */}
            {activeTab === 'LEAVE' && (
              <View>
                <Card style={styles.sectionCard} variant="flat" padding="md">
                  <Text style={styles.cardHeaderTitle}>Leave Entitlement (2026)</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total Entitlement</Text>
                    <Text style={styles.detailVal}>{leaveBalance.totalEntitled} Days</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Used Leaves</Text>
                    <Text style={styles.detailVal}>{leaveBalance.totalUsed} Days</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Remaining Leaves</Text>
                    <Text style={[styles.detailVal, { color: theme.colors.primary, fontWeight: '700' }]}>
                      {leaveBalance.totalRemaining} Days
                    </Text>
                  </View>
                </Card>

                <View style={styles.miniStatsRow}>
                  <View style={styles.miniStatBox}>
                    <Text style={[styles.miniStatVal, { color: theme.colors.warning }]}>
                      {leaveStats.pendingCount}
                    </Text>
                    <Text style={styles.miniStatLabel}>Pending</Text>
                  </View>
                  <View style={styles.miniStatBox}>
                    <Text style={[styles.miniStatVal, { color: theme.colors.success }]}>
                      {leaveStats.approvedCount}
                    </Text>
                    <Text style={styles.miniStatLabel}>Approved</Text>
                  </View>
                  <View style={styles.miniStatBox}>
                    <Text style={[styles.miniStatVal, { color: theme.colors.danger }]}>
                      {leaveStats.rejectedCount}
                    </Text>
                    <Text style={styles.miniStatLabel}>Rejected</Text>
                  </View>
                </View>
              </View>
            )}

            {/* TAB 4: Tasks & Performance Summary */}
            {activeTab === 'TASKS' && (
              <View>
                <Card style={styles.sectionCard} variant="flat" padding="md">
                  <Text style={styles.cardHeaderTitle}>Measurable Task Performance</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total Assigned</Text>
                    <Text style={styles.detailVal}>{taskStats.totalTasks} Tasks</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Completion Rate</Text>
                    <Text style={[styles.detailVal, { color: theme.colors.primary, fontWeight: '700' }]}>
                      {taskStats.completionRate}%
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Overdue Tasks</Text>
                    <Text style={[styles.detailVal, { color: taskStats.overdueTasks > 0 ? theme.colors.danger : theme.colors.textPrimary }]}>
                      {taskStats.overdueTasks}
                    </Text>
                  </View>
                </Card>

                <View style={styles.tasksListPreview}>
                  <Text style={styles.previewHeading}>Assigned Tasks ({assignedTasks.length})</Text>
                  {assignedTasks.map((t) => (
                    <Card key={t.id} style={styles.miniTaskCard} variant="outlined" padding="sm">
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.miniTaskTitle} numberOfLines={1}>{t.title}</Text>
                        <Badge label={t.status} size="sm" variant={t.status === 'Completed' ? 'success' : 'neutral'} />
                      </View>
                      <Text style={styles.miniTaskDue}>Due: {t.dueDate}</Text>
                    </Card>
                  ))}
                </View>
              </View>
            )}

            {/* TAB 5: Payroll & Compensation */}
            {activeTab === 'PAYROLL' && canViewPayroll && (
              <View>
                <Card style={styles.sectionCard} variant="flat" padding="md">
                  <Text style={styles.cardHeaderTitle}>Base Salary Structure</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Basic Salary</Text>
                    <Text style={styles.detailVal}>{formatCurrency(employee.salary?.basic || 6000)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Allowances</Text>
                    <Text style={styles.detailVal}>+{formatCurrency(employee.salary?.allowances || 500)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Deductions</Text>
                    <Text style={[styles.detailVal, { color: theme.colors.danger }]}>
                      -{formatCurrency(employee.salary?.deductions || 450)}
                    </Text>
                  </View>
                  <View style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 6, marginTop: 4 }]}>
                    <Text style={[styles.detailLabel, { fontWeight: '700' }]}>Estimated Net Pay</Text>
                    <Text style={[styles.detailVal, { color: theme.colors.primary, fontWeight: '700', fontSize: 16 }]}>
                      {formatCurrency(
                        (employee.salary?.basic || 6000) +
                          (employee.salary?.allowances || 500) -
                          (employee.salary?.deductions || 450)
                      )}
                    </Text>
                  </View>
                </Card>

                <Text style={styles.previewHeading}>Monthly Pay Slips ({payslips.length})</Text>
                {payslips.map((p) => (
                  <Card key={p.id} style={styles.miniTaskCard} variant="outlined" padding="sm">
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.miniTaskTitle}>{p.month}</Text>
                      <Badge label={p.status} size="sm" variant={p.status === 'Paid' ? 'success' : 'warning'} />
                    </View>
                    <Text style={styles.payslipNet}>Net: {formatCurrency(p.netSalary)}</Text>
                  </Card>
                ))}
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
    maxHeight: '92%',
    ...theme.shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: theme.typography.size.md + 1,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  titleText: {
    fontSize: theme.typography.size.xs + 1,
    color: theme.colors.primary,
    fontWeight: theme.typography.weight.semibold,
    marginTop: 1,
  },
  idText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: theme.spacing.xs,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.md,
    padding: 3,
    marginBottom: theme.spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  tabBtnActive: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  tabText: {
    fontSize: 11,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.primary,
  },
  scrollBody: {
    paddingBottom: theme.spacing.xl,
  },
  sectionCard: {
    backgroundColor: theme.colors.surfaceSubtle,
    marginBottom: theme.spacing.md,
  },
  cardHeaderTitle: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
  },
  detailVal: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textPrimary,
  },
  readOnlyNotice: {
    fontSize: theme.typography.size.xs - 1,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  miniStatsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  miniStatBox: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSubtle,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  miniStatVal: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  miniStatLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  tasksListPreview: {
    marginTop: theme.spacing.sm,
  },
  previewHeading: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  miniTaskCard: {
    backgroundColor: theme.colors.surface,
    marginBottom: 6,
  },
  miniTaskTitle: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  miniTaskDue: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  payslipNet: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.primary,
    marginTop: 2,
  },
});

export default EmployeeProfileModal;
