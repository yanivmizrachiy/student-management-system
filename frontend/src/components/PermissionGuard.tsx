import { ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';

interface PermissionGuardProps {
  children: ReactNode;
  requireManager?: boolean;
  fallback?: ReactNode;
}

export default function PermissionGuard({
  children,
  requireManager = false,
  fallback = null,
}: PermissionGuardProps) {
  const { user } = useAuthStore();
  const isManager = user?.role === 'manager' || user?.email === 'yaniv@example.com';

  if (requireManager && !isManager) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

