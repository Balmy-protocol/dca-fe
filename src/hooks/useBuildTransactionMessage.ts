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
  ModifyRateAndSwapsPositionTypeData,
  NewPairTypeData,
  Position,
  ApproveTokenTypeData,
  WrapEtherTypeData,
  ResetPositionTypeData,
  TransferTypeData,
  ApproveCompanionTypeData,
  ModifyPermissionsTypeData,
  MigratePositionTypeData,
} from 'types';
import { TRANSACTION_TYPES, STRING_SWAP_INTERVALS } from 'config/constants';
import useAvailablePairs from 'hooks/useAvailablePairs';
import { getFrequencyLabel } from 'utils/parsing';
import useCurrentPositions from './useCurrentPositions';
import usePastPositions from './usePastPositions';

function useBuildTransactionMessages() {
  const availablePairs = useAvailablePairs();
  const currentPositions = useCurrentPositions();
  const pastPositions = usePastPositions();

  const positions = React.useMemo(() => [...pastPositions, ...currentPositions], [currentPositions, pastPositions]);

  return React.useCallback(
    (tx: TransactionDetails) => {
      let message = 'Transaction confirmed!';
      switch (tx.type) {
        case TRANSACTION_TYPES.WRAP_ETHER: {
          const wrapEtherTypeData = tx.typeData as WrapEtherTypeData;

          message = `${wrapEtherTypeData.amount} wrapped to getWrappedProtocolToken`;
          break;
        }
        case TRANSACTION_TYPES.NEW_POSITION: {
          const newPositionTypeData = tx.typeData as NewPositionTypeData;

          message = `Your new ${newPositionTypeData.from.symbol}:${newPositionTypeData.to.symbol} position has been created`;
          break;
        }
        case TRANSACTION_TYPES.TERMINATE_POSITION: {
          const terminatePositionTypeData = tx.typeData as TerminatePositionTypeData;
          const terminatedPosition = find(positions, { id: terminatePositionTypeData.id });
          if (terminatedPosition) {
            message = `Your ${(terminatedPosition as Position).from.symbol}:${
              (terminatedPosition as Position).to.symbol
            } position has been terminated`;
          }
          break;
        }
        case TRANSACTION_TYPES.WITHDRAW_POSITION: {
          const withdrawPositionTypeData = tx.typeData as WithdrawTypeData;
          const withdrawnPosition = find(positions, { id: withdrawPositionTypeData.id });
          if (withdrawnPosition) {
            message = `You have withdrawn from your ${(withdrawnPosition as Position).from.symbol}:${
              (withdrawnPosition as Position).to.symbol
            } position`;
          }
          break;
        }
        case TRANSACTION_TYPES.ADD_FUNDS_POSITION: {
          const addFundsTypeData = tx.typeData as AddFundsTypeData;
          const fundedPosition = find(positions, { id: addFundsTypeData.id });
          if (fundedPosition) {
            message = `${addFundsTypeData.newFunds} ${
              (fundedPosition as Position).from.symbol
            } have been added to your ${(fundedPosition as Position).from.symbol}:${
              (fundedPosition as Position).to.symbol
            } position`;
          }
          break;
        }
        case TRANSACTION_TYPES.RESET_POSITION: {
          const resetPositionTypeData = tx.typeData as ResetPositionTypeData;
          const resettedPosition = find(positions, { id: resetPositionTypeData.id });
          if (resettedPosition) {
            message = `${resetPositionTypeData.newFunds} ${
              (resettedPosition as Position).from.symbol
            } have been added to your ${(resettedPosition as Position).from.symbol}:${
              (resettedPosition as Position).to.symbol
            } position and it has been set to run for ${getFrequencyLabel(
              (resettedPosition as Position).swapInterval.toString(),
              resetPositionTypeData.newSwaps
            )}`;
          }
          break;
        }
        case TRANSACTION_TYPES.REMOVE_FUNDS: {
          const removeFundsTypeData = tx.typeData as RemoveFundsTypeData;
          const removeFundedPosition = find(positions, { id: removeFundsTypeData.id });
          if (removeFundedPosition) {
            message = `${removeFundsTypeData.ammountToRemove} ${
              (removeFundedPosition as Position).from.symbol
            } have been removed from your ${(removeFundedPosition as Position).from.symbol}:${
              (removeFundedPosition as Position).to.symbol
            } position`;
          }
          break;
        }

        case TRANSACTION_TYPES.MODIFY_SWAPS_POSITION: {
          const modifySwapsPositionTypeData = tx.typeData as ModifySwapsPositionTypeData;
          const modifiedPosition = find(positions, { id: modifySwapsPositionTypeData.id });
          if (modifiedPosition) {
            message = `Your ${(modifiedPosition as Position).from.symbol}:${
              (modifiedPosition as Position).to.symbol
            } position has now been set to run for ${getFrequencyLabel(
              (modifiedPosition as Position).swapInterval.toString(),
              modifySwapsPositionTypeData.newSwaps
            )}`;
          }
          break;
        }
        case TRANSACTION_TYPES.MODIFY_RATE_AND_SWAPS_POSITION: {
          const modifyRateAndSwapsPositionTypeData = tx.typeData as ModifyRateAndSwapsPositionTypeData;
          const modifiedRatePosition = find(positions, { id: modifyRateAndSwapsPositionTypeData.id });
          if (modifiedRatePosition) {
            message = `Your ${(modifiedRatePosition as Position).from.symbol}:${
              (modifiedRatePosition as Position).to.symbol
            } position has now been set swap ${modifyRateAndSwapsPositionTypeData.newRate} ${
              (modifiedRatePosition as Position).from.symbol
            } ${
              STRING_SWAP_INTERVALS[
                (modifiedRatePosition as Position).swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS
              ].every
            } for ${getFrequencyLabel(
              (modifiedRatePosition as Position).swapInterval.toString(),
              modifyRateAndSwapsPositionTypeData.newSwaps
            )}`;
          }
          break;
        }
        case TRANSACTION_TYPES.TRANSFER_POSITION: {
          const transferedTypeData = tx.typeData as TransferTypeData;
          message = `Your ${transferedTypeData.from}:${transferedTypeData.to} position has now been transfered to ${transferedTypeData.toAddress}`;
          break;
        }
        case TRANSACTION_TYPES.MODIFY_PERMISSIONS: {
          const transferedTypeData = tx.typeData as ModifyPermissionsTypeData;
          message = `Your ${transferedTypeData.from}:${transferedTypeData.to} position permissions have now been set`;
          break;
        }
        case TRANSACTION_TYPES.APPROVE_COMPANION: {
          const approveCompanionTypeData = tx.typeData as ApproveCompanionTypeData;
          message = `Our Hub Companion has been approved to modify your ${approveCompanionTypeData.from}:${approveCompanionTypeData.to} position`;
          break;
        }
        case TRANSACTION_TYPES.MIGRATE_POSITION: {
          const approveCompanionTypeData = tx.typeData as MigratePositionTypeData;
          message = `Your ${approveCompanionTypeData.from}:${approveCompanionTypeData.to} position has been migrated`;
          break;
        }
        case TRANSACTION_TYPES.NEW_PAIR: {
          const newPairTypeData = tx.typeData as NewPairTypeData;
          message = `The pair ${newPairTypeData.token0.symbol}:${newPairTypeData.token1.symbol} has been created`;
          break;
        }
        case TRANSACTION_TYPES.APPROVE_TOKEN: {
          const tokenApprovalTypeData = tx.typeData as ApproveTokenTypeData;
          message = `${tokenApprovalTypeData.token.symbol} is now ready to be used`;
          break;
        }
        default:
          break;
      }

      return message;
    },
    [availablePairs, currentPositions, pastPositions]
  );
}

export default useBuildTransactionMessages;
