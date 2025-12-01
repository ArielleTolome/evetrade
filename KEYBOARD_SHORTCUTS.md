# Keyboard Shortcuts System

## Overview

A comprehensive keyboard shortcuts system has been implemented for EVETrade power users. The system provides quick navigation, filtering, and actions throughout the application.

## Architecture

### Core Hook: `useKeyboardShortcuts`

**Location:** `/src/hooks/useKeyboardShortcuts.jsx`

The hook has been enhanced to support:
- Custom handler registration for page-specific shortcuts
- Global navigation shortcuts (existing)
- Configurable options (enabled, preventDefault, ignoreInputs)
- Smart input detection (allows Escape and focus shortcuts in input fields)

**Usage:**
```javascript
const keyboardHandlers = {
  'f': () => { /* toggle favorites */ },
  'ctrl+k': () => { /* focus search */ },
  'escape': () => { /* clear search */ },
};

const { showHelp, setShowHelp } = useKeyboardShortcuts(keyboardHandlers, {
  enabled: true,
  preventDefault: true,
  ignoreInputs: true,
});
```

### Help Modal: `KeyboardShortcutsHelp`

**Location:** `/src/hooks/useKeyboardShortcuts.jsx`

A beautiful glassmorphic modal that displays all available shortcuts grouped by category:
- Navigation
- Filtering (custom)
- Actions (custom)
- General

The modal automatically merges global navigation shortcuts with page-specific custom shortcuts.

## Implemented Shortcuts

### Global Navigation Shortcuts

| Shortcut | Action |
|----------|--------|
| `?` | Toggle keyboard shortcuts help modal |
| `Esc` | Close modals/menus |
| `1-9` | Quick navigate to pages (1=Station Trading, 2=Station Hauling, etc.) |
| `g` + `h` | Go to Home |
| `g` + `s` | Go to Station Trading |
| `g` + `d` | Go to Station Hauling |
| `g` + `r` | Go to Region Hauling |
| `g` + `p` | Go to Price Compare |
| `g` + `w` | Go to Watchlist |
| `g` + `f` | Go to Saved Routes |
| `g` + `o` | Go to Portfolio |
| `g` + `c` | Go to Calculator |

### Station Trading Page Shortcuts

**Location:** `/src/pages/StationTradingPage.jsx`

| Shortcut | Action |
|----------|--------|
| `f` | Toggle favorites filter |
| `h` | Toggle high quality filter (>10% margin, >1M ISK profit, >100 volume) |
| `r` | Refresh data (re-submit current search) |
| `/` or `Ctrl+K` | Focus search box |
| `Esc` | Clear search / close modals |
| `j` | Navigate down in table rows |
| `k` | Navigate up in table rows (vim style) |
| `Enter` | Open selected trade details |
| `c` | Copy selected trade to clipboard |
| `m` | Copy all results in multibuy format |

## Features Added

### 1. Enhanced Hook System
- Custom handler registration per page
- Smart input field detection
- Support for modifier keys (Ctrl, Shift)
- Ref-based handler updates (no dependency hell)

### 2. High Quality Filter
- New filter button with keyboard shortcut indicator
- Filters trades by:
  - Margin > 10%
  - Profit > 1M ISK
  - Volume > 100 units
- Visual feedback with toast notifications

### 3. Keyboard Shortcut Hints
- UI buttons show keyboard shortcuts as `<kbd>` elements
- Visible on desktop, hidden on mobile (responsive design)
- Consistent styling with glassmorphic theme

### 4. Search Focus
- Direct keyboard access to search box (`/` or `Ctrl+K`)
- Smart Escape handling (clears search if focused)
- Works even when typing in other inputs

### 5. Table Navigation
- Vim-style j/k navigation through results
- Visual selection state tracking
- Enter key to open selected trade
- Copy shortcuts for selected row

## UI Enhancements

### Filter Buttons
- Favorites filter button shows keyboard hint: `f`
- High Quality filter button shows keyboard hint: `h`
- Tooltip hints for all shortcuts
- Responsive design (shortcuts hidden on small screens)

### Help Modal
- Beautiful 2-column grid layout
- Categorized shortcuts
- Glassmorphic design matching app theme
- Keyboard-friendly (click outside or press `?` to close)
- Scroll support for long lists

## Technical Implementation

### TradingTable Component Updates
**Location:** `/src/components/tables/TradingTable.jsx`

Added `searchInputRef` prop to allow parent components to focus the search input:
```javascript
<TradingTable
  data={trades}
  columns={tableColumns}
  searchInputRef={searchInputRef}
  // ... other props
/>
```

### StationTradingPage Updates
**Location:** `/src/pages/StationTradingPage.jsx`

1. Added state for keyboard navigation:
   - `selectedRowIndex`: Track currently selected row
   - `highQualityOnly`: Toggle for quality filter
   - `searchInputRef`: Ref to focus search input

2. Implemented keyboard handlers with proper dependencies
3. Enhanced filteredData logic to include high quality filter
4. Added UI buttons with keyboard shortcuts hints
5. Integrated help modal

## Browser Compatibility

- Modern browsers with ES6+ support
- Keyboard event handling
- Clipboard API (for copy shortcuts)
- CSS custom properties (for styling)

## Accessibility

- All shortcuts have visual hints
- Help modal clearly explains all shortcuts
- Keyboard navigation respects input focus
- Screen reader compatible (semantic HTML)

## Future Enhancements

Potential improvements for other pages:
- Region Hauling Page shortcuts
- Station Hauling Page shortcuts
- Watchlist Page shortcuts
- Portfolio Page shortcuts
- Quick save/bookmark shortcuts
- Custom shortcut configuration
