import React from 'react';
import { Token } from 'types';
import isEqual from 'lodash/isEqual';
import usePrevious from 'hooks/usePrevious';
import WalletContext from 'common/wallet-context';
import { useHasPendingTransactions } from 'state/transactions/hooks';
import useCurrentNetwork from './useCurrentNetwork';
import { BigNumber } from 'ethers';
import { formatEther, formatUnits, parseUnits } from 'ethers/lib/utils';
import axios from 'axios';
import { NETWORKS } from 'config/constants';
import { PROTOCOL_TOKEN_ADDRESS, WRAPPED_PROTOCOL_TOKEN } from 'mocks/tokens';

const ZEROX_API_URLS = {
  [NETWORKS.optimism.chainId]: 'https://optimism.api.0x.org/swap/v1/quote',
}

export interface ZeroXResponse {
  estimatedGas: string
}

const getZeroQuote = async (tokenToSend: Token, tokenToGet: Token, toSell: BigNumber, chainId: number, address: string) => {
  const inchQueryParams = buildZeroTokenQueryParams(tokenToSend, tokenToGet, toSell, chainId, address);

  const inchResponse = await axios.get<ZeroXResponse>(`${ZEROX_API_URLS[chainId]}?${inchQueryParams}`);

  return inchResponse.data;
}

const buildZeroTokenQueryParams = (tokenToSend: Token, tokenToGet: Token, toSell: BigNumber, chainId: number, address: string) => {
  const queryParams = [];

  queryParams.push(`sellToken=${tokenToSend.address === PROTOCOL_TOKEN_ADDRESS ? 'ETH' : tokenToSend.address}`);
  queryParams.push(`buyToken=${tokenToGet.address}`);
  queryParams.push(`sellAmount=${toSell.toString()}`);
  queryParams.push(`skipValidation=true`);

  return queryParams.join('&');
}

const DEPOSIT_GAS = BigNumber.from('214648');
const WITHDRAW_GAS = BigNumber.from('105926');

function useGasEstimate(
  from: Token | undefined | null,
  to: Token | undefined | null,
  rate: string | undefined | null,
  amountOfSwaps: string,
): [number | undefined, boolean, string?] {
  const [isLoading, setIsLoading] = React.useState(false);
  const { web3Service } = React.useContext(WalletContext);
  const [result, setResult] = React.useState<{ gas: BigNumber, gasPrice: BigNumber, ethPrice: number } | undefined>(undefined);
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
      if (from && to && rate) {
        try {
          const gasPrice = await web3Service.getClient().getGasPrice();
          const ethPrice = await web3Service.getUsdPrice(WRAPPED_PROTOCOL_TOKEN[currentNetwork.chainId](currentNetwork.chainId));
          const promiseResult = await getZeroQuote(from,to,parseUnits(rate, from.decimals), currentNetwork.chainId, web3Service.getAccount())
          setResult({
            gas: BigNumber.from(promiseResult.estimatedGas),
            gasPrice,
            ethPrice,
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
  }, [from, to, rate, isLoading, result, error, hasPendingTransactions, web3Service.getAccount()]);

  if (!from || !to || !rate) {
    return [undefined, false, undefined];
  }

  console.log('gas of one swap: ', result && result.gas.toString())
  console.log('gasPrice: ', result && result.gasPrice.toString())
  console.log('ethPrice: ', result && result.ethPrice)
  console.log('gas calc (gas1swap * amountOfSwaps - deposit - withdraw): ', result && result.gas.mul(BigNumber.from(amountOfSwaps || '0')).sub(DEPOSIT_GAS).sub(WITHDRAW_GAS).mul(result.gasPrice).toString())
  console.log('gas calc formatted to eth: ', result && formatEther(result.gas.mul(BigNumber.from(amountOfSwaps || '0')).sub(DEPOSIT_GAS).sub(WITHDRAW_GAS).mul(result.gasPrice)))
  console.log('gas calc formatted to eth with parseFloat: ', result && parseFloat(formatEther(result.gas.mul(BigNumber.from(amountOfSwaps || '0')).sub(DEPOSIT_GAS).sub(WITHDRAW_GAS).mul(result.gasPrice))))
  console.log('total usd: ', result && parseFloat(formatEther(result.gas.mul(BigNumber.from(amountOfSwaps || '0')).sub(DEPOSIT_GAS).sub(WITHDRAW_GAS).mul(result.gasPrice))) * result.ethPrice)

  let returnedValue = result && parseFloat(formatEther(result.gas.mul(BigNumber.from(amountOfSwaps || '0')).sub(DEPOSIT_GAS).sub(WITHDRAW_GAS).mul(result.gasPrice))) * result.ethPrice;
  return [returnedValue, isLoading, error];
}

export default useGasEstimate;
