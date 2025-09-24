import React from 'react';
import { useAppSelector } from '../store/hooks';

// Permission checking utility functions
export const usePermissions = () => {
  const { user } = useAppSelector((state) => state.auth);
  
  const hasPermission = (permission: string): boolean => {
    if (!user?.permissions) return false;
    
    // Check for exact match first
    if (user.permissions.includes(permission)) return true;
    
    // Check for wildcard permissions
    const [resource, action] = permission.split(':');
    
    // Check for global wildcard (*:*)
    if (user.permissions.includes('*:*')) return true;
    
    // Check for resource wildcard (resource:*)
    if (user.permissions.includes(`${resource}:*`)) return true;
    
    // Check for action wildcard (*:action)
    if (user.permissions.includes(`*:${action}`)) return true;
    
    return false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user?.permissions) return false;
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user?.permissions) return false;
    return permissions.every(permission => hasPermission(permission));
  };

  const isAdmin = (): boolean => {
    return user?.role === 'ADMIN';
  };

  const isManager = (): boolean => {
    return user?.role === 'MANAGER';
  };

  const canRead = (resource: string): boolean => {
    return hasPermission(`${resource}:read`);
  };

  const canWrite = (resource: string): boolean => {
    return hasPermission(`${resource}:write`) || hasPermission(`${resource}:create`);
  };

  const canDelete = (resource: string): boolean => {
    return hasPermission(`${resource}:delete`);
  };

  const canManage = (resource: string): boolean => {
    return hasPermission(`${resource}:manage`);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isManager,
    canRead,
    canWrite,
    canDelete,
    canManage,
    permissions: user?.permissions || [],
    role: user?.role || null
  };
};

// Higher-order component for permission-based rendering
export const withPermission = (permission: string) => (Component: React.ComponentType<any>) => {
  return (props: any) => {
    const { hasPermission } = usePermissions();
    
    if (!hasPermission(permission)) {
      return null;
    }
    
    return React.createElement(Component, props);
  };
};

// Permission-based conditional rendering component
export const PermissionGate: React.FC<{
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ permission, permissions, requireAll = false, fallback = null, children }) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  
  let hasAccess = false;
  
  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  }
  
  return hasAccess ? React.createElement(React.Fragment, null, children) : React.createElement(React.Fragment, null, fallback);
};

export default usePermissions;
