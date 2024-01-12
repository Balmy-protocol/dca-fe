import React from 'react';
import useTransactionService from './useTransactionService';
import {
  Address,
  NetworkStruct,
  TokenListByChainId,
  TransactionApiEvent,
  TransactionEvent,
  TransactionEventIncomingTypes,
  TransactionEventTypes,
  TransactionStatus,
  TransactionTypes,
} from 'common-types';
import { compact, find } from 'lodash';
import { NETWORKS, getGhTokenListLogoUrl } from '@constants';
import { formatCurrencyAmount, toToken } from '@common/utils/currency';
import { PROTOCOL_TOKEN_ADDRESS, getProtocolToken } from '@common/mocks/tokens';
import useTokenListByChainId from './useTokenListByChainId';
import { useAppDispatch } from '@state/hooks';
import { buildEtherscanTransaction } from '@common/utils/etherscan';
import { unwrapResult } from '@reduxjs/toolkit';
import { fetchTokenDetails } from '@state/token-lists/actions';
import TokenIcon from '@common/components/token-icon';
import { formatUnits, maxUint256, parseUnits } from 'viem';
import { useIsLoadingAllTokenLists } from '@state/token-lists/hooks';
import useAccountService from './useAccountService';
import { useAllPendingTransactions, useHasPendingTransactions } from '@state/transactions/hooks';
import { cleanTransactions } from '@state/transactions/actions';
import { getTransactionTokenFlow } from '@common/utils/transaction-history';

function useTransactionsHistory(): {
  events: TransactionEvent[];
  fetchMore: () => Promise<void>;
  isLoading: boolean;
} {
  const transactionService = useTransactionService();
  const [isHookLoading, setIsHookLoading] = React.useState(false);
  const { isLoading: isLoadingService, history } = transactionService.getStoredTransactionsHistory();

  const accountService = useAccountService();
  const historyEvents = React.useMemo(() => history?.events, [history]);
  const lastEventTimestamp = React.useMemo(
    () => historyEvents && historyEvents[historyEvents.length - 1]?.timestamp,
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
  // const wallets = useWalletsAddresses();
  const pendingTransactions = useAllPendingTransactions(); // TODO: Format and prepend pending transactions

  const transformPendingEvents = React.useCallback(
    async (
      events: ReturnType<typeof useAllPendingTransactions>,
      tokenList: TokenListByChainId,
      userWallets: string[]
    ): Promise<TransactionEvent[]> => {
      if (!events) return [];
      const eventsPromises = Object.entries(events).map<Promise<TransactionEvent | null>>(async ([, event]) => {
        const network = find(NETWORKS, { chainId: event.chainId }) as NetworkStruct;
        const nativeCurrencyToken = toToken({
          ...network?.nativeCurrency,
          logoURI: network.nativeCurrency.logoURI || getGhTokenListLogoUrl(event.chainId, 'logo'),
        });
        const mainCurrencyToken = toToken({
          address: network?.mainCurrency || '',
          chainId: event.chainId,
          logoURI: getGhTokenListLogoUrl(event.chainId, 'logo'),
        });

        const protocolToken = getProtocolToken(event.chainId);
        const baseEvent = {
          network: {
            ...network,
            nativeCurrency: {
              ...nativeCurrencyToken,
              icon: <TokenIcon token={nativeCurrencyToken} />,
            },
            mainCurrency: { ...mainCurrencyToken, icon: <TokenIcon token={mainCurrencyToken} /> },
          },
          chainId: event.chainId,
          txHash: event.hash as Address,
          timestamp: event.addedTime,
          explorerLink: buildEtherscanTransaction(event.hash, event.chainId),
        };

        let parsedEvent: TransactionEvent;

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

            const amount = 'amount' in event.typeData ? event.typeData.amount : maxUint256.toString();
            const amountInUnits = formatCurrencyAmount(BigInt(amount), approvedToken);

            parsedEvent = {
              type: TransactionEventTypes.ERC20_APPROVAL,
              token: { ...approvedToken, icon: <TokenIcon token={approvedToken} /> },
              amount: {
                amount,
                amountInUnits,
              },
              owner: event.from as Address,
              spender: event.typeData.addressFor as Address,
              status: TransactionStatus.PENDING,
              ...baseEvent,
            };

            return parsedEvent;
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
              token: { ...transferedToken, icon: <TokenIcon token={transferedToken} /> },
              amount: {
                amount: event.typeData.amount,
                amountInUnits: formatCurrencyAmount(BigInt(event.typeData.amount), transferedToken),
              },
              from: event.from as Address,
              to: event.typeData.to as Address,
              tokenFlow: TransactionEventIncomingTypes.OUTGOING,
              status: TransactionStatus.PENDING,
              ...baseEvent,
            } as TransactionEvent;

            return {
              ...parsedEvent,
              tokenFlow: getTransactionTokenFlow(parsedEvent, userWallets),
            };
          default:
            return Promise.resolve(null);
        }
      });
      const resolvedEvents = await Promise.all(eventsPromises);
      return compact(resolvedEvents);
    },
    []
  );

  const transformEvents = React.useCallback(
    async (events: TransactionApiEvent[], tokenList: TokenListByChainId, userWallets: string[]) => {
      if (!events) return [];
      const eventsPromises = events.map<Promise<TransactionEvent>>(async (event) => {
        const network = find(NETWORKS, { chainId: event.chainId }) as NetworkStruct;
        const nativeCurrencyToken = toToken({
          ...network?.nativeCurrency,
          logoURI: network.nativeCurrency.logoURI || getGhTokenListLogoUrl(event.chainId, 'logo'),
        });
        const mainCurrencyToken = toToken({
          address: network?.mainCurrency || '',
          chainId: event.chainId,
          logoURI: getGhTokenListLogoUrl(event.chainId, 'logo'),
        });

        const protocolToken = getProtocolToken(event.chainId);
        const baseEvent = {
          spentInGas: {
            amount: event.spentInGas,
            amountInUnits: formatCurrencyAmount(BigInt(event.spentInGas), protocolToken),
            amountInUSD:
              event.nativePrice === null
                ? undefined
                : parseFloat(
                    formatUnits(
                      BigInt(event.spentInGas) * parseUnits(event.nativePrice.toString() || '0', 18),
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
          chainId: event.chainId,
          txHash: event.txHash,
          timestamp: event.timestamp,
          nativePrice: event.nativePrice,
          explorerLink: buildEtherscanTransaction(event.txHash, event.chainId),
        };

        let parsedEvent: TransactionEvent;
        switch (event.type) {
          case TransactionEventTypes.ERC20_APPROVAL:
            const approvedToken = unwrapResult(
              await dispatch(
                fetchTokenDetails({
                  tokenAddress: event.token,
                  chainId: event.chainId,
                  tokenList: tokenList[event.chainId],
                })
              )
            );

            parsedEvent = {
              type: TransactionEventTypes.ERC20_APPROVAL,
              token: { ...approvedToken, icon: <TokenIcon token={approvedToken} /> },
              amount: {
                amount: event.amount,
                amountInUnits: formatCurrencyAmount(BigInt(event.amount), approvedToken),
              },
              owner: event.owner,
              spender: event.spender,
              status: TransactionStatus.DONE,
              ...baseEvent,
            };

            return parsedEvent;
          case TransactionEventTypes.ERC20_TRANSFER:
            const transferedToken = unwrapResult(
              await dispatch(
                fetchTokenDetails({
                  tokenAddress: event.token,
                  chainId: event.chainId,
                  tokenList: tokenList[event.chainId],
                })
              )
            );
            parsedEvent = {
              type: TransactionEventTypes.ERC20_TRANSFER,
              token: { ...transferedToken, icon: <TokenIcon token={transferedToken} /> },
              amount: {
                amount: event.amount,
                amountInUnits: formatCurrencyAmount(BigInt(event.amount), transferedToken),
                amountInUSD:
                  event.tokenPrice === null
                    ? undefined
                    : parseFloat(
                        formatUnits(
                          BigInt(event.amount) * parseUnits(event.tokenPrice.toString(), 18),
                          transferedToken.decimals + 18
                        )
                      ).toFixed(2),
              },
              from: event.from,
              to: event.to,
              tokenPrice: event.tokenPrice,
              tokenFlow: TransactionEventIncomingTypes.OUTGOING,
              status: TransactionStatus.DONE,
              ...baseEvent,
            };

            return {
              ...parsedEvent,
              tokenFlow: getTransactionTokenFlow(parsedEvent, userWallets),
            };
          case TransactionEventTypes.NATIVE_TRANSFER:
            parsedEvent = {
              type: TransactionEventTypes.NATIVE_TRANSFER,
              token: { ...protocolToken, icon: <TokenIcon token={protocolToken} /> },
              amount: {
                amount: event.amount,
                amountInUnits: formatCurrencyAmount(BigInt(event.amount), protocolToken),
                amountInUSD:
                  event.nativePrice === null
                    ? undefined
                    : parseFloat(
                        formatUnits(
                          BigInt(event.amount) * parseUnits(event.nativePrice.toString(), 18),
                          protocolToken.decimals + 18
                        )
                      ).toFixed(2),
              },
              from: event.from,
              to: event.to,
              tokenFlow: TransactionEventIncomingTypes.OUTGOING,
              status: TransactionStatus.DONE,
              ...baseEvent,
            };

            return {
              ...parsedEvent,
              tokenFlow: getTransactionTokenFlow(parsedEvent, userWallets),
            };
        }
      });
      const resolvedEvents = await Promise.all(eventsPromises);

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
        accountService.getWallets().map(({ address }) => address)
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
