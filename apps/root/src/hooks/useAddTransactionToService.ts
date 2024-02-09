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
  DCAWithdrawnApiEvent,
  DCAModifiedApiEvent,
  BaseDcaApiDataEvent,
  DCACreatedApiEvent,
  DCAPermissionsModifiedApiEvent,
  DCATransferApiEvent,
  DCATerminatedApiEvent,
} from 'common-types';
import { TransactionReceipt, maxUint256, parseUnits } from 'viem';
import { PROTOCOL_TOKEN_ADDRESS, getProtocolToken } from '@common/mocks/tokens';
import { parseUsdPrice } from '@common/utils/currency';
import { DCA_TYPE_TRANSACTIONS, HUB_ADDRESS } from '@constants';
import { fromPairs } from 'lodash';

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
        timestamp: tx.addedTime / 1000,
        spentInGas: receipt.gasUsed.toString(),
        nativePrice: nativePrice,
        initiatedBy: tx.from as Address,
      },
    };

    let transactionEvent: TransactionApiEvent;

    let dcaBaseEventData: BaseDcaApiDataEvent = {
      hub: 'hub',
      positionId: '0',
      fromToken: { token: { address: '0xaddress', variant: { id: '0xaddress', type: 'original' } } },
      toToken: { token: { address: '0xaddress', variant: { id: '0xaddress', type: 'original' } } },
    };

    if (DCA_TYPE_TRANSACTIONS.includes(tx.type)) {
      if (!tx.position) return;

      dcaBaseEventData = {
        hub: HUB_ADDRESS[tx.position.version][tx.chainId],
        positionId: tx.position.positionId.toString(),
        fromToken: {
          token: { address: tx.position.from.address, variant: { id: tx.position.from.address, type: 'original' } },
        },
        toToken: {
          token: { address: tx.position.to.address, variant: { id: tx.position.to.address, type: 'original' } },
        },
      };
    }

    switch (tx.type) {
      case TransactionTypes.approveToken:
      case TransactionTypes.approveTokenExact:
        const approvalEvent: BaseApiEvent & ERC20ApprovalApiEvent = {
          ...baseEvent,
          data: {
            token: tx.typeData.token.address,
            owner: tx.from as Address,
            spender: tx.typeData.addressFor as Address,
            amount: tx.type === TransactionTypes.approveToken ? maxUint256.toString() : tx.typeData.amount,
          },
          type: TransactionEventTypes.ERC20_APPROVAL,
        };

        transactionEvent = approvalEvent;
        break;
      case TransactionTypes.withdrawPosition:
        if (!tx.position) return;

        const withdrawEvent: BaseApiEvent & DCAWithdrawnApiEvent = {
          ...baseEvent,
          data: {
            ...dcaBaseEventData,
            withdrawn: tx.typeData.withdrawnUnderlying,
            withdrawnYield: undefined,
          },
          type: TransactionEventTypes.DCA_WITHDRAW,
        };

        transactionEvent = withdrawEvent;
        break;
      case TransactionTypes.terminatePosition:
        if (!tx.position) return;

        const terminateEvent: BaseApiEvent & DCATerminatedApiEvent = {
          ...baseEvent,
          data: {
            ...dcaBaseEventData,
            withdrawnRemaining: tx.typeData.remainingLiquidity,
            withdrawnSwapped: tx.typeData.toWithdraw,
          },
          type: TransactionEventTypes.DCA_WITHDRAW,
        };

        transactionEvent = terminateEvent;
        break;
      case TransactionTypes.modifyRateAndSwapsPosition:
        if (!tx.position) return;

        const modifyEvent: BaseApiEvent & DCAModifiedApiEvent = {
          ...baseEvent,
          data: {
            ...dcaBaseEventData,
            oldRate: tx.position.rate.toString(),
            oldRemainingSwaps: Number(tx.position.remainingSwaps),
            rate: parseUnits(tx.typeData.newRate, tx.position.from.decimals).toString(),
            remainingSwaps: Number(tx.typeData.newSwaps),
          },
          type: TransactionEventTypes.DCA_MODIFIED,
        };

        transactionEvent = modifyEvent;
        break;
      case TransactionTypes.newPosition:
        if (!tx.position) return;

        const rate = parseUnits(tx.typeData.fromValue, tx.typeData.from.decimals);
        const createEvent: BaseApiEvent & DCACreatedApiEvent = {
          ...baseEvent,
          data: {
            ...dcaBaseEventData,
            rate: rate.toString(),
            swaps: Number(tx.typeData.frequencyValue),
            owner: tx.from as Address,
            permissions: {},
            swapInterval: Number(tx.typeData.frequencyType),
          },
          type: TransactionEventTypes.DCA_CREATED,
        };

        transactionEvent = createEvent;
        break;
      case TransactionTypes.modifyPermissions:
        if (!tx.position) return;

        const permissionsModifiedEvent: BaseApiEvent & DCAPermissionsModifiedApiEvent = {
          ...baseEvent,
          data: {
            ...dcaBaseEventData,
            permissions: fromPairs(tx.typeData.permissions.map(({ operator, permissions }) => [operator, permissions])),
          },
          type: TransactionEventTypes.DCA_PERMISSIONS_MODIFIED,
        };

        transactionEvent = permissionsModifiedEvent;
        break;
      case TransactionTypes.transferPosition:
        if (!tx.position) return;

        const dcaTransferEvent: BaseApiEvent & DCATransferApiEvent = {
          ...baseEvent,
          data: {
            ...dcaBaseEventData,
            from: tx.typeData.from as Address,
            to: tx.typeData.toAddress as Address,
          },
          type: TransactionEventTypes.DCA_TRANSFER,
        };

        transactionEvent = dcaTransferEvent;
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
