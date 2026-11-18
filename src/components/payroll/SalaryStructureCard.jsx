import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme.js';
import {
  formatCurrency,
  normalizeSalaryStructure,
} from '../../utils/payroll.js';

export default function SalaryStructureCard({
  salaryStructure = {},
  employeeName,
  designation,
  title = 'Salary Structure',
  subtitle = 'Monthly Compensation Breakdown',
  isHrUser = false,
  onEdit,
}) {
  const struct = normalizeSalaryStructure(salaryStructure);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          {employeeName ? (
            <Text style={styles.subtitle}>
              {employeeName} {designation ? `• ${designation}` : ''}
            </Text>
          ) : subtitle ? (
            <Text style={styles.subtitle}>{subtitle}</Text>
          ) : null}
        </View>

        {isHrUser && onEdit && (
          <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
            <Ionicons name="create-outline" size={14} color={COLORS.primary} />
            <Text style={styles.editBtnText}>Edit Structure</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Net Salary Highlight Box */}
      <View style={styles.netHighlightBox}>
        <Text style={styles.netLabel}>MONTHLY TAKE-HOME (NET PAY)</Text>
        <Text style={styles.netValue}>{formatCurrency(struct.netSalary)}</Text>
        <Text style={styles.formulaCaption}>Gross ({formatCurrency(struct.grossSalary)}) - Deductions ({formatCurrency(struct.deductions)})</Text>
      </View>

      {/* Line Item Breakdown */}
      <View style={styles.sectionDivider}>
        <Text style={styles.sectionHeader}>Earnings & Allowances</Text>
      </View>

      <View style={styles.rowsContainer}>
        {/* Basic Salary */}
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.rowLabel}>Basic Salary</Text>
          </View>
          <Text style={styles.rowValue}>{formatCurrency(struct.basicSalary)}</Text>
        </View>

        {/* House Rent Allowance (HRA) */}
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={[styles.dot, { backgroundColor: '#339AF0' }]} />
            <Text style={styles.rowLabel}>House Rent Allowance (HRA)</Text>
          </View>
          <Text style={styles.rowValue}>+{formatCurrency(struct.hra)}</Text>
        </View>

        {/* Other Allowances */}
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={[styles.dot, { backgroundColor: '#20C997' }]} />
            <Text style={styles.rowLabel}>Other Allowances (Utility / Transport)</Text>
          </View>
          <Text style={styles.rowValue}>+{formatCurrency(struct.otherAllowances)}</Text>
        </View>

        {/* Bonus */}
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
            <Text style={styles.rowLabel}>Monthly Performance Bonus</Text>
          </View>
          <Text style={[styles.rowValue, { color: COLORS.success }]}>+{formatCurrency(struct.bonus)}</Text>
        </View>

        {/* Gross Total Row */}
        <View style={[styles.row, styles.grossRow]}>
          <Text style={styles.grossLabel}>Total Gross Salary</Text>
          <Text style={styles.grossValue}>{formatCurrency(struct.grossSalary)}</Text>
        </View>
      </View>

      {/* Deductions Breakdown */}
      <View style={styles.sectionDivider}>
        <Text style={styles.sectionHeader}>Deductions & Taxes</Text>
      </View>

      <View style={styles.rowsContainer}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={[styles.dot, { backgroundColor: COLORS.danger }]} />
            <Text style={styles.rowLabel}>Tax Withholdings, Healthcare & Benefits</Text>
          </View>
          <Text style={[styles.rowValue, { color: COLORS.danger }]}>-{formatCurrency(struct.deductions)}</Text>
        </View>
      </View>

      {/* Official Footnote */}
      <View style={styles.footnoteRow}>
        <Ionicons name="shield-checkmark-outline" size={13} color={COLORS.textSecondary} />
        <Text style={styles.footnoteText}>
          {isHrUser
            ? 'HR-Managed: Modifications update future payroll runs without altering past payslips.'
            : 'Official corporate compensation structure managed by Visartech HR.'}
        </Text>
      </View>
    </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E7F5FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  netHighlightBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  netLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
  },
  netValue: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    marginVertical: 4,
  },
  formulaCaption: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  sectionDivider: {
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowsContainer: {
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  rowLabel: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  grossRow: {
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    marginTop: 4,
    paddingTop: 8,
  },
  grossLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  grossValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  footnoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.md,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
  },
  footnoteText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
  },
});
