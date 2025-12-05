import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FormSection({
  title,
  description,
  icon,
  collapsible = false,
  defaultExpanded = true,
  children,
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  const IconComponent = icon;
  const shouldBeExpanded = !collapsible || isExpanded;

  return (
    <div className="bg-space-dark/50 backdrop-blur-sm border border-white/10 rounded-lg">
      <div
        className={`flex items-center justify-between p-4 ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={handleToggle}
        role={collapsible ? 'button' : undefined}
        aria-expanded={collapsible ? isExpanded : undefined}
      >
        <div className="flex items-center space-x-3">
          {IconComponent && <IconComponent className="w-5 h-5 text-accent-cyan" />}
          <div>
            <h3 className="text-md font-semibold text-text-primary">{title}</h3>
            {description && <p className="text-sm text-text-secondary">{description}</p>}
          </div>
        </div>
        {collapsible && (
          <ChevronDown
            className={`w-5 h-5 text-text-secondary transform transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        )}
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          shouldBeExpanded ? 'max-h-[1000px]' : 'max-h-0'
        }`}
      >
        <div className="p-4 border-t border-white/10 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
