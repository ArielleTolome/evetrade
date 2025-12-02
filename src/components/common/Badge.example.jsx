import React, { useState } from 'react';
import { Badge, StatusBadge, BadgeGroup } from './Badge';

// Example icons - defined outside component to avoid re-creation on each render
const AlertIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const StarIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const UserIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

/**
 * Badge Component Examples
 * Comprehensive showcase of all Badge component features and variations
 */
export default function BadgeExamples() {
  const [removableBadges, setRemovableBadges] = useState([
    { id: 1, text: 'Tag 1' },
    { id: 2, text: 'Tag 2' },
    { id: 3, text: 'Tag 3' },
  ]);

  const removeBadge = (id) => {
    setRemovableBadges((prev) => prev.filter((badge) => badge.id !== id));
  };

  return (
    <div className="min-h-screen bg-space-black p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div>
          <h1 className="text-4xl font-display text-white mb-2">Badge Component</h1>
          <p className="text-text-secondary">
            Comprehensive badge/tag system for EVETrade with space/cyberpunk theming
          </p>
        </div>

        {/* Colors */}
        <section className="space-y-4">
          <h2 className="text-2xl font-display text-white">Colors</h2>
          <div className="flex flex-wrap gap-3">
            <Badge color="cyan">Cyan</Badge>
            <Badge color="green">Green</Badge>
            <Badge color="red">Red</Badge>
            <Badge color="gold">Gold</Badge>
            <Badge color="purple">Purple</Badge>
            <Badge color="pink">Pink</Badge>
            <Badge color="gray">Gray</Badge>
          </div>
        </section>

        {/* Variants */}
        <section className="space-y-4">
          <h2 className="text-2xl font-display text-white">Variants</h2>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <span className="text-text-secondary w-20">Solid:</span>
              <Badge variant="solid" color="cyan">Solid</Badge>
              <Badge variant="solid" color="green">Solid</Badge>
              <Badge variant="solid" color="red">Solid</Badge>
              <Badge variant="solid" color="gold">Solid</Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="text-text-secondary w-20">Outline:</span>
              <Badge variant="outline" color="cyan">Outline</Badge>
              <Badge variant="outline" color="green">Outline</Badge>
              <Badge variant="outline" color="red">Outline</Badge>
              <Badge variant="outline" color="gold">Outline</Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="text-text-secondary w-20">Subtle:</span>
              <Badge variant="subtle" color="cyan">Subtle</Badge>
              <Badge variant="subtle" color="green">Subtle</Badge>
              <Badge variant="subtle" color="red">Subtle</Badge>
              <Badge variant="subtle" color="gold">Subtle</Badge>
            </div>
          </div>
        </section>

        {/* Sizes */}
        <section className="space-y-4">
          <h2 className="text-2xl font-display text-white">Sizes</h2>
          <div className="flex items-center flex-wrap gap-3">
            <Badge size="xs" color="cyan">Extra Small</Badge>
            <Badge size="sm" color="green">Small</Badge>
            <Badge size="md" color="purple">Medium</Badge>
            <Badge size="lg" color="pink">Large</Badge>
          </div>
        </section>

        {/* Dot Indicators */}
        <section className="space-y-4">
          <h2 className="text-2xl font-display text-white">Dot Indicators</h2>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <span className="text-text-secondary w-32">Static:</span>
              <Badge dot color="green">Online</Badge>
              <Badge dot color="cyan">Active</Badge>
              <Badge dot color="gray">Offline</Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="text-text-secondary w-32">Pulsing:</span>
              <Badge dot pulse color="green">Live</Badge>
              <Badge dot pulse color="red">Broadcasting</Badge>
              <Badge dot pulse color="gold">Processing</Badge>
            </div>
          </div>
        </section>

        {/* Icons */}
        <section className="space-y-4">
          <h2 className="text-2xl font-display text-white">Icons</h2>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <span className="text-text-secondary w-32">Left Icon:</span>
              <Badge icon={<AlertIcon />} color="red" iconPosition="left">Error</Badge>
              <Badge icon={<StarIcon />} color="gold" iconPosition="left">Featured</Badge>
              <Badge icon={<UserIcon />} color="cyan" iconPosition="left">Admin</Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="text-text-secondary w-32">Right Icon:</span>
              <Badge icon={<AlertIcon />} color="red" iconPosition="right">Error</Badge>
              <Badge icon={<StarIcon />} color="gold" iconPosition="right">Featured</Badge>
              <Badge icon={<UserIcon />} color="cyan" iconPosition="right">Admin</Badge>
            </div>
          </div>
        </section>

        {/* Removable */}
        <section className="space-y-4">
          <h2 className="text-2xl font-display text-white">Removable Badges</h2>
          <div className="flex flex-wrap gap-2">
            {removableBadges.map((badge) => (
              <Badge
                key={badge.id}
                color="cyan"
                onRemove={() => removeBadge(badge.id)}
              >
                {badge.text}
              </Badge>
            ))}
          </div>
          {removableBadges.length === 0 && (
            <p className="text-text-secondary text-sm">
              All badges removed. Refresh to reset.
            </p>
          )}
        </section>

        {/* Pill Shape */}
        <section className="space-y-4">
          <h2 className="text-2xl font-display text-white">Pill Shape</h2>
          <div className="flex flex-wrap gap-3">
            <Badge pill color="cyan">Pill Badge</Badge>
            <Badge pill color="green" dot pulse>Online</Badge>
            <Badge pill color="purple" icon={<StarIcon />}>Premium</Badge>
            <Badge pill color="pink" onRemove={() => {}}>Removable</Badge>
          </div>
        </section>

        {/* Status Badges */}
        <section className="space-y-4">
          <h2 className="text-2xl font-display text-white">Status Badges</h2>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <span className="text-text-secondary w-32">With Label:</span>
              <StatusBadge status="active" />
              <StatusBadge status="pending" />
              <StatusBadge status="completed" />
              <StatusBadge status="failed" />
              <StatusBadge status="expired" />
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="text-text-secondary w-32">Icon Only:</span>
              <StatusBadge status="active" showLabel={false} />
              <StatusBadge status="pending" showLabel={false} />
              <StatusBadge status="completed" showLabel={false} />
              <StatusBadge status="failed" showLabel={false} />
              <StatusBadge status="expired" showLabel={false} />
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="text-text-secondary w-32">Different Sizes:</span>
              <StatusBadge status="active" size="xs" />
              <StatusBadge status="pending" size="sm" />
              <StatusBadge status="completed" size="md" />
              <StatusBadge status="failed" size="lg" />
            </div>
          </div>
        </section>

        {/* Badge Groups */}
        <section className="space-y-4">
          <h2 className="text-2xl font-display text-white">Badge Groups</h2>
          <div className="space-y-3">
            <div>
              <p className="text-text-secondary text-sm mb-2">Tag Collection:</p>
              <BadgeGroup>
                <Badge color="cyan">React</Badge>
                <Badge color="purple">Vite</Badge>
                <Badge color="pink">Tailwind</Badge>
                <Badge color="green">Trading</Badge>
                <Badge color="gold">EVE Online</Badge>
              </BadgeGroup>
            </div>
            <div>
              <p className="text-text-secondary text-sm mb-2">Mixed Styles:</p>
              <BadgeGroup>
                <Badge color="green" dot pulse>Live</Badge>
                <StatusBadge status="active" />
                <Badge color="cyan" pill>New</Badge>
                <Badge color="gold" icon={<StarIcon />}>Featured</Badge>
              </BadgeGroup>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="space-y-4">
          <h2 className="text-2xl font-display text-white">Common Use Cases</h2>
          <div className="space-y-6">
            {/* Trading Status */}
            <div>
              <h3 className="text-lg font-display text-white mb-3">Trading Status</h3>
              <div className="bg-space-mid border border-accent-cyan/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-primary">Trade Route: Jita - Amarr</span>
                  <BadgeGroup>
                    <Badge dot pulse color="green">Active</Badge>
                    <Badge color="cyan" variant="outline">Profitable</Badge>
                  </BadgeGroup>
                </div>
              </div>
            </div>

            {/* Item Categories */}
            <div>
              <h3 className="text-lg font-display text-white mb-3">Item Categories</h3>
              <div className="bg-space-mid border border-accent-cyan/20 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-text-primary w-32">Tritanium:</span>
                    <Badge color="gray" size="xs">Mineral</Badge>
                    <Badge color="cyan" size="xs">High Volume</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-text-primary w-32">PLEX:</span>
                    <Badge color="gold" size="xs">Premium</Badge>
                    <Badge color="purple" size="xs">Trending</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div>
              <h3 className="text-lg font-display text-white mb-3">Order Management</h3>
              <div className="bg-space-mid border border-accent-cyan/20 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary">Buy Order #12345</span>
                    <StatusBadge status="active" size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary">Sell Order #12346</span>
                    <StatusBadge status="pending" size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary">Buy Order #12347</span>
                    <StatusBadge status="completed" size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary">Sell Order #12348</span>
                    <StatusBadge status="expired" size="sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Long Text Truncation */}
        <section className="space-y-4">
          <h2 className="text-2xl font-display text-white">Text Truncation</h2>
          <div className="space-y-2">
            <div className="max-w-xs">
              <Badge color="cyan">This is a very long badge text that should truncate</Badge>
            </div>
            <div className="max-w-xs">
              <Badge color="purple" pill>Another extremely long badge label that needs to be truncated properly</Badge>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
