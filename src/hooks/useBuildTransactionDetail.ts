import React from 'react';
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
} from 'types';
import { TRANSACTION_TYPES } from 'config/constants';
import useAvailablePairs from 'hooks/useAvailablePairs';
import useCurrentPositions from './useCurrentPositions';
import usePastPositions from './usePastPositions';
import { STRING_SWAP_INTERVALS } from 'utils/parsing';
import useTokenList from './useTokenList';

function useBuildTransactionDetail() {
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

          message = `Create ${newPositionTypeData.from.symbol}:${newPositionTypeData.to.symbol} position`;
          break;
        case TRANSACTION_TYPES.TERMINATE_POSITION:
          const terminatePositionTypeData = tx.typeData as TerminatePositionTypeData;
          const terminatedPosition = find(positions, { id: terminatePositionTypeData.id });
          if (terminatedPosition) {
            message = `Terminate ${tokenList[(terminatedPosition as PositionRaw).from].symbol}:${
              tokenList[(terminatedPosition as PositionRaw).to].symbol
            } position`;
          }
          break;
        case TRANSACTION_TYPES.WITHDRAW_POSITION:
          const withdrawPositionTypeData = tx.typeData as WithdrawTypeData;
          const withdrawnPosition = find(positions, { id: withdrawPositionTypeData.id });
          if (withdrawnPosition) {
            message = `Withdraw from ${tokenList[(withdrawnPosition as PositionRaw).from].symbol}:${
              tokenList[(withdrawnPosition as PositionRaw).to].symbol
            } position`;
          }
          break;
        case TRANSACTION_TYPES.ADD_FUNDS_POSITION:
          const addFundsTypeData = tx.typeData as AddFundsTypeData;
          const fundedPosition = find(positions, { id: addFundsTypeData.id });
          if (fundedPosition) {
            message = `Add ${addFundsTypeData.newFunds} ${
              tokenList[(fundedPosition as PositionRaw).from].symbol
            } to the ${tokenList[(fundedPosition as PositionRaw).from].symbol}:${
              tokenList[(fundedPosition as PositionRaw).to].symbol
            } position`;
          }
          break;
        case TRANSACTION_TYPES.REMOVE_FUNDS:
          const removeFundsTypeData = tx.typeData as RemoveFundsTypeData;
          const removeFundedPosition = find(positions, { id: removeFundsTypeData.id });
          if (removeFundedPosition) {
            message = `Remove ${removeFundsTypeData.ammountToRemove} ${
              tokenList[(removeFundedPosition as PositionRaw).from].symbol
            } from the ${tokenList[(removeFundedPosition as PositionRaw).from].symbol}:${
              tokenList[(removeFundedPosition as PositionRaw).to].symbol
            } position`;
          }
          break;

        case TRANSACTION_TYPES.MODIFY_RATE_POSITION:
          const modifyRatePositionTypeData = tx.typeData as ModifyRatePositionTypeData;
          const modifiedPosition = find(positions, { id: modifyRatePositionTypeData.id });
          if (modifiedPosition) {
            message = `Modify ${tokenList[(modifiedPosition as PositionRaw).from].symbol}:${
              tokenList[(modifiedPosition as PositionRaw).to].symbol
            } position to run for ${modifyRatePositionTypeData.newRate} ${
              STRING_SWAP_INTERVALS[
                (modifiedPosition as PositionRaw).swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS
              ]
            }`;
          }
          break;
        case TRANSACTION_TYPES.NEW_PAIR:
          const newPairTypeData = tx.typeData as NewPairTypeData;
          message = `Create ${tokenList[newPairTypeData.token0].symbol}:${
            tokenList[newPairTypeData.token1].symbol
          } pair`;
          break;
        case TRANSACTION_TYPES.APPROVE_TOKEN:
          const tokenApprovalTypeData = tx.typeData as ApproveTokenTypeData;
          const pair = find(availablePairs, { id: tokenApprovalTypeData.pair });
          if (pair) {
            message = `Approve ${tokenList[tokenApprovalTypeData.id].symbol} to be used in the pair ${
              tokenList[pair.token0].symbol
            }:${tokenList[pair.token1].symbol}`;
          } else {
            message = `Approve ${tokenList[tokenApprovalTypeData.id].symbol}`;
          }
          break;
      }

      if (message === 'Transaction confirmed!') {
        console.log(tx.type);
      }
      return message;
    },
    [availablePairs, tokenList, currentPositions, pastPositions]
  );
}

export default useBuildTransactionDetail;
