import React from 'react';
import find from 'lodash/find';
import { TransactionDetails, Position, TransactionTypes } from '@types';
import { STRING_SWAP_INTERVALS } from '@constants';
import { formatCurrencyAmount } from '@common/utils/currency';

import { defineMessage, useIntl } from 'react-intl';
import { getWrappedProtocolToken } from '@common/mocks/tokens';
import { getFrequencyLabel, trimAddress } from '@common/utils/parsing';
import useCurrentPositions from './useCurrentPositions';
import usePastPositions from './usePastPositions';

function useBuildTransactionDetail() {
  const { currentPositions } = useCurrentPositions();
  const { pastPositions } = usePastPositions();
  const intl = useIntl();

  const positions = React.useMemo(() => [...pastPositions, ...currentPositions], [currentPositions, pastPositions]);

  return React.useCallback(
    (tx: TransactionDetails) => {
      let message = intl.formatMessage(
        defineMessage({
          description: 'transactionDetailsConfirmed',
          defaultMessage: 'Transaction Confirmed',
        })
      );
      try {
        switch (tx.type) {
          case TransactionTypes.swap: {
            const swapTypeData = tx.typeData;

            message = `Swap ${swapTypeData.amountFrom} ${swapTypeData.from.symbol} for ${swapTypeData.amountTo} ${swapTypeData.to.symbol}`;
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
                  amount: formatCurrencyAmount({
                    amount: BigInt(withdrawFundsPositionTypeData.removedFunds),
                    token: (withdrawnPosition as Position).from,
                    intl,
                  }),
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
                address: trimAddress(transferedTypeData.toAddress),
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
            const swapInterval = BigInt((modifiedRatePosition as Position).swapInterval);

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
                amount: formatCurrencyAmount({
                  amount: BigInt(tokenApprovalExactTypeData.amount),
                  token: tokenApprovalExactTypeData.token,
                  sigFigs: 4,
                  intl,
                }),
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
          case TransactionTypes.transferToken: {
            const { amount, token, to } = tx.typeData;

            message = intl.formatMessage(
              defineMessage({
                description: 'transactionMessagesTokenTransfer',
                defaultMessage: 'Transfer {amount} {symbol} to {to}',
              }),
              {
                amount,
                symbol: token.symbol,
                to,
              }
            );
            break;
          }
          case TransactionTypes.earnCreate: {
            const { asset, assetAmount } = tx.typeData;

            message = intl.formatMessage(
              defineMessage({
                description: 'transactionDetailMessages.earn.create',
                defaultMessage: 'Started investing {amount} {symbol}',
              }),
              {
                amount: formatCurrencyAmount({ amount: BigInt(assetAmount), token: asset, sigFigs: 4, intl }),
                symbol: asset.symbol,
              }
            );
            break;
          }
          case TransactionTypes.earnIncrease: {
            const { asset, assetAmount } = tx.typeData;

            message = intl.formatMessage(
              defineMessage({
                description: 'transactionDetailMessages.earn.increase',
                defaultMessage: 'Increased your {symbol} investment by {amount} {symbol}',
              }),
              {
                amount: formatCurrencyAmount({ amount: BigInt(assetAmount), token: asset, sigFigs: 4, intl }),
                symbol: asset.symbol,
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
    [currentPositions, pastPositions]
  );
}

export default useBuildTransactionDetail;
