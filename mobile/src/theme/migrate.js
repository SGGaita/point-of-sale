// Quick migration helper script
// This file contains find/replace patterns for migrating to theme system

const colorReplacements = {
  // Primary colors
  "'#fb3441'": "colors.primary",
  "'#24222c'": "colors.textPrimary",
  "'#FFFFFF'": "colors.white",
  "'#F5F5F5'": "colors.background",
  
  // Text colors
  "'#7F8C8D'": "colors.textSecondary",
  "'#5D7A8C'": "colors.textTertiary",
  "'#95A5A6'": "colors.placeholder",
  
  // Background colors
  "'#E8EEF5'": "colors.inputBackground",
  
  // Status colors
  "'#27AE60'": "colors.success",
  "'#F39C12'": "colors.warning",
  "'#E74C3C'": "colors.danger",
  "'#3498DB'": "colors.info",
  
  // Border colors
  "'#E0E0E0'": "colors.border",
  "'#F0F0F0'": "colors.borderLight",
  
  // Overlay colors
  "'rgba(0, 0, 0, 0.5)'": "colors.overlay",
  "'rgba(255, 255, 255, 0.15)'": "colors.overlayLight",
  "'rgba(255, 255, 255, 0.2)'": "colors.overlayMedium",
};

const typographyReplacements = {
  "fontSize: 12": "fontSize: typography.fontSize.xs",
  "fontSize: 13": "fontSize: typography.fontSize.sm",
  "fontSize: 14": "fontSize: typography.fontSize.base",
  "fontSize: 15": "fontSize: typography.fontSize.md",
  "fontSize: 16": "fontSize: typography.fontSize.lg",
  "fontSize: 18": "fontSize: typography.fontSize.xl",
  "fontSize: 19": "fontSize: typography.fontSize.xl",
  "fontSize: 20": "fontSize: typography.fontSize.xxl",
  "fontSize: 24": "fontSize: typography.fontSize.xxxl",
  "fontSize: 35": "fontSize: typography.fontSize.huge",
  "fontSize: 36": "fontSize: typography.fontSize.huge",
  "fontSize: 42": "fontSize: typography.fontSize.massive",
  
  "fontWeight: '600'": "fontWeight: typography.fontWeight.semibold",
  "fontWeight: 'bold'": "fontWeight: typography.fontWeight.bold",
  "fontWeight: '500'": "fontWeight: typography.fontWeight.medium",
};

const spacingReplacements = {
  "padding: 4": "padding: spacing.xs",
  "padding: 8": "padding: spacing.sm",
  "padding: 12": "padding: spacing.md",
  "padding: 16": "padding: spacing.lg",
  "padding: 20": "padding: spacing.xl",
  
  "margin: 4": "margin: spacing.xs",
  "margin: 8": "margin: spacing.sm",
  "margin: 12": "margin: spacing.md",
  "margin: 16": "margin: spacing.lg",
  "margin: 20": "margin: spacing.xl",
};

const borderRadiusReplacements = {
  "borderRadius: 6": "borderRadius: borderRadius.sm",
  "borderRadius: 8": "borderRadius: borderRadius.md",
  "borderRadius: 10": "borderRadius: borderRadius.lg",
  "borderRadius: 12": "borderRadius: borderRadius.xl",
  "borderRadius: 20": "borderRadius: borderRadius.xxl",
};

// Export for reference
module.exports = {
  colorReplacements,
  typographyReplacements,
  spacingReplacements,
  borderRadiusReplacements,
};
