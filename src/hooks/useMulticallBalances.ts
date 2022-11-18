import React from 'react';
import isEqual from 'lodash/isEqual';
import usePrevious from 'hooks/usePrevious';
import { useHasPendingTransactions } from 'state/transactions/hooks';
import { BigNumber } from 'ethers';
import { emptyTokenWithAddress } from 'utils/currency';
import { useBlockNumber } from 'state/block-number/hooks';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import useCurrentNetwork from './useCurrentNetwork';
import useWalletService from './useWalletService';
import usePriceService from './usePriceService';

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
  const prevAccount = usePrevious(walletService.getAccount());
  const account = walletService.getAccount();
  const currentNetwork = useCurrentNetwork();
  const blockNumber = useBlockNumber(currentNetwork.chainId);
  const prevBlockNumber = usePrevious(blockNumber);
  const prevResult = usePrevious(result, false);
  const wrappedProtocolToken = getWrappedProtocolToken(currentNetwork.chainId);

  React.useEffect(() => {
    async function callPromise() {
      if (tokens?.length) {
        try {
          const balanceResults = await walletService.getMulticallBalances(tokens);

          const priceResults = await priceService.getUsdHistoricPrice(tokens.map((key) => emptyTokenWithAddress(key)));

          const promiseResult = tokens.reduce((acc, token) => {
            const addressToUse = token === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : token;
            return {
              ...acc,
              [token]: {
                balance: balanceResults[token],
                balanceUsd: (balanceResults[token] || BigNumber.from(0)).mul(
                  priceResults[addressToUse] || BigNumber.from(0)
                ),
              },
            };
          }, {});

          setState({ isLoading: false, result: promiseResult, error: undefined });
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
