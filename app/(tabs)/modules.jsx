import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../src/constants/theme';
import { HR_MODULES, COMPANY_INFO } from '../../src/constants/company';
import { useAuth } from '../../src/hooks/useAuth';
import { Card, Badge, Button } from '../../src/components';

export default function ModulesScreen() {
  const router = useRouter();
  const { role, isHrAdmin } = useAuth();
  const [selectedModule, setSelectedModule] = useState(null);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'In Setup':
        return 'primary';
      case 'Active':
        return 'success';
      case 'In Progress':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>HR Architecture</Text>
          <Text style={styles.pageSubtitle}>
            8 Planned Modules for {COMPANY_INFO.name} ({COMPANY_INFO.totalEmployees} Employees,{' '}
            {COMPANY_INFO.totalHrAdmins} HR Admin)
          </Text>
        </View>

        {/* Info Banner */}
        <Card style={styles.infoBanner} variant="flat" padding="md">
          <View style={styles.infoRow}>
            <Ionicons
              name="cube-outline"
              size={22}
              color={theme.colors.primary}
              style={{ marginRight: theme.spacing.sm }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Modular Scaling Design</Text>
              <Text style={styles.infoDesc}>
                Each module is structured to connect independently with the backend
                Node/Express/MongoDB APIs in future phases.
              </Text>
            </View>
          </View>
        </Card>

        {/* Modules List */}
        <View style={styles.moduleList}>
          {HR_MODULES.map((item, index) => {
            const hasAccess = item.roles.includes(role);

            return (
              <Card
                key={item.id}
                style={[styles.moduleCard, !hasAccess && styles.moduleCardLocked]}
                variant="elevated"
                padding="md"
                onPress={() => setSelectedModule(item)}
              >
                <View style={styles.moduleTop}>
                  <View style={styles.iconAndTitle}>
                    <View style={styles.iconCircle}>
                      <Ionicons
                        name={item.icon}
                        size={22}
                        color={theme.colors.primary}
                      />
                    </View>
                    <View style={styles.titleWrapper}>
                      <View style={styles.titleRow}>
                        <Text style={styles.moduleNumber}>0{index + 1}.</Text>
                        <Text style={styles.moduleTitle}>{item.title}</Text>
                      </View>
                      <Text style={styles.moduleDesc} numberOfLines={2}>
                        {item.description}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.moduleFooter}>
                  <View style={styles.rolesRow}>
                    {item.roles.map((r) => (
                      <Badge
                        key={r}
                        label={r === 'HR Administrator' ? 'HR Admin' : 'Employee'}
                        variant={r === 'HR Administrator' ? 'hr' : 'employee'}
                        size="sm"
                        style={{ marginRight: 6 }}
                      />
                    ))}
                  </View>
                  <Badge
                    label={item.status}
                    variant={getStatusBadgeVariant(item.status)}
                    size="sm"
                  />
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>

      {/* Module Detail Modal */}
      {selectedModule && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={!!selectedModule}
          onRequestClose={() => setSelectedModule(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalIconBox}>
                  <Ionicons
                    name={selectedModule.icon}
                    size={28}
                    color={theme.colors.primary}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedModule(null)}
                  style={styles.modalCloseBtn}
                >
                  <Ionicons name="close" size={24} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalTitle}>{selectedModule.title}</Text>
              <Text style={styles.modalDesc}>{selectedModule.description}</Text>

              <View style={styles.modalMetaRow}>
                <Text style={styles.metaLabel}>Status:</Text>
                <Badge
                  label={selectedModule.status}
                  variant={getStatusBadgeVariant(selectedModule.status)}
                  size="sm"
                />
              </View>

              <View style={styles.modalMetaRow}>
                <Text style={styles.metaLabel}>Authorized Roles:</Text>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {selectedModule.roles.map((r) => (
                    <Badge
                      key={r}
                      label={r === 'HR Administrator' ? 'HR Admin' : 'Employee'}
                      variant={r === 'HR Administrator' ? 'hr' : 'employee'}
                      size="sm"
                    />
                  ))}
                </View>
              </View>

              <View style={styles.roadmapBox}>
                <Text style={styles.roadmapHeading}>Implementation Status:</Text>
                <Text style={styles.roadmapText}>
                  {selectedModule.id === 'attendance'
                    ? 'The Attendance module is fully operational with live Chicago time check-in/out, persistence, and HR administration.'
                    : selectedModule.id === 'leave'
                    ? 'The Leave Management module is fully operational with entitlement balances, approval workflows, and Chicago date calculations.'
                    : 'Frontend UI screens and API endpoints for this module will be added in the designated phase according to the project plan.'}
                </Text>
              </View>

              {selectedModule.id === 'attendance' || selectedModule.id === 'leave' ? (
                <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
                  <Button
                    title={selectedModule.id === 'attendance' ? 'Launch Attendance Console' : 'Launch Leave Portal'}
                    onPress={() => {
                      const targetRoute = selectedModule.id === 'attendance' ? '/(tabs)/attendance' : '/leave';
                      setSelectedModule(null);
                      router.push(targetRoute);
                    }}
                    variant="primary"
                    size="md"
                    rightIcon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
                  />
                  <Button
                    title="Close"
                    onPress={() => setSelectedModule(null)}
                    variant="outline"
                    size="sm"
                  />
                </View>
              ) : (
                <Button
                  title="Got it"
                  onPress={() => setSelectedModule(null)}
                  variant="primary"
                  size="md"
                  style={{ marginTop: theme.spacing.lg }}
                />
              )}
            </View>
          </View>
        </Modal>
      )}
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
  header: {
    marginBottom: theme.spacing.lg,
  },
  pageTitle: {
    fontSize: theme.typography.size.xxl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  pageSubtitle: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  infoBanner: {
    marginBottom: theme.spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  infoDesc: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  moduleList: {
    gap: theme.spacing.md,
  },
  moduleCard: {
    backgroundColor: theme.colors.surface,
  },
  moduleCardLocked: {
    opacity: 0.7,
  },
  moduleTop: {
    marginBottom: theme.spacing.md,
  },
  iconAndTitle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  titleWrapper: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  moduleNumber: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.primary,
    marginRight: 4,
  },
  moduleTitle: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  moduleDesc: {
    fontSize: theme.typography.size.xs + 1,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  moduleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
  },
  rolesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modalIconBox: {
    width: 52,
    height: 52,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtn: {
    padding: theme.spacing.xs,
  },
  modalTitle: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  modalDesc: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  metaLabel: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textSecondary,
  },
  roadmapBox: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  roadmapHeading: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  roadmapText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});
