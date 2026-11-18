import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../constants/theme';

export const Badge = ({
  label,
  variant = 'primary', // 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'hr' | 'employee' | 'neutral'
  size = 'md',          // 'sm' | 'md'
  style,
  textStyle,
}) => {
  return (
    <View style={[styles.badge, styles[variant], styles[`size_${size}`], style]}>
      <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sizes
  size_sm: {
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.sm,
  },
  size_md: {
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.md - 2,
  },

  // Variants
  primary: {
    backgroundColor: theme.colors.primarySubtle,
  },
  success: {
    backgroundColor: theme.colors.successSubtle,
  },
  warning: {
    backgroundColor: theme.colors.warningSubtle,
  },
  danger: {
    backgroundColor: theme.colors.dangerSubtle,
  },
  info: {
    backgroundColor: theme.colors.infoSubtle,
  },
  hr: {
    backgroundColor: theme.colors.roleHrAdminBg,
  },
  employee: {
    backgroundColor: theme.colors.roleEmployeeBg,
  },
  neutral: {
    backgroundColor: theme.colors.surfaceSubtle,
  },

  // Text
  text: {
    fontWeight: theme.typography.weight.semibold,
  },
  text_primary: {
    color: theme.colors.primary,
  },
  text_success: {
    color: theme.colors.success,
  },
  text_warning: {
    color: theme.colors.warning,
  },
  text_danger: {
    color: theme.colors.danger,
  },
  text_info: {
    color: theme.colors.info,
  },
  text_hr: {
    color: theme.colors.roleHrAdmin,
  },
  text_employee: {
    color: theme.colors.roleEmployee,
  },
  text_neutral: {
    color: theme.colors.textSecondary,
  },

  textSize_sm: {
    fontSize: theme.typography.size.xs - 1,
  },
  textSize_md: {
    fontSize: theme.typography.size.xs,
  },
});

export default Badge;
