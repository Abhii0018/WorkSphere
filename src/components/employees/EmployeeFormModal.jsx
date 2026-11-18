import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';
import { Button, Input } from '../common';
import { useEmployees } from '../../context/EmployeeContext';
import { USER_ROLES } from '../../constants/company';

export const EmployeeFormModal = ({
  visible,
  onClose,
  initialData = null, // if provided, we are editing; otherwise adding
  userRole = USER_ROLES.HR_ADMIN,
}) => {
  const { addEmployee, updateEmployee } = useEmployees();
  const isEditing = !!initialData;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [title, setTitle] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [status, setStatus] = useState('Active');
  const [basicSalary, setBasicSalary] = useState('6500');
  const [allowances, setAllowances] = useState('700');
  const [bonuses, setBonuses] = useState('400');
  const [deductions, setDeductions] = useState('500');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setDepartment(initialData.department || '');
      setTitle(initialData.title || '');
      setJoinDate(initialData.joinDate || '');
      setStatus(initialData.status || 'Active');
      setBasicSalary(String(initialData.salary?.basic ?? 6500));
      setAllowances(String(initialData.salary?.allowances ?? 700));
      setBonuses(String(initialData.salary?.bonuses ?? 400));
      setDeductions(String(initialData.salary?.deductions ?? 500));
    } else {
      setName('');
      setEmail('');
      setPhone('+1 (312) 555-0107');
      setDepartment('Digital Solutions Lab');
      setTitle('Software Engineer');
      setJoinDate(new Date().toISOString().split('T')[0]);
      setStatus('Active');
      setBasicSalary('6500');
      setAllowances('700');
      setBonuses('400');
      setDeductions('500');
    }
  }, [initialData, visible]);

  const handleSubmit = async () => {
    setLoading(true);
    let result;

    if (isEditing) {
      result = await updateEmployee(
        initialData.id,
        {
          name,
          email,
          phone,
          department,
          title,
          joinDate,
          status,
          salary: {
            basic: Number(basicSalary) || 0,
            allowances: Number(allowances) || 0,
            bonuses: Number(bonuses) || 0,
            deductions: Number(deductions) || 0,
          },
        },
        userRole
      );
    } else {
      result = await addEmployee(
        {
          name,
          email,
          phone,
          department,
          title,
          joinDate,
          status,
          salary: {
            basic: Number(basicSalary) || 0,
            allowances: Number(allowances) || 0,
            bonuses: Number(bonuses) || 0,
            deductions: Number(deductions) || 0,
          },
        },
        userRole
      );
    }

    setLoading(false);

    if (result.success) {
      Alert.alert(isEditing ? 'Profile Updated' : 'Employee Added', result.message, [
        { text: 'OK', onPress: onClose },
      ]);
    } else {
      Alert.alert('Validation Error', result.error);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {isEditing ? `Edit ${initialData.name}` : 'Add New Employee'}
              </Text>
              <Text style={styles.subtitle}>
                {isEditing ? `Employee ID: ${initialData.id}` : 'Generates a unique Visartech ID'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Personal Details */}
            <Text style={styles.sectionHeading}>1. PERSONAL & CONTACT INFO</Text>

            <Input
              label="Full Name *"
              placeholder="e.g., Jonathan Vance"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Corporate Email *"
              placeholder="name@visartech.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Phone Number"
              placeholder="+1 (312) 555-0107"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            {/* Professional Role */}
            <Text style={styles.sectionHeading}>2. ROLE & DEPARTMENT</Text>

            <Input
              label="Department *"
              placeholder="e.g., Digital Solutions Lab, QA, Design"
              value={department}
              onChangeText={setDepartment}
            />

            <Input
              label="Job Title / Designation *"
              placeholder="e.g., Full Stack Engineer"
              value={title}
              onChangeText={setTitle}
            />

            <Input
              label="Joining Date (YYYY-MM-DD)"
              placeholder="2026-11-18"
              value={joinDate}
              onChangeText={setJoinDate}
            />

            {/* Status Selector */}
            <Text style={styles.fieldLabel}>Employee Status</Text>
            <View style={styles.statusToggleRow}>
              <TouchableOpacity
                style={[styles.statusOption, status === 'Active' && styles.statusOptionActive]}
                onPress={() => setStatus('Active')}
              >
                <Text style={[styles.statusOptionText, status === 'Active' && styles.statusOptionTextActive]}>
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusOption, status === 'Inactive' && styles.statusOptionInactive]}
                onPress={() => setStatus('Inactive')}
              >
                <Text style={[styles.statusOptionText, status === 'Inactive' && styles.statusOptionTextActive]}>
                  Inactive
                </Text>
              </TouchableOpacity>
            </View>

            {/* Compensation Configuration */}
            <Text style={styles.sectionHeading}>3. COMPENSATION CONFIGURATION (USD)</Text>

            <View style={styles.salaryRow}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Basic Salary ($)"
                  value={basicSalary}
                  onChangeText={setBasicSalary}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Input
                  label="Allowances ($)"
                  value={allowances}
                  onChangeText={setAllowances}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.salaryRow}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Bonuses ($)"
                  value={bonuses}
                  onChangeText={setBonuses}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Input
                  label="Deductions ($)"
                  value={deductions}
                  onChangeText={setDeductions}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Submit */}
            <Button
              title={isEditing ? 'Save Changes' : 'Create Employee Profile'}
              onPress={handleSubmit}
              loading={loading}
              variant="primary"
              size="lg"
              style={styles.submitBtn}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    maxHeight: '92%',
    ...theme.shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.size.lg + 1,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: theme.spacing.xs,
  },
  scrollBody: {
    paddingBottom: theme.spacing.xxxl,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  fieldLabel: {
    fontSize: theme.typography.size.xs + 1,
    fontWeight: theme.typography.weight.medium,
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  statusToggleRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.md,
    padding: 4,
    marginBottom: theme.spacing.md,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  statusOptionActive: {
    backgroundColor: theme.colors.success,
  },
  statusOptionInactive: {
    backgroundColor: theme.colors.danger,
  },
  statusOptionText: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.semibold,
    color: theme.colors.textSecondary,
  },
  statusOptionTextActive: {
    color: '#FFFFFF',
  },
  salaryRow: {
    flexDirection: 'row',
  },
  submitBtn: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
});

export default EmployeeFormModal;
