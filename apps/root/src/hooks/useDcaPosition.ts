import React from 'react';
import { PositionVersions, PositionWithHistory } from '@types';
import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import usePrevious from '@hooks/usePrevious';
import usePositionService from './usePositionService';

function useDcaPosition(
  positionId?: number,
  chainId?: number,
  positionVersion?: PositionVersions
): [PositionWithHistory | undefined, boolean, string?] {
  const [{ result, isLoading, error }, setResults] = React.useState<{
    result: PositionWithHistory | undefined;
    isLoading: boolean;
    error: string | undefined;
  }>({
    result: undefined,
    isLoading: false,
    error: undefined,
  });
  const prevPositionId = usePrevious(positionId);
  const prevChainId = usePrevious(chainId);
  const prevPositionVersion = usePrevious(positionVersion);
  const positionService = usePositionService();

  React.useEffect(() => {
    async function callPromise() {
      if (chainId && positionId && positionVersion) {
        try {
          const position = await positionService.getPosition({ positionId, chainId, version: positionVersion });

          setResults({ result: position, error: undefined, isLoading: false });
        } catch (e) {
          setResults({ result: undefined, error: e as string, isLoading: false });
        }
      } else {
        setResults({ result: undefined, error: undefined, isLoading: false });
      }
    }

    if (
      (!isLoading && isUndefined(result) && !error) ||
      !isEqual(positionId, prevPositionId) ||
      !isEqual(positionVersion, prevPositionVersion) ||
      !isEqual(chainId, prevChainId)
    ) {
      setResults({ result: undefined, isLoading: true, error: undefined });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [
    positionId,
    isLoading,
    result,
    error,
    chainId,
    positionVersion,
    prevChainId,
    prevPositionId,
    prevPositionVersion,
  ]);

  return [result, isLoading, error];
}

export default useDcaPosition;
