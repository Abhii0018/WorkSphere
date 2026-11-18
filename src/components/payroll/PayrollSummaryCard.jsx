import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme.js';
import { formatCurrency, formatMonthLabel } from '../../utils/payroll.js';

export default function PayrollSummaryCard({
  stats = {
    totalMonthlyPayroll: 0,
    totalEmployees: 0,
    paidPayrollAmount: 0,
    pendingPayrollAmount: 0,
    paidCount: 0,
    pendingCount: 0,
    totalRecords: 0,
  },
  month,
  title = 'Monthly Payroll Expenditure',
  subtitle = 'Visartech Organization-wide',
}) {
  const monthDisplay = month && month !== 'ALL' ? formatMonthLabel(month) : 'All Pay Periods';

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle} • {monthDisplay}</Text>
        </View>
        <View style={styles.currencyBadge}>
          <Text style={styles.currencyBadgeText}>USD ($)</Text>
        </View>
      </View>

      {/* Hero Stat: Total Net Monthly Payroll */}
      <View style={styles.heroBox}>
        <Text style={styles.heroLabel}>TOTAL PAYOUT EXPENDITURE</Text>
        <Text style={styles.heroAmount}>{formatCurrency(stats.totalMonthlyPayroll)}</Text>
        <Text style={styles.heroSub}>
          {stats.totalEmployees || stats.totalRecords} Employees Included in Payroll Run
        </Text>
      </View>

      {/* Summary Grid: Paid vs Pending */}
      <View style={styles.grid}>
        {/* Paid Card */}
        <View style={[styles.gridCard, { backgroundColor: '#EBFBEE', borderColor: '#D3F9D8' }]}>
          <View style={styles.gridCardHeader}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={[styles.gridCardTitle, { color: COLORS.success }]}>Paid Amount</Text>
          </View>
          <Text style={[styles.gridCardValue, { color: COLORS.success }]}>
            {formatCurrency(stats.paidPayrollAmount)}
          </Text>
          <Text style={styles.gridCardSub}>{stats.paidCount} Payslips Disbursed</Text>
        </View>

        {/* Pending Card */}
        <View style={[styles.gridCard, { backgroundColor: '#FFF9DB', borderColor: '#FFE066' }]}>
          <View style={styles.gridCardHeader}>
            <Ionicons name="time" size={16} color="#D9480F" />
            <Text style={[styles.gridCardTitle, { color: '#D9480F' }]}>Pending Amount</Text>
          </View>
          <Text style={[styles.gridCardValue, { color: '#D9480F' }]}>
            {formatCurrency(stats.pendingPayrollAmount)}
          </Text>
          <Text style={styles.gridCardSub}>{stats.pendingCount} Awaiting Payment</Text>
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
  titleCol: {
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
  currencyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  heroBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
  },
  heroAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    marginVertical: 4,
  },
  heroSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: SPACING.sm,
  },
  gridCard: {
    flex: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
  },
  gridCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  gridCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  gridCardValue: {
    fontSize: 16,
    fontWeight: '800',
    marginVertical: 2,
  },
  gridCardSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
