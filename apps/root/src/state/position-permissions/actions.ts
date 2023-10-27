import { DCAPermission } from '@mean-finance/sdk';
import { createAction } from '@reduxjs/toolkit';
import { PositionPermission } from '@types';

export const setPermissions = createAction<{ id: string; permissions: Record<string, PositionPermission> }>(
  'positionPermissions/setPermissions'
);
export const removePermission = createAction<{ operator: string; permission: DCAPermission }>(
  'positionPermissions/removePermission'
);
export const addPermission = createAction<{ operator: string; permission: DCAPermission }>(
  'positionPermissions/addPermission'
);
export const addOperator = createAction<{ operator: string; permissions: DCAPermission[] }>(
  'positionPermissions/addOperator'
);
export const discardChanges = createAction('positionPermissions/discardChanges');
export const submitPermissionChanges = createAction('positionPermissions/submitChanges');
