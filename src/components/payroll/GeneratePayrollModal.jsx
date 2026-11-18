import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme.js';
import { formatCurrency, formatMonthLabel } from '../../utils/payroll.js';

export default function GeneratePayrollModal({
  visible,
  onClose,
  employees = [],
  onGenerate,
  existingMonths = [],
}) {
  const activeEmployees = employees.filter((e) => e.status !== 'Inactive');

  // Generate month options (e.g., last 3 months + next 2 months)
  const monthOptions = [
    { key: '2026-10', label: 'October 2026' },
    { key: '2026-11', label: 'November 2026' },
    { key: '2026-12', label: 'December 2026' },
    { key: '2027-01', label: 'January 2027' },
  ];

  const [selectedMonth, setSelectedMonth] = useState('2026-12');
  const [loading, setLoading] = useState(false);

  const totalEstimatedExpenditure = activeEmployees.reduce((sum, emp) => {
    const sc = emp.salaryConfig || {};
    const net = (sc.basicSalary || 0) + (sc.allowances || 0) + (sc.bonuses || 0) - (sc.deductions || 0);
    return sum + Math.max(0, net);
  }, 0);

  const isAlreadyGenerated = existingMonths.includes(selectedMonth);

  const handleGenerate = async () => {
    if (isAlreadyGenerated) {
      Alert.alert(
        'Payroll Already Generated',
        `Payroll records for ${formatMonthLabel(selectedMonth)} have already been generated. Duplicate records are prevented.`
      );
      return;
    }

    try {
      setLoading(true);
      await onGenerate(selectedMonth);
      Alert.alert('Success', `Payroll records for ${formatMonthLabel(selectedMonth)} generated successfully with status 'Pending'.`);
      onClose();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to generate payroll.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Generate Monthly Payroll</Text>
              <Text style={styles.headerSubtitle}>Run batch payroll for active Visartech team</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Month Selection */}
            <Text style={styles.sectionLabel}>Select Pay Period Month</Text>
            <View style={styles.monthChipsContainer}>
              {monthOptions.map((opt) => {
                const isSelected = selectedMonth === opt.key;
                const exists = existingMonths.includes(opt.key);
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => setSelectedMonth(opt.key)}
                    style={[
                      styles.monthChip,
                      isSelected && styles.monthChipSelected,
                      exists && styles.monthChipExists,
                    ]}
                  >
                    <Ionicons
                      name={exists ? 'checkmark-circle' : 'calendar-outline'}
                      size={14}
                      color={isSelected ? COLORS.white : exists ? COLORS.success : COLORS.textSecondary}
                    />
                    <Text
                      style={[
                        styles.monthChipText,
                        isSelected && styles.monthChipTextSelected,
                        exists && !isSelected && { color: COLORS.success },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {isAlreadyGenerated && (
              <View style={styles.warningBanner}>
                <Ionicons name="alert-circle" size={16} color="#D9480F" />
                <Text style={styles.warningText}>
                  Payroll for this month has already been generated.
                </Text>
              </View>
            )}

            {/* Batch Summary */}
            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Run Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Active Employees</Text>
                <Text style={styles.summaryValue}>{activeEmployees.length} Members</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Pay Period</Text>
                <Text style={styles.summaryValue}>{formatMonthLabel(selectedMonth)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Est. Net Payout</Text>
                <Text style={[styles.summaryValue, { color: COLORS.primary, fontWeight: '700' }]}>
                  {formatCurrency(totalEstimatedExpenditure)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Initial Status</Text>
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>Pending Review</Text>
                </View>
              </View>
            </View>

            {/* Information Notice */}
            <View style={styles.noticeBox}>
              <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
              <Text style={styles.noticeText}>
                All newly generated payslips are created in "Pending" status. As HR Administrator, you can review individual payslips and mark them as "Paid" once bank transfer is completed.
              </Text>
            </View>

            {/* Employee Preview List */}
            <Text style={styles.sectionLabel}>Employees Included ({activeEmployees.length})</Text>
            {activeEmployees.map((emp) => {
              const sc = emp.salaryConfig || {};
              const net = (sc.basicSalary || 0) + (sc.allowances || 0) + (sc.bonuses || 0) - (sc.deductions || 0);
              return (
                <View key={emp.id} style={styles.empRow}>
                  <View>
                    <Text style={styles.empName}>{emp.name}</Text>
                    <Text style={styles.empDept}>{emp.designation} • {emp.id}</Text>
                  </View>
                  <Text style={styles.empNet}>{formatCurrency(net)}</Text>
                </View>
              );
            })}
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.generateBtn,
                (isAlreadyGenerated || loading) && styles.generateBtnDisabled,
              ]}
              disabled={isAlreadyGenerated || loading}
              onPress={handleGenerate}
            >
              <Ionicons name="flash-outline" size={18} color={COLORS.white} />
              <Text style={styles.generateBtnText}>
                {loading ? 'Generating...' : `Generate for ${formatMonthLabel(selectedMonth)}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '88%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  content: {
    padding: SPACING.md,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.xs,
  },
  monthChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  monthChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F8F9FA',
  },
  monthChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  monthChipExists: {
    borderColor: '#C3FAE8',
    backgroundColor: '#EBFBEE',
  },
  monthChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  monthChipTextSelected: {
    color: COLORS.white,
    fontWeight: '700',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF4E6',
    padding: 10,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  warningText: {
    fontSize: 12,
    color: '#D9480F',
    flex: 1,
  },
  summaryBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    marginVertical: SPACING.xs,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  pendingBadge: {
    backgroundColor: '#FFF3BF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D9480F',
  },
  noticeBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#E7F5FF',
    padding: 12,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.sm,
    alignItems: 'flex-start',
  },
  noticeText: {
    fontSize: 12,
    color: '#1864AB',
    lineHeight: 18,
    flex: 1,
  },
  empRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  empName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  empDept: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  empNet: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  footer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  generateBtnDisabled: {
    backgroundColor: COLORS.disabled || '#ADB5BD',
  },
  generateBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
});
