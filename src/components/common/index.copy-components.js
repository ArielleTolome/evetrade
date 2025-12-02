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

// Re-export for convenience
export default {
  useClipboard,
  OneClickCopy,
  OneClickCopyInline,
  BulkCopyPanel,
  BulkCopyList,
  TradeClipboard,
};
