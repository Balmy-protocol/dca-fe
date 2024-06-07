import { DCAPermission, DCAPermissionSet } from '@balmy/sdk';
import { PermissionData, PermissionSet } from '@types';

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

export const sdkPermissionsToPermissionData = (permissions: Record<string, DCAPermission[]>): PermissionData[] =>
  Object.entries(permissions).map(([operator, dcaPermissions]) => ({
    id: operator,
    operator,
    permissions: dcaPermissions,
  }));

export const permissionDataToSdkPermissions = (permissions: PermissionData[]): Record<string, DCAPermission[]> =>
  permissions.reduce<Record<string, DCAPermission[]>>(
    (acc, permission) => ({
      ...acc,
      [permission.operator]: permission.permissions,
    }),
    {}
  );
