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

  const getModuleRoute = (moduleId) => {
    switch (moduleId) {
      case 'attendance':
        return '/(tabs)/attendance';
      case 'leave':
        return '/leave';
      case 'employees':
        return '/employees';
      case 'tasks':
        return '/tasks';
      case 'payroll':
        return '/payroll';
      default:
        return null;
    }
  };

  const getModuleLaunchTitle = (moduleId) => {
    switch (moduleId) {
      case 'attendance':
        return 'Launch Attendance Console';
      case 'leave':
        return 'Launch Leave Portal';
      case 'employees':
        return 'Launch Employee Directory';
      case 'tasks':
        return 'Launch Tasks & Performance';
      case 'payroll':
        return 'Launch Payroll Portal';
      default:
        return 'Open Module';
    }
  };

  const getModuleImplementationText = (moduleId) => {
    switch (moduleId) {
      case 'attendance':
        return 'The Attendance module is fully operational with live Chicago time check-in/out, persistence, and HR administration.';
      case 'leave':
        return 'The Leave Management module is fully operational with entitlement balances, approval workflows, and Chicago date calculations.';
      case 'employees':
        return 'The Employee Management module is fully operational with searchable directory, add/edit modal, active/inactive status, and unified cross-module profile views.';
      case 'tasks':
        return 'Performance & Task Management is fully operational with task assignments, priority levels, status updates with completion notes, and measurable completion rate analytics.';
      case 'payroll':
        return 'Payroll Management is fully operational with Net Salary formulas, monthly batch generation, pending/paid lifecycle, and strict employee privacy isolation.';
      default:
        return 'Frontend UI screens and API endpoints for this module will be added in the designated phase according to the project plan.';
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
              <Text style={styles.infoTitle}>Modular Architecture (5 Active Modules)</Text>
              <Text style={styles.infoDesc}>
                Attendance, Leaves, Employees, Tasks, and Payroll are live with local state persistence and centralized employee synchronization.
              </Text>
            </View>
          </View>
        </Card>

        {/* Modules List */}
        <View style={styles.moduleList}>
          {HR_MODULES.map((item, index) => {
            const hasAccess = item.roles.includes(role);
            const route = getModuleRoute(item.id);

            return (
              <Card
                key={item.id}
                style={[styles.moduleCard, !hasAccess && styles.moduleCardLocked]}
                variant="elevated"
                padding="md"
                onPress={() => {
                  if (route) {
                    router.push(route);
                  } else {
                    setSelectedModule(item);
                  }
                }}
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Badge
                      label={item.status}
                      variant={getStatusBadgeVariant(item.status)}
                      size="sm"
                    />
                    {route && (
                      <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                    )}
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>

      {/* Module Detail Modal (for planned/info modules) */}
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
                  {getModuleImplementationText(selectedModule.id)}
                </Text>
              </View>

              {getModuleRoute(selectedModule.id) ? (
                <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
                  <Button
                    title={getModuleLaunchTitle(selectedModule.id)}
                    onPress={() => {
                      const targetRoute = getModuleRoute(selectedModule.id);
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
    paddingTop: theme.spacing.md,
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
    fontSize: theme.typography.size.xs + 1,
    color: theme.colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  infoBanner: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    marginBottom: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textPrimary,
  },
  infoDesc: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  moduleList: {
    gap: theme.spacing.md,
  },
  moduleCard: {
    backgroundColor: theme.colors.surface,
  },
  moduleCardLocked: {
    opacity: 0.6,
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
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  titleWrapper: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  moduleNumber: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.primary,
    marginRight: 6,
  },
  moduleTitle: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  moduleDesc: {
    fontSize: theme.typography.size.xs + 1,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  moduleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: theme.spacing.sm,
  },
  rolesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
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
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    padding: theme.spacing.xs,
  },
  modalTitle: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  modalDesc: {
    fontSize: theme.typography.size.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  metaLabel: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.textSecondary,
  },
  roadmapBox: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.sm,
  },
  roadmapHeading: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  roadmapText: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});
