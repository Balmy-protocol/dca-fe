import React from 'react';
import WalletContext from 'common/wallet-context';
import {
  TransactionDetails,
  NewPositionTypeData,
  TerminatePositionTypeData,
  WithdrawTypeData,
  AddFundsTypeData,
  RemoveFundsTypeData,
  ModifyRatePositionTypeData,
  NewPairTypeData,
} from 'types';
import { TRANSACTION_TYPES } from 'config/constants';
import useAvailablePairs from 'hooks/useAvailablePairs';
import useCurrentPositions from './useCurrentPositions';
import usePastPositions from './usePastPositions';

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
          break;
        case TRANSACTION_TYPES.TERMINATE_POSITION:
          const terminatePositionTypeData = tx.typeData as TerminatePositionTypeData;
          break;
        case TRANSACTION_TYPES.WITHDRAW_POSITION:
          const withdrawPositionTypeData = tx.typeData as WithdrawTypeData;
          break;
        case TRANSACTION_TYPES.ADD_FUNDS_POSITION:
          const addFundsTypeData = tx.typeData as AddFundsTypeData;
          break;
        case TRANSACTION_TYPES.REMOVE_FUNDS:
          const removeFundsTypeData = tx.typeData as RemoveFundsTypeData;
        case TRANSACTION_TYPES.MODIFY_RATE_POSITION:
          const modifyRatePositionTypeData = tx.typeData as ModifyRatePositionTypeData;
          break;
        case TRANSACTION_TYPES.NEW_PAIR:
          const newPairTypeData = tx.typeData as NewPairTypeData;
          break;
      }

      return message;
    },
    [availablePairs, tokenList]
  );
}

export default useBuildTransactionMessages;
