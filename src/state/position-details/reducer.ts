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
  TransferTypeData,
} from 'types';
import { setPosition, updatePosition } from './actions';

export interface PositionDetailsState {
  position: FullPosition | null;
}

const initialState: PositionDetailsState = {
  position: null,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setPosition, (state, { payload }) => {
      state.position = payload;
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
            rate: position.current.rate,
            oldRate: position.current.rate,
            from: position.user,
            to: position.user,
            remainingSwaps: position.current.remainingSwaps,
            oldRemainingSwaps: position.current.remainingSwaps,
            swapped: '0',
            withdrawn: position.current.withdrawn,
            permissions: [],
            ratePerUnitBToAWithFee: '1',
            ratePerUnitAToBWithFee: '1',
            createdAtBlock: (Number(history[history.length - 1].createdAtBlock) + 1).toString(),
            createdAtTimestamp: (Date.now() / 1000).toString(),
            transaction: {
              id: transaction.hash,
              hash: transaction.hash,
              timestamp: (Date.now() / 1000).toString(),
            },
          });
          position = {
            ...position,
            status: 'TERMINATED',
            current: {
              ...position.current,
              idleSwapped: BigNumber.from(0).toString(),
              remainingLiquidity: BigNumber.from(0).toString(),
              remainingSwaps: BigNumber.from(0).toString(),
            },
          };
          break;
        }
        case TRANSACTION_TYPES.MIGRATE_POSITION: {
          history.push({
            id: transaction.hash,
            action: POSITION_ACTIONS.TERMINATED,
            rate: position.current.rate,
            oldRate: position.current.rate,
            from: position.user,
            to: position.user,
            remainingSwaps: position.current.remainingSwaps,
            oldRemainingSwaps: position.current.remainingSwaps,
            swapped: '0',
            withdrawn: position.current.withdrawn,
            permissions: [],
            ratePerUnitBToAWithFee: '1',
            ratePerUnitAToBWithFee: '1',
            createdAtBlock: (Number(history[history.length - 1].createdAtBlock) + 1).toString(),
            createdAtTimestamp: (Date.now() / 1000).toString(),
            transaction: {
              id: transaction.hash,
              hash: transaction.hash,
              timestamp: (Date.now() / 1000).toString(),
            },
          });
          position = {
            ...position,
            status: 'TERMINATED',
            current: {
              ...position.current,
              idleSwapped: BigNumber.from(0).toString(),
              remainingLiquidity: BigNumber.from(0).toString(),
              remainingSwaps: BigNumber.from(0).toString(),
            },
          };
          break;
        }
        case TRANSACTION_TYPES.WITHDRAW_POSITION: {
          history.push({
            id: transaction.hash,
            action: POSITION_ACTIONS.WITHDREW,
            rate: position.current.rate,
            oldRate: position.current.rate,
            from: position.user,
            to: position.user,
            remainingSwaps: position.current.remainingSwaps,
            oldRemainingSwaps: position.current.remainingSwaps,
            swapped: '0',
            withdrawn: position.current.idleSwapped,
            permissions: [],
            ratePerUnitBToAWithFee: '1',
            ratePerUnitAToBWithFee: '1',
            createdAtBlock: (Number(history[history.length - 1].createdAtBlock) + 1).toString(),
            createdAtTimestamp: (Date.now() / 1000).toString(),
            transaction: {
              id: transaction.hash,
              hash: transaction.hash,
              timestamp: (Date.now() / 1000).toString(),
            },
          });
          position = {
            ...position,
            totalWithdrawn: BigNumber.from(position.totalWithdrawn)
              .add(BigNumber.from(position.current.idleSwapped))
              .toString(),
            current: {
              ...position.current,
              idleSwapped: BigNumber.from(0).toString(),
            },
          };

          break;
        }
        case TRANSACTION_TYPES.ADD_FUNDS_POSITION: {
          const addFundsTypeData = transaction.typeData as AddFundsTypeData;
          const newRemainingLiquidity = BigNumber.from(position.current.remainingLiquidity).add(
            parseUnits(addFundsTypeData.newFunds, addFundsTypeData.decimals)
          );
          const newRate = newRemainingLiquidity.div(BigNumber.from(position.current.remainingSwaps)).toString();

          history.push({
            id: transaction.hash,
            action: POSITION_ACTIONS.MODIFIED_RATE,
            rate: newRate,
            oldRate: position.current.rate,
            from: position.user,
            to: position.user,
            remainingSwaps: position.current.remainingSwaps,
            oldRemainingSwaps: position.current.remainingSwaps,
            swapped: '0',
            withdrawn: position.current.withdrawn,
            permissions: [],
            ratePerUnitBToAWithFee: '1',
            ratePerUnitAToBWithFee: '1',
            createdAtBlock: (Number(history[history.length - 1].createdAtBlock) + 1).toString(),
            createdAtTimestamp: (Date.now() / 1000).toString(),
            transaction: {
              id: transaction.hash,
              hash: transaction.hash,
              timestamp: (Date.now() / 1000).toString(),
            },
          });

          position = {
            ...position,
            current: {
              ...position.current,
              remainingLiquidity: newRemainingLiquidity.toString(),
              rate: newRate,
            },
          };
          break;
        }
        case TRANSACTION_TYPES.RESET_POSITION: {
          const resetPositionTypeData = transaction.typeData as ResetPositionTypeData;
          const resetPositionSwapDifference = BigNumber.from(resetPositionTypeData.newSwaps).lt(
            BigNumber.from(position.current.remainingSwaps)
          )
            ? BigNumber.from(position.current.remainingSwaps).sub(BigNumber.from(resetPositionTypeData.newSwaps))
            : BigNumber.from(resetPositionTypeData.newSwaps).sub(BigNumber.from(position.current.remainingSwaps));
          const newRemaininLiquidity = BigNumber.from(position.current.remainingLiquidity).add(
            parseUnits(resetPositionTypeData.newFunds, resetPositionTypeData.decimals)
          );
          const newRemainingSwaps = BigNumber.from(position.current.remainingSwaps).add(
            BigNumber.from(resetPositionTypeData.newSwaps)
          );
          const newRate = newRemaininLiquidity.div(newRemainingSwaps).toString();

          history.push({
            id: transaction.hash,
            action: POSITION_ACTIONS.MODIFIED_RATE_AND_DURATION,
            rate: newRate,
            oldRate: position.current.rate,
            from: position.user,
            to: position.user,
            remainingSwaps: newRemainingSwaps.toString(),
            oldRemainingSwaps: position.current.remainingSwaps,
            swapped: '0',
            withdrawn: position.current.withdrawn,
            permissions: [],
            ratePerUnitBToAWithFee: '1',
            ratePerUnitAToBWithFee: '1',
            createdAtBlock: (Number(history[history.length - 1].createdAtBlock) + 1).toString(),
            createdAtTimestamp: (Date.now() / 1000).toString(),
            transaction: {
              id: transaction.hash,
              hash: transaction.hash,
              timestamp: (Date.now() / 1000).toString(),
            },
          });

          position = {
            ...position,
            totalSwaps: BigNumber.from(resetPositionTypeData.newSwaps).lt(
              BigNumber.from(position.current.remainingSwaps)
            )
              ? BigNumber.from(position.totalSwaps).sub(resetPositionSwapDifference).toString()
              : BigNumber.from(position.totalSwaps).add(resetPositionSwapDifference).toString(),
            current: {
              ...position.current,
              remainingLiquidity: newRemaininLiquidity.toString(),
              remainingSwaps: newRemainingSwaps.toString(),
              rate: newRate,
            },
          };
          break;
        }
        case TRANSACTION_TYPES.REMOVE_FUNDS: {
          const removeFundsTypeData = transaction.typeData as RemoveFundsTypeData;
          const removeFundsDifference = parseUnits(
            removeFundsTypeData.ammountToRemove,
            removeFundsTypeData.decimals
          ).eq(BigNumber.from(position.current.remainingLiquidity))
            ? BigNumber.from(position.current.remainingSwaps)
            : BigNumber.from(0);
          const originalRemainingLiquidity = BigNumber.from(position.current.remainingLiquidity).toString();
          const newRemainingLiquidity = BigNumber.from(position.current.remainingLiquidity).sub(
            parseUnits(removeFundsTypeData.ammountToRemove, removeFundsTypeData.decimals)
          );

          const newRate = newRemainingLiquidity.div(BigNumber.from(position.current.remainingSwaps)).toString();

          const newRemainingSwaps = parseUnits(removeFundsTypeData.ammountToRemove, removeFundsTypeData.decimals).eq(
            BigNumber.from(originalRemainingLiquidity)
          )
            ? BigNumber.from(0).toString()
            : position.current.remainingSwaps;

          history.push({
            id: transaction.hash,
            action: POSITION_ACTIONS.MODIFIED_RATE_AND_DURATION,
            rate: newRate,
            oldRate: position.current.rate,
            from: position.user,
            to: position.user,
            remainingSwaps: newRemainingSwaps,
            oldRemainingSwaps: position.current.remainingSwaps,
            swapped: '0',
            withdrawn: position.current.withdrawn,
            permissions: [],
            ratePerUnitBToAWithFee: '1',
            ratePerUnitAToBWithFee: '1',
            createdAtBlock: (Number(history[history.length - 1].createdAtBlock) + 1).toString(),
            createdAtTimestamp: (Date.now() / 1000).toString(),
            transaction: {
              id: transaction.hash,
              hash: transaction.hash,
              timestamp: (Date.now() / 1000).toString(),
            },
          });

          position = {
            ...position,
            totalSwaps: parseUnits(removeFundsTypeData.ammountToRemove, removeFundsTypeData.decimals).eq(
              BigNumber.from(position.current.remainingLiquidity)
            )
              ? BigNumber.from(position.totalSwaps).sub(removeFundsDifference).toString()
              : BigNumber.from(position.totalSwaps).toString(),
            current: {
              ...position.current,
              remainingLiquidity: newRemainingLiquidity.toString(),
              rate: newRate,
              remainingSwaps: newRemainingSwaps,
            },
          };
          break;
        }
        case TRANSACTION_TYPES.MODIFY_SWAPS_POSITION: {
          const modifySwapsPositionTypeData = transaction.typeData as ModifySwapsPositionTypeData;
          const newRemainingSwaps = BigNumber.from(modifySwapsPositionTypeData.newSwaps);

          const newRate = BigNumber.from(position.current.remainingLiquidity).div(newRemainingSwaps).toString();

          history.push({
            id: transaction.hash,
            action: POSITION_ACTIONS.MODIFIED_RATE_AND_DURATION,
            rate: newRate,
            oldRate: position.current.rate,
            from: position.user,
            to: position.user,
            remainingSwaps: newRemainingSwaps.toString(),
            oldRemainingSwaps: position.current.remainingSwaps,
            swapped: '0',
            withdrawn: position.current.withdrawn,
            permissions: [],
            ratePerUnitBToAWithFee: '1',
            ratePerUnitAToBWithFee: '1',
            createdAtBlock: (Number(history[history.length - 1].createdAtBlock) + 1).toString(),
            createdAtTimestamp: (Date.now() / 1000).toString(),
            transaction: {
              id: transaction.hash,
              hash: transaction.hash,
              timestamp: (Date.now() / 1000).toString(),
            },
          });

          position = {
            ...position,
            current: {
              ...position.current,
              remainingSwaps: newRemainingSwaps.toString(),
              rate: newRate,
            },
          };
          break;
        }
        case TRANSACTION_TYPES.MODIFY_RATE_AND_SWAPS_POSITION: {
          const modifyRateAndSwapsPositionTypeData = transaction.typeData as ModifyRateAndSwapsPositionTypeData;
          const modifiedRateAndSwapsSwapDifference = BigNumber.from(modifyRateAndSwapsPositionTypeData.newSwaps).lt(
            BigNumber.from(position.current.remainingSwaps)
          )
            ? BigNumber.from(position.current.remainingSwaps).sub(
                BigNumber.from(modifyRateAndSwapsPositionTypeData.newSwaps)
              )
            : BigNumber.from(modifyRateAndSwapsPositionTypeData.newSwaps).sub(
                BigNumber.from(position.current.remainingSwaps)
              );
          const newTotalSwaps = BigNumber.from(modifyRateAndSwapsPositionTypeData.newSwaps).lt(
            BigNumber.from(position.current.remainingSwaps)
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
            oldRate: position.current.rate,
            from: position.user,
            to: position.user,
            remainingSwaps: newRemainingSwaps.toString(),
            oldRemainingSwaps: position.current.remainingSwaps,
            swapped: '0',
            withdrawn: position.current.withdrawn,
            permissions: [],
            ratePerUnitBToAWithFee: '1',
            ratePerUnitAToBWithFee: '1',
            createdAtBlock: (Number(history[history.length - 1].createdAtBlock) + 1).toString(),
            createdAtTimestamp: (Date.now() / 1000).toString(),
            transaction: {
              id: transaction.hash,
              hash: transaction.hash,
              timestamp: (Date.now() / 1000).toString(),
            },
          });

          position = {
            ...position,
            totalSwaps: newTotalSwaps.toString(),
            current: {
              ...position.current,
              remainingSwaps: newRemainingSwaps.toString(),
              remainingLiquidity: newRate.mul(newRemainingSwaps).toString(),
              rate: newRate.toString(),
            },
          };
          break;
        }
        case TRANSACTION_TYPES.TRANSFER_POSITION: {
          const transferPositionTypeData = transaction.typeData as TransferTypeData;

          history.push({
            id: transaction.hash,
            action: POSITION_ACTIONS.TRANSFERED,
            rate: position.current.rate,
            oldRate: position.current.rate,
            from: position.user,
            to: transferPositionTypeData.toAddress,
            remainingSwaps: position.current.remainingSwaps,
            oldRemainingSwaps: position.current.remainingSwaps,
            swapped: '0',
            withdrawn: position.current.withdrawn,
            permissions: [],
            ratePerUnitBToAWithFee: '1',
            ratePerUnitAToBWithFee: '1',
            createdAtBlock: (Number(history[history.length - 1].createdAtBlock) + 1).toString(),
            createdAtTimestamp: (Date.now() / 1000).toString(),
            transaction: {
              id: transaction.hash,
              hash: transaction.hash,
              timestamp: (Date.now() / 1000).toString(),
            },
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
