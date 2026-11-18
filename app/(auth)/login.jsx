import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../src/constants/theme';
import { USER_ROLES, COMPANY_INFO } from '../../src/constants/company';
import { useAuth } from '../../src/hooks/useAuth';
import { Card, Input, Button, Badge } from '../../src/components';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState(USER_ROLES.HR_ADMIN);
  const [email, setEmail] = useState(
    selectedRole === USER_ROLES.HR_ADMIN
      ? 'elena.rostova@visartech.com'
      : 'alex.turner@visartech.com'
  );
  const [password, setPassword] = useState('••••••••••••');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (newRole) => {
    setSelectedRole(newRole);
    if (newRole === USER_ROLES.HR_ADMIN) {
      setEmail('elena.rostova@visartech.com');
    } else {
      setEmail('alex.turner@visartech.com');
    }
  };

  const handleSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      login(selectedRole);
      setLoading(false);
      router.replace('/(tabs)');
    }, 400);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top navigation */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              accessibilityLabel="Back"
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <Badge label="Secure Portal" variant="neutral" size="sm" />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoIcon}>
              <Ionicons name="shield-checkmark" size={28} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to your {COMPANY_INFO.name} WorkSphere account
            </Text>
          </View>

          {/* Role Selector Tabs */}
          <View style={styles.roleTabsContainer}>
            <Text style={styles.roleLabel}>SELECT ACCOUNT ROLE:</Text>
            <View style={styles.roleTabs}>
              <TouchableOpacity
                style={[
                  styles.roleTab,
                  selectedRole === USER_ROLES.HR_ADMIN && styles.roleTabActive,
                ]}
                onPress={() => handleRoleSelect(USER_ROLES.HR_ADMIN)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="shield"
                  size={16}
                  color={
                    selectedRole === USER_ROLES.HR_ADMIN
                      ? theme.colors.roleHrAdmin
                      : theme.colors.textMuted
                  }
                  style={styles.roleIcon}
                />
                <Text
                  style={[
                    styles.roleTabText,
                    selectedRole === USER_ROLES.HR_ADMIN && styles.roleTabTextActive,
                  ]}
                >
                  HR Admin
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleTab,
                  selectedRole === USER_ROLES.EMPLOYEE && styles.roleTabActive,
                ]}
                onPress={() => handleRoleSelect(USER_ROLES.EMPLOYEE)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="person"
                  size={16}
                  color={
                    selectedRole === USER_ROLES.EMPLOYEE
                      ? theme.colors.roleEmployee
                      : theme.colors.textMuted
                  }
                  style={styles.roleIcon}
                />
                <Text
                  style={[
                    styles.roleTabText,
                    selectedRole === USER_ROLES.EMPLOYEE && styles.roleTabTextActive,
                  ]}
                >
                  Employee
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Form Card */}
          <Card style={styles.formCard} variant="elevated" padding="lg">
            <Input
              label="Corporate Email"
              placeholder="name@visartech.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              }
            />

            <Input
              label="Password"
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureText}
              leftIcon={
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              }
              rightIcon={
                <Ionicons
                  name={secureText ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={theme.colors.textMuted}
                />
              }
              onRightIconPress={() => setSecureText(!secureText)}
              helperText="Pre-filled for initial prototype verification"
            />

            <Button
              title={`Sign In as ${selectedRole === USER_ROLES.HR_ADMIN ? 'HR Admin' : 'Employee'}`}
              onPress={handleSignIn}
              loading={loading}
              variant="primary"
              size="lg"
              style={styles.submitBtn}
            />
          </Card>

          {/* Info callout */}
          <View style={styles.noticeContainer}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={theme.colors.textMuted}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.noticeText}>
              Backend authentication with JWT and bcrypt will be linked in subsequent phases.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  backBtn: {
    padding: theme.spacing.xs,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  logoIcon: {
    width: 52,
    height: 52,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.size.xxl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  roleTabsContainer: {
    marginBottom: theme.spacing.lg,
  },
  roleLabel: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: theme.spacing.sm,
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.md,
    padding: 4,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  roleTabActive: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  roleIcon: {
    marginRight: 6,
  },
  roleTabText: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.textSecondary,
  },
  roleTabTextActive: {
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  formCard: {
    marginBottom: theme.spacing.xl,
  },
  submitBtn: {
    marginTop: theme.spacing.md,
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  noticeText: {
    flex: 1,
    fontSize: theme.typography.size.xs,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
});
