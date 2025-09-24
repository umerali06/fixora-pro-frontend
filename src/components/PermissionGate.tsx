import React from 'react';
import { usePermissions } from '../utils/permissions';

interface PermissionGateProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({ 
  permission, 
  children, 
  fallback = null 
}) => {
  const { hasPermission } = usePermissions();
  
  try {
    if (hasPermission(permission)) {
      return <>{children}</>;
    }
    
    return <>{fallback}</>;
  } catch (error) {
    console.error(`PermissionGate error for permission ${permission}:`, error);
    return <>{fallback}</>;
  }
};
