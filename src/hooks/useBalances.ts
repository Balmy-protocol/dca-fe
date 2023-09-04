import React, { useCallback } from 'react';
import { Token } from 'types';
import isEqual from 'lodash/isEqual';
import usePrevious from '@hooks/usePrevious';
import { useHasPendingTransactions } from '@state/transactions/hooks';
import { BigNumber } from 'ethers';
import { IntervalSetActions } from '@constants/timing';
import useSelectedNetwork from './useSelectedNetwork';
import usePriceService from './usePriceService';
import useAccount from './useAccount';
import useSdkService from './useSdkService';
import useInterval from './useInterval';

interface BalanceResponse {
  balance: BigNumber;
  balanceUsd?: BigNumber;
}

interface Result {
  balances: Record<string, BalanceResponse>;
  chainId: number;
}

function useBalances(tokens: Token[] | undefined | null): [Result | undefined, boolean, string?] {
  const account = useAccount();
  const sdkService = useSdkService();
  const [{ isLoading, result, error }, setState] = React.useState<{
    isLoading: boolean;
    result?: Result;
    error?: string;
  }>({
    isLoading: false,
    result: undefined,
    error: undefined,
  });

  const hasPendingTransactions = useHasPendingTransactions();
  const prevTokens = usePrevious(tokens);
  const prevPendingTrans = usePrevious(hasPendingTransactions);
  const prevAccount = usePrevious(account);
  const currentNetwork = useSelectedNetwork();
  const prevCurrentNetwork = usePrevious(currentNetwork);
  const priceService = usePriceService();
  const prevResult = usePrevious(result, false);

  const fetchBalances = useCallback(() => {
    async function callPromise() {
      if (tokens) {
        try {
          const balanceResults = await sdkService.getMultipleBalances(tokens);

          let priceResults: Record<string, BigNumber> = {};

          try {
            priceResults = await priceService.getUsdHistoricPrice(
              tokens.filter((token) =>
                (balanceResults[token.chainId][token.address] || BigNumber.from(0)).gt(BigNumber.from(0))
              ),
              undefined,
              currentNetwork.chainId
            );
          } catch (e) {
            console.error('Error fetching prices from defillama', e);
          }

          const promiseResult = tokens.reduce(
            (acc, token) => ({
              ...acc,
              [token.address]: {
                balance: balanceResults[token.chainId][token.address],
                balanceUsd:
                  priceResults[token.address] &&
                  (balanceResults[token.chainId][token.address] || BigNumber.from(0)).mul(priceResults[token.address]),
              },
            }),
            {}
          );
          setState({
            isLoading: false,
            result: { balances: promiseResult, chainId: currentNetwork.chainId },
            error: undefined,
          });
        } catch (e) {
          setState({ result: undefined, error: e as string, isLoading: false });
        }
      }
    }

    if (
      (!isLoading && !result && !error) ||
      !isEqual(prevTokens, tokens) ||
      !isEqual(account, prevAccount) ||
      !isEqual(prevPendingTrans, hasPendingTransactions) ||
      !isEqual(prevCurrentNetwork?.chainId, currentNetwork.chainId)
    ) {
      setState({ isLoading: true, result: undefined, error: undefined });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [
    tokens,
    prevTokens,
    isLoading,
    result,
    error,
    hasPendingTransactions,
    prevAccount,
    account,
    currentNetwork.chainId,
    prevCurrentNetwork?.chainId,
    sdkService,
    prevPendingTrans,
  ]);

  useInterval(fetchBalances, IntervalSetActions.balance);

  if (!tokens || !tokens.length) {
    return [undefined, false, undefined];
  }

  return [result || prevResult, isLoading, error];
}

export default useBalances;
