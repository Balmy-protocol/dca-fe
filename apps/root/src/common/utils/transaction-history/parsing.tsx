import TokenIcon from '@common/components/token-icon';
import { getProtocolToken } from '@common/mocks/tokens';
import { DCA_TYPE_EVENTS, NETWORKS } from '@constants';
import {
  TransactionApiEvent,
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
  SwapApiEvent,
  SwapEvent,
  TokenList,
  TokenListId,
} from 'common-types';
import { compact, find, fromPairs, isUndefined } from 'lodash';
import { formatUnits, parseUnits } from 'viem';
import { toToken as getToToken, formatCurrencyAmount, getNetworkCurrencyTokens } from '../currency';
import { buildEtherscanTransaction } from '../etherscan';
import React from 'react';
import { getTransactionTokenFlow } from '.';

interface ParseParams<T> {
  event: T;
  userWallets: string[];
  dcaBaseEventData: BaseDcaDataEvent;
  baseEvent: BaseEvent;
  tokenList: TokenList;
}

type ParseFunction<T, K> = (params: ParseParams<T>) => K | null;

const parseDcaCreatedApiEvent: ParseFunction<DCACreatedApiEvent, DCACreatedEvent> = ({
  event,
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
        amount: BigInt(event.data.rate),
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
        amount: funds,
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

  return parsedEvent;
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
        amount: BigInt(event.data.oldRate),
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
        amount: BigInt(difference),
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
        amount: BigInt(event.data.rate),
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

  return {
    ...parsedEvent,
    data: {
      ...parsedEvent.data,
      tokenFlow: getTransactionTokenFlow(parsedEvent, userWallets),
    },
  };
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
        amount: BigInt(event.data.withdrawn),
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
          amount: BigInt(event.data.withdrawnYield),
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

  return {
    ...parsedEvent,
    data: {
      ...parsedEvent.data,
      tokenFlow: getTransactionTokenFlow(parsedEvent, userWallets),
    },
  };
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
        amount: BigInt(event.data.withdrawnRemaining),
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
        amount: BigInt(event.data.withdrawnSwapped),
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

  return {
    ...parsedEvent,
    data: {
      ...parsedEvent.data,
      tokenFlow: getTransactionTokenFlow(parsedEvent, userWallets),
    },
  };
};

const parseDcaPermissionsModifiedApiEvent: ParseFunction<
  DCAPermissionsModifiedApiEvent,
  DCAPermissionsModifiedEvent
> = ({ event, dcaBaseEventData, baseEvent }) => {
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

  return parsedEvent;
};

const parseDcaTransferApiEvent: ParseFunction<DCATransferApiEvent, DCATransferEvent> = ({
  event,
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

  return parsedEvent;
};

const parseErc20ApprovalApiEvent: ParseFunction<BaseApiEvent & ERC20ApprovalApiEvent, ERC20ApprovalEvent> = ({
  userWallets,
  event,
  baseEvent,
  tokenList,
}) => {
  const approvedTokenId = `${event.tx.chainId}-${event.data.token.toLowerCase()}` as TokenListId;
  const approvedToken = tokenList[approvedTokenId];

  if (!approvedToken) return null;

  const parsedEvent: ERC20ApprovalEvent = {
    type: TransactionEventTypes.ERC20_APPROVAL,
    data: {
      token: { ...approvedToken, icon: <TokenIcon size={5} token={approvedToken} /> },
      amount: {
        amount: BigInt(event.data.amount),
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
    data: {
      ...parsedEvent.data,
      tokenFlow: getTransactionTokenFlow(parsedEvent, userWallets),
    },
  };
};
const parseErc20TransferApiEvent: ParseFunction<BaseApiEvent & ERC20TransferApiEvent, ERC20TransferEvent> = ({
  event,
  userWallets,
  baseEvent,
  tokenList,
}) => {
  const transferedTokenId = `${event.tx.chainId}-${event.data.token.toLowerCase()}` as TokenListId;
  const transferedToken = tokenList[transferedTokenId];

  if (!transferedToken) return null;

  const parsedEvent: ERC20TransferEvent = {
    type: TransactionEventTypes.ERC20_TRANSFER,
    data: {
      token: { ...transferedToken, icon: <TokenIcon size={5} token={transferedToken} /> },
      amount: {
        amount: BigInt(event.data.amount),
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
    data: {
      ...parsedEvent.data,
      tokenFlow: getTransactionTokenFlow(parsedEvent, userWallets),
    },
  };
};

const parseSwapApiEvent: ParseFunction<BaseApiEvent & SwapApiEvent, SwapEvent> = ({ event, baseEvent, tokenList }) => {
  const tokenInId = `${event.tx.chainId}-${event.data.tokenIn.address.toLowerCase()}` as TokenListId;
  const tokenOutId = `${event.tx.chainId}-${event.data.tokenOut.address.toLowerCase()}` as TokenListId;
  const tokenIn = tokenList[tokenInId];
  const tokenOut = tokenList[tokenOutId];

  if (!tokenIn || !tokenOut) return null;

  const parsedEvent: SwapEvent = {
    type: TransactionEventTypes.SWAP,
    data: {
      tokenIn: { ...tokenIn, icon: <TokenIcon size={5} token={tokenIn} /> },
      tokenOut: { ...tokenOut, icon: <TokenIcon size={5} token={tokenOut} /> },
      type: event.data.type,
      recipient: event.data.recipient,
      swapContract: event.data.swapContract,
      amountIn: {
        amount: BigInt(event.data.tokenIn.amount),
        amountInUnits: formatCurrencyAmount(BigInt(event.data.tokenIn.amount), tokenIn),
        amountInUSD: !event.data.tokenIn.price
          ? undefined
          : parseFloat(
              formatUnits(
                BigInt(event.data.tokenIn.amount) * parseUnits(event.data.tokenIn.price.toString(), 18),
                tokenIn.decimals + 18
              )
            ).toFixed(2),
      },
      amountOut: {
        amount: BigInt(event.data.tokenOut.amount),
        amountInUnits: formatCurrencyAmount(BigInt(event.data.tokenOut.amount), tokenOut),
        amountInUSD: !event.data.tokenOut.price
          ? undefined
          : parseFloat(
              formatUnits(
                BigInt(event.data.tokenOut.amount) * parseUnits(event.data.tokenOut.price.toString(), 18),
                tokenOut.decimals + 18
              )
            ).toFixed(2),
      },
      tokenFlow: TransactionEventIncomingTypes.INCOMING,
      status: TransactionStatus.DONE,
    },
    ...baseEvent,
  };

  return parsedEvent;
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
      token: { ...protocolToken, icon: <TokenIcon size={5} token={protocolToken} /> },
      amount: {
        amount: BigInt(event.data.amount),
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

  return {
    ...parsedEvent,
    data: {
      ...parsedEvent.data,
      tokenFlow: getTransactionTokenFlow(parsedEvent, userWallets),
    },
  };
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
  [TransactionEventTypes.SWAP]: parseSwapApiEvent,
};

const parseTransactionApiEventToTransactionEvent = (
  event: TransactionApiEvent,
  tokenList: TokenList,
  userWallets: string[]
) => {
  const network = find(NETWORKS, { chainId: event.tx.chainId }) as NetworkStruct;

  const { nativeCurrencyToken, mainCurrencyToken } = getNetworkCurrencyTokens(network);

  const protocolToken = getProtocolToken(event.tx.chainId);
  const baseEvent = {
    tx: {
      spentInGas: {
        amount: BigInt(event.tx.spentInGas),
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
          icon: <TokenIcon size={5} token={nativeCurrencyToken} />,
        },
        mainCurrency: { ...mainCurrencyToken, icon: <TokenIcon size={5} token={mainCurrencyToken} /> },
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
    const fromTokenId = `${
      typedEvent.tx.chainId
    }-${typedEvent.data.fromToken.token.address.toLowerCase()}` as TokenListId;
    const toTokenId = `${typedEvent.tx.chainId}-${typedEvent.data.toToken.token.address.toLowerCase()}` as TokenListId;

    fromToken = tokenList[fromTokenId];
    toToken = tokenList[toTokenId];

    if (!fromToken || !toToken) return null;
    dcaBaseEventData = {
      hub: typedEvent.data.hub,
      positionId: Number(typedEvent.data.positionId),
      fromToken: { ...fromToken, icon: <TokenIcon size={5} token={fromToken} /> },
      toToken: { ...toToken, icon: <TokenIcon size={5} token={toToken} /> },
    };
  }
  return TransactionApiEventParserMap[event.type]({
    event,
    dcaBaseEventData,
    baseEvent,
    userWallets,
    tokenList,
  });
};

const parseMultipleTransactionApiEventsToTransactionEvents = (
  events: TransactionApiEvent[],
  tokenList: TokenList,
  userWallets: string[]
) => {
  if (!events) return [];
  return compact(
    events.map<TransactionEvent | null>((event) =>
      parseTransactionApiEventToTransactionEvent(event, tokenList, userWallets)
    )
  );
};

export default parseMultipleTransactionApiEventsToTransactionEvents;
