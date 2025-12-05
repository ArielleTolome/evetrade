/**
 * Copy Components - Public API
 *
 * Export all copy-paste productivity components for easy importing
 *
 * Usage:
 *   import { OneClickCopy, BulkCopyPanel, TradeClipboard, useClipboard } from './components/common/index.copy-components';
 */

// Custom Hook
export { useClipboard } from '../../hooks/useClipboard';

// Components
export { OneClickCopy, OneClickCopyInline } from './OneClickCopy';
export { BulkCopyPanel, BulkCopyList } from './BulkCopyPanel';
export { TradeClipboard } from './TradeClipboard';

// Named exports above provide the public API
// Usage: import { OneClickCopy, useClipboard } from './components/common/index.copy-components';
