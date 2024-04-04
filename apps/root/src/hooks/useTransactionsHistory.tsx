import React from 'react';
import useTransactionService from './useTransactionService';
import {
  Address,
  BaseDcaDataEvent,
  DCACreatedEvent,
  DCAModifiedEvent,
  DCAPermissionsModifiedEvent,
  DCATerminatedEvent,
  DCATransferEvent,
  DCAWithdrawnEvent,
  NetworkStruct,
  Position,
  TokenListByChainId,
  TransactionApiEvent,
  TransactionEvent,
  TransactionEventIncomingTypes,
  TransactionEventTypes,
  TransactionStatus,
  TransactionTypes,
} from 'common-types';
import { compact, find, fromPairs } from 'lodash';
import { HUB_ADDRESS, NETWORKS } from '@constants';
import { formatCurrencyAmount, getNetworkCurrencyTokens } from '@common/utils/currency';
import { PROTOCOL_TOKEN_ADDRESS, getProtocolToken } from '@common/mocks/tokens';
import useTokenListByChainId from './useTokenListByChainId';
import { useAppDispatch } from '@state/hooks';
import { buildEtherscanTransaction } from '@common/utils/etherscan';
import { unwrapResult } from '@reduxjs/toolkit';
import { fetchTokenDetails } from '@state/token-lists/actions';
import TokenIcon from '@common/components/token-icon';
import { maxUint256, parseUnits } from 'viem';
import { useIsLoadingAllTokenLists } from '@state/token-lists/hooks';
import { useAllPendingTransactions, useHasPendingTransactions } from '@state/transactions/hooks';
import { cleanTransactions } from '@state/transactions/actions';
import { getTransactionTokenFlow } from '@common/utils/transaction-history';
import parseMultipleTransactionApiEventsToTransactionEvents from '@common/utils/transaction-history/parsing';
import useServiceEvents from './useServiceEvents';
import TransactionService, { TransactionServiceData } from '@services/transactionService';
import useWallets from './useWallets';

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
function useTransactionsHistory(): {
  events: TransactionEvent[];
  fetchMore: () => Promise<void>;
  isLoading: boolean;
} {
  const transactionService = useTransactionService();
  const [isHookLoading, setIsHookLoading] = React.useState(false);

  const { isLoading: isLoadingService, history } = useServiceEvents<
    TransactionServiceData,
    TransactionService,
    'getStoredTransactionsHistory'
  >(transactionService, 'getStoredTransactionsHistory');

  const storedWallets = useWallets();
  const historyEvents = React.useMemo(() => history?.events, [history]);
  const lastEventTimestamp = React.useMemo(
    () => historyEvents && historyEvents[historyEvents.length - 1]?.tx.timestamp,
    [historyEvents]
  );
  const hasMoreEvents = React.useMemo(() => history?.pagination.moreEvents, [history]);
  const indexing = React.useMemo(() => history?.indexing, [history]);
  const tokenListByChainId = useTokenListByChainId();
  const isLoadingTokenLists = useIsLoadingAllTokenLists();
  const dispatch = useAppDispatch();
  const [parsedEvents, setParsedEvents] = React.useState<TransactionEvent[]>([]);
  const hasPendingTransactions = useHasPendingTransactions();
  const isLoading = isHookLoading || isLoadingService;
  const pendingTransactions = useAllPendingTransactions();

  const transformPendingEvents = React.useCallback(
    async (
      events: ReturnType<typeof useAllPendingTransactions>,
      tokenList: TokenListByChainId,
      userWallets: string[]
    ): Promise<TransactionEvent[]> => {
      if (!events) return [];
      const eventsPromises = Object.entries(events).map<Promise<TransactionEvent | null>>(async ([, event]) => {
        const network = find(NETWORKS, { chainId: event.chainId }) as NetworkStruct;

        const { nativeCurrencyToken, mainCurrencyToken } = getNetworkCurrencyTokens(network);

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
              amount: 0n,
              amountInUnits: '0',
            },
            nativePrice: 0,
          },
        };

        let parsedEvent: TransactionEvent;
        let position;
        let baseEventData;

        switch (event.type) {
          case TransactionTypes.approveTokenExact:
          case TransactionTypes.approveToken:
            // case TransactionTypes.approveCompanion:
            const approvedToken = unwrapResult(
              await dispatch(
                fetchTokenDetails({
                  tokenAddress: event.typeData.token.address,
                  chainId: event.chainId,
                  tokenList: tokenList[event.chainId],
                })
              )
            );

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
                status: TransactionStatus.PENDING,
                tokenFlow: TransactionEventIncomingTypes.OUTGOING,
              },
              ...baseEvent,
            } as TransactionEvent;
            break;
          case TransactionTypes.swap:
            // case TransactionTypes.approveCompanion:
            const tokenIn = unwrapResult(
              await dispatch(
                fetchTokenDetails({
                  tokenAddress: event.typeData.to.address,
                  chainId: event.chainId,
                  tokenList: tokenList[event.chainId],
                })
              )
            );
            const tokenOut = unwrapResult(
              await dispatch(
                fetchTokenDetails({
                  tokenAddress: event.typeData.from.address,
                  chainId: event.chainId,
                  tokenList: tokenList[event.chainId],
                })
              )
            );

            const swapAmountIn = event.typeData.amountTo;
            const swapAmountInUnits = formatCurrencyAmount(swapAmountIn, tokenIn);
            const swapAmountOut = event.typeData.amountFrom;
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
                recipient: event.typeData.transferTo,
                swapContract: event.typeData.swapContract,
                tokenIn: { ...tokenIn, icon: <TokenIcon size={5} token={tokenIn} /> },
                tokenOut: { ...tokenOut, icon: <TokenIcon size={5} token={tokenOut} /> },
                type: event.typeData.type,
                status: TransactionStatus.PENDING,
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
                : unwrapResult(
                    await dispatch(
                      fetchTokenDetails({
                        tokenAddress: event.typeData.token.address,
                        chainId: event.chainId,
                        tokenList: tokenList[event.chainId],
                      })
                    )
                  );
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
                status: TransactionStatus.PENDING,
              },
              ...baseEvent,
            } as TransactionEvent;
            break;
          case TransactionTypes.withdrawPosition:
            position = event.position;

            if (!position) {
              return Promise.resolve(null);
            }

            baseEventData = buildBaseDcaPendingEventData(position);
            const withdrawnUnderlying = event.typeData.withdrawnUnderlying;

            parsedEvent = {
              type: TransactionEventTypes.DCA_WITHDRAW,
              data: {
                ...buildBaseDcaPendingEventData(position),
                tokenFlow: TransactionEventIncomingTypes.INCOMING,
                status: TransactionStatus.PENDING,
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
              return Promise.resolve(null);
            }

            baseEventData = buildBaseDcaPendingEventData(position);

            parsedEvent = {
              type: TransactionEventTypes.DCA_TERMINATED,
              data: {
                ...buildBaseDcaPendingEventData(position),
                tokenFlow: TransactionEventIncomingTypes.INCOMING,
                status: TransactionStatus.PENDING,
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
              return Promise.resolve(null);
            }

            baseEventData = buildBaseDcaPendingEventData(position);

            const totalBefore = position.rate.amount * BigInt(position.remainingSwaps);
            const totalNow = BigInt(event.typeData.newRate) * BigInt(event.typeData.newSwaps);

            const difference = totalBefore > totalNow ? totalBefore - totalNow : totalNow - totalBefore;

            parsedEvent = {
              type: TransactionEventTypes.DCA_MODIFIED,
              data: {
                ...buildBaseDcaPendingEventData(position),
                tokenFlow: TransactionEventIncomingTypes.INCOMING,
                status: TransactionStatus.PENDING,
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
              return Promise.resolve(null);
            }

            baseEventData = buildBaseDcaPendingEventData(position);

            parsedEvent = {
              type: TransactionEventTypes.DCA_PERMISSIONS_MODIFIED,
              data: {
                ...buildBaseDcaPendingEventData(position),
                tokenFlow: TransactionEventIncomingTypes.INCOMING,
                status: TransactionStatus.PENDING,
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
              return Promise.resolve(null);
            }

            baseEventData = buildBaseDcaPendingEventData(position);

            parsedEvent = {
              type: TransactionEventTypes.DCA_TRANSFER,
              data: {
                ...buildBaseDcaPendingEventData(position),
                tokenFlow: TransactionEventIncomingTypes.INCOMING,
                status: TransactionStatus.PENDING,
                from: position.user,
                to: event.typeData.toAddress,
              },
              ...baseEvent,
            } as DCATransferEvent;
            break;
          case TransactionTypes.newPosition:
            position = event.position;

            if (!position) {
              return Promise.resolve(null);
            }

            baseEventData = buildBaseDcaPendingEventData(position);

            const rate = parseUnits(event.typeData.fromValue, event.typeData.from.decimals);
            const funds = rate * BigInt(event.typeData.frequencyValue);

            parsedEvent = {
              type: TransactionEventTypes.DCA_CREATED,
              data: {
                ...buildBaseDcaPendingEventData(position),
                tokenFlow: TransactionEventIncomingTypes.INCOMING,
                status: TransactionStatus.PENDING,
                // TODO CALCULATE YIELD
                rate: {
                  amount: rate,
                  amountInUnits: formatCurrencyAmount(rate, baseEventData.fromToken),
                },
                funds: {
                  amount: funds,
                  amountInUnits: formatCurrencyAmount(funds, baseEventData.fromToken),
                },
                swapInterval: Number(event.typeData.frequencyType),
                swaps: Number(event.typeData.frequencyValue),
              },
              ...baseEvent,
            } as DCACreatedEvent;
            break;
          default:
            return Promise.resolve(null);
        }

        return {
          ...parsedEvent,
          data: {
            ...parsedEvent.data,
            tokenFlow: getTransactionTokenFlow(parsedEvent, userWallets),
          },
        } as TransactionEvent;
      });
      const resolvedEvents = await Promise.all(eventsPromises);
      return compact(resolvedEvents);
    },
    []
  );

  const transformEvents = React.useCallback(
    async (events: TransactionApiEvent[], tokenList: TokenListByChainId, userWallets: string[]) => {
      if (!events) return [];
      const eventsPromises = parseMultipleTransactionApiEventsToTransactionEvents(
        events,
        dispatch,
        tokenList,
        userWallets
      ).map((promise) =>
        promise.catch((e) => {
          console.error('Failed to parse event', e);
          return null;
        })
      );

      const resolvedEvents = compact(await Promise.all(eventsPromises));

      const pendingEvents = await transformPendingEvents(pendingTransactions, tokenList, userWallets);

      resolvedEvents.unshift(...pendingEvents);

      setParsedEvents(resolvedEvents);
    },
    [pendingTransactions]
  );

  React.useEffect(() => {
    if (!isLoadingTokenLists && historyEvents && !isLoading) {
      void transformEvents(
        historyEvents,
        tokenListByChainId,
        storedWallets.map(({ address }) => address)
      );

      if (indexing) dispatch(cleanTransactions({ indexing }));
    }
    // Whenever the events, the token list or any pending transaction changes, we want to retrigger this
  }, [historyEvents, indexing, isLoadingTokenLists, isLoading, hasPendingTransactions]);

  const fetchMore = React.useCallback(async () => {
    if (!isLoading && hasMoreEvents) {
      try {
        setIsHookLoading(true);
        await transactionService.fetchTransactionsHistory(lastEventTimestamp || Date.now());
      } catch (e) {
        console.error('Error while fetching transactions', e);
      }
      setIsHookLoading(false);
    }
  }, [lastEventTimestamp, hasMoreEvents]);

  return { events: parsedEvents, fetchMore, isLoading: isLoading };
}

export default useTransactionsHistory;
