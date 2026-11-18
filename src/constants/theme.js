/**
 * WorkSphere - Design Tokens & Theme Configuration
 * Tailored for Visartech (Technology & Digital Solutions)
 * Modern, crisp corporate design system
 */

export const colors = {
  // Brand Colors
  primary: '#1E40AF',       // Royal Indigo
  primaryDark: '#1E3A8A',   // Deep Corporate Navy
  primaryLight: '#3B82F6',  // Bright Blue Accent
  primarySubtle: '#EFF6FF', // Soft Blue Background
  primaryTint: '#DBEAFE',

  secondary: '#0F172A',     // Deep Slate
  secondaryLight: '#334155',// Slate Medium
  secondarySubtle: '#F8FAFC',

  // Neutral Backgrounds
  background: '#F8FAFC',    // Modern Soft Slate Canvas
  surface: '#FFFFFF',       // Crisp Card Surface
  surfaceSubtle: '#F1F5F9', // Subtle Gray Surface
  surfaceHighlight: '#F8FAFC',
  border: '#E2E8F0',        // Subtle Divider & Card Stroke
  borderLight: '#F1F5F9',   // Very Light Divider
  borderFocus: '#2563EB',   // Focused Input Border

  // Typography Colors
  textPrimary: '#0F172A',   // High-Contrast Heading & Body Text
  textSecondary: '#475569', // Medium Slate Subtitles & Secondary Text
  textMuted: '#94A3B8',     // Muted Captions & Placeholders
  textInverse: '#FFFFFF',   // White Text on Dark Elements
  white: '#FFFFFF',

  // Status & Feedback Colors
  success: '#10B981',       // Emerald Green (Active, Approved, Paid)
  successDark: '#047857',
  successSubtle: '#ECFDF5', // Pale Emerald Fill
  successBorder: '#A7F3D0',

  warning: '#F59E0B',       // Amber (Pending, In Progress)
  warningDark: '#B45309',
  warningSubtle: '#FFFBEB',
  warningBorder: '#FDE68A',

  danger: '#EF4444',        // Rose Red (Overdue, Rejected, Absent)
  dangerDark: '#B91C1C',
  dangerSubtle: '#FEF2F2',
  dangerBorder: '#FECACA',

  info: '#0284C7',          // Sky Blue (Information, Neutral Status)
  infoDark: '#0369A1',
  infoSubtle: '#F0F9FF',
  infoBorder: '#BAE6FD',

  // Role Badges
  roleHrAdmin: '#7C3AED',    // Purple for HR Administrator
  roleHrAdminBg: '#F5F3FF',
  roleHrAdminBorder: '#DDD6FE',

  roleEmployee: '#0284C7',   // Sky Blue for Employee
  roleEmployeeBg: '#F0F9FF',
  roleEmployeeBorder: '#BAE6FD',

  disabled: '#CBD5E1',
};

export const spacing = {
  xxs: 2,
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
    hero: 34,
  },
  // Font Weights
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  // Line Heights
  lineHeight: {
    tight: 18,
    normal: 22,
    relaxed: 26,
    loose: 32,
  },
  // Named Typography Presets
  h1: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  h3: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  captionSmall: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
};

export const borderRadius = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  full: 9999,
};

export const shadows = {
  none: {},
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 5,
  },
};

// Aliases for compatibility across codebase
export const COLORS = colors;
export const SPACING = spacing;
export const TYPOGRAPHY = typography;
export const RADIUS = borderRadius;
export const radius = borderRadius;
export const SHADOWS = shadows;

export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  radius: borderRadius,
  shadows,
};

export default theme;
