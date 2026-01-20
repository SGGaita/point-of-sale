# Component Migration Guide

## Quick Migration Steps

### Step 1: Add Theme Import
At the top of each component file, add:

```javascript
import {colors, typography, spacing, borderRadius, shadows, commonStyles} from '../theme/theme';
```

### Step 2: Replace Color Values

Use Find & Replace in your IDE for each component:

#### Primary Colors
- Find: `'#fb3441'` → Replace: `colors.primary`
- Find: `'#24222c'` → Replace: `colors.textPrimary`
- Find: `'#FFFFFF'` → Replace: `colors.white`
- Find: `'#F5F5F5'` → Replace: `colors.background`

#### Text Colors
- Find: `'#7F8C8D'` → Replace: `colors.textSecondary`
- Find: `'#5D7A8C'` → Replace: `colors.textTertiary`
- Find: `'#95A5A6'` → Replace: `colors.placeholder`

#### Background Colors
- Find: `'#E8EEF5'` → Replace: `colors.inputBackground`

#### Status Colors
- Find: `'#27AE60'` → Replace: `colors.success`
- Find: `'#F39C12'` → Replace: `colors.warning`
- Find: `'#E74C3C'` → Replace: `colors.danger`
- Find: `'#3498DB'` → Replace: `colors.info`

#### Border Colors
- Find: `'#E0E0E0'` → Replace: `colors.border`
- Find: `'#F0F0F0'` → Replace: `colors.borderLight`

#### Overlay Colors
- Find: `'rgba(0, 0, 0, 0.5)'` → Replace: `colors.overlay`
- Find: `'rgba(255, 255, 255, 0.15)'` → Replace: `colors.overlayLight`
- Find: `'rgba(255, 255, 255, 0.2)'` → Replace: `colors.overlayMedium`

### Step 3: Replace Typography Values

#### Font Sizes
- Find: `fontSize: 12` → Replace: `fontSize: typography.fontSize.xs`
- Find: `fontSize: 13` → Replace: `fontSize: typography.fontSize.sm`
- Find: `fontSize: 14` → Replace: `fontSize: typography.fontSize.base`
- Find: `fontSize: 15` → Replace: `fontSize: typography.fontSize.md`
- Find: `fontSize: 16` → Replace: `fontSize: typography.fontSize.lg`
- Find: `fontSize: 18` → Replace: `fontSize: typography.fontSize.xl`
- Find: `fontSize: 20` → Replace: `fontSize: typography.fontSize.xxl`
- Find: `fontSize: 24` → Replace: `fontSize: typography.fontSize.xxxl`
- Find: `fontSize: 35` → Replace: `fontSize: typography.fontSize.huge`
- Find: `fontSize: 42` → Replace: `fontSize: typography.fontSize.massive`

#### Font Weights
- Find: `fontWeight: '600'` → Replace: `fontWeight: typography.fontWeight.semibold`
- Find: `fontWeight: 'bold'` → Replace: `fontWeight: typography.fontWeight.bold`
- Find: `fontWeight: '500'` → Replace: `fontWeight: typography.fontWeight.medium`

### Step 4: Replace Spacing Values

- Find: `padding: 16` → Replace: `padding: spacing.lg`
- Find: `paddingHorizontal: 16` → Replace: `paddingHorizontal: spacing.lg`
- Find: `paddingVertical: 16` → Replace: `paddingVertical: spacing.lg`
- Find: `margin: 16` → Replace: `margin: spacing.lg`
- Find: `marginBottom: 16` → Replace: `marginBottom: spacing.lg`
- Find: `marginTop: 16` → Replace: `marginTop: spacing.lg`
- Find: `gap: 16` → Replace: `gap: spacing.lg`

Common spacing values:
- `4` → `spacing.xs`
- `8` → `spacing.sm`
- `12` → `spacing.md`
- `16` → `spacing.lg`
- `20` → `spacing.xl`
- `24` → `spacing.xxl`

### Step 5: Replace Border Radius Values

- Find: `borderRadius: 6` → Replace: `borderRadius: borderRadius.sm`
- Find: `borderRadius: 8` → Replace: `borderRadius: borderRadius.md`
- Find: `borderRadius: 10` → Replace: `borderRadius: borderRadius.lg`
- Find: `borderRadius: 12` → Replace: `borderRadius: borderRadius.xl`
- Find: `borderRadius: 20` → Replace: `borderRadius: borderRadius.xxl`

### Step 6: Replace Shadow Styles

Replace shadow blocks with spread operator:

**Before:**
```javascript
elevation: 3,
shadowColor: '#000',
shadowOffset: {width: 0, height: 2},
shadowOpacity: 0.1,
shadowRadius: 4,
```

**After:**
```javascript
...shadows.medium,
```

Available shadows:
- `shadows.small` - Light shadow
- `shadows.medium` - Medium shadow  
- `shadows.large` - Heavy shadow

### Step 7: Use Common Styles

Replace repetitive patterns with common styles:

#### Input Fields
**Before:**
```javascript
input: {
  backgroundColor: '#E8EEF5',
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 12,
  fontSize: 15,
  color: '#24222c',
}
```

**After:**
```javascript
input: {
  ...commonStyles.input,
}
```

#### Section Headings
**Before:**
```javascript
heading: {
  fontSize: 18,
  fontWeight: '600',
  color: '#24222c',
  marginBottom: 12,
}
```

**After:**
```javascript
heading: {
  ...commonStyles.sectionHeading,
}
```

#### Labels
**Before:**
```javascript
label: {
  fontSize: 14,
  fontWeight: '600',
  color: '#24222c',
  marginBottom: 8,
}
```

**After:**
```javascript
label: {
  ...commonStyles.label,
}
```

#### Primary Buttons
**Before:**
```javascript
button: {
  backgroundColor: '#fb3441',
  paddingVertical: 14,
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
}
```

**After:**
```javascript
button: {
  ...commonStyles.primaryButton,
}
```

## Component-by-Component Checklist

### ✅ Header.js
- [x] Theme imported
- [x] Colors migrated
- [x] Typography migrated
- [x] Spacing migrated
- [x] Border radius migrated

### ⏳ MenuView.js
- [x] Theme imported
- [ ] Colors need migration
- [ ] Typography needs migration
- [ ] Spacing needs migration
- [ ] Common styles can be applied

### ⏳ OrdersView.js
- [ ] Theme needs import
- [ ] Colors need migration
- [ ] Typography needs migration
- [ ] Spacing needs migration

### ⏳ WaitersView.js
- [ ] Theme needs import
- [ ] Colors need migration
- [ ] Typography needs migration
- [ ] Spacing needs migration

### ⏳ SummaryView.js
- [ ] Theme needs import
- [ ] Colors need migration
- [ ] Typography needs migration
- [ ] Spacing needs migration

### ⏳ ReceiptModal.js
- [ ] Theme needs import
- [ ] Colors need migration
- [ ] Typography needs migration
- [ ] Spacing needs migration

### ⏳ ResetConfirmModal.js
- [ ] Theme needs import
- [ ] Colors need migration
- [ ] Typography needs migration
- [ ] Spacing needs migration

## Testing After Migration

After migrating each component:

1. **Visual Check**: Reload the app and verify the component looks the same
2. **Functionality Check**: Test all interactions work correctly
3. **Console Check**: Ensure no errors in the console

## Tips

- Migrate one component at a time
- Test after each migration
- Use your IDE's Find & Replace feature for bulk replacements
- Keep the app running while migrating to see changes immediately
- If something looks wrong, compare with the original hard-coded values

## Need Help?

If you encounter issues:
1. Check the theme.js file for available constants
2. Verify imports are correct
3. Make sure you're using the right theme constant for the context
4. Check the README.md in the theme folder for more examples
