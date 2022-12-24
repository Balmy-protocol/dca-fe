import React from 'react';
import isEqual from 'lodash/isEqual';
import usePrevious from 'hooks/usePrevious';
import { useHasPendingTransactions } from 'state/transactions/hooks';
import { BigNumber } from 'ethers';
import { emptyTokenWithAddress } from 'utils/currency';
import { useBlockNumber } from 'state/block-number/hooks';
import useCurrentNetwork from './useCurrentNetwork';
import useWalletService from './useWalletService';
import usePriceService from './usePriceService';
import useAccount from './useAccount';

function useMulticallBalances(
  tokens: string[] | undefined | null
): [Record<string, { balance: BigNumber; balanceUsd: BigNumber }> | undefined, boolean, string?] {
  const walletService = useWalletService();
  const priceService = usePriceService();
  const [{ isLoading, result, error }, setState] = React.useState<{
    isLoading: boolean;
    result?: Record<string, { balance: BigNumber; balanceUsd: BigNumber }>;
    error?: string;
  }>({
    isLoading: false,
    result: undefined,
    error: undefined,
  });

  const hasPendingTransactions = useHasPendingTransactions();
  const prevTokens = usePrevious(tokens);
  const prevPendingTrans = usePrevious(hasPendingTransactions);
  const account = useAccount();
  const prevAccount = usePrevious(account);
  const currentNetwork = useCurrentNetwork();
  const blockNumber = useBlockNumber(currentNetwork.chainId);
  const prevBlockNumber = usePrevious(blockNumber);
  const prevResult = usePrevious(result, false);

  React.useEffect(() => {
    async function callPromise() {
      if (tokens?.length) {
        try {
          const balanceResults = await walletService.getMulticallBalances(tokens);

          const priceResults = await priceService.getUsdHistoricPrice(tokens.map((key) => emptyTokenWithAddress(key)));

          const promiseResult = tokens.reduce(
            (acc, token) => ({
              ...acc,
              [token]: {
                balance: balanceResults[token],
                balanceUsd: (balanceResults[token] || BigNumber.from(0)).mul(priceResults[token] || BigNumber.from(0)),
              },
            }),
            {}
          );

          setState({ isLoading: false, result: promiseResult, error: undefined });
        } catch (e) {
          console.error('error fetching balances', e);
          setState({ result: undefined, error: e as string, isLoading: false });
        }
      }
    }

    if (
      (!isLoading && !result && !error) ||
      !isEqual(prevTokens, tokens) ||
      !isEqual(account, prevAccount) ||
      !isEqual(prevPendingTrans, hasPendingTransactions) ||
      (blockNumber &&
        prevBlockNumber &&
        blockNumber !== -1 &&
        prevBlockNumber !== -1 &&
        !isEqual(prevBlockNumber, blockNumber))
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
    prevBlockNumber,
    blockNumber,
    walletService,
    prevPendingTrans,
  ]);

  if (!tokens?.length) {
    return [undefined, false, undefined];
  }

  return [result || prevResult, isLoading, error];
}

export default useMulticallBalances;
