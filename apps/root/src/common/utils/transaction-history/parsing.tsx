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
  EarnDepositApiEvent,
  EarnDepositEvent,
  EarnIncreaseApiEvent,
  EarnIncreaseEvent,
  EarnWithdrawApiEvent,
  EarnWithdrawEvent,
} from 'common-types';
import { compact, find, fromPairs, isNil, isUndefined } from 'lodash';
import { Address, formatUnits, maxUint256, parseUnits } from 'viem';
import {
  toToken as getToToken,
  formatCurrencyAmount,
  getNetworkCurrencyTokens,
  parseUsdPrice,
  parseNumberUsdPriceToBigInt,
  toToken,
} from '../currency';
import { buildEtherscanTransaction } from '../etherscan';
import React from 'react';
import { getTransactionTokenFlow } from '.';
import { getTokenListId, transformStoredPositionToPosition } from '../parsing';
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
        amountInUnits: formatCurrencyAmount({ amount: BigInt(event.data.rate), token: dcaBaseEventData.fromToken }),
        amountInUSD:
          event.data.fromToken.price === null || isUndefined(event.data.fromToken.price)
            ? undefined
            : parseFloat(
                formatUnits(
                  BigInt(event.data.rate) * parseNumberUsdPriceToBigInt(event.data.fromToken.price),
                  dcaBaseEventData.fromToken.decimals + 18
                )
              ).toFixed(2),
      },
      funds: {
        amount: funds,
        amountInUnits: formatCurrencyAmount({ amount: BigInt(funds), token: dcaBaseEventData.fromToken }),
        amountInUSD:
          event.data.fromToken.price === null || isUndefined(event.data.fromToken.price)
            ? undefined
            : parseFloat(
                formatUnits(
                  BigInt(funds) * parseNumberUsdPriceToBigInt(event.data.fromToken.price),
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
        amountInUnits: formatCurrencyAmount({ amount: BigInt(event.data.oldRate), token: dcaBaseEventData.fromToken }),
        amountInUSD:
          event.data.fromToken.price === null || isUndefined(event.data.fromToken.price)
            ? undefined
            : parseFloat(
                formatUnits(
                  BigInt(event.data.oldRate) * parseNumberUsdPriceToBigInt(event.data.fromToken.price),
                  dcaBaseEventData.fromToken.decimals + 18
                )
              ).toFixed(2),
      },
      difference: {
        amount: BigInt(difference),
        amountInUnits: formatCurrencyAmount({ amount: BigInt(difference), token: dcaBaseEventData.fromToken }),
        amountInUSD:
          event.data.fromToken.price === null || isUndefined(event.data.fromToken.price)
            ? undefined
            : parseFloat(
                formatUnits(
                  BigInt(difference) * parseNumberUsdPriceToBigInt(event.data.fromToken.price),
                  dcaBaseEventData.fromToken.decimals + 18
                )
              ).toFixed(2),
      },
      rate: {
        amount: BigInt(event.data.rate),
        amountInUnits: formatCurrencyAmount({ amount: BigInt(event.data.rate), token: dcaBaseEventData.fromToken }),
        amountInUSD:
          event.data.fromToken.price === null || isUndefined(event.data.fromToken.price)
            ? undefined
            : parseFloat(
                formatUnits(
                  BigInt(event.data.rate) * parseNumberUsdPriceToBigInt(event.data.fromToken.price),
                  dcaBaseEventData.fromToken.decimals + 18
                )
              ).toFixed(2),
      },
      remainingLiquidity: {
        amount: totalNow,
        amountInUnits: formatCurrencyAmount({ amount: totalNow, token: dcaBaseEventData.fromToken }),
        amountInUSD:
          event.data.fromToken.price === null || isUndefined(event.data.fromToken.price)
            ? undefined
            : parseUsdPrice(
                dcaBaseEventData.fromToken,
                totalNow,
                parseNumberUsdPriceToBigInt(event.data.fromToken.price)
              ).toString(),
      },
      oldRemainingLiquidity: {
        amount: totalBefore,
        amountInUnits: formatCurrencyAmount({ amount: totalBefore, token: dcaBaseEventData.fromToken }),
        amountInUSD:
          event.data.fromToken.price === null || isUndefined(event.data.fromToken.price)
            ? undefined
            : parseUsdPrice(
                dcaBaseEventData.fromToken,
                totalBefore,
                parseNumberUsdPriceToBigInt(event.data.fromToken.price)
              ).toString(),
      },
      fromIsYield: event.data.fromToken.token.variant.type === 'yield',
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
        amountInUnits: formatCurrencyAmount({ amount: BigInt(event.data.withdrawn), token: dcaBaseEventData.toToken }),
        amountInUSD:
          event.data.toToken.price === null || isUndefined(event.data.toToken.price)
            ? undefined
            : parseFloat(
                formatUnits(
                  BigInt(event.data.withdrawn) * parseNumberUsdPriceToBigInt(event.data.toToken.price),
                  dcaBaseEventData.toToken.decimals + 18
                )
              ).toFixed(2),
      },
      withdrawnYield:
        (!isUndefined(event.data.withdrawnYield) && {
          amount: BigInt(event.data.withdrawnYield),
          amountInUnits: formatCurrencyAmount({
            amount: BigInt(event.data.withdrawnYield),
            token: dcaBaseEventData.toToken,
          }),
          amountInUSD:
            event.data.toToken.price === null || isUndefined(event.data.toToken.price)
              ? undefined
              : parseFloat(
                  formatUnits(
                    BigInt(event.data.withdrawnYield) * parseNumberUsdPriceToBigInt(event.data.toToken.price),
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
        amountInUnits: formatCurrencyAmount({
          amount: BigInt(event.data.withdrawnRemaining),
          token: dcaBaseEventData.fromToken,
        }),
        amountInUSD:
          event.data.fromToken.price === null || isUndefined(event.data.fromToken.price)
            ? undefined
            : parseFloat(
                formatUnits(
                  BigInt(event.data.withdrawnRemaining) * parseNumberUsdPriceToBigInt(event.data.fromToken.price),
                  dcaBaseEventData.fromToken.decimals + 18
                )
              ).toFixed(2),
      },
      withdrawnSwapped: {
        amount: BigInt(event.data.withdrawnSwapped),
        amountInUnits: formatCurrencyAmount({
          amount: BigInt(event.data.withdrawnSwapped),
          token: dcaBaseEventData.toToken,
        }),
        amountInUSD:
          event.data.toToken.price === null || isUndefined(event.data.toToken.price)
            ? undefined
            : parseFloat(
                formatUnits(
                  BigInt(event.data.withdrawnSwapped) * parseNumberUsdPriceToBigInt(event.data.toToken.price),
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
      token: { ...approvedToken, icon: <TokenIcon size={8} token={approvedToken} /> },
      amount: {
        amount: BigInt(event.data.amount),
        amountInUnits: formatCurrencyAmount({ amount: BigInt(event.data.amount), token: approvedToken }),
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

const parseEarnDepositApiEvent: ParseFunction<BaseApiEvent & EarnDepositApiEvent, EarnDepositEvent> = ({
  event,
  baseEvent,
  tokenList,
}) => {
  const earnDepositedTokenId = `${event.tx.chainId}-${event.data.asset.address.toLowerCase()}` as TokenListId;
  const earnDepositedToken = tokenList[earnDepositedTokenId];

  if (!earnDepositedToken) return null;

  const parsedEvent: EarnDepositEvent = {
    type: TransactionEventTypes.EARN_CREATED,
    data: {
      asset: { ...earnDepositedToken, icon: <TokenIcon size={8} token={earnDepositedToken} /> },
      assetAmount: {
        amount: BigInt(event.data.asset.amount),
        amountInUnits: formatCurrencyAmount({ amount: BigInt(event.data.asset.amount), token: earnDepositedToken }),
      },
      user: event.tx.initiatedBy,
      status: TransactionStatus.DONE,
      tokenFlow: TransactionEventIncomingTypes.INCOMING,
      positionId: event.data.positionId,
      strategyId: event.data.strategyId,
    },
    ...baseEvent,
  };

  return parsedEvent;
};

const parseEarnIncreaseApiEvent: ParseFunction<BaseApiEvent & EarnIncreaseApiEvent, EarnIncreaseEvent> = ({
  event,
  baseEvent,
  tokenList,
}) => {
  const earnDepositedTokenId = `${event.tx.chainId}-${event.data.asset.address.toLowerCase()}` as TokenListId;
  const earnDepositedToken = tokenList[earnDepositedTokenId];

  if (!earnDepositedToken) return null;

  const parsedEvent: EarnIncreaseEvent = {
    type: TransactionEventTypes.EARN_INCREASE,
    data: {
      asset: { ...earnDepositedToken, icon: <TokenIcon size={8} token={earnDepositedToken} /> },
      assetAmount: {
        amount: BigInt(event.data.asset.amount),
        amountInUnits: formatCurrencyAmount({ amount: BigInt(event.data.asset.amount), token: earnDepositedToken }),
      },
      user: event.tx.initiatedBy,
      status: TransactionStatus.DONE,
      tokenFlow: TransactionEventIncomingTypes.INCOMING,
      positionId: event.data.positionId,
      strategyId: event.data.strategyId,
    },
    ...baseEvent,
  };

  return parsedEvent;
};

const parseEarnWithdrawApiEvent: ParseFunction<BaseApiEvent & EarnWithdrawApiEvent, EarnWithdrawEvent> = ({
  event,
  baseEvent,
  tokenList,
}) => {
  const allTokensAreInTokenList = event.data.withdrawn
    .map((withdrawn) => `${event.tx.chainId}-${withdrawn.token}` as TokenListId)
    .every((tokenId) => !!tokenList[tokenId]);

  if (!allTokensAreInTokenList) return null;

  const parsedEvent: EarnWithdrawEvent = {
    type: TransactionEventTypes.EARN_WITHDRAW,
    data: {
      withdrawn: event.data.withdrawn.map((withdrawn) => {
        const tokenId = `${event.tx.chainId}-${withdrawn.token}` as TokenListId;
        const token = tokenList[tokenId];

        return {
          amount: {
            amount: BigInt(withdrawn.amount),
            amountInUnits: formatCurrencyAmount({ amount: BigInt(withdrawn.amount), token }),
          },
          token: { ...token, icon: <TokenIcon size={8} token={token} /> },
        };
      }),
      user: event.tx.initiatedBy,
      status: TransactionStatus.DONE,
      tokenFlow: TransactionEventIncomingTypes.INCOMING,
      positionId: event.data.positionId,
      strategyId: event.data.strategyId,
      assetAddress: event.data.assetAddress,
    },
    ...baseEvent,
  };

  return parsedEvent;
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
      token: { ...transferedToken, icon: <TokenIcon size={8} token={transferedToken} /> },
      amount: {
        amount: BigInt(event.data.amount),
        amountInUnits: formatCurrencyAmount({ amount: BigInt(event.data.amount), token: transferedToken }),
        amountInUSD:
          event.data.tokenPrice === null
            ? undefined
            : parseFloat(
                formatUnits(
                  BigInt(event.data.amount) * parseNumberUsdPriceToBigInt(event.data.tokenPrice),
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
      tokenIn: { ...tokenIn, icon: <TokenIcon size={8} token={tokenIn} /> },
      tokenOut: { ...tokenOut, icon: <TokenIcon size={8} token={tokenOut} /> },
      type: event.data.type,
      recipient: event.data.recipient,
      swapContract: event.data.swapContract,
      amountIn: {
        amount: BigInt(event.data.tokenIn.amount),
        amountInUnits: formatCurrencyAmount({ amount: BigInt(event.data.tokenIn.amount), token: tokenIn }),
        amountInUSD: !event.data.tokenIn.price
          ? undefined
          : parseFloat(
              formatUnits(
                BigInt(event.data.tokenIn.amount) * parseNumberUsdPriceToBigInt(event.data.tokenIn.price),
                tokenIn.decimals + 18
              )
            ).toFixed(2),
      },
      amountOut: {
        amount: BigInt(event.data.tokenOut.amount),
        amountInUnits: formatCurrencyAmount({ amount: BigInt(event.data.tokenOut.amount), token: tokenOut }),
        amountInUSD: !event.data.tokenOut.price
          ? undefined
          : parseFloat(
              formatUnits(
                BigInt(event.data.tokenOut.amount) * parseNumberUsdPriceToBigInt(event.data.tokenOut.price),
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
      token: { ...protocolToken, icon: <TokenIcon size={8} token={protocolToken} /> },
      amount: {
        amount: BigInt(event.data.amount),
        amountInUnits: formatCurrencyAmount({ amount: BigInt(event.data.amount), token: protocolToken }),
        amountInUSD:
          event.tx.nativePrice === null
            ? undefined
            : parseFloat(
                formatUnits(
                  BigInt(event.data.amount) * parseNumberUsdPriceToBigInt(event.tx.nativePrice),
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
  [TransactionEventTypes.EARN_CREATED]: parseEarnDepositApiEvent,
  [TransactionEventTypes.EARN_INCREASE]: parseEarnIncreaseApiEvent,
  [TransactionEventTypes.EARN_WITHDRAW]: parseEarnWithdrawApiEvent,
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
        amountInUnits: formatCurrencyAmount({ amount: BigInt(event.tx.spentInGas), token: protocolToken }),
        amountInUSD:
          event.tx.nativePrice === null
            ? undefined
            : parseFloat(
                formatUnits(
                  BigInt(event.tx.spentInGas) * parseNumberUsdPriceToBigInt(event.tx.nativePrice),
                  protocolToken.decimals + 18
                )
              ).toFixed(2),
      },
      network: {
        ...network,
        nativeCurrency: {
          ...nativeCurrencyToken,
          icon: <TokenIcon size={8} token={nativeCurrencyToken} />,
        },
        mainCurrency: { ...mainCurrencyToken, icon: <TokenIcon size={8} token={mainCurrencyToken} /> },
      },
      chainId: event.tx.chainId,
      txHash: event.tx.txHash,
      timestamp: event.tx.timestamp,
      nativePrice: event.tx.nativePrice,
      initiatedBy: event.tx.initiatedBy,
      explorerLink: buildEtherscanTransaction(event.tx.txHash, event.tx.chainId),
    },
  };

  let tokenFrom: Token = getToToken({});
  let tokenTo: Token = getToToken({});
  let dcaBaseEventData: BaseDcaDataEvent = {
    hub: 'hub',
    positionId: 0,
    fromToken: { ...getToToken({}), icon: <></> },
    toToken: { ...getToToken({}), icon: <></> },
  };

  if (DCA_TYPE_EVENTS.includes(event.type)) {
    const typedEvent = event as BaseApiEvent & DcaTransactionApiDataEvent;

    const fromToUse = toToken({
      address: typedEvent.data.fromToken.token.address,
      chainId: event.tx.chainId,
      price: typedEvent.data.fromToken.price,
    });
    const toToUse = toToken({
      address: typedEvent.data.toToken.token.address,
      chainId: event.tx.chainId,
      price: typedEvent.data.toToken.price,
    });

    const fromTokenId = `${typedEvent.tx.chainId}-${fromToUse.address.toLowerCase()}` as TokenListId;
    const toTokenId = `${typedEvent.tx.chainId}-${toToUse.address.toLowerCase()}` as TokenListId;

    tokenFrom = tokenList[fromTokenId];
    tokenTo = tokenList[toTokenId];

    if (!tokenFrom || !tokenTo) return null;
    dcaBaseEventData = {
      hub: typedEvent.data.hub,
      positionId: Number(typedEvent.data.positionId),
      fromToken: { ...tokenFrom, price: fromToUse.price, icon: <TokenIcon size={8} token={tokenFrom} /> },
      toToken: { ...tokenTo, price: toToUse.price, icon: <TokenIcon size={8} token={tokenTo} /> },
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
  const tokenFrom = { ...position.from, icon: <TokenIcon size={8} token={position.from} /> };
  const tokenTo = { ...position.to, icon: <TokenIcon size={8} token={position.to} /> };
  const positionId = Number(position.positionId);
  const hub = HUB_ADDRESS[position.version][position.chainId];

  return {
    fromToken: tokenFrom,
    toToken: tokenTo,
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
            icon: <TokenIcon size={8} token={nativeCurrencyToken} />,
          },
          mainCurrency: { ...mainCurrencyToken, icon: <TokenIcon size={8} token={mainCurrencyToken} /> },
        },
        chainId: event.chainId,
        txHash: event.hash as Address,
        timestamp: event.addedTime,
        explorerLink: buildEtherscanTransaction(event.hash, event.chainId),
        initiatedBy: event.from as Address,
        spentInGas: {
          amount: spentInGasAmount,
          amountInUnits: formatCurrencyAmount({ amount: spentInGasAmount, token: nativeCurrencyToken }),
        },
        nativePrice: nativePrices[event.chainId] || 0,
      },
    };

    let parsedEvent: TransactionEvent;
    const position = transformStoredPositionToPosition(event.position);
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
        const amountInUnits = formatCurrencyAmount({ amount, token: approvedToken });

        parsedEvent = {
          type: TransactionEventTypes.ERC20_APPROVAL,
          data: {
            token: { ...approvedToken, icon: <TokenIcon size={8} token={approvedToken} /> },
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
      case TransactionTypes.earnCreate:
      case TransactionTypes.earnIncrease:
        const earnTokenId = getTokenListId({
          tokenAddress: event.typeData.asset.address,
          chainId: event.chainId,
        });

        const earnToken = tokenList[earnTokenId];
        if (!earnToken) return null;

        const assetAmount = BigInt(event.typeData.assetAmount);
        const assetAmountInUnits = formatCurrencyAmount({ amount: assetAmount, token: earnToken });

        parsedEvent = {
          type:
            event.type === TransactionTypes.earnCreate
              ? TransactionEventTypes.EARN_CREATED
              : TransactionEventTypes.EARN_INCREASE,
          data: {
            asset: { ...earnToken, icon: <TokenIcon size={8} token={earnToken} /> },
            assetAmount: {
              amount: assetAmount,
              amountInUnits: assetAmountInUnits,
              amountInUSD: isNil(event.typeData.asset.price)
                ? undefined
                : parseUsdPrice(earnToken, assetAmount, parseNumberUsdPriceToBigInt(event.typeData.asset.price)),
            },
            user: event.from as Address,
            tokenFlow: TransactionEventIncomingTypes.INCOMING,
            status: event.receipt ? TransactionStatus.DONE : TransactionStatus.PENDING,
            positionId: event.typeData.positionId,
            strategyId: event.typeData.strategyId,
          },
          ...baseEvent,
        } as TransactionEvent;
        break;
      case TransactionTypes.earnWithdraw: {
        const allTokensAreInTokenList = event.typeData.withdrawn
          .map((withdrawn) => `${event.chainId}-${withdrawn.token.address}` as TokenListId)
          .every((tokenId) => !!tokenList[tokenId]);

        if (!allTokensAreInTokenList) return null;

        parsedEvent = {
          type: TransactionEventTypes.EARN_WITHDRAW,
          data: {
            withdrawn: event.typeData.withdrawn.map((withdrawn) => {
              const tokenId = getTokenListId({
                tokenAddress: withdrawn.token.address,
                chainId: event.chainId,
              });
              const token = tokenList[tokenId];

              return {
                amount: {
                  amount: BigInt(withdrawn.amount),
                  amountInUnits: formatCurrencyAmount({ amount: BigInt(withdrawn.amount), token }),
                  amountInUSD: isNil(withdrawn.token.price)
                    ? undefined
                    : parseUsdPrice(
                        token,
                        BigInt(withdrawn.amount),
                        parseNumberUsdPriceToBigInt(withdrawn.token.price)
                      ),
                },
                token,
              };
            }),
            user: event.from as Address,
            tokenFlow: TransactionEventIncomingTypes.INCOMING,
            status: event.receipt ? TransactionStatus.DONE : TransactionStatus.PENDING,
            positionId: event.typeData.positionId,
            strategyId: event.typeData.strategyId,
            assetAddress: event.typeData.assetAddress,
          },
          ...baseEvent,
        } as TransactionEvent;
        break;
      }
      case TransactionTypes.swap:
        // case TransactionTypes.approveCompanion:
        const tokenIn =
          tokenList[getTokenListId({ tokenAddress: event.typeData.from.address, chainId: event.chainId })];
        const tokenOut = tokenList[getTokenListId({ tokenAddress: event.typeData.to.address, chainId: event.chainId })];

        if (!tokenIn || !tokenOut) return null;

        const swapAmountIn = event.typeData.amountFrom;
        const swapAmountInUnits = formatCurrencyAmount({ amount: swapAmountIn, token: tokenIn });
        const swapAmountOut = event.typeData.amountTo;
        const swapAmountOutUnits = formatCurrencyAmount({ amount: swapAmountOut, token: tokenOut });

        parsedEvent = {
          type: TransactionEventTypes.SWAP,
          data: {
            amountIn: {
              amount: BigInt(swapAmountIn),
              amountInUnits: swapAmountInUnits,
              amountInUSD: isNil(event.typeData.from.price)
                ? undefined
                : parseUsdPrice(
                    tokenIn,
                    BigInt(swapAmountIn),
                    parseNumberUsdPriceToBigInt(event.typeData.from.price)
                  ).toFixed(2),
            },
            amountOut: {
              amount: swapAmountOut,
              amountInUnits: swapAmountOutUnits,
              amountInUSD: isNil(event.typeData.to.price)
                ? undefined
                : parseUsdPrice(
                    tokenOut,
                    BigInt(swapAmountOut),
                    parseNumberUsdPriceToBigInt(event.typeData.to.price)
                  ).toFixed(2),
            },
            recipient: event.typeData.transferTo || event.from,
            swapContract: event.typeData.swapContract,
            tokenIn: { ...tokenIn, icon: <TokenIcon size={8} token={tokenIn} /> },
            tokenOut: { ...tokenOut, icon: <TokenIcon size={8} token={tokenOut} /> },
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
            token: { ...transferedToken, icon: <TokenIcon size={8} token={transferedToken} /> },
            amount: {
              amount: BigInt(event.typeData.amount),
              amountInUnits: formatCurrencyAmount({ amount: BigInt(event.typeData.amount), token: transferedToken }),
              amountInUSD: isNil(event.typeData.token.price)
                ? undefined
                : parseUsdPrice(
                    transferedToken,
                    BigInt(event.typeData.amount),
                    parseNumberUsdPriceToBigInt(event.typeData.token.price)
                  ).toFixed(2),
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
              amountInUnits: formatCurrencyAmount({
                amount: BigInt(withdrawnUnderlying),
                token: baseEventData.toToken,
              }),
              amountInUSD: isNil(baseEventData.toToken.price)
                ? undefined
                : parseUsdPrice(
                    baseEventData.toToken,
                    BigInt(withdrawnUnderlying),
                    parseNumberUsdPriceToBigInt(baseEventData.toToken.price)
                  ).toFixed(2),
            },
            // TODO CALCULATE YIELD
            withdrawnYield: undefined,
          },
          ...baseEvent,
        } as DCAWithdrawnEvent;
        break;
      case TransactionTypes.terminatePosition:
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
              amountInUnits: formatCurrencyAmount({
                amount: BigInt(event.typeData.remainingLiquidity),
                token: baseEventData.fromToken,
              }),
              amountInUSD: isNil(baseEventData.fromToken.price)
                ? undefined
                : parseUsdPrice(
                    baseEventData.fromToken,
                    BigInt(event.typeData.remainingLiquidity),
                    parseNumberUsdPriceToBigInt(baseEventData.fromToken.price)
                  ).toFixed(2),
            },
            withdrawnSwapped: {
              amount: BigInt(event.typeData.toWithdraw),
              amountInUnits: formatCurrencyAmount({
                amount: BigInt(event.typeData.toWithdraw),
                token: baseEventData.toToken,
              }),
              amountInUSD: isNil(baseEventData.toToken.price)
                ? undefined
                : parseUsdPrice(
                    baseEventData.toToken,
                    BigInt(event.typeData.toWithdraw),
                    parseNumberUsdPriceToBigInt(baseEventData.toToken.price)
                  ).toFixed(2),
            },
          },
          ...baseEvent,
        } as DCATerminatedEvent;
        break;
      case TransactionTypes.modifyRateAndSwapsPosition:
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
              amountInUnits: formatCurrencyAmount({ amount: position.rate.amount, token: baseEventData.fromToken }),
            },
            rate: {
              amount: BigInt(event.typeData.newRate),
              amountInUnits: formatCurrencyAmount({
                amount: BigInt(event.typeData.newRate),
                token: baseEventData.fromToken,
              }),
            },
            difference: {
              amount: difference,
              amountInUnits: formatCurrencyAmount({ amount: difference, token: baseEventData.fromToken }),
              amountInUSD: isNil(baseEventData.fromToken.price)
                ? undefined
                : parseUsdPrice(
                    baseEventData.fromToken,
                    difference,
                    parseNumberUsdPriceToBigInt(baseEventData.fromToken.price)
                  ).toFixed(2),
            },
            oldRemainingSwaps: Number(position.remainingSwaps),
            remainingSwaps: Number(event.typeData.newSwaps),
            remainingLiquidity: {
              amount: totalNow,
              amountInUnits: formatCurrencyAmount({ amount: totalNow, token: baseEventData.fromToken }),
              amountInUSD: isNil(baseEventData.fromToken.price)
                ? undefined
                : parseUsdPrice(
                    baseEventData.fromToken,
                    totalNow,
                    parseNumberUsdPriceToBigInt(baseEventData.fromToken.price)
                  ).toString(),
            },
            oldRemainingLiquidity: {
              amount: totalBefore,
              amountInUnits: formatCurrencyAmount({ amount: totalBefore, token: baseEventData.fromToken }),
              amountInUSD: isNil(baseEventData.fromToken.price)
                ? undefined
                : parseUsdPrice(
                    baseEventData.fromToken,
                    totalBefore,
                    parseNumberUsdPriceToBigInt(baseEventData.fromToken.price)
                  ).toString(),
            },
          },
          ...baseEvent,
        } as DCAModifiedEvent;
        break;
      case TransactionTypes.modifyPermissions:
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
              amountInUnits: formatCurrencyAmount({ amount: rate, token: event.typeData.from }),
              amountInUSD: isNil(event.typeData.from.price)
                ? undefined
                : parseUsdPrice(
                    event.typeData.from,
                    rate,
                    parseNumberUsdPriceToBigInt(event.typeData.from.price)
                  ).toFixed(2),
            },
            funds: {
              amount: funds,
              amountInUnits: formatCurrencyAmount({ amount: funds, token: event.typeData.from }),
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
