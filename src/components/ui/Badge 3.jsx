import React from 'react';

export const Badge = ({ className, children }) => {
  return (
    <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${className}`}>
      {children}
    </span>
  );
};
