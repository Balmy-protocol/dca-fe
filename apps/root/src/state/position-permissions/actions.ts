import { createAction } from '@reduxjs/toolkit';
import { Permission, PositionPermission } from '@types';

export const setPermissions = createAction<{ id: string; permissions: Record<string, PositionPermission> }>(
  'positionPermissions/setPermissions'
);
export const removePermission = createAction<{ operator: string; permission: Permission }>(
  'positionPermissions/removePermission'
);
export const addPermission = createAction<{ operator: string; permission: Permission }>(
  'positionPermissions/addPermission'
);
export const addOperator = createAction<{ operator: string; permissions: Permission[] }>(
  'positionPermissions/addOperator'
);
export const discardChanges = createAction('positionPermissions/discardChanges');
export const submitPermissionChanges = createAction('positionPermissions/submitChanges');
