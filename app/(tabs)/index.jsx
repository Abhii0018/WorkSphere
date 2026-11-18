import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../src/constants/theme';
import { COMPANY_INFO, USER_ROLES } from '../../src/constants/company';
import { useAuth } from '../../src/hooks/useAuth';
import { useAttendance } from '../../src/context/AttendanceContext';
import { useLeave } from '../../src/context/LeaveContext';
import { useEmployees } from '../../src/context/EmployeeContext';
import { useTasks } from '../../src/context/TaskContext';
import { usePayroll } from '../../src/context/PayrollContext';
import { formatDate } from '../../src/utils/formatting';
import { calculateWorkingHours } from '../../src/utils/attendance';
import { formatCurrency, formatMonthLabel } from '../../src/utils/payroll';
import { Card, Badge, Avatar, StatCard, Button } from '../../src/components';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, role, switchRole, isHrAdmin } = useAuth();
  const { getEmployeeTodayRecord, getAdminStatistics } = useAttendance();
  const {
    getEmployeeBalance,
    getEmployeeLeaveStats,
    getEmployeeLeaveRequests,
    getHrLeaveStats,
  } = useLeave();
  const { employees, activeEmployees } = useEmployees();
  const { getHrTaskStats, getEmployeeTaskStats, getTasksForEmployee } = useTasks();
  const { getMonthlyExpenditureStats, getPayrollForEmployee } = usePayroll();

  const employeeId = user?.id || 'emp-101';

  // Retrieve live attendance data
  const employeeTodayRecord = getEmployeeTodayRecord(employeeId);
  const adminStats = getAdminStatistics();

  // Retrieve live leave data
  const employeeBalance = getEmployeeBalance(employeeId);
  const employeeLeaveStats = getEmployeeLeaveStats(employeeId);
  const employeeRequests = getEmployeeLeaveRequests(employeeId, 'ALL');
  const latestLeaveRequest = employeeRequests[0] || null;
  const hrLeaveStats = getHrLeaveStats();

  // Retrieve live task & performance data
  const hrTaskStats = getHrTaskStats();
  const empTaskStats = getEmployeeTaskStats(employeeId);
  const employeeTasks = getTasksForEmployee(employeeId);
  const pendingTasksCount = employeeTasks.filter((t) => t.status !== 'Completed').length;

  // Retrieve live payroll data
  const hrExpenditureStats = getMonthlyExpenditureStats();
  const employeePayrolls = getPayrollForEmployee(employeeId, user?.id, user?.role);
  const latestPayroll = employeePayrolls[0] || null;

  const isCheckedIn = !!employeeTodayRecord?.checkIn;
  const isCheckedOut = !!employeeTodayRecord?.checkOut;

  // Calculate live working hours for employee
  const currentWorkingHours = employeeTodayRecord?.workingHours
    ? employeeTodayRecord.workingHours
    : isCheckedIn && !isCheckedOut
    ? `${calculateWorkingHours(employeeTodayRecord.checkIn, null).formatted} (active)`
    : '--';

  const handleRoleToggle = () => {
    const nextRole = isHrAdmin ? USER_ROLES.EMPLOYEE : USER_ROLES.HR_ADMIN;
    switchRole(nextRole);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
      case 'OVERDUE':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <Text style={styles.dateText}>{formatDate()}</Text>
            <Text style={styles.greetingText}>
              Hello, {user?.name ? user.name.split(' ')[0] : 'Member'}
            </Text>
            <View style={styles.companyRow}>
              <Text style={styles.companyName}>{COMPANY_INFO.name}</Text>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.companyIndustry}>{COMPANY_INFO.industry}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.8}
          >
            <Avatar
              name={user?.name || 'Visartech'}
              size={48}
              showStatus
              status={isCheckedIn && !isCheckedOut ? 'active' : 'offline'}
              backgroundColor={user?.avatarColor}
              textColor="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* Role Bar & Switcher Banner */}
        <Card style={styles.roleBanner} variant="outlined" padding="md">
          <View style={styles.roleBannerLeft}>
            <Ionicons
              name={isHrAdmin ? 'shield-checkmark' : 'person-circle'}
              size={22}
              color={isHrAdmin ? theme.colors.roleHrAdmin : theme.colors.roleEmployee}
            />
            <View style={styles.roleInfo}>
              <Text style={styles.roleLabel}>CURRENT VIEW</Text>
              <Text style={styles.roleTitle}>{role}</Text>
            </View>
          </View>
          <Button
            title={`Switch to ${isHrAdmin ? 'Employee' : 'HR Admin'}`}
            onPress={handleRoleToggle}
            variant="outline"
            size="sm"
            style={styles.switchBtn}
            textStyle={styles.switchBtnText}
          />
        </Card>

        {/* KPI / Metric Stats Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Overview & Metrics</Text>
          <Badge
            label={isHrAdmin ? 'Company Scope' : 'My Workspace'}
            variant="neutral"
            size="sm"
          />
        </View>

        {isHrAdmin ? (
          // ================= HR Administrator KPI Stats =================
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatCard
                title="Active Staff"
                value={`${activeEmployees.length}/${employees.length}`}
                subtitle="Employee Directory"
                iconName="people"
                iconColor={theme.colors.primary}
                iconBgColor={theme.colors.primarySubtle}
                onPress={() => router.push('/employees')}
              />
              <StatCard
                title="Attendance"
                value={`${adminStats.presentCount + adminStats.lateCount}/${adminStats.totalEmployees}`}
                subtitle={`${adminStats.attendancePercentage}% present today`}
                iconName="checkmark-done"
                iconColor={theme.colors.success}
                iconBgColor={theme.colors.successSubtle}
                onPress={() => router.push('/(tabs)/attendance')}
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                title="Pending Leaves"
                value={`${hrLeaveStats.pendingCount}`}
                subtitle="Requires HR review"
                iconName="time"
                iconColor={theme.colors.warning}
                iconBgColor={theme.colors.warningSubtle}
                onPress={() => router.push('/leave')}
              />
              <StatCard
                title="Team Tasks"
                value={`${hrTaskStats.completionRate}%`}
                subtitle={`${hrTaskStats.overdue} overdue • ${hrTaskStats.total} total`}
                iconName="checkbox"
                iconColor={hrTaskStats.overdue > 0 ? theme.colors.danger : theme.colors.info}
                iconBgColor={hrTaskStats.overdue > 0 ? theme.colors.dangerSubtle : theme.colors.infoSubtle}
                onPress={() => router.push('/tasks')}
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                title="Total Payouts"
                value={formatCurrency(hrExpenditureStats.totalNetSalary)}
                subtitle={`${hrExpenditureStats.pendingCount} pending payment`}
                iconName="card"
                iconColor={theme.colors.primary}
                iconBgColor={theme.colors.primarySubtle}
                onPress={() => router.push('/payroll')}
              />
              <StatCard
                title="Approved Leaves"
                value={`${hrLeaveStats.approvedCount}`}
                subtitle={`${hrLeaveStats.totalRequests} total requests`}
                iconName="calendar"
                iconColor={theme.colors.success}
                iconBgColor={theme.colors.successSubtle}
                onPress={() => router.push('/leave')}
              />
            </View>
          </View>
        ) : (
          // ================= Employee KPI Stats =================
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatCard
                title="Today's Status"
                value={
                  isCheckedOut
                    ? 'Completed'
                    : isCheckedIn
                    ? employeeTodayRecord?.status || 'Present'
                    : 'Not In'
                }
                subtitle={
                  isCheckedIn
                    ? `In at ${employeeTodayRecord.checkInFormatted}`
                    : 'Check-in pending'
                }
                iconName="timer-outline"
                iconColor={
                  isCheckedOut
                    ? theme.colors.info
                    : isCheckedIn
                    ? theme.colors.success
                    : theme.colors.danger
                }
                iconBgColor={
                  isCheckedOut
                    ? theme.colors.infoSubtle
                    : isCheckedIn
                    ? theme.colors.successSubtle
                    : theme.colors.dangerSubtle
                }
                onPress={() => router.push('/(tabs)/attendance')}
              />
              <StatCard
                title="Working Hours"
                value={currentWorkingHours}
                subtitle={
                  isCheckedOut
                    ? 'Shift ended'
                    : isCheckedIn
                    ? 'Time logged today'
                    : 'Awaiting check-in'
                }
                iconName="hourglass-outline"
                iconColor={theme.colors.primary}
                iconBgColor={theme.colors.primarySubtle}
                onPress={() => router.push('/(tabs)/attendance')}
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                title="My Tasks"
                value={`${empTaskStats.completed}/${empTaskStats.total}`}
                subtitle={`${empTaskStats.completionRate}% completion rate`}
                iconName="checkbox-outline"
                iconColor={empTaskStats.overdue > 0 ? theme.colors.danger : theme.colors.primary}
                iconBgColor={empTaskStats.overdue > 0 ? theme.colors.dangerSubtle : theme.colors.primarySubtle}
                onPress={() => router.push('/tasks')}
              />
              <StatCard
                title="Leave Balance"
                value={`${employeeBalance.totalRemaining}d`}
                subtitle={`${employeeBalance.totalEntitled}d entitlement`}
                iconName="leaf-outline"
                iconColor={theme.colors.success}
                iconBgColor={theme.colors.successSubtle}
                onPress={() => router.push('/leave')}
              />
            </View>
          </View>
        )}

        {/* Employee Interactive Widgets: Tasks & Payroll */}
        {!isHrAdmin && (
          <>
            {/* Task Snapshot Card */}
            <Card style={styles.widgetCard} variant="elevated" padding="md" onPress={() => router.push('/tasks')}>
              <View style={styles.widgetHeader}>
                <View style={[styles.widgetIconBox, { backgroundColor: theme.colors.primarySubtle }]}>
                  <Ionicons name="checkbox" size={20} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.widgetTitle}>My Active Tasks</Text>
                  <Text style={styles.widgetSubtitle}>
                    {pendingTasksCount} tasks in progress • {empTaskStats.overdue} overdue
                  </Text>
                </View>
                <Badge
                  label={empTaskStats.overdue > 0 ? `${empTaskStats.overdue} Overdue` : `${empTaskStats.completionRate}% Done`}
                  variant={empTaskStats.overdue > 0 ? 'danger' : 'primary'}
                  size="sm"
                />
              </View>
            </Card>

            {/* Payroll Snapshot Card */}
            {latestPayroll && (
              <Card style={styles.widgetCard} variant="elevated" padding="md" onPress={() => router.push('/payroll')}>
                <View style={styles.widgetHeader}>
                  <View style={[styles.widgetIconBox, { backgroundColor: '#EBFBEE' }]}>
                    <Ionicons name="card" size={20} color={theme.colors.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.widgetTitle}>Latest Payslip ({formatMonthLabel(latestPayroll.month)})</Text>
                    <Text style={styles.widgetSubtitle}>
                      Net Pay: {formatCurrency(latestPayroll.netSalary)}
                    </Text>
                  </View>
                  <Badge
                    label={latestPayroll.status}
                    variant={getStatusBadgeVariant(latestPayroll.status)}
                    size="sm"
                  />
                </View>
              </Card>
            )}

            {/* Latest Leave Application Status */}
            {latestLeaveRequest && (
              <Card style={styles.widgetCard} variant="elevated" padding="md" onPress={() => router.push('/leave')}>
                <View style={styles.widgetHeader}>
                  <View style={[styles.widgetIconBox, { backgroundColor: theme.colors.infoSubtle }]}>
                    <Ionicons name="calendar" size={20} color={theme.colors.info} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.widgetTitle}>Latest Leave Request</Text>
                    <Text style={styles.widgetSubtitle}>
                      {latestLeaveRequest.leaveType} • {latestLeaveRequest.days}d ({latestLeaveRequest.startDate})
                    </Text>
                  </View>
                  <Badge
                    label={latestLeaveRequest.status}
                    variant={getStatusBadgeVariant(latestLeaveRequest.status)}
                    size="sm"
                  />
                </View>
              </Card>
            )}
          </>
        )}

        {/* Attendance Highlight / Action Banner */}
        <Card style={styles.attendanceBanner} variant="elevated" padding="lg">
          <View style={styles.attendanceBannerHeader}>
            <View style={styles.attendanceIconCircle}>
              <Ionicons name="time" size={24} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.attendanceBannerTitle}>
                {isHrAdmin ? 'Attendance Console' : "Today's Attendance"}
              </Text>
              <Text style={styles.attendanceBannerSub}>
                {isHrAdmin
                  ? `${adminStats.presentCount} Present • ${adminStats.lateCount} Late • ${adminStats.absentCount} Absent`
                  : isCheckedOut
                  ? `Shift completed (${employeeTodayRecord.workingHours} logged)`
                  : isCheckedIn
                  ? `Checked in at ${employeeTodayRecord.checkInFormatted} (Chicago Time)`
                  : 'You have not checked in yet today'}
              </Text>
            </View>
          </View>

          <Button
            title={
              isHrAdmin
                ? 'Open Attendance Console'
                : !isCheckedIn
                ? 'Check In Now'
                : !isCheckedOut
                ? 'Open Attendance / Check Out'
                : 'View Attendance Records'
            }
            onPress={() => router.push('/(tabs)/attendance')}
            variant={!isCheckedIn && !isHrAdmin ? 'primary' : 'outline'}
            size="md"
            rightIcon={
              <Ionicons
                name="arrow-forward"
                size={18}
                color={!isCheckedIn && !isHrAdmin ? theme.colors.textInverse : theme.colors.primary}
              />
            }
            style={styles.attendanceBtn}
          />
        </Card>

        {/* Quick Actions Card */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Access Modules</Text>
        </View>

        <Card style={styles.actionsCard} variant="elevated" padding="md">
          <View style={styles.actionButtonsRow}>
            {/* Quick Action 1: Employees Directory */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/employees')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.actionIconBox,
                  { backgroundColor: theme.colors.primarySubtle },
                ]}
              >
                <Ionicons
                  name="people-outline"
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={styles.actionLabel}>Directory</Text>
            </TouchableOpacity>

            {/* Quick Action 2: Tasks */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/tasks')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.actionIconBox,
                  { backgroundColor: theme.colors.infoSubtle },
                ]}
              >
                <Ionicons
                  name="checkbox-outline"
                  size={24}
                  color={theme.colors.info}
                />
              </View>
              <Text style={styles.actionLabel}>Tasks</Text>
            </TouchableOpacity>

            {/* Quick Action 3: Payroll */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/payroll')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.actionIconBox,
                  { backgroundColor: '#EBFBEE' },
                ]}
              >
                <Ionicons
                  name="card-outline"
                  size={24}
                  color={theme.colors.success}
                />
              </View>
              <Text style={styles.actionLabel}>Payroll</Text>
            </TouchableOpacity>

            {/* Quick Action 4: Leaves */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/leave')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.actionIconBox,
                  { backgroundColor: theme.colors.warningSubtle },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={24}
                  color={theme.colors.warning}
                />
              </View>
              <Text style={styles.actionLabel}>Leaves</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Company Announcement Card */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Internal Announcement</Text>
          <Badge label="New" variant="primary" size="sm" />
        </View>

        <Card style={styles.announcementCard} variant="elevated" padding="lg">
          <View style={styles.announcementTop}>
            <View style={styles.announcementIconBox}>
              <Ionicons
                name="megaphone"
                size={20}
                color={theme.colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.announcementTitle}>
                WorkSphere 5-Module Suite Live!
              </Text>
              <Text style={styles.announcementDate}>Visartech Operations • Today</Text>
            </View>
          </View>
          <Text style={styles.announcementBody}>
            Attendance, Leave Management, Employee Directory, Task Performance, and Payroll Management are fully operational across all 6 Visartech team members.
          </Text>
        </Card>

        {/* Modules Navigation Shortcut */}
        <Card
          style={styles.roadmapCard}
          variant="flat"
          padding="lg"
          onPress={() => router.push('/(tabs)/modules')}
        >
          <View style={styles.roadmapContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.roadmapTitle}>Explore All HR Architecture</Text>
              <Text style={styles.roadmapSubtitle}>
                5 active modules operational with unified employee profiles
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={theme.colors.primary}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
  },
  headerLeft: {
    flex: 1,
  },
  dateText: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  greetingText: {
    fontSize: theme.typography.size.xxl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  companyName: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.primary,
  },
  bullet: {
    marginHorizontal: 6,
    color: theme.colors.textMuted,
    fontSize: theme.typography.size.xs,
  },
  companyIndustry: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
  },
  roleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
  },
  roleBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleInfo: {
    marginLeft: theme.spacing.sm,
  },
  roleLabel: {
    fontSize: 10,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  roleTitle: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  switchBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    minHeight: 32,
  },
  switchBtnText: {
    fontSize: theme.typography.size.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  statsGrid: {
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  widgetCard: {
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  widgetIconBox: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  widgetTitle: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  widgetSubtitle: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  attendanceBanner: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primaryLight,
    borderWidth: 1,
  },
  attendanceBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  attendanceIconCircle: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  attendanceBannerTitle: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  attendanceBannerSub: {
    fontSize: theme.typography.size.xs + 1,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  attendanceBtn: {
    width: '100%',
  },
  actionsCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconBox: {
    width: 50,
    height: 50,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  actionLabel: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.textPrimary,
  },
  announcementCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  announcementTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  announcementIconBox: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  announcementTitle: {
    fontSize: theme.typography.size.sm + 1,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textPrimary,
  },
  announcementDate: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  announcementBody: {
    fontSize: theme.typography.size.xs + 1,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  roadmapCard: {
    backgroundColor: theme.colors.primarySubtle,
    borderColor: theme.colors.primaryLight,
    borderWidth: 1,
  },
  roadmapContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roadmapTitle: {
    fontSize: theme.typography.size.sm + 1,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.primary,
  },
  roadmapSubtitle: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
