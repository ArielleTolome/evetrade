import React from 'react';
import AuthStatusIndicator from '../common/AuthStatusIndicator';

const Header = () => {
  return (
    <header className="bg-space-dark/95 backdrop-blur-xl border-b border-white/5 p-4 flex justify-end">
      <AuthStatusIndicator />
    </header>
  );
};

export default Header;
