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
import {
  formatCurrency,
  formatMonthLabel,
  normalizeSalaryStructure,
  PAYROLL_STATUS,
} from '../../utils/payroll.js';

export default function PayrollDetailModal({
  visible,
  payroll,
  onClose,
  isHrUser = false,
  onUpdateStatus,
  onMarkPaid,
}) {
  if (!payroll) return null;

  const [loading, setLoading] = useState(false);
  const isPaid = payroll.status === PAYROLL_STATUS.PAID;
  const struct = normalizeSalaryStructure(payroll);

  const handleMarkPaid = () => {
    Alert.alert(
      'Confirm Payment Approval',
      `Approve and record payment for ${payroll.employeeName} for ${formatMonthLabel(payroll.month || payroll.payrollMonth)} in the amount of ${formatCurrency(payroll.netSalary)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Mark Paid',
          onPress: async () => {
            try {
              setLoading(true);
              const handler = onMarkPaid || onUpdateStatus;
              if (handler) {
                await handler(payroll.id, PAYROLL_STATUS.PAID, {
                  paymentMethod: 'Direct Deposit - Corporate Wire',
                  paidDate: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' }),
                });
                Alert.alert('Success', 'Payroll record marked as PAID.');
                onClose();
              }
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to update payroll.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleMarkPending = () => {
    Alert.alert(
      'Revert to Pending',
      `Revert payslip for ${payroll.employeeName} back to PENDING status?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revert to Pending',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const handler = onUpdateStatus || onMarkPaid;
              if (handler) {
                await handler(payroll.id, PAYROLL_STATUS.PENDING, {});
                Alert.alert('Updated', 'Payroll status reverted to PENDING.');
                onClose();
              }
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to update payroll.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Official Payslip</Text>
              <Text style={styles.headerSubtitle}>Visartech Technologies Inc. • Corporate Payroll</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Top Slip Info */}
            <View style={styles.payslipBanner}>
              <View>
                <Text style={styles.slipMonth}>{formatMonthLabel(payroll.month || payroll.payrollMonth)}</Text>
                <Text style={styles.slipId}>Ref ID: {payroll.id}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: isPaid ? '#EBFBEE' : '#FFF3BF' },
                ]}
              >
                <Ionicons
                  name={isPaid ? 'checkmark-circle' : 'time-outline'}
                  size={14}
                  color={isPaid ? COLORS.success : '#D9480F'}
                />
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: isPaid ? COLORS.success : '#D9480F' },
                  ]}
                >
                  {payroll.status}
                </Text>
              </View>
            </View>

            {/* Employee Information */}
            <View style={styles.infoBox}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Employee Name</Text>
                <Text style={styles.infoValue}>{payroll.employeeName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Employee ID</Text>
                <Text style={styles.infoValue}>{payroll.employeeId}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Department</Text>
                <Text style={styles.infoValue}>{payroll.department || 'Visartech'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Pay Period</Text>
                <Text style={styles.infoValue}>{formatMonthLabel(payroll.month || payroll.payrollMonth)}</Text>
              </View>
              {payroll.generatedDate && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Generated Date</Text>
                  <Text style={styles.infoValue}>{payroll.generatedDate}</Text>
                </View>
              )}
              {isPaid && (payroll.paidDate || payroll.paymentDate) && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Payment Date</Text>
                  <Text style={[styles.infoValue, { color: COLORS.success }]}>
                    {payroll.paidDate || payroll.paymentDate}
                  </Text>
                </View>
              )}
              {isPaid && payroll.paymentMethod && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Payment Method</Text>
                  <Text style={styles.infoValue}>{payroll.paymentMethod}</Text>
                </View>
              )}
            </View>

            {/* Earnings Section */}
            <Text style={styles.sectionHeading}>Earnings & Allowances</Text>
            <View style={styles.tableCard}>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Basic Salary</Text>
                <Text style={styles.tableValue}>{formatCurrency(struct.basicSalary)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>House Rent Allowance (HRA)</Text>
                <Text style={styles.tableValue}>{formatCurrency(struct.hra)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Other Allowances (Utility / Travel)</Text>
                <Text style={styles.tableValue}>{formatCurrency(struct.otherAllowances)}</Text>
              </View>
              {struct.bonus > 0 && (
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Performance Bonus</Text>
                  <Text style={[styles.tableValue, { color: COLORS.success }]}>
                    +{formatCurrency(struct.bonus)}
                  </Text>
                </View>
              )}
              <View style={[styles.tableRow, styles.subtotalRow]}>
                <Text style={styles.subtotalLabel}>Total Gross Salary</Text>
                <Text style={styles.subtotalValue}>{formatCurrency(struct.grossSalary)}</Text>
              </View>
            </View>

            {/* Deductions Section */}
            <Text style={styles.sectionHeading}>Deductions & Taxes</Text>
            <View style={styles.tableCard}>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Federal/State Taxes & Benefits</Text>
                <Text style={[styles.tableValue, { color: COLORS.danger }]}>
                  -{formatCurrency(struct.deductions)}
                </Text>
              </View>
              <View style={[styles.tableRow, styles.subtotalRow]}>
                <Text style={styles.subtotalLabel}>Total Deductions</Text>
                <Text style={[styles.subtotalValue, { color: COLORS.danger }]}>
                  -{formatCurrency(struct.deductions)}
                </Text>
              </View>
            </View>

            {/* Net Pay Callout */}
            <View style={styles.netHighlightBox}>
              <Text style={styles.netLabel}>NET DISBURSED AMOUNT</Text>
              <Text style={styles.netAmount}>{formatCurrency(payroll.netSalary)}</Text>
              <Text style={styles.netFormula}>
                Gross ({formatCurrency(struct.grossSalary)}) - Deductions ({formatCurrency(struct.deductions)})
              </Text>
            </View>

            {/* Prototype Disclaimer */}
            <Text style={styles.disclaimer}>
              This is a prototype corporate payslip generated within Visartech WorkSphere. Payment status is a local system record for workflow simulation.
            </Text>
          </ScrollView>

          {/* HR Actions Footer */}
          {isHrUser && (
            <View style={styles.footer}>
              {!isPaid ? (
                <TouchableOpacity
                  style={[styles.markPaidBtn, loading && styles.markPaidBtnDisabled]}
                  disabled={loading}
                  onPress={handleMarkPaid}
                >
                  <Ionicons name="checkmark-done" size={18} color={COLORS.white} />
                  <Text style={styles.markPaidBtnText}>
                    {loading ? 'Processing...' : 'Approve & Mark as Paid'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.revertBtn, loading && styles.markPaidBtnDisabled]}
                  disabled={loading}
                  onPress={handleMarkPending}
                >
                  <Ionicons name="arrow-undo-outline" size={18} color={COLORS.textPrimary} />
                  <Text style={styles.revertBtnText}>
                    {loading ? 'Processing...' : 'Revert to Pending'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
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
    maxHeight: '90%',
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
  payslipBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  slipMonth: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  slipId: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  tableLabel: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  tableValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  subtotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
    marginTop: 4,
    paddingTop: 8,
  },
  subtotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtotalValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  netHighlightBox: {
    backgroundColor: '#F1F3F5',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  netLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
  },
  netAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    marginVertical: 4,
  },
  netFormula: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  disclaimer: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
  },
  markPaidBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.success,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  revertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F1F3F5',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  revertBtnText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  markPaidBtnDisabled: {
    backgroundColor: COLORS.disabled || '#ADB5BD',
  },
  markPaidBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
});
