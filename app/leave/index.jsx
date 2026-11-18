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
import theme from '../../src/constants/theme';
import { COMPANY_INFO, USER_ROLES } from '../../src/constants/company';
import { useAuth } from '../../src/hooks/useAuth';
import { useLeave } from '../../src/context/LeaveContext';
import {
  Card,
  Badge,
  StatCard,
  Button,
  LeaveBalanceCard,
  LeaveApplicationModal,
  LeaveHistoryList,
  LeaveDetailModal,
  Avatar,
} from '../../src/components';

export default function LeaveScreen() {
  const router = useRouter();
  const { user, isHrAdmin, switchRole, allEmployees } = useAuth();
  const {
    getEmployeeBalance,
    getEmployeeLeaveRequests,
    getEmployeeLeaveStats,
    getHrLeaveStats,
    getAllLeaveRequests,
    resetLeaveData,
  } = useLeave();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [hrViewTab, setHrViewTab] = useState('REQUESTS'); // 'REQUESTS' | 'BALANCES'

  const employeeId = user?.id || 'emp-101';
  const employeeBalance = getEmployeeBalance(employeeId);
  const employeeStats = getEmployeeLeaveStats(employeeId);
  const employeeRequests = getEmployeeLeaveRequests(employeeId, 'ALL');

  const hrStats = getHrLeaveStats();
  const allRequests = getAllLeaveRequests('ALL');

  const handleResetData = () => {
    Alert.alert(
      'Reset Sample Records',
      'This will restore all leave applications and balances for the 6 employees back to prototype defaults.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetLeaveData();
            Alert.alert('Reset Complete', 'Leave records restored to defaults.');
          },
        },
      ]
    );
  };

  const handleRoleToggle = () => {
    const nextRole = isHrAdmin ? USER_ROLES.EMPLOYEE : USER_ROLES.HR_ADMIN;
    switchRole(nextRole);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Bar with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={styles.screenTitle}>
              {isHrAdmin ? 'Leave Administration' : 'Leave Portal'}
            </Text>
            <Text style={styles.subtitle}>
              {COMPANY_INFO.name} • {isHrAdmin ? 'Company Scope' : user?.name}
            </Text>
          </View>
          <Badge
            label={isHrAdmin ? 'HR Admin' : 'Employee'}
            variant={isHrAdmin ? 'hr' : 'employee'}
            size="md"
          />
        </View>

        {/* Role Bar & Switcher Banner */}
        <Card style={styles.roleBanner} variant="outlined" padding="sm">
          <View style={styles.roleBannerLeft}>
            <Ionicons
              name={isHrAdmin ? 'shield-checkmark' : 'person-circle'}
              size={20}
              color={isHrAdmin ? theme.colors.roleHrAdmin : theme.colors.roleEmployee}
            />
            <Text style={styles.roleBannerText}>
              Viewing as: <Text style={{ fontWeight: '700' }}>{user?.role}</Text>
            </Text>
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

        {/* =========================================================================
            EMPLOYEE LEAVE VIEW
           ========================================================================= */}
        {!isHrAdmin ? (
          <View>
            {/* Quick Action: Apply for Leave Button */}
            <Card style={styles.applyPromptCard} variant="elevated" padding="lg">
              <View style={styles.applyPromptRow}>
                <View style={styles.applyPromptIconBox}>
                  <Ionicons name="calendar-outline" size={26} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.applyPromptTitle}>Need Time Off?</Text>
                  <Text style={styles.applyPromptSub}>
                    Submit an application for Casual, Sick, Annual, or Personal leave.
                  </Text>
                </View>
              </View>

              <Button
                title="Apply for Leave"
                onPress={() => setShowApplyModal(true)}
                variant="primary"
                size="md"
                leftIcon={<Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />}
                style={styles.applyMainBtn}
              />
            </Card>

            {/* PART 4: Leave Balance Management Cards */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Leave Entitlement & Balances</Text>
              <Badge label="2026 Quota" variant="neutral" size="sm" />
            </View>

            <LeaveBalanceCard balance={employeeBalance} />

            {/* PART 2: Employee Metrics Grid */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Leave Overview</Text>
            </View>

            <View style={styles.statsRow}>
              <StatCard
                title="Remaining"
                value={`${employeeStats.totalRemaining}d`}
                subtitle="Available to take"
                iconName="hourglass-outline"
                iconColor={theme.colors.primary}
                iconBgColor={theme.colors.primarySubtle}
              />
              <StatCard
                title="Pending"
                value={`${employeeStats.pendingCount}`}
                subtitle="Awaiting review"
                iconName="time-outline"
                iconColor={theme.colors.warning}
                iconBgColor={theme.colors.warningSubtle}
              />
            </View>
            <View style={[styles.statsRow, { marginTop: theme.spacing.sm }]}>
              <StatCard
                title="Approved"
                value={`${employeeStats.approvedCount}`}
                subtitle="Confirmed leaves"
                iconName="checkmark-circle-outline"
                iconColor={theme.colors.success}
                iconBgColor={theme.colors.successSubtle}
              />
              <StatCard
                title="Rejected"
                value={`${employeeStats.rejectedCount}`}
                subtitle="Declined requests"
                iconName="close-circle-outline"
                iconColor={theme.colors.danger}
                iconBgColor={theme.colors.dangerSubtle}
              />
            </View>

            {/* PART 2: Leave History Section */}
            <View style={[styles.sectionHeader, { marginTop: theme.spacing.xl }]}>
              <View>
                <Text style={styles.sectionTitle}>Leave History</Text>
                <Text style={styles.sectionSubtitle}>
                  View all past submissions, dates, and HR decisions
                </Text>
              </View>
              <Badge
                label={`${employeeRequests.length} Total`}
                variant="neutral"
                size="sm"
              />
            </View>

            <LeaveHistoryList
              requests={employeeRequests}
              onSelectRequest={(req) => setSelectedRequest(req)}
              showEmployeeName={false}
            />
          </View>
        ) : (
          /* =========================================================================
             HR ADMINISTRATOR LEAVE CONSOLE
             ========================================================================= */
          <View>
            {/* PART 3: HR Overview Statistics */}
            <View style={styles.statsRow}>
              <StatCard
                title="Pending Requests"
                value={`${hrStats.pendingCount}`}
                subtitle="Requires decision"
                iconName="alert-circle"
                iconColor={theme.colors.warning}
                iconBgColor={theme.colors.warningSubtle}
              />
              <StatCard
                title="Approved"
                value={`${hrStats.approvedCount}`}
                subtitle="Granted leaves"
                iconName="checkmark-circle"
                iconColor={theme.colors.success}
                iconBgColor={theme.colors.successSubtle}
              />
            </View>
            <View style={[styles.statsRow, { marginTop: theme.spacing.sm }]}>
              <StatCard
                title="Rejected"
                value={`${hrStats.rejectedCount}`}
                subtitle="Declined leaves"
                iconName="close-circle"
                iconColor={theme.colors.danger}
                iconBgColor={theme.colors.dangerSubtle}
              />
              <StatCard
                title="Total Requests"
                value={`${hrStats.totalRequests}`}
                subtitle="Company-wide"
                iconName="documents-outline"
                iconColor={theme.colors.primary}
                iconBgColor={theme.colors.primarySubtle}
              />
            </View>

            {/* View Sub-Tabs: Requests vs Team Balances */}
            <View style={styles.subTabsContainer}>
              <TouchableOpacity
                style={[styles.subTab, hrViewTab === 'REQUESTS' && styles.subTabActive]}
                onPress={() => setHrViewTab('REQUESTS')}
              >
                <Ionicons
                  name="file-tray-full-outline"
                  size={16}
                  color={hrViewTab === 'REQUESTS' ? theme.colors.primary : theme.colors.textMuted}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.subTabText,
                    hrViewTab === 'REQUESTS' && styles.subTabTextActive,
                  ]}
                >
                  All Applications ({hrStats.totalRequests})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.subTab, hrViewTab === 'BALANCES' && styles.subTabActive]}
                onPress={() => setHrViewTab('BALANCES')}
              >
                <Ionicons
                  name="people-outline"
                  size={16}
                  color={hrViewTab === 'BALANCES' ? theme.colors.primary : theme.colors.textMuted}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.subTabText,
                    hrViewTab === 'BALANCES' && styles.subTabTextActive,
                  ]}
                >
                  Team Balances (6)
                </Text>
              </TouchableOpacity>
            </View>

            {hrViewTab === 'REQUESTS' ? (
              <View>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>Employee Leave Requests</Text>
                    <Text style={styles.sectionSubtitle}>
                      Tap any request to review details, approve or reject
                    </Text>
                  </View>
                </View>

                {/* PART 3: HR All Requests List */}
                <LeaveHistoryList
                  requests={allRequests}
                  onSelectRequest={(req) => setSelectedRequest(req)}
                  showEmployeeName={true}
                />
              </View>
            ) : (
              /* Team Balances Roster Breakdown */
              <View style={styles.rosterBalancesContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Employee Leave Balances</Text>
                </View>

                {allEmployees.map((emp) => {
                  const empBal = getEmployeeBalance(emp.id);
                  return (
                    <Card
                      key={emp.id}
                      style={styles.empBalanceCard}
                      variant="elevated"
                      padding="md"
                    >
                      <View style={styles.empBalanceHeader}>
                        <Avatar name={emp.name} size={36} backgroundColor={emp.avatarColor} />
                        <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
                          <Text style={styles.empBalanceName}>{emp.name}</Text>
                          <Text style={styles.empBalanceSub}>
                            {emp.id} • {emp.department}
                          </Text>
                        </View>
                        <Badge
                          label={`${empBal.totalRemaining}d Available`}
                          variant="primary"
                          size="sm"
                        />
                      </View>

                      <View style={styles.empBalanceGrid}>
                        <View style={styles.empBalItem}>
                          <Text style={styles.empBalLabel}>Casual</Text>
                          <Text style={styles.empBalVal}>
                            {empBal.remaining.casual}/{empBal.entitlement.casual}
                          </Text>
                        </View>
                        <View style={styles.empBalItem}>
                          <Text style={styles.empBalLabel}>Sick</Text>
                          <Text style={styles.empBalVal}>
                            {empBal.remaining.sick}/{empBal.entitlement.sick}
                          </Text>
                        </View>
                        <View style={styles.empBalItem}>
                          <Text style={styles.empBalLabel}>Annual</Text>
                          <Text style={styles.empBalVal}>
                            {empBal.remaining.annual}/{empBal.entitlement.annual}
                          </Text>
                        </View>
                        <View style={styles.empBalItem}>
                          <Text style={styles.empBalLabel}>Personal</Text>
                          <Text style={styles.empBalVal}>
                            {empBal.remaining.personal}/{empBal.entitlement.personal}
                          </Text>
                        </View>
                      </View>
                    </Card>
                  );
                })}
              </View>
            )}

            {/* Prototype Testing Controls */}
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
                Leave balances and applications persist locally in AsyncStorage.
                Balances deduct automatically upon approval and restore if rejected or cancelled.
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

      {/* PART 1: Employee Apply for Leave Modal */}
      <LeaveApplicationModal
        visible={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        employee={user}
      />

      {/* PART 2 & PART 3: Application Detail & HR Review Modal */}
      <LeaveDetailModal
        request={selectedRequest}
        visible={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        isHrAdmin={isHrAdmin}
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
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  backBtn: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.sm,
  },
  headerTitleBox: {
    flex: 1,
  },
  screenTitle: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  roleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  roleBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleBannerText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  switchBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    minHeight: 28,
  },
  switchBtnText: {
    fontSize: theme.typography.size.xs - 1,
  },
  applyPromptCard: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.xl,
  },
  applyPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  applyPromptIconBox: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  applyPromptTitle: {
    fontSize: theme.typography.size.md + 1,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  applyPromptSub: {
    fontSize: theme.typography.size.xs + 1,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  applyMainBtn: {
    width: '100%',
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
  sectionSubtitle: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  subTabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.md,
    padding: 4,
    marginVertical: theme.spacing.lg,
  },
  subTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  subTabActive: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  subTabText: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.textSecondary,
  },
  subTabTextActive: {
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.primary,
  },
  rosterBalancesContainer: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  empBalanceCard: {
    backgroundColor: theme.colors.surface,
  },
  empBalanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  empBalanceName: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  empBalanceSub: {
    fontSize: theme.typography.size.xs - 1,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  empBalanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  empBalItem: {
    alignItems: 'center',
    flex: 1,
  },
  empBalLabel: {
    fontSize: 9,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  empBalVal: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  devCard: {
    marginTop: theme.spacing.lg,
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
