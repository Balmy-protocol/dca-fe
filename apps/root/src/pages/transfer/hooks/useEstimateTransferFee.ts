import { Address, formatUnits, parseUnits } from 'viem';
import React from 'react';
import usePrevious from '@hooks/usePrevious';
import { isEqual } from 'lodash';
import { Token, TokenType, AmountsOfToken } from 'common-types';
import usePriceService from '@hooks/usePriceService';
import { PROTOCOL_TOKEN_ADDRESS, getProtocolToken } from '@common/mocks/tokens';
import useWalletService from '@hooks/useWalletService';
import { useTransferState } from '@state/transfer/hooks';
import useActiveWallet from '@hooks/useActiveWallet';
import useProviderService from '@hooks/useProviderService';
import { parseUsdPrice } from '@common/utils/currency';

function useEstimateTransferFee(): [AmountsOfToken | undefined, boolean, string | undefined] {
  const walletService = useWalletService();
  const activeWallet = useActiveWallet();
  const { token, amount, recipientAddress } = useTransferState();
  const providerService = useProviderService();
  const [{ result, isLoading, error }, setResults] = React.useState<{
    isLoading: boolean;
    result?: AmountsOfToken;
    error?: string;
  }>({ isLoading: false, result: undefined, error: undefined });
  const prevNetworkFee = usePrevious(result, false);
  const prevToken = usePrevious(token);
  const prevAmount = usePrevious(amount);
  const prevRecipient = usePrevious(recipientAddress);
  const priceService = usePriceService();

  React.useEffect(() => {
    async function fetchNetworkFee() {
      if (token && amount && recipientAddress && activeWallet?.address) {
        try {
          const isProtocolToken = token.address === PROTOCOL_TOKEN_ADDRESS;
          const parsedToken: Token = { ...token, type: isProtocolToken ? TokenType.NATIVE : TokenType.ERC20_TOKEN };
          const parsedAmount = parseUnits(amount || '0', token?.decimals || 18);

          const tx = await walletService.getTransferTokenTx({
            from: activeWallet.address,
            to: recipientAddress as Address,
            token: parsedToken,
            amount: parsedAmount,
          });

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

    if (
      (!isLoading && !result && !error) ||
      !isEqual(prevToken, token) ||
      !isEqual(prevAmount, amount) ||
      !isEqual(prevRecipient, recipientAddress)
    ) {
      setResults({ result: undefined, error: undefined, isLoading: true });
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchNetworkFee();
    }
  }, [prevToken, token, prevAmount, amount, prevRecipient, recipientAddress, priceService, isLoading, result, error]);

  return [result || prevNetworkFee, isLoading, error];
}

export default useEstimateTransferFee;
