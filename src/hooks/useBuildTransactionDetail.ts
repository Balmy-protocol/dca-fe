import React from 'react';
import find from 'lodash/find';
import { TransactionDetails, Position, TransactionTypes } from '@types';
import { STRING_SWAP_INTERVALS } from '@constants';
import { formatCurrencyAmount } from '@common/utils/currency';
import { BigNumber } from 'ethers';
import { defineMessage, useIntl } from 'react-intl';
import useAvailablePairs from '@hooks/useAvailablePairs';
import { getWrappedProtocolToken } from '@common/mocks/tokens';
import { getFrequencyLabel } from '@common/utils/parsing';
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
          case TransactionTypes.wrap: {
            const swapTypeData = tx.typeData;

            message = `Wrap ${swapTypeData.amountFrom} ${swapTypeData.from} for ${swapTypeData.amountTo} ${swapTypeData.to}`;
            break;
          }
          case TransactionTypes.unwrap: {
            const swapTypeData = tx.typeData;

            message = `Unwrap ${swapTypeData.amountFrom} ${swapTypeData.from} for ${swapTypeData.amountTo} ${swapTypeData.to}`;
            break;
          }
          case TransactionTypes.swap: {
            const swapTypeData = tx.typeData;

            message = `Swap ${swapTypeData.amountFrom} ${swapTypeData.from} for ${swapTypeData.amountTo} ${swapTypeData.to}`;
            break;
          }
          case TransactionTypes.wrapEther: {
            const wrapEtherTypeData = tx.typeData;

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
          case TransactionTypes.newPosition: {
            const newPositionTypeData = tx.typeData;

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
          case TransactionTypes.terminatePosition: {
            const terminatePositionTypeData = tx.typeData;
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
          case TransactionTypes.withdrawFunds: {
            const withdrawFundsPositionTypeData = tx.typeData;
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
          case TransactionTypes.withdrawPosition: {
            const withdrawPositionTypeData = tx.typeData;
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
          case TransactionTypes.addFundsPosition: {
            const addFundsTypeData = tx.typeData;
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
          case TransactionTypes.removeFunds: {
            const removeFundsTypeData = tx.typeData;
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
          case TransactionTypes.resetPosition: {
            const resetPositionTypeData = tx.typeData;
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
          case TransactionTypes.modifySwapsPosition: {
            const modifySwapsPositionTypeData = tx.typeData;
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
          case TransactionTypes.transferPosition: {
            const transferedTypeData = tx.typeData;
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
          case TransactionTypes.modifyPermissions: {
            const transferedTypeData = tx.typeData;
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
          case TransactionTypes.approveCompanion: {
            const approveCompanionTypeData = tx.typeData;
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
          case TransactionTypes.migratePosition: {
            const approveCompanionTypeData = tx.typeData;
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
          case TransactionTypes.migratePositionYield: {
            const approveCompanionTypeData = tx.typeData;
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
          case TransactionTypes.modifyRateAndSwapsPosition: {
            const modifyRateAndSwapsPositionTypeData = tx.typeData;
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
          case TransactionTypes.newPair: {
            const newPairTypeData = tx.typeData;
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
          case TransactionTypes.approveToken: {
            const tokenApprovalTypeData = tx.typeData;
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionDetailsApproveToken',
                defaultMessage: 'Authorize {from}',
              }),
              {
                from: tokenApprovalTypeData.token.symbol,
              }
            );
            break;
          }
          case TransactionTypes.approveTokenExact: {
            const tokenApprovalExactTypeData = tx.typeData;
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionDetailsApproveTokenExact',
                defaultMessage: 'Authorize {amount} {from}',
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
          case TransactionTypes.eulerClaimClaimFromMigrator: {
            const eulerClaimClaimFromMigratorTypeData = tx.typeData;
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionDetailsEulerClaimClaimFromMigrator',
                defaultMessage: 'You claimed your due for {token} from the Euler Claim page',
              }),
              {
                token: eulerClaimClaimFromMigratorTypeData.token.symbol,
              }
            );
            break;
          }
          case TransactionTypes.eulerClaimPermitMany: {
            const eulerClaimPermitManyTypeData = tx.typeData;
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionDetailsEulerClaimPermitMany',
                defaultMessage: 'Allow Mean Finance to close {positions} positions',
              }),
              {
                positions: eulerClaimPermitManyTypeData.positionIds.length,
              }
            );
            break;
          }
          case TransactionTypes.eulerClaimTerminateMany: {
            const eulerClaimTerminateManyTypeData = tx.typeData;
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionDetailsEulerClaimTerminateMany',
                defaultMessage: 'Close {positions} positions',
              }),
              {
                positions: eulerClaimTerminateManyTypeData.positionIds.length,
              }
            );
            break;
          }
          case TransactionTypes.claimCampaign: {
            const claimCampaignTypeData = tx.typeData;

            message = intl.formatMessage(
              defineMessage({
                description: 'transactionMessagesClaimCampaign',
                defaultMessage: 'Claim the {campaign} campaign',
              }),
              {
                campaign: claimCampaignTypeData.name,
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
