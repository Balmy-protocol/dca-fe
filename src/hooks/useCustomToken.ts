import React from 'react';
import { Token } from 'types';
import isEqual from 'lodash/isEqual';
import usePrevious from 'hooks/usePrevious';
import { useHasPendingTransactions } from 'state/transactions/hooks';
import { BigNumber } from 'ethers';
import { emptyTokenWithAddress } from 'utils/currency';
import { useBlockNumber } from 'state/block-number/hooks';
import useCurrentNetwork from './useCurrentNetwork';
import useWalletService from './useWalletService';
import usePriceService from './usePriceService';

function useCustomToken(
  tokenAddress?: string | null,
  skip?: boolean
): [{ token: Token; balance: BigNumber; balanceUsd: BigNumber } | undefined, boolean, string?] {
  const walletService = useWalletService();
  const [{ isLoading, result, error }, setState] = React.useState<{
    isLoading: boolean;
    result?: { token: Token; balance: BigNumber; balanceUsd: BigNumber };
    error?: string;
  }>({
    isLoading: false,
    result: undefined,
    error: undefined,
  });

  const priceService = usePriceService();
  const hasPendingTransactions = useHasPendingTransactions();
  const prevTokenAddress = usePrevious(tokenAddress);
  const prevPendingTrans = usePrevious(hasPendingTransactions);
  const prevAccount = usePrevious(walletService.getAccount());
  const account = walletService.getAccount();
  const currentNetwork = useCurrentNetwork();
  const blockNumber = useBlockNumber(currentNetwork.chainId);
  const prevBlockNumber = usePrevious(blockNumber);
  const prevResult = usePrevious(result, false);
  const prevSkip = usePrevious(skip);

  React.useEffect(() => {
    async function callPromise() {
      if (tokenAddress) {
        try {
          const balanceResult = await walletService.getCustomToken(tokenAddress);

          if (balanceResult) {
            const priceResults = await priceService.getUsdHistoricPrice([emptyTokenWithAddress(tokenAddress)]);

            let balanceUsd = BigNumber.from(0);
            try {
              balanceUsd = (balanceResult.balance || BigNumber.from(0)).mul(
                priceResults[tokenAddress] || BigNumber.from(0)
              );
            } catch (e) {
              console.error('Error parsing balanceUsd for custom token');
            }

            const promiseResult = {
              ...balanceResult,
              balanceUsd,
            };
            setState({ isLoading: false, result: promiseResult, error: undefined });
          }
        } catch (e) {
          setState({ result: undefined, error: e as string, isLoading: false });
        }
      }
    }

    if (
      !skip &&
      ((!isLoading && !result && !error) ||
        !isEqual(prevTokenAddress, tokenAddress) ||
        !isEqual(prevSkip, skip) ||
        !isEqual(account, prevAccount) ||
        !isEqual(prevPendingTrans, hasPendingTransactions) ||
        (blockNumber &&
          prevBlockNumber &&
          blockNumber !== -1 &&
          prevBlockNumber !== -1 &&
          !isEqual(prevBlockNumber, blockNumber)))
    ) {
      setState({ isLoading: true, result: undefined, error: undefined });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [
    tokenAddress,
    skip,
    prevSkip,
    isLoading,
    result,
    error,
    hasPendingTransactions,
    prevAccount,
    account,
    prevBlockNumber,
    blockNumber,
    prevTokenAddress,
    walletService,
    prevPendingTrans,
    priceService,
  ]);

  if (!tokenAddress) {
    return [undefined, false, undefined];
  }

  return [result || prevResult, isLoading, error];
}

export default useCustomToken;
