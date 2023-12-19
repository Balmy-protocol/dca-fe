import React from 'react';
import isEqual from 'lodash/isEqual';
import usePrevious from '@hooks/usePrevious';
import EULERMIGRATORABI from '@abis/EulerMigrator';
import useProviderService from '@hooks/useProviderService';
import { EULER_CLAIM_MIGRATORS_ADDRESSES, NETWORKS } from '@constants';
import { getContract } from 'viem';

function useClaimRates(
  tokenKeys: string[] | undefined | null
): [Record<string, { wethPerToken: bigint; daiPerToken: bigint; usdcPerToken: bigint }> | undefined, boolean, string?] {
  const [{ isLoading, result, error }, setState] = React.useState<{
    isLoading: boolean;
    result?: Record<string, { wethPerToken: bigint; daiPerToken: bigint; usdcPerToken: bigint }>;
    error?: string;
  }>({
    isLoading: false,
    result: undefined,
    error: undefined,
  });

  const prevTokenKeys = usePrevious(tokenKeys);
  const prevResult = usePrevious(result, false);
  const providerService = useProviderService();

  React.useEffect(() => {
    async function callPromise() {
      if (tokenKeys) {
        try {
          const provider = providerService.getProvider(NETWORKS.ethereum.chainId);

          const eulerWrappedTokenAddresses = Object.keys(EULER_CLAIM_MIGRATORS_ADDRESSES);

          const promises = await Promise.all(
            eulerWrappedTokenAddresses.map((eulerWrappedTokenAddress: keyof typeof EULER_CLAIM_MIGRATORS_ADDRESSES) => {
              const migrator = getContract({
                address: EULER_CLAIM_MIGRATORS_ADDRESSES[eulerWrappedTokenAddress],
                abi: EULERMIGRATORABI,
                publicClient: provider,
              });

              return Promise.all([
                migrator.read.daiPerERC4626(),
                migrator.read.wethPerERC4626(),
                migrator.read.usdcPerERC4626(),
              ]);
            })
          );

          const promiseResult = eulerWrappedTokenAddresses.reduce<
            Record<string, { wethPerToken: bigint; daiPerToken: bigint; usdcPerToken: bigint }>
          >(
            (acc, eulerWrappedTokenAddress, index) => ({
              ...acc,
              [eulerWrappedTokenAddress]: {
                daiPerToken: BigInt(promises[index][0]),
                wethPerToken: BigInt(promises[index][1]),
                usdcPerToken: BigInt(promises[index][2]),
              },
            }),
            {}
          );
          setState({ isLoading: false, result: promiseResult, error: undefined });
        } catch (e) {
          setState({ result: undefined, error: e as string, isLoading: false });
        }
      }
    }

    if ((!isLoading && !result && !error) || !isEqual(prevTokenKeys, tokenKeys)) {
      setState({ isLoading: true, result: undefined, error: undefined });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [tokenKeys, prevTokenKeys, isLoading, result, error]);

  if (!tokenKeys || !tokenKeys.length) {
    return [undefined, false, undefined];
  }

  return [result || prevResult, isLoading, error];
}

export default useClaimRates;
