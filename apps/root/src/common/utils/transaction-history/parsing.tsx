import TokenIcon from '@common/components/token-icon';
import { getProtocolToken } from '@common/mocks/tokens';
import { DCA_TYPE_EVENTS, NETWORKS, getGhTokenListLogoUrl } from '@constants';
import { unwrapResult } from '@reduxjs/toolkit';
import { fetchTokenDetails } from '@state/token-lists/actions';
import {
  TransactionApiEvent,
  TokenListByChainId,
  TransactionEvent,
  NetworkStruct,
  Token,
  BaseDcaDataEvent,
  BaseApiEvent,
  DcaTransactionApiDataEvent,
  TransactionEventTypes,
  TransactionStatus,
  TransactionEventIncomingTypes,
  DCAModifiedEvent,
  DCACreatedEvent,
  DCACreatedApiEvent,
  BaseEvent,
  ERC20ApprovalApiEvent,
  ERC20TransferApiEvent,
  ERC20ApprovalEvent,
  ERC20TransferEvent,
  NativeTransferApiEvent,
  NativeTransferEvent,
  DCAWithdrawnApiEvent,
  DCAWithdrawnEvent,
  DCAModifiedApiEvent,
  DCAPermissionsModifiedApiEvent,
  DCAPermissionsModifiedEvent,
  DCATransferApiEvent,
  DCATransferEvent,
  DCATerminatedApiEvent,
  DCATerminatedEvent,
} from 'common-types';
import { find, fromPairs, isUndefined } from 'lodash';
import { formatUnits, parseUnits } from 'viem';
import { toToken as getToToken, formatCurrencyAmount } from '../currency';
import { buildEtherscanTransaction } from '../etherscan';
import React from 'react';
import { getTransactionTokenFlow } from '.';
import { useAppDispatch } from '@hooks/state';

interface ParseParams<T> {
  event: T;
  dispatch: ReturnType<typeof useAppDispatch>;
  tokenList: TokenListByChainId;
  userWallets: string[];
  dcaBaseEventData: BaseDcaDataEvent;
  baseEvent: BaseEvent;
}

type ParseFunction<T, K> = (params: ParseParams<T>) => Promise<K>;

const parseDcaCreatedApiEvent: ParseFunction<DCACreatedApiEvent, DCACreatedEvent> = ({
  event,
  userWallets,
  dcaBaseEventData,
  baseEvent,
}) => {
  const funds = BigInt(event.data.rate) * BigInt(event.data.swaps);
  const parsedEvent = {
    type: TransactionEventTypes.DCA_CREATED,
    data: {
      ...dcaBaseEventData,
      tokenFlow: TransactionEventIncomingTypes.INCOMING,
      status: TransactionStatus.DONE,
      swaps: event.data.swaps,
      owner: event.data.owner,
      permissions: event.data.permissions,
      swapInterval: event.data.swapInterval,
      rate: {
        amount: event.data.rate,
        amountInUnits: formatCurrencyAmount(BigInt(event.data.rate), dcaBaseEventData.fromToken),
        amountInUSD:
          event.data.fromToken.price === null || isUndefined(event.data.fromToken.price)
            ? undefined
            : parseFloat(
                formatUnits(
                  BigInt(event.data.rate) * parseUnits(event.data.fromToken.price.toString(), 18),
                  dcaBaseEventData.toToken.decimals + 18
                )
              ).toFixed(2),
      },
      funds: {
        amount: funds.toString(),
        amountInUnits: formatCurrencyAmount(BigInt(funds), dcaBaseEventData.fromToken),
        amountInUSD:
          event.data.fromToken.price === null || isUndefined(event.data.fromToken.price)
            ? undefined
            : parseFloat(
                formatUnits(
                  BigInt(funds) * parseUnits(event.data.fromToken.price.toString(), 18),
                  dcaBaseEventData.toToken.decimals + 18
                )
              ).toFixed(2),
      },
    },
    ...baseEvent,
  } as DCACreatedEvent;

  return Promise.resolve({
    ...parsedEvent,
    tokenFlow: getTransactionTokenFlow(parsedEvent, userWallets),
  });
};

const parseDcaModifiedApiEvent: ParseFunction<DCAModifiedApiEvent, DCAModifiedEvent> = ({
  event,
  userWallets,
  dcaBaseEventData,
  baseEvent,
}) => {
  const totalBefore = BigInt(event.data.oldRate) * BigInt(event.data.oldRemainingSwaps);
  const totalNow = BigInt(event.data.rate) * BigInt(event.data.remainingSwaps);

  const difference = (totalBefore > totalNow ? totalBefore - totalNow : totalNow - totalBefore).toString();
  const parsedEvent: DCAModifiedEvent = {
    type: TransactionEventTypes.DCA_MODIFIED,
    data: {
      ...dcaBaseEventData,
      tokenFlow: TransactionEventIncomingTypes.OUTGOING,
      status: TransactionStatus.DONE,
      remainingSwaps: event.data.remainingSwaps,
      oldRemainingSwaps: event.data.oldRemainingSwaps,
      oldRate: {
        amount: event.data.oldRate,
        amountInUnits: formatCurrencyAmount(BigInt(event.data.oldRate), dcaBaseEventData.fromToken),
        amountInUSD:
          event.data.fromToken.price === null || isUndefined(event.data.fromToken.price)
            ? undefined
            : parseFloat(
                formatUnits(
                  BigInt(event.data.oldRate) * parseUnits(event.data.fromToken.price.toString(), 18),
                  dcaBaseEventData.toToken.decimals + 18
                )
              ).toFixed(2),
      },
      difference: {
        amount: difference,
        amountInUnits: formatCurrencyAmount(BigInt(difference), dcaBaseEventData.fromToken),
        amountInUSD:
          event.data.fromToken.price === null || isUndefined(event.data.fromToken.price)
            ? undefined
            : parseFloat(
                formatUnits(
                  BigInt(difference) * parseUnits(event.data.fromToken.price.toString(), 18),
                  dcaBaseEventData.toToken.decimals + 18
                )
              ).toFixed(2),
      },
      rate: {
        amount: event.data.rate,
        amountInUnits: formatCurrencyAmount(BigInt(event.data.rate), dcaBaseEventData.fromToken),
        amountInUSD:
          event.data.fromToken.price === null || isUndefined(event.data.fromToken.price)
            ? undefined
            : parseFloat(
                formatUnits(
                  BigInt(event.data.rate) * parseUnits(event.data.fromToken.price.toString(), 18),
                  dcaBaseEventData.toToken.decimals + 18
                )
              ).toFixed(2),
      },
    },
    ...baseEvent,
  };

  return Promise.resolve({
    ...parsedEvent,
    tokenFlow: getTransactionTokenFlow(parsedEvent, userWallets),
  });
};
const parseDcaWithdrawApiEvent: ParseFunction<DCAWithdrawnApiEvent, DCAWithdrawnEvent> = ({
  event,
  userWallets,
  dcaBaseEventData,
  baseEvent,
}) => {
  const parsedEvent: DCAWithdrawnEvent = {
    type: TransactionEventTypes.DCA_WITHDRAW,
    data: {
      ...dcaBaseEventData,
      tokenFlow: TransactionEventIncomingTypes.INCOMING,
      status: TransactionStatus.DONE,
      withdrawn: {
        amount: event.data.withdrawn,
        amountInUnits: formatCurrencyAmount(BigInt(event.data.withdrawn), dcaBaseEventData.toToken),
        amountInUSD:
          event.data.toToken.price === null || isUndefined(event.data.toToken.price)
            ? undefined
            : parseFloat(
                formatUnits(
                  BigInt(event.data.withdrawn) * parseUnits(event.data.toToken.price.toString(), 18),
                  dcaBaseEventData.toToken.decimals + 18
                )
              ).toFixed(2),
      },
      withdrawnYield:
        (!isUndefined(event.data.withdrawnYield) && {
          amount: event.data.withdrawnYield,
          amountInUnits: formatCurrencyAmount(BigInt(event.data.withdrawnYield), dcaBaseEventData.toToken),
          amountInUSD:
            event.data.toToken.price === null || isUndefined(event.data.toToken.price)
              ? undefined
              : parseFloat(
                  formatUnits(
                    BigInt(event.data.withdrawnYield) * parseUnits(event.data.toToken.price.toString(), 18),
                    dcaBaseEventData.toToken.decimals + 18
                  )
                ).toFixed(2),
        }) ||
        undefined,
    },
    ...baseEvent,
  };

  return Promise.resolve({
    ...parsedEvent,
    tokenFlow: getTransactionTokenFlow(parsedEvent, userWallets),
  });
};

const parseDcaTerminateApiEvent: ParseFunction<DCATerminatedApiEvent, DCATerminatedEvent> = ({
  event,
  userWallets,
  dcaBaseEventData,
  baseEvent,
}) => {
  const parsedEvent: DCATerminatedEvent = {
    type: TransactionEventTypes.DCA_TERMINATED,
    data: {
      ...dcaBaseEventData,
      tokenFlow: TransactionEventIncomingTypes.INCOMING,
      status: TransactionStatus.DONE,
      withdrawnRemaining: {
        amount: event.data.withdrawnRemaining,
        amountInUnits: formatCurrencyAmount(BigInt(event.data.withdrawnRemaining), dcaBaseEventData.fromToken),
        amountInUSD:
          event.data.toToken.price === null || isUndefined(event.data.fromToken.price)
            ? undefined
            : parseFloat(
                formatUnits(
                  BigInt(event.data.withdrawnRemaining) * parseUnits(event.data.fromToken.price.toString(), 18),
                  dcaBaseEventData.fromToken.decimals + 18
                )
              ).toFixed(2),
      },
      withdrawnSwapped: {
        amount: event.data.withdrawnSwapped,
        amountInUnits: formatCurrencyAmount(BigInt(event.data.withdrawnSwapped), dcaBaseEventData.toToken),
        amountInUSD:
          event.data.toToken.price === null || isUndefined(event.data.toToken.price)
            ? undefined
            : parseFloat(
                formatUnits(
                  BigInt(event.data.withdrawnSwapped) * parseUnits(event.data.toToken.price.toString(), 18),
                  dcaBaseEventData.toToken.decimals + 18
                )
              ).toFixed(2),
      },
    },
    ...baseEvent,
  };

  return Promise.resolve({
    ...parsedEvent,
    tokenFlow: getTransactionTokenFlow(parsedEvent, userWallets),
  });
};

const parseDcaPermissionsModifiedApiEvent: ParseFunction<
  DCAPermissionsModifiedApiEvent,
  DCAPermissionsModifiedEvent
> = ({ event, userWallets, dcaBaseEventData, baseEvent }) => {
  const parsedEvent: DCAPermissionsModifiedEvent = {
    type: TransactionEventTypes.DCA_PERMISSIONS_MODIFIED,
    data: {
      ...dcaBaseEventData,
      tokenFlow: TransactionEventIncomingTypes.INCOMING,
      status: TransactionStatus.DONE,
      permissions: fromPairs(
        Object.entries(event.data.permissions).map(([label, permissions]) => [label, { permissions, label }])
      ),
    },
    ...baseEvent,
  };

  return Promise.resolve({
    ...parsedEvent,
    tokenFlow: getTransactionTokenFlow(parsedEvent, userWallets),
  });
};

const parseDcaTransferApiEvent: ParseFunction<DCATransferApiEvent, DCATransferEvent> = ({
  event,
  userWallets,
  dcaBaseEventData,
  baseEvent,
}) => {
  const parsedEvent: DCATransferEvent = {
    type: TransactionEventTypes.DCA_TRANSFER,
    data: {
      ...dcaBaseEventData,
      tokenFlow: TransactionEventIncomingTypes.INCOMING,
      status: TransactionStatus.DONE,
      from: event.data.from,
      to: event.data.to,
    },
    ...baseEvent,
  };

  return Promise.resolve({
    ...parsedEvent,
    tokenFlow: getTransactionTokenFlow(parsedEvent, userWallets),
  });
};

const parseErc20ApprovalApiEvent: ParseFunction<BaseApiEvent & ERC20ApprovalApiEvent, ERC20ApprovalEvent> = async ({
  userWallets,
  event,
  baseEvent,
  dispatch,
  tokenList,
}) => {
  const approvedToken = unwrapResult(
    await dispatch(
      fetchTokenDetails({
        tokenAddress: event.data.token,
        chainId: event.tx.chainId,
        tokenList: tokenList[event.tx.chainId],
      })
    )
  );

  const parsedEvent: ERC20ApprovalEvent = {
    type: TransactionEventTypes.ERC20_APPROVAL,
    data: {
      token: { ...approvedToken, icon: <TokenIcon token={approvedToken} /> },
      amount: {
        amount: event.data.amount,
        amountInUnits: formatCurrencyAmount(BigInt(event.data.amount), approvedToken),
      },
      owner: event.data.owner,
      spender: event.data.spender,
      status: TransactionStatus.DONE,
      tokenFlow: TransactionEventIncomingTypes.OUTGOING,
    },
    ...baseEvent,
  };

  return {
    ...parsedEvent,
    tokenFlow: getTransactionTokenFlow(parsedEvent, userWallets),
  };
};
const parseErc20TransferApiEvent: ParseFunction<BaseApiEvent & ERC20TransferApiEvent, ERC20TransferEvent> = async ({
  event,
  userWallets,
  baseEvent,
  dispatch,
  tokenList,
}) => {
  const transferedToken = unwrapResult(
    await dispatch(
      fetchTokenDetails({
        tokenAddress: event.data.token,
        chainId: event.tx.chainId,
        tokenList: tokenList[event.tx.chainId],
      })
    )
  );
  const parsedEvent: ERC20TransferEvent = {
    type: TransactionEventTypes.ERC20_TRANSFER,
    data: {
      token: { ...transferedToken, icon: <TokenIcon token={transferedToken} /> },
      amount: {
        amount: event.data.amount,
        amountInUnits: formatCurrencyAmount(BigInt(event.data.amount), transferedToken),
        amountInUSD:
          event.data.tokenPrice === null
            ? undefined
            : parseFloat(
                formatUnits(
                  BigInt(event.data.amount) * parseUnits(event.data.tokenPrice.toString(), 18),
                  transferedToken.decimals + 18
                )
              ).toFixed(2),
      },
      from: event.data.from,
      to: event.data.to,
      tokenPrice: event.data.tokenPrice,
      tokenFlow: TransactionEventIncomingTypes.OUTGOING,
      status: TransactionStatus.DONE,
    },
    ...baseEvent,
  };

  return {
    ...parsedEvent,
    tokenFlow: getTransactionTokenFlow(parsedEvent, userWallets),
  };
};
const parseNativeTransferApiEvent: ParseFunction<BaseApiEvent & NativeTransferApiEvent, NativeTransferEvent> = ({
  event,
  userWallets,
  baseEvent,
}) => {
  const protocolToken = getProtocolToken(event.tx.chainId);

  const parsedEvent: NativeTransferEvent = {
    type: TransactionEventTypes.NATIVE_TRANSFER,
    data: {
      token: { ...protocolToken, icon: <TokenIcon token={protocolToken} /> },
      amount: {
        amount: event.data.amount,
        amountInUnits: formatCurrencyAmount(BigInt(event.data.amount), protocolToken),
        amountInUSD:
          event.tx.nativePrice === null
            ? undefined
            : parseFloat(
                formatUnits(
                  BigInt(event.data.amount) * parseUnits(event.tx.nativePrice.toString(), 18),
                  protocolToken.decimals + 18
                )
              ).toFixed(2),
      },
      from: event.data.from,
      to: event.data.to,
      tokenFlow: TransactionEventIncomingTypes.OUTGOING,
      status: TransactionStatus.DONE,
    },
    ...baseEvent,
  };

  return Promise.resolve({
    ...parsedEvent,
    tokenFlow: getTransactionTokenFlow(parsedEvent, userWallets),
  });
};

const TransactionApiEventParserMap: Record<
  TransactionEventTypes,
  ParseFunction<TransactionApiEvent | DcaTransactionApiDataEvent, TransactionEvent>
> = {
  [TransactionEventTypes.DCA_CREATED]: parseDcaCreatedApiEvent,
  [TransactionEventTypes.DCA_MODIFIED]: parseDcaModifiedApiEvent,
  [TransactionEventTypes.DCA_PERMISSIONS_MODIFIED]: parseDcaPermissionsModifiedApiEvent,
  [TransactionEventTypes.DCA_WITHDRAW]: parseDcaWithdrawApiEvent,
  [TransactionEventTypes.ERC20_APPROVAL]: parseErc20ApprovalApiEvent,
  [TransactionEventTypes.ERC20_TRANSFER]: parseErc20TransferApiEvent,
  [TransactionEventTypes.NATIVE_TRANSFER]: parseNativeTransferApiEvent,
  [TransactionEventTypes.DCA_TRANSFER]: parseDcaTransferApiEvent,
  [TransactionEventTypes.DCA_TERMINATED]: parseDcaTerminateApiEvent,
};

const parseTransactionApiEventToTransactionEvent = async (
  event: TransactionApiEvent,
  dispatch: ReturnType<typeof useAppDispatch>,
  tokenList: TokenListByChainId,
  userWallets: string[]
) => {
  const network = find(NETWORKS, { chainId: event.tx.chainId }) as NetworkStruct;
  const nativeCurrencyToken = getToToken({
    ...network?.nativeCurrency,
    logoURI: network.nativeCurrency.logoURI || getGhTokenListLogoUrl(event.tx.chainId, 'logo'),
  });
  const mainCurrencyToken = getToToken({
    address: network?.mainCurrency || '',
    chainId: event.tx.chainId,
    logoURI: getGhTokenListLogoUrl(event.tx.chainId, 'logo'),
  });

  const protocolToken = getProtocolToken(event.tx.chainId);
  const baseEvent = {
    tx: {
      spentInGas: {
        amount: event.tx.spentInGas,
        amountInUnits: formatCurrencyAmount(BigInt(event.tx.spentInGas), protocolToken),
        amountInUSD:
          event.tx.nativePrice === null
            ? undefined
            : parseFloat(
                formatUnits(
                  BigInt(event.tx.spentInGas) * parseUnits(event.tx.nativePrice.toString() || '0', 18),
                  protocolToken.decimals + 18
                )
              ).toFixed(2),
      },
      network: {
        ...network,
        nativeCurrency: {
          ...nativeCurrencyToken,
          icon: <TokenIcon token={nativeCurrencyToken} />,
        },
        mainCurrency: { ...mainCurrencyToken, icon: <TokenIcon token={mainCurrencyToken} /> },
      },
      chainId: event.tx.chainId,
      txHash: event.tx.txHash,
      timestamp: event.tx.timestamp,
      nativePrice: event.tx.nativePrice,
      initiatedBy: event.tx.initiatedBy,
      explorerLink: buildEtherscanTransaction(event.tx.txHash, event.tx.chainId),
    },
  };

  let fromToken: Token = getToToken({});
  let toToken: Token = getToToken({});
  let dcaBaseEventData: BaseDcaDataEvent = {
    hub: 'hub',
    positionId: 0,
    fromToken: { ...getToToken({}), icon: <></> },
    toToken: { ...getToToken({}), icon: <></> },
  };

  if (DCA_TYPE_EVENTS.includes(event.type)) {
    const typedEvent = event as BaseApiEvent & DcaTransactionApiDataEvent;
    fromToken = unwrapResult(
      await dispatch(
        fetchTokenDetails({
          tokenAddress: typedEvent.data.fromToken.token.address,
          chainId: typedEvent.tx.chainId,
          tokenList: tokenList[typedEvent.tx.chainId],
        })
      )
    );
    toToken = unwrapResult(
      await dispatch(
        fetchTokenDetails({
          tokenAddress: typedEvent.data.toToken.token.address,
          chainId: typedEvent.tx.chainId,
          tokenList: tokenList[typedEvent.tx.chainId],
        })
      )
    );

    dcaBaseEventData = {
      hub: typedEvent.data.hub,
      positionId: Number(typedEvent.data.positionId),
      fromToken: { ...fromToken, icon: <TokenIcon token={fromToken} /> },
      toToken: { ...toToken, icon: <TokenIcon token={toToken} /> },
    };
  }
  return TransactionApiEventParserMap[event.type]({
    event,
    dispatch,
    tokenList,
    dcaBaseEventData,
    baseEvent,
    userWallets,
  });
};

const parseMultipleTransactionApiEventsToTransactionEvents = (
  events: TransactionApiEvent[],
  dispatch: ReturnType<typeof useAppDispatch>,
  tokenList: TokenListByChainId,
  userWallets: string[]
) => {
  if (!events) return [];
  return events.map<Promise<TransactionEvent>>((event) =>
    parseTransactionApiEventToTransactionEvent(event, dispatch, tokenList, userWallets)
  );
};

export default parseMultipleTransactionApiEventsToTransactionEvents;
