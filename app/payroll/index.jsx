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
import theme, { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../src/constants/theme.js';
import { COMPANY_INFO, USER_ROLES } from '../../src/constants/company.js';
import { useAuth } from '../../src/hooks/useAuth.js';
import { usePayroll } from '../../src/context/PayrollContext.jsx';
import { useEmployees } from '../../src/context/EmployeeContext.jsx';
import {
  PayrollCard,
  SalaryBreakdownCard,
  GeneratePayrollModal,
  PayrollDetailModal,
  Badge,
} from '../../src/components/index.js';
import {
  formatCurrency,
  formatMonthLabel,
  PAYROLL_STATUS,
} from '../../src/utils/payroll.js';

export default function PayrollScreen() {
  const router = useRouter();
  const { user, isHrAdmin, switchRole } = useAuth();
  const { employees } = useEmployees();
  const {
    payrollRecords,
    generateMonthlyPayroll,
    updatePaymentStatus,
    getPayrollForEmployee,
    getMonthlyExpenditureStats,
    resetPayrollData,
  } = usePayroll();

  const [monthFilter, setMonthFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Paid' | 'Pending'

  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [generateModalVisible, setGenerateModalVisible] = useState(false);

  const employeeId = user?.id || 'emp-101';
  const currentEmployee = employees.find((e) => e.id === employeeId);

  // HR Stats
  const hrExpenditureStats = getMonthlyExpenditureStats(monthFilter === 'ALL' ? undefined : monthFilter);

  // Distinct months in records
  const availableMonths = [...new Set(payrollRecords.map((r) => r.month))].sort().reverse();

  // Records to display
  let displayedRecords = [];
  if (isHrAdmin) {
    displayedRecords = payrollRecords;
  } else {
    // Strict employee isolation
    displayedRecords = getPayrollForEmployee(employeeId, user?.id, user?.role);
  }

  // Filter records
  const filteredRecords = displayedRecords.filter((rec) => {
    if (monthFilter !== 'ALL' && rec.month !== monthFilter) return false;
    if (statusFilter !== 'ALL' && rec.status !== statusFilter) return false;
    return true;
  });

  const handleRoleToggle = () => {
    const nextRole = isHrAdmin ? USER_ROLES.EMPLOYEE : USER_ROLES.HR_ADMIN;
    switchRole(nextRole);
  };

  const handleOpenDetail = (payroll) => {
    setSelectedPayroll(payroll);
    setDetailModalVisible(true);
  };

  const handleMarkPaid = async (payrollId, paymentDetails) => {
    try {
      await updatePaymentStatus(payrollId, PAYROLL_STATUS.PAID, paymentDetails, user?.role);
      // update local selected
      setSelectedPayroll((prev) =>
        prev && prev.id === payrollId
          ? {
              ...prev,
              status: PAYROLL_STATUS.PAID,
              paidDate: paymentDetails?.paidDate || new Date().toISOString().split('T')[0],
              paymentMethod: paymentDetails?.paymentMethod || 'Direct Deposit',
            }
          : prev
      );
    } catch (err) {
      Alert.alert('Permission / Error', err.message);
    }
  };

  const handleGeneratePayroll = async (month) => {
    await generateMonthlyPayroll(month, employees, user?.role);
  };

  const handleResetSamplePayroll = () => {
    Alert.alert(
      'Reset Sample Payroll',
      'This will restore all default payroll records for October and November 2026.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetPayrollData();
            Alert.alert('Reset Complete', 'Payroll records restored to defaults.');
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
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={styles.screenTitle}>
              {isHrAdmin ? 'Payroll Administration' : 'My Salary & Payslips'}
            </Text>
            <Text style={styles.subtitle}>
              {COMPANY_INFO.name} • {isHrAdmin ? 'Company Financials' : user?.name}
            </Text>
          </View>
          <Badge
            label={isHrAdmin ? 'HR Admin' : 'Employee'}
            variant={isHrAdmin ? 'primary' : 'info'}
            size="sm"
          />
        </View>

        {/* Demo Switcher Pill */}
        <View style={styles.roleBar}>
          <Text style={styles.roleBarText}>
            Logged in as <Text style={styles.bold}>{user?.name}</Text> ({isHrAdmin ? 'All Records' : 'Private View'})
          </Text>
          <TouchableOpacity style={styles.roleToggleBtn} onPress={handleRoleToggle}>
            <Ionicons name="swap-horizontal" size={14} color={COLORS.primary} />
            <Text style={styles.roleToggleText}>Switch Role</Text>
          </TouchableOpacity>
        </View>

        {/* HR Dashboard: Expenditure Overview & Action */}
        {isHrAdmin ? (
          <View style={styles.hrStatsSection}>
            <View style={styles.expenditureHeaderRow}>
              <View>
                <Text style={styles.expenditureLabel}>
                  {monthFilter === 'ALL' ? 'Total Payouts (All Periods)' : `Expenditure (${formatMonthLabel(monthFilter)})`}
                </Text>
                <Text style={styles.expenditureAmount}>
                  {formatCurrency(hrExpenditureStats.totalNetSalary)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.generateBtn}
                onPress={() => setGenerateModalVisible(true)}
              >
                <Ionicons name="add-circle-outline" size={16} color={COLORS.white} />
                <Text style={styles.generateBtnText}>Run Payroll</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsCardsRow}>
              <View style={styles.statMiniCard}>
                <Text style={[styles.statMiniValue, { color: COLORS.success }]}>
                  {formatCurrency(hrExpenditureStats.totalPaid)}
                </Text>
                <Text style={styles.statMiniLabel}>Paid ({hrExpenditureStats.paidCount})</Text>
              </View>
              <View style={styles.statMiniCard}>
                <Text style={[styles.statMiniValue, { color: '#F08C00' }]}>
                  {formatCurrency(hrExpenditureStats.totalPending)}
                </Text>
                <Text style={styles.statMiniLabel}>Pending ({hrExpenditureStats.pendingCount})</Text>
              </View>
              <View style={styles.statMiniCard}>
                <Text style={styles.statMiniValue}>{hrExpenditureStats.totalRecords}</Text>
                <Text style={styles.statMiniLabel}>Total Slips</Text>
              </View>
            </View>
          </View>
        ) : (
          /* Employee Dashboard: Salary Structure Breakdown */
          <SalaryBreakdownCard
            salaryConfig={currentEmployee?.salaryConfig}
            title="My Compensation Structure"
            subtitle={`${currentEmployee?.designation} • ${currentEmployee?.department}`}
          />
        )}

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {/* Status Pills */}
            {['ALL', PAYROLL_STATUS.PAID, PAYROLL_STATUS.PENDING].map((st) => (
              <TouchableOpacity
                key={st}
                onPress={() => setStatusFilter(st)}
                style={[
                  styles.filterPill,
                  statusFilter === st && styles.filterPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    statusFilter === st && styles.filterPillTextActive,
                  ]}
                >
                  {st === 'ALL' ? 'All Status' : st}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.filterDivider} />

            {/* Month Pills */}
            <TouchableOpacity
              onPress={() => setMonthFilter('ALL')}
              style={[
                styles.filterPill,
                monthFilter === 'ALL' && styles.filterPillActive,
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  monthFilter === 'ALL' && styles.filterPillTextActive,
                ]}
              >
                All Months
              </Text>
            </TouchableOpacity>

            {availableMonths.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setMonthFilter(m)}
                style={[
                  styles.filterPill,
                  monthFilter === m && styles.filterPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    monthFilter === m && styles.filterPillTextActive,
                  ]}
                >
                  {formatMonthLabel(m)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Payslips List */}
        <View style={styles.listSection}>
          <View style={styles.listHeaderRow}>
            <Text style={styles.listTitle}>
              {isHrAdmin ? 'Team Payslip Records' : 'My Payslip History'} ({filteredRecords.length})
            </Text>
            {isHrAdmin && (
              <TouchableOpacity onPress={handleResetSamplePayroll}>
                <Text style={styles.resetText}>Reset Sample</Text>
              </TouchableOpacity>
            )}
          </View>

          {filteredRecords.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>No Payslips Found</Text>
              <Text style={styles.emptySubtitle}>No records match your selected month or filter.</Text>
            </View>
          ) : (
            filteredRecords.map((payroll) => (
              <PayrollCard
                key={payroll.id}
                payroll={payroll}
                isHrView={isHrAdmin}
                onPress={() => handleOpenDetail(payroll)}
                onMarkPaid={(id) => handleMarkPaid(id, { paymentMethod: 'Direct Deposit' })}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Payroll Detail Modal (Official Payslip) */}
      <PayrollDetailModal
        visible={detailModalVisible}
        payroll={selectedPayroll}
        onClose={() => setDetailModalVisible(false)}
        isHrUser={isHrAdmin}
        onMarkPaid={handleMarkPaid}
      />

      {/* Generate Payroll Modal (HR Only) */}
      {isHrAdmin && (
        <GeneratePayrollModal
          visible={generateModalVisible}
          onClose={() => setGenerateModalVisible(false)}
          employees={employees}
          onGenerate={handleGeneratePayroll}
          existingMonths={availableMonths}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: 8,
  },
  backBtn: {
    padding: 6,
    borderRadius: RADIUS.md,
  },
  headerTitleBox: {
    flex: 1,
  },
  screenTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  roleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.xs,
  },
  roleBarText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  bold: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  roleToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  hrStatsSection: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  expenditureHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  expenditureLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  expenditureAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  generateBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  statsCardsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
  },
  statMiniCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: RADIUS.sm,
    padding: 8,
    alignItems: 'center',
  },
  statMiniValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statMiniLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  filterSection: {
    marginVertical: SPACING.xs,
  },
  filterScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  filterDivider: {
    width: 1,
    height: 18,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  listSection: {
    marginTop: SPACING.sm,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  listTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resetText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
