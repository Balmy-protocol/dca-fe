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
  ApproveTokenTypeData,
  ResetPositionTypeData,
} from 'types';
import { TRANSACTION_TYPES } from 'config/constants';
import useAvailablePairs from 'hooks/useAvailablePairs';
import useCurrentPositions from './useCurrentPositions';
import usePastPositions from './usePastPositions';
import { STRING_SWAP_INTERVALS } from 'utils/parsing';
import useTokenList from './useTokenList';

function useBuildTransactionMessages() {
  const tokenList = useTokenList();
  const availablePairs = useAvailablePairs();
  const currentPositions = useCurrentPositions();
  const pastPositions = usePastPositions();

  const positions = React.useMemo(() => [...pastPositions, ...currentPositions], [currentPositions, pastPositions]);

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
          const terminatedPosition = find(positions, { id: terminatePositionTypeData.id });
          if (terminatedPosition) {
            message = `Your ${tokenList[(terminatedPosition as PositionRaw).from].symbol}:${
              tokenList[(terminatedPosition as PositionRaw).to].symbol
            } position has been terminated`;
          }
          break;
        case TRANSACTION_TYPES.WITHDRAW_POSITION:
          const withdrawPositionTypeData = tx.typeData as WithdrawTypeData;
          const withdrawnPosition = find(positions, { id: withdrawPositionTypeData.id });
          if (withdrawnPosition) {
            message = `You have withdrawn from your ${tokenList[(withdrawnPosition as PositionRaw).from].symbol}:${
              tokenList[(withdrawnPosition as PositionRaw).to].symbol
            } position`;
          }
          break;
        case TRANSACTION_TYPES.ADD_FUNDS_POSITION:
          const addFundsTypeData = tx.typeData as AddFundsTypeData;
          const fundedPosition = find(positions, { id: addFundsTypeData.id });
          if (fundedPosition) {
            message = `${addFundsTypeData.newFunds} ${
              tokenList[(fundedPosition as PositionRaw).from].symbol
            } have been added to your ${tokenList[(fundedPosition as PositionRaw).from].symbol}:${
              tokenList[(fundedPosition as PositionRaw).to].symbol
            } position`;
          }
          break;
        case TRANSACTION_TYPES.ADD_FUNDS_POSITION:
          const resetPositionTypeData = tx.typeData as ResetPositionTypeData;
          const resettedPosition = find(positions, { id: resetPositionTypeData.id });
          if (resettedPosition) {
            message = `${resetPositionTypeData.newFunds} ${
              tokenList[(resettedPosition as PositionRaw).from].symbol
            } have been added to your ${tokenList[(resettedPosition as PositionRaw).from].symbol}:${
              tokenList[(resettedPosition as PositionRaw).to].symbol
            } position and it has been set to run for ${resetPositionTypeData.newSwaps} ${
              STRING_SWAP_INTERVALS[
                (resettedPosition as PositionRaw).swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS
              ]
            }`;
          }
          break;
        case TRANSACTION_TYPES.REMOVE_FUNDS:
          const removeFundsTypeData = tx.typeData as RemoveFundsTypeData;
          const removeFundedPosition = find(positions, { id: removeFundsTypeData.id });
          if (removeFundedPosition) {
            message = `${removeFundsTypeData.ammountToRemove} ${
              tokenList[(removeFundedPosition as PositionRaw).from].symbol
            } have been removed from your ${tokenList[(removeFundedPosition as PositionRaw).from].symbol}:${
              tokenList[(removeFundedPosition as PositionRaw).to].symbol
            } position`;
          }
          break;

        case TRANSACTION_TYPES.MODIFY_RATE_POSITION:
          const modifyRatePositionTypeData = tx.typeData as ModifyRatePositionTypeData;
          const modifiedPosition = find(positions, { id: modifyRatePositionTypeData.id });
          if (modifiedPosition) {
            message = `Your ${tokenList[(modifiedPosition as PositionRaw).from].symbol}:${
              tokenList[(modifiedPosition as PositionRaw).to].symbol
            } position has now been set to run for ${modifyRatePositionTypeData.newRate} ${
              STRING_SWAP_INTERVALS[
                (modifiedPosition as PositionRaw).swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS
              ]
            }`;
          }
          break;
        case TRANSACTION_TYPES.NEW_PAIR:
          const newPairTypeData = tx.typeData as NewPairTypeData;
          message = `The pair ${tokenList[newPairTypeData.token0].symbol}:${
            tokenList[newPairTypeData.token1].symbol
          } has been created`;
          break;
        case TRANSACTION_TYPES.APPROVE_TOKEN:
          const tokenApprovalTypeData = tx.typeData as ApproveTokenTypeData;
          const pair = find(availablePairs, { id: tokenApprovalTypeData.pair });
          if (pair) {
            message = `${tokenList[tokenApprovalTypeData.id].symbol} is now ready to be used in the pair ${
              tokenList[pair.token0].symbol
            }:${tokenList[pair.token1].symbol}`;
          } else {
            message = `${tokenList[tokenApprovalTypeData.id].symbol} is now ready to be used`;
          }
          break;
      }

      return message;
    },
    [availablePairs, tokenList, currentPositions, pastPositions]
  );
}

export default useBuildTransactionMessages;
