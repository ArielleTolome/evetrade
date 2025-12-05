import { Link } from 'react-router-dom';
import { Button } from './Button';
import { GlassmorphicCard } from './GlassmorphicCard';

const variants = {
  default: {
    cardClass: 'bg-space-dark/50',
    iconContainerClass: 'bg-accent-cyan/10 text-accent-cyan',
    titleClass: 'text-text-primary',
    descriptionClass: 'text-text-secondary/70',
  },
  search: {
    cardClass: 'bg-space-dark/30 shadow-none border-none',
    iconContainerClass: 'bg-yellow-500/10 text-yellow-500',
    titleClass: 'text-text-primary',
    descriptionClass: 'text-text-secondary/70',
  },
  error: {
    cardClass: 'bg-red-500/10 border-red-500/30',
    iconContainerClass: 'bg-red-500/10 text-red-400',
    titleClass: 'text-red-400',
    descriptionClass: 'text-red-400/80',
  },
  'empty-list': {
    cardClass: 'border-dashed border-white/20 bg-transparent shadow-none',
    iconContainerClass: 'bg-white/5 text-text-secondary',
    titleClass: 'text-text-secondary',
    descriptionClass: 'text-text-secondary/60',
  },
};

export function EmptyState({ icon, title, description, action, variant = 'default', className = '' }) {
  const selectedVariant = variants[variant] || variants.default;

  const renderActionButton = () => {
    if (!action) return null;

    if (action.to) {
      return (
        <Button as={Link} to={action.to} variant="primary" className="mt-6 px-6 py-2">
          {action.text}
        </Button>
      );
    }

    return (
      <Button onClick={action.onClick} variant="primary" className="mt-6 px-6 py-2">
        {action.text}
      </Button>
    );
  };

  return (
    <GlassmorphicCard className={`text-center py-12 px-6 ${selectedVariant.cardClass} ${className}`}>
      <div className="max-w-sm mx-auto">
        {icon && (
          <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${selectedVariant.iconContainerClass}`}>
            {icon}
          </div>
        )}
        {title && (
          <h3 className={`text-xl font-display ${selectedVariant.titleClass} mb-2`}>
            {title}
          </h3>
        )}
        {description && (
          <p className={`text-sm ${selectedVariant.descriptionClass}`}>
            {description}
          </p>
        )}
        {renderActionButton()}
      </div>
    </GlassmorphicCard>
  );
}

export default EmptyState;
