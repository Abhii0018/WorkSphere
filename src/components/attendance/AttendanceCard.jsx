import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';
import {
  formatChicagoDate,
  formatChicagoTime,
  calculateWorkingHours,
} from '../../utils/attendance';
import { Card, Button, Badge } from '../common';
import { useAttendance } from '../../context/AttendanceContext';

export const AttendanceCard = ({ employee, style }) => {
  const { getEmployeeTodayRecord, checkIn, checkOut } = useAttendance();
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(formatChicagoTime(new Date()));

  const todayRecord = getEmployeeTodayRecord(employee?.id || 'emp-101');

  // Update clock every 30 seconds for live Chicago time display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatChicagoTime(new Date()));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const isCheckedIn = !!todayRecord?.checkIn;
  const isCheckedOut = !!todayRecord?.checkOut;

  // Handle Check-In action
  const handleCheckIn = async () => {
    setLoading(true);
    const result = await checkIn(employee?.id || 'emp-101', employee?.name || 'Alex Turner');
    setLoading(false);

    if (result.success) {
      Alert.alert(result.title, result.message, [{ text: 'Great!' }]);
    } else {
      Alert.alert(result.error, result.message, [{ text: 'OK' }]);
    }
  };

  // Handle Check-Out action
  const handleCheckOut = async () => {
    Alert.alert(
      'Confirm Check-Out',
      'Are you ready to end your shift for today? Your total working hours will be calculated.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Check-Out',
          onPress: async () => {
            setLoading(true);
            const result = await checkOut(employee?.id || 'emp-101');
            setLoading(false);

            if (result.success) {
              Alert.alert(result.title, result.message, [{ text: 'Done' }]);
            } else {
              Alert.alert(result.error, result.message, [{ text: 'OK' }]);
            }
          },
        },
      ]
    );
  };

  // Calculate live working hours
  const liveWorkingHours = todayRecord?.workingHours
    ? todayRecord.workingHours
    : isCheckedIn && !isCheckedOut
    ? `${calculateWorkingHours(todayRecord.checkIn, null).formatted} (active)`
    : '--';

  // Status badge style
  const getBadgeVariant = () => {
    if (isCheckedOut) return 'info';
    if (todayRecord?.status === 'Late') return 'warning';
    if (todayRecord?.status === 'Present') return 'success';
    return 'neutral';
  };

  const getStatusLabel = () => {
    if (isCheckedOut) return 'Shift Completed';
    if (todayRecord?.status === 'Late') return 'Checked In (Late)';
    if (todayRecord?.status === 'Present') return 'Checked In (Present)';
    return 'Not Checked In';
  };

  return (
    <Card style={[styles.container, style]} variant="elevated" padding="lg">
      {/* Top Bar: Date & Status */}
      <View style={styles.topRow}>
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>{formatChicagoDate(new Date(), { weekday: 'long' })}</Text>
          <Text style={styles.fullDate}>{formatChicagoDate(new Date())}</Text>
        </View>
        <Badge
          label={getStatusLabel()}
          variant={getBadgeVariant()}
          size="md"
        />
      </View>

      {/* Chicago Digital Clock Banner */}
      <View style={styles.clockBanner}>
        <View style={styles.clockIconBox}>
          <Ionicons name="time" size={24} color={theme.colors.primary} />
        </View>
        <View>
          <Text style={styles.clockTime}>{currentTime}</Text>
          <Text style={styles.clockTimezone}>Visartech Headquarters (Chicago, US Central)</Text>
        </View>
      </View>

      {/* Metrics Row: Check-in, Check-out, Working hours */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>CHECK IN</Text>
          <Text style={styles.metricValue}>
            {todayRecord?.checkInFormatted || '--:--'}
          </Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>CHECK OUT</Text>
          <Text style={styles.metricValue}>
            {todayRecord?.checkOutFormatted || '--:--'}
          </Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>WORKING HOURS</Text>
          <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
            {liveWorkingHours}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {!isCheckedIn ? (
          <Button
            title="Check In Now"
            onPress={handleCheckIn}
            loading={loading}
            variant="primary"
            size="lg"
            leftIcon={
              <Ionicons
                name="log-in-outline"
                size={22}
                color={theme.colors.textInverse}
              />
            }
            style={styles.primaryActionBtn}
          />
        ) : !isCheckedOut ? (
          <Button
            title="Check Out"
            onPress={handleCheckOut}
            loading={loading}
            variant="danger"
            size="lg"
            leftIcon={
              <Ionicons
                name="log-out-outline"
                size={22}
                color={theme.colors.textInverse}
              />
            }
            style={styles.primaryActionBtn}
          />
        ) : (
          <View style={styles.completedNotice}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={theme.colors.success}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.completedNoticeText}>
              Today&apos;s shift is complete ({todayRecord.workingHours} recorded).
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  dateBlock: {
    flex: 1,
  },
  dateLabel: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  fullDate: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  clockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primarySubtle,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  clockIconBox: {
    marginRight: theme.spacing.md,
  },
  clockTime: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  clockTimezone: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  metricDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  actionContainer: {
    marginTop: theme.spacing.xs,
  },
  primaryActionBtn: {
    width: '100%',
  },
  completedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.successSubtle,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  completedNoticeText: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.success,
  },
});

export default AttendanceCard;
