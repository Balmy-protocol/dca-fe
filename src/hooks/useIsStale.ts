import { BigNumber } from 'ethers';
import React from 'react';
import { GetNextSwapInfo, GetPairSwapsData } from 'types';
import { calculateStale as rawCalculateStale } from 'utils/parsing';
import useWeb3Service from './useWeb3Service';

export const NOTHING_TO_EXECUTE = 0;
export const HEALTHY = 1;
export const STALE = 2;

function useIsStale(
  pair: GetPairSwapsData
): [(lastSwapped: number | undefined, frequencyType: BigNumber, createdAt: number) => -1 | 0 | 1 | 2, boolean] {
  const web3service = useWeb3Service();
  const [nextSwapInformation, setNextSwapInformation] = React.useState<GetNextSwapInfo | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function getNextSwapInformation() {
      try {
        const nextSwap = await web3service.getNextSwapInfo({
          tokenA: pair.tokenA.address,
          tokenB: pair.tokenB.address,
        });
        setNextSwapInformation(nextSwap);
      } catch (e) {
        // console.error(e);
        setNextSwapInformation({ swapsToPerform: [] });
      }
      setIsLoading(false);
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getNextSwapInformation();
  }, []);

  const calculateStale = React.useCallback(
    (lastSwapped = 0, frequencyType: BigNumber, createdAt: number) =>
      rawCalculateStale(lastSwapped, frequencyType, createdAt, nextSwapInformation),
    [nextSwapInformation, isLoading, pair]
  );

  return [calculateStale, isLoading];
}

export default useIsStale;
