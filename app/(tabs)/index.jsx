import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../src/constants/theme';
import { COMPANY_INFO, USER_ROLES } from '../../src/constants/company';
import { useAuth } from '../../src/hooks/useAuth';
import { formatDate } from '../../src/utils/formatting';
import { Card, Badge, Avatar, StatCard, Button } from '../../src/components';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, role, switchRole, isHrAdmin } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(true);

  const toggleCheckIn = () => {
    setIsCheckedIn(!isCheckedIn);
    Alert.alert(
      !isCheckedIn ? 'Checked In' : 'Checked Out',
      !isCheckedIn
        ? 'You have checked in at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'You have successfully checked out. Have a great evening!',
      [{ text: 'OK' }]
    );
  };

  const handleRoleToggle = () => {
    const nextRole = isHrAdmin ? USER_ROLES.EMPLOYEE : USER_ROLES.HR_ADMIN;
    switchRole(nextRole);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <Text style={styles.dateText}>{formatDate()}</Text>
            <Text style={styles.greetingText}>
              Hello, {user?.name ? user.name.split(' ')[0] : 'Member'}
            </Text>
            <View style={styles.companyRow}>
              <Text style={styles.companyName}>{COMPANY_INFO.name}</Text>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.companyIndustry}>{COMPANY_INFO.industry}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.8}
          >
            <Avatar
              name={user?.name || 'Visartech'}
              size={48}
              showStatus
              status={isCheckedIn ? 'active' : 'offline'}
            />
          </TouchableOpacity>
        </View>

        {/* Role Bar & Switcher Banner */}
        <Card style={styles.roleBanner} variant="outlined" padding="md">
          <View style={styles.roleBannerLeft}>
            <Ionicons
              name={isHrAdmin ? 'shield-checkmark' : 'person-circle'}
              size={22}
              color={isHrAdmin ? theme.colors.roleHrAdmin : theme.colors.roleEmployee}
            />
            <View style={styles.roleInfo}>
              <Text style={styles.roleLabel}>CURRENT VIEW</Text>
              <Text style={styles.roleTitle}>{role}</Text>
            </View>
          </View>
          <Button
            title={`Switch to ${isHrAdmin ? 'Employee' : 'HR Admin'}`}
            onPress={handleRoleToggle}
            variant="outline"
            size="sm"
            style={styles.switchBtn}
            textStyle={styles.switchBtnText}
          />
        </Card>

        {/* KPI / Metric Stats Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Overview & Metrics</Text>
          <Badge
            label={isHrAdmin ? 'Company Scope' : 'My Workspace'}
            variant="neutral"
            size="sm"
          />
        </View>

        {isHrAdmin ? (
          // HR Administrator KPI Stats
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatCard
                title="Total Staff"
                value={`${COMPANY_INFO.totalEmployees}`}
                subtitle="Active headcount"
                iconName="people"
                iconColor={theme.colors.primary}
                iconBgColor={theme.colors.primarySubtle}
              />
              <StatCard
                title="Attendance"
                value="6/6"
                subtitle="100% checked in"
                iconName="checkmark-done"
                iconColor={theme.colors.success}
                iconBgColor={theme.colors.successSubtle}
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                title="Pending Leaves"
                value="1"
                subtitle="Requires review"
                iconName="calendar"
                iconColor={theme.colors.warning}
                iconBgColor={theme.colors.warningSubtle}
              />
              <StatCard
                title="Active Tasks"
                value="12"
                subtitle="Current sprint"
                iconName="clipboard"
                iconColor={theme.colors.info}
                iconBgColor={theme.colors.infoSubtle}
              />
            </View>
          </View>
        ) : (
          // Employee KPI Stats
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatCard
                title="Today's Status"
                value={isCheckedIn ? 'Present' : 'Out'}
                subtitle={isCheckedIn ? 'In at 09:15 AM' : 'Checked out'}
                iconName="timer-outline"
                iconColor={isCheckedIn ? theme.colors.success : theme.colors.danger}
                iconBgColor={isCheckedIn ? theme.colors.successSubtle : theme.colors.dangerSubtle}
              />
              <StatCard
                title="Attendance"
                value="98%"
                subtitle="Current month"
                iconName="trending-up-outline"
                iconColor={theme.colors.primary}
                iconBgColor={theme.colors.primarySubtle}
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                title="Assigned Tasks"
                value="4"
                subtitle="2 due this week"
                iconName="checkbox-outline"
                iconColor={theme.colors.info}
                iconBgColor={theme.colors.infoSubtle}
              />
              <StatCard
                title="Leave Balance"
                value="14d"
                subtitle="Annual leave left"
                iconName="leaf-outline"
                iconColor={theme.colors.warning}
                iconBgColor={theme.colors.warningSubtle}
              />
            </View>
          </View>
        )}

        {/* Quick Actions Card */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <Card style={styles.actionsCard} variant="elevated" padding="md">
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={toggleCheckIn}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.actionIconBox,
                  {
                    backgroundColor: isCheckedIn
                      ? theme.colors.dangerSubtle
                      : theme.colors.successSubtle,
                  },
                ]}
              >
                <Ionicons
                  name={isCheckedIn ? 'log-out-outline' : 'log-in-outline'}
                  size={24}
                  color={isCheckedIn ? theme.colors.danger : theme.colors.success}
                />
              </View>
              <Text style={styles.actionLabel}>
                {isCheckedIn ? 'Check Out' : 'Check In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/(tabs)/modules')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.actionIconBox,
                  { backgroundColor: theme.colors.primarySubtle },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={styles.actionLabel}>Apply Leave</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/(tabs)/modules')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.actionIconBox,
                  { backgroundColor: theme.colors.infoSubtle },
                ]}
              >
                <Ionicons
                  name="people-outline"
                  size={24}
                  color={theme.colors.info}
                />
              </View>
              <Text style={styles.actionLabel}>Team (6)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/modal')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.actionIconBox,
                  { backgroundColor: theme.colors.warningSubtle },
                ]}
              >
                <Ionicons
                  name="layers-outline"
                  size={24}
                  color={theme.colors.warning}
                />
              </View>
              <Text style={styles.actionLabel}>Roadmap</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Company Announcement Card */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Internal Announcement</Text>
          <Badge label="New" variant="primary" size="sm" />
        </View>

        <Card style={styles.announcementCard} variant="elevated" padding="lg">
          <View style={styles.announcementTop}>
            <View style={styles.announcementIconBox}>
              <Ionicons
                name="megaphone"
                size={20}
                color={theme.colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.announcementTitle}>
                Welcome to WorkSphere at Visartech
              </Text>
              <Text style={styles.announcementDate}>Visartech Operations • Today</Text>
            </View>
          </View>
          <Text style={styles.announcementBody}>
            The initial mobile framework has been initialized on React Native & Expo SDK 58.
            Attendance, leave approvals, payroll, and performance modules will connect
            to Node.js & MongoDB in subsequent development phases.
          </Text>
        </Card>

        {/* Modules Navigation Shortcut */}
        <Card
          style={styles.roadmapCard}
          variant="flat"
          padding="lg"
          onPress={() => router.push('/(tabs)/modules')}
        >
          <View style={styles.roadmapContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.roadmapTitle}>View All 8 HR Modules</Text>
              <Text style={styles.roadmapSubtitle}>
                Explore architecture, role permissions, and release status
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={theme.colors.primary}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
  },
  headerLeft: {
    flex: 1,
  },
  dateText: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  greetingText: {
    fontSize: theme.typography.size.xxl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  companyName: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.primary,
  },
  bullet: {
    marginHorizontal: 6,
    color: theme.colors.textMuted,
    fontSize: theme.typography.size.xs,
  },
  companyIndustry: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
  },
  roleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
  },
  roleBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleInfo: {
    marginLeft: theme.spacing.sm,
  },
  roleLabel: {
    fontSize: 10,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  roleTitle: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  switchBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    minHeight: 32,
  },
  switchBtnText: {
    fontSize: theme.typography.size.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  statsGrid: {
    marginBottom: theme.spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  actionsCard: {
    marginBottom: theme.spacing.xl,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  actionItem: {
    alignItems: 'center',
  },
  actionIconBox: {
    width: 52,
    height: 52,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  actionLabel: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.textPrimary,
  },
  announcementCard: {
    marginBottom: theme.spacing.lg,
  },
  announcementTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  announcementIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  announcementTitle: {
    fontSize: theme.typography.size.sm + 1,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  announcementDate: {
    fontSize: theme.typography.size.xs - 1,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  announcementBody: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  roadmapCard: {
    marginBottom: theme.spacing.lg,
  },
  roadmapContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roadmapTitle: {
    fontSize: theme.typography.size.sm + 1,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.primary,
  },
  roadmapSubtitle: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
