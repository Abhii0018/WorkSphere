import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import theme from '../../constants/theme';
import { getInitials } from '../../utils/formatting';

export const Avatar = ({
  name = 'User',
  imageUri,
  size = 44,
  showStatus = false,
  status = 'active', // 'active' | 'away' | 'offline'
  backgroundColor,
  textColor,
}) => {
  const statusColors = {
    active: theme.colors.success,
    away: theme.colors.warning,
    offline: theme.colors.textMuted,
  };

  const statusDotSize = Math.max(10, Math.round(size * 0.25));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: backgroundColor || theme.colors.primarySubtle,
            },
          ]}
        >
          <Text
            style={[
              styles.initials,
              {
                fontSize: Math.round(size * 0.38),
                color: textColor || theme.colors.primary,
              },
            ]}
          >
            {getInitials(name)}
          </Text>
        </View>
      )}

      {showStatus && (
        <View
          style={[
            styles.statusDot,
            {
              width: statusDotSize,
              height: statusDotSize,
              borderRadius: statusDotSize / 2,
              backgroundColor: statusColors[status] || theme.colors.success,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: theme.typography.weight.bold,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
});

export default Avatar;
