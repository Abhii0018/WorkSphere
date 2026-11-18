import React from 'react';
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
import { Card, Badge, Avatar, Button } from '../../src/components';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, role, switchRole, logout, isHrAdmin } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of WorkSphere?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          },
        },
      ]
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
        {/* Profile Card */}
        <Card style={styles.profileCard} variant="elevated" padding="lg">
          <View style={styles.avatarSection}>
            <Avatar
              name={user?.name || 'User'}
              size={72}
              showStatus
              status="active"
            />
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userTitle}>{user?.title || user?.designation || 'Team Member'}</Text>
            <Badge
              label={role}
              variant={isHrAdmin ? 'hr' : 'employee'}
              size="md"
              style={styles.roleBadge}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Ionicons name="finger-print-outline" size={18} color={theme.colors.textMuted} />
            <Text style={styles.detailLabel}>Employee ID</Text>
            <Text style={styles.detailValue}>{user?.id || 'emp-101'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={18} color={theme.colors.textMuted} />
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{user?.email}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="business-outline" size={18} color={theme.colors.textMuted} />
            <Text style={styles.detailLabel}>Department</Text>
            <Text style={styles.detailValue}>{user?.department}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="shield-outline" size={18} color={theme.colors.textMuted} />
            <Text style={styles.detailLabel}>Role Level</Text>
            <Text style={styles.detailValue}>{role}</Text>
          </View>
        </Card>

        {/* Quick Nav Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Workspace Hub</Text>
        </View>

        <Card style={styles.settingsCard} variant="outlined" padding="none">
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => router.push('/employees')}
            activeOpacity={0.7}
          >
            <View style={[styles.settingsIconBox, { backgroundColor: theme.colors.primarySubtle }]}>
              <Ionicons name="people-outline" size={20} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingsRowTitle}>Employee Directory & Profile</Text>
              <Text style={styles.settingsRowSubtitle}>
                {isHrAdmin ? 'Manage staff directory & profiles' : 'View directory & personal records'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => router.push('/tasks')}
            activeOpacity={0.7}
          >
            <View style={[styles.settingsIconBox, { backgroundColor: theme.colors.infoSubtle }]}>
              <Ionicons name="checkbox-outline" size={20} color={theme.colors.info} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingsRowTitle}>Tasks & Performance</Text>
              <Text style={styles.settingsRowSubtitle}>
                {isHrAdmin ? 'Task assignments & team metrics' : 'My assigned tasks & completion notes'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => router.push('/payroll')}
            activeOpacity={0.7}
          >
            <View style={[styles.settingsIconBox, { backgroundColor: '#EBFBEE' }]}>
              <Ionicons name="card-outline" size={20} color={theme.colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingsRowTitle}>Salary & Payslips</Text>
              <Text style={styles.settingsRowSubtitle}>
                {isHrAdmin ? 'Run payroll & track payments' : 'Private salary structure & official slips'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => router.push('/leave')}
            activeOpacity={0.7}
          >
            <View style={[styles.settingsIconBox, { backgroundColor: theme.colors.warningSubtle }]}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingsRowTitle}>Leave Management</Text>
              <Text style={styles.settingsRowSubtitle}>
                {isHrAdmin ? 'Review employee leave applications' : 'Apply for leave & check balance'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Company Overview Card */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Company Information</Text>
        </View>

        <Card style={styles.companyCard} variant="elevated" padding="lg">
          <View style={styles.companyHeader}>
            <View style={styles.companyIconBox}>
              <Ionicons name="business" size={24} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={styles.companyName}>{COMPANY_INFO.name}</Text>
              <Text style={styles.companyTagline}>{COMPANY_INFO.tagline}</Text>
            </View>
          </View>

          <View style={styles.companyStats}>
            <View style={styles.compStatBox}>
              <Text style={styles.compStatVal}>{COMPANY_INFO.totalEmployees}</Text>
              <Text style={styles.compStatLabel}>Employees</Text>
            </View>
            <View style={styles.compStatDivider} />
            <View style={styles.compStatBox}>
              <Text style={styles.compStatVal}>{COMPANY_INFO.totalHrAdmins}</Text>
              <Text style={styles.compStatLabel}>HR Admin</Text>
            </View>
            <View style={styles.compStatDivider} />
            <View style={styles.compStatBox}>
              <Text style={styles.compStatVal}>5/8</Text>
              <Text style={styles.compStatLabel}>Active Modules</Text>
            </View>
          </View>

          <View style={styles.companyFooter}>
            <Text style={styles.industryText}>
              Industry: <Text style={{ color: theme.colors.textPrimary }}>{COMPANY_INFO.industry}</Text>
            </Text>
          </View>
        </Card>

        {/* Testing & Developer Tools */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Developer & Testing Tools</Text>
        </View>

        <Card style={styles.settingsCard} variant="outlined" padding="none">
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={handleRoleToggle}
            activeOpacity={0.7}
          >
            <View style={styles.settingsIconBox}>
              <Ionicons name="swap-horizontal" size={20} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingsRowTitle}>Toggle Active Role</Text>
              <Text style={styles.settingsRowSubtitle}>
                Switch between HR Admin & Employee views
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => router.push('/modal')}
            activeOpacity={0.7}
          >
            <View style={styles.settingsIconBox}>
              <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingsRowTitle}>System Specifications</Text>
              <Text style={styles.settingsRowSubtitle}>
                Expo SDK 58, 5 Integrated Modules, AsyncStorage
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Sign Out Button */}
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          size="md"
          leftIcon={<Ionicons name="log-out-outline" size={18} color={theme.colors.danger} />}
          style={styles.signOutBtn}
          textStyle={{ color: theme.colors.danger }}
        />

        <Text style={styles.versionNote}>
          WorkSphere Mobile App • Visartech HR Suite v1.2
        </Text>
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
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  profileCard: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  userName: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.sm,
  },
  userTitle: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    marginTop: theme.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  detailLabel: {
    fontSize: theme.typography.size.xs + 1,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  detailValue: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textPrimary,
  },
  sectionHeader: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  companyCard: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.xl,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  companyIconBox: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  companyName: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  companyTagline: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  companyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  compStatBox: {
    alignItems: 'center',
  },
  compStatVal: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.primary,
  },
  compStatLabel: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  compStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.border,
  },
  companyFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: theme.spacing.sm,
  },
  industryText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
  },
  settingsCard: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.xl,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  settingsIconBox: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  settingsRowTitle: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textPrimary,
  },
  settingsRowSubtitle: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginLeft: 56,
  },
  signOutBtn: {
    borderColor: theme.colors.danger,
    marginBottom: theme.spacing.lg,
  },
  versionNote: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
