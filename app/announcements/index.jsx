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
import { announcementApi } from '../../src/services/api';

const CATEGORIES = ['All', 'Company Update', 'Event', 'Policy', 'Urgent'];

export default function AnnouncementsScreen() {
  const router = useRouter();
  const { user, isHrAdmin } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Company Update');
  const [newPriority, setNewPriority] = useState('Normal');
  const [isPinned, setIsPinned] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const loadAnnouncements = async () => {
    try {
      setIsLoading(true);
      const res = await announcementApi.getAll();
      if (res && res.success && res.data) {
        setAnnouncements(res.data);
      }
    } catch (e) {
      console.warn('Failed to fetch announcements:', e.message);
    } finally {
      setIsLoading(false);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handlePostAnnouncement = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      Alert.alert('Required Fields', 'Please enter both announcement title and message content.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await announcementApi.create({
        title: newTitle,
        content: newContent,
        category: newCategory,
        priority: newPriority,
        isPinned,
      });

      if (res && res.success) {
        Alert.alert('Published', 'New announcement published successfully.');
        setNewTitle('');
        setNewContent('');
        setIsPinned(false);
        setIsModalOpen(false);
        loadAnnouncements();
      } else {
        Alert.alert('Error', res?.message || 'Failed to publish announcement.');
      }
    } catch (err) {
      Alert.alert('Network Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Urgent':
        return { bg: theme.colors.dangerSubtle, text: theme.colors.danger, icon: 'alert-circle-outline' };
      case 'Policy':
        return { bg: theme.colors.warningSubtle, text: theme.colors.warningDark, icon: 'document-text-outline' };
      case 'Event':
        return { bg: theme.colors.infoSubtle, text: theme.colors.infoDark, icon: 'calendar-outline' };
      default:
        return { bg: theme.colors.primarySubtle, text: theme.colors.primary, icon: 'megaphone-outline' };
    }
  };

  const filtered = announcements.filter((a) => {
    const matchCategory = selectedCategory === 'All' || a.category === selectedCategory;
    const matchSearch =
      !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Announcements</Text>
          <Text style={styles.headerSubtitle}>Visartech Internal Communication</Text>
        </View>
        {isHrAdmin && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setIsModalOpen(true)}>
            <Ionicons name="add" size={22} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search company announcements..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Announcements List */}
        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Syncing from MongoDB Atlas...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="chatbox-ellipses-outline" size={44} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>No announcements found</Text>
            <Text style={styles.emptyDesc}>Try adjusting your filter or check back later.</Text>
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {filtered.map((item) => {
              const catStyle = getCategoryColor(item.category);
              return (
                <Card key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.badgeRow}>
                      <View style={[styles.catBadge, { backgroundColor: catStyle.bg }]}>
                        <Ionicons name={catStyle.icon} size={13} color={catStyle.text} style={{ marginRight: 4 }} />
                        <Text style={[styles.catBadgeText, { color: catStyle.text }]}>{item.category}</Text>
                      </View>
                      {item.isPinned && (
                        <View style={styles.pinnedBadge}>
                          <Ionicons name="pin" size={11} color="#B45309" style={{ marginRight: 3 }} />
                          <Text style={styles.pinnedText}>Pinned</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.dateText}>{item.date}</Text>
                  </View>

                  <Text style={styles.annTitle}>{item.title}</Text>
                  <Text style={styles.annContent}>{item.content}</Text>

                  <View style={styles.cardFooter}>
                    <Ionicons name="person-circle-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.postedByText}>{item.postedBy}</Text>
                  </View>
                </Card>
              );
            })}
          </Animated.View>
        )}
      </ScrollView>

      {/* Compose Announcement Modal (HR only) */}
      <Modal visible={isModalOpen} animationType="slide" transparent onRequestClose={() => setIsModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Announcement</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Q1 Milestone Review"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.modalCatRow}>
                {['Company Update', 'Event', 'Policy', 'Urgent'].map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.modalCatBtn, newCategory === c && styles.modalCatBtnActive]}
                    onPress={() => setNewCategory(c)}
                  >
                    <Text style={[styles.modalCatText, newCategory === c && styles.modalCatTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Content / Message</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Write your company update..."
                multiline
                numberOfLines={4}
                value={newContent}
                onChangeText={setNewContent}
              />

              <TouchableOpacity style={styles.pinCheckbox} onPress={() => setIsPinned(!isPinned)}>
                <Ionicons
                  name={isPinned ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={isPinned ? theme.colors.primary : theme.colors.textMuted}
                />
                <Text style={styles.pinLabel}>Pin announcement to the top</Text>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <Button title="Cancel" variant="outline" onPress={() => setIsModalOpen(false)} style={{ flex: 1, marginRight: 8 }} />
                <Button
                  title={isSubmitting ? 'Publishing...' : 'Publish to Team'}
                  variant="primary"
                  onPress={handlePostAnnouncement}
                  loading={isSubmitting}
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            </ScrollView>
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
    elevation: 3,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    height: 44,
    marginBottom: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.size.sm,
    color: theme.colors.textPrimary,
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryPillText: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.textSecondary,
  },
  categoryPillTextActive: {
    color: '#FFF',
    fontWeight: theme.typography.weight.bold,
  },
  card: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  catBadgeText: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
  },
  pinnedText: {
    fontSize: 10,
    fontWeight: theme.typography.weight.bold,
    color: '#92400E',
  },
  dateText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textMuted,
  },
  annTitle: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
    marginBottom: 6,
    lineHeight: 22,
  },
  annContent: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    gap: 6,
  },
  postedByText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weight.medium,
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
    height: 100,
    textAlignVertical: 'top',
  },
  modalCatRow: {
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
  pinCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.md,
    gap: 8,
  },
  pinLabel: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
  },
});
