import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../../constants/theme';

export const Card = ({
  children,
  style,
  onPress,
  variant = 'elevated', // 'elevated' | 'outlined' | 'flat'
  padding = 'lg',       // 'sm' | 'md' | 'lg' | 'none'
  activeOpacity = 0.7,
}) => {
  const paddingMap = {
    none: 0,
    sm: theme.spacing.sm,
    md: theme.spacing.md,
    lg: theme.spacing.lg,
  };

  const cardStyles = [
    styles.card,
    styles[variant],
    { padding: paddingMap[padding] ?? theme.spacing.lg },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={activeOpacity}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  elevated: {
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  flat: {
    backgroundColor: theme.colors.surfaceSubtle,
  },
});

export default Card;
