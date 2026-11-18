import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';
import {
  LEAVE_TYPES,
  LEAVE_TYPE_KEYS,
  calculateLeaveDays,
} from '../../utils/leave';
import { getChicagoDateKey, formatChicagoDate } from '../../utils/attendance';
import { Button, Input, Card } from '../common';
import { useLeave } from '../../context/LeaveContext';

export const LeaveApplicationModal = ({
  visible,
  onClose,
  employee,
}) => {
  const { applyLeave, getEmployeeBalance } = useLeave();
  const balance = getEmployeeBalance(employee?.id || 'emp-101');

  const todayKey = getChicagoDateKey();

  // Helper to get formatted future date string (YYYY-MM-DD)
  const getFutureDateStr = (daysToAdd = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    return getChicagoDateKey(d);
  };

  const [selectedType, setSelectedType] = useState(LEAVE_TYPES.CASUAL);
  const [startDate, setStartDate] = useState(getFutureDateStr(1));
  const [endDate, setEndDate] = useState(getFutureDateStr(1));
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto calculate total days
  const calculatedDays = calculateLeaveDays(startDate, endDate);

  // Available balance for currently selected type
  const typeKey = LEAVE_TYPE_KEYS[selectedType];
  const availableBalance = balance?.remaining?.[typeKey] ?? 0;

  // Presets for quick convenience
  const handleQuickPreset = (daysCount) => {
    const start = getFutureDateStr(1);
    const end = getFutureDateStr(daysCount);
    setStartDate(start);
    setEndDate(end);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const result = await applyLeave({
      employeeId: employee?.id || 'emp-101',
      employeeName: employee?.name || 'Alex Turner',
      department: employee?.department || 'Digital Solutions Lab',
      leaveType: selectedType,
      startDate,
      endDate,
      reason,
    });
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Leave Application Submitted',
        result.message,
        [
          {
            text: 'OK',
            onPress: () => {
              setReason('');
              onClose();
            },
          },
        ]
      );
    } else {
      Alert.alert('Application Error', result.error, [{ text: 'Revise' }]);
    }
  };

  const leaveOptions = [
    { type: LEAVE_TYPES.CASUAL, icon: 'cafe-outline' },
    { type: LEAVE_TYPES.SICK, icon: 'medkit-outline' },
    { type: LEAVE_TYPES.ANNUAL, icon: 'airplane-outline' },
    { type: LEAVE_TYPES.PERSONAL, icon: 'person-outline' },
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Apply for Leave</Text>
              <Text style={styles.subtitle}>
                {employee?.name} ({employee?.id}) • Chicago HQ
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* 1. Select Leave Type */}
            <Text style={styles.fieldLabel}>1. SELECT LEAVE TYPE</Text>
            <View style={styles.typeGrid}>
              {leaveOptions.map((opt) => {
                const isSelected = selectedType === opt.type;
                const optKey = LEAVE_TYPE_KEYS[opt.type];
                const optRem = balance?.remaining?.[optKey] ?? 0;

                return (
                  <TouchableOpacity
                    key={opt.type}
                    style={[
                      styles.typeCard,
                      isSelected && styles.typeCardSelected,
                    ]}
                    onPress={() => setSelectedType(opt.type)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.typeCardHeader}>
                      <Ionicons
                        name={opt.icon}
                        size={18}
                        color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.typeCardBalance,
                          isSelected && { color: theme.colors.primary },
                        ]}
                      >
                        {optRem}d left
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.typeCardTitle,
                        isSelected && styles.typeCardTitleSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {opt.type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 2. Date Selection */}
            <Text style={styles.fieldLabel}>2. SELECT DATES (YYYY-MM-DD)</Text>

            <View style={styles.datesRow}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Start Date"
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                  leftIcon={
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color={theme.colors.textSecondary}
                    />
                  }
                  helperText={`Min: ${todayKey}`}
                />
              </View>

              <View style={{ width: theme.spacing.md }} />

              <View style={{ flex: 1 }}>
                <Input
                  label="End Date"
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                  leftIcon={
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color={theme.colors.textSecondary}
                    />
                  }
                  helperText="Inclusive end"
                />
              </View>
            </View>

            {/* Quick Duration Presets */}
            <View style={styles.presetsRow}>
              <Text style={styles.presetLabel}>Quick Presets:</Text>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => handleQuickPreset(1)}
              >
                <Text style={styles.presetChipText}>1 Day</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => handleQuickPreset(2)}
              >
                <Text style={styles.presetChipText}>2 Days</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => handleQuickPreset(3)}
              >
                <Text style={styles.presetChipText}>3 Days</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => handleQuickPreset(5)}
              >
                <Text style={styles.presetChipText}>1 Week (5d)</Text>
              </TouchableOpacity>
            </View>

            {/* Total Days & Balance Validation Box */}
            <Card style={styles.durationCard} variant="flat" padding="md">
              <View style={styles.durationRow}>
                <View style={styles.durationIconBox}>
                  <Ionicons name="time" size={22} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.durationHeading}>
                    Requested Duration:{' '}
                    <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>
                      {calculatedDays} {calculatedDays === 1 ? 'Calendar Day' : 'Calendar Days'}
                    </Text>
                  </Text>
                  <Text style={styles.durationNote}>
                    Available {selectedType}: {availableBalance} days remaining
                  </Text>
                </View>
              </View>

              {calculatedDays > availableBalance && (
                <View style={styles.overBalanceWarning}>
                  <Ionicons name="warning" size={16} color={theme.colors.danger} />
                  <Text style={styles.overBalanceText}>
                    Duration exceeds remaining balance by {calculatedDays - availableBalance}d.
                  </Text>
                </View>
              )}
            </Card>

            {/* 3. Reason for Leave */}
            <Text style={styles.fieldLabel}>3. REASON FOR LEAVE</Text>
            <Input
              placeholder="e.g., Attending family event, medical appointment, vacation..."
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
              inputStyle={styles.reasonInput}
              helperText="Reason will be reviewed by HR Administrator (Elena Rostova)"
            />

            {/* Submit Button */}
            <Button
              title="Submit Leave Application"
              onPress={handleSubmit}
              loading={loading}
              variant="primary"
              size="lg"
              leftIcon={<Ionicons name="send-outline" size={20} color="#FFFFFF" />}
              style={styles.submitBtn}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    maxHeight: '92%',
    ...theme.shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: theme.spacing.xs,
  },
  scrollBody: {
    paddingBottom: theme.spacing.xl,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs + 2,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  typeCard: {
    width: '48.5%',
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm + 2,
  },
  typeCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySubtle,
  },
  typeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeCardBalance: {
    fontSize: 10,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textMuted,
  },
  typeCardTitle: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textSecondary,
  },
  typeCardTitleSelected: {
    color: theme.colors.primary,
  },
  datesRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
  },
  presetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: theme.spacing.md,
  },
  presetLabel: {
    fontSize: theme.typography.size.xs - 1,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weight.semibold,
  },
  presetChip: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  presetChipText: {
    fontSize: theme.typography.size.xs - 1,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weight.medium,
  },
  durationCard: {
    marginBottom: theme.spacing.md,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationIconBox: {
    marginRight: theme.spacing.sm,
  },
  durationHeading: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.textPrimary,
  },
  durationNote: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  overBalanceWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.dangerSubtle,
    gap: 4,
  },
  overBalanceText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.danger,
    fontWeight: theme.typography.weight.semibold,
  },
  reasonInput: {
    height: 70,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
});

export default LeaveApplicationModal;
