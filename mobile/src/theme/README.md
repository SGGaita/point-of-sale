# Theme System Documentation

## Overview
The theme system provides centralized styling constants for the DosBros Kitchen POS app, ensuring consistency across all components.

## File Location
`src/theme/theme.js`

## Usage

### Importing the Theme

```javascript
import { colors, typography, spacing, borderRadius, shadows, commonStyles } from '../theme/theme';
```

Or import specific parts:

```javascript
import { colors } from '../theme/theme';
```

### Using Theme Colors

**Before:**
```javascript
const styles = StyleSheet.create({
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#24222c',
  },
});
```

**After:**
```javascript
import { colors, typography } from '../theme/theme';

const styles = StyleSheet.create({
  heading: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
});
```

### Using Common Styles

**Before:**
```javascript
const styles = StyleSheet.create({
  input: {
    backgroundColor: '#E8EEF5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#24222c',
  },
});
```

**After:**
```javascript
import { commonStyles } from '../theme/theme';

const styles = StyleSheet.create({
  input: {
    ...commonStyles.input,
  },
});
```

## Theme Structure

### Colors

#### Primary Colors
- `colors.primary` - `#fb3441` (Red for buttons, active states)
- `colors.dark` - `#24222c` (Dark for text and headings)

#### Text Colors
- `colors.textPrimary` - `#24222c` (Main text)
- `colors.textSecondary` - `#7F8C8D` (Secondary text)
- `colors.textTertiary` - `#5D7A8C` (Labels)
- `colors.placeholder` - `#95A5A6` (Placeholder text)

#### Status Colors
- `colors.success` - `#27AE60` (Green - paid, success)
- `colors.warning` - `#F39C12` (Orange - pending)
- `colors.danger` - `#E74C3C` (Red - unpaid, danger)
- `colors.info` - `#3498DB` (Blue - info)

#### Background Colors
- `colors.background` - `#F5F5F5` (App background)
- `colors.cardBackground` - `#FFFFFF` (Card background)
- `colors.inputBackground` - `#E8EEF5` (Input background)

#### Gradient Colors
- `colors.gradientStart` - `#24222c` (Header gradient start)
- `colors.gradientEnd` - `#fb3441` (Header gradient end)

### Typography

#### Font Sizes
- `typography.fontSize.xs` - 12
- `typography.fontSize.sm` - 13
- `typography.fontSize.base` - 14
- `typography.fontSize.md` - 15
- `typography.fontSize.lg` - 16
- `typography.fontSize.xl` - 18
- `typography.fontSize.xxl` - 20
- `typography.fontSize.xxxl` - 24
- `typography.fontSize.huge` - 35
- `typography.fontSize.massive` - 42

#### Font Weights
- `typography.fontWeight.normal` - '400'
- `typography.fontWeight.medium` - '500'
- `typography.fontWeight.semibold` - '600'
- `typography.fontWeight.bold` - 'bold'

### Spacing
- `spacing.xs` - 4
- `spacing.sm` - 8
- `spacing.md` - 12
- `spacing.lg` - 16
- `spacing.xl` - 20
- `spacing.xxl` - 24

### Border Radius
- `borderRadius.sm` - 6
- `borderRadius.md` - 8
- `borderRadius.lg` - 10
- `borderRadius.xl` - 12
- `borderRadius.xxl` - 20
- `borderRadius.round` - 50

### Shadows
- `shadows.small` - Light shadow
- `shadows.medium` - Medium shadow
- `shadows.large` - Heavy shadow

### Common Styles

#### Card
```javascript
...commonStyles.card
```

#### Input
```javascript
...commonStyles.input
```

#### Primary Button
```javascript
...commonStyles.primaryButton
```

#### Section Heading
```javascript
...commonStyles.sectionHeading
```

#### Label
```javascript
...commonStyles.label
```

#### Search Container
```javascript
...commonStyles.searchContainer
```

## Migration Guide

### Step 1: Import Theme
Add import at the top of your component:
```javascript
import { colors, typography, spacing, commonStyles } from '../theme/theme';
```

### Step 2: Replace Hard-coded Values
Replace all hard-coded color values with theme constants:

**Color Replacements:**
- `#fb3441` → `colors.primary`
- `#24222c` → `colors.textPrimary` or `colors.dark`
- `#E8EEF5` → `colors.inputBackground`
- `#FFFFFF` → `colors.white`
- `#F5F5F5` → `colors.background`
- `#7F8C8D` → `colors.textSecondary`
- `#95A5A6` → `colors.placeholder`
- `#27AE60` → `colors.success`
- `#F39C12` → `colors.warning`
- `#E74C3C` → `colors.danger`

### Step 3: Use Common Styles
Replace repetitive style patterns with common styles:
```javascript
// Instead of defining input styles everywhere
input: {
  backgroundColor: '#E8EEF5',
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 12,
  fontSize: 15,
  color: '#24222c',
}

// Use
input: {
  ...commonStyles.input,
}
```

## Benefits

1. **Consistency** - All components use the same colors and styles
2. **Maintainability** - Change theme in one place, updates everywhere
3. **Scalability** - Easy to add new theme variations (dark mode, etc.)
4. **Type Safety** - Autocomplete for theme values in IDE
5. **Documentation** - Clear naming makes code self-documenting

## Example Component

```javascript
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, typography, spacing, commonStyles } from '../theme/theme';

const ExampleComponent = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Example Heading</Text>
      <TextInput 
        style={styles.input}
        placeholder="Enter text"
        placeholderTextColor={colors.placeholder}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  heading: {
    ...commonStyles.sectionHeading,
  },
  input: {
    ...commonStyles.input,
  },
});

export default ExampleComponent;
```

## Future Enhancements

- Add dark mode theme
- Add theme switching functionality
- Add custom fonts
- Add animation constants
- Add responsive breakpoints
