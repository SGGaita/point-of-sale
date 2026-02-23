# Theme Implementation - Dark Mode & Light Mode

## Overview
The POS system now supports both light and dark themes with seamless switching and persistence.

## Features Implemented

### 1. Theme Configuration (`src/theme/theme.js`)
- **Light Theme**: Clean, professional light color palette
- **Dark Theme**: Eye-friendly dark color palette
- Custom color schemes for both modes:
  - Primary, Secondary, Success, Error, Warning, Info colors
  - Background colors (default, paper, sidebar, card)
  - Text colors (primary, secondary, disabled)
  - Custom shadows optimized for each mode

### 2. Theme Context (`src/contexts/ThemeContext.js`)
- Global theme state management
- `useTheme()` hook for accessing theme mode and toggle function
- Automatic theme persistence in localStorage
- System preference detection on first load
- Prevents flash of wrong theme on page load

### 3. Theme Toggle Button
- Located in the Sidebar component
- Sun icon for light mode, Moon icon for dark mode
- Smooth transitions between themes
- Accessible via keyboard

### 4. Updated Components

#### Sidebar (`src/components/dashboard/Sidebar.js`)
- Dynamic colors based on theme mode
- Logo gradient adapts to theme
- Navigation items highlight color changes
- Avatar background adapts to theme
- Hover states optimized for both modes

#### Dashboard (`src/app/dashboard/page.js`)
- Stats cards with theme-aware backgrounds
- Charts with appropriate colors
- All text and borders adapt to theme
- Consistent spacing and styling

### 5. Theme Persistence
- Theme preference saved to `localStorage` as `pos_theme`
- Automatically loads saved preference on app start
- Falls back to system preference if no saved theme

## Usage

### For Users
1. Click the sun/moon icon in the sidebar to toggle theme
2. Theme preference is automatically saved
3. Your choice persists across sessions

### For Developers

#### Accessing Theme Mode
```javascript
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { mode, toggleTheme } = useTheme();
  
  return (
    <Box sx={{
      bgcolor: mode === 'dark' ? 'rgba(144, 202, 249, 0.1)' : '#e3f2fd'
    }}>
      {/* Your content */}
    </Box>
  );
}
```

#### Using MUI Theme
```javascript
import { useTheme } from '@mui/material/styles';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <Box sx={{
      bgcolor: 'background.default', // Automatically adapts
      color: 'text.primary',          // Automatically adapts
      borderColor: 'divider',         // Automatically adapts
    }}>
      {/* Your content */}
    </Box>
  );
}
```

## Color Palette

### Light Mode
- Background: `#fafafa`
- Paper: `#ffffff`
- Primary: `#1976d2`
- Success: `#2e7d32`
- Error: `#d32f2f`

### Dark Mode
- Background: `#121212`
- Paper: `#1e1e1e`
- Primary: `#90caf9`
- Success: `#66bb6a`
- Error: `#f44336`

## Best Practices

1. **Always use theme tokens** instead of hardcoded colors:
   - ✅ `bgcolor: 'background.paper'`
   - ❌ `bgcolor: '#ffffff'`

2. **Use theme-aware alpha values** for overlays:
   - Light: `rgba(0, 0, 0, 0.04)`
   - Dark: `rgba(144, 202, 249, 0.1)`

3. **Test both themes** when creating new components

4. **Use MUI's color palette** for consistency:
   - `primary.main`, `success.main`, `error.main`, etc.

## Files Modified

1. `src/theme/theme.js` - Theme configurations
2. `src/contexts/ThemeContext.js` - Theme context provider
3. `src/app/layout.js` - Root layout with ThemeProvider
4. `src/components/dashboard/Sidebar.js` - Sidebar with theme toggle
5. `src/app/dashboard/page.js` - Dashboard with theme support

## Future Enhancements

- [ ] Add theme toggle to mobile menu
- [ ] Add more theme variants (e.g., high contrast)
- [ ] Add theme customization options
- [ ] Sync theme across multiple tabs
