import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme.js';
import PayrollCard from './PayrollCard.jsx';

export default function PayrollHistoryList({
  records = [],
  isHrView = false,
  onSelectRecord,
  onMarkPaid,
  title,
}) {
  if (records.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBox}>
          <Ionicons name="receipt-outline" size={40} color={COLORS.textSecondary} />
        </View>
        <Text style={styles.emptyTitle}>No Payroll Records Found</Text>
        <Text style={styles.emptySubtitle}>
          {isHrView
            ? 'No records match your selected month, employee, or status filter.'
            : 'You do not have any payroll records under this filter.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {title ? (
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerCount}>{records.length} {records.length === 1 ? 'Record' : 'Records'}</Text>
        </View>
      ) : null}

      {records.map((rec) => (
        <PayrollCard
          key={rec.id}
          payroll={rec}
          isHrView={isHrView}
          onPress={() => onSelectRecord && onSelectRecord(rec)}
          onMarkPaid={onMarkPaid}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerCount: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F3F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
