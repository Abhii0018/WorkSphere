import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import theme from '../../constants/theme';

export const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size = 'md',          // 'sm' | 'md' | 'lg'
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}) => {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    disabled && styles.disabled,
    style,
  ];

  const textColorStyles = [
    styles.baseText,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const getSpinnerColor = () => {
    if (variant === 'primary' || variant === 'danger' || variant === 'secondary') {
      return theme.colors.textInverse;
    }
    return theme.colors.primary;
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getSpinnerColor()} />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
          <Text style={textColorStyles}>{title}</Text>
          {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIconContainer: {
    marginRight: theme.spacing.sm,
  },
  rightIconContainer: {
    marginLeft: theme.spacing.sm,
  },

  // Variants
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  danger: {
    backgroundColor: theme.colors.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
  },

  // Sizes
  size_sm: {
    paddingVertical: theme.spacing.xs + 2,
    paddingHorizontal: theme.spacing.md,
    minHeight: 34,
  },
  size_md: {
    paddingVertical: theme.spacing.md - 2,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 46,
  },
  size_lg: {
    paddingVertical: theme.spacing.md + 2,
    paddingHorizontal: theme.spacing.xl,
    minHeight: 54,
    borderRadius: theme.borderRadius.lg,
  },

  // Text
  baseText: {
    fontWeight: theme.typography.weight.semibold,
    textAlign: 'center',
  },
  text_primary: {
    color: theme.colors.textInverse,
  },
  text_secondary: {
    color: theme.colors.textInverse,
  },
  text_outline: {
    color: theme.colors.primary,
  },
  text_danger: {
    color: theme.colors.textInverse,
  },
  text_ghost: {
    color: theme.colors.primary,
  },

  textSize_sm: {
    fontSize: theme.typography.size.sm,
  },
  textSize_md: {
    fontSize: theme.typography.size.md,
  },
  textSize_lg: {
    fontSize: theme.typography.size.lg,
  },

  disabled: {
    backgroundColor: theme.colors.border,
    borderColor: theme.colors.border,
    opacity: 0.7,
  },
  disabledText: {
    color: theme.colors.textMuted,
  },
});

export default Button;
