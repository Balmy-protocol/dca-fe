import React from 'react';
import usePriceService from './usePriceService';
import useTransactionService from './useTransactionService';
import {
  BaseApiEvent,
  TransactionApiEvent,
  TransactionDetails,
  TransactionTypes,
  ERC20ApprovalApiEvent,
  Address,
  TransactionEventTypes,
  ERC20TransferApiEvent,
  NativeTransferApiEvent,
} from 'common-types';
import { TransactionReceipt, maxUint256 } from 'viem';
import { PROTOCOL_TOKEN_ADDRESS, getProtocolToken } from '@common/mocks/tokens';
import { parseUsdPrice } from '@common/utils/currency';

const useAddTransactionToService = () => {
  const transactionService = useTransactionService();
  const priceService = usePriceService();

  return React.useCallback(async (receipt: TransactionReceipt, tx: TransactionDetails) => {
    const protocolToken = getProtocolToken(tx.chainId);
    const nativeBasePrice = await priceService.getUsdHistoricPrice([protocolToken], undefined, tx.chainId);
    const nativePrice = parseUsdPrice(protocolToken, 10n ** 18n, nativeBasePrice[protocolToken.address]);
    // Building the transaciton event
    const baseEvent: BaseApiEvent = {
      tx: {
        chainId: tx.chainId,
        txHash: tx.hash as Address,
        // we want it in seconds
        timestamp: Date.now() / 1000,
        spentInGas: receipt.gasUsed.toString(),
        nativePrice: nativePrice,
        initiatedBy: tx.from as Address,
      },
    };

    let transactionEvent: TransactionApiEvent;

    switch (tx.type) {
      case TransactionTypes.approveToken:
        const approvalEvent: BaseApiEvent & ERC20ApprovalApiEvent = {
          ...baseEvent,
          data: {
            token: tx.typeData.token.address,
            owner: tx.from as Address,
            spender: tx.typeData.addressFor as Address,
            amount: maxUint256.toString(),
          },
          type: TransactionEventTypes.ERC20_APPROVAL,
        };

        transactionEvent = approvalEvent;
        break;
      case TransactionTypes.transferToken:
        if (tx.typeData.token.address === PROTOCOL_TOKEN_ADDRESS) {
          const transferEvent: BaseApiEvent & NativeTransferApiEvent = {
            ...baseEvent,
            data: {
              from: tx.from as Address,
              to: tx.typeData.to as Address,
              amount: tx.typeData.amount,
            },
            type: TransactionEventTypes.NATIVE_TRANSFER,
          };

          transactionEvent = transferEvent;
        } else {
          const tokenBasePrice = await priceService.getUsdHistoricPrice([tx.typeData.token], undefined, tx.chainId);
          const tokenPrice = parseUsdPrice(
            tx.typeData.token,
            10n ** BigInt(tx.typeData.token.decimals),
            tokenBasePrice[tx.typeData.token.address]
          );
          const transferEvent: BaseApiEvent & ERC20TransferApiEvent = {
            ...baseEvent,
            data: {
              token: tx.typeData.token.address,
              from: tx.from as Address,
              to: tx.typeData.to as Address,
              tokenPrice: tokenPrice,
              amount: tx.typeData.amount,
            },
            type: TransactionEventTypes.ERC20_TRANSFER,
          };

          transactionEvent = transferEvent;
        }

        break;
      default:
        return;
    }

    transactionService.addTransactionToHistory(transactionEvent);
  }, []);
};

export default useAddTransactionToService;
