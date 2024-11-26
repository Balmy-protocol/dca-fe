import React from 'react';
import find from 'lodash/find';
import { TransactionDetails, Position, TransactionTypes, WithdrawType } from '@types';
import { STRING_SWAP_INTERVALS } from '@constants';
import { formatCurrencyAmount } from '@common/utils/currency';

import { defineMessage, useIntl } from 'react-intl';
import { getWrappedProtocolToken } from '@common/mocks/tokens';
import { getFrequencyLabel, trimAddress } from '@common/utils/parsing';
import useCurrentPositions from './useCurrentPositions';
import usePastPositions from './usePastPositions';
import { formatUnits, isAddress } from 'viem';

function useBuildTransactionMessages() {
  const { currentPositions } = useCurrentPositions();
  const { pastPositions } = usePastPositions();
  const intl = useIntl();

  const positions = React.useMemo(() => [...pastPositions, ...currentPositions], [currentPositions, pastPositions]);

  return React.useCallback(
    (tx: TransactionDetails) => {
      let message = intl.formatMessage(
        defineMessage({
          description: 'transactionMessagesConfirmed',
          defaultMessage: 'Transaction Confirmed',
        })
      );
      switch (tx.type) {
        case TransactionTypes.swap: {
          const swapTypeData = tx.typeData;

          message = `Swapped ${formatCurrencyAmount({
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
        case TransactionTypes.newPosition: {
          const newPositionTypeData = tx.typeData;

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
        case TransactionTypes.terminatePosition: {
          const terminatePositionTypeData = tx.typeData;
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
        case TransactionTypes.withdrawFunds: {
          const withdrawFundsPositionTypeData = tx.typeData;
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
        case TransactionTypes.modifyRateAndSwapsPosition: {
          const modifyRateAndSwapsPositionTypeData = tx.typeData;
          const modifiedRatePosition = find(positions, { id: modifyRateAndSwapsPositionTypeData.id });
          const swapInterval = BigInt((modifiedRatePosition as Position).swapInterval);

          if (modifiedRatePosition) {
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionMessagesModifyRateAndSwaps',
                defaultMessage: 'Your {from}:{to} position has now been set to swap {rate} {freq} for {swaps}',
              }),
              {
                from: (modifiedRatePosition as Position).from.symbol,
                to: (modifiedRatePosition as Position).to.symbol,
                rate: formatUnits(
                  BigInt(modifyRateAndSwapsPositionTypeData.newRate),
                  modifyRateAndSwapsPositionTypeData.decimals
                ),
                freq: intl.formatMessage(
                  STRING_SWAP_INTERVALS[swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].every
                ),
                swaps: getFrequencyLabel(intl, swapInterval.toString(), modifyRateAndSwapsPositionTypeData.newSwaps),
              }
            );
          }
          break;
        }
        case TransactionTypes.transferPosition: {
          const transferedTypeData = tx.typeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesTransfer',
              defaultMessage: 'Your {from}:{to} has now been transfered to {address}',
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
        case TransactionTypes.approveCompanion: {
          const approveCompanionTypeData = tx.typeData;
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
        case TransactionTypes.migratePositionYield: {
          const approveCompanionTypeData = tx.typeData;
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
        case TransactionTypes.approveToken: {
          const tokenApprovalTypeData = tx.typeData;
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
        case TransactionTypes.approveTokenExact: {
          const tokenApprovalExactTypeData = tx.typeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesApproveTokenExact',
              defaultMessage: 'You are now ready to use {amount} {from}',
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
              defaultMessage: 'The {campaign} campaign has been claimed',
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
              defaultMessage: 'You have transfered {amount} {symbol} to {to}',
            }),
            {
              amount: formatCurrencyAmount({ amount: BigInt(amount), token, sigFigs: 4, intl }),
              symbol: token.symbol,
              to: isAddress(to) ? trimAddress(to) : to,
            }
          );
          break;
        }
        case TransactionTypes.earnCreate: {
          const { asset, assetAmount } = tx.typeData;

          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessages.earn.create',
              defaultMessage: 'You have invested {amount} {symbol}',
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
              description: 'transactionMessages.earn.increase',
              defaultMessage: 'You have increased your investment by {amount} {symbol}',
            }),
            {
              amount: formatCurrencyAmount({ amount: BigInt(assetAmount), token: asset, sigFigs: 4, intl }),
              symbol: asset.symbol,
            }
          );
          break;
        }
        case TransactionTypes.earnWithdraw: {
          const withdrawnAsset = tx.typeData.withdrawn[0];
          const isWithdrawingAsset = BigInt(withdrawnAsset.amount) > 0n;
          const isDelayedWithdrawal = isWithdrawingAsset && withdrawnAsset.withdrawType === WithdrawType.DELAYED;

          if (isDelayedWithdrawal) {
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionMessages.earn.delayed-withdraw',
                defaultMessage: 'Your {asset} withdrawal has been initiated',
              }),
              { asset: withdrawnAsset.token.symbol }
            );
            break;
          }

          const isWithdrawingRewards = tx.typeData.withdrawn.some(
            (withdraw) => withdraw.token.address !== withdrawnAsset.token.address && BigInt(withdraw.amount) > 0n
          );

          const includePlusSign = isWithdrawingRewards && isWithdrawingAsset;

          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessages.earn.withdraw',
              defaultMessage: 'You have withdrawn {asset}{plusRewards} from your investment',
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
                ? `${includePlusSign ? '+' : ''} ${intl.formatMessage(
                    defineMessage({
                      description: 'transactionMessages.earn.withdraw.plusRewards',
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

      return message;
    },
    [currentPositions, pastPositions]
  );
}

export default useBuildTransactionMessages;
