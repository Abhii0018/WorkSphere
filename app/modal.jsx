import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import theme, { COLORS, SPACING, RADIUS, SHADOWS } from '../src/constants/theme';
import { COMPANY_INFO } from '../src/constants/company';
import { Card, Badge, Button } from '../src/components';

export default function ModalScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>System Architecture & Brief</Text>
          <Text style={styles.subtitle}>
            WorkSphere 2.0 • Academic & Enterprise Specifications
          </Text>
        </View>

        {/* Academic Context Card */}
        <Card style={styles.card} padding="lg">
          <Text style={styles.sectionHeading}>Academic Project Context</Text>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>University</Text>
            <Text style={styles.specVal}>Lovely Professional University (LPU)</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Degree & Course</Text>
            <Text style={styles.specVal}>MBA • HRMM504</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Subject</Text>
            <Text style={styles.specVal}>Organization Behavior & HR Dynamics II</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Industry Partner</Text>
            <Text style={styles.specVal}>Visartech Company (Chicago, IL)</Text>
          </View>
        </Card>

        {/* Company & Environment Card */}
        <Card style={styles.card} padding="lg">
          <Text style={styles.sectionHeading}>Organization Profile</Text>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Company</Text>
            <Text style={styles.specVal}>{COMPANY_INFO.name}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Industry</Text>
            <Text style={styles.specVal}>{COMPANY_INFO.industry}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Headquarters</Text>
            <Text style={styles.specVal}>Chicago, Illinois, USA</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Workforce Scale</Text>
            <Text style={styles.specVal}>6 Employees • 1 HR Administrator</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Timezone</Text>
            <Text style={styles.specVal}>America/Chicago (CST)</Text>
          </View>
        </Card>

        {/* Full-Stack Technology Stack */}
        <Card style={styles.card} padding="lg">
          <Text style={styles.sectionHeading}>Full-Stack Cloud Stack</Text>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Mobile Client</Text>
            <Badge label="React Native • Expo SDK 58" variant="primary" size="sm" />
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Navigation</Text>
            <Badge label="Expo Router File-based" variant="info" size="sm" />
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Backend API</Text>
            <Badge label="Node.js & Express REST API" variant="success" size="sm" />
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Cloud Database</Text>
            <Badge label="MongoDB Atlas" variant="success" size="sm" />
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Security</Text>
            <Badge label="bcryptjs + JWT RBAC" variant="neutral" size="sm" />
          </View>
        </Card>

        {/* 8 Functional Pillars */}
        <Card style={styles.card} padding="lg">
          <Text style={styles.sectionHeading}>Operational HR Modules (8/8 Active)</Text>
          {[
            '1. Role-Based Authentication (HR Admin & Employee)',
            '2. Real-Time Chicago Attendance & Working Hours',
            '3. Leave Applications & Multi-Tier Approvals',
            '4. Centralized Employee Directory & Profile Hub',
            '5. Sprint Task & 5-Star Performance Ratings',
            '6. Monthly Payroll, HRA & Net Salary Formulas',
            '7. Internal Announcements & Company Bulletins',
            '8. Employee Feedback & Executive Satisfaction Pulse',
          ].map((item, idx) => (
            <View key={idx} style={styles.moduleItemRow}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} style={{ marginRight: 8 }} />
              <Text style={styles.moduleItemText}>{item}</Text>
            </View>
          ))}
        </Card>

        <Button
          title="Return to Application"
          onPress={() => router.back()}
          variant="primary"
          size="md"
          style={styles.closeBtn}
        />
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
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontFamily: 'sans-serif',
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontFamily: 'sans-serif',
  },
  card: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.sm,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 6,
    fontFamily: 'sans-serif',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  specKey: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    fontFamily: 'sans-serif',
  },
  specVal: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontFamily: 'sans-serif',
  },
  moduleItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  moduleItemText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontFamily: 'sans-serif',
    fontWeight: '500',
  },
  closeBtn: {
    marginVertical: SPACING.md,
  },
});
