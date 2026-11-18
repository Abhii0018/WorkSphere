import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import theme from '../src/constants/theme';
import { COMPANY_INFO } from '../src/constants/company';
import { Button, Card, Badge } from '../src/components';
import { useAuth } from '../src/hooks/useAuth';

export default function WelcomeScreen() {
  const router = useRouter();
  const { role, isHrAdmin } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="briefcase" size={32} color={theme.colors.primary} />
          </View>
          <Text style={styles.brandTitle}>WorkSphere</Text>
          <Text style={styles.companySub}>{COMPANY_INFO.name} • HR Management</Text>
          <Badge
            label={COMPANY_INFO.industry}
            variant="primary"
            size="sm"
            style={styles.industryBadge}
          />
        </View>

        {/* Feature Overview Card */}
        <Card style={styles.overviewCard} variant="elevated" padding="lg">
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Mobile HR Portal</Text>
            <Badge
              label={isHrAdmin ? 'HR Admin' : 'Employee'}
              variant={isHrAdmin ? 'hr' : 'employee'}
              size="sm"
            />
          </View>
          <Text style={styles.cardDescription}>
            Professional mobile HR solution built for {COMPANY_INFO.name}&apos;s team of{' '}
            {COMPANY_INFO.totalEmployees} employees and {COMPANY_INFO.totalHrAdmins} HR
            administrator.
          </Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={theme.colors.success}
                style={styles.featureIcon}
              />
              <Text style={styles.featureText}>Role-based access (HR & Employee)</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={theme.colors.success}
                style={styles.featureIcon}
              />
              <Text style={styles.featureText}>Expo Router file-based navigation</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={theme.colors.success}
                style={styles.featureIcon}
              />
              <Text style={styles.featureText}>Modular and scalable architecture</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={theme.colors.success}
                style={styles.featureIcon}
              />
              <Text style={styles.featureText}>Cross-platform Android & iOS readiness</Text>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Open Dashboard"
            variant="primary"
            size="lg"
            onPress={() => router.replace('/(tabs)')}
            rightIcon={
              <Ionicons
                name="arrow-forward"
                size={20}
                color={theme.colors.textInverse}
              />
            }
            style={styles.mainButton}
          />

          <Button
            title="Switch User / Sign In"
            variant="outline"
            size="md"
            onPress={() => router.push('/(auth)/login')}
            leftIcon={
              <Ionicons
                name="person-circle-outline"
                size={20}
                color={theme.colors.primary}
              />
            }
            style={styles.secondaryButton}
          />

          <Button
            title="System Specifications"
            variant="ghost"
            size="sm"
            onPress={() => router.push('/modal')}
            leftIcon={
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={theme.colors.textSecondary}
              />
            }
            textStyle={{ color: theme.colors.textSecondary }}
          />
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            WorkSphere v1.0 • React Native & Expo SDK 58
          </Text>
        </View>
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
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
    minHeight: '100%',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  brandTitle: {
    fontSize: theme.typography.size.title,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  companySub: {
    fontSize: theme.typography.size.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  industryBadge: {
    marginTop: theme.spacing.sm,
  },
  overviewCard: {
    marginBottom: theme.spacing.xxl,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  cardDescription: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.normal,
    marginBottom: theme.spacing.md,
  },
  featureList: {
    gap: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    marginRight: theme.spacing.sm,
  },
  featureText: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.textPrimary,
  },
  buttonContainer: {
    gap: theme.spacing.md,
    marginTop: 'auto',
    marginBottom: theme.spacing.xl,
  },
  mainButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  footerText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textMuted,
  },
});
