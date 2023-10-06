import { DCAPermission, DCAPermissionSet } from '@mean-finance/sdk';
import { PermissionSet } from '@types';

export const parsePermissionsForSdk = (permissionSets: PermissionSet[]): DCAPermissionSet[] => {
  return permissionSets.map((permissionSet) => {
    const { operator, permissions } = permissionSet;
    const parsedPermissions = permissions.map((permission) => Object.values(DCAPermission)[permission]);
    return { operator, permissions: parsedPermissions };
  });
};
