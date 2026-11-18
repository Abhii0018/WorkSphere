import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import theme, { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../src/constants/theme';
import { COMPANY_INFO, USER_ROLES } from '../../src/constants/company';
import { useAuth } from '../../src/hooks/useAuth';
import { useAttendance } from '../../src/context/AttendanceContext';
import { useLeave } from '../../src/context/LeaveContext';
import { useEmployees } from '../../src/context/EmployeeContext';
import { useTasks } from '../../src/context/TaskContext';
import { usePayroll } from '../../src/context/PayrollContext';
import { formatDate } from '../../src/utils/formatting';
import { calculateWorkingHours } from '../../src/utils/attendance';
import { formatCurrency, formatMonthLabel, getCurrentMonthKey } from '../../src/utils/payroll';
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
  const currentMonthKey = getCurrentMonthKey();

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
  const hrExpenditureStats = getMonthlyExpenditureStats(currentMonthKey);
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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [role]);

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
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* ========================================================================= */}
        {/* 1. TOP BRAND & PROFILE HEADER */}
        {/* ========================================================================= */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <View style={styles.brandRow}>
              <View style={styles.brandBadge}>
                <Ionicons name="business" size={12} color={COLORS.primary} />
                <Text style={styles.brandBadgeText}>{COMPANY_INFO.name.toUpperCase()}</Text>
              </View>
              <Text style={styles.tzPill}>CHICAGO CST</Text>
            </View>

            <Text style={styles.greetingText}>
              Welcome back, <Text style={styles.greetingName}>{user?.name ? user.name.split(' ')[0] : 'Elena'}</Text>
            </Text>
            <Text style={styles.userRoleSubtitle}>
              {user?.designation || user?.title || 'Administrator'} • {user?.department || 'Operations'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.85}
            style={styles.avatarWrap}
          >
            <Avatar
              name={user?.name || 'Visartech'}
              size={50}
              showStatus
              status={isCheckedIn && !isCheckedOut ? 'active' : 'offline'}
              backgroundColor={user?.avatarColor || COLORS.primary}
              textColor="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* ========================================================================= */}
        {/* 2. ROLE SWITCHER & ENVIRONMENT BAR */}
        {/* ========================================================================= */}
        <View style={styles.roleBar}>
          <View style={styles.roleBarLeft}>
            <View style={[styles.roleIconCircle, { backgroundColor: isHrAdmin ? '#F5F3FF' : '#EFF6FF' }]}>
              <Ionicons
                name={isHrAdmin ? 'shield-checkmark' : 'person'}
                size={16}
                color={isHrAdmin ? COLORS.roleHrAdmin : COLORS.primary}
              />
            </View>
            <View>
              <Text style={styles.roleLabel}>ACTIVE PERSPECTIVE</Text>
              <Text style={styles.roleTitle}>
                {isHrAdmin ? 'HR Administrator Console' : 'Employee Self-Service'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.roleToggleBtn}
            onPress={handleRoleToggle}
            activeOpacity={0.8}
          >
            <Ionicons name="swap-horizontal" size={14} color={COLORS.primary} />
            <Text style={styles.roleToggleText}>
              Switch to {isHrAdmin ? 'Employee' : 'HR Admin'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================================= */}
        {/* 3. QUICK NAVIGATION WORKSPACE TILES */}
        {/* ========================================================================= */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Workspaces & Portals</Text>
          <Text style={styles.sectionSub}>7 Active Modules (MongoDB Atlas)</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickTilesScroll}
          style={{ marginBottom: SPACING.lg }}
        >
          <TouchableOpacity
            style={styles.quickTile}
            onPress={() => router.push('/employees')}
            activeOpacity={0.8}
          >
            <View style={[styles.tileIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="people" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.tileLabel}>Directory</Text>
            <Text style={styles.tileSub}>6 Staff</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickTile}
            onPress={() => router.push('/(tabs)/attendance')}
            activeOpacity={0.8}
          >
            <View style={[styles.tileIconBox, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="time" size={20} color={COLORS.success} />
            </View>
            <Text style={styles.tileLabel}>Attendance</Text>
            <Text style={styles.tileSub}>{adminStats.attendancePercentage}% Today</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickTile}
            onPress={() => router.push('/tasks')}
            activeOpacity={0.8}
          >
            <View style={[styles.tileIconBox, { backgroundColor: '#F0F9FF' }]}>
              <Ionicons name="checkbox" size={20} color="#0284C7" />
            </View>
            <Text style={styles.tileLabel}>Tasks</Text>
            <Text style={styles.tileSub}>{hrTaskStats.total} Sprint</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickTile}
            onPress={() => router.push('/payroll')}
            activeOpacity={0.8}
          >
            <View style={[styles.tileIconBox, { backgroundColor: '#FAF5FF' }]}>
              <Ionicons name="card" size={20} color="#7C3AED" />
            </View>
            <Text style={styles.tileLabel}>Payroll</Text>
            <Text style={styles.tileSub}>USD ($)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickTile}
            onPress={() => router.push('/leave')}
            activeOpacity={0.8}
          >
            <View style={[styles.tileIconBox, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="calendar" size={20} color="#D97706" />
            </View>
            <Text style={styles.tileLabel}>Leaves</Text>
            <Text style={styles.tileSub}>{hrLeaveStats.pendingCount} Pending</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickTile}
            onPress={() => router.push('/announcements')}
            activeOpacity={0.8}
          >
            <View style={[styles.tileIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="megaphone" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.tileLabel}>Notices</Text>
            <Text style={styles.tileSub}>Updates</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickTile}
            onPress={() => router.push('/feedback')}
            activeOpacity={0.8}
          >
            <View style={[styles.tileIconBox, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="chatbubbles" size={20} color={COLORS.success} />
            </View>
            <Text style={styles.tileLabel}>Feedback</Text>
            <Text style={styles.tileSub}>Pulse</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ========================================================================= */}
        {/* 4. REAL-TIME ATTENDANCE HERO BANNER */}
        {/* ========================================================================= */}
        <View style={styles.attendanceHeroCard}>
          <View style={styles.attendanceHeroTop}>
            <View style={styles.attendanceHeroIconCircle}>
              <Ionicons name="time-outline" size={22} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.attendanceHeroHeading}>
                {isHrAdmin ? 'Visartech Attendance Monitor' : "Today's Work Shift Attendance"}
              </Text>
              <Text style={styles.attendanceHeroSub}>
                {isHrAdmin
                  ? `${adminStats.presentCount} Present • ${adminStats.lateCount} Late • ${adminStats.absentCount} Absent`
                  : isCheckedOut
                  ? `Shift ended • ${employeeTodayRecord.workingHours} logged`
                  : isCheckedIn
                  ? `Active session • Checked in at ${employeeTodayRecord.checkInFormatted}`
                  : 'Check-in pending for today'}
              </Text>
            </View>
            <Badge
              label={
                isHrAdmin
                  ? `${adminStats.attendancePercentage}% Present`
                  : isCheckedOut
                  ? 'Completed'
                  : isCheckedIn
                  ? 'In Office'
                  : 'Pending'
              }
              variant={isCheckedIn || isHrAdmin ? 'success' : 'warning'}
              size="sm"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.attendanceActionBtn,
              !isCheckedIn && !isHrAdmin && { backgroundColor: COLORS.success },
            ]}
            onPress={() => router.push('/(tabs)/attendance')}
            activeOpacity={0.85}
          >
            <Ionicons
              name={
                isHrAdmin
                  ? 'speedometer-outline'
                  : !isCheckedIn
                  ? 'log-in-outline'
                  : !isCheckedOut
                  ? 'log-out-outline'
                  : 'eye-outline'
              }
              size={18}
              color={COLORS.white}
            />
            <Text style={styles.attendanceActionBtnText}>
              {isHrAdmin
                ? 'Launch Attendance Console'
                : !isCheckedIn
                ? 'Check In Now'
                : !isCheckedOut
                ? 'Punch Out / View Records'
                : 'View Shift Attendance History'}
            </Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* ========================================================================= */}
        {/* 5. EXECUTIVE KPI METRICS GRID */}
        {/* ========================================================================= */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {isHrAdmin ? 'Company Performance & Metrics' : 'Personal Workspace KPIs'}
          </Text>
          <Badge
            label={isHrAdmin ? 'Visartech Enterprise' : 'My Account'}
            variant="neutral"
            size="sm"
          />
        </View>

        {isHrAdmin ? (
          /* HR Administrator 4-tile KPI Grid */
          <View style={styles.kpiGrid}>
            <View style={styles.kpiRow}>
              <StatCard
                title="Active Headcount"
                value={`${activeEmployees.length}/${employees.length}`}
                subtitle="Monitored Staff"
                iconName="people"
                iconColor={COLORS.primary}
                iconBgColor="#EFF6FF"
                onPress={() => router.push('/employees')}
              />
              <StatCard
                title="Attendance Rate"
                value={`${adminStats.attendancePercentage}%`}
                subtitle={`${adminStats.presentCount + adminStats.lateCount} of 6 Present`}
                iconName="checkmark-done"
                iconColor={COLORS.success}
                iconBgColor="#ECFDF5"
                onPress={() => router.push('/(tabs)/attendance')}
              />
            </View>
            <View style={styles.kpiRow}>
              <StatCard
                title="Pending Leaves"
                value={`${hrLeaveStats.pendingCount}`}
                subtitle="Awaiting Review"
                iconName="time"
                iconColor={COLORS.warning}
                iconBgColor="#FFFBEB"
                onPress={() => router.push('/leave')}
              />
              <StatCard
                title="Sprint Delivery"
                value={`${hrTaskStats.completionRate}%`}
                subtitle={`${hrTaskStats.overdue} Overdue • ${hrTaskStats.total} Tasks`}
                iconName="checkbox"
                iconColor={hrTaskStats.overdue > 0 ? COLORS.danger : COLORS.info}
                iconBgColor={hrTaskStats.overdue > 0 ? '#FEF2F2' : '#F0F9FF'}
                onPress={() => router.push('/tasks')}
              />
            </View>
          </View>
        ) : (
          /* Employee 4-tile KPI Grid */
          <View style={styles.kpiGrid}>
            <View style={styles.kpiRow}>
              <StatCard
                title="Today's Shift"
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
                    : 'Awaiting check-in'
                }
                iconName="timer-outline"
                iconColor={isCheckedIn ? COLORS.success : COLORS.danger}
                iconBgColor={isCheckedIn ? '#ECFDF5' : '#FEF2F2'}
                onPress={() => router.push('/(tabs)/attendance')}
              />
              <StatCard
                title="Hours Logged"
                value={currentWorkingHours}
                subtitle={isCheckedOut ? 'Shift ended' : isCheckedIn ? 'Recorded today' : 'No time logged'}
                iconName="hourglass-outline"
                iconColor={COLORS.primary}
                iconBgColor="#EFF6FF"
                onPress={() => router.push('/(tabs)/attendance')}
              />
            </View>
            <View style={styles.kpiRow}>
              <StatCard
                title="Assigned Tasks"
                value={`${empTaskStats.completed}/${empTaskStats.total}`}
                subtitle={`${empTaskStats.completionRate}% Done • ${empTaskStats.overdue} Overdue`}
                iconName="checkbox-outline"
                iconColor={empTaskStats.overdue > 0 ? COLORS.danger : COLORS.info}
                iconBgColor={empTaskStats.overdue > 0 ? '#FEF2F2' : '#F0F9FF'}
                onPress={() => router.push('/tasks')}
              />
              <StatCard
                title="Leave Remaining"
                value={`${employeeBalance.totalRemaining}d`}
                subtitle={`${employeeBalance.totalEntitled}d Yearly Entitlement`}
                iconName="leaf-outline"
                iconColor={COLORS.success}
                iconBgColor="#ECFDF5"
                onPress={() => router.push('/leave')}
              />
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* 6. HR PAYROLL EXPENDITURE & SUMMARY CARDS (SECTION 3 SPECIFICATION) */}
        {/* ========================================================================= */}
        {isHrAdmin && (
          <View style={styles.payrollSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Monthly Payroll Expenditure</Text>
                <Text style={styles.sectionSub}>{formatMonthLabel(currentMonthKey)} Run</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/payroll')}>
                <Text style={styles.seeAllText}>Open Payroll Hub →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.payrollGrid}>
              <View style={styles.kpiRow}>
                <StatCard
                  title="Total Monthly Payroll"
                  value={formatCurrency(hrExpenditureStats.totalNetSalary)}
                  subtitle="Net Disbursal Budget"
                  iconName="cash-outline"
                  iconColor={COLORS.primary}
                  iconBgColor="#EFF6FF"
                  onPress={() => router.push('/payroll')}
                />
                <StatCard
                  title="Payroll Staff"
                  value={`${hrExpenditureStats.totalEmployeesIncluded}`}
                  subtitle="Employees Enrolled"
                  iconName="people-outline"
                  iconColor={COLORS.info}
                  iconBgColor="#F0F9FF"
                  onPress={() => router.push('/payroll')}
                />
              </View>

              <View style={styles.kpiRow}>
                <StatCard
                  title="Paid Payroll Amount"
                  value={formatCurrency(hrExpenditureStats.paidPayrollAmount)}
                  subtitle={`${hrExpenditureStats.paidCount} Disbursed`}
                  iconName="checkmark-circle-outline"
                  iconColor={COLORS.success}
                  iconBgColor="#ECFDF5"
                  onPress={() => router.push('/payroll')}
                />
                <StatCard
                  title="Pending Payroll Amount"
                  value={formatCurrency(hrExpenditureStats.pendingPayrollAmount)}
                  subtitle={`${hrExpenditureStats.pendingCount} Awaiting Payment`}
                  iconName="time-outline"
                  iconColor={COLORS.warning}
                  iconBgColor="#FFFBEB"
                  onPress={() => router.push('/payroll')}
                />
              </View>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* 7. EMPLOYEE COMPENSATION & TASK SNAPSHOTS */}
        {/* ========================================================================= */}
        {!isHrAdmin && (
          <>
            {/* Latest Payslip Snapshot Card */}
            {latestPayroll && (
              <TouchableOpacity
                style={styles.snapshotCard}
                onPress={() => router.push('/payroll')}
                activeOpacity={0.85}
              >
                <View style={styles.snapshotTop}>
                  <View style={[styles.snapshotIconBox, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="card" size={20} color={COLORS.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.snapshotTitle}>
                      Latest Payslip • {formatMonthLabel(latestPayroll.month || latestPayroll.payrollMonth)}
                    </Text>
                    <Text style={styles.snapshotSub}>
                      Net Take-Home: <Text style={styles.boldText}>{formatCurrency(latestPayroll.netSalary)}</Text> • ID: {latestPayroll.id}
                    </Text>
                  </View>
                  <Badge
                    label={latestPayroll.status}
                    variant={getStatusBadgeVariant(latestPayroll.status)}
                    size="sm"
                  />
                </View>
                <View style={styles.snapshotFooter}>
                  <Text style={styles.snapshotActionLink}>View Full Payslip Breakdown</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
                </View>
              </TouchableOpacity>
            )}

            {/* Task Performance Snapshot */}
            <TouchableOpacity
              style={styles.snapshotCard}
              onPress={() => router.push('/tasks')}
              activeOpacity={0.85}
            >
              <View style={styles.snapshotTop}>
                <View style={[styles.snapshotIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="checkbox" size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.snapshotTitle}>My Active Tasks & Sprint</Text>
                  <Text style={styles.snapshotSub}>
                    {pendingTasksCount} in progress • {empTaskStats.overdue} overdue
                  </Text>
                </View>
                <Badge
                  label={empTaskStats.overdue > 0 ? `${empTaskStats.overdue} Overdue` : `${empTaskStats.completionRate}% Done`}
                  variant={empTaskStats.overdue > 0 ? 'danger' : 'primary'}
                  size="sm"
                />
              </View>
              <View style={styles.snapshotProgressTrack}>
                <View style={[styles.snapshotProgressFill, { width: `${Math.min(100, Math.max(0, empTaskStats.completionRate))}%` }]} />
              </View>
            </TouchableOpacity>

            {/* Leave Request Snapshot */}
            {latestLeaveRequest && (
              <TouchableOpacity
                style={styles.snapshotCard}
                onPress={() => router.push('/leave')}
                activeOpacity={0.85}
              >
                <View style={styles.snapshotTop}>
                  <View style={[styles.snapshotIconBox, { backgroundColor: '#FFFBEB' }]}>
                    <Ionicons name="calendar" size={20} color="#D97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.snapshotTitle}>Recent Leave Application</Text>
                    <Text style={styles.snapshotSub}>
                      {latestLeaveRequest.leaveType} • {latestLeaveRequest.days}d ({latestLeaveRequest.startDate})
                    </Text>
                  </View>
                  <Badge
                    label={latestLeaveRequest.status}
                    variant={getStatusBadgeVariant(latestLeaveRequest.status)}
                    size="sm"
                  />
                </View>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* 8. CORPORATE BULLETIN & ANNOUNCEMENT */}
        {/* ========================================================================= */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Company Bulletin</Text>
          <Badge label="Official" variant="neutral" size="sm" />
        </View>

        <View style={styles.bulletinCard}>
          <View style={styles.bulletinTop}>
            <View style={styles.bulletinIconBox}>
              <Ionicons name="megaphone" size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bulletinTitle}>WorkSphere HR Suite 2.0 Live</Text>
              <Text style={styles.bulletinDate}>Visartech Operations • Chicago HQ</Text>
            </View>
          </View>
          <Text style={styles.bulletinBody}>
            Attendance, Leave Applications, Employee Directory, Task Delivery, and Payroll Management are fully operational across all 6 Visartech technology team members.
          </Text>
        </View>

        {/* Footer Note */}
        <View style={styles.footerBrand}>
          <Text style={styles.footerBrandText}>
            WorkSphere Mobile • Visartech Digital Solutions Inc.
          </Text>
        </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 48,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingTop: SPACING.xs,
  },
  headerLeft: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  brandBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  tzPill: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  greetingName: {
    color: COLORS.primary,
  },
  userRoleSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  avatarWrap: {
    padding: 2,
  },
  roleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  roleBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  roleIconCircle: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  roleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  roleToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  roleToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  sectionSub: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  quickTilesScroll: {
    paddingRight: SPACING.lg,
    gap: 10,
  },
  quickTile: {
    width: 86,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.sm,
  },
  tileIconBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  tileSub: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 1,
  },
  attendanceHeroCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  attendanceHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: SPACING.sm + 2,
  },
  attendanceHeroIconCircle: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendanceHeroHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  attendanceHeroSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  attendanceActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  attendanceActionBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  kpiGrid: {
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  payrollSection: {
    marginBottom: SPACING.sm,
  },
  payrollGrid: {
    gap: SPACING.xs,
  },
  snapshotCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  snapshotTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  snapshotIconBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  snapshotTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  snapshotSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  snapshotFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  snapshotActionLink: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  snapshotProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    marginTop: SPACING.sm,
    overflow: 'hidden',
  },
  snapshotProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  bulletinCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  bulletinTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: SPACING.xs,
  },
  bulletinIconBox: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulletinTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  bulletinDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  bulletinBody: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  footerBrand: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  footerBrandText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
