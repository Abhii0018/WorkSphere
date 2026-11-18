import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';
import { Card, Badge, Avatar } from '../common';
import { LEAVE_TYPE_COLORS } from '../../utils/leave';
import { formatChicagoDate } from '../../utils/attendance';

const FILTER_TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
];

export const LeaveHistoryList = ({
  requests = [],
  onSelectRequest,
  showEmployeeName = false,
  style,
}) => {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filteredRequests = requests.filter((req) => {
    if (activeFilter === 'ALL') return true;
    return req.status?.toUpperCase() === activeFilter;
  });

  const getStatusBadgeVariant = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return 'checkmark-circle';
      case 'PENDING':
        return 'time';
      case 'REJECTED':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          const count =
            tab.key === 'ALL'
              ? requests.length
              : requests.filter((r) => r.status?.toUpperCase() === tab.key).length;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {tab.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      {filteredRequests.length === 0 ? (
        <Card style={styles.emptyCard} variant="flat" padding="lg">
          <Ionicons
            name="calendar-outline"
            size={36}
            color={theme.colors.textMuted}
            style={{ marginBottom: 8 }}
          />
          <Text style={styles.emptyTitle}>No Leave Applications</Text>
          <Text style={styles.emptySubtitle}>
            No applications match the &quot;{activeFilter}&quot; status filter.
          </Text>
        </Card>
      ) : (
        <View style={styles.list}>
          {filteredRequests.map((item) => {
            const typeColor = LEAVE_TYPE_COLORS[item.leaveType] || theme.colors.primary;

            return (
              <Card
                key={item.id}
                style={styles.card}
                variant="elevated"
                padding="md"
                onPress={() => onSelectRequest && onSelectRequest(item)}
              >
                {/* Header: Type, Employee (if HR mode), Status */}
                <View style={styles.cardHeader}>
                  <View style={styles.headerLeft}>
                    {showEmployeeName && (
                      <View style={{ marginRight: theme.spacing.sm }}>
                        <Avatar name={item.employeeName} size={36} />
                      </View>
                    )}
                    <View>
                      {showEmployeeName && (
                        <Text style={styles.employeeName}>{item.employeeName}</Text>
                      )}
                      <View style={styles.typeBadgeRow}>
                        <View style={[styles.typeIndicator, { backgroundColor: typeColor }]} />
                        <Text style={styles.leaveType}>{item.leaveType}</Text>
                      </View>
                    </View>
                  </View>

                  <Badge
                    label={item.status}
                    variant={getStatusBadgeVariant(item.status)}
                    size="sm"
                  />
                </View>

                {/* Dates & Duration Banner */}
                <View style={styles.datesBanner}>
                  <View style={styles.dateCol}>
                    <Text style={styles.dateLabel}>FROM</Text>
                    <Text style={styles.dateValue}>{formatChicagoDate(item.startDate)}</Text>
                  </View>

                  <View style={styles.durationBadgeBox}>
                    <Text style={styles.durationDays}>{item.days}d</Text>
                    <Text style={styles.durationSub}>
                      {item.days === 1 ? 'Day' : 'Days'}
                    </Text>
                  </View>

                  <View style={styles.dateCol}>
                    <Text style={styles.dateLabel}>TO</Text>
                    <Text style={styles.dateValue}>{formatChicagoDate(item.endDate)}</Text>
                  </View>
                </View>

                {/* Reason Preview */}
                <Text style={styles.reasonText} numberOfLines={2}>
                  &ldquo;{item.reason}&rdquo;
                </Text>

                {/* Footer metadata */}
                <View style={styles.cardFooter}>
                  <Text style={styles.appliedDate}>
                    Applied: {item.appliedDateFormatted || 'Recent'}
                  </Text>
                  <View style={styles.viewDetailsRow}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={theme.colors.primary}
                    />
                  </View>
                </View>
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
    gap: 6,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.md - 2,
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
    fontSize: theme.typography.size.xs - 1,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.textSecondary,
  },
  filterChipTextActive: {
    color: theme.colors.textInverse,
    fontWeight: theme.typography.weight.bold,
  },
  list: {
    gap: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  employeeName: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  typeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  leaveType: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  datesBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xs + 2,
  },
  dateCol: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 9,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  durationBadgeBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginHorizontal: 4,
  },
  durationDays: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.primary,
  },
  durationSub: {
    fontSize: 8,
    color: theme.colors.textMuted,
  },
  reasonText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
    marginVertical: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.xs + 2,
    marginTop: 4,
  },
  appliedDate: {
    fontSize: theme.typography.size.xs - 1,
    color: theme.colors.textMuted,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: theme.typography.size.xs - 1,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.primary,
    marginRight: 2,
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

export default LeaveHistoryList;
