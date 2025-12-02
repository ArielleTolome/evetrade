/**
 * QuickActions - Grid of action buttons with icons and keyboard shortcuts
 *
 * @param {array} actions - Array of action objects { id, label, icon, onClick, shortcut, disabled, color }
 * @param {string} layout - Layout variant: 'grid', 'list'
 * @param {number} columns - Number of columns for grid layout (2, 3, 4, 5, 6)
 * @param {string} size - Size variant: 'sm', 'md', 'lg'
 * @param {boolean} showShortcuts - Display keyboard shortcuts
 * @param {string} className - Additional CSS classes
 */
export function QuickActions({
  actions = [],
  layout = 'grid',
  columns = 3,
  size = 'md',
  showShortcuts = true,
  className = '',
}) {
  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg',
  };

  const iconSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  };

  const colorClasses = {
    cyan: 'border-accent-cyan/30 bg-accent-cyan/5 hover:bg-accent-cyan/10 text-accent-cyan',
    gold: 'border-accent-gold/30 bg-accent-gold/5 hover:bg-accent-gold/10 text-accent-gold',
    green: 'border-accent-green/30 bg-accent-green/5 hover:bg-accent-green/10 text-accent-green',
    red: 'border-red-400/30 bg-red-400/5 hover:bg-red-400/10 text-red-400',
    purple: 'border-accent-purple/30 bg-accent-purple/5 hover:bg-accent-purple/10 text-accent-purple',
    default: 'border-white/10 bg-white/5 hover:bg-white/10 text-text-primary',
  };

  if (actions.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        No actions available
      </div>
    );
  }

  const containerClass = layout === 'grid'
    ? `grid ${columnClasses[columns]} gap-3`
    : 'flex flex-col gap-2';

  return (
    <div className={`${containerClass} ${className}`}>
      {actions.map((action) => {
        const color = action.color || 'default';
        const isDisabled = action.disabled || false;

        return (
          <button
            key={action.id}
            onClick={action.onClick}
            disabled={isDisabled}
            className={`
              ${sizeClasses[size]}
              ${colorClasses[color]}
              border rounded-xl
              transition-all duration-200
              hover:scale-[1.02] hover:shadow-lg
              active:scale-[0.98]
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
              group
              flex ${layout === 'grid' ? 'flex-col' : 'flex-row'} items-center
              ${layout === 'grid' ? 'text-center' : 'text-left'}
              gap-3
            `}
          >
            {/* Icon */}
            {action.icon && (
              <div className={`${iconSizes[size]} transition-transform group-hover:scale-110`}>
                {action.icon}
              </div>
            )}

            {/* Label and Shortcut */}
            <div className="flex-1">
              <div className="font-semibold">
                {action.label}
              </div>
              {action.description && (
                <div className="text-xs text-text-muted mt-0.5">
                  {action.description}
                </div>
              )}
            </div>

            {/* Keyboard Shortcut */}
            {showShortcuts && action.shortcut && (
              <div className="flex items-center gap-1 text-xs opacity-60 font-mono">
                {action.shortcut.split('+').map((key, i) => (
                  <span key={i}>
                    {i > 0 && <span className="mx-0.5">+</span>}
                    <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20">
                      {key}
                    </kbd>
                  </span>
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Individual action button component
 */
export function QuickActionButton({
  label,
  icon,
  onClick,
  shortcut = null,
  disabled = false,
  color = 'default',
  size = 'md',
  showShortcut = true,
  className = '',
}) {
  const action = {
    id: label,
    label,
    icon,
    onClick,
    shortcut,
    disabled,
    color,
  };

  return (
    <QuickActions
      actions={[action]}
      layout="grid"
      columns={1}
      size={size}
      showShortcuts={showShortcut}
      className={className}
    />
  );
}

/**
 * Quick actions with categories
 */
export function QuickActionsGroup({ groups = [], className = '' }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {groups.map((group, index) => (
        <div key={index}>
          {group.title && (
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              {group.title}
            </h3>
          )}
          <QuickActions
            actions={group.actions}
            layout={group.layout || 'grid'}
            columns={group.columns || 3}
            size={group.size || 'md'}
            showShortcuts={group.showShortcuts !== false}
          />
        </div>
      ))}
    </div>
  );
}

export default QuickActions;
