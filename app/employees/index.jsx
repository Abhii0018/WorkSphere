import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import theme, { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../src/constants/theme.js';
import { COMPANY_INFO, USER_ROLES } from '../../src/constants/company.js';
import { useAuth } from '../../src/hooks/useAuth.js';
import { useEmployees } from '../../src/context/EmployeeContext.jsx';
import {
  EmployeeCard,
  EmployeeFormModal,
  EmployeeProfileModal,
  Badge,
  Button,
} from '../../src/components/index.js';

export default function EmployeesScreen() {
  const router = useRouter();
  const { user, isHrAdmin, switchRole } = useAuth();
  const {
    employees,
    activeEmployees,
    inactiveEmployees,
    addEmployee,
    updateEmployee,
    resetEmployeeData,
  } = useEmployees();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const [formModalVisible, setFormModalVisible] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);

  // Departments list for filtering
  const departments = ['ALL', ...new Set(employees.map((e) => e.department))];

  // Filtered employees list
  const filteredEmployees = employees.filter((emp) => {
    // Status filter
    if (statusFilter === 'ACTIVE' && emp.status === 'Inactive') return false;
    if (statusFilter === 'INACTIVE' && emp.status !== 'Inactive') return false;

    // Department filter
    if (departmentFilter !== 'ALL' && emp.department !== departmentFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = emp.name.toLowerCase().includes(q);
      const matchId = emp.id.toLowerCase().includes(q);
      const matchRole = emp.designation.toLowerCase().includes(q);
      const matchDept = emp.department.toLowerCase().includes(q);
      return matchName || matchId || matchRole || matchDept;
    }

    return true;
  });

  const handleRoleToggle = () => {
    const nextRole = isHrAdmin ? USER_ROLES.EMPLOYEE : USER_ROLES.HR_ADMIN;
    switchRole(nextRole);
  };

  const handleOpenProfile = (emp) => {
    setSelectedEmployee(emp);
    setProfileModalVisible(true);
  };

  const handleOpenAddModal = () => {
    setEmployeeToEdit(null);
    setFormModalVisible(true);
  };

  const handleOpenEditModal = (emp) => {
    setProfileModalVisible(false);
    setEmployeeToEdit(emp);
    setFormModalVisible(true);
  };

  const handleSaveEmployee = async (formData) => {
    try {
      if (employeeToEdit) {
        await updateEmployee(employeeToEdit.id, formData);
        Alert.alert('Success', 'Employee record updated successfully.');
      } else {
        await addEmployee(formData);
        Alert.alert('Success', 'New employee created and added to directory.');
      }
      setFormModalVisible(false);
      setEmployeeToEdit(null);
    } catch (err) {
      Alert.alert('Validation Error', err.message);
    }
  };

  const handleResetSampleData = () => {
    Alert.alert(
      'Reset Sample Employees',
      'This will restore the 6 original Visartech employees and their default salaries.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetEmployeeData();
            Alert.alert('Reset Complete', 'Employee directory restored to defaults.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={styles.screenTitle}>Employee Directory</Text>
            <Text style={styles.subtitle}>
              {COMPANY_INFO.name} • {employees.length} Team Members
            </Text>
          </View>
          <Badge
            label={isHrAdmin ? 'HR Admin' : 'Employee'}
            variant={isHrAdmin ? 'primary' : 'info'}
            size="sm"
          />
        </View>

        {/* Demo Switcher Pill */}
        <View style={styles.roleBar}>
          <Text style={styles.roleBarText}>
            Logged in as <Text style={styles.bold}>{user?.name}</Text> ({isHrAdmin ? 'Full Access' : 'Read-Only Profiles'})
          </Text>
          <TouchableOpacity style={styles.roleToggleBtn} onPress={handleRoleToggle}>
            <Ionicons name="swap-horizontal" size={14} color={COLORS.primary} />
            <Text style={styles.roleToggleText}>Switch Role</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Summary Bar */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{employees.length}</Text>
            <Text style={styles.statLbl}>Total Staff</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: COLORS.success }]}>{activeEmployees.length}</Text>
            <Text style={styles.statLbl}>Active</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: COLORS.textSecondary }]}>{inactiveEmployees.length}</Text>
            <Text style={styles.statLbl}>Inactive</Text>
          </View>
          {isHrAdmin && (
            <TouchableOpacity style={styles.addEmployeeStatBox} onPress={handleOpenAddModal}>
              <Ionicons name="person-add" size={18} color={COLORS.white} />
              <Text style={styles.addEmployeeText}>Add New</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, ID, department, or role..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            placeholderTextColor={COLORS.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {/* Status Pills */}
            {['ALL', 'ACTIVE', 'INACTIVE'].map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setStatusFilter(status)}
                style={[
                  styles.filterPill,
                  statusFilter === status && styles.filterPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    statusFilter === status && styles.filterPillTextActive,
                  ]}
                >
                  {status === 'ALL' ? 'All Status' : status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.filterDivider} />

            {/* Department Pills */}
            {departments.map((dept) => (
              <TouchableOpacity
                key={dept}
                onPress={() => setDepartmentFilter(dept)}
                style={[
                  styles.filterPill,
                  departmentFilter === dept && styles.filterPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    departmentFilter === dept && styles.filterPillTextActive,
                  ]}
                >
                  {dept === 'ALL' ? 'All Departments' : dept}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Employees List */}
        <View style={styles.listSection}>
          <View style={styles.listHeaderRow}>
            <Text style={styles.listTitle}>
              {filteredEmployees.length} {filteredEmployees.length === 1 ? 'Employee' : 'Employees'} Found
            </Text>
            {isHrAdmin && (
              <TouchableOpacity onPress={handleResetSampleData}>
                <Text style={styles.resetText}>Reset Sample</Text>
              </TouchableOpacity>
            )}
          </View>

          {filteredEmployees.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>No Employees Found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search query or filters.</Text>
            </View>
          ) : (
            filteredEmployees.map((emp) => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                onPress={() => handleOpenProfile(emp)}
                showSalary={isHrAdmin || user?.id === emp.id}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Profile Detail Modal */}
      <EmployeeProfileModal
        visible={profileModalVisible}
        employee={selectedEmployee}
        onClose={() => setProfileModalVisible(false)}
        isHrUser={isHrAdmin}
        currentUserId={user?.id}
        onEdit={(emp) => handleOpenEditModal(emp)}
      />

      {/* Add / Edit Form Modal */}
      <EmployeeFormModal
        visible={formModalVisible}
        employee={employeeToEdit}
        onClose={() => {
          setFormModalVisible(false);
          setEmployeeToEdit(null);
        }}
        onSave={handleSaveEmployee}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: 8,
  },
  backBtn: {
    padding: 6,
    borderRadius: RADIUS.md,
  },
  headerTitleBox: {
    flex: 1,
  },
  screenTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  roleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.xs,
  },
  roleBarText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  bold: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  roleToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: SPACING.xs,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLbl: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addEmployeeStatBox: {
    flex: 1.2,
    backgroundColor: COLORS.primary,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  addEmployeeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 10,
    marginVertical: SPACING.xs,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    padding: 0,
  },
  filterSection: {
    marginVertical: SPACING.xs,
  },
  filterScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  filterDivider: {
    width: 1,
    height: 18,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  listSection: {
    marginTop: SPACING.sm,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  listTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resetText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
