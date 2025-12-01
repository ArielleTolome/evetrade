# Trade Notes Feature

## Overview
The Trade Notes feature allows EVETrade users to add personal notes and quick tags to any trade or item in the application. This helps traders track their observations, mark favorites, and avoid problematic trades.

## Files Created

### Core Hook
- `/src/hooks/useTradeNotes.jsx` - Custom React hook for managing trade notes

### Components
- `/src/components/common/TradeNotes.jsx` - Inline note indicator and editor component
- `/src/components/common/NotesManager.jsx` - Full notes management interface
- `/src/pages/NotesPage.jsx` - Page wrapper for NotesManager

### Documentation
- `/src/components/common/TradeNotes.example.md` - Integration guide and examples

### Modified Files
- `/src/router.jsx` - Added route for `/notes` page
- `/src/components/common/Navbar.jsx` - Added Notes link to navigation menu

## Features

### 1. Quick Tags (8 Predefined Tags)
- **Good Trade** (👍 Green) - Mark profitable or recommended trades
- **Bad Trade** (👎 Red) - Mark unprofitable or problematic trades
- **Testing** (🧪 Yellow) - Mark trades you're experimenting with
- **Favorite** (⭐ Gold) - Mark your favorite go-to trades
- **Avoid** (🚫 Red) - Mark trades to avoid
- **Scam** (⚠️ Red) - Mark potential scams or suspicious listings
- **Seasonal** (📅 Purple) - Mark trades that are seasonal
- **High Competition** (⚔️ Orange) - Mark highly competitive markets

### 2. Personal Notes
- Free-form text area for detailed notes
- Auto-saves when you click outside the text area
- Supports multi-line notes
- Preserves formatting

### 3. Note Indicator
- Compact button showing if item has notes
- Shows count of tags applied
- Preview of first 3 tags (with overflow indicator)
- Different styling for items with/without notes

### 4. Modal Editor
- Clean, focused modal interface
- Tag selection with visual feedback (ring highlight when selected)
- Large text area for notes
- Last updated timestamp
- Delete all notes with confirmation

### 5. Notes Manager Page (`/notes`)
- **Statistics Dashboard**: Total notes, items with text, items with tags
- **Search**: Filter notes by item ID or text content
- **Tag Filter**: View all items with a specific tag
- **Export**: Download all notes as JSON file (with timestamp)
- **Import**: Restore notes from JSON backup
- **Note Cards**: View all notes with full details
- **Delete**: Remove individual notes with confirmation

### 6. Data Persistence
- All notes stored in browser's localStorage
- Survives page refreshes and browser restarts
- JSON format for easy backup/restore
- Typical storage limit: 5-10MB (thousands of notes)

## Usage

### For End Users

#### Adding Notes to a Trade
1. Look for the note icon button (📝) next to any trade item
2. Click to open the note editor modal
3. Click quick tag buttons to toggle tags on/off
4. Type in the text area for detailed notes
5. Close the modal - notes auto-save

#### Managing All Notes
1. Navigate to the Notes page via the navbar
2. Use search to find specific notes
3. Filter by tags to see all items in a category
4. Export notes regularly as backup
5. Import notes to restore or merge collections

### For Developers

#### Integrating TradeNotes into Tables

```jsx
import TradeNotes from '../components/common/TradeNotes';

// In your component
<TradeNotes
  itemId={item.id}
  itemName={item.name}
/>
```

#### Using the Hook Directly

```jsx
import useTradeNotes from '../hooks/useTradeNotes';

function MyComponent() {
  const { setNote, addTag, getNote, hasNotes } = useTradeNotes();

  // Check if item has notes
  const hasItemNotes = hasNotes('34');

  // Get note for item
  const note = getNote('34');

  // Add a note
  setNote('34', 'This is a great trade!');

  // Add a tag
  addTag('34', 'favorite');
}
```

## Data Schema

### Note Object Structure
```json
{
  "34": {
    "text": "This item is profitable during peak hours",
    "tags": ["good", "favorite"],
    "updatedAt": 1701446400000
  },
  "12345": {
    "text": "Avoid - too much competition",
    "tags": ["avoid", "high-competition"],
    "updatedAt": 1701446500000
  }
}
```

### Tag Definition
```javascript
{
  id: 'good',           // Unique identifier
  label: 'Good Trade',  // Display name
  color: 'green',       // Color theme
  icon: '👍'            // Emoji icon
}
```

## LocalStorage Key
- **Key**: `evetrade_trade_notes`
- **Format**: JSON string
- **Size**: Varies by usage (typically < 1MB for normal use)

## Accessibility Features
- Keyboard navigation support
- ARIA labels for screen readers
- Focus management in modals
- Escape key to close modals
- Clear visual feedback for interactions

## Dark Mode Support
All components fully support dark mode through Tailwind's dark: classes. Theme automatically switches with the app's theme toggle.

## Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support (with responsive design)

## Performance Considerations
- Notes load from localStorage synchronously on mount
- All operations are in-memory (fast)
- localStorage writes are throttled through React's state updates
- Search and filter operations are client-side (instant)

## Future Enhancement Ideas
1. **Cloud Sync**: Sync notes across devices via backend
2. **Collaboration**: Share notes with corporation members
3. **Auto-tagging**: Automatically tag based on profit/ROI thresholds
4. **Templates**: Pre-defined note templates for common scenarios
5. **Rich Text**: Support for markdown or rich text formatting
6. **Attachments**: Attach screenshots or images to notes
7. **History**: Track changes to notes over time
8. **Reminders**: Set reminders for seasonal trades
9. **Analytics**: Aggregate statistics on tagged items
10. **Export Formats**: CSV, Excel, PDF export options

## Testing Checklist

### Component Testing
- [ ] TradeNotes renders correctly with no notes
- [ ] TradeNotes renders correctly with notes
- [ ] Modal opens and closes properly
- [ ] Tags can be toggled on/off
- [ ] Text saves when clicking outside textarea
- [ ] Delete confirmation works
- [ ] Note indicator shows correct count

### Page Testing
- [ ] NotesPage loads without errors
- [ ] Search filters notes correctly
- [ ] Tag filter works for all tags
- [ ] Export downloads JSON file
- [ ] Import accepts valid JSON
- [ ] Import rejects invalid JSON
- [ ] Statistics update correctly
- [ ] Delete removes notes

### Integration Testing
- [ ] Notes persist after page refresh
- [ ] Notes survive browser restart
- [ ] Multiple notes can be added
- [ ] Notes with same itemId are unique
- [ ] Import merges with existing notes
- [ ] Export contains all notes

### Browser Testing
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works on mobile devices
- [ ] Dark mode displays correctly
- [ ] Responsive on all screen sizes

## Troubleshooting

### Notes Not Saving
- Check browser localStorage is enabled
- Check available storage space
- Check console for errors
- Try clearing localStorage and starting fresh

### Import Not Working
- Ensure JSON is valid (use a validator)
- Check JSON follows the correct schema
- Ensure file encoding is UTF-8

### Performance Issues
- Check total note count (localStorage limits)
- Consider exporting and deleting old notes
- Clear browser cache if sluggish

## Support
For questions or issues with the Trade Notes feature:
1. Check this documentation
2. Review the example file: `TradeNotes.example.md`
3. Check browser console for errors
4. Open a GitHub issue with details

## License
Same as EVETrade project license
