import React from 'react';
import useTransactionService from './useTransactionService';
import {
  NetworkStruct,
  TokenListByChainId,
  TransactionApiEvent,
  TransactionEvent,
  TransactionEventTypes,
} from 'common-types';
import { find } from 'lodash';
import { NETWORKS, getGhTokenListLogoUrl } from '@constants';
import { formatCurrencyAmount, toToken } from '@common/utils/currency';
import { getProtocolToken } from '@common/mocks/tokens';
import useTokenListByChainId from './useTokenListByChainId';
import { useAppDispatch } from '@state/hooks';
import { buildEtherscanTransaction } from '@common/utils/etherscan';
import { unwrapResult } from '@reduxjs/toolkit';
import { fetchTokenDetails } from '@state/token-lists/actions';
import TokenIcon from '@common/components/token-icon';
import { formatUnits, parseUnits } from 'viem';
import { useIsLoadingAllTokenLists } from '@state/token-lists/hooks';

function useTransactionsHistory(): {
  events: TransactionEvent[];
  fetchMore: () => Promise<void>;
  isLoading: boolean;
} {
  const transactionService = useTransactionService();
  const [isHookLoading, setIsHookLoading] = React.useState(false);
  const { isLoading: isLoadingService, history } = transactionService.getStoredTransactionsHistory();

  const lastEventTimestamp = React.useMemo(() => history?.events[history?.events.length - 1]?.timestamp, [history]);
  const hasMoreEvents = React.useMemo(() => history?.pagination.moreEvents, [history]);
  const tokenListByChainId = useTokenListByChainId();
  const isLoadingTokenLists = useIsLoadingAllTokenLists();
  const dispatch = useAppDispatch();
  const [parsedEvents, setParsedEvents] = React.useState<TransactionEvent[]>([]);

  const isLoading = isHookLoading || isLoadingService;
  // const pendingTransactions = useAllPendingTransactions(); // TODO: Format and prepend pending transactions

  const transformEvents = React.useCallback(async (events: TransactionApiEvent[], tokenList: TokenListByChainId) => {
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

          return {
            type: TransactionEventTypes.ERC20_APPROVAL,
            token: { ...approvedToken, icon: <TokenIcon token={approvedToken} /> },
            amount: {
              amount: event.amount,
              amountInUnits: formatCurrencyAmount(BigInt(event.amount), approvedToken),
            },
            owner: event.owner,
            spender: event.spender,
            ...baseEvent,
          };
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
          return {
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
            ...baseEvent,
          };
        case TransactionEventTypes.NATIVE_TRANSFER:
          return {
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
            ...baseEvent,
          };
      }
    });
    const resolvedEvents = await Promise.all(eventsPromises);
    setParsedEvents(resolvedEvents);
  }, []);

  React.useEffect(() => {
    if (!isLoadingTokenLists && history?.events && !isLoading) {
      void transformEvents(history.events, tokenListByChainId);
    }
  }, [history, isLoadingTokenLists, isLoading]);

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
