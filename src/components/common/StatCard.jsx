import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';
import Card from './Card';

export const StatCard = ({
  title,
  value,
  subtitle,
  iconName = 'stats-chart-outline',
  iconColor = theme.colors.primary,
  iconBgColor = theme.colors.primarySubtle,
  onPress,
  style,
}) => {
  return (
    <Card
      style={[styles.card, style]}
      onPress={onPress}
      variant="elevated"
      padding="md"
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: iconBgColor }]}>
          <Ionicons name={iconName} size={20} color={iconColor} />
        </View>
        <Text style={styles.value}>{value}</Text>
      </View>
      <View style={styles.bottomSection}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    marginVertical: theme.spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: theme.typography.size.xxl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  bottomSection: {
    marginTop: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});

export default StatCard;
