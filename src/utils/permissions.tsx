import React from 'react';
import { useAppSelector } from '../store/hooks';

// Permission checking utility functions
export const usePermissions = () => {
  console.log('🔍 usePermissions - Hook called');
  const { user } = useAppSelector((state) => state.auth);
  console.log('🔍 usePermissions - User from Redux:', user);
  console.log('🔍 usePermissions - User permissions:', user?.permissions);
  
  const hasPermission = (permission: string): boolean => {
    console.log(`🔍 hasPermission called with: ${permission}`);
    console.log(`🔍 User object:`, user);
    console.log(`🔍 User permissions:`, user?.permissions);
    
    if (!user?.permissions) {
      console.log(`❌ No user permissions for: ${permission}`);
      return false;
    }
    
    console.log(`🔍 Checking permission: ${permission}`);
    console.log(`🔍 User permissions array:`, user.permissions);
    
    // Check for wildcard permissions
    const hasWildcard = user.permissions.includes('*:*') || user.permissions.includes('*');
    if (hasWildcard) {
      console.log(`✅ Wildcard permission found for: ${permission}`);
      return true;
    }
    
    // Check for exact permission match
    if (user.permissions.includes(permission)) {
      return true;
    }
    
    // Check for wildcard permission (e.g., 'users:*' matches 'users:read')
    const [resource, action] = permission.split(':');
    if (action) {
      const wildcardPermission = `${resource}:*`;
      if (user.permissions.includes(wildcardPermission)) {
        return true;
      }
      
      // Check for alternative resource names with wildcard (e.g., repair:* vs repairs:*)
      const alternativeResources = [];
      if (resource === 'repairs') {
        alternativeResources.push('repair');
      } else if (resource === 'repair') {
        alternativeResources.push('repairs');
      } else if (resource === 'customers') {
        alternativeResources.push('customer');
      } else if (resource === 'customer') {
        alternativeResources.push('customers');
      } else if (resource === 'users') {
        alternativeResources.push('user');
      } else if (resource === 'user') {
        alternativeResources.push('users');
      } else if (resource === 'inventories') {
        alternativeResources.push('inventory');
      } else if (resource === 'inventory') {
        alternativeResources.push('inventories');
      }
      
      for (const altResource of alternativeResources) {
        const altWildcardPermission = `${altResource}:*`;
        if (user.permissions.includes(altWildcardPermission)) {
          return true;
        }
      }
    }
    
    return false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user?.permissions) return false;
    
    // Check for wildcard permissions
    const hasWildcard = user.permissions.includes('*:*') || user.permissions.includes('*');
    if (hasWildcard) return true;
    
    return permissions.some(permission => {
      // Check for specific permission
      if (user.permissions!.includes(permission)) return true;
      
      // Check for wildcard permission
      const [resource, action] = permission.split(':');
      if (action) {
        const wildcardPermission = `${resource}:*`;
        return user.permissions!.includes(wildcardPermission);
      }
      
      return false;
    });
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user?.permissions) return false;
    
    // Check for wildcard permissions
    const hasWildcard = user.permissions.includes('*:*') || user.permissions.includes('*');
    if (hasWildcard) return true;
    
    return permissions.every(permission => {
      // Check for specific permission
      if (user.permissions!.includes(permission)) return true;
      
      // Check for wildcard permission
      const [resource, action] = permission.split(':');
      if (action) {
        const wildcardPermission = `${resource}:*`;
        return user.permissions!.includes(wildcardPermission);
      }
      
      return false;
    });
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
    canManage
  };
};

// Higher-order component for permission-based rendering
export const withPermission = <P extends object>(
  Component: React.ComponentType<P>,
  permission: string | string[],
  fallback?: React.ReactNode
) => {
  return (props: P) => {
    const { hasPermission, hasAnyPermission } = usePermissions();
    
    const hasAccess = Array.isArray(permission) 
      ? hasAnyPermission(permission)
      : hasPermission(permission);
    
    if (!hasAccess) {
      return fallback ? React.createElement(React.Fragment, null, fallback) : null;
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
    console.log(`🔍 PermissionGate - ${permission}: ${hasAccess ? '✅' : '❌'}`);
  } else if (permissions) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  }
  
  return hasAccess ? React.createElement(React.Fragment, null, children) : React.createElement(React.Fragment, null, fallback);
};

export default usePermissions;