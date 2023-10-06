import { DCAPermission, DCAPermissionSet } from '@mean-finance/sdk';
import { PermissionSet } from '@types';

const permissionEnumValues = Object.values(DCAPermission);

export const parsePermissionsForSdk = (permissionSets: PermissionSet[]): DCAPermissionSet[] => {
  return permissionSets.map((permissionSet) => {
    const { operator, permissions } = permissionSet;
    const parsedPermissions = permissions.map((permissionIndex) => permissionEnumValues[permissionIndex]);
    return { operator, permissions: parsedPermissions };
  });
};
