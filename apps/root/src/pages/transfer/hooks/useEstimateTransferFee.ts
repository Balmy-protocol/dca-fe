import { Address, parseUnits } from 'viem';
import React from 'react';
import { AmountsOfToken } from '@mean-finance/sdk';
import usePrevious from '@hooks/usePrevious';
import { isEqual } from 'lodash';
import { Token, TokenType, TransactionRequestWithChain } from 'common-types';
import usePriceService from '@hooks/usePriceService';
import { PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import useEstimateNetworkFee from '@hooks/useEstimateNetworkFee';
import useWalletService from '@hooks/useWalletService';
import { useTransferState } from '@state/transfer/hooks';
import useActiveWallet from '@hooks/useActiveWallet';

function useEstimateTransferFee(): [AmountsOfToken | undefined, boolean, string | undefined] {
  const walletService = useWalletService();
  const activeWallet = useActiveWallet();
  const { token, amount, recipient } = useTransferState();
  const [{ result, isLoading, error }, setResults] = React.useState<{
    isLoading: boolean;
    result?: TransactionRequestWithChain;
    error?: string;
  }>({ isLoading: false, result: undefined, error: undefined });
  const [networkFee, isLoadingNetworkFee, networkFeeErrors] = useEstimateNetworkFee({ tx: result });
  const prevNetworkFee = usePrevious(networkFee, false);
  const prevToken = usePrevious(token);
  const prevAmount = usePrevious(amount);
  const prevRecipient = usePrevious(recipient);
  const priceService = usePriceService();

  React.useEffect(() => {
    async function fetchNetworkFee() {
      if (token && amount && recipient && activeWallet?.address) {
        try {
          const isProtocolToken = token.address === PROTOCOL_TOKEN_ADDRESS;
          const parsedToken: Token = { ...token, type: isProtocolToken ? TokenType.NATIVE : TokenType.ERC20_TOKEN };
          const parsedAmount = parseUnits(amount || '0', token?.decimals || 18);

          const tx = await walletService.getTransferTokenTx({
            from: activeWallet.address,
            to: recipient as Address,
            token: parsedToken,
            amount: parsedAmount,
          });

          setResults({ result: tx, error: undefined, isLoading: false });
        } catch (e) {
          setResults({ result: undefined, error: e as string, isLoading: false });
        }
      } else {
        setResults({ result: undefined, error: undefined, isLoading: false });
      }
    }

    if (
      (!isLoadingNetworkFee && !networkFee && !networkFeeErrors) ||
      !isEqual(prevToken, token) ||
      !isEqual(prevAmount, amount) ||
      !isEqual(prevRecipient, recipient)
    ) {
      setResults({ result: undefined, error: undefined, isLoading: true });
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchNetworkFee();
    }
  }, [
    prevToken,
    token,
    prevAmount,
    amount,
    prevRecipient,
    recipient,
    priceService,
    networkFee,
    networkFeeErrors,
    isLoadingNetworkFee,
  ]);

  return [networkFee || prevNetworkFee, isLoadingNetworkFee || isLoading, error || networkFeeErrors];
}

export default useEstimateTransferFee;
