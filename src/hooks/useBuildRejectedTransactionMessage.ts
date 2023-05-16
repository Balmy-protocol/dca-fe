import React from 'react';
import find from 'lodash/find';
import { TransactionDetails, Position, TransactionTypes } from '@types';
import { STRING_SWAP_INTERVALS } from '@constants';
import useAvailablePairs from '@hooks/useAvailablePairs';
import { getFrequencyLabel } from '@common/utils/parsing';
import { BigNumber } from 'ethers/lib/ethers';
import { formatCurrencyAmount } from '@common/utils/currency';
import { useIntl, defineMessage } from 'react-intl';
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
      let message = 'Transaction confirmed!';
      switch (tx.type) {
        case TransactionTypes.wrap: {
          const swapTypeData = tx.typeData;

          message = `Wrapping ${swapTypeData.amountFrom} ${swapTypeData.from} for ${swapTypeData.amountTo} ${swapTypeData.to}`;
          break;
        }
        case TransactionTypes.unwrap: {
          const swapTypeData = tx.typeData;

          message = `Unwrapping ${swapTypeData.amountFrom} ${swapTypeData.from} for ${swapTypeData.amountTo} ${swapTypeData.to}`;
          break;
        }
        case TransactionTypes.swap: {
          const swapTypeData = tx.typeData;

          message = `Swapping ${swapTypeData.amountFrom} ${swapTypeData.from} for ${swapTypeData.amountTo} ${swapTypeData.to}`;
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
        case TransactionTypes.addFundsPosition: {
          const addFundsTypeData = tx.typeData;
          const fundedPosition = find(positions, { id: addFundsTypeData.id });
          if (fundedPosition) {
            message = `Adding ${addFundsTypeData.newFunds} ${(fundedPosition as Position).from.symbol} to your ${
              (fundedPosition as Position).from.symbol
            }:${(fundedPosition as Position).to.symbol} position`;
          }
          break;
        }
        case TransactionTypes.resetPosition: {
          const resetPositionTypeData = tx.typeData;
          const resettedPosition = find(positions, { id: resetPositionTypeData.id });
          if (resettedPosition) {
            message = `Adding ${resetPositionTypeData.newFunds} ${(resettedPosition as Position).from.symbol} to your ${
              (resettedPosition as Position).from.symbol
            }:${(resettedPosition as Position).to.symbol} position and setting it to run for ${
              resetPositionTypeData.newSwaps
            } ${getFrequencyLabel(
              intl,
              (resettedPosition as Position).swapInterval.toString(),
              resetPositionTypeData.newSwaps
            )}`;
          }
          break;
        }
        case TransactionTypes.removeFunds: {
          const removeFundsTypeData = tx.typeData;
          const removeFundedPosition = find(positions, { id: removeFundsTypeData.id });
          if (removeFundedPosition) {
            message = `Removing ${removeFundsTypeData.ammountToRemove} ${
              (removeFundedPosition as Position).from.symbol
            } from your ${(removeFundedPosition as Position).from.symbol}:${
              (removeFundedPosition as Position).to.symbol
            } position`;
          }
          break;
        }

        case TransactionTypes.modifySwapsPosition: {
          const modifySwapsPositionTypeData = tx.typeData;
          const modifiedPosition = find(positions, { id: modifySwapsPositionTypeData.id });
          if (modifiedPosition) {
            message = `Setting your ${(modifiedPosition as Position).from.symbol}:${
              (modifiedPosition as Position).to.symbol
            } position to run for ${modifySwapsPositionTypeData.newSwaps} ${getFrequencyLabel(
              intl,
              (modifiedPosition as Position).swapInterval.toString(),
              modifySwapsPositionTypeData.newSwaps
            )}`;
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
        case TransactionTypes.migratePosition: {
          const transferedTypeData = tx.typeData;
          message = `Migrating your ${transferedTypeData.from}:${transferedTypeData.to} position`;
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
        case TransactionTypes.newPair: {
          const newPairTypeData = tx.typeData;
          message = `Creating the pair ${newPairTypeData.token0.symbol}:${newPairTypeData.token1.symbol}`;
          break;
        }
        case TransactionTypes.approveToken: {
          const tokenApprovalTypeData = tx.typeData;
          message = `Approving your ${tokenApprovalTypeData.token.symbol}`;
          break;
        }
        case TransactionTypes.approveTokenExact: {
          const tokenApprovalExactTypeData = tx.typeData;
          message = `Approving ${formatCurrencyAmount(
            BigNumber.from(tokenApprovalExactTypeData.amount),
            tokenApprovalExactTypeData.token,
            4
          )} ${tokenApprovalExactTypeData.token.symbol}`;
          break;
        }
        case TransactionTypes.eulerClaimClaimFromMigrator: {
          const eulerClaimClaimFromMigratorTypeData = tx.typeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionRejectedEulerClaimClaimFromMigrator',
              defaultMessage: 'Claiming your due for {token} from the Euler Claim page',
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
              description: 'transactionRejectedEulerClaimPermitMany',
              defaultMessage: 'Allowing Mean Finance to close {positions} positions',
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
              description: 'transactionRejectedEulerClaimTerminateMany',
              defaultMessage: 'Closing {positions} positions',
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

      return `${message} has been canceled or gas price has changed. If you have changed the gas price, once the transaction finishes you can reload the app and see your changes reflected.`;
    },
    [availablePairs, currentPositions, pastPositions]
  );
}

export default useBuildTransactionMessages;
