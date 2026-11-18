import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';
import { Badge, Button, Input, Card, Avatar } from '../common';
import { LEAVE_TYPE_COLORS } from '../../utils/leave';
import { formatChicagoDate } from '../../utils/attendance';
import { useLeave } from '../../context/LeaveContext';

export const LeaveDetailModal = ({
  request,
  visible,
  onClose,
  isHrAdmin = false,
}) => {
  const { approveLeave, rejectLeave, cancelLeave } = useLeave();
  const [hrComment, setHrComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showReviewInput, setShowReviewInput] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'approve' | 'reject'

  if (!request) return null;

  const typeColor = LEAVE_TYPE_COLORS[request.leaveType] || theme.colors.primary;

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

  // HR Approve Handler
  const handleApprove = async () => {
    setActionLoading(true);
    const result = await approveLeave(request.id, hrComment);
    setActionLoading(false);
    setShowReviewInput(false);
    setHrComment('');

    if (result.success) {
      Alert.alert('Leave Approved', result.message, [
        {
          text: 'OK',
          onPress: onClose,
        },
      ]);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  // HR Reject Handler
  const handleReject = async () => {
    setActionLoading(true);
    const result = await rejectLeave(request.id, hrComment);
    setActionLoading(false);
    setShowReviewInput(false);
    setHrComment('');

    if (result.success) {
      Alert.alert('Leave Rejected', result.message, [
        {
          text: 'OK',
          onPress: onClose,
        },
      ]);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  // Employee Cancel Handler
  const handleCancelApplication = () => {
    Alert.alert(
      'Cancel Leave Application',
      'Are you sure you want to withdraw this leave request?',
      [
        { text: 'Keep Application', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            const result = await cancelLeave(request.id);
            setActionLoading(false);
            if (result.success) {
              Alert.alert('Withdrawn', result.message, [{ text: 'OK', onPress: onClose }]);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Avatar name={request.employeeName} size={42} />
              <View style={styles.headerTitleBox}>
                <Text style={styles.empName}>{request.employeeName}</Text>
                <Text style={styles.empSub}>
                  {request.employeeId} • {request.department}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Status & Type Bar */}
            <View style={styles.statusBar}>
              <View style={styles.typeBadgeRow}>
                <View style={[styles.typeDot, { backgroundColor: typeColor }]} />
                <Text style={styles.typeText}>{request.leaveType}</Text>
              </View>
              <Badge
                label={request.status}
                variant={getStatusBadgeVariant(request.status)}
                size="md"
              />
            </View>

            {/* Dates & Duration Card */}
            <Card style={styles.detailsCard} variant="flat" padding="md">
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date Range:</Text>
                <Text style={styles.metaVal}>
                  {formatChicagoDate(request.startDate)} to {formatChicagoDate(request.endDate)}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Duration:</Text>
                <Text style={[styles.metaVal, { color: theme.colors.primary, fontWeight: '700' }]}>
                  {request.days} {request.days === 1 ? 'Calendar Day' : 'Calendar Days'}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Applied On:</Text>
                <Text style={styles.metaVal}>
                  {request.appliedDateFormatted || 'Recent'}
                </Text>
              </View>
            </Card>

            {/* Reason */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionHeading}>REASON FOR LEAVE</Text>
              <Card style={styles.reasonCard} variant="outlined" padding="md">
                <Text style={styles.reasonText}>{request.reason}</Text>
              </Card>
            </View>

            {/* HR Decision & Comments Section if already reviewed */}
            {request.reviewedBy && (
              <View style={styles.sectionBox}>
                <Text style={styles.sectionHeading}>HR DECISION RECORD</Text>
                <Card
                  style={[
                    styles.reviewCard,
                    request.status === 'Approved'
                      ? styles.reviewCardApproved
                      : styles.reviewCardRejected,
                  ]}
                  variant="outlined"
                  padding="md"
                >
                  <View style={styles.reviewerRow}>
                    <Ionicons
                      name={
                        request.status === 'Approved'
                          ? 'checkmark-circle'
                          : 'close-circle'
                      }
                      size={20}
                      color={
                        request.status === 'Approved'
                          ? theme.colors.success
                          : theme.colors.danger
                      }
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.reviewerName}>{request.reviewedBy}</Text>
                  </View>

                  <Text style={styles.reviewComment}>
                    &ldquo;{request.hrComment || 'No comments recorded.'}&rdquo;
                  </Text>
                  <Text style={styles.reviewDate}>
                    Reviewed: {formatChicagoDate(request.reviewedAt)}
                  </Text>
                </Card>
              </View>
            )}

            {/* HR Decision Action Panel (for Pending requests when HR Admin is viewing) */}
            {isHrAdmin && request.status === 'Pending' && (
              <View style={styles.hrActionSection}>
                <Text style={styles.sectionHeading}>HR ACTION REQUIRED</Text>

                {showReviewInput ? (
                  <View style={styles.commentContainer}>
                    <Input
                      label={`Add optional comment (${pendingAction === 'approve' ? 'Approval' : 'Rejection'})`}
                      placeholder="e.g., Handover confirmed, please document notes..."
                      value={hrComment}
                      onChangeText={setHrComment}
                      multiline
                      numberOfLines={2}
                    />

                    <View style={styles.actionBtnRow}>
                      <Button
                        title={pendingAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                        onPress={pendingAction === 'approve' ? handleApprove : handleReject}
                        loading={actionLoading}
                        variant={pendingAction === 'approve' ? 'primary' : 'danger'}
                        size="md"
                        style={{ flex: 1 }}
                      />
                      <Button
                        title="Cancel"
                        onPress={() => setShowReviewInput(false)}
                        variant="ghost"
                        size="md"
                      />
                    </View>
                  </View>
                ) : (
                  <View style={styles.actionBtnRow}>
                    <Button
                      title="Approve Request"
                      onPress={() => {
                        setPendingAction('approve');
                        setShowReviewInput(true);
                      }}
                      variant="primary"
                      size="md"
                      leftIcon={<Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />}
                      style={{ flex: 1 }}
                    />
                    <Button
                      title="Reject"
                      onPress={() => {
                        setPendingAction('reject');
                        setShowReviewInput(true);
                      }}
                      variant="outline"
                      size="md"
                      leftIcon={<Ionicons name="close-circle-outline" size={18} color={theme.colors.danger} />}
                      style={{ flex: 1, borderColor: theme.colors.danger }}
                      textStyle={{ color: theme.colors.danger }}
                    />
                  </View>
                )}
              </View>
            )}

            {/* Employee Cancel Action (if employee and pending) */}
            {!isHrAdmin && request.status === 'Pending' && (
              <Button
                title="Cancel Leave Application"
                onPress={handleCancelApplication}
                loading={actionLoading}
                variant="outline"
                size="md"
                leftIcon={<Ionicons name="trash-outline" size={18} color={theme.colors.danger} />}
                style={styles.cancelBtn}
                textStyle={{ color: theme.colors.danger }}
              />
            )}
          </ScrollView>
        </View>
      </View>
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
    maxHeight: '90%',
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitleBox: {
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  empName: {
    fontSize: theme.typography.size.md + 1,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  empSub: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  closeBtn: {
    padding: theme.spacing.xs,
  },
  scrollBody: {
    paddingBottom: theme.spacing.xl,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  typeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  typeText: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  detailsCard: {
    backgroundColor: theme.colors.surfaceSubtle,
    marginBottom: theme.spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  metaLabel: {
    fontSize: theme.typography.size.xs + 1,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weight.medium,
  },
  metaVal: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textPrimary,
  },
  sectionBox: {
    marginBottom: theme.spacing.md,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  reasonCard: {
    backgroundColor: theme.colors.surface,
  },
  reasonText: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
  reviewCard: {
    backgroundColor: theme.colors.surface,
  },
  reviewCardApproved: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.successSubtle,
  },
  reviewCardRejected: {
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.dangerSubtle,
  },
  reviewerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  reviewComment: {
    fontSize: theme.typography.size.xs + 1,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
    marginVertical: 4,
  },
  reviewDate: {
    fontSize: theme.typography.size.xs - 1,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  hrActionSection: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  commentContainer: {
    marginTop: theme.spacing.xs,
  },
  cancelBtn: {
    marginTop: theme.spacing.sm,
    borderColor: theme.colors.danger,
  },
});

export default LeaveDetailModal;
