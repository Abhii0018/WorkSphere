import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import theme, { COLORS, SPACING, RADIUS, SHADOWS } from '../src/constants/theme';
import { COMPANY_INFO, USER_ROLES } from '../src/constants/company';
import { Button, Card, Badge } from '../src/components';
import { useAuth } from '../src/hooks/useAuth';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, role, switchRole, isHrAdmin } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
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
  }, []);

  const handleToggleRole = () => {
    const nextRole = isHrAdmin ? USER_ROLES.EMPLOYEE : USER_ROLES.HR_ADMIN;
    switchRole(nextRole);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Top Organization Header */}
          <View style={styles.header}>
            <View style={styles.logoBadgeContainer}>
              <View style={styles.logoBadge}>
                <Ionicons name="business" size={32} color="#FFFFFF" />
              </View>
              <View style={styles.liveCloudDot}>
                <View style={styles.liveDotInner} />
              </View>
            </View>

            <Text style={styles.brandTitle}>WorkSphere</Text>
            <Text style={styles.brandSubtitle}>
              {COMPANY_INFO.name.toUpperCase()} • HR MANAGEMENT SYSTEM
            </Text>

            <View style={styles.statusPillsRow}>
              <View style={styles.cloudBadge}>
                <Ionicons name="cloud-done" size={13} color={COLORS.success} style={{ marginRight: 4 }} />
                <Text style={styles.cloudBadgeText}>MongoDB Atlas Active</Text>
              </View>
              <View style={styles.tzBadge}>
                <Ionicons name="time" size={13} color={COLORS.primary} style={{ marginRight: 4 }} />
                <Text style={styles.tzBadgeText}>Chicago CST</Text>
              </View>
            </View>
          </View>

          {/* Quick Metric Bar */}
          <View style={styles.metricsBar}>
            <View style={styles.metricCol}>
              <Text style={styles.metricValue}>6</Text>
              <Text style={styles.metricLabel}>Employees</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricCol}>
              <Text style={styles.metricValue}>8</Text>
              <Text style={styles.metricLabel}>HR Modules</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricCol}>
              <Text style={[styles.metricValue, { color: COLORS.success }]}>100%</Text>
              <Text style={styles.metricLabel}>Operational</Text>
            </View>
          </View>

          {/* Current Role Switcher Card */}
          <Card style={styles.roleCard} padding="md">
            <View style={styles.roleCardContent}>
              <View style={styles.roleAvatar}>
                <Text style={styles.roleAvatarText}>
                  {user?.name ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2) : 'ER'}
                </Text>
              </View>
              <View style={styles.roleInfo}>
                <View style={styles.roleNameRow}>
                  <Text style={styles.roleUserName}>{user?.name || 'Elena Rostova'}</Text>
                  <Badge
                    label={isHrAdmin ? 'HR Administrator' : 'Staff Employee'}
                    variant={isHrAdmin ? 'hr' : 'employee'}
                    size="sm"
                  />
                </View>
                <Text style={styles.roleSubtext}>
                  {isHrAdmin
                    ? 'Full Administrator Privileges & Operations Console'
                    : 'Personal Attendance, Leave, Tasks & Payroll View'}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.switchRoleBtn} onPress={handleToggleRole} activeOpacity={0.8}>
              <Ionicons name="swap-horizontal" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.switchRoleBtnText}>
                Switch to {isHrAdmin ? 'Employee (Alex Turner)' : 'HR Admin (Elena Rostova)'}
              </Text>
            </TouchableOpacity>
          </Card>

          {/* Operational Modules Card */}
          <Card style={styles.overviewCard} padding="lg">
            <View style={styles.overviewHeader}>
              <Text style={styles.overviewTitle}>Visartech Operational Pillars</Text>
              <Text style={styles.overviewSub}>All 8 Modules Fully Functional</Text>
            </View>

            <View style={styles.pillarsGrid}>
              <View style={styles.pillarItem}>
                <View style={[styles.pillarIcon, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="time" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.pillarTextCol}>
                  <Text style={styles.pillarName}>Attendance & Hours</Text>
                  <Text style={styles.pillarDesc}>Live Chicago check-in/out & overtime</Text>
                </View>
              </View>

              <View style={styles.pillarItem}>
                <View style={[styles.pillarIcon, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="calendar" size={18} color={COLORS.success} />
                </View>
                <View style={styles.pillarTextCol}>
                  <Text style={styles.pillarName}>Leave Applications</Text>
                  <Text style={styles.pillarDesc}>Entitlements & HR approval workflow</Text>
                </View>
              </View>

              <View style={styles.pillarItem}>
                <View style={[styles.pillarIcon, { backgroundColor: '#FAF5FF' }]}>
                  <Ionicons name="card" size={18} color="#7C3AED" />
                </View>
                <View style={styles.pillarTextCol}>
                  <Text style={styles.pillarName}>Payroll & Salaries</Text>
                  <Text style={styles.pillarDesc}>USD ($) salary structures & payslips</Text>
                </View>
              </View>

              <View style={styles.pillarItem}>
                <View style={[styles.pillarIcon, { backgroundColor: '#F0F9FF' }]}>
                  <Ionicons name="checkbox" size={18} color="#0284C7" />
                </View>
                <View style={styles.pillarTextCol}>
                  <Text style={styles.pillarName}>Tasks & Performance</Text>
                  <Text style={styles.pillarDesc}>Sprint deliverables & 5-star ratings</Text>
                </View>
              </View>

              <View style={styles.pillarItem}>
                <View style={[styles.pillarIcon, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="megaphone" size={18} color={COLORS.primary} />
                </View>
                <View style={styles.pillarTextCol}>
                  <Text style={styles.pillarName}>Internal Bulletins</Text>
                  <Text style={styles.pillarDesc}>Company announcements & notices</Text>
                </View>
              </View>

              <View style={styles.pillarItem}>
                <View style={[styles.pillarIcon, { backgroundColor: '#F0FDF4' }]}>
                  <Ionicons name="chatbubbles" size={18} color={COLORS.success} />
                </View>
                <View style={styles.pillarTextCol}>
                  <Text style={styles.pillarName}>Satisfaction Pulse</Text>
                  <Text style={styles.pillarDesc}>Anonymous feedback & HR responses</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.heroLaunchBtn}
              onPress={() => router.replace('/(tabs)')}
              activeOpacity={0.88}
            >
              <Text style={styles.heroLaunchBtnText}>Launch WorkSphere Portal</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.specBtn}
              onPress={() => router.push('/modal')}
              activeOpacity={0.8}
            >
              <Ionicons name="information-circle-outline" size={18} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
              <Text style={styles.specBtnText}>View Project Specifications & Academic Brief</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Branding */}
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>VISARTECH COMPANY • HRMM504 ACADEMIC CHALLENGE</Text>
            <Text style={styles.footerSub}>Lovely Professional University (LPU) • WorkSphere 2.0</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoBadgeContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  liveCloudDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  liveDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    fontFamily: 'sans-serif',
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 3,
    letterSpacing: 0.8,
    fontFamily: 'sans-serif',
  },
  statusPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  cloudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  cloudBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
    fontFamily: 'sans-serif',
  },
  tzBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  tzBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: 'sans-serif',
  },
  metricsBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SPACING.md,
    justifyContent: 'space-around',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  metricCol: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    fontFamily: 'sans-serif',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
    fontFamily: 'sans-serif',
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },
  roleCard: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.sm,
  },
  roleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  roleAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  roleAvatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    fontFamily: 'sans-serif',
  },
  roleInfo: {
    flex: 1,
  },
  roleNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  roleUserName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'sans-serif',
  },
  roleSubtext: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'sans-serif',
    lineHeight: 15,
  },
  switchRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  switchRoleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: 'sans-serif',
  },
  overviewCard: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.sm,
  },
  overviewHeader: {
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontFamily: 'sans-serif',
  },
  overviewSub: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.success,
    marginTop: 2,
    fontFamily: 'sans-serif',
  },
  pillarsGrid: {
    gap: 12,
  },
  pillarItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillarIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pillarTextCol: {
    flex: 1,
  },
  pillarName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'sans-serif',
  },
  pillarDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'sans-serif',
    marginTop: 1,
  },
  buttonContainer: {
    gap: 10,
    marginBottom: SPACING.lg,
  },
  heroLaunchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: RADIUS.lg,
    ...SHADOWS.md,
  },
  heroLaunchBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'sans-serif',
  },
  specBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  specBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontFamily: 'sans-serif',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  footerTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
    fontFamily: 'sans-serif',
  },
  footerSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    fontFamily: 'sans-serif',
  },
});
