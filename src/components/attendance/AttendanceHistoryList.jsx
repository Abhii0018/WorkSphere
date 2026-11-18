import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';
import { formatChicagoDate } from '../../utils/attendance';
import { Card, Badge } from '../common';

const FILTER_TABS = [
  { key: 'ALL', label: 'All Records' },
  { key: 'PRESENT', label: 'Present' },
  { key: 'LATE', label: 'Late' },
  { key: 'ABSENT', label: 'Absent' },
];

export const AttendanceHistoryList = ({ records = [], style }) => {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filteredRecords = records.filter((rec) => {
    if (activeFilter === 'ALL') return true;
    return rec.status?.toUpperCase() === activeFilter;
  });

  const getStatusBadgeVariant = (status) => {
    switch (status?.toUpperCase()) {
      case 'PRESENT':
        return 'success';
      case 'LATE':
        return 'warning';
      case 'ABSENT':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'PRESENT':
        return 'checkmark-circle';
      case 'LATE':
        return 'alert-circle';
      case 'ABSENT':
        return 'close-circle';
      default:
        return 'time';
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* History Records List */}
      {filteredRecords.length === 0 ? (
        <Card style={styles.emptyCard} variant="flat" padding="lg">
          <Ionicons
            name="calendar-outline"
            size={36}
            color={theme.colors.textMuted}
            style={{ marginBottom: 8 }}
          />
          <Text style={styles.emptyTitle}>No Records Found</Text>
          <Text style={styles.emptySubtitle}>
            No attendance entries match the &quot;{activeFilter}&quot; filter.
          </Text>
        </Card>
      ) : (
        <View style={styles.recordsList}>
          {filteredRecords.map((item, index) => {
            const isToday = index === 0 && item.date === new Date().toISOString().split('T')[0];
            return (
              <Card
                key={`${item.employeeId}-${item.date}-${index}`}
                style={styles.recordCard}
                variant="elevated"
                padding="md"
              >
                {/* Top: Date & Status Badge */}
                <View style={styles.cardHeader}>
                  <View style={styles.dateRow}>
                    <Ionicons
                      name={getStatusIcon(item.status)}
                      size={18}
                      color={
                        item.status === 'Present'
                          ? theme.colors.success
                          : item.status === 'Late'
                          ? theme.colors.warning
                          : theme.colors.danger
                      }
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.recordDate}>
                      {formatChicagoDate(item.date)}
                    </Text>
                    {isToday && (
                      <Badge
                        label="Today"
                        variant="primary"
                        size="sm"
                        style={{ marginLeft: 6 }}
                      />
                    )}
                  </View>

                  <Badge
                    label={item.status}
                    variant={getStatusBadgeVariant(item.status)}
                    size="sm"
                  />
                </View>

                {/* Details Table */}
                <View style={styles.recordDetails}>
                  <View style={styles.detailCol}>
                    <Text style={styles.colLabel}>IN</Text>
                    <Text style={styles.colVal}>{item.checkInFormatted || '--'}</Text>
                  </View>

                  <View style={styles.detailCol}>
                    <Text style={styles.colLabel}>OUT</Text>
                    <Text style={styles.colVal}>{item.checkOutFormatted || '--'}</Text>
                  </View>

                  <View style={styles.detailCol}>
                    <Text style={styles.colLabel}>HOURS</Text>
                    <Text
                      style={[
                        styles.colVal,
                        {
                          fontWeight: theme.typography.weight.bold,
                          color:
                            item.workingHours && item.workingHours !== '--'
                              ? theme.colors.primary
                              : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      {item.workingHours || '--'}
                    </Text>
                  </View>
                </View>

                {/* Notes footer if any */}
                {item.notes ? (
                  <View style={styles.notesRow}>
                    <Text style={styles.notesText} numberOfLines={1}>
                      • {item.notes}
                    </Text>
                  </View>
                ) : null}
              </Card>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xl,
  },
  filterBar: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.textSecondary,
  },
  filterChipTextActive: {
    color: theme.colors.textInverse,
    fontWeight: theme.typography.weight.bold,
  },
  recordsList: {
    gap: theme.spacing.sm,
  },
  recordCard: {
    backgroundColor: theme.colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordDate: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  recordDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  detailCol: {
    alignItems: 'center',
    flex: 1,
  },
  colLabel: {
    fontSize: 9,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  colVal: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textPrimary,
  },
  notesRow: {
    marginTop: 6,
    paddingHorizontal: 2,
  },
  notesText: {
    fontSize: theme.typography.size.xs - 1,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.size.sm + 1,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
});

export default AttendanceHistoryList;
