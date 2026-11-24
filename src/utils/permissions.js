import { ROLES, APPROVAL_RIGHTS, moduleLevel } from '../data/masterData';

export const isSuperAdmin = (roleKey) => roleKey === 'super_admin';

export const canView = (roleKey, module) => moduleLevel(roleKey, module) >= 1;
export const canCreate = (roleKey, module) => moduleLevel(roleKey, module) >= 2;
export const canEdit = (roleKey, module) => moduleLevel(roleKey, module) >= 2;
export const canDelete = (roleKey, module) => moduleLevel(roleKey, module) >= 3;

export const canApprove = (roleKey, area) => {
  const list = APPROVAL_RIGHTS[area];
  if (!list) return false;
  return list.includes(roleKey) || isSuperAdmin(roleKey);
};

export const roleLabel = (roleKey) => ROLES[roleKey]?.label || roleKey;
export const roleUser = (roleKey) => ROLES[roleKey]?.user || '';

/**
 * Demo data scoping: certain operational roles only see records assigned to
 * them, mirroring production row-level access rules.
 */
const SCOPE_RULES = {
  leads: [{ roles: ['sales'], field: 'salesExecutive' }],
  customers: [{ roles: ['sales'], field: 'assignedSales' }],
  quotations: [{ roles: ['sales'], field: 'salesExecutive' }],
  salesOrders: [{ roles: ['sales'], field: 'salesExecutive' }],
  projects: [
    { roles: ['project_manager'], field: 'manager' },
    { roles: ['mistri'], field: 'mistri' },
  ],
  production: [{ roles: ['mistri'], field: 'mistri' }],
  installations: [{ roles: ['installation_supervisor'], field: 'supervisor' }],
  siteInspections: [{ roles: ['site_supervisor'], field: 'supervisor' }],
  qualityInspections: [{ roles: ['qc'], field: 'inspector' }],
};

export const applyScope = (roleKey, userName, collectionKey, items) => {
  if (!items) return [];
  if (isSuperAdmin(roleKey)) return items;
  const rules = SCOPE_RULES[collectionKey];
  if (!rules) return items;
  const rule = rules.find((r) => r.roles.includes(roleKey));
  if (!rule) return items;
  return items.filter((item) => item[rule.field] === userName);
};

export const roleNavigation = (roleKey) =>
  Object.values(ROLES).find((r) => r.key === roleKey);
