/**
 * TypeScript definitions for Dashboard Widgets
 * Provides IntelliSense and type checking in IDEs
 */

export type ColorVariant = 'cyan' | 'gold' | 'green' | 'red' | 'purple' | 'default';
export type SizeVariant = 'sm' | 'md' | 'lg' | 'xl';
export type FormatType = 'number' | 'isk' | 'percent';
export type ChartType = 'line' | 'area' | 'bar';
export type LayoutType = 'grid' | 'list';
export type TrendDirection = 'up' | 'down';

export interface TrendData {
  direction: TrendDirection;
  value: number | string;
}

export interface ChartDataPoint {
  value: number;
  label?: string;
}

export interface StatCardProps {
  label: string;
  value?: number;
  format?: FormatType;
  icon?: React.ReactNode | string;
  variant?: ColorVariant;
  trend?: TrendData | null;
  onClick?: () => void;
  description?: string;
  sparklineData?: number[] | null;
  loading?: boolean;
  className?: string;
}

export interface MiniChartProps {
  data?: number[] | ChartDataPoint[];
  type?: ChartType;
  color?: ColorVariant;
  height?: string;
  showTooltip?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
}

export interface ProgressRingProps {
  percentage?: number;
  size?: SizeVariant;
  color?: ColorVariant;
  strokeWidth?: number;
  animate?: boolean;
  showPercentage?: boolean;
  centerContent?: React.ReactNode | string | null;
  label?: string | null;
  className?: string;
}

export interface ProgressRingGroupProps {
  rings?: ProgressRingProps[];
  className?: string;
}

export interface DataCardProps {
  title: string;
  subtitle?: string | React.ReactNode | null;
  children: React.ReactNode;
  footer?: React.ReactNode | null;
  actions?: React.ReactNode | null;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  refreshable?: boolean;
  onRefresh?: () => Promise<void> | void;
  loading?: boolean;
  error?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  variant?: ColorVariant;
  className?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon?: React.ReactNode | string;
  onClick: () => void;
  shortcut?: string;
  disabled?: boolean;
  color?: ColorVariant;
  description?: string;
}

export interface QuickActionsProps {
  actions?: QuickAction[];
  layout?: LayoutType;
  columns?: 2 | 3 | 4 | 5 | 6;
  size?: SizeVariant;
  showShortcuts?: boolean;
  className?: string;
}

export interface QuickActionsGroupData {
  title?: string;
  actions: QuickAction[];
  layout?: LayoutType;
  columns?: 2 | 3 | 4 | 5 | 6;
  size?: SizeVariant;
  showShortcuts?: boolean;
}

export interface QuickActionsGroupProps {
  groups?: QuickActionsGroupData[];
  className?: string;
}

export type ActivityType =
  | 'trade'
  | 'alert'
  | 'profit'
  | 'loss'
  | 'warning'
  | 'info'
  | 'success'
  | 'error'
  | 'update'
  | 'default';

export interface Activity {
  id: string | number;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: number;
  link?: string;
  onClick?: () => void;
  metadata?: Record<string, string | number>;
  icon?: React.ReactNode | string;
}

export interface ActivityFeedProps {
  activities?: Activity[];
  pageSize?: number;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  loading?: boolean;
  hasMore?: boolean;
  emptyMessage?: string;
  className?: string;
}

export interface ActivityFeedCompactProps {
  activities?: Activity[];
  maxItems?: number;
  className?: string;
}

// Component exports
export function StatCard(props: StatCardProps): JSX.Element;
export function StatCardSkeleton(props: { variant?: ColorVariant }): JSX.Element;
export function AnimatedNumber(props: {
  value: number;
  format?: FormatType;
  duration?: number
}): JSX.Element;

export function MiniChart(props: MiniChartProps): JSX.Element;

export function ProgressRing(props: ProgressRingProps): JSX.Element;
export function ProgressRingGroup(props: ProgressRingGroupProps): JSX.Element;

export function DataCard(props: DataCardProps): JSX.Element;
export function DataCardSkeleton(props: {
  hasFooter?: boolean;
  className?: string
}): JSX.Element;

export function QuickActions(props: QuickActionsProps): JSX.Element;
export function QuickActionButton(props: QuickAction & {
  size?: SizeVariant;
  showShortcut?: boolean;
  className?: string;
}): JSX.Element;
export function QuickActionsGroup(props: QuickActionsGroupProps): JSX.Element;

export function ActivityFeed(props: ActivityFeedProps): JSX.Element;
export function ActivityFeedCompact(props: ActivityFeedCompactProps): JSX.Element;
export function ActivityItemSkeleton(): JSX.Element;
