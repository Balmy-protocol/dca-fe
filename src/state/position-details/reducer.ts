import { parseUnits } from '@ethersproject/units';
import { createReducer } from '@reduxjs/toolkit';
import { LATEST_VERSION, POSITION_ACTIONS, TRANSACTION_TYPES } from 'config';
import { BigNumber } from 'ethers';
import {
  AddFundsTypeData,
  FullPosition,
  ModifyRateAndSwapsPositionTypeData,
  ModifySwapsPositionTypeData,
  RemoveFundsTypeData,
  ResetPositionTypeData,
  TerminatePositionTypeData,
  TransferTypeData,
  WithdrawTypeData,
} from 'types';
import { setPosition, updatePosition, updateShowBreakdown } from './actions';

export interface PositionDetailsState {
  position: FullPosition | null;
  showBreakdown: boolean;
}

const initialState: PositionDetailsState = {
  position: null,
  showBreakdown: true,
};

export default createReducer(initialState, (builder) =>
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
        case TRANSACTION_TYPES.TERMINATE_POSITION: {
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
            withdrawnSwapped: (transaction.typeData as TerminatePositionTypeData).toWithdraw,
            withdrawnSwappedUnderlying: (transaction.typeData as TerminatePositionTypeData).toWithdraw,
            withdrawnRemaining: (transaction.typeData as TerminatePositionTypeData).remainingLiquidity,
            withdrawnRemainingUnderlying: (transaction.typeData as TerminatePositionTypeData).remainingLiquidity,
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
        case TRANSACTION_TYPES.MIGRATE_POSITION: {
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
        case TRANSACTION_TYPES.MIGRATE_POSITION_YIELD: {
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
        case TRANSACTION_TYPES.WITHDRAW_POSITION: {
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
            withdrawnUnderlying: (transaction.typeData as WithdrawTypeData).withdrawnUnderlying || position.toWithdraw,
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
        case TRANSACTION_TYPES.ADD_FUNDS_POSITION: {
          const addFundsTypeData = transaction.typeData as AddFundsTypeData;
          const newRemainingLiquidity = BigNumber.from(position.remainingLiquidity).add(
            parseUnits(addFundsTypeData.newFunds, addFundsTypeData.decimals)
          );
          const newRate = newRemainingLiquidity.div(BigNumber.from(position.remainingSwaps)).toString();

          history.push({
            id: transaction.hash,
            action: POSITION_ACTIONS.MODIFIED_RATE,
            rate: newRate,
            oldRate: position.rate,
            from: position.user,
            to: position.user,
            oldRateUnderlying: position.depositedRateUnderlying || position.rate,
            withdrawnUnderlying: position.totalSwappedUnderlyingAccum || position.withdrawn,
            withdrawnUnderlyingAccum: null,
            swappedUnderlying: '0',
            remainingSwaps: position.remainingSwaps,
            oldRemainingSwaps: position.remainingSwaps,
            swapped: '0',
            withdrawn: position.withdrawn,
            permissions: [],
            rateUnderlying: newRate,
            depositedRateUnderlying: newRate,
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
            remainingLiquidity: newRemainingLiquidity.toString(),
            rate: newRate,
          };
          break;
        }
        case TRANSACTION_TYPES.RESET_POSITION: {
          const resetPositionTypeData = transaction.typeData as ResetPositionTypeData;
          const resetPositionSwapDifference = BigNumber.from(resetPositionTypeData.newSwaps).lt(
            BigNumber.from(position.remainingSwaps)
          )
            ? BigNumber.from(position.remainingSwaps).sub(BigNumber.from(resetPositionTypeData.newSwaps))
            : BigNumber.from(resetPositionTypeData.newSwaps).sub(BigNumber.from(position.remainingSwaps));
          const newRemaininLiquidity = BigNumber.from(position.remainingLiquidity).add(
            parseUnits(resetPositionTypeData.newFunds, resetPositionTypeData.decimals)
          );
          const newRemainingSwaps = BigNumber.from(position.remainingSwaps).add(
            BigNumber.from(resetPositionTypeData.newSwaps)
          );
          const newRate = newRemaininLiquidity.div(newRemainingSwaps).toString();

          history.push({
            id: transaction.hash,
            action: POSITION_ACTIONS.MODIFIED_RATE_AND_DURATION,
            rate: newRate,
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
            rateUnderlying: newRate,
            depositedRateUnderlying: newRate,
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
            totalSwaps: BigNumber.from(resetPositionTypeData.newSwaps).lt(BigNumber.from(position.remainingSwaps))
              ? BigNumber.from(position.totalSwaps).sub(resetPositionSwapDifference).toString()
              : BigNumber.from(position.totalSwaps).add(resetPositionSwapDifference).toString(),
            remainingLiquidity: newRemaininLiquidity.toString(),
            remainingSwaps: newRemainingSwaps.toString(),
            rate: newRate,
          };
          break;
        }
        case TRANSACTION_TYPES.REMOVE_FUNDS: {
          const removeFundsTypeData = transaction.typeData as RemoveFundsTypeData;
          const removeFundsDifference = parseUnits(
            removeFundsTypeData.ammountToRemove,
            removeFundsTypeData.decimals
          ).eq(BigNumber.from(position.remainingLiquidity))
            ? BigNumber.from(position.remainingSwaps)
            : BigNumber.from(0);
          const originalRemainingLiquidity = BigNumber.from(position.remainingLiquidity).toString();
          const newRemainingLiquidity = BigNumber.from(position.remainingLiquidity).sub(
            parseUnits(removeFundsTypeData.ammountToRemove, removeFundsTypeData.decimals)
          );

          const newRate = newRemainingLiquidity.div(BigNumber.from(position.remainingSwaps)).toString();

          const newRemainingSwaps = parseUnits(removeFundsTypeData.ammountToRemove, removeFundsTypeData.decimals).eq(
            BigNumber.from(originalRemainingLiquidity)
          )
            ? BigNumber.from(0).toString()
            : position.remainingSwaps;

          history.push({
            id: transaction.hash,
            action: POSITION_ACTIONS.MODIFIED_RATE_AND_DURATION,
            rate: newRate,
            oldRate: position.rate,
            from: position.user,
            to: position.user,
            remainingSwaps: newRemainingSwaps,
            oldRemainingSwaps: position.remainingSwaps,
            swapped: '0',
            withdrawn: position.withdrawn,
            oldRateUnderlying: position.depositedRateUnderlying || position.rate,
            withdrawnUnderlying: position.totalSwappedUnderlyingAccum || position.withdrawn,
            withdrawnUnderlyingAccum: null,
            swappedUnderlying: '0',
            permissions: [],
            rateUnderlying: newRate,
            depositedRateUnderlying: newRate,
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
            totalSwaps: parseUnits(removeFundsTypeData.ammountToRemove, removeFundsTypeData.decimals).eq(
              BigNumber.from(position.remainingLiquidity)
            )
              ? BigNumber.from(position.totalSwaps).sub(removeFundsDifference).toString()
              : BigNumber.from(position.totalSwaps).toString(),
            remainingLiquidity: newRemainingLiquidity.toString(),
            rate: newRate,
            remainingSwaps: newRemainingSwaps,
          };
          break;
        }
        case TRANSACTION_TYPES.MODIFY_SWAPS_POSITION: {
          const modifySwapsPositionTypeData = transaction.typeData as ModifySwapsPositionTypeData;
          const newRemainingSwaps = BigNumber.from(modifySwapsPositionTypeData.newSwaps);

          const newRate = BigNumber.from(position.remainingLiquidity).div(newRemainingSwaps).toString();

          history.push({
            id: transaction.hash,
            action: POSITION_ACTIONS.MODIFIED_RATE_AND_DURATION,
            rate: newRate,
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
            rateUnderlying: newRate,
            depositedRateUnderlying: newRate,
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
            remainingSwaps: newRemainingSwaps.toString(),
            rate: newRate,
          };
          break;
        }
        case TRANSACTION_TYPES.MODIFY_RATE_AND_SWAPS_POSITION: {
          const modifyRateAndSwapsPositionTypeData = transaction.typeData as ModifyRateAndSwapsPositionTypeData;
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
        case TRANSACTION_TYPES.WITHDRAW_FUNDS: {
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
        case TRANSACTION_TYPES.TRANSFER_POSITION: {
          const transferPositionTypeData = transaction.typeData as TransferTypeData;

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
    })
);
