import some from 'lodash/some';
import isEqual from 'lodash/isEqual';
import sortBy from 'lodash/sortBy';
import useWeb3Service from '@hooks/useWeb3Service';
import { useMemo } from 'react';
import { useAppSelector } from '@state/hooks';
import { FullPermission, Permission } from '@types';
import { RootState } from '../index';

export type PositionPermissions = {
  isOwner: boolean;
  INCREASE?: string;
  REDUCE?: string;
  WITHDRAW?: string;
  TERMINATE?: string;
};

export const createPermissionsObject = (isOwner = false, permissions: Permission[] = []) => {
  const permissionsToUse = isOwner ? ['WITHDRAW', 'TERMINATE', 'REDUCE', 'INCREASE'] : permissions;
  return permissionsToUse.reduce((acc, curr) => ({ ...acc, [curr]: true }), { isOwner });
};

export function mergeCompanionPermissions(
  userPermissions: PositionPermissions,
  companionPermissions: PositionPermissions
): PositionPermissions {
  if (userPermissions.isOwner) return userPermissions;
  const mergedPermissions = Object.keys(userPermissions).reduce(
    (acc, key: string): PositionPermissions => ({
      ...acc,
      [key]:
        !!userPermissions[key as keyof PositionPermissions] && !!companionPermissions[key as keyof PositionPermissions],
    }),
    { isOwner: false }
  );
  return mergedPermissions;
}

export function usePositionPermissions(positionId?: string): FullPermission {
  const {
    permissions: originalPermissions,
    modifiedPermissions,
    positionId: id,
  } = useAppSelector((state: RootState) => state.positionPermissions);

  return useMemo(
    () =>
      id === positionId
        ? {
            ...originalPermissions,
            ...modifiedPermissions,
          }
        : {},
    [id, positionId, originalPermissions, modifiedPermissions]
  ) as FullPermission;
}

export function useAccountPermissions(
  positionId: string,
  positionOwner: string,
  thirdPartyAccount?: string
): PositionPermissions {
  const web3Service = useWeb3Service();
  const account = thirdPartyAccount || web3Service.getAccount();
  const permissions = usePositionPermissions(positionId);
  const isOwner = account?.toLowerCase() === positionOwner.toLowerCase();
  const userPermissions = (permissions && permissions[account?.toLowerCase()]?.permissions) || [];
  return createPermissionsObject(isOwner, userPermissions);
}

export function useHasModifiedPermissions() {
  const originalPermissions = useAppSelector((state: RootState) => state.positionPermissions.permissions);
  const modifiedPermissions = useAppSelector((state: RootState) => state.positionPermissions.modifiedPermissions);

  return useMemo(
    () =>
      some(
        modifiedPermissions,
        (modifiedPermission) =>
          !originalPermissions[modifiedPermission.operator] ||
          !isEqual(
            sortBy(originalPermissions[modifiedPermission.operator].permissions),
            sortBy(modifiedPermission.permissions)
          )
      ),
    [originalPermissions, modifiedPermissions]
  );
}

export function useModifiedPermissions() {
  return useAppSelector((state: RootState) => Object.values(state.positionPermissions.modifiedPermissions));
}
