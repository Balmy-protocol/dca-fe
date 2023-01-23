import React from 'react';
import { Token } from 'types';
import isEqual from 'lodash/isEqual';
import usePrevious from 'hooks/usePrevious';
import { useHasPendingTransactions } from 'state/transactions/hooks';
import { EMPTY_TOKEN } from 'mocks/tokens';
import { PositionVersions } from 'config';
import { useBlockNumber } from 'state/block-number/hooks';
import useSelectedNetwork from './useSelectedNetwork';
import useWalletService from './useWalletService';
import useAccount from './useAccount';

type Allowance = {
  token: Token;
  allowance: string | undefined;
};

type AllowanceResponse = [Allowance, boolean, string?];

const dummyToken: Allowance = { token: EMPTY_TOKEN, allowance: undefined };

function useAllowance(
  from: Token | undefined | null,
  usesYield?: boolean,
  version?: PositionVersions
): AllowanceResponse {
  const walletService = useWalletService();
  const [{ result, isLoading, error }, setState] = React.useState<{
    isLoading: boolean;
    result: Allowance;
    error?: string;
  }>({ isLoading: false, result: dummyToken, error: undefined });
  const hasPendingTransactions = useHasPendingTransactions();
  const prevFrom = usePrevious(from);
  const prevPendingTrans = usePrevious(hasPendingTransactions);
  const account = useAccount();
  const prevAccount = usePrevious(account);
  const currentNetwork = useSelectedNetwork();
  const blockNumber = useBlockNumber(currentNetwork.chainId);
  const prevBlockNumber = usePrevious(blockNumber);
  const prevResult = usePrevious(result, false, 'allowance');
  const prevUsesYield = usePrevious(usesYield);
  const prevVersion = usePrevious(version);

  React.useEffect(() => {
    async function callPromise() {
      if (from) {
        try {
          const promiseResult = await walletService.getAllowance(from, usesYield, version);
          setState({ result: promiseResult, error: undefined, isLoading: false });
        } catch (e) {
          setState({ result: dummyToken, error: e as string, isLoading: false });
        }
      }
    }

    if (
      (!isLoading && !result && !error) ||
      !isEqual(prevFrom, from) ||
      !isEqual(account, prevAccount) ||
      !isEqual(prevPendingTrans, hasPendingTransactions) ||
      !isEqual(prevUsesYield, usesYield) ||
      !isEqual(prevVersion, version) ||
      (blockNumber &&
        prevBlockNumber &&
        blockNumber !== -1 &&
        prevBlockNumber !== -1 &&
        !isEqual(prevBlockNumber, blockNumber))
    ) {
      setState({ isLoading: true, result: dummyToken, error: undefined });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [
    from,
    prevFrom,
    isLoading,
    result,
    error,
    usesYield,
    prevUsesYield,
    version,
    prevVersion,
    hasPendingTransactions,
    prevAccount,
    account,
    prevPendingTrans,
    prevBlockNumber,
    blockNumber,
    walletService,
  ]);

  if (!from) {
    return [dummyToken, false, undefined];
  }

  return [result.allowance ? result : prevResult || dummyToken, isLoading, error];
}

export default useAllowance;
