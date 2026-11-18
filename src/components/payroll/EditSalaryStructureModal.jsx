import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme.js';
import {
  formatCurrency,
  calculateGrossSalary,
  calculateNetSalary,
  validateSalaryValues,
  normalizeSalaryStructure,
} from '../../utils/payroll.js';

export default function EditSalaryStructureModal({
  visible,
  employee,
  onClose,
  onSave,
}) {
  const [basic, setBasic] = useState('7000');
  const [hra, setHra] = useState('1100');
  const [otherAllowances, setOtherAllowances] = useState('550');
  const [bonus, setBonus] = useState('450');
  const [deductions, setDeductions] = useState('700');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      const raw = employee.salaryConfig || employee.salary || {};
      const struct = normalizeSalaryStructure(raw);
      setBasic(String(struct.basicSalary || 0));
      setHra(String(struct.hra || 0));
      setOtherAllowances(String(struct.otherAllowances || 0));
      setBonus(String(struct.bonus || 0));
      setDeductions(String(struct.deductions || 0));
    }
  }, [employee, visible]);

  if (!employee) return null;

  const basicNum = Math.max(0, parseFloat(basic) || 0);
  const hraNum = Math.max(0, parseFloat(hra) || 0);
  const oaNum = Math.max(0, parseFloat(otherAllowances) || 0);
  const bonusNum = Math.max(0, parseFloat(bonus) || 0);
  const dedNum = Math.max(0, parseFloat(deductions) || 0);

  const grossCalculated = calculateGrossSalary(basicNum, hraNum, oaNum, bonusNum);
  const netCalculated = calculateNetSalary(basicNum, hraNum, oaNum, bonusNum, dedNum);

  const handleSave = async () => {
    const valCheck = validateSalaryValues({
      basic: parseFloat(basic),
      hra: parseFloat(hra),
      otherAllowances: parseFloat(otherAllowances),
      bonus: parseFloat(bonus),
      deductions: parseFloat(deductions),
    });

    if (!valCheck.isValid) {
      Alert.alert('Validation Error', valCheck.error);
      return;
    }

    try {
      setLoading(true);
      const updatedStructure = {
        basicSalary: basicNum,
        hra: hraNum,
        otherAllowances: oaNum,
        allowances: hraNum + oaNum,
        bonus: bonusNum,
        deductions: dedNum,
        grossSalary: grossCalculated,
        netSalary: netCalculated,
        // compatibility aliases
        basic: basicNum,
        bonuses: bonusNum,
      };

      await onSave(employee.id, updatedStructure);
      Alert.alert(
        'Success',
        `Salary structure updated for ${employee.name}. Future payroll generations will reflect these values; past historical records remain preserved.`
      );
      onClose();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update salary structure.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Edit Salary Structure</Text>
              <Text style={styles.headerSubtitle}>
                {employee.name} • {employee.designation || employee.title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Live Calculation Preview Banner */}
            <View style={styles.previewBox}>
              <View style={styles.previewCol}>
                <Text style={styles.previewLabel}>Gross Salary</Text>
                <Text style={styles.previewVal}>{formatCurrency(grossCalculated)}</Text>
              </View>
              <View style={styles.previewDivider} />
              <View style={styles.previewCol}>
                <Text style={[styles.previewLabel, { color: COLORS.primary }]}>Net Take-Home</Text>
                <Text style={[styles.previewVal, { color: COLORS.primary, fontWeight: '800' }]}>
                  {formatCurrency(netCalculated)}
                </Text>
              </View>
            </View>

            {/* Basic Salary */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Basic Salary (USD / Month) *</Text>
              <TextInput
                style={styles.input}
                value={basic}
                onChangeText={setBasic}
                keyboardType="numeric"
                placeholder="7000"
              />
            </View>

            {/* House Rent Allowance (HRA) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>House Rent Allowance (HRA) (USD) *</Text>
              <TextInput
                style={styles.input}
                value={hra}
                onChangeText={setHra}
                keyboardType="numeric"
                placeholder="1100"
              />
            </View>

            {/* Other Allowances */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Other Allowances (Utility / Transport) (USD)</Text>
              <TextInput
                style={styles.input}
                value={otherAllowances}
                onChangeText={setOtherAllowances}
                keyboardType="numeric"
                placeholder="550"
              />
            </View>

            {/* Bonus */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Standard Performance Bonus (USD)</Text>
              <TextInput
                style={styles.input}
                value={bonus}
                onChangeText={setBonus}
                keyboardType="numeric"
                placeholder="450"
              />
            </View>

            {/* Deductions */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Deductions (Tax, Insurance, Benefits) (USD) *</Text>
              <TextInput
                style={styles.input}
                value={deductions}
                onChangeText={setDeductions}
                keyboardType="numeric"
                placeholder="700"
              />
            </View>

            {/* Integrity Notice */}
            <View style={styles.noticeBox}>
              <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
              <Text style={styles.noticeText}>
                Rule: Updating an employee's salary structure will not change previously generated payroll records. Previous historical payslips remain preserved.
              </Text>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
              disabled={loading}
              onPress={handleSave}
            >
              <Ionicons name="save-outline" size={18} color={COLORS.white} />
              <Text style={styles.saveBtnText}>
                {loading ? 'Saving...' : 'Save Salary Structure'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '88%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  content: {
    padding: SPACING.md,
  },
  previewBox: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  previewCol: {
    flex: 1,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  previewVal: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  previewDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#CED4DA',
  },
  inputGroup: {
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  noticeBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#E7F5FF',
    padding: 12,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.sm,
  },
  noticeText: {
    fontSize: 11,
    color: '#1864AB',
    lineHeight: 16,
    flex: 1,
  },
  footer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  saveBtnDisabled: {
    backgroundColor: COLORS.disabled || '#ADB5BD',
  },
  saveBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
});
