import React from 'react';
import isEqual from 'lodash/isEqual';
import usePrevious from '@hooks/usePrevious';
import { useHasPendingTransactions } from '@state/transactions/hooks';
import { BigNumber } from 'ethers';
import { useBlockNumber } from '@state/block-number/hooks';
import useAccount from './useAccount';
import useSdkService from './useSdkService';

function useSdkAllowances(
  tokenChecks: Record<string, string> | undefined | null,
  chainId: number
): [Record<string, Record<string, BigNumber>> | undefined, boolean, string?] {
  const account = useAccount();
  const sdkService = useSdkService();
  const [{ isLoading, result, error }, setState] = React.useState<{
    isLoading: boolean;
    result?: Record<string, Record<string, BigNumber>>;
    error?: string;
  }>({
    isLoading: false,
    result: undefined,
    error: undefined,
  });

  const hasPendingTransactions = useHasPendingTransactions();
  const prevTokenChecks = usePrevious(tokenChecks);
  const prevChainId = usePrevious(chainId);
  const prevPendingTrans = usePrevious(hasPendingTransactions);
  const prevAccount = usePrevious(account);
  const blockNumber = useBlockNumber(chainId);
  const prevBlockNumber = usePrevious(blockNumber);
  const prevResult = usePrevious(result, false);

  React.useEffect(() => {
    async function callPromise() {
      if (tokenChecks) {
        try {
          const promiseResult = await sdkService.getMultipleAllowances(tokenChecks, account, chainId);
          setState({ isLoading: false, result: promiseResult, error: undefined });
        } catch (e) {
          setState({ result: undefined, error: e as string, isLoading: false });
        }
      }
    }

    if (
      (!isLoading && !result && !error) ||
      !isEqual(tokenChecks, prevTokenChecks) ||
      !isEqual(account, prevAccount) ||
      !isEqual(chainId, prevChainId) ||
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
    tokenChecks,
    prevTokenChecks,
    isLoading,
    result,
    error,
    hasPendingTransactions,
    prevAccount,
    account,
    prevBlockNumber,
    blockNumber,
    sdkService,
    prevPendingTrans,
    chainId,
    prevChainId,
  ]);

  if (!tokenChecks || !Object.keys(tokenChecks).length) {
    return [undefined, false, undefined];
  }

  return [result || prevResult, isLoading, error];
}

export default useSdkAllowances;
