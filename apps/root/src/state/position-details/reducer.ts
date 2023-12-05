import { parseUnits } from '@ethersproject/units';
import { createReducer } from '@reduxjs/toolkit';
import { LATEST_VERSION, POSITION_ACTIONS } from '@constants';
import { BigNumber } from 'ethers';
import findIndex from 'lodash/findIndex';
import { FullPosition, PositionPermission, TransactionTypes } from '@types';
import { setPosition, updatePosition, updateShowBreakdown } from './actions';

export interface PositionDetailsState {
  position: FullPosition | null;
  showBreakdown: boolean;
}

const initialState: PositionDetailsState = {
  position: null,
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
    .addCase(updatePosition, (state, { payload }) => {
      if (!state.position) {
        return state;
      }
      if (payload.position?.id !== `${state.position?.id}-v${payload.position?.version || LATEST_VERSION}`) {
        return state;
      }

      const transaction = payload;

      let position = {
        ...state.position,
      };

      const history = [...state.position.history];

      switch (transaction.type) {
        case TransactionTypes.terminatePosition: {
          history.push({
            id: transaction.hash,
            action: POSITION_ACTIONS.TERMINATED,
            rate: position.rate,
            oldRate: position.rate,
            from: position.user,
            to: position.user,
            remainingSwaps: position.remainingSwaps,
            oldRemainingSwaps: position.remainingSwaps,
            swapped: '0',
            withdrawn: position.withdrawn,
            permissions: [],
            pairSwap: {
              ratioUnderlyingBToA: '1',
              ratioUnderlyingAToB: '1',
              ratioUnderlyingAToBWithFee: '1',
              ratioUnderlyingBToAWithFee: '1',
            },
            oldRateUnderlying: position.depositedRateUnderlying || position.rate,
            withdrawnUnderlying: position.totalSwappedUnderlyingAccum || position.withdrawn,
            withdrawnUnderlyingAccum: null,
            swappedUnderlying: '0',
            rateUnderlying: position.rate,
            depositedRateUnderlying: position.rate,
            createdAtBlock: (Number(history[history.length - 1].createdAtBlock) + 1).toString(),
            createdAtTimestamp: (Date.now() / 1000).toString(),
            transaction: {
              id: transaction.hash,
              hash: transaction.hash,
              timestamp: (Date.now() / 1000).toString(),
            },
            withdrawnSwapped: transaction.typeData.toWithdraw,
            withdrawnSwappedUnderlying: transaction.typeData.toWithdraw,
            withdrawnRemaining: transaction.typeData.remainingLiquidity,
            withdrawnRemainingUnderlying: transaction.typeData.remainingLiquidity,
          });
          position = {
            ...position,
            status: 'TERMINATED',
            toWithdraw: BigNumber.from(0).toString(),
            remainingLiquidity: BigNumber.from(0).toString(),
            remainingSwaps: BigNumber.from(0).toString(),
          };
          break;
        }
        case TransactionTypes.modifyPermissions: {
          const modifyPermissionsTypeData = transaction.typeData;

          const positionPermissions = position.permissions;
          let newPermissions: PositionPermission[] = [];
          if (positionPermissions) {
            modifyPermissionsTypeData.permissions.forEach((permission) => {
              const permissionIndex = findIndex(positionPermissions, { operator: permission.operator.toLowerCase() });
              if (permissionIndex !== -1) {
                newPermissions[permissionIndex] = permission;
              } else {
                newPermissions = [...newPermissions, permission];
              }
            });
          } else {
            newPermissions = modifyPermissionsTypeData.permissions;
          }
          history.push({
            id: transaction.hash,
            action: POSITION_ACTIONS.PERMISSIONS_MODIFIED,
            rate: position.rate,
            oldRate: position.rate,
            from: position.user,
            to: position.user,
            remainingSwaps: position.remainingSwaps,
            oldRemainingSwaps: position.remainingSwaps,
            oldRateUnderlying: position.depositedRateUnderlying || position.rate,
            withdrawnUnderlying: position.totalSwappedUnderlyingAccum || position.withdrawn,
            withdrawnUnderlyingAccum: null,
            swappedUnderlying: '0',
            swapped: '0',
            withdrawn: position.withdrawn,
            permissions: modifyPermissionsTypeData.permissions,
            rateUnderlying: position.rate,
            depositedRateUnderlying: position.rate,
            pairSwap: {
              ratioUnderlyingBToA: '1',
              ratioUnderlyingAToB: '1',
              ratioUnderlyingAToBWithFee: '1',
              ratioUnderlyingBToAWithFee: '1',
            },
            createdAtBlock: (Number(history[history.length - 1].createdAtBlock) + 1).toString(),
            createdAtTimestamp: (Date.now() / 1000).toString(),
            transaction: {
              id: transaction.hash,
              hash: transaction.hash,
              timestamp: (Date.now() / 1000).toString(),
            },
            withdrawnSwapped: '0',
            withdrawnSwappedUnderlying: '0',
            withdrawnRemaining: '0',
            withdrawnRemainingUnderlying: '0',
          });
          position = {
            ...position,
            permissions: newPermissions,
          };
          break;
        }
        case TransactionTypes.migratePositionYield: {
          history.push({
            id: transaction.hash,
            action: POSITION_ACTIONS.TERMINATED,
            rate: position.rate,
            oldRate: position.rate,
            from: position.user,
            to: position.user,
            remainingSwaps: position.remainingSwaps,
            oldRemainingSwaps: position.remainingSwaps,
            swapped: '0',
            withdrawn: position.withdrawn,
            oldRateUnderlying: position.depositedRateUnderlying || position.rate,
            withdrawnUnderlying: position.totalSwappedUnderlyingAccum || position.withdrawn,
            withdrawnUnderlyingAccum: null,
            swappedUnderlying: '0',
            permissions: [],
            rateUnderlying: position.rate,
            depositedRateUnderlying: position.rate,
            pairSwap: {
              ratioUnderlyingBToA: '1',
              ratioUnderlyingAToB: '1',
              ratioUnderlyingAToBWithFee: '1',
              ratioUnderlyingBToAWithFee: '1',
            },
            createdAtBlock: (Number(history[history.length - 1].createdAtBlock) + 1).toString(),
            createdAtTimestamp: (Date.now() / 1000).toString(),
            transaction: {
              id: transaction.hash,
              hash: transaction.hash,
              timestamp: (Date.now() / 1000).toString(),
            },
            withdrawnSwapped: '0',
            withdrawnSwappedUnderlying: '0',
            withdrawnRemaining: '0',
            withdrawnRemainingUnderlying: '0',
          });
          position = {
            ...position,
            status: 'TERMINATED',
            toWithdraw: BigNumber.from(0).toString(),
            remainingLiquidity: BigNumber.from(0).toString(),
            remainingSwaps: BigNumber.from(0).toString(),
          };
          break;
        }
        case TransactionTypes.withdrawPosition: {
          history.push({
            id: transaction.hash,
            action: POSITION_ACTIONS.WITHDREW,
            rate: position.rate,
            oldRate: position.rate,
            from: position.user,
            to: position.user,
            remainingSwaps: position.remainingSwaps,
            oldRemainingSwaps: position.remainingSwaps,
            swapped: '0',
            withdrawn: position.toWithdraw,
            oldRateUnderlying: position.depositedRateUnderlying || position.rate,
            withdrawnUnderlying: transaction.typeData.withdrawnUnderlying || position.toWithdraw,
            withdrawnUnderlyingAccum: position.toWithdrawUnderlyingAccum,
            swappedUnderlying: '0',
            permissions: [],
            rateUnderlying: position.rate,
            depositedRateUnderlying: position.rate,
            pairSwap: {
              ratioUnderlyingBToA: '1',
              ratioUnderlyingAToB: '1',
              ratioUnderlyingAToBWithFee: '1',
              ratioUnderlyingBToAWithFee: '1',
            },
            createdAtBlock: (Number(history[history.length - 1].createdAtBlock) + 1).toString(),
            createdAtTimestamp: (Date.now() / 1000).toString(),
            transaction: {
              id: transaction.hash,
              hash: transaction.hash,
              timestamp: (Date.now() / 1000).toString(),
            },
            withdrawnSwapped: '0',
            withdrawnSwappedUnderlying: '0',
            withdrawnRemaining: '0',
            withdrawnRemainingUnderlying: '0',
          });
          position = {
            ...position,
            totalWithdrawn: BigNumber.from(position.totalWithdrawn).add(BigNumber.from(position.toWithdraw)).toString(),
            toWithdraw: BigNumber.from(0).toString(),
            toWithdrawUnderlyingAccum: '0',
          };

          break;
        }
        case TransactionTypes.modifyRateAndSwapsPosition: {
          const modifyRateAndSwapsPositionTypeData = transaction.typeData;
          const modifiedRateAndSwapsSwapDifference = BigNumber.from(modifyRateAndSwapsPositionTypeData.newSwaps).lt(
            BigNumber.from(position.remainingSwaps)
          )
            ? BigNumber.from(position.remainingSwaps).sub(BigNumber.from(modifyRateAndSwapsPositionTypeData.newSwaps))
            : BigNumber.from(modifyRateAndSwapsPositionTypeData.newSwaps).sub(BigNumber.from(position.remainingSwaps));
          const newTotalSwaps = BigNumber.from(modifyRateAndSwapsPositionTypeData.newSwaps).lt(
            BigNumber.from(position.remainingSwaps)
          )
            ? BigNumber.from(position.totalSwaps).sub(modifiedRateAndSwapsSwapDifference)
            : BigNumber.from(position.totalSwaps).add(modifiedRateAndSwapsSwapDifference);

          const newRemainingSwaps = BigNumber.from(modifyRateAndSwapsPositionTypeData.newSwaps);

          const newRate = parseUnits(
            modifyRateAndSwapsPositionTypeData.newRate,
            modifyRateAndSwapsPositionTypeData.decimals
          );

          history.push({
            id: transaction.hash,
            action: POSITION_ACTIONS.MODIFIED_RATE_AND_DURATION,
            rate: newRate.toString(),
            oldRate: position.rate,
            from: position.user,
            to: position.user,
            remainingSwaps: newRemainingSwaps.toString(),
            oldRemainingSwaps: position.remainingSwaps,
            oldRateUnderlying: position.depositedRateUnderlying || position.rate,
            withdrawnUnderlying: position.totalSwappedUnderlyingAccum || position.withdrawn,
            withdrawnUnderlyingAccum: null,
            swappedUnderlying: '0',
            swapped: '0',
            withdrawn: position.withdrawn,
            permissions: [],
            rateUnderlying: newRate.toString(),
            depositedRateUnderlying: newRate.toString(),
            pairSwap: {
              ratioUnderlyingBToA: '1',
              ratioUnderlyingAToB: '1',
              ratioUnderlyingAToBWithFee: '1',
              ratioUnderlyingBToAWithFee: '1',
            },
            createdAtBlock: (Number(history[history.length - 1].createdAtBlock) + 1).toString(),
            createdAtTimestamp: (Date.now() / 1000).toString(),
            transaction: {
              id: transaction.hash,
              hash: transaction.hash,
              timestamp: (Date.now() / 1000).toString(),
            },
            withdrawnSwapped: '0',
            withdrawnSwappedUnderlying: '0',
            withdrawnRemaining: '0',
            withdrawnRemainingUnderlying: '0',
          });

          position = {
            ...position,
            totalSwaps: newTotalSwaps.toString(),
            remainingSwaps: newRemainingSwaps.toString(),
            remainingLiquidity: newRate.mul(newRemainingSwaps).toString(),
            rate: newRate.toString(),
            depositedRateUnderlying: newRate.toString(),
          };
          break;
        }
        case TransactionTypes.withdrawFunds: {
          history.push({
            id: transaction.hash,
            action: POSITION_ACTIONS.MODIFIED_RATE_AND_DURATION,
            rate: '0',
            oldRate: position.rate,
            from: position.user,
            to: position.user,
            remainingSwaps: '0',
            oldRemainingSwaps: position.remainingSwaps,
            oldRateUnderlying: position.depositedRateUnderlying || position.rate,
            withdrawnUnderlying: position.totalSwappedUnderlyingAccum || position.withdrawn,
            withdrawnUnderlyingAccum: null,
            swappedUnderlying: '0',
            swapped: '0',
            withdrawn: position.withdrawn,
            permissions: [],
            rateUnderlying: '0',
            depositedRateUnderlying: '0',
            pairSwap: {
              ratioUnderlyingBToA: '1',
              ratioUnderlyingAToB: '1',
              ratioUnderlyingAToBWithFee: '1',
              ratioUnderlyingBToAWithFee: '1',
            },
            createdAtBlock: (Number(history[history.length - 1].createdAtBlock) + 1).toString(),
            createdAtTimestamp: (Date.now() / 1000).toString(),
            transaction: {
              id: transaction.hash,
              hash: transaction.hash,
              timestamp: (Date.now() / 1000).toString(),
            },
            withdrawnSwapped: '0',
            withdrawnSwappedUnderlying: '0',
            withdrawnRemaining: '0',
            withdrawnRemainingUnderlying: '0',
          });

          position = {
            ...position,
            remainingSwaps: '0',
            remainingLiquidity: '0',
            rate: '0',
            depositedRateUnderlying: '0',
          };
          break;
        }
        case TransactionTypes.transferPosition: {
          const transferPositionTypeData = transaction.typeData;

          history.push({
            id: transaction.hash,
            action: POSITION_ACTIONS.TRANSFERED,
            rate: position.rate,
            oldRate: position.rate,
            from: position.user,
            to: transferPositionTypeData.toAddress,
            remainingSwaps: position.remainingSwaps,
            oldRemainingSwaps: position.remainingSwaps,
            oldRateUnderlying: position.depositedRateUnderlying || position.rate,
            withdrawnUnderlying: position.totalSwappedUnderlyingAccum || position.withdrawn,
            withdrawnUnderlyingAccum: null,
            swappedUnderlying: '0',
            swapped: '0',
            withdrawn: position.withdrawn,
            permissions: [],
            rateUnderlying: position.rate,
            depositedRateUnderlying: position.rate,
            pairSwap: {
              ratioUnderlyingBToA: '1',
              ratioUnderlyingAToB: '1',
              ratioUnderlyingAToBWithFee: '1',
              ratioUnderlyingBToAWithFee: '1',
            },
            createdAtBlock: (Number(history[history.length - 1].createdAtBlock) + 1).toString(),
            createdAtTimestamp: (Date.now() / 1000).toString(),
            transaction: {
              id: transaction.hash,
              hash: transaction.hash,
              timestamp: (Date.now() / 1000).toString(),
            },
            withdrawnSwapped: '0',
            withdrawnSwappedUnderlying: '0',
            withdrawnRemaining: '0',
            withdrawnRemainingUnderlying: '0',
          });

          position = {
            ...position,
            user: transferPositionTypeData.toAddress,
          };
          break;
        }
        default:
          break;
      }

      return { ...state, position: { ...position, history: [...history] } };
    });
});
