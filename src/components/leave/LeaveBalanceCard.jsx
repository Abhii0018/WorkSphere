import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';
import { Card, Badge } from '../common';
import { LEAVE_TYPE_COLORS } from '../../utils/leave';

export const LeaveBalanceCard = ({ balance, style }) => {
  if (!balance) return null;

  const categories = [
    {
      title: 'Casual Leave',
      key: 'casual',
      color: LEAVE_TYPE_COLORS['Casual Leave'],
      icon: 'cafe-outline',
      entitled: balance.entitlement?.casual || 10,
      used: balance.used?.casual || 0,
      remaining: balance.remaining?.casual ?? 10,
    },
    {
      title: 'Sick Leave',
      key: 'sick',
      color: LEAVE_TYPE_COLORS['Sick Leave'],
      icon: 'medkit-outline',
      entitled: balance.entitlement?.sick || 10,
      used: balance.used?.sick || 0,
      remaining: balance.remaining?.sick ?? 10,
    },
    {
      title: 'Annual Leave',
      key: 'annual',
      color: LEAVE_TYPE_COLORS['Annual Leave'],
      icon: 'airplane-outline',
      entitled: balance.entitlement?.annual || 15,
      used: balance.used?.annual || 0,
      remaining: balance.remaining?.annual ?? 15,
    },
    {
      title: 'Personal Leave',
      key: 'personal',
      color: LEAVE_TYPE_COLORS['Personal Leave'],
      icon: 'person-outline',
      entitled: balance.entitlement?.personal || 5,
      used: balance.used?.personal || 0,
      remaining: balance.remaining?.personal ?? 5,
    },
  ];

  return (
    <View style={[styles.container, style]}>
      {/* Total Balance Summary Header Card */}
      <Card style={styles.summaryCard} variant="elevated" padding="md">
        <View style={styles.summaryRow}>
          <View style={styles.summaryIconBox}>
            <Ionicons name="calendar" size={26} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryLabel}>TOTAL LEAVE ENTITLEMENT</Text>
            <Text style={styles.summaryValue}>
              {balance.totalRemaining}{' '}
              <Text style={styles.summaryTotal}>/ {balance.totalEntitled} Days Left</Text>
            </Text>
          </View>
          <Badge
            label={`${balance.totalUsed} Used`}
            variant="neutral"
            size="md"
          />
        </View>
      </Card>

      {/* Grid of 4 Leave Categories */}
      <View style={styles.categoriesGrid}>
        {categories.map((cat) => {
          const percentUsed = Math.min(100, Math.round((cat.used / cat.entitled) * 100));
          return (
            <Card
              key={cat.key}
              style={styles.categoryCard}
              variant="elevated"
              padding="md"
            >
              <View style={styles.catHeader}>
                <View style={[styles.catIconCircle, { backgroundColor: cat.color + '15' }]}>
                  <Ionicons name={cat.icon} size={18} color={cat.color} />
                </View>
                <Text style={styles.catRemaining}>{cat.remaining}d</Text>
              </View>

              <Text style={styles.catTitle} numberOfLines={1}>
                {cat.title}
              </Text>
              <Text style={styles.catSub}>
                {cat.used} of {cat.entitled} days used
              </Text>

              {/* Progress Bar */}
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${percentUsed}%`,
                      backgroundColor: cat.color,
                    },
                  ]}
                />
              </View>
            </Card>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconBox: {
    width: 46,
    height: 46,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
  },
  summaryValue: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  summaryTotal: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weight.medium,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryCard: {
    width: '48.5%',
    backgroundColor: theme.colors.surface,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  catIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catRemaining: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  catTitle: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  catSub: {
    fontSize: theme.typography.size.xs - 1,
    color: theme.colors.textMuted,
    marginTop: 2,
    marginBottom: theme.spacing.sm,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default LeaveBalanceCard;
