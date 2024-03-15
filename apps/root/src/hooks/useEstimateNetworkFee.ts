import { formatUnits } from 'viem';
import useProviderService from './useProviderService';
import React from 'react';
import usePrevious from './usePrevious';
import { isEqual } from 'lodash';
import { TransactionRequestWithChain, AmountsOfToken } from 'common-types';
import usePriceService from './usePriceService';
import { getProtocolToken } from '@common/mocks/tokens';
import { parseUsdPrice } from '@common/utils/currency';

interface UseEstimateNetworkFeeParams {
  tx?: TransactionRequestWithChain;
}

function useEstimateNetworkFee({
  tx,
}: UseEstimateNetworkFeeParams): [AmountsOfToken | undefined, boolean, string | undefined] {
  const providerService = useProviderService();
  const prevTx = usePrevious(tx);
  const [{ result, isLoading, error }, setResults] = React.useState<{
    isLoading: boolean;
    result?: AmountsOfToken;
    error?: string;
  }>({ isLoading: false, result: undefined, error: undefined });
  const priceService = usePriceService();

  React.useEffect(() => {
    async function fetchNetworkFee() {
      if (tx) {
        try {
          const protocolToken = getProtocolToken(tx.chainId);
          const protocolTokenPrice = await priceService.getUsdHistoricPrice([protocolToken]);
          const protocolTokenPriceForChain = protocolTokenPrice[protocolToken.address];
          const gasEverything = await providerService.getGasCost(tx);

          const totalGas = gasEverything.standard.gasCostNativeToken;

          const endResult: AmountsOfToken = {
            amount: BigInt(gasEverything.standard.gasCostNativeToken),
            amountInUnits: formatUnits(BigInt(totalGas), protocolToken.decimals),
            amountInUSD: parseUsdPrice(protocolToken, BigInt(totalGas), protocolTokenPriceForChain).toString(),
          };

          setResults({ result: endResult, error: undefined, isLoading: false });
        } catch (e) {
          setResults({ result: undefined, error: e as string, isLoading: false });
        }
      } else {
        setResults({ result: undefined, error: undefined, isLoading: false });
      }
    }

    if ((!isLoading && !result && !error) || !isEqual(prevTx, tx)) {
      if (tx) {
        setResults({ result: undefined, error: undefined, isLoading: true });
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        fetchNetworkFee();
      }
    }
  }, [tx, prevTx, isLoading, result, error, priceService]);

  return [result, isLoading, error];
}

export default useEstimateNetworkFee;
