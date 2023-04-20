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
  ApproveTokenExactTypeData,
  WrapEtherTypeData,
  ResetPositionTypeData,
  TransferTypeData,
  ApproveCompanionTypeData,
  ModifyPermissionsTypeData,
  MigratePositionTypeData,
  WithdrawFundsTypeData,
  MigratePositionYieldTypeData,
  SwapTypeData,
  EulerClaimClaimFromMigratorTypeData,
  EulerClaimPermitManyTypeData,
  EulerClaimTerminateManyTypeData,
} from 'types';
import { TRANSACTION_TYPES, STRING_SWAP_INTERVALS } from 'config/constants';
import useAvailablePairs from 'hooks/useAvailablePairs';
import { formatCurrencyAmount } from 'utils/currency';
import { BigNumber } from 'ethers';
import { defineMessage, useIntl } from 'react-intl';
import { getWrappedProtocolToken } from 'mocks/tokens';
import { getFrequencyLabel } from 'utils/parsing';
import useCurrentPositions from './useCurrentPositions';
import usePastPositions from './usePastPositions';

function useBuildTransactionMessages() {
  const availablePairs = useAvailablePairs();
  const currentPositions = useCurrentPositions();
  const pastPositions = usePastPositions();
  const intl = useIntl();

  const positions = React.useMemo(() => [...pastPositions, ...currentPositions], [currentPositions, pastPositions]);

  return React.useCallback(
    (tx: TransactionDetails) => {
      let message = intl.formatMessage(
        defineMessage({
          description: 'transactionMessagesConfirmed',
          defaultMessage: 'Transaction confirmed!',
        })
      );
      switch (tx.type) {
        case TRANSACTION_TYPES.WRAP: {
          const swapTypeData = tx.typeData as SwapTypeData;

          message = `Wrapped ${swapTypeData.amountFrom} ${swapTypeData.from} for ${swapTypeData.amountTo} ${swapTypeData.to}`;
          break;
        }
        case TRANSACTION_TYPES.UNWRAP: {
          const swapTypeData = tx.typeData as SwapTypeData;

          message = `Unwrapped ${swapTypeData.amountFrom} ${swapTypeData.from} for ${swapTypeData.amountTo} ${swapTypeData.to}`;
          break;
        }
        case TRANSACTION_TYPES.SWAP: {
          const swapTypeData = tx.typeData as SwapTypeData;

          message = `Swapped ${swapTypeData.amountFrom} ${swapTypeData.from} for ${swapTypeData.amountTo} ${swapTypeData.to}`;
          break;
        }
        case TRANSACTION_TYPES.WRAP_ETHER: {
          const wrapEtherTypeData = tx.typeData as WrapEtherTypeData;

          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesWrap',
              defaultMessage: '{amount} wrapped to {token}',
            }),
            {
              amount: wrapEtherTypeData.amount,
              token: getWrappedProtocolToken(tx.chainId).symbol,
            }
          );
          break;
        }
        case TRANSACTION_TYPES.NEW_POSITION: {
          const newPositionTypeData = tx.typeData as NewPositionTypeData;

          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesNewPosition',
              defaultMessage: 'Your new {from}:{to} position has been created',
            }),
            {
              from: newPositionTypeData.from.symbol,
              to: newPositionTypeData.to.symbol,
            }
          );
          break;
        }
        case TRANSACTION_TYPES.TERMINATE_POSITION: {
          const terminatePositionTypeData = tx.typeData as TerminatePositionTypeData;
          const terminatedPosition = find(positions, { id: terminatePositionTypeData.id });
          if (terminatedPosition) {
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionMessagesTerminate',
                defaultMessage: 'Your {from}:{to} position has been closed',
              }),
              {
                from: (terminatedPosition as Position).from.symbol,
                to: (terminatedPosition as Position).to.symbol,
              }
            );
          }
          break;
        }
        case TRANSACTION_TYPES.WITHDRAW_FUNDS: {
          const withdrawFundsPositionTypeData = tx.typeData as WithdrawFundsTypeData;
          const withdrawnPosition = tx.position || find(positions, { id: withdrawFundsPositionTypeData.id });
          if (withdrawnPosition) {
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionMessagesWithdrawFunds',
                defaultMessage: 'You have withdrawn {amount} {from} funds from your {from}:{to} position',
              }),
              {
                from: (withdrawnPosition as Position).from.symbol,
                to: (withdrawnPosition as Position).to.symbol,
                amount: formatCurrencyAmount(
                  BigNumber.from(withdrawFundsPositionTypeData.removedFunds),
                  (withdrawnPosition as Position).from
                ),
              }
            );
          }
          break;
        }
        case TRANSACTION_TYPES.WITHDRAW_POSITION: {
          const withdrawPositionTypeData = tx.typeData as WithdrawTypeData;
          const withdrawnPosition = find(positions, { id: withdrawPositionTypeData.id });
          if (withdrawnPosition) {
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionMessagesWithdraw',
                defaultMessage: 'You have withdrawn from your {from}:{to} position',
              }),
              {
                from: (withdrawnPosition as Position).from.symbol,
                to: (withdrawnPosition as Position).to.symbol,
              }
            );
          }
          break;
        }
        case TRANSACTION_TYPES.ADD_FUNDS_POSITION: {
          const addFundsTypeData = tx.typeData as AddFundsTypeData;
          const fundedPosition = find(positions, { id: addFundsTypeData.id });
          if (fundedPosition) {
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionMessagesAddFunds',
                defaultMessage: '{amount} {from} have been added to your {from}:{to} position',
              }),
              {
                from: (fundedPosition as Position).from.symbol,
                to: (fundedPosition as Position).to.symbol,
                amount: addFundsTypeData.newFunds,
              }
            );
          }
          break;
        }
        case TRANSACTION_TYPES.RESET_POSITION: {
          const resetPositionTypeData = tx.typeData as ResetPositionTypeData;
          const resettedPosition = find(positions, { id: resetPositionTypeData.id });
          const swapInterval = BigNumber.from((resettedPosition as Position).swapInterval);

          if (resettedPosition) {
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionMessagesReset',
                defaultMessage:
                  '{amount} {from} have been added to your {from}:{to} position and it has been set to run for {swaps} {frequency}',
              }),
              {
                from: (resettedPosition as Position).from.symbol,
                to: (resettedPosition as Position).to.symbol,
                amount: resetPositionTypeData.newFunds,
                swaps: resetPositionTypeData.newSwaps,
                frequency: getFrequencyLabel(intl, swapInterval.toString(), resetPositionTypeData.newSwaps),
              }
            );
          }
          break;
        }
        case TRANSACTION_TYPES.REMOVE_FUNDS: {
          const removeFundsTypeData = tx.typeData as RemoveFundsTypeData;
          const removeFundedPosition = find(positions, { id: removeFundsTypeData.id });
          if (removeFundedPosition) {
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionMessagesRemoveFunds',
                defaultMessage: '{amount} {from} have been removed from your {from}:{to} position',
              }),
              {
                from: (removeFundedPosition as Position).from.symbol,
                to: (removeFundedPosition as Position).to.symbol,
                amount: removeFundsTypeData.ammountToRemove,
              }
            );
          }
          break;
        }

        case TRANSACTION_TYPES.MODIFY_SWAPS_POSITION: {
          const modifySwapsPositionTypeData = tx.typeData as ModifySwapsPositionTypeData;
          const modifiedPosition = find(positions, { id: modifySwapsPositionTypeData.id });
          const swapInterval = BigNumber.from((modifiedPosition as Position).swapInterval);

          if (modifiedPosition) {
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionMessagesModifySwaps',
                defaultMessage: 'Your {from}:{to} position has now been set to run for {swaps} {frequency}',
              }),
              {
                from: (modifiedPosition as Position).from.symbol,
                to: (modifiedPosition as Position).to.symbol,
                swaps: modifySwapsPositionTypeData.newSwaps,
                frequency: getFrequencyLabel(intl, swapInterval.toString(), modifySwapsPositionTypeData.newSwaps),
              }
            );
          }
          break;
        }
        case TRANSACTION_TYPES.MODIFY_RATE_AND_SWAPS_POSITION: {
          const modifyRateAndSwapsPositionTypeData = tx.typeData as ModifyRateAndSwapsPositionTypeData;
          const modifiedRatePosition = find(positions, { id: modifyRateAndSwapsPositionTypeData.id });
          const swapInterval = BigNumber.from((modifiedRatePosition as Position).swapInterval);

          if (modifiedRatePosition) {
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionMessagesModifyRateAndSwaps',
                defaultMessage: 'Your {from}:{to} position has now been set to swap {rate} {freq} for {swaps}',
              }),
              {
                from: (modifiedRatePosition as Position).from.symbol,
                to: (modifiedRatePosition as Position).to.symbol,
                rate: modifyRateAndSwapsPositionTypeData.newRate,
                freq: intl.formatMessage(
                  STRING_SWAP_INTERVALS[swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].every
                ),
                swaps: getFrequencyLabel(intl, swapInterval.toString(), modifyRateAndSwapsPositionTypeData.newSwaps),
              }
            );
          }
          break;
        }
        case TRANSACTION_TYPES.TRANSFER_POSITION: {
          const transferedTypeData = tx.typeData as TransferTypeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesTransfer',
              defaultMessage: 'Your {from}:{to} has now been transfered to {address}',
            }),
            {
              from: transferedTypeData.from,
              to: transferedTypeData.to,
              address: transferedTypeData.toAddress,
            }
          );
          break;
        }
        case TRANSACTION_TYPES.MODIFY_PERMISSIONS: {
          const transferedTypeData = tx.typeData as ModifyPermissionsTypeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesModifyPermissions',
              defaultMessage: 'Your {from}:{to} position permissions have now been set',
            }),
            {
              from: transferedTypeData.from,
              to: transferedTypeData.to,
            }
          );
          break;
        }
        case TRANSACTION_TYPES.APPROVE_COMPANION: {
          const approveCompanionTypeData = tx.typeData as ApproveCompanionTypeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesApproveCompanion',
              defaultMessage: 'Our Hub Companion has been approved to modify your {from}:{to} position',
            }),
            {
              from: approveCompanionTypeData.from,
              to: approveCompanionTypeData.to,
            }
          );
          break;
        }
        case TRANSACTION_TYPES.MIGRATE_POSITION: {
          const approveCompanionTypeData = tx.typeData as MigratePositionTypeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesMigrate',
              defaultMessage: 'Your {from}:{to} position has been migrated',
            }),
            {
              from: approveCompanionTypeData.from,
              to: approveCompanionTypeData.to,
            }
          );
          break;
        }
        case TRANSACTION_TYPES.MIGRATE_POSITION_YIELD: {
          const approveCompanionTypeData = tx.typeData as MigratePositionYieldTypeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesMigrate',
              defaultMessage: 'Your {from}:{to} position has now started generating yield',
            }),
            {
              from: approveCompanionTypeData.from,
              to: approveCompanionTypeData.to,
            }
          );
          break;
        }
        case TRANSACTION_TYPES.NEW_PAIR: {
          const newPairTypeData = tx.typeData as NewPairTypeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesNewPair',
              defaultMessage: 'The pair {from}:{to} has been created',
            }),
            {
              from: newPairTypeData.token0.symbol,
              to: newPairTypeData.token1.symbol,
            }
          );
          break;
        }
        case TRANSACTION_TYPES.APPROVE_TOKEN: {
          const tokenApprovalTypeData = tx.typeData as ApproveTokenTypeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesApproveToken',
              defaultMessage: '{from} is now ready to be used',
            }),
            {
              from: tokenApprovalTypeData.token.symbol,
            }
          );
          break;
        }
        case TRANSACTION_TYPES.APPROVE_TOKEN_EXACT: {
          const tokenApprovalExactTypeData = tx.typeData as ApproveTokenExactTypeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesApproveTokenExact',
              defaultMessage: 'You are now ready to use {amount} {from}',
            }),
            {
              from: tokenApprovalExactTypeData.token.symbol,
              amount: formatCurrencyAmount(
                BigNumber.from(tokenApprovalExactTypeData.amount),
                tokenApprovalExactTypeData.token,
                4
              ),
            }
          );
          break;
        }
        case TRANSACTION_TYPES.EULER_CLAIM_CLAIM_FROM_MIGRATOR: {
          const eulerClaimClaimFromMigratorTypeData = tx.typeData as EulerClaimClaimFromMigratorTypeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesEulerClaimClaimFromMigrator',
              defaultMessage: 'You claimed your due for {token} from the Euler Claim page',
            }),
            {
              token: eulerClaimClaimFromMigratorTypeData.token.symbol,
            }
          );
          break;
        }
        case TRANSACTION_TYPES.EULER_CLAIM_PERMIT_MANY: {
          const eulerClaimPermitManyTypeData = tx.typeData as EulerClaimPermitManyTypeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesEulerClaimPermitMany',
              defaultMessage: 'Mean Finance can now close {positions} positions',
            }),
            {
              positions: eulerClaimPermitManyTypeData.positionIds.length,
            }
          );
          break;
        }
        case TRANSACTION_TYPES.EULER_CLAIM_TERMINATE_MANY: {
          const eulerClaimTerminateManyTypeData = tx.typeData as EulerClaimTerminateManyTypeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesEulerClaimTerminateMany',
              defaultMessage: '{positions} positions were closed',
            }),
            {
              positions: eulerClaimTerminateManyTypeData.positionIds.length,
            }
          );
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
