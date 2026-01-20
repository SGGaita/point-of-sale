// Theme configuration for DosBros Kitchen POS
// Centralized colors and styles for consistent UI

export const colors = {
  // Primary Colors
  primary: '#fb3441',        // Red - buttons, active states, accents
  dark: '#24222c',          // Dark - text, headings, inputs
  
  // Background Colors
  background: '#F5F5F5',    // Light gray background
  cardBackground: '#FFFFFF', // White cards
  
  // Text Colors
  textPrimary: '#24222c',   // Main text color
  textSecondary: '#7F8C8D', // Secondary text
  textTertiary: '#5D7A8C',  // Tertiary text (labels)
  placeholder: '#95A5A6',   // Placeholder text
  
  // Input Colors
  inputBackground: '#E8EEF5', // Light blue input background
  inputText: '#24222c',       // Input text color
  
  // Status Colors
  success: '#27AE60',       // Green - paid, success
  warning: '#F39C12',       // Orange - pending
  danger: '#E74C3C',        // Red - unpaid, danger
  info: '#3498DB',          // Blue - info
  
  // Border Colors
  border: '#E0E0E0',        // Light border
  borderLight: '#F0F0F0',   // Very light border
  
  // Gradient Colors (for header)
  gradientStart: '#24222c', // Dark
  gradientEnd: '#fb3441',   // Red
  
  // Other
  white: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(255, 255, 255, 0.15)',
  overlayMedium: 'rgba(255, 255, 255, 0.2)',
};

export const typography = {
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 13,
    base: 14,
    md: 15,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    huge: 35,
    massive: 42,
  },
  
  // Font Weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: 'bold',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  xxl: 20,
  round: 50,
};

export const shadows = {
  small: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  medium: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  large: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
};

// Common component styles
export const commonStyles = {
  // Card styles
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.medium,
  },
  
  // Input styles
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.inputText,
  },
  
  // Button styles
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  
  // Section heading
  sectionHeading: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  
  // Label
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  
  // Search container
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.inputText,
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  commonStyles,
};
