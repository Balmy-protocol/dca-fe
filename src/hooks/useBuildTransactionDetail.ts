import React from 'react';
import find from 'lodash/find';
import {
  TransactionDetails,
  NewPositionTypeData,
  TerminatePositionTypeData,
  WithdrawTypeData,
  AddFundsTypeData,
  RemoveFundsTypeData,
  ModifySwapsPositionTypeData,
  NewPairTypeData,
  Position,
  ApproveTokenTypeData,
  ApproveTokenExactTypeData,
  ResetPositionTypeData,
  WrapEtherTypeData,
  ModifyRateAndSwapsPositionTypeData,
  TransferTypeData,
  ApproveCompanionTypeData,
  ModifyPermissionsTypeData,
  MigratePositionTypeData,
  WithdrawFundsTypeData,
  MigratePositionYieldTypeData,
} from 'types';
import { TRANSACTION_TYPES, STRING_SWAP_INTERVALS } from 'config/constants';
import { formatCurrencyAmount } from 'utils/currency';
import { BigNumber } from 'ethers';
import useAvailablePairs from 'hooks/useAvailablePairs';
import { getFrequencyLabel } from 'utils/parsing';
import useCurrentPositions from './useCurrentPositions';
import usePastPositions from './usePastPositions';

function useBuildTransactionDetail() {
  const availablePairs = useAvailablePairs();
  const currentPositions = useCurrentPositions();
  const pastPositions = usePastPositions();

  const positions = React.useMemo(() => [...pastPositions, ...currentPositions], [currentPositions, pastPositions]);

  return React.useCallback(
    (tx: TransactionDetails) => {
      let message = 'Transaction confirmed!';
      try {
        switch (tx.type) {
          case TRANSACTION_TYPES.WRAP_ETHER: {
            const wrapEtherTypeData = tx.typeData as WrapEtherTypeData;

            message = `${wrapEtherTypeData.amount} wrapped to getWrappedProtocolToken`;
            break;
          }
          case TRANSACTION_TYPES.NEW_POSITION: {
            const newPositionTypeData = tx.typeData as NewPositionTypeData;

            message = `Create ${newPositionTypeData.from.symbol}:${newPositionTypeData.to.symbol} position`;
            break;
          }
          case TRANSACTION_TYPES.TERMINATE_POSITION: {
            const terminatePositionTypeData = tx.typeData as TerminatePositionTypeData;
            const terminatedPosition = tx.position || find(positions, { id: terminatePositionTypeData.id });
            if (terminatedPosition) {
              message = `Burn ${(terminatedPosition as Position).from.symbol}:${
                (terminatedPosition as Position).to.symbol
              } position`;
            }
            break;
          }
          case TRANSACTION_TYPES.WITHDRAW_FUNDS: {
            const withdrawFundsPositionTypeData = tx.typeData as WithdrawFundsTypeData;
            const withdrawnPosition = tx.position || find(positions, { id: withdrawFundsPositionTypeData.id });
            if (withdrawnPosition) {
              message = `Withdraw ${formatCurrencyAmount(
                BigNumber.from(withdrawFundsPositionTypeData.removedFunds),
                (withdrawnPosition as Position).from
              )} ${(withdrawnPosition as Position).from.symbol} funds from your ${
                (withdrawnPosition as Position).from.symbol
              }:${(withdrawnPosition as Position).to.symbol} position`;
            }
            break;
          }
          case TRANSACTION_TYPES.WITHDRAW_POSITION: {
            const withdrawPositionTypeData = tx.typeData as WithdrawTypeData;
            const withdrawnPosition = tx.position || find(positions, { id: withdrawPositionTypeData.id });
            if (withdrawnPosition) {
              message = `Withdraw from ${(withdrawnPosition as Position).from.symbol}:${
                (withdrawnPosition as Position).to.symbol
              } position`;
            }
            break;
          }
          case TRANSACTION_TYPES.ADD_FUNDS_POSITION: {
            const addFundsTypeData = tx.typeData as AddFundsTypeData;
            const fundedPosition = tx.position || find(positions, { id: addFundsTypeData.id });
            if (fundedPosition) {
              message = `Add ${addFundsTypeData.newFunds} ${(fundedPosition as Position).from.symbol} to the ${
                (fundedPosition as Position).from.symbol
              }:${(fundedPosition as Position).to.symbol} position`;
            }
            break;
          }
          case TRANSACTION_TYPES.REMOVE_FUNDS: {
            const removeFundsTypeData = tx.typeData as RemoveFundsTypeData;
            const removeFundedPosition = tx.position || find(positions, { id: removeFundsTypeData.id });
            if (removeFundedPosition) {
              message = `Remove ${removeFundsTypeData.ammountToRemove} ${
                (removeFundedPosition as Position).from.symbol
              } from the ${(removeFundedPosition as Position).from.symbol}:${
                (removeFundedPosition as Position).to.symbol
              } position`;
            }
            break;
          }
          case TRANSACTION_TYPES.RESET_POSITION: {
            const resetPositionTypeData = tx.typeData as ResetPositionTypeData;
            const resettedPosition = tx.position || find(positions, { id: resetPositionTypeData.id });
            const swapInterval = BigNumber.from((resettedPosition as Position).swapInterval);
            if (resettedPosition) {
              message = `Add ${resetPositionTypeData.newFunds} ${(resettedPosition as Position).from.symbol} to your ${
                (resettedPosition as Position).from.symbol
              }:${(resettedPosition as Position).to.symbol} position and set it to run for ${
                resetPositionTypeData.newSwaps
              } ${getFrequencyLabel(swapInterval.toString(), resetPositionTypeData.newSwaps)}`;
            }
            break;
          }
          case TRANSACTION_TYPES.MODIFY_SWAPS_POSITION: {
            const modifySwapsPositionTypeData = tx.typeData as ModifySwapsPositionTypeData;
            const modifiedPosition = tx.position || find(positions, { id: modifySwapsPositionTypeData.id });
            const swapInterval = BigNumber.from((modifiedPosition as Position).swapInterval);
            if (modifiedPosition) {
              message = `Modify ${(modifiedPosition as Position).from.symbol}:${
                (modifiedPosition as Position).to.symbol
              } position to run for ${modifySwapsPositionTypeData.newSwaps} ${getFrequencyLabel(
                swapInterval.toString(),
                modifySwapsPositionTypeData.newSwaps
              )}`;
            }
            break;
          }
          case TRANSACTION_TYPES.TRANSFER_POSITION: {
            const transferedTypeData = tx.typeData as TransferTypeData;
            message = `Transfer ${transferedTypeData.from}:${transferedTypeData.to} position to ${transferedTypeData.toAddress}`;
            break;
          }
          case TRANSACTION_TYPES.MODIFY_PERMISSIONS: {
            const transferedTypeData = tx.typeData as ModifyPermissionsTypeData;
            message = `Set your ${transferedTypeData.from}:${transferedTypeData.to} position permissions`;
            break;
          }
          case TRANSACTION_TYPES.APPROVE_COMPANION: {
            const approveCompanionTypeData = tx.typeData as ApproveCompanionTypeData;
            message = `Approving Hub Companion to modify your ${approveCompanionTypeData.from}:${approveCompanionTypeData.to} position`;
            break;
          }
          case TRANSACTION_TYPES.MIGRATE_POSITION: {
            const approveCompanionTypeData = tx.typeData as MigratePositionTypeData;
            message = `Migrate your ${approveCompanionTypeData.from}:${approveCompanionTypeData.to} position`;
            break;
          }
          case TRANSACTION_TYPES.MIGRATE_POSITION_YIELD: {
            const approveCompanionTypeData = tx.typeData as MigratePositionYieldTypeData;
            message = `Making your ${approveCompanionTypeData.from}:${approveCompanionTypeData.to} position start generating yield`;
            break;
          }
          case TRANSACTION_TYPES.MODIFY_RATE_AND_SWAPS_POSITION: {
            const modifyRateAndSwapsPositionTypeData = tx.typeData as ModifyRateAndSwapsPositionTypeData;
            const modifiedRatePosition = tx.position || find(positions, { id: modifyRateAndSwapsPositionTypeData.id });
            const swapInterval = BigNumber.from((modifiedRatePosition as Position).swapInterval);

            if (modifiedRatePosition) {
              message = `Modify ${(modifiedRatePosition as Position).from.symbol}:${
                (modifiedRatePosition as Position).to.symbol
              } position to swap ${modifyRateAndSwapsPositionTypeData.newRate} ${
                (modifiedRatePosition as Position).from.symbol
              } ${
                STRING_SWAP_INTERVALS[swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].every
              } for ${getFrequencyLabel(swapInterval.toString(), modifyRateAndSwapsPositionTypeData.newSwaps)}`;
            }
            break;
          }
          case TRANSACTION_TYPES.NEW_PAIR: {
            const newPairTypeData = tx.typeData as NewPairTypeData;
            message = `Create ${newPairTypeData.token0.symbol}:${newPairTypeData.token1.symbol} pair`;
            break;
          }
          case TRANSACTION_TYPES.APPROVE_TOKEN: {
            const tokenApprovalTypeData = tx.typeData as ApproveTokenTypeData;
            message = `Approve ${tokenApprovalTypeData.token.symbol}`;
            break;
          }
          case TRANSACTION_TYPES.APPROVE_TOKEN_EXACT: {
            const tokenApprovalTypeData = tx.typeData as ApproveTokenExactTypeData;
            message = `Approve ${tokenApprovalTypeData.amount} ${tokenApprovalTypeData.token.symbol}`;
            break;
          }
          default:
            break;
        }
      } catch (e) {
        console.error('Error building transaction detail', e);
      }
      return message;
    },
    [availablePairs, currentPositions, pastPositions]
  );
}

export default useBuildTransactionDetail;
