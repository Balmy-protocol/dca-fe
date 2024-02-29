import { createReducer } from '@reduxjs/toolkit';
import { LATEST_VERSION } from '@constants';
import { Address, parseUnits } from 'viem';
import findIndex from 'lodash/findIndex';
import {
  DCAPositionModifiedAction,
  DCAPositionPermissionsModifiedAction,
  DCAPositionTerminatedAction,
  DCAPositionTransferredAction,
  DCAPositionWithdrawnAction,
  PositionPermission,
  PositionWithHistory,
  TransactionTypes,
} from '@types';
import {
  setPosition,
  updatePosition,
  updateShowBreakdown,
  setFromPrice,
  setToPrice,
  fetchPositionAndTokenPrices,
} from './actions';
import { ActionTypeAction, DCAPositionAction, DCATransaction } from '@mean-finance/sdk';
import isUndefined from 'lodash/isUndefined';
import { parseBaseUsdPriceToNumber } from '@common/utils/currency';
import { permissionDataToSdkPermissions } from '@common/utils/sdk';

export interface PositionDetailsState {
  position?: PositionWithHistory;
  fromPrice?: bigint;
  isLoading: boolean;
  toPrice?: bigint;
  showBreakdown: boolean;
}

const initialState: PositionDetailsState = {
  position: undefined,
  isLoading: false,
  showBreakdown: true,
};

export default createReducer(initialState, (builder) => {
  builder
    .addCase(setPosition, (state, { payload }) => {
      state.position = payload;
    })
    .addCase(updateShowBreakdown, (state, { payload }) => {
      state.showBreakdown = payload;
    })
    .addCase(setFromPrice, (state, { payload }) => {
      state.fromPrice = payload;
    })
    .addCase(setToPrice, (state, { payload }) => {
      state.toPrice = payload;
    })
    .addCase(fetchPositionAndTokenPrices.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(fetchPositionAndTokenPrices.rejected, (state) => {
      state.isLoading = false;
      state.position = undefined;
    })
    .addCase(fetchPositionAndTokenPrices.fulfilled, (state) => {
      state.isLoading = false;
    })
    .addCase(updatePosition, (state, { payload }) => {
      if (!state.position) {
        return state;
      }
      if (payload.position?.id !== `${state.position?.id}-v${payload.position?.version || LATEST_VERSION}`) {
        return state;
      }

      const transaction = payload;

      const { position: statePosition, toPrice: unparsedToPrice, fromPrice: unparsedFromPrice } = state;

      let position = {
        ...statePosition,
      };

      const toPrice = parseBaseUsdPriceToNumber(unparsedToPrice);
      const fromPrice = parseBaseUsdPriceToNumber(unparsedFromPrice);
      const history: DCAPositionAction[] = [...state.position.history];

      const dcaTx: DCATransaction = {
        hash: payload.hash,
        timestamp: payload.addedTime,
        gasPrice: payload.receipt?.effectiveGasPrice,
      };

      const { remainingLiquidity, remainingLiquidityYield, toWithdraw, toWithdrawYield, rate, remainingSwaps } =
        position;
      switch (transaction.type) {
        case TransactionTypes.migratePositionYield:
        case TransactionTypes.terminatePosition: {
          const terminatedAction: DCAPositionTerminatedAction = {
            withdrawnRemaining: remainingLiquidity + (remainingLiquidityYield || 0n),
            withdrawnSwapped: toWithdraw + (toWithdrawYield || 0n),
            generatedByYield:
              (!isUndefined(remainingLiquidityYield) &&
                !isUndefined(toWithdrawYield) && {
                  withdrawnRemaining: remainingLiquidityYield,
                  withdrawnSwapped: toWithdrawYield,
                }) ||
              undefined,
            fromPrice,
            toPrice,
            action: ActionTypeAction.TERMINATED,
            tx: dcaTx,
          };
          history.push(terminatedAction);
          position = {
            ...position,
            status: 'TERMINATED',
            toWithdraw: 0n,
            remainingLiquidity: 0n,
            remainingSwaps: 0n,
            toWithdrawYield: !isUndefined(toWithdrawYield) ? 0n : undefined,
            remainingLiquidityYield: !isUndefined(remainingLiquidityYield) ? 0n : undefined,
          };
          break;
        }
        case TransactionTypes.modifyPermissions: {
          const modifyPermissionsTypeData = transaction.typeData;

          const positionPermissions = position.permissions;
          let newPermissions: PositionPermission[] = [];
          if (positionPermissions) {
            modifyPermissionsTypeData.permissions.forEach((permission) => {
              const permissionIndex = findIndex(positionPermissions, {
                operator: permission.operator.toLowerCase() as Address,
              });
              if (permissionIndex !== -1) {
                newPermissions[permissionIndex] = permission;
              } else {
                newPermissions = [...newPermissions, permission];
              }
            });
          } else {
            newPermissions = modifyPermissionsTypeData.permissions;
          }

          const modifyPermissionsAction: DCAPositionPermissionsModifiedAction = {
            tx: dcaTx,
            action: ActionTypeAction.MODIFIED_PERMISSIONS,
            permissions: permissionDataToSdkPermissions(newPermissions),
          };

          history.push(modifyPermissionsAction);

          position = {
            ...position,
            permissions: newPermissions,
          };
          break;
        }
        case TransactionTypes.withdrawPosition: {
          const withdrawAction: DCAPositionWithdrawnAction = {
            tx: dcaTx,
            withdrawn: toWithdraw,
            generatedByYield:
              (!isUndefined(toWithdrawYield) && {
                withdrawn: toWithdrawYield,
              }) ||
              undefined,
            toPrice,
            action: ActionTypeAction.WITHDRAWN,
          };
          history.push(withdrawAction);

          position = {
            ...position,
            toWithdraw: 0n,
            toWithdrawYield: !isUndefined(toWithdrawYield) ? 0n : undefined,
          };

          break;
        }
        case TransactionTypes.modifyRateAndSwapsPosition: {
          const modifyRateAndSwapsPositionTypeData = transaction.typeData;
          const modifiedRateAndSwapsSwapDifference =
            BigInt(modifyRateAndSwapsPositionTypeData.newSwaps) < BigInt(position.remainingSwaps)
              ? BigInt(position.remainingSwaps) - BigInt(modifyRateAndSwapsPositionTypeData.newSwaps)
              : BigInt(modifyRateAndSwapsPositionTypeData.newSwaps) - BigInt(position.remainingSwaps);
          const newTotalSwaps =
            BigInt(modifyRateAndSwapsPositionTypeData.newSwaps) < BigInt(position.remainingSwaps)
              ? BigInt(position.totalSwaps) - modifiedRateAndSwapsSwapDifference
              : BigInt(position.totalSwaps) + modifiedRateAndSwapsSwapDifference;

          const newRemainingSwaps = BigInt(modifyRateAndSwapsPositionTypeData.newSwaps);

          const newRate = parseUnits(
            modifyRateAndSwapsPositionTypeData.newRate,
            modifyRateAndSwapsPositionTypeData.decimals
          );

          const modifiedAction: DCAPositionModifiedAction = {
            tx: dcaTx,
            action: ActionTypeAction.MODIFIED,
            fromPrice,
            oldRate: rate,
            oldRemainingSwaps: Number(remainingSwaps),
            remainingSwaps: Number(modifyRateAndSwapsPositionTypeData.newSwaps),
            rate: BigInt(modifyRateAndSwapsPositionTypeData.newRate),
          };

          history.push(modifiedAction);

          position = {
            ...position,
            totalSwaps: newTotalSwaps,
            remainingSwaps: newRemainingSwaps,
            remainingLiquidity: newRate * newRemainingSwaps,
            rate: newRate,
            remainingLiquidityYield: !isUndefined(remainingLiquidityYield) ? 0n : undefined,
          };
          break;
        }
        case TransactionTypes.withdrawFunds: {
          const modifiedAction: DCAPositionModifiedAction = {
            tx: dcaTx,
            action: ActionTypeAction.MODIFIED,
            fromPrice,
            oldRate: rate,
            oldRemainingSwaps: Number(remainingSwaps),
            remainingSwaps: 0,
            rate: 0n,
          };

          history.push(modifiedAction);

          position = {
            ...position,
            remainingSwaps: 0n,
            remainingLiquidity: 0n,
            rate: 0n,
            remainingLiquidityYield: !isUndefined(remainingLiquidityYield) ? 0n : undefined,
          };
          break;
        }
        case TransactionTypes.transferPosition: {
          const transferPositionTypeData = transaction.typeData;

          const transferredPositionAction: DCAPositionTransferredAction = {
            tx: dcaTx,
            from: position.user,
            to: transferPositionTypeData.toAddress,
            action: ActionTypeAction.TRANSFERRED,
          };

          history.push(transferredPositionAction);

          position = {
            ...position,
            user: transferPositionTypeData.toAddress as Address,
          };
          break;
        }
        default:
          break;
      }

      return { ...state, position: { ...position, history: [...history] } };
    });
});
