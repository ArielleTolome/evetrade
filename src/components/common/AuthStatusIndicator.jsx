import React from 'react';
import { useEveAuth } from '../../hooks/useEveAuth';

const AuthStatusIndicator = () => {
  const { authStatus } = useEveAuth();

  const getStatusColor = () => {
    switch (authStatus) {
      case 'authenticated':
        return 'bg-green-500';
      case 'expiring-soon':
        return 'bg-yellow-500';
      case 'expired':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
      <span>{authStatus}</span>
    </div>
  );
};

export default AuthStatusIndicator;
