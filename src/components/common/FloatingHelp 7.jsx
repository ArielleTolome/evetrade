import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Popover, Transition } from '@headlessui/react';
import {
  HelpCircle,
  Book,
  Keyboard,
  Github,
  MessageSquare,
  Zap,
  ExternalLink,
} from 'lucide-react';
import Tooltip from './Tooltip';
import { cn } from '../../lib/utils';

/**
 * A floating help button component that provides contextual assistance.
 * It is positioned at the bottom-right of the viewport and offers a menu
 * with helpful links and actions.
 *
 * @param {object} props - The component props.
 * @param {object} props.links - URLs for the help menu.
 * @param {string} props.links.docs - URL for the documentation.
 * @param {string} props.links.discord - URL for the Discord community.
 * @param {string} props.links.github - URL for reporting bugs on GitHub.
 * @param {boolean} [props.hidden=false] - If true, the component is not rendered.
 * @param {function} [props.onToggle] - Callback function when the menu is opened or closed.
 * @param {function} [props.onStartTour] - Callback function to trigger a page tour.
 * @param {function} [props.onShowKeyboardShortcuts] - Callback to show a keyboard shortcuts modal.
 * @param {React.ElementType} [props.icon] - Custom icon for the button.
 */
const FloatingHelp = ({
  links,
  hidden = false,
  onToggle,
  onStartTour,
  onShowKeyboardShortcuts,
  icon: CustomIcon,
}) => {
  const [showPulse, setShowPulse] = useState(() => !localStorage.getItem('hasInteractedWithHelp'));

  useEffect(() => {
    if (showPulse) {
      const timer = setTimeout(() => {
        setShowPulse(false);
        // We set this here to prevent the pulse from re-appearing on next visit
        // if the user doesn't interact.
        localStorage.setItem('hasInteractedWithHelp', 'true');
      }, 7500); // Pulse for 7.5 seconds
      return () => clearTimeout(timer);
    }
  }, [showPulse]);

  const handleInteraction = () => {
    if (showPulse) {
      setShowPulse(false);
      localStorage.setItem('hasInteractedWithHelp', 'true');
    }
  };

  if (hidden) {
    return null;
  }

  const menuItems = [
    {
      label: 'Documentation',
      icon: Book,
      href: links.docs,
      external: true,
    },
    {
      label: 'Keyboard Shortcuts',
      icon: Keyboard,
      action: onShowKeyboardShortcuts,
    },
    {
      label: 'Report a Bug',
      icon: Github,
      href: links.github,
      external: true,
    },
    {
      label: 'Join Discord',
      icon: MessageSquare,
      href: links.discord,
      external: true,
    },
    {
      label: 'Start Page Tour',
      icon: Zap,
      action: onStartTour,
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 pb-safe" onFocus={handleInteraction} onMouseEnter={handleInteraction}>
      <Popover as="div" className="relative">
        {({ open }) => (
          <PopoverContent
            open={open}
            onToggle={onToggle}
            handleInteraction={handleInteraction}
            CustomIcon={CustomIcon}
            showPulse={showPulse}
            menuItems={menuItems}
          />
        )}
      </Popover>
    </div>
  );
};

const PopoverContent = ({
  open,
  onToggle,
  handleInteraction,
  CustomIcon,
  showPulse,
  menuItems
}) => {
  useEffect(() => {
    if (onToggle) {
      onToggle(open);
    }
    if (open) {
      handleInteraction();
    }
  }, [open, onToggle, handleInteraction]);

  return (
    <>
      <Tooltip content="Need help?" position="left">
        <Popover.Button
          className={cn(
            'relative flex items-center justify-center w-14 h-14 rounded-full bg-help-bg text-help-icon shadow-lg transition-all duration-300 hover:bg-help-bg-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-space-dark',
            showPulse && 'animate-pulse-help'
          )}
          aria-label="Toggle help menu"
        >
          <span className="sr-only">Open help menu</span>
          {CustomIcon ? (
            <CustomIcon className="w-7 h-7" />
          ) : (
            <HelpCircle className="w-7 h-7" />
          )}
        </Popover.Button>
      </Tooltip>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-2"
      >
        <Popover.Panel className="absolute bottom-full right-0 mb-4 w-64 origin-bottom-right rounded-lg bg-help-menu-bg border border-help-menu-border shadow-2xl overflow-hidden">
          <div className="p-2">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href || '#'}
                    onClick={(e) => {
                      if (item.action) {
                        e.preventDefault();
                        item.action();
                      }
                    }}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className="group flex items-center gap-3 px-3 py-2 text-help-icon rounded-md hover:bg-white/10 transition-colors duration-150"
                  >
                    <item.icon className="w-5 h-5 opacity-80 group-hover:opacity-100" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.external && <ExternalLink className="w-4 h-4 ml-auto opacity-60 group-hover:opacity-100" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Popover.Panel>
      </Transition>
    </>
  );
};

FloatingHelp.propTypes = {
  links: PropTypes.shape({
    docs: PropTypes.string,
    discord: PropTypes.string,
    github: PropTypes.string,
  }).isRequired,
  hidden: PropTypes.bool,
  onToggle: PropTypes.func,
  onStartTour: PropTypes.func,
  onShowKeyboardShortcuts: PropTypes.func,
  icon: PropTypes.elementType,
};

export default FloatingHelp;