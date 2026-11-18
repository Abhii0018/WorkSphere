/**
 * WorkSphere - Design Tokens & Theme Configuration
 * Tailored for Visartech (Technology & Digital Solutions)
 */

export const colors = {
  // Brand Colors
  primary: '#1E40AF',       // Royal Blue
  primaryDark: '#1E3A8A',   // Navy Dark
  primaryLight: '#3B82F6',  // Bright Blue
  primarySubtle: '#EFF6FF', // Soft Blue Background

  secondary: '#0F172A',     // Slate Dark
  secondaryLight: '#334155',// Slate Medium

  // Neutral Backgrounds
  background: '#F8FAFC',    // App Screen Background
  surface: '#FFFFFF',       // Card / Modal Background
  surfaceSubtle: '#F1F5F9', // Input / Tag background
  border: '#E2E8F0',        // Divider / Border
  borderFocus: '#2563EB',   // Focused Input Border

  // Typography Colors
  textPrimary: '#0F172A',   // Main Headings & Body
  textSecondary: '#475569', // Subtitles & Supporting Text
  textMuted: '#94A3B8',     // Captions & Placeholders
  textInverse: '#FFFFFF',   // White Text on Dark Backgrounds

  // Status & Feedback Colors
  success: '#10B981',       // Green (Active, Approved, Checked-in)
  successSubtle: '#ECFDF5',
  warning: '#F59E0B',       // Amber (Pending, Review)
  warningSubtle: '#FFFBEB',
  danger: '#EF4444',        // Red (Rejected, Overdue, Checked-out)
  dangerSubtle: '#FEF2F2',
  info: '#0284C7',          // Sky Blue (Information)
  infoSubtle: '#F0F9FF',

  // Role Badges
  roleHrAdmin: '#7C3AED',    // Purple for HR Administrator
  roleHrAdminBg: '#F5F3FF',
  roleEmployee: '#0284C7',   // Sky for Employee
  roleEmployeeBg: '#F0F9FF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const typography = {
  // Font Sizes
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    title: 28,
  },
  // Font Weights
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  // Line Heights
  lineHeight: {
    tight: 18,
    normal: 22,
    relaxed: 26,
    loose: 32,
  },
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};

export const shadows = {
  none: {},
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
};

export default theme;
