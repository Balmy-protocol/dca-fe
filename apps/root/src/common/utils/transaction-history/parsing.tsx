import TokenIcon from '@common/components/token-icon';
import { PROTOCOL_TOKEN_ADDRESS, getProtocolToken } from '@common/mocks/tokens';
import { DCA_TYPE_EVENTS, HUB_ADDRESS, NETWORKS } from '@constants';
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
  TransactionDetails,
  TransactionTypes,
  Position,
} from 'common-types';
import { compact, find, fromPairs, isUndefined } from 'lodash';
import { Address, formatUnits, maxUint256, parseUnits } from 'viem';
import { toToken as getToToken, formatCurrencyAmount, getNetworkCurrencyTokens } from '../currency';
import { buildEtherscanTransaction } from '../etherscan';
import React from 'react';
import { getTransactionTokenFlow } from '.';
import { getDisplayToken, getTokenListId, sdkDcaTokenToToken } from '../parsing';
import { getNewPositionFromTxTypeData } from '../transactions';

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
                  dcaBaseEventData.fromToken.decimals + 18
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
                  dcaBaseEventData.fromToken.decimals + 18
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
                  dcaBaseEventData.fromToken.decimals + 18
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
                  dcaBaseEventData.fromToken.decimals + 18
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
                  dcaBaseEventData.fromToken.decimals + 18
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

    const fromToUse = getDisplayToken(
      sdkDcaTokenToToken(typedEvent.data.fromToken.token, event.tx.chainId),
      event.tx.chainId
    );
    const toToUse = getDisplayToken(
      sdkDcaTokenToToken(typedEvent.data.toToken.token, event.tx.chainId),
      event.tx.chainId
    );

    const fromTokenId = `${typedEvent.tx.chainId}-${fromToUse.address.toLowerCase()}` as TokenListId;
    const toTokenId = `${typedEvent.tx.chainId}-${toToUse.address.toLowerCase()}` as TokenListId;

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

export const parseMultipleTransactionApiEventsToTransactionEvents = (
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

const buildBaseDcaPendingEventData = (position: Position): BaseDcaDataEvent => {
  const fromToken = { ...position.from, icon: <TokenIcon size={5} token={position.from} /> };
  const toToken = { ...position.to, icon: <TokenIcon size={5} token={position.to} /> };
  const positionId = Number(position.positionId);
  const hub = HUB_ADDRESS[position.version][position.chainId];

  return {
    fromToken,
    toToken,
    positionId,
    hub,
  };
};

export const transformNonIndexedEvents = ({
  events,
  userWallets,
  tokenList,
  nativePrices,
}: {
  events: TransactionDetails[];
  userWallets: string[];
  tokenList: TokenList;
  nativePrices: Record<number, number | undefined>;
}): TransactionEvent[] => {
  if (!events) return [];
  const eventsPromises = events.map<TransactionEvent | null>((event) => {
    const network = find(NETWORKS, { chainId: event.chainId }) as NetworkStruct;

    const { nativeCurrencyToken, mainCurrencyToken } = getNetworkCurrencyTokens(network);
    const spentInGasAmount = (event.receipt?.effectiveGasPrice || 0n) * (event.receipt?.gasUsed || 0n);
    const protocolToken = getProtocolToken(event.chainId);
    const baseEvent = {
      tx: {
        network: {
          ...network,
          nativeCurrency: {
            ...nativeCurrencyToken,
            icon: <TokenIcon size={5} token={nativeCurrencyToken} />,
          },
          mainCurrency: { ...mainCurrencyToken, icon: <TokenIcon size={5} token={mainCurrencyToken} /> },
        },
        chainId: event.chainId,
        txHash: event.hash as Address,
        timestamp: event.addedTime,
        explorerLink: buildEtherscanTransaction(event.hash, event.chainId),
        initiatedBy: event.from as Address,
        spentInGas: {
          amount: spentInGasAmount,
          amountInUnits: formatCurrencyAmount(spentInGasAmount, nativeCurrencyToken),
        },
        nativePrice: nativePrices[event.chainId] || 0,
      },
    };

    let parsedEvent: TransactionEvent;
    let position;
    let baseEventData;

    switch (event.type) {
      case TransactionTypes.approveTokenExact:
      case TransactionTypes.approveToken:
        // case TransactionTypes.approveCompanion:
        const approvedTokenId = getTokenListId({
          tokenAddress: event.typeData.token.address,
          chainId: event.chainId,
        });

        const approvedToken = tokenList[approvedTokenId];
        if (!approvedToken) return null;

        const amount = 'amount' in event.typeData ? BigInt(event.typeData.amount) : maxUint256;
        const amountInUnits = formatCurrencyAmount(amount, approvedToken);

        parsedEvent = {
          type: TransactionEventTypes.ERC20_APPROVAL,
          data: {
            token: { ...approvedToken, icon: <TokenIcon size={5} token={approvedToken} /> },
            amount: {
              amount,
              amountInUnits,
            },
            owner: event.from as Address,
            spender: event.typeData.addressFor as Address,
            tokenFlow: TransactionEventIncomingTypes.OUTGOING,
            status: event.receipt ? TransactionStatus.DONE : TransactionStatus.PENDING,
          },
          ...baseEvent,
        } as TransactionEvent;
        break;
      case TransactionTypes.swap:
        // case TransactionTypes.approveCompanion:
        const tokenIn =
          tokenList[getTokenListId({ tokenAddress: event.typeData.from.address, chainId: event.chainId })];
        const tokenOut = tokenList[getTokenListId({ tokenAddress: event.typeData.to.address, chainId: event.chainId })];

        if (!tokenIn || !tokenOut) return null;

        const swapAmountIn = event.typeData.amountFrom;
        const swapAmountInUnits = formatCurrencyAmount(swapAmountIn, tokenIn);
        const swapAmountOut = event.typeData.amountTo;
        const swapAmountOutUnits = formatCurrencyAmount(swapAmountOut, tokenOut);

        parsedEvent = {
          type: TransactionEventTypes.SWAP,
          data: {
            amountIn: {
              amount: swapAmountIn,
              amountInUnits: swapAmountInUnits,
            },
            amountOut: {
              amount: swapAmountOut,
              amountInUnits: swapAmountOutUnits,
            },
            recipient: event.typeData.transferTo || event.from,
            swapContract: event.typeData.swapContract,
            tokenIn: { ...tokenIn, icon: <TokenIcon size={5} token={tokenIn} /> },
            tokenOut: { ...tokenOut, icon: <TokenIcon size={5} token={tokenOut} /> },
            type: event.typeData.type,
            status: event.receipt ? TransactionStatus.DONE : TransactionStatus.PENDING,
            tokenFlow: TransactionEventIncomingTypes.INCOMING,
          },
          ...baseEvent,
        } as TransactionEvent;
        break;
      case TransactionTypes.transferToken:
        const type =
          event.typeData.token.address === PROTOCOL_TOKEN_ADDRESS
            ? TransactionEventTypes.NATIVE_TRANSFER
            : TransactionEventTypes.ERC20_TRANSFER;

        const transferedToken =
          type === TransactionEventTypes.NATIVE_TRANSFER
            ? protocolToken
            : tokenList[getTokenListId({ tokenAddress: event.typeData.token.address, chainId: event.chainId })];

        if (!transferedToken) return null;

        parsedEvent = {
          type,
          data: {
            token: { ...transferedToken, icon: <TokenIcon size={5} token={transferedToken} /> },
            amount: {
              amount: BigInt(event.typeData.amount),
              amountInUnits: formatCurrencyAmount(BigInt(event.typeData.amount), transferedToken),
            },
            from: event.from as Address,
            to: event.typeData.to as Address,
            tokenFlow: TransactionEventIncomingTypes.OUTGOING,
            status: event.receipt ? TransactionStatus.DONE : TransactionStatus.PENDING,
          },
          ...baseEvent,
        } as TransactionEvent;
        break;
      case TransactionTypes.withdrawPosition:
        position = event.position;

        if (!position) {
          return null;
        }

        baseEventData = buildBaseDcaPendingEventData(position);
        const withdrawnUnderlying = event.typeData.withdrawnUnderlying;

        parsedEvent = {
          type: TransactionEventTypes.DCA_WITHDRAW,
          data: {
            ...baseEventData,
            tokenFlow: TransactionEventIncomingTypes.INCOMING,
            status: event.receipt ? TransactionStatus.DONE : TransactionStatus.PENDING,
            withdrawn: {
              amount: BigInt(withdrawnUnderlying),
              amountInUnits: formatCurrencyAmount(BigInt(withdrawnUnderlying), baseEventData.toToken),
            },
            // TODO CALCULATE YIELD
            withdrawnYield: undefined,
          },
          ...baseEvent,
        } as DCAWithdrawnEvent;
        break;
      case TransactionTypes.terminatePosition:
        position = event.position;

        if (!position) {
          return null;
        }

        baseEventData = buildBaseDcaPendingEventData(position);

        parsedEvent = {
          type: TransactionEventTypes.DCA_TERMINATED,
          data: {
            ...baseEventData,
            tokenFlow: TransactionEventIncomingTypes.INCOMING,
            status: event.receipt ? TransactionStatus.DONE : TransactionStatus.PENDING,
            withdrawnRemaining: {
              amount: BigInt(event.typeData.remainingLiquidity),
              amountInUnits: formatCurrencyAmount(BigInt(event.typeData.remainingLiquidity), baseEventData.toToken),
            },
            withdrawnSwapped: {
              amount: BigInt(event.typeData.toWithdraw),
              amountInUnits: formatCurrencyAmount(BigInt(event.typeData.toWithdraw), baseEventData.toToken),
            },
          },
          ...baseEvent,
        } as DCATerminatedEvent;
        break;
      case TransactionTypes.modifyRateAndSwapsPosition:
        position = event.position;

        if (!position) {
          return null;
        }

        baseEventData = buildBaseDcaPendingEventData(position);

        const totalBefore = position.rate.amount * BigInt(position.remainingSwaps);
        const totalNow = BigInt(event.typeData.newRate) * BigInt(event.typeData.newSwaps);

        const difference = totalBefore > totalNow ? totalBefore - totalNow : totalNow - totalBefore;

        parsedEvent = {
          type: TransactionEventTypes.DCA_MODIFIED,
          data: {
            ...baseEventData,
            tokenFlow: TransactionEventIncomingTypes.INCOMING,
            status: event.receipt ? TransactionStatus.DONE : TransactionStatus.PENDING,
            oldRate: {
              amount: position.rate.amount,
              amountInUnits: formatCurrencyAmount(position.rate.amount, baseEventData.fromToken),
            },
            rate: {
              amount: BigInt(event.typeData.newRate),
              amountInUnits: formatCurrencyAmount(BigInt(event.typeData.newRate), baseEventData.fromToken),
            },
            difference: {
              amount: difference,
              amountInUnits: formatCurrencyAmount(difference, baseEventData.fromToken),
            },
            oldRemainingSwaps: Number(position.remainingSwaps),
            remainingSwaps: Number(event.typeData.newSwaps),
          },
          ...baseEvent,
        } as DCAModifiedEvent;
        break;
      case TransactionTypes.modifyPermissions:
        position = event.position;

        if (!position) {
          return null;
        }

        baseEventData = buildBaseDcaPendingEventData(position);

        parsedEvent = {
          type: TransactionEventTypes.DCA_PERMISSIONS_MODIFIED,
          data: {
            ...baseEventData,
            tokenFlow: TransactionEventIncomingTypes.INCOMING,
            status: event.receipt ? TransactionStatus.DONE : TransactionStatus.PENDING,
            permissions: fromPairs(
              event.typeData.permissions.map(({ operator, permissions }) => [
                operator,
                { permissions, label: operator },
              ])
            ),
          },
          ...baseEvent,
        } as DCAPermissionsModifiedEvent;
        break;
      case TransactionTypes.transferPosition:
        position = event.position;

        if (!position) {
          return null;
        }

        baseEventData = buildBaseDcaPendingEventData(position);

        parsedEvent = {
          type: TransactionEventTypes.DCA_TRANSFER,
          data: {
            ...baseEventData,
            tokenFlow: TransactionEventIncomingTypes.INCOMING,
            status: event.receipt ? TransactionStatus.DONE : TransactionStatus.PENDING,
            from: position.user,
            to: event.typeData.toAddress,
          },
          ...baseEvent,
        } as DCATransferEvent;
        break;
      case TransactionTypes.newPosition:
        const rate = parseUnits(event.typeData.fromValue, event.typeData.from.decimals);
        const funds = rate * BigInt(event.typeData.frequencyValue);

        const newPosition = getNewPositionFromTxTypeData({
          newPositionTypeData: event.typeData,
          chainId: event.chainId,
          id: event.typeData.id,
          user: event.from as Address,
        });

        parsedEvent = {
          type: TransactionEventTypes.DCA_CREATED,
          data: {
            ...buildBaseDcaPendingEventData(newPosition),
            tokenFlow: TransactionEventIncomingTypes.INCOMING,
            status: event.receipt ? TransactionStatus.DONE : TransactionStatus.PENDING,
            // TODO CALCULATE YIELD
            rate: {
              amount: rate,
              amountInUnits: formatCurrencyAmount(rate, event.typeData.from),
            },
            funds: {
              amount: funds,
              amountInUnits: formatCurrencyAmount(funds, event.typeData.from),
            },
            swapInterval: Number(event.typeData.frequencyType),
            swaps: Number(event.typeData.frequencyValue),
          },
          ...baseEvent,
        } as DCACreatedEvent;
        break;
      default:
        return null;
    }

    return {
      ...parsedEvent,
      data: {
        ...parsedEvent.data,
        tokenFlow: getTransactionTokenFlow(parsedEvent, userWallets),
      },
    } as TransactionEvent;
  });

  return compact(eventsPromises);
};
