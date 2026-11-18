import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme.js';
import { formatCurrency, calculateNetSalary } from '../../utils/payroll.js';

export default function SalaryBreakdownCard({
  salaryConfig = {},
  title = 'Salary Structure',
  subtitle = 'Monthly Compensation Breakdown',
}) {
  const basic = salaryConfig.basicSalary || 0;
  const allowances = salaryConfig.allowances || 0;
  const bonuses = salaryConfig.bonuses || 0;
  const deductions = salaryConfig.deductions || 0;
  const net = calculateNetSalary(basic, allowances, bonuses, deductions);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.currencyBadge}>
          <Text style={styles.currencyText}>USD / mo</Text>
        </View>
      </View>

      {/* Net Salary Highlight */}
      <View style={styles.netHighlightBox}>
        <Text style={styles.netLabel}>Estimated Net Take-Home</Text>
        <Text style={styles.netValue}>{formatCurrency(net)}</Text>
        <Text style={styles.formulaCaption}>Formula: Basic + Allowances + Bonuses - Deductions</Text>
      </View>

      {/* Itemized Rows */}
      <View style={styles.rowsContainer}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.rowLabel}>Basic Salary</Text>
          </View>
          <Text style={styles.rowValue}>{formatCurrency(basic)}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={[styles.dot, { backgroundColor: '#339AF0' }]} />
            <Text style={styles.rowLabel}>Allowances</Text>
          </View>
          <Text style={styles.rowValue}>+{formatCurrency(allowances)}</Text>
        </View>

        {bonuses > 0 && (
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.rowLabel}>Standard Bonuses</Text>
            </View>
            <Text style={[styles.rowValue, { color: COLORS.success }]}>+{formatCurrency(bonuses)}</Text>
          </View>
        )}

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={[styles.dot, { backgroundColor: COLORS.danger }]} />
            <Text style={styles.rowLabel}>Deductions (Tax & Insurance)</Text>
          </View>
          <Text style={[styles.rowValue, { color: COLORS.danger }]}>-{formatCurrency(deductions)}</Text>
        </View>
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
  currencyBadge: {
    backgroundColor: '#F1F3F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  currencyText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
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
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  netValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    marginVertical: 4,
  },
  formulaCaption: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  rowsContainer: {
    marginTop: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
});
