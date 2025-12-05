import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, Check, ChevronsUpDown } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { cn } from '../../lib/utils';

/**
 * A multi-variant theme toggle component for switching between light, dark, and system themes.
 * @param {object} props - The component props.
 * @param {'switch' | 'button' | 'dropdown'} [props.variant='switch'] - The visual style of the toggle.
 * @param {boolean} [props.showLabel=false] - Whether to show a text label for the switch variant.
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - The size of the component.
 */
export const ThemeToggle = ({ variant, showLabel, size }) => {
  const { theme, isDark, isSystemTheme, toggleTheme, setLightTheme, setDarkTheme, setSystemTheme } = useTheme();

  const sizeClasses = {
    sm: {
      switch: 'w-10 h-5',
      knob: 'w-4 h-4',
      icon: 'w-3 h-3',
      label: 'text-xs',
      button: 'p-1',
      buttonIcon: 'w-4 h-4',
      dropdownButton: 'px-2 py-1 text-xs',
      dropdownIcon: 'w-3 h-3'
    },
    md: {
      switch: 'w-12 h-6',
      knob: 'w-5 h-5',
      icon: 'w-3.5 h-3.5',
      label: 'text-sm',
      button: 'p-2',
      buttonIcon: 'w-5 h-5',
      dropdownButton: 'px-3 py-2 text-sm',
      dropdownIcon: 'w-4 h-4'
    },
    lg: {
      switch: 'w-16 h-8',
      knob: 'w-7 h-7',
      icon: 'w-5 h-5',
      label: 'text-base',
      button: 'p-3',
      buttonIcon: 'w-6 h-6',
      dropdownButton: 'px-4 py-2 text-base',
      dropdownIcon: 'w-5 h-5'
    },
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;

  if (variant === 'button') {
    return (
      <button
        type="button"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={toggleTheme}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-primary transition-colors hover:bg-gray-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-space-dark',
          selectedSize.button
        )}
      >
        {isDark ? (
          <Moon className={cn(selectedSize.buttonIcon, 'text-toggle-moon')} />
        ) : (
          <Sun className={cn(selectedSize.buttonIcon, 'text-toggle-sun')} />
        )}
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
        <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className={cn("inline-flex w-full justify-center items-center gap-x-1.5 rounded-md bg-transparent text-primary shadow-sm ring-1 ring-inset ring-gray-500/20 hover:bg-gray-500/10", selectedSize.dropdownButton)}>
            <span className="capitalize">{theme}</span>
            <ChevronsUpDown className={cn(selectedSize.dropdownIcon, "text-gray-400")} aria-hidden="true" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-space-light shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button onClick={setLightTheme} className={cn('w-full text-left px-4 py-2 text-sm flex items-center', active ? 'bg-gray-500/10 text-primary' : 'text-secondary', theme === 'light' && !isSystemTheme ? 'font-bold' : '')}>
                    {theme === 'light' && !isSystemTheme && <Check className="w-4 h-4 mr-2" />}
                    Light
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button onClick={setDarkTheme} className={cn('w-full text-left px-4 py-2 text-sm flex items-center', active ? 'bg-gray-500/10 text-primary' : 'text-secondary', theme === 'dark' && !isSystemTheme ? 'font-bold' : '')}>
                    {theme === 'dark' && !isSystemTheme && <Check className="w-4 h-4 mr-2" />}
                    Dark
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button onClick={setSystemTheme} className={cn('w-full text-left px-4 py-2 text-sm flex items-center', active ? 'bg-gray-500/10 text-primary' : 'text-secondary', isSystemTheme ? 'font-bold' : '')}>
                    {isSystemTheme && <Check className="w-4 h-4 mr-2" />}
                    System
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    )
  }

  // Default to the 'switch' variant
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle dark mode"
        onClick={toggleTheme}
        className={cn(
          'relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-space-dark',
          selectedSize.switch,
          isDark ? 'bg-toggle-track-dark' : 'bg-toggle-track-light'
        )}
      >
        <span
          className={cn(
            'pointer-events-none relative inline-block transform rounded-full bg-toggle-knob shadow-lg ring-0 transition duration-200 ease-in-out',
            selectedSize.knob,
            isDark ? 'translate-x-full' : 'translate-x-0'
          )}
        >
          <span
            className={cn(
              'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ease-in-out',
              isDark ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200'
            )}
            aria-hidden="true"
          >
            <Sun className={cn('text-toggle-sun', selectedSize.icon)} />
          </span>
          <span
            className={cn(
              'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ease-in-out',
              isDark ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100'
            )}
            aria-hidden="true"
          >
            <Moon className={cn('text-toggle-moon', selectedSize.icon)} />
          </span>
        </span>
      </button>
      {showLabel && (
        <span className={cn('text-primary', selectedSize.label)}>
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </div>
  );
};

ThemeToggle.propTypes = {
  variant: PropTypes.oneOf(['switch', 'button', 'dropdown']),
  showLabel: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

ThemeToggle.defaultProps = {
  variant: 'switch',
  showLabel: false,
  size: 'md',
};

export default ThemeToggle;
