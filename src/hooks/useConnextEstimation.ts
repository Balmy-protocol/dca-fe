import React from 'react';
import { Token } from '@types';
import isEqual from 'lodash/isEqual';
import usePrevious from '@hooks/usePrevious';
import { BigNumber } from 'ethers';
import useConnextService from './useConnextService';

interface ConnextEstimateResponse {
  amountReceived: BigNumber;
  originSlippage: BigNumber;
  routerFee: BigNumber;
  destinationSlippage: BigNumber;
  isFastPath: boolean;
}

function useConnextEstimation(
  token: Token | undefined | null,
  amount: BigNumber,
  chainTo: number
): [ConnextEstimateResponse | undefined, boolean, string?] {
  const connextService = useConnextService();
  const [{ isLoading, result, error }, setState] = React.useState<{
    isLoading: boolean;
    result?: ConnextEstimateResponse;
    error?: string;
  }>({
    isLoading: false,
    result: undefined,
    error: undefined,
  });

  const prevToken = usePrevious(token);
  const prevResult = usePrevious(result, false);
  const prevAmount = usePrevious(amount, false);
  const prevChainTo = usePrevious(chainTo, false);

  React.useEffect(() => {
    async function callPromise() {
      if (token) {
        try {
          const { amountReceived, originSlippage, routerFee, destinationSlippage, isFastPath } =
            await connextService.getEstimateAmountReceived(token.chainId, chainTo, token.address, amount);
          setState({
            isLoading: false,
            result: {
              amountReceived: BigNumber.from(amountReceived),
              originSlippage: BigNumber.from(originSlippage),
              routerFee: BigNumber.from(routerFee),
              destinationSlippage: BigNumber.from(destinationSlippage),
              isFastPath,
            },
            error: undefined,
          });
        } catch (e) {
          setState({ result: undefined, error: e as string, isLoading: false });
        }
      }
    }

    if (
      (!isLoading && !result && !error) ||
      !isEqual(prevToken, token) ||
      !isEqual(prevChainTo, chainTo) ||
      !isEqual(prevAmount, amount)
    ) {
      setState({ isLoading: true, result: undefined, error: undefined });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [token, prevToken, isLoading, result, error, prevAmount, prevChainTo, amount, chainTo]);

  if (!token) {
    return [undefined, false, undefined];
  }

  return [result || prevResult, isLoading, error];
}

export default useConnextEstimation;
