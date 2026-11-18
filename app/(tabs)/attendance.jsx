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
import { Ionicons } from '@expo/vector-icons';
import theme from '../../src/constants/theme';
import { COMPANY_INFO, USER_ROLES } from '../../src/constants/company';
import { formatChicagoDate } from '../../src/utils/attendance';
import { useAuth } from '../../src/hooks/useAuth';
import { useAttendance } from '../../src/context/AttendanceContext';
import {
  Card,
  Badge,
  Avatar,
  StatCard,
  Button,
  AttendanceCard,
  AttendanceHistoryList,
  EmployeeAttendanceDetailModal,
} from '../../src/components';

export default function AttendanceScreen() {
  const { user, isHrAdmin, switchRole } = useAuth();
  const { getEmployeeHistory, getAdminStatistics, resetAttendanceData } = useAttendance();

  // State for HR viewing individual employee history modal
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Statistics for HR admin
  const adminStats = getAdminStatistics();

  // History for current employee
  const employeeHistory = getEmployeeHistory(user?.id || 'emp-101', 'ALL');

  const handleResetData = () => {
    Alert.alert(
      'Reset Sample Records',
      'This will reset attendance records for all 6 employees back to initial prototype defaults.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetAttendanceData();
            Alert.alert('Reset Complete', 'Attendance dataset restored to initial state.');
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
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.dateLabel}>{formatChicagoDate(new Date())}</Text>
            <Text style={styles.screenTitle}>
              {isHrAdmin ? 'Attendance Console' : 'My Attendance'}
            </Text>
            <Text style={styles.subtitle}>
              {isHrAdmin
                ? `${COMPANY_INFO.name} • 6 Employees Monitored`
                : `${user?.name} (${user?.id || 'emp-101'})`}
            </Text>
          </View>
          <Badge
            label={isHrAdmin ? 'HR Admin' : 'Employee'}
            variant={isHrAdmin ? 'hr' : 'employee'}
            size="md"
          />
        </View>

        {/* =========================================================================
            EMPLOYEE ATTENDANCE VIEW
           ========================================================================= */}
        {!isHrAdmin ? (
          <View>
            {/* PART 1: Interactive Employee Attendance Card */}
            <AttendanceCard employee={user} />

            {/* PART 2: Employee Attendance History with Filters */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Attendance History</Text>
                <Text style={styles.sectionSubtitle}>
                  Past daily records, working hours & check times
                </Text>
              </View>
              <Badge
                label={`${employeeHistory.length} Shifts`}
                variant="neutral"
                size="sm"
              />
            </View>

            <AttendanceHistoryList records={employeeHistory} />
          </View>
        ) : (
          /* =========================================================================
             HR ADMINISTRATOR ATTENDANCE VIEW
             ========================================================================= */
          <View>
            {/* PART 3: HR Admin High-Level KPIs */}
            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                <StatCard
                  title="Total Headcount"
                  value={`${adminStats.totalEmployees}`}
                  subtitle="Monitored staff"
                  iconName="people"
                  iconColor={theme.colors.primary}
                  iconBgColor={theme.colors.primarySubtle}
                />
                <StatCard
                  title="Present Today"
                  value={`${adminStats.presentCount}`}
                  subtitle="On-time check-in"
                  iconName="checkmark-circle"
                  iconColor={theme.colors.success}
                  iconBgColor={theme.colors.successSubtle}
                />
              </View>
              <View style={styles.statsRow}>
                <StatCard
                  title="Late Check-Ins"
                  value={`${adminStats.lateCount}`}
                  subtitle="After 09:15 AM"
                  iconName="alert-circle"
                  iconColor={theme.colors.warning}
                  iconBgColor={theme.colors.warningSubtle}
                />
                <StatCard
                  title="Absent"
                  value={`${adminStats.absentCount}`}
                  subtitle="Leave / Unreported"
                  iconName="close-circle"
                  iconColor={theme.colors.danger}
                  iconBgColor={theme.colors.dangerSubtle}
                />
              </View>
            </View>

            {/* Attendance Rate Banner */}
            <Card style={styles.rateCard} variant="elevated" padding="md">
              <View style={styles.rateRow}>
                <View style={styles.rateIconBox}>
                  <Ionicons name="pie-chart" size={26} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rateLabel}>TODAY&apos;S ATTENDANCE RATE</Text>
                  <Text style={styles.rateValue}>{adminStats.attendancePercentage}%</Text>
                </View>
                <Badge
                  label={adminStats.attendancePercentage >= 80 ? 'Optimal' : 'Attention'}
                  variant={adminStats.attendancePercentage >= 80 ? 'success' : 'warning'}
                  size="md"
                />
              </View>
            </Card>

            {/* PART 3 & 4: Mobile-Friendly Employee Attendance Table / Roster */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Employee Roster ({adminStats.totalEmployees})</Text>
                <Text style={styles.sectionSubtitle}>
                  Tap any employee to view full attendance history
                </Text>
              </View>
            </View>

            <View style={styles.rosterList}>
              {adminStats.employeeRows.map((emp) => {
                const isAbsent = emp.status === 'Absent';
                const isLate = emp.status === 'Late';

                return (
                  <Card
                    key={emp.id}
                    style={styles.employeeCard}
                    variant="elevated"
                    padding="md"
                    onPress={() => setSelectedEmployee(emp)}
                  >
                    {/* Top Row: Avatar, Name, Role, Status */}
                    <View style={styles.empHeaderRow}>
                      <Avatar
                        name={emp.name}
                        size={40}
                        backgroundColor={emp.avatarColor}
                        textColor="#FFFFFF"
                      />
                      <View style={styles.empInfo}>
                        <Text style={styles.empName}>{emp.name}</Text>
                        <Text style={styles.empDept}>
                          {emp.id} • {emp.department}
                        </Text>
                      </View>
                      <Badge
                        label={emp.status}
                        variant={
                          emp.status === 'Present'
                            ? 'success'
                            : isLate
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                      />
                    </View>

                    {/* Bottom Row: Check-in, Check-out, Working hours */}
                    <View style={styles.empTimesRow}>
                      <View style={styles.empTimeCol}>
                        <Text style={styles.empTimeLabel}>CHECK IN</Text>
                        <Text style={styles.empTimeVal}>{emp.checkInFormatted}</Text>
                      </View>

                      <View style={styles.empTimeDivider} />

                      <View style={styles.empTimeCol}>
                        <Text style={styles.empTimeLabel}>CHECK OUT</Text>
                        <Text style={styles.empTimeVal}>{emp.checkOutFormatted}</Text>
                      </View>

                      <View style={styles.empTimeDivider} />

                      <View style={styles.empTimeCol}>
                        <Text style={styles.empTimeLabel}>HOURS</Text>
                        <Text
                          style={[
                            styles.empTimeVal,
                            {
                              color: !isAbsent
                                ? theme.colors.primary
                                : theme.colors.textMuted,
                              fontWeight: theme.typography.weight.bold,
                            },
                          ]}
                        >
                          {emp.workingHours}
                        </Text>
                      </View>
                    </View>

                    {/* View history hint */}
                    <View style={styles.viewHistoryRow}>
                      <Text style={styles.viewHistoryText}>View attendance history</Text>
                      <Ionicons
                        name="chevron-forward"
                        size={14}
                        color={theme.colors.primary}
                      />
                    </View>
                  </Card>
                );
              })}
            </View>

            {/* Quick Testing Controls */}
            <Card style={styles.devCard} variant="flat" padding="md">
              <View style={styles.devHeader}>
                <Ionicons
                  name="construct-outline"
                  size={18}
                  color={theme.colors.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.devTitle}>Testing & Prototype Controls</Text>
              </View>
              <Text style={styles.devDesc}>
                Attendance state is persisted locally via AsyncStorage in America/Chicago time.
                You can reset to sample defaults at any time.
              </Text>
              <View style={styles.devBtnRow}>
                <Button
                  title="Reset Sample Records"
                  onPress={handleResetData}
                  variant="outline"
                  size="sm"
                  style={{ flex: 1 }}
                />
                <Button
                  title="Switch to Employee View"
                  onPress={() => switchRole(USER_ROLES.EMPLOYEE)}
                  variant="secondary"
                  size="sm"
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* PART 4: Individual Employee Attendance Details Modal */}
      <EmployeeAttendanceDetailModal
        employee={selectedEmployee}
        visible={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />
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
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  dateLabel: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  screenTitle: {
    fontSize: theme.typography.size.xxl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  subtitle: {
    fontSize: theme.typography.size.xs + 1,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statsGrid: {
    marginBottom: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  rateCard: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.lg,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateIconBox: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  rateLabel: {
    fontSize: 10,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  rateValue: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  rosterList: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  employeeCard: {
    backgroundColor: theme.colors.surface,
  },
  empHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  empInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  empName: {
    fontSize: theme.typography.size.sm + 1,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  empDept: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  empTimesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  empTimeCol: {
    alignItems: 'center',
    flex: 1,
  },
  empTimeLabel: {
    fontSize: 9,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  empTimeVal: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textPrimary,
  },
  empTimeDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  viewHistoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  viewHistoryText: {
    fontSize: theme.typography.size.xs - 1,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.primary,
    marginRight: 4,
  },
  devCard: {
    marginBottom: theme.spacing.xl,
  },
  devHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  devTitle: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  devDesc: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 18,
  },
  devBtnRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
});
