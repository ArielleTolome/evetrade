import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronRight, MoreHorizontal, Home } from 'lucide-react';
import { cn } from '../../lib/utils';

const SEPARATOR_MAP = {
  '/': '/',
  '>': '>',
  '→': '→',
  chevron: <ChevronRight className="h-4 w-4" />,
};

const Breadcrumb = ({
  items = [],
  separator = 'chevron',
  maxItems = 4,
  homeIcon = <Home className="h-4 w-4" />,
  className,
}) => {
  const getSeparator = () => {
    return SEPARATOR_MAP[separator] || separator;
  };

  const collapsedItems = React.useMemo(() => {
    if (items.length <= maxItems) {
      return items;
    }
    return [
      items[0],
      { label: '...', isCollapsed: true, collapsed: items.slice(1, -2) },
      ...items.slice(-2),
    ];
  }, [items, maxItems]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `${window.location.origin}${item.href}` : undefined,
    })),
  };

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <nav aria-label="Breadcrumb" className={cn('relative bg-sea-background p-2 rounded-md', className)}>
        <ol className="flex items-center space-x-2 overflow-x-auto whitespace-nowrap">
          {homeIcon && (
            <li className="flex items-center">
              <Link to="/" className="text-sea-text hover:text-sea-active">
                {homeIcon}
              </Link>
            </li>
          )}
          {collapsedItems.map((item, index) => {
            const isFirstItem = index === 0;

            if (item.isCollapsed) {
              return (
                <li key="collapsed-menu" className="flex items-center">
                  {(!isFirstItem || homeIcon) && <span className="text-sea-separator">{getSeparator()}</span>}
                  <Menu as="div" className="relative ml-2">
                    <MenuButton className="flex items-center text-sea-text hover:text-sea-active">
                      <MoreHorizontal className="h-4 w-4" />
                    </MenuButton>
                    <MenuItems
                      anchor="bottom"
                      className="origin-top-right bg-sea-background border border-sea-separator rounded-md shadow-lg w-48 focus:outline-none"
                    >
                      {item.collapsed.map((collapsedItem) => (
                        <MenuItem key={collapsedItem.label}>
                          <Link
                            to={collapsedItem.href}
                            className="block px-4 py-2 text-sm text-sea-text hover:bg-sea-separator hover:text-sea-active"
                          >
                            {collapsedItem.label}
                          </Link>
                        </MenuItem>
                      ))}
                    </MenuItems>
                  </Menu>
                </li>
              );
            }

            return (
              <li key={item.label} className="flex items-center">
                {(!isFirstItem || homeIcon) && <span className="text-sea-separator">{getSeparator()}</span>}
                {item.href ? (
                  <Link to={item.href} className="ml-2 text-sea-text hover:text-sea-active">
                    {item.label}
                  </Link>
                ) : (
                  <span className="ml-2 text-sea-active" aria-current="page">
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
        <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-sea-background to-transparent pointer-events-none" />
      </nav>
    </>
  );
};

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
      icon: PropTypes.node,
    })
  ),
  separator: PropTypes.oneOfType([PropTypes.oneOf(['/', '>', '→', 'chevron']), PropTypes.node]),
  maxItems: PropTypes.number,
  homeIcon: PropTypes.node,
  className: PropTypes.string,
};

export { Breadcrumb };
