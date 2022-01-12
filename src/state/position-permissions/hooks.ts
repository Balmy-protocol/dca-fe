import some from 'lodash/some';
import isEqual from 'lodash/isEqual';
import sortBy from 'lodash/sortBy';
import { useMemo } from 'react';
import { useAppSelector } from 'state/hooks';
import { RootState } from '../index';

export function usePositionPermissions(positionId: string) {
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
  );
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
