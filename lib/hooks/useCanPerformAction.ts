import { useAuth } from './useAuth';

/**
 * Check if the current user can perform a permission-gated action,
 * optionally enforcing segregation of duty (creator cannot approve).
 */
export function useCanPerformAction(
  requiredPermission: string | string[],
  creatorId?: string | null,
  requireSegregation = true,
): { hasPermission: boolean; isNotCreator: boolean; canPerform: boolean } {
  const { user, hasPermission } = useAuth();

  const hasPerm = hasPermission(requiredPermission);
  const isNotCreator =
    !requireSegregation || !creatorId || !user?.id || user.id !== creatorId;

  return {
    hasPermission: hasPerm,
    isNotCreator,
    canPerform: hasPerm && isNotCreator,
  };
}
