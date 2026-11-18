import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import theme from '../src/constants/theme';
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
        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>System Architecture</Text>
          <Text style={styles.subtitle}>
            WorkSphere specifications and technical roadmap
          </Text>
        </View>

        {/* Company & Environment Card */}
        <Card style={styles.card} variant="elevated" padding="lg">
          <Text style={styles.sectionHeading}>Company & Environment</Text>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Client Company</Text>
            <Text style={styles.specVal}>{COMPANY_INFO.name}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Industry</Text>
            <Text style={styles.specVal}>{COMPANY_INFO.industry}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Target Platforms</Text>
            <Text style={styles.specVal}>Android (Primary) & iOS</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Team Scale</Text>
            <Text style={styles.specVal}>6 Employees, 1 HR Admin</Text>
          </View>
        </Card>

        {/* Tech Stack Card */}
        <Card style={styles.card} variant="elevated" padding="lg">
          <Text style={styles.sectionHeading}>Frontend Tech Stack</Text>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Framework</Text>
            <Badge label="React Native" variant="primary" size="sm" />
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Ecosystem</Text>
            <Badge label="Expo SDK 58" variant="info" size="sm" />
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Navigation</Text>
            <Badge label="Expo Router" variant="success" size="sm" />
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Styling</Text>
            <Badge label="StyleSheet" variant="neutral" size="sm" />
          </View>
        </Card>

        {/* Backend Blueprint Card */}
        <Card style={styles.card} variant="elevated" padding="lg">
          <Text style={styles.sectionHeading}>Backend (Future Phases)</Text>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Runtime</Text>
            <Text style={styles.specVal}>Node.js</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Web Framework</Text>
            <Text style={styles.specVal}>Express.js</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Database</Text>
            <Text style={styles.specVal}>MongoDB</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Authentication</Text>
            <Text style={styles.specVal}>JWT + bcrypt</Text>
          </View>
        </Card>

        <Button
          title="Close"
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
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.size.xxl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeading: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  specKey: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.textSecondary,
  },
  specVal: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xxxl,
  },
});
