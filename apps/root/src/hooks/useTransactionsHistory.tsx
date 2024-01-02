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
import { formatUnits } from 'viem';
import { useIsLoadingAllTokenLists } from '@state/token-lists/hooks';

function useTransactionsHistory(): {
  events: TransactionEvent[];
  fetchMore: () => Promise<void>;
  isLoading: boolean;
} {
  const transactionService = useTransactionService();
  const { isLoading, history } = transactionService.getStoredTransactionsHistory();

  const lastEventTimestamp = React.useMemo(() => history?.events[history?.events.length - 1]?.timestamp, [history]);
  const hasMoreEvents = React.useMemo(() => history?.pagination.moreEvents, [history]);
  const tokenListByChainId = useTokenListByChainId();
  const isLoadingTokenLists = useIsLoadingAllTokenLists();
  const dispatch = useAppDispatch();
  const [parsedEvents, setParsedEvents] = React.useState<TransactionEvent[]>([]);
  // const pendingTransactions = useAllPendingTransactions(); // TODO: Format and prepend pending transactions

  const transformEvents = React.useCallback(async (events: TransactionApiEvent[], tokenList: TokenListByChainId) => {
    if (!events) return [];
    const eventsPromises = events.map<Promise<TransactionEvent>>(async (event) => {
      const network = find(NETWORKS, { chainId: event.chainId }) as NetworkStruct;
      const nativeCurrencyToken = toToken({ ...network?.nativeCurrency });
      const mainCurrencyToken = toToken({
        address: network?.mainCurrency || '',
        chainId: event.chainId,
        logoURI: getGhTokenListLogoUrl(event.chainId, 'logo'),
      });

      const baseEvent = {
        spentInGas: {
          amount: event.spentInGas,
          amountInUnits: formatCurrencyAmount(BigInt(event.spentInGas), getProtocolToken(event.chainId)),
          amountInUSD: (Number(event.spentInGas) * event.nativePrice).toString(),
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
            token: { ...approvedToken, icon: <TokenIcon token={approvedToken} size="32px" /> },
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
            token: { ...transferedToken, icon: <TokenIcon token={transferedToken} size="32px" /> },
            amount: {
              amount: event.amount,
              amountInUnits: formatCurrencyAmount(BigInt(event.amount), transferedToken),
              amountUsd: parseFloat(formatUnits(BigInt(event.amount), transferedToken.decimals)) * event.tokenPrice,
            },
            from: event.from,
            to: event.to,
            tokenPrice: event.tokenPrice,
            ...baseEvent,
          };
        case TransactionEventTypes.NATIVE_TRANSFER:
          const protocolToken = getProtocolToken(event.chainId);
          return {
            type: TransactionEventTypes.NATIVE_TRANSFER,
            token: { ...protocolToken, icon: <TokenIcon token={protocolToken} size="32px" /> },
            amount: {
              amount: event.amount,
              amountInUnits: formatCurrencyAmount(BigInt(event.amount), protocolToken),
              amountUsd: parseFloat(formatUnits(BigInt(event.amount), protocolToken.decimals)) * event.nativePrice,
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
    if (!isLoadingTokenLists && history?.events) {
      void transformEvents(history.events, tokenListByChainId);
    }
  }, [history, isLoadingTokenLists]);

  const fetchMore = React.useCallback(async () => {
    if (!isLoading && hasMoreEvents) {
      try {
        await transactionService.fetchTransactionsHistory(lastEventTimestamp || Date.now());
      } catch (e) {
        console.error('Error while fetching transactions', e);
      }
    }
  }, [lastEventTimestamp, hasMoreEvents]);
  return { events: parsedEvents, fetchMore, isLoading: isLoading };
}

export default useTransactionsHistory;
