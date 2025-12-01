# TradeNotes Component

A comprehensive personal notes and tagging system for EVETrade that allows users to track and categorize their trading experiences.

## Quick Start

```jsx
import TradeNotes from './components/common/TradeNotes';

<TradeNotes itemId="34" itemName="Tritanium" />
```

## Component Files

```
src/
├── hooks/
│   └── useTradeNotes.jsx           # Core hook for notes management
├── components/
│   └── common/
│       ├── TradeNotes.jsx          # Inline note indicator & editor
│       ├── NotesManager.jsx        # Full management interface
│       └── TradeNotes.example.md   # Integration examples
└── pages/
    └── NotesPage.jsx               # /notes route page
```

## Features at a Glance

### 1. Quick Tags (8 Types)
- Good Trade 👍
- Bad Trade 👎
- Testing 🧪
- Favorite ⭐
- Avoid 🚫
- Scam ⚠️
- Seasonal 📅
- High Competition ⚔️

### 2. Personal Notes
- Multi-line text support
- Auto-save functionality
- Last updated timestamp

### 3. Notes Manager (/notes)
- Search by text or item ID
- Filter by tag
- Export/Import as JSON
- Statistics dashboard
- Delete with confirmation

### 4. Data Persistence
- Stored in localStorage
- JSON format
- Survives browser restarts

## Hook API

```jsx
const {
  notes,          // All notes object
  setNote,        // (itemId, text) => void
  addTag,         // (itemId, tagId) => void
  removeTag,      // (itemId, tagId) => void
  getNote,        // (itemId) => note | null
  hasNotes,       // (itemId) => boolean
  deleteNote,     // (itemId) => void
  searchNotes,    // (query) => note[]
  getItemsByTag,  // (tagId) => note[]
  exportNotes,    // () => string
  importNotes,    // (json) => boolean
  stats,          // { totalNotes, withText, withTags }
  QUICK_TAGS,     // Tag definitions
} = useTradeNotes();
```

## Data Structure

```json
{
  "34": {
    "text": "Good profit margins during peak hours",
    "tags": ["good", "favorite"],
    "updatedAt": 1701446400000
  }
}
```

## Integration Examples

### React Component
```jsx
import TradeNotes from './components/common/TradeNotes';

function TradeList({ items }) {
  return items.map(item => (
    <div key={item.id}>
      <span>{item.name}</span>
      <TradeNotes itemId={item.id} itemName={item.name} />
    </div>
  ));
}
```

### Direct Hook Usage
```jsx
import useTradeNotes from './hooks/useTradeNotes';

function MyComponent() {
  const { hasNotes, getNote } = useTradeNotes();

  const itemHasNotes = hasNotes('34');
  const note = getNote('34');

  return (
    <div>
      {itemHasNotes && <span>📝</span>}
      {note?.text && <p>{note.text}</p>}
    </div>
  );
}
```

## Styling

Uses Tailwind CSS with full dark mode support:
- `bg-*`, `dark:bg-*` for backgrounds
- `text-*`, `dark:text-*` for text
- Gradient borders with cyan/purple accent colors
- Responsive design (mobile-friendly)

## Browser Support

- Chrome/Edge: ✓
- Firefox: ✓
- Safari: ✓
- Mobile: ✓

## Performance

- Loads from localStorage on mount (< 10ms)
- In-memory operations (instant)
- Search/filter client-side (no API calls)
- Typical storage: < 1MB for thousands of notes

## Accessibility

- Keyboard navigation
- ARIA labels
- Focus management
- Screen reader support
- Escape key support

## Navigation

The Notes page is accessible via:
- Direct URL: `/notes`
- Navbar: "Notes" menu item (📝)

## Tips

1. **Backup Regularly**: Export notes periodically
2. **Use Tags**: Quick filters for common scenarios
3. **Be Descriptive**: Add context in text notes
4. **Check Storage**: Monitor localStorage if adding many notes
5. **Mobile**: Works great on mobile devices

## Common Use Cases

### Track Favorite Routes
```
Item: 12345
Tags: [favorite, good]
Note: "Jita to Amarr - consistent 15% ROI"
```

### Avoid Scams
```
Item: 67890
Tags: [scam, avoid]
Note: "Suspicious pricing - likely bait"
```

### Seasonal Trading
```
Item: 24680
Tags: [seasonal, good]
Note: "Spike in demand during Alliance Tournament"
```

### Testing New Markets
```
Item: 13579
Tags: [testing]
Note: "Testing Caldari Navy items - monitor for 2 weeks"
```

## Troubleshooting

**Notes not saving?**
- Check localStorage is enabled
- Check available storage
- Clear cache if needed

**Import fails?**
- Validate JSON format
- Check file encoding (UTF-8)
- Try smaller batch

**Performance slow?**
- Check total note count
- Export and archive old notes
- Clear browser cache

## Next Steps

1. Start adding notes to your trades
2. Use quick tags for fast categorization
3. Export regularly for backup
4. Check `/notes` page for overview

For detailed documentation, see `TRADE_NOTES_FEATURE.md` in the project root.
