import React from 'react';
import { Token } from 'types';
import isEqual from 'lodash/isEqual';
import usePrevious from 'hooks/usePrevious';
import WalletContext from 'common/wallet-context';
import { useHasPendingTransactions } from 'state/transactions/hooks';
import { BigNumber } from 'ethers';
import { formatEther, parseUnits } from 'ethers/lib/utils';
import axios from 'axios';
import { NETWORKS, SUPPORTED_GAS_CALCULATOR_NETWORKS } from 'config/constants';
import { PROTOCOL_TOKEN_ADDRESS, WRAPPED_PROTOCOL_TOKEN } from 'mocks/tokens';
import useCurrentNetwork from './useCurrentNetwork';
import usePriceService from './usePriceService';

const ZEROX_API_URLS = {
  [NETWORKS.optimism.chainId]: 'https://optimism.api.0x.org/swap/v1/quote',
  [NETWORKS.polygon.chainId]: 'https://polygon.api.0x.org/swap/v1/quote',
};

export interface ZeroXResponse {
  estimatedGas: string;
  data: string;
}

const buildZeroTokenQueryParams = (tokenToSend: Token, tokenToGet: Token, toSell: BigNumber, chainId: number) => {
  const queryParams = [];

  const toSellToken =
    tokenToSend.address === PROTOCOL_TOKEN_ADDRESS && chainId !== NETWORKS.polygon.chainId
      ? 'ETH'
      : tokenToSend.address;
  queryParams.push(`sellToken=${toSellToken}`);
  queryParams.push(`buyToken=${tokenToGet.address}`);
  queryParams.push(`sellAmount=${toSell.toString()}`);
  queryParams.push(`skipValidation=true`);

  return queryParams.join('&');
};

const getZeroQuote = async (tokenToSend: Token, tokenToGet: Token, toSell: BigNumber, chainId: number) => {
  const inchQueryParams = buildZeroTokenQueryParams(tokenToSend, tokenToGet, toSell, chainId);

  const inchResponse = await axios.get<ZeroXResponse>(`${ZEROX_API_URLS[chainId]}?${inchQueryParams}`);

  return inchResponse.data;
};

const DEPOSIT_GAS = BigNumber.from('214648');
const WITHDRAW_GAS = BigNumber.from('105926');
const DEPOSIT_OE_L1_FEED = BigNumber.from('492502419135008');
const WITHDRAW_OE_L1_FEED = BigNumber.from('478450936518496');

function useGasEstimate(
  from: Token | undefined | null,
  to: Token | undefined | null,
  rate: string | undefined | null,
  amountOfSwaps: string
): [number | undefined, boolean, string?] {
  const [isLoading, setIsLoading] = React.useState(false);
  const { web3Service } = React.useContext(WalletContext);
  const priceService = usePriceService();
  const [result, setResult] = React.useState<
    { gas: BigNumber; gasPrice: BigNumber; ethPrice: number; zeroL1Gas: BigNumber } | undefined
  >(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const hasPendingTransactions = useHasPendingTransactions();
  const prevFrom = usePrevious(from);
  const prevTo = usePrevious(to);
  const prevRate = usePrevious(rate);
  const prevPendingTrans = usePrevious(hasPendingTransactions);
  const account = usePrevious(web3Service.getAccount());
  const currentNetwork = useCurrentNetwork();

  React.useEffect(() => {
    async function callPromise() {
      if (from && to && rate && SUPPORTED_GAS_CALCULATOR_NETWORKS.includes(currentNetwork.chainId)) {
        try {
          const gasPrice = await priceService.getGasPrice();
          const ethPrice = await priceService.getUsdPrice(
            WRAPPED_PROTOCOL_TOKEN[currentNetwork.chainId](currentNetwork.chainId)
          );
          const promiseResult = await getZeroQuote(from, to, parseUnits(rate, from.decimals), currentNetwork.chainId);
          const l1GasPrice = await priceService.getL1GasPrice(promiseResult.data);

          setResult({
            gas: BigNumber.from(promiseResult.estimatedGas),
            gasPrice,
            ethPrice,
            zeroL1Gas: l1GasPrice,
          });
          setError(undefined);
        } catch (e) {
          setError(e);
        }
        setIsLoading(false);
      }
    }

    if (
      (!isLoading && !result && !error) ||
      !isEqual(prevFrom, from) ||
      !isEqual(prevTo, to) ||
      !isEqual(prevRate, rate) ||
      !isEqual(account, web3Service.getAccount()) ||
      !isEqual(prevPendingTrans, hasPendingTransactions)
    ) {
      setIsLoading(true);
      setResult(undefined);
      setError(undefined);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      callPromise();
    }
  }, [from, to, rate, isLoading, result, error, hasPendingTransactions, web3Service.getAccount(), currentNetwork]);

  if (!from || !to || !rate) {
    return [undefined, false, undefined];
  }

  if (!result) {
    return [undefined, isLoading, error];
  }

  const gasCalc = result.gas
    .mul(BigNumber.from(amountOfSwaps || '0'))
    .sub(DEPOSIT_GAS)
    .sub(WITHDRAW_GAS)
    .mul(result.gasPrice);
  const gasCalcInUsd = parseFloat(formatEther(gasCalc)) * result.ethPrice;
  let returnedValue = gasCalcInUsd;

  if (currentNetwork.chainId === NETWORKS.optimism.chainId) {
    returnedValue +=
      parseFloat(
        formatEther(
          result.zeroL1Gas
            .mul(BigNumber.from(amountOfSwaps || '0'))
            .sub(WITHDRAW_OE_L1_FEED)
            .sub(DEPOSIT_OE_L1_FEED)
        )
      ) * result.ethPrice;
  }

  return [returnedValue, isLoading, error];
}

export default useGasEstimate;
