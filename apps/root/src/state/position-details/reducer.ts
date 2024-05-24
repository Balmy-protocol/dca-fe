import { createReducer } from '@reduxjs/toolkit';
import { LATEST_VERSION } from '@constants';
import { Address, formatUnits, parseUnits } from 'viem';
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
import { setPosition, updatePosition, setFromPrice, setToPrice, fetchPositionAndTokenPrices } from './actions';
import { ActionTypeAction, DCAPositionAction, DCATransaction } from '@balmy/sdk';
import isUndefined from 'lodash/isUndefined';
import { parseBaseUsdPriceToNumber, parseUsdPrice } from '@common/utils/currency';
import { permissionDataToSdkPermissions } from '@common/utils/sdk';

export interface PositionDetailsState {
  position?: PositionWithHistory;
  fromPrice?: bigint;
  isLoading: boolean;
  toPrice?: bigint;
}

export const initialState: PositionDetailsState = {
  position: undefined,
  isLoading: false,
};

export default createReducer(initialState, (builder) => {
  builder
    .addCase(setPosition, (state, { payload }) => {
      state.position = payload;
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
            withdrawnRemaining: remainingLiquidity.amount + (remainingLiquidityYield?.amount || 0n),
            withdrawnSwapped: toWithdraw.amount + (toWithdrawYield?.amount || 0n),
            generatedByYield:
              (!isUndefined(remainingLiquidityYield) &&
                !isUndefined(toWithdrawYield) && {
                  withdrawnRemaining: remainingLiquidityYield.amount,
                  withdrawnSwapped: toWithdrawYield.amount,
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
            toWithdraw: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
            remainingLiquidity: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
            remainingSwaps: 0n,
            toWithdrawYield: !isUndefined(toWithdrawYield)
              ? { amount: 0n, amountInUnits: '0', amountInUSD: '0' }
              : undefined,
            remainingLiquidityYield: !isUndefined(remainingLiquidityYield)
              ? { amount: 0n, amountInUnits: '0', amountInUSD: '0' }
              : undefined,
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
            withdrawn: toWithdraw.amount,
            generatedByYield:
              (!isUndefined(toWithdrawYield) && {
                withdrawn: toWithdrawYield.amount,
              }) ||
              undefined,
            toPrice,
            action: ActionTypeAction.WITHDRAWN,
          };
          history.push(withdrawAction);

          position = {
            ...position,
            toWithdraw: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
            toWithdrawYield: !isUndefined(toWithdrawYield)
              ? { amount: 0n, amountInUnits: '0', amountInUSD: '0' }
              : undefined,
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
            oldRate: rate.amount,
            oldRemainingSwaps: Number(remainingSwaps),
            remainingSwaps: Number(modifyRateAndSwapsPositionTypeData.newSwaps),
            rate: BigInt(modifyRateAndSwapsPositionTypeData.newRate),
          };

          history.push(modifiedAction);

          position = {
            ...position,
            totalSwaps: newTotalSwaps,
            remainingSwaps: newRemainingSwaps,
            remainingLiquidity: {
              amount: newRate * newRemainingSwaps,
              amountInUnits: formatUnits(newRate * newRemainingSwaps, position.from.decimals),
              amountInUSD: parseUsdPrice(position.from, newRate * newRemainingSwaps, unparsedFromPrice).toFixed(2),
            },
            rate: {
              amount: newRate,
              amountInUnits: formatUnits(newRate, position.from.decimals),
              amountInUSD: parseUsdPrice(position.from, newRate, unparsedFromPrice).toFixed(2),
            },
            remainingLiquidityYield: !isUndefined(remainingLiquidityYield)
              ? { amount: 0n, amountInUnits: '0', amountInUSD: '0' }
              : undefined,
          };
          break;
        }
        case TransactionTypes.withdrawFunds: {
          const modifiedAction: DCAPositionModifiedAction = {
            tx: dcaTx,
            action: ActionTypeAction.MODIFIED,
            fromPrice,
            oldRate: rate.amount,
            oldRemainingSwaps: Number(remainingSwaps),
            remainingSwaps: 0,
            rate: 0n,
          };

          history.push(modifiedAction);

          position = {
            ...position,
            remainingSwaps: 0n,
            remainingLiquidity: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
            rate: { amount: 0n, amountInUnits: '0', amountInUSD: '0' },
            remainingLiquidityYield: !isUndefined(remainingLiquidityYield)
              ? { amount: 0n, amountInUnits: '0', amountInUSD: '0' }
              : undefined,
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
