import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme, { COLORS, RADIUS, SPACING } from '../../constants/theme';

export const Badge = ({
  label,
  variant = 'primary', // 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'hr' | 'employee' | 'neutral'
  size = 'md',          // 'sm' | 'md'
  style,
  textStyle,
  dot = false,
}) => {
  return (
    <View style={[styles.badge, styles[variant], styles[`size_${size}`], style]}>
      {dot && <View style={[styles.dot, styles[`dot_${variant}`]]} />}
      <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },

  // Sizes
  size_sm: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  size_md: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },

  // Variants
  primary: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  success: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  warning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  danger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  info: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  hr: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  employee: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  neutral: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },

  // Dot Colors
  dot_primary: { backgroundColor: COLORS.primary },
  dot_success: { backgroundColor: COLORS.success },
  dot_warning: { backgroundColor: COLORS.warning },
  dot_danger: { backgroundColor: COLORS.danger },
  dot_info: { backgroundColor: COLORS.info },
  dot_hr: { backgroundColor: COLORS.roleHrAdmin },
  dot_employee: { backgroundColor: COLORS.roleEmployee },
  dot_neutral: { backgroundColor: COLORS.textMuted },

  // Text
  text: {
    fontWeight: '700',
  },
  text_primary: {
    color: '#1D4ED8',
  },
  text_success: {
    color: '#047857',
  },
  text_warning: {
    color: '#B45309',
  },
  text_danger: {
    color: '#B91C1C',
  },
  text_info: {
    color: '#0369A1',
  },
  text_hr: {
    color: '#6D28D9',
  },
  text_employee: {
    color: '#0369A1',
  },
  text_neutral: {
    color: '#475569',
  },

  // Text Sizes
  textSize_sm: {
    fontSize: 11,
    lineHeight: 14,
  },
  textSize_md: {
    fontSize: 12,
    lineHeight: 16,
  },
});

export default Badge;
