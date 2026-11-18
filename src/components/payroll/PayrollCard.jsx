import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme.js';
import {
  formatCurrency,
  formatMonthLabel,
  normalizeSalaryStructure,
  PAYROLL_STATUS,
} from '../../utils/payroll.js';

export default function PayrollCard({
  payroll,
  onPress,
  isHrView = false,
  onMarkPaid,
}) {
  if (!payroll) return null;

  const isPaid = payroll.status === PAYROLL_STATUS.PAID;
  const struct = normalizeSalaryStructure(payroll);
  const monthKey = payroll.month || payroll.payrollMonth;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View style={styles.monthBadge}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
          <Text style={styles.monthText}>{formatMonthLabel(monthKey)}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: isPaid ? '#EBFBEE' : '#FFF3BF' },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isPaid ? COLORS.success : '#F08C00' },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: isPaid ? COLORS.success : '#D9480F' },
            ]}
          >
            {payroll.status}
          </Text>
        </View>
      </View>

      {/* Main Info */}
      <View style={styles.mainRow}>
        <View style={styles.infoCol}>
          {isHrView ? (
            <>
              <Text style={styles.employeeName}>{payroll.employeeName}</Text>
              <Text style={styles.employeeId}>{payroll.employeeId} • {payroll.department}</Text>
            </>
          ) : (
            <>
              <Text style={styles.netPayLabel}>Net Take-Home</Text>
              <Text style={styles.payslipNumber}>Ref: {payroll.id}</Text>
            </>
          )}
        </View>
        <View style={styles.amountCol}>
          <Text style={styles.netAmount}>{formatCurrency(payroll.netSalary)}</Text>
          <Text style={styles.grossCaption}>Gross: {formatCurrency(struct.grossSalary)}</Text>
        </View>
      </View>

      {/* Breakdown Pills */}
      <View style={styles.breakdownRow}>
        <View style={styles.breakdownPill}>
          <Text style={styles.pillLabel}>Basic</Text>
          <Text style={styles.pillValue}>{formatCurrency(struct.basicSalary)}</Text>
        </View>
        {struct.hra > 0 && (
          <View style={styles.breakdownPill}>
            <Text style={styles.pillLabel}>HRA</Text>
            <Text style={styles.pillValue}>{formatCurrency(struct.hra)}</Text>
          </View>
        )}
        {struct.otherAllowances > 0 && (
          <View style={styles.breakdownPill}>
            <Text style={styles.pillLabel}>Other All.</Text>
            <Text style={styles.pillValue}>{formatCurrency(struct.otherAllowances)}</Text>
          </View>
        )}
        {struct.bonus > 0 && (
          <View style={[styles.breakdownPill, { backgroundColor: '#EBFBEE' }]}>
            <Text style={[styles.pillLabel, { color: COLORS.success }]}>Bonus</Text>
            <Text style={[styles.pillValue, { color: COLORS.success }]}>+{formatCurrency(struct.bonus)}</Text>
          </View>
        )}
        <View style={[styles.breakdownPill, { backgroundColor: '#FFF5F5' }]}>
          <Text style={[styles.pillLabel, { color: COLORS.danger }]}>Deductions</Text>
          <Text style={[styles.pillValue, { color: COLORS.danger }]}>-{formatCurrency(struct.deductions)}</Text>
        </View>
      </View>

      {/* Quick Action footer if Pending and HR view */}
      {isHrView && !isPaid && onMarkPaid && (
        <View style={styles.actionFooter}>
          <TouchableOpacity
            style={styles.payNowBtn}
            onPress={(e) => {
              e.stopPropagation();
              onMarkPaid(payroll.id);
            }}
          >
            <Ionicons name="card-outline" size={14} color={COLORS.white} />
            <Text style={styles.payNowBtnText}>Mark as Paid</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginVertical: SPACING.xs,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  monthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F3F5',
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  monthText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING.xs + 4,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  infoCol: {
    flex: 1,
  },
  employeeName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  employeeId: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  netPayLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  payslipNumber: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  amountCol: {
    alignItems: 'flex-end',
  },
  netAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  grossCaption: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  breakdownRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight || '#F1F3F5',
  },
  breakdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  pillLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  pillValue: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  actionFooter: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight || '#F1F3F5',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  payNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  payNowBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
});
