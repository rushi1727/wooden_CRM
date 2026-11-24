import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ROLES } from '../data/masterData';
import {
  canView, canCreate, canEdit, canDelete, canApprove, applyScope, isSuperAdmin,
} from '../utils/permissions';

export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;

export function useAuth() {
  const role = useAppSelector((s) => s.auth.role);
  const roleConfig = ROLES[role];
  return {
    role,
    roleConfig,
    user: roleConfig?.user || '',
    isAdmin: isSuperAdmin(role),
  };
}

export function usePermissions() {
  const { role, roleConfig } = useAuth();
  const user = ROLES[role]?.user || '';
  return useMemo(() => ({
    role,
    roleConfig,
    user,
    isAdmin: isSuperAdmin(role),
    view: (module) => canView(role, module),
    create: (module) => canCreate(role, module),
    edit: (module) => canEdit(role, module),
    remove: (module) => canDelete(role, module),
    approve: (area) => canApprove(role, area),
    scope: (collection, items) => applyScope(role, user, collection, items),
  }), [role, roleConfig, user]);
}

/** Selector hook for an entity collection, with role-based record scoping applied. */
export function useScopedCollection(collectionKey) {
  const role = useAppSelector((s) => s.auth.role);
  const user = ROLES[role]?.user || '';
  const items = useAppSelector((s) => s[collectionKey]?.items || []);
  return useMemo(() => applyScope(role, user, collectionKey, items), [role, user, collectionKey, items]);
}

export function useCollection(collectionKey) {
  return useAppSelector((s) => s[collectionKey]?.items || []);
}
