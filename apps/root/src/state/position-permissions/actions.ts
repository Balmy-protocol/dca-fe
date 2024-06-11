import { DCAPermission } from '@balmy/sdk';
import { createAction } from '@reduxjs/toolkit';
import { PositionPermission } from '@types';
import { Address } from 'viem';

export const setPermissions = createAction<{ id: string; permissions: Record<Address, PositionPermission> }>(
  'positionPermissions/setPermissions'
);
export const removePermission = createAction<{ operator: Address; permission: DCAPermission }>(
  'positionPermissions/removePermission'
);
export const addPermission = createAction<{ operator: Address; permission: DCAPermission }>(
  'positionPermissions/addPermission'
);
export const addOperator = createAction<{ operator: Address; permissions: DCAPermission[] }>(
  'positionPermissions/addOperator'
);
export const discardChanges = createAction('positionPermissions/discardChanges');
export const submitPermissionChanges = createAction('positionPermissions/submitChanges');
