import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../src/constants/theme';
import { useAuth } from '../../src/hooks/useAuth';
import { Card, Badge, Button } from '../../src/components';
import { feedbackApi } from '../../src/services/api';

const CATEGORIES = ['Workplace & Culture', 'Tools & Technology', 'Benefits & Policy', 'General Suggestion'];

export default function FeedbackScreen() {
  const router = useRouter();
  const { user, isHrAdmin } = useAuth();

  const [feedbackList, setFeedbackList] = useState([]);
  const [metrics, setMetrics] = useState({
    totalFeedback: 0,
    avgSatisfactionRating: '5.0',
    addressedCount: 0,
    pendingReviewCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Submit Modal State (Employee)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newCategory, setNewCategory] = useState('Workplace & Culture');
  const [newMessage, setNewMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Respond Modal State (HR Admin)
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [adminResponseText, setAdminResponseText] = useState('');
  const [isResponding, setIsResponding] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  const loadFeedback = async () => {
    try {
      setIsLoading(true);
      const res = await feedbackApi.getAll(isHrAdmin ? null : user?.id || user?.employeeId);
      if (res && res.success) {
        setFeedbackList(res.data || []);
        if (res.metrics) setMetrics(res.metrics);
      }
    } catch (e) {
      console.warn('Failed to fetch feedback:', e.message);
    } finally {
      setIsLoading(false);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  useEffect(() => {
    loadFeedback();
  }, [isHrAdmin, user?.id]);

  const handleSubmitFeedback = async () => {
    if (!newMessage.trim()) {
      Alert.alert('Required', 'Please enter your feedback message.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await feedbackApi.submit({
        employeeId: user?.id || user?.employeeId || 'emp-101',
        employeeName: user?.name || 'Visartech Employee',
        category: newCategory,
        rating: newRating,
        message: newMessage,
        isAnonymous,
      });

      if (res && res.success) {
        Alert.alert('Feedback Submitted', 'Thank you! Your feedback has been saved to MongoDB Atlas.');
        setNewMessage('');
        setIsAnonymous(false);
        setNewRating(5);
        setIsSubmitModalOpen(false);
        loadFeedback();
      } else {
        Alert.alert('Error', res?.message || 'Could not submit feedback.');
      }
    } catch (err) {
      Alert.alert('Network Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendResponse = async () => {
    if (!adminResponseText.trim()) {
      Alert.alert('Required', 'Please enter your response note.');
      return;
    }

    try {
      setIsResponding(true);
      const res = await feedbackApi.respond(selectedFeedback.id, {
        adminResponse: adminResponseText,
        status: 'Addressed',
      });

      if (res && res.success) {
        Alert.alert('Response Saved', 'Feedback marked as Addressed with HR response.');
        setAdminResponseText('');
        setSelectedFeedback(null);
        setIsRespondModalOpen(false);
        loadFeedback();
      } else {
        Alert.alert('Error', res?.message || 'Failed to save response.');
      }
    } catch (err) {
      Alert.alert('Network Error', err.message);
    } finally {
      setIsResponding(false);
    }
  };

  const renderStars = (rating, interactive = false, onSelect = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          disabled={!interactive}
          onPress={() => onSelect && onSelect(i)}
          style={{ paddingHorizontal: 2 }}
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={interactive ? 30 : 16}
            color={i <= rating ? '#F59E0B' : theme.colors.border}
          />
        </TouchableOpacity>
      );
    }
    return <View style={{ flexDirection: 'row', alignItems: 'center' }}>{stars}</View>;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Employee Feedback</Text>
          <Text style={styles.headerSubtitle}>
            {isHrAdmin ? 'Executive Satisfaction Pulse' : 'Share Ideas & Suggestions'}
          </Text>
        </View>
        {!isHrAdmin && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setIsSubmitModalOpen(true)}>
            <Ionicons name="add" size={22} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* HR Metrics Summary Card */}
        {isHrAdmin && (
          <Card style={styles.metricsCard}>
            <View style={styles.metricsTop}>
              <View>
                <Text style={styles.metricsTitle}>Company Satisfaction Score</Text>
                <Text style={styles.metricsScore}>{metrics.avgSatisfactionRating} / 5.0</Text>
              </View>
              <View style={styles.starBox}>{renderStars(Math.round(Number(metrics.avgSatisfactionRating) || 5))}</View>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricVal}>{metrics.totalFeedback}</Text>
                <Text style={styles.metricLbl}>Total Responses</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={[styles.metricVal, { color: theme.colors.success }]}>{metrics.addressedCount}</Text>
                <Text style={styles.metricLbl}>Addressed</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={[styles.metricVal, { color: theme.colors.warning }]}>{metrics.pendingReviewCount}</Text>
                <Text style={styles.metricLbl}>Pending Review</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Action Callout for Employee */}
        {!isHrAdmin && (
          <Card style={styles.employeeCtaCard}>
            <View style={styles.ctaContent}>
              <Ionicons name="chatbubbles" size={32} color={theme.colors.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.ctaTitle}>Your Voice Matters</Text>
                <Text style={styles.ctaSubtitle}>
                  Help Visartech leadership build a smarter workplace. All feedback can be submitted anonymously.
                </Text>
              </View>
            </View>
            <Button
              title="Give Feedback"
              variant="primary"
              size="sm"
              onPress={() => setIsSubmitModalOpen(true)}
              style={{ marginTop: 12 }}
            />
          </Card>
        )}

        <Text style={styles.sectionHeader}>
          {isHrAdmin ? 'Team Feedback Stream (MongoDB)' : 'My Feedback Submissions'}
        </Text>

        {/* List of Feedback */}
        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading feedback from cloud...</Text>
          </View>
        ) : feedbackList.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="sparkles-outline" size={44} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>No feedback records yet</Text>
            <Text style={styles.emptyDesc}>Be the first to share your thoughts!</Text>
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {feedbackList.map((item) => {
              const isAddressed = item.status === 'Addressed';
              return (
                <Card key={item.id} style={styles.feedbackCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.senderRow}>
                      <Ionicons
                        name={item.isAnonymous ? 'finger-print' : 'person-circle'}
                        size={18}
                        color={item.isAnonymous ? theme.colors.textMuted : theme.colors.primary}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.senderName}>{item.employeeName}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        { backgroundColor: isAddressed ? theme.colors.successSubtle : theme.colors.warningSubtle },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          { color: isAddressed ? theme.colors.successDark : theme.colors.warningDark },
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.catBox}>
                      <Text style={styles.catText}>{item.category}</Text>
                    </View>
                    {renderStars(item.rating)}
                  </View>

                  <Text style={styles.feedbackMessage}>{item.message}</Text>

                  {/* HR Admin Response Section if exists */}
                  {item.adminResponse ? (
                    <View style={styles.responseBox}>
                      <View style={styles.responseHeader}>
                        <Ionicons name="checkmark-circle" size={15} color={theme.colors.success} style={{ marginRight: 4 }} />
                        <Text style={styles.responseTitle}>HR Operations Response ({item.respondedBy || 'Elena Rostova'})</Text>
                      </View>
                      <Text style={styles.responseText}>{item.adminResponse}</Text>
                    </View>
                  ) : null}

                  {/* HR Admin Action Button */}
                  {isHrAdmin && !isAddressed && (
                    <TouchableOpacity
                      style={styles.respondActionBtn}
                      onPress={() => {
                        setSelectedFeedback(item);
                        setAdminResponseText('');
                        setIsRespondModalOpen(true);
                      }}
                    >
                      <Ionicons name="return-down-forward" size={15} color={theme.colors.primary} style={{ marginRight: 4 }} />
                      <Text style={styles.respondActionText}>Review & Address</Text>
                    </TouchableOpacity>
                  )}
                </Card>
              );
            })}
          </Animated.View>
        )}
      </ScrollView>

      {/* Submit Feedback Modal (Employee) */}
      <Modal visible={isSubmitModalOpen} animationType="slide" transparent onRequestClose={() => setIsSubmitModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share Your Feedback</Text>
              <TouchableOpacity onPress={() => setIsSubmitModalOpen(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Satisfaction Rating</Text>
              <View style={styles.starPickerBox}>{renderStars(newRating, true, setNewRating)}</View>

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.catGrid}>
                {CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.modalCatBtn, newCategory === c && styles.modalCatBtnActive]}
                    onPress={() => setNewCategory(c)}
                  >
                    <Text style={[styles.modalCatText, newCategory === c && styles.modalCatTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Message / Suggestion</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="What can we improve or celebrate at Visartech?"
                multiline
                numberOfLines={4}
                value={newMessage}
                onChangeText={setNewMessage}
              />

              <TouchableOpacity style={styles.anonToggle} onPress={() => setIsAnonymous(!isAnonymous)}>
                <Ionicons
                  name={isAnonymous ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={isAnonymous ? theme.colors.primary : theme.colors.textMuted}
                />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.anonTitle}>Submit Anonymously</Text>
                  <Text style={styles.anonDesc}>Your name will not be linked to this submission.</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <Button title="Cancel" variant="outline" onPress={() => setIsSubmitModalOpen(false)} style={{ flex: 1, marginRight: 8 }} />
                <Button
                  title={isSubmitting ? 'Sending...' : 'Submit to HR'}
                  variant="primary"
                  onPress={handleSubmitFeedback}
                  loading={isSubmitting}
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* HR Admin Respond Modal */}
      <Modal visible={isRespondModalOpen} animationType="slide" transparent onRequestClose={() => setIsRespondModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Address Feedback</Text>
              <TouchableOpacity onPress={() => setIsRespondModalOpen(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedFeedback && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.selectedBox}>
                  <Text style={styles.selectedSender}>From: {selectedFeedback.employeeName}</Text>
                  <Text style={styles.selectedMsg}>"{selectedFeedback.message}"</Text>
                </View>

                <Text style={styles.inputLabel}>Official HR Response</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="e.g. Thank you for this insight. We have scheduled..."
                  multiline
                  numberOfLines={4}
                  value={adminResponseText}
                  onChangeText={setAdminResponseText}
                />

                <View style={styles.modalActions}>
                  <Button title="Cancel" variant="outline" onPress={() => setIsRespondModalOpen(false)} style={{ flex: 1, marginRight: 8 }} />
                  <Button
                    title={isResponding ? 'Saving...' : 'Send & Mark Addressed'}
                    variant="primary"
                    onPress={handleSendResponse}
                    loading={isResponding}
                    style={{ flex: 1, marginLeft: 8 }}
                  />
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.sm,
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
  },
  addBtn: {
    backgroundColor: theme.colors.primary,
    width: 38,
    height: 38,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  metricsCard: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.lg,
  },
  metricsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  metricsTitle: {
    fontSize: theme.typography.size.xs + 1,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weight.medium,
  },
  metricsScore: {
    fontSize: theme.typography.size.xxl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.primary,
    marginTop: 2,
  },
  starBox: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  metricLbl: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 25,
    backgroundColor: theme.colors.border,
  },
  employeeCtaCard: {
    backgroundColor: theme.colors.primarySubtle,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: theme.spacing.lg,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.primaryDark,
  },
  ctaSubtitle: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  feedbackCard: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  senderName: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textPrimary,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: theme.typography.weight.bold,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  catBox: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
  },
  catText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weight.medium,
  },
  feedbackMessage: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.textPrimary,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  responseBox: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: '#F0FDF4',
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.success,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  responseTitle: {
    fontSize: 11,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.successDark,
  },
  responseText: {
    fontSize: theme.typography.size.xs + 1,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  respondActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  respondActionText: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.primary,
  },
  centerBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: theme.typography.size.sm,
    color: theme.colors.textSecondary,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  inputLabel: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.sm,
    marginBottom: 6,
  },
  starPickerBox: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: theme.spacing.sm,
  },
  modalCatBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  modalCatBtnActive: {
    backgroundColor: theme.colors.primarySubtle,
    borderColor: theme.colors.primary,
  },
  modalCatText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
  },
  modalCatTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weight.bold,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.size.sm,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.background,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  anonToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  anonTitle: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textPrimary,
  },
  anonDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  selectedBox: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  selectedSender: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  selectedMsg: {
    fontSize: theme.typography.size.xs + 1,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: theme.spacing.lg,
  },
});
