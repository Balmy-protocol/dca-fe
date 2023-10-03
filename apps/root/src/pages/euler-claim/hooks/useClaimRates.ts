import React from 'react';
import isEqual from 'lodash/isEqual';
import usePrevious from '@hooks/usePrevious';
import { BigNumber, ethers } from 'ethers';
import EULERMIGRATORABI from '@abis/EulerMigrator.json';
import { Interface } from '@ethersproject/abi';
import useProviderService from '@hooks/useProviderService';
import { EULER_CLAIM_MIGRATORS_ADDRESSES } from '@constants';

function useClaimRates(
  tokenKeys: string[] | undefined | null
): [
  Record<string, { wethPerToken: BigNumber; daiPerToken: BigNumber; usdcPerToken: BigNumber }> | undefined,
  boolean,
  string?,
] {
  const [{ isLoading, result, error }, setState] = React.useState<{
    isLoading: boolean;
    result?: Record<string, { wethPerToken: BigNumber; daiPerToken: BigNumber; usdcPerToken: BigNumber }>;
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
          const MigratorInterface = new Interface(EULERMIGRATORABI);

          const provider = await providerService.getProvider();

          const eulerWrappedTokenAddresses = Object.keys(EULER_CLAIM_MIGRATORS_ADDRESSES);

          const promises = await Promise.all(
            eulerWrappedTokenAddresses.map((eulerWrappedTokenAddress: keyof typeof EULER_CLAIM_MIGRATORS_ADDRESSES) => {
              const migrator = new ethers.Contract(
                EULER_CLAIM_MIGRATORS_ADDRESSES[eulerWrappedTokenAddress],
                MigratorInterface,
                provider
              );

              return Promise.all([
                migrator.callStatic.daiPerERC4626(),
                migrator.callStatic.wethPerERC4626(),
                migrator.callStatic.usdcPerERC4626(),
              ]);
            })
          );

          const promiseResult = eulerWrappedTokenAddresses.reduce<
            Record<string, { wethPerToken: BigNumber; daiPerToken: BigNumber; usdcPerToken: BigNumber }>
          >(
            (acc, eulerWrappedTokenAddress, index) => ({
              ...acc,
              [eulerWrappedTokenAddress]: {
                daiPerToken: BigNumber.from(promises[index][0]),
                wethPerToken: BigNumber.from(promises[index][1]),
                usdcPerToken: BigNumber.from(promises[index][2]),
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
