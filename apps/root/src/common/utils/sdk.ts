import { DCAPermission, DCAPermissionSet } from '@mean-finance/sdk';
import { PermissionSet } from '@types';

const permissionMapping: Record<number, DCAPermission> = {
  0: DCAPermission.INCREASE,
  1: DCAPermission.REDUCE,
  2: DCAPermission.WITHDRAW,
  3: DCAPermission.TERMINATE,
};

export const parsePermissionsForSdk = (permissionSets: PermissionSet[]): DCAPermissionSet[] => {
  return permissionSets.map((permissionSet) => {
    const { operator, permissions } = permissionSet;
    const parsedPermissions = permissions.map((permission) => permissionMapping[permission]);
    return { operator, permissions: parsedPermissions };
  });
};
