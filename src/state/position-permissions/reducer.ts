import { createReducer } from '@reduxjs/toolkit';
import { PositionPermission } from 'types';
import {
  setPermissions,
  removePermission,
  addOperator,
  addPermission,
  discardChanges,
  submitPermissionChanges,
} from './actions';

export interface PositionPermissionsState {
  // used for safe checking
  positionId: string | null;
  permissions: Record<string, PositionPermission>;
  modifiedPermissions: Record<string, PositionPermission>;
}

const initialState: PositionPermissionsState = {
  positionId: null,
  permissions: {},
  modifiedPermissions: {},
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setPermissions, (state, { payload }) => {
      state.positionId = payload.id;
      state.permissions = payload.permissions;
      state.modifiedPermissions = {};
    })
    .addCase(addPermission, (state, { payload }) => {
      if (!state.modifiedPermissions[payload.operator]) {
        state.modifiedPermissions[payload.operator] = {
          ...(state.permissions[payload.operator] || { id: payload.operator, operator: payload.operator }),
          permissions: [...(state.permissions[payload.operator].permissions || []), payload.permission],
        };
      } else {
        state.modifiedPermissions[payload.operator].permissions.push(payload.permission);
      }
    })
    .addCase(removePermission, (state, { payload }) => {
      if (!state.modifiedPermissions[payload.operator]) {
        state.modifiedPermissions[payload.operator] = {
          ...state.permissions[payload.operator],
          permissions: state.permissions[payload.operator].permissions.filter(
            (permission) => permission !== payload.permission
          ),
        };
      } else {
        state.modifiedPermissions[payload.operator].permissions = state.modifiedPermissions[
          payload.operator
        ].permissions.filter((permission) => permission !== payload.permission);
      }
    })
    .addCase(addOperator, (state, { payload }) => {
      state.modifiedPermissions[payload.operator] = {
        id: payload.operator,
        operator: payload.operator,
        permissions: payload.permissions,
      };
    })
    .addCase(discardChanges, (state) => {
      state.modifiedPermissions = {};
    })
    .addCase(submitPermissionChanges, (state) => {
      state.permissions = {
        ...state.permissions,
        ...state.modifiedPermissions,
      };
      state.modifiedPermissions = {};
    })
);
