import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
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
  PayrollSummaryCard,
  SalaryStructureCard,
  PayrollHistoryList,
  PayrollGenerationModal,
  PayrollDetailModal,
  EditSalaryStructureModal,
  Badge,
} from '../../src/components/index.js';
import {
  formatCurrency,
  formatMonthLabel,
  getCurrentMonthKey,
  PAYROLL_STATUS,
} from '../../src/utils/payroll.js';

export default function PayrollScreen() {
  const router = useRouter();
  const { user, isHrAdmin, switchRole } = useAuth();
  const { employees, updateEmployee } = useEmployees();
  const {
    payrollRecords,
    generateMonthlyPayroll,
    updatePaymentStatus,
    getPayrollForEmployee,
    getMonthlyExpenditureStats,
    resetPayrollData,
  } = usePayroll();

  // Navigation / View Tabs for HR
  const [hrViewTab, setHrViewTab] = useState('PAYSLIPS'); // 'PAYSLIPS' | 'STRUCTURES'

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [monthFilter, setMonthFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Paid' | 'Pending'
  const [employeeFilter, setEmployeeFilter] = useState('ALL');

  // Modals state
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editStructureModalVisible, setEditStructureModalVisible] = useState(false);

  const employeeId = user?.id || 'emp-101';
  const currentEmployee = employees.find((e) => e.id === employeeId);

  // HR Expenditure Stats
  const hrExpenditureStats = getMonthlyExpenditureStats(monthFilter === 'ALL' ? undefined : monthFilter);

  // Distinct months in records
  const availableMonths = [...new Set(payrollRecords.map((r) => r.month || r.payrollMonth))].filter(Boolean).sort().reverse();

  // Records to display
  let displayedRecords = [];
  if (isHrAdmin) {
    displayedRecords = payrollRecords;
  } else {
    // Strict employee isolation: only own records
    displayedRecords = getPayrollForEmployee(employeeId, user?.id, user?.role);
  }

  // Filter records
  const filteredRecords = displayedRecords.filter((rec) => {
    // Month filter
    if (monthFilter !== 'ALL' && rec.month !== monthFilter && rec.payrollMonth !== monthFilter) {
      return false;
    }
    // Status filter
    if (statusFilter !== 'ALL' && rec.status.toUpperCase() !== statusFilter.toUpperCase()) {
      return false;
    }
    // Employee filter (HR only)
    if (isHrAdmin && employeeFilter !== 'ALL' && rec.employeeId !== employeeFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = rec.employeeName?.toLowerCase().includes(q);
      const matchId = rec.employeeId?.toLowerCase().includes(q);
      const matchDept = rec.department?.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchDept) return false;
    }
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

  const handleOpenEditStructure = (emp) => {
    setEditingEmployee(emp);
    setEditStructureModalVisible(true);
  };

  const handleSaveSalaryStructure = async (empId, newStructure) => {
    // HR modifies employee's salary structure in EmployeeContext
    await updateEmployee(empId, {
      salary: newStructure,
      salaryConfig: newStructure,
    }, user?.role);
  };

  const handleUpdatePaymentStatus = async (payrollId, newStatus, paymentDetails) => {
    try {
      const updated = await updatePaymentStatus(payrollId, newStatus, paymentDetails, user?.role);
      setSelectedPayroll((prev) =>
        prev && prev.id === payrollId ? { ...prev, ...updated } : prev
      );
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleGeneratePayroll = async (month, eligibleEmployees) => {
    await generateMonthlyPayroll(month, eligibleEmployees, user?.role);
  };

  const handleResetSamplePayroll = () => {
    Alert.alert(
      'Reset Sample Payroll Records',
      'This will restore default payroll records for October and November 2026 for all Visartech staff.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetPayrollData();
            Alert.alert('Reset Complete', 'Payroll records restored to prototype defaults.');
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
            Logged in as <Text style={styles.bold}>{user?.name}</Text> ({isHrAdmin ? 'Full Access' : 'Private View'})
          </Text>
          <TouchableOpacity style={styles.roleToggleBtn} onPress={handleRoleToggle}>
            <Ionicons name="swap-horizontal" size={14} color={COLORS.primary} />
            <Text style={styles.roleToggleText}>Switch Role</Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================================= */}
        {/* HR VIEW: Summary Card, Batch Generation, & Tab Switcher */}
        {/* ========================================================================= */}
        {isHrAdmin ? (
          <>
            {/* HR Dashboard Summary Card */}
            <PayrollSummaryCard
              stats={hrExpenditureStats}
              month={monthFilter}
              title="Payroll Expenditure Summary"
              subtitle="All 6 Visartech Employees"
            />

            {/* Run Payroll Action Button */}
            <TouchableOpacity
              style={styles.runPayrollBtn}
              onPress={() => setGenerateModalVisible(true)}
            >
              <Ionicons name="flash-outline" size={18} color={COLORS.white} />
              <Text style={styles.runPayrollBtnText}>Generate Monthly Payroll Run</Text>
            </TouchableOpacity>

            {/* HR Section Switcher (All Payslips vs Salary Structures) */}
            <View style={styles.tabSwitcher}>
              <TouchableOpacity
                style={[styles.tabBtn, hrViewTab === 'PAYSLIPS' && styles.tabBtnActive]}
                onPress={() => setHrViewTab('PAYSLIPS')}
              >
                <Ionicons
                  name="receipt-outline"
                  size={16}
                  color={hrViewTab === 'PAYSLIPS' ? COLORS.white : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.tabBtnText,
                    hrViewTab === 'PAYSLIPS' && styles.tabBtnTextActive,
                  ]}
                >
                  Monthly Payslips ({payrollRecords.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, hrViewTab === 'STRUCTURES' && styles.tabBtnActive]}
                onPress={() => setHrViewTab('STRUCTURES')}
              >
                <Ionicons
                  name="calculator-outline"
                  size={16}
                  color={hrViewTab === 'STRUCTURES' ? COLORS.white : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.tabBtnText,
                    hrViewTab === 'STRUCTURES' && styles.tabBtnTextActive,
                  ]}
                >
                  Salary Structures ({employees.length})
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* ========================================================================= */
          /* EMPLOYEE VIEW: Personal Salary Structure Card */
          /* ========================================================================= */
          <SalaryStructureCard
            salaryStructure={currentEmployee?.salaryConfig || currentEmployee?.salary}
            employeeName={user?.name}
            designation={currentEmployee?.designation || currentEmployee?.title}
            title="My Salary Structure"
            subtitle="Personal Monthly Compensation"
            isHrUser={false}
          />
        )}

        {/* ========================================================================= */}
        {/* HR VIEW TAB 2: All Employee Salary Structures */}
        {/* ========================================================================= */}
        {isHrAdmin && hrViewTab === 'STRUCTURES' ? (
          <View style={styles.structuresSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Employee Compensation Plans (6)</Text>
              <Text style={styles.sectionSub}>HR can adjust structures without affecting past payslips</Text>
            </View>

            {employees.map((emp) => (
              <SalaryStructureCard
                key={emp.id}
                salaryStructure={emp.salaryConfig || emp.salary}
                employeeName={emp.name}
                designation={`${emp.designation || emp.title} • ${emp.id}`}
                isHrUser={true}
                onEdit={() => handleOpenEditStructure(emp)}
              />
            ))}
          </View>
        ) : (
          /* ========================================================================= */
          /* PAYSLIP LIST (For both HR and Employee) */
          /* ========================================================================= */
          <>
            {/* Search Bar (HR only) */}
            {isHrAdmin && (
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by employee name or ID..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  clearButtonMode="while-editing"
                  placeholderTextColor={COLORS.textSecondary}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Filter Pills */}
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

                {/* Employee Filter Pills (HR only) */}
                {isHrAdmin && (
                  <>
                    <View style={styles.filterDivider} />
                    <TouchableOpacity
                      onPress={() => setEmployeeFilter('ALL')}
                      style={[
                        styles.filterPill,
                        employeeFilter === 'ALL' && styles.filterPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterPillText,
                          employeeFilter === 'ALL' && styles.filterPillTextActive,
                        ]}
                      >
                        All Staff
                      </Text>
                    </TouchableOpacity>
                    {employees.map((emp) => (
                      <TouchableOpacity
                        key={emp.id}
                        onPress={() => setEmployeeFilter(emp.id)}
                        style={[
                          styles.filterPill,
                          employeeFilter === emp.id && styles.filterPillActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterPillText,
                            employeeFilter === emp.id && styles.filterPillTextActive,
                          ]}
                        >
                          {emp.name.split(' ')[0]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </ScrollView>
            </View>

            {/* List Header */}
            <View style={styles.listHeaderRow}>
              <Text style={styles.listTitle}>
                {isHrAdmin ? 'Visartech Payslips' : 'My Payslip Records'} ({filteredRecords.length})
              </Text>
              {isHrAdmin && (
                <TouchableOpacity onPress={handleResetSamplePayroll}>
                  <Text style={styles.resetText}>Reset Sample</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* History List */}
            <PayrollHistoryList
              records={filteredRecords}
              isHrView={isHrAdmin}
              onSelectRecord={handleOpenDetail}
              onMarkPaid={(id) =>
                handleUpdatePaymentStatus(id, PAYROLL_STATUS.PAID, {
                  paymentMethod: 'Direct Deposit - Corporate Wire',
                  paidDate: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' }),
                })
              }
            />
          </>
        )}
      </ScrollView>

      {/* Official Payslip Detail Modal */}
      <PayrollDetailModal
        visible={detailModalVisible}
        payroll={selectedPayroll}
        onClose={() => setDetailModalVisible(false)}
        isHrUser={isHrAdmin}
        onUpdateStatus={handleUpdatePaymentStatus}
        onMarkPaid={(id, status, details) => handleUpdatePaymentStatus(id, status, details)}
      />

      {/* Monthly Payroll Generation Modal (HR Only) */}
      {isHrAdmin && (
        <PayrollGenerationModal
          visible={generateModalVisible}
          onClose={() => setGenerateModalVisible(false)}
          employees={employees}
          existingRecords={payrollRecords}
          onGenerate={handleGeneratePayroll}
        />
      )}

      {/* Edit Salary Structure Modal (HR Only) */}
      {isHrAdmin && (
        <EditSalaryStructureModal
          visible={editStructureModalVisible}
          employee={editingEmployee}
          onClose={() => {
            setEditStructureModalVisible(false);
            setEditingEmployee(null);
          }}
          onSave={handleSaveSalaryStructure}
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
  runPayrollBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.xs,
  },
  runPayrollBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#E9ECEF',
    borderRadius: RADIUS.md,
    padding: 3,
    marginVertical: SPACING.xs,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabBtnTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 9,
    marginVertical: SPACING.xs,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    padding: 0,
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
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
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
  structuresSection: {
    marginVertical: SPACING.xs,
  },
  sectionHeaderRow: {
    marginVertical: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
