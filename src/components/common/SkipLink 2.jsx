import React from 'react';

const SkipLink = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-space-dark focus:text-white focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-space-dark rounded-lg"
    >
      Skip to main content
    </a>
  );
};

export default SkipLink;
