import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';
import { Card, Badge, Avatar } from '../common';

export const EmployeeCard = ({ employee, onPress, style }) => {
  if (!employee) return null;

  const isActive = employee.status === 'Active';

  return (
    <Card
      style={[styles.card, style]}
      variant="elevated"
      padding="md"
      onPress={onPress}
    >
      <View style={styles.topRow}>
        <Avatar
          name={employee.name}
          size={46}
          backgroundColor={employee.avatarColor}
          textColor="#FFFFFF"
        />
        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {employee.name}
            </Text>
            <Badge
              label={employee.status || 'Active'}
              variant={isActive ? 'success' : 'neutral'}
              size="sm"
            />
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {employee.title}
          </Text>
          <Text style={styles.dept}>
            {employee.id} • {employee.department}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.contactItem}>
          <Ionicons name="mail-outline" size={14} color={theme.colors.textMuted} />
          <Text style={styles.contactText} numberOfLines={1}>
            {employee.email}
          </Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="call-outline" size={14} color={theme.colors.textMuted} />
          <Text style={styles.contactText} numberOfLines={1}>
            {employee.phone || 'No phone'}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: theme.typography.size.sm + 1,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: 6,
  },
  title: {
    fontSize: theme.typography.size.xs + 1,
    color: theme.colors.primary,
    fontWeight: theme.typography.weight.semibold,
    marginTop: 1,
  },
  dept: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '48%',
  },
  contactText: {
    fontSize: theme.typography.size.xs - 1,
    color: theme.colors.textSecondary,
  },
});

export default EmployeeCard;
