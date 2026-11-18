import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme, { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

export const StatCard = ({
  title,
  value,
  subtitle,
  iconName = 'stats-chart-outline',
  iconColor = COLORS.primary,
  iconBgColor = COLORS.primarySubtle,
  onPress,
  style,
  trend, // optional: e.g. { label: '+4%', isPositive: true }
}) => {
  const content = (
    <View style={[styles.card, SHADOWS.sm, style]}>
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: iconBgColor }]}>
          <Ionicons name={iconName} size={18} color={iconColor} />
        </View>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: trend.isPositive ? '#ECFDF5' : '#FEF2F2' }]}>
            <Ionicons
              name={trend.isPositive ? 'arrow-up' : 'arrow-down'}
              size={10}
              color={trend.isPositive ? COLORS.success : COLORS.danger}
            />
            <Text style={[styles.trendText, { color: trend.isPositive ? COLORS.success : COLORS.danger }]}>
              {trend.label}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.value} numberOfLines={1}>{value}</Text>
      </View>

      <View style={styles.labelSection}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.touchable}
        activeOpacity={0.75}
        onPress={onPress}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.touchable}>{content}</View>;
};

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    minWidth: 140,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: SPACING.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    gap: 2,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
  },
  valueRow: {
    marginVertical: 2,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  labelSection: {
    marginTop: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
});

export default StatCard;
