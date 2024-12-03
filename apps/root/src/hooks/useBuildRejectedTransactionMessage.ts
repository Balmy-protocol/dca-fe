import React from 'react';
import find from 'lodash/find';
import { TransactionDetails, Position, TransactionTypes } from '@types';
import { STRING_SWAP_INTERVALS } from '@constants';
import { getFrequencyLabel } from '@common/utils/parsing';

import { formatCurrencyAmount } from '@common/utils/currency';
import { useIntl, defineMessage } from 'react-intl';
import useCurrentPositions from './useCurrentPositions';
import usePastPositions from './usePastPositions';

function useBuildTransactionMessages() {
  const { currentPositions } = useCurrentPositions();
  const { pastPositions } = usePastPositions();
  const intl = useIntl();

  const positions = React.useMemo(() => [...pastPositions, ...currentPositions], [currentPositions, pastPositions]);

  return React.useCallback(
    (tx: TransactionDetails) => {
      let message = 'Transaction Confirmed';
      switch (tx.type) {
        case TransactionTypes.swap: {
          const swapTypeData = tx.typeData;

          message = `Swapping ${formatCurrencyAmount({
            amount: swapTypeData.amountFrom,
            token: swapTypeData.from,
            intl,
          })} ${swapTypeData.from.symbol} for ${formatCurrencyAmount({
            amount: swapTypeData.amountTo,
            token: swapTypeData.to,
            intl,
          })} ${swapTypeData.to.symbol}`;
          break;
        }
        case TransactionTypes.wrapEther: {
          const wrapEtherTypeData = tx.typeData;

          message = `Wrapping ${wrapEtherTypeData.amount} ETH to getWrappedProtocolToken`;
          break;
        }
        case TransactionTypes.newPosition: {
          const newPositionTypeData = tx.typeData;

          message = `Creating your ${newPositionTypeData.from.symbol}:${newPositionTypeData.to.symbol} position`;
          break;
        }
        case TransactionTypes.terminatePosition: {
          const terminatePositionTypeData = tx.typeData;
          const terminatedPosition = find(positions, { id: terminatePositionTypeData.id });
          if (terminatedPosition) {
            message = `Closing your ${(terminatedPosition as Position).from.symbol}:${
              (terminatedPosition as Position).to.symbol
            } position`;
          }
          break;
        }
        case TransactionTypes.withdrawFunds: {
          const withdrawFundsTypeData = tx.typeData;
          const withdrawnPosition = find(positions, { id: withdrawFundsTypeData.id });

          message = `Withdrawing your ${withdrawFundsTypeData.from} funds from your ${
            (withdrawnPosition as Position).from.symbol
          }:${(withdrawnPosition as Position).to.symbol} position`;
          break;
        }
        case TransactionTypes.withdrawPosition: {
          const withdrawPositionTypeData = tx.typeData;
          const withdrawnPosition = find(positions, { id: withdrawPositionTypeData.id });
          if (withdrawnPosition) {
            message = `Withdrawing from your ${(withdrawnPosition as Position).from.symbol}:${
              (withdrawnPosition as Position).to.symbol
            } position`;
          }
          break;
        }
        case TransactionTypes.modifyRateAndSwapsPosition: {
          const modifyRateAndSwapsPositionTypeData = tx.typeData;
          const modifiedRatePosition = find(positions, { id: modifyRateAndSwapsPositionTypeData.id });
          if (modifiedRatePosition) {
            message = `Setting your ${(modifiedRatePosition as Position).from.symbol}:${
              (modifiedRatePosition as Position).to.symbol
            } position to swap ${modifyRateAndSwapsPositionTypeData.newRate} ${
              (modifiedRatePosition as Position).from.symbol
            } ${intl.formatMessage(
              STRING_SWAP_INTERVALS[
                (modifiedRatePosition as Position).swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS
              ].every
            )} for ${modifyRateAndSwapsPositionTypeData.newSwaps} ${getFrequencyLabel(
              intl,
              (modifiedRatePosition as Position).swapInterval.toString(),
              modifyRateAndSwapsPositionTypeData.newSwaps
            )}`;
          }
          break;
        }
        case TransactionTypes.transferPosition: {
          const transferedTypeData = tx.typeData;
          message = `Transfering your ${transferedTypeData.from}:${transferedTypeData.to} position has to ${transferedTypeData.toAddress}`;
          break;
        }
        case TransactionTypes.migratePositionYield: {
          const transferedTypeData = tx.typeData;
          message = `Making your ${transferedTypeData.from}:${transferedTypeData.to} position start generating yield`;
          break;
        }
        case TransactionTypes.approveCompanion: {
          const approveCompanionTypeData = tx.typeData;
          message = `Approving our Hub Companion to modify your ${approveCompanionTypeData.from}:${approveCompanionTypeData.to} position`;
          break;
        }
        case TransactionTypes.modifyPermissions: {
          const transferedTypeData = tx.typeData;
          message = `Setting your ${transferedTypeData.from}:${transferedTypeData.to} position permissions`;
          break;
        }
        case TransactionTypes.approveToken: {
          const tokenApprovalTypeData = tx.typeData;
          message = `Approving your ${tokenApprovalTypeData.token.symbol}`;
          break;
        }
        case TransactionTypes.approveTokenExact: {
          const tokenApprovalExactTypeData = tx.typeData;
          message = `Approving ${formatCurrencyAmount({
            amount: BigInt(tokenApprovalExactTypeData.amount),
            token: tokenApprovalExactTypeData.token,
            sigFigs: 4,
            intl,
          })} ${tokenApprovalExactTypeData.token.symbol}`;
          break;
        }
        case TransactionTypes.claimCampaign: {
          const claimCampaignTypeData = tx.typeData;

          message = intl.formatMessage(
            defineMessage({
              description: 'transactionRejectedClaimCampaign',
              defaultMessage: 'Claiming the {campaign} campaign',
            }),
            {
              campaign: claimCampaignTypeData.name,
            }
          );
          break;
        }
        case TransactionTypes.earnCreate: {
          const { asset, assetAmount } = tx.typeData;

          message = intl.formatMessage(
            defineMessage({
              description: 'transactionRejected.earn.create',
              defaultMessage: 'Investing {amount} {symbol}',
            }),
            {
              symbol: asset.symbol,
              amount: formatCurrencyAmount({ amount: BigInt(assetAmount), token: asset, intl }),
            }
          );
          break;
        }
        case TransactionTypes.earnIncrease: {
          const { asset, assetAmount } = tx.typeData;

          message = intl.formatMessage(
            defineMessage({
              description: 'transactionRejected.earn.increase',
              defaultMessage: 'Depositing {amount} {symbol}',
            }),
            {
              symbol: asset.symbol,
              amount: formatCurrencyAmount({ amount: BigInt(assetAmount), token: asset, intl }),
            }
          );
          break;
        }
        case TransactionTypes.earnWithdraw: {
          const withdrawnAsset = tx.typeData.withdrawn[0];

          const isWithdrawingAsset = BigInt(withdrawnAsset.amount) > 0n;

          const isWithdrawingRewards = tx.typeData.withdrawn.some(
            (withdraw) => withdraw.token.address !== withdrawnAsset.token.address && BigInt(withdraw.amount) > 0n
          );

          const inlcudePlusSign = isWithdrawingRewards && isWithdrawingAsset;

          message = intl.formatMessage(
            defineMessage({
              description: 'transactionRejected.earn.withdraw',
              defaultMessage: 'Withdrawing {asset}{plusRewards}',
            }),
            {
              asset: isWithdrawingAsset
                ? `${formatCurrencyAmount({
                    amount: BigInt(withdrawnAsset.amount),
                    token: withdrawnAsset.token,
                    intl,
                  })} ${withdrawnAsset.token.symbol}`
                : '',
              plusRewards: isWithdrawingRewards
                ? `${inlcudePlusSign ? '+' : ''} ${intl.formatMessage(
                    defineMessage({
                      description: 'transactionRejected.earn.withdraw.plusRewards',
                      defaultMessage: 'Rewards',
                    })
                  )}`
                : '',
            }
          );
          break;
        }
        default:
          break;
      }

      return `${message} has been canceled or gas price has changed. If you have changed the gas price, once the transaction finishes you can reload the app and see your changes reflected.`;
    },
    [currentPositions, pastPositions]
  );
}

export default useBuildTransactionMessages;
