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
import { defineMessage, useIntl } from 'react-intl';
import useAvailablePairs from 'hooks/useAvailablePairs';
import { getWrappedProtocolToken } from 'mocks/tokens';
import { getFrequencyLabel } from 'utils/parsing';
import useCurrentPositions from './useCurrentPositions';
import usePastPositions from './usePastPositions';

function useBuildTransactionDetail() {
  const availablePairs = useAvailablePairs();
  const currentPositions = useCurrentPositions();
  const pastPositions = usePastPositions();
  const intl = useIntl();

  const positions = React.useMemo(() => [...pastPositions, ...currentPositions], [currentPositions, pastPositions]);

  return React.useCallback(
    (tx: TransactionDetails) => {
      let message = intl.formatMessage(
        defineMessage({
          description: 'transactionDetailsConfirmed',
          defaultMessage: 'Transaction confirmed!',
        })
      );
      try {
        switch (tx.type) {
          case TRANSACTION_TYPES.WRAP_ETHER: {
            const wrapEtherTypeData = tx.typeData as WrapEtherTypeData;

            message = intl.formatMessage(
              defineMessage({
                description: 'transactionDetailsWrap',
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
                description: 'transactionDetailsNewPosition',
                defaultMessage: 'Create {from}:{to} position',
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
            const terminatedPosition = tx.position || find(positions, { id: terminatePositionTypeData.id });
            if (terminatedPosition) {
              message = intl.formatMessage(
                defineMessage({
                  description: 'transactionDetailsTerminate',
                  defaultMessage: 'Close {from}:{to} position',
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
                  description: 'transactionDetailsWithdrawFunds',
                  defaultMessage: 'Withdraw {amount} {from} funds from your {from}:{to} position',
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
            const withdrawnPosition = tx.position || find(positions, { id: withdrawPositionTypeData.id });
            if (withdrawnPosition) {
              message = intl.formatMessage(
                defineMessage({
                  description: 'transactionDetailsWithdraw',
                  defaultMessage: 'Withdraw from {from}:{to} position',
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
            const fundedPosition = tx.position || find(positions, { id: addFundsTypeData.id });
            if (fundedPosition) {
              message = intl.formatMessage(
                defineMessage({
                  description: 'transactionDetailsAddFunds',
                  defaultMessage: 'Add {amount} {from} to the {from}:{to} position',
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
          case TRANSACTION_TYPES.REMOVE_FUNDS: {
            const removeFundsTypeData = tx.typeData as RemoveFundsTypeData;
            const removeFundedPosition = tx.position || find(positions, { id: removeFundsTypeData.id });
            if (removeFundedPosition) {
              message = intl.formatMessage(
                defineMessage({
                  description: 'transactionDetailsRemoveFunds',
                  defaultMessage: 'Remove {amount} {from} from the {from}:{to} position',
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
          case TRANSACTION_TYPES.RESET_POSITION: {
            const resetPositionTypeData = tx.typeData as ResetPositionTypeData;
            const resettedPosition = tx.position || find(positions, { id: resetPositionTypeData.id });
            const swapInterval = BigNumber.from((resettedPosition as Position).swapInterval);
            if (resettedPosition) {
              message = intl.formatMessage(
                defineMessage({
                  description: 'transactionDetailsReset',
                  defaultMessage:
                    'Add {amount} {from} to your {from}:{to} position and set it to run for {swaps} {frequency}',
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
          case TRANSACTION_TYPES.MODIFY_SWAPS_POSITION: {
            const modifySwapsPositionTypeData = tx.typeData as ModifySwapsPositionTypeData;
            const modifiedPosition = tx.position || find(positions, { id: modifySwapsPositionTypeData.id });
            const swapInterval = BigNumber.from((modifiedPosition as Position).swapInterval);
            if (modifiedPosition) {
              message = intl.formatMessage(
                defineMessage({
                  description: 'transactionDetailsModifySwaps',
                  defaultMessage: 'Modify {from}:{to} position to run for {swaps} {frequency}',
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
          case TRANSACTION_TYPES.TRANSFER_POSITION: {
            const transferedTypeData = tx.typeData as TransferTypeData;
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionDetailsTransfer',
                defaultMessage: 'Transfer {from}:{to} position to {address}',
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
                description: 'transactionDetailsModifyPermissions',
                defaultMessage: 'Set your {from}:{to} position permissions',
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
                description: 'transactionDetailsApproveCompanion',
                defaultMessage: 'Approving Hub Companion to modify your {from}:{to} position',
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
                description: 'transactionDetailsMigrate',
                defaultMessage: 'Migrate your {from}:{to} position',
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
                description: 'transactionDetailsMigrate',
                defaultMessage: 'Making your {from}:{to} position start generating yield',
              }),
              {
                from: approveCompanionTypeData.from,
                to: approveCompanionTypeData.to,
              }
            );
            break;
          }
          case TRANSACTION_TYPES.MODIFY_RATE_AND_SWAPS_POSITION: {
            const modifyRateAndSwapsPositionTypeData = tx.typeData as ModifyRateAndSwapsPositionTypeData;
            const modifiedRatePosition = tx.position || find(positions, { id: modifyRateAndSwapsPositionTypeData.id });
            const swapInterval = BigNumber.from((modifiedRatePosition as Position).swapInterval);

            if (modifiedRatePosition) {
              message = intl.formatMessage(
                defineMessage({
                  description: 'transactionDetailsModifyRateAndSwaps',
                  defaultMessage: 'Modify {from}:{to} position to swap {rate} {freq} for {swaps}',
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
          case TRANSACTION_TYPES.NEW_PAIR: {
            const newPairTypeData = tx.typeData as NewPairTypeData;
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionDetailsNewPair',
                defaultMessage: 'Create {from}:{to} pair',
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
                description: 'transactionDetailsApproveToken',
                defaultMessage: 'Approve {from}',
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
                description: 'transactionDetailsApproveTokenExact',
                defaultMessage: 'Approve {amount} {from}',
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
