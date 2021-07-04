import React from 'react';
import WalletContext from 'common/wallet-context';
import find from 'lodash/find';
import {
  TransactionDetails,
  NewPositionTypeData,
  TerminatePositionTypeData,
  WithdrawTypeData,
  AddFundsTypeData,
  RemoveFundsTypeData,
  ModifyRatePositionTypeData,
  NewPairTypeData,
  PositionRaw,
} from 'types';
import { TRANSACTION_TYPES } from 'config/constants';
import useAvailablePairs from 'hooks/useAvailablePairs';
import useCurrentPositions from './useCurrentPositions';
import usePastPositions from './usePastPositions';
import { STRING_SWAP_INTERVALS } from 'utils/parsing';

function useBuildTransactionMessages() {
  const { tokenList } = React.useContext(WalletContext);
  const availablePairs = useAvailablePairs();
  const currentPositions = useCurrentPositions();
  const pastPositions = usePastPositions();

  return React.useCallback(
    (tx: TransactionDetails) => {
      let message = 'Transaction confirmed!';
      switch (tx.type) {
        case TRANSACTION_TYPES.NEW_POSITION:
          const newPositionTypeData = tx.typeData as NewPositionTypeData;

          message = `Your new ${newPositionTypeData.from.symbol}:${newPositionTypeData.to.symbol} position has been created`;
          break;
        case TRANSACTION_TYPES.TERMINATE_POSITION:
          const terminatePositionTypeData = tx.typeData as TerminatePositionTypeData;
          const terminatedPosition = find(pastPositions, { id: terminatePositionTypeData.id });
          if (terminatedPosition) {
            message = `Your ${tokenList[(terminatedPosition as PositionRaw).from].symbol}:${
              tokenList[(terminatedPosition as PositionRaw).to].symbol
            } position has been terminated`;
          }
          break;
        case TRANSACTION_TYPES.WITHDRAW_POSITION:
          const withdrawPositionTypeData = tx.typeData as WithdrawTypeData;
          const withdrawnPosition = find(currentPositions, { id: withdrawPositionTypeData.id });
          if (withdrawnPosition) {
            message = `You have withdrawn from your ${tokenList[(withdrawnPosition as PositionRaw).from].symbol}:${
              tokenList[(withdrawnPosition as PositionRaw).to].symbol
            } position`;
          }
          break;
        case TRANSACTION_TYPES.ADD_FUNDS_POSITION:
          const addFundsTypeData = tx.typeData as AddFundsTypeData;
          const fundedPosition = find(currentPositions, { id: addFundsTypeData.id });
          if (fundedPosition) {
            message = `${addFundsTypeData.newFunds} ${
              tokenList[(withdrawnPosition as PositionRaw).from].symbol
            } have been added to your ${tokenList[(withdrawnPosition as PositionRaw).from]}:${
              tokenList[(withdrawnPosition as PositionRaw).to]
            } position`;
          }
          break;
        case TRANSACTION_TYPES.REMOVE_FUNDS:
          const removeFundsTypeData = tx.typeData as RemoveFundsTypeData;
          const removeFundedPosition = find(currentPositions, { id: removeFundsTypeData.id });
          if (removeFundedPosition) {
            message = `${removeFundsTypeData.ammountToRemove} ${
              tokenList[(withdrawnPosition as PositionRaw).from].symbol
            } have been removed from your ${tokenList[(withdrawnPosition as PositionRaw).from]}:${
              tokenList[(withdrawnPosition as PositionRaw).to]
            } position`;
          }
        case TRANSACTION_TYPES.MODIFY_RATE_POSITION:
          const modifyRatePositionTypeData = tx.typeData as ModifyRatePositionTypeData;
          const modifiedPosition = find(currentPositions, { id: modifyRatePositionTypeData.id });
          if (modifiedPosition) {
            message = `Your ${tokenList[(withdrawnPosition as PositionRaw).from]}:${
              tokenList[(withdrawnPosition as PositionRaw).to]
            } position has now been set to run for ${modifyRatePositionTypeData.newRate} ${
              STRING_SWAP_INTERVALS[
                (withdrawnPosition as PositionRaw).swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS
              ]
            }`;
          }
          break;
        case TRANSACTION_TYPES.NEW_PAIR:
          const newPairTypeData = tx.typeData as NewPairTypeData;
          break;
      }

      return message;
    },
    [availablePairs, tokenList, currentPositions, pastPositions]
  );
}

export default useBuildTransactionMessages;
