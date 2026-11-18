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
import { formatDate } from '../../src/utils/formatting';
import { calculateWorkingHours } from '../../src/utils/attendance';
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

  // Retrieve live attendance data
  const employeeTodayRecord = getEmployeeTodayRecord(user?.id || 'emp-101');
  const adminStats = getAdminStatistics();

  // Retrieve live leave data
  const employeeId = user?.id || 'emp-101';
  const employeeBalance = getEmployeeBalance(employeeId);
  const employeeLeaveStats = getEmployeeLeaveStats(employeeId);
  const employeeRequests = getEmployeeLeaveRequests(employeeId, 'ALL');
  const latestLeaveRequest = employeeRequests[0] || null;

  const hrLeaveStats = getHrLeaveStats();

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
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
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
                title="Total Staff"
                value={`${adminStats.totalEmployees}`}
                subtitle="All monitored"
                iconName="people"
                iconColor={theme.colors.primary}
                iconBgColor={theme.colors.primarySubtle}
                onPress={() => router.push('/(tabs)/attendance')}
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
                title="Approved Leaves"
                value={`${hrLeaveStats.approvedCount}`}
                subtitle={`${hrLeaveStats.totalRequests} total requests`}
                iconName="calendar"
                iconColor={theme.colors.info}
                iconBgColor={theme.colors.infoSubtle}
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
                title="Leave Balance"
                value={`${employeeBalance.totalRemaining}d`}
                subtitle={`${employeeBalance.totalEntitled}d entitlement`}
                iconName="leaf-outline"
                iconColor={theme.colors.success}
                iconBgColor={theme.colors.successSubtle}
                onPress={() => router.push('/leave')}
              />
              <StatCard
                title="Pending Leaves"
                value={`${employeeLeaveStats.pendingCount}`}
                subtitle="Awaiting decision"
                iconName="time-outline"
                iconColor={theme.colors.warning}
                iconBgColor={theme.colors.warningSubtle}
                onPress={() => router.push('/leave')}
              />
            </View>
          </View>
        )}

        {/* Latest Leave Application Status (for Employee) */}
        {!isHrAdmin && latestLeaveRequest && (
          <Card style={styles.leaveStatusCard} variant="elevated" padding="md" onPress={() => router.push('/leave')}>
            <View style={styles.leaveStatusHeader}>
              <View style={styles.leaveStatusIconBox}>
                <Ionicons name="calendar" size={20} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.leaveStatusTitle}>Latest Leave Application</Text>
                <Text style={styles.leaveStatusSub}>
                  {latestLeaveRequest.leaveType} • {latestLeaveRequest.days} {latestLeaveRequest.days === 1 ? 'day' : 'days'} ({latestLeaveRequest.startDate})
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
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <Card style={styles.actionsCard} variant="elevated" padding="md">
          <View style={styles.actionButtonsRow}>
            {/* Quick Action 1: Attendance */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/(tabs)/attendance')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.actionIconBox,
                  {
                    backgroundColor: isCheckedIn && !isCheckedOut
                      ? theme.colors.dangerSubtle
                      : theme.colors.successSubtle,
                  },
                ]}
              >
                <Ionicons
                  name={isCheckedIn && !isCheckedOut ? 'log-out-outline' : 'log-in-outline'}
                  size={24}
                  color={isCheckedIn && !isCheckedOut ? theme.colors.danger : theme.colors.success}
                />
              </View>
              <Text style={styles.actionLabel}>
                {isHrAdmin
                  ? 'Attendance'
                  : isCheckedIn && !isCheckedOut
                  ? 'Check Out'
                  : 'Check In'}
              </Text>
            </TouchableOpacity>

            {/* Quick Action 2: Apply Leave / Leave Portal */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/leave')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.actionIconBox,
                  { backgroundColor: theme.colors.primarySubtle },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={styles.actionLabel}>
                {isHrAdmin ? 'Leaves' : 'Apply Leave'}
              </Text>
            </TouchableOpacity>

            {/* Quick Action 3: Team */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/(tabs)/attendance')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.actionIconBox,
                  { backgroundColor: theme.colors.infoSubtle },
                ]}
              >
                <Ionicons
                  name="people-outline"
                  size={24}
                  color={theme.colors.info}
                />
              </View>
              <Text style={styles.actionLabel}>Team (6)</Text>
            </TouchableOpacity>

            {/* Quick Action 4: Modules */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/(tabs)/modules')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.actionIconBox,
                  { backgroundColor: theme.colors.warningSubtle },
                ]}
              >
                <Ionicons
                  name="apps-outline"
                  size={24}
                  color={theme.colors.warning}
                />
              </View>
              <Text style={styles.actionLabel}>Modules</Text>
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
                Leave Management Active (Visartech)
              </Text>
              <Text style={styles.announcementDate}>Visartech Operations • Today</Text>
            </View>
          </View>
          <Text style={styles.announcementBody}>
            The Leave Management module is now live! Employees can apply for Casual,
            Sick, Annual, and Personal leave. All submissions are reviewed by HR.
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
              <Text style={styles.roadmapTitle}>View All 8 HR Modules</Text>
              <Text style={styles.roadmapSubtitle}>
                Attendance and Leave modules are active and operational
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
    marginBottom: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  leaveStatusCard: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.lg,
  },
  leaveStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaveStatusIconBox: {
    width: 38,
    height: 38,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  leaveStatusTitle: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  leaveStatusSub: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  attendanceBanner: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.xl,
  },
  attendanceBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  attendanceIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: theme.spacing.xl,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  actionItem: {
    alignItems: 'center',
  },
  actionIconBox: {
    width: 52,
    height: 52,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  actionLabel: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.textPrimary,
  },
  announcementCard: {
    marginBottom: theme.spacing.lg,
  },
  announcementTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  announcementIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  announcementTitle: {
    fontSize: theme.typography.size.sm + 1,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  announcementDate: {
    fontSize: theme.typography.size.xs - 1,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  announcementBody: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  roadmapCard: {
    marginBottom: theme.spacing.lg,
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
