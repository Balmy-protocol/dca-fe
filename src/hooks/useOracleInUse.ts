import React from 'react';
import { Token, Oracles } from 'types';
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import usePrevious from 'hooks/usePrevious';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import useCurrentNetwork from './useCurrentNetwork';
import useAvailablePairs from './useAvailablePairs';
import usePairService from './usePairService';
import useAccount from './useAccount';

function useOracleInUse(
  from: Token | undefined | null,
  to: Token | undefined | null
): [Oracles | undefined, boolean, string?] {
  const [isLoading, setIsLoading] = React.useState(false);
  const pairService = usePairService();
  const account = useAccount();
  const [result, setResult] = React.useState<Oracles | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const prevFrom = usePrevious(from);
  const prevTo = usePrevious(to);
  const currentNetwork = useCurrentNetwork();
  const availablePairs = useAvailablePairs();

  const existingPair = React.useMemo(() => {
    if (!from || !to) return undefined;
    let tokenA = from.address;
    let tokenB = to.address;

    if (tokenA === PROTOCOL_TOKEN_ADDRESS) {
      tokenA = getWrappedProtocolToken(currentNetwork.chainId).address;
    }
    if (tokenB === PROTOCOL_TOKEN_ADDRESS) {
      tokenB = getWrappedProtocolToken(currentNetwork.chainId).address;
    }

    const token0 = tokenA < tokenB ? tokenA : tokenB;
    const token1 = tokenA < tokenB ? tokenB : tokenA;

    return find(
      availablePairs,
      (pair) => pair.token0.address === token0.toLocaleLowerCase() && pair.token1.address === token1.toLocaleLowerCase()
    );
  }, [from, to, availablePairs, (availablePairs && availablePairs.length) || 0]);

  const prevExistingPair = usePrevious(existingPair);

  React.useEffect(() => {
    async function callPromise() {
      if (from && to) {
        try {
          const oracle = await pairService.getPairOracle({ tokenA: from.address, tokenB: to.address }, !!existingPair);
          setResult(oracle);
          setError(undefined);
        } catch (e) {
          setError(e);
        }
        setIsLoading(false);
      }
    }

    if (
      (!isLoading && isUndefined(result) && !error) ||
      !isEqual(prevFrom, from) ||
      !isEqual(prevTo, to) ||
      !isEqual(prevExistingPair, existingPair)
    ) {
      setIsLoading(true);
      setResult(undefined);
      setError(undefined);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [from, to, isLoading, result, error, account, currentNetwork, existingPair, prevExistingPair, prevFrom, prevTo]);

  if (!from || !to) {
    return [undefined, false, undefined];
  }

  return [result, isLoading, error];
}

export default useOracleInUse;
