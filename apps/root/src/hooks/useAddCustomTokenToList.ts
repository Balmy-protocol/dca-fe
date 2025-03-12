import React from 'react';
import { useAppDispatch } from './state';
import { fetchSpecificTokensBalances } from '@state/balances/actions';
import { Address } from 'viem';
import { useCustomTokens } from '@state/token-lists/hooks';
import { getTokenListId } from '@common/utils/parsing';
import useSelectedNetwork from './useSelectedNetwork';
import useAnalytics from './useAnalytics';

function useAddCustomTokenToList() {
  const dispatch = useAppDispatch();
  const [isLoadingCustomToken, setIsLoadingCustomToken] = React.useState(false);
  const customTokens = useCustomTokens();
  const selectedNetwork = useSelectedNetwork();
  const { trackEvent } = useAnalytics();

  const addCustomTokenToList = React.useCallback(
    async (tokenAddress: Address, chainId: number) => {
      if (customTokens[getTokenListId({ tokenAddress, chainId })]) return;

      try {
        setIsLoadingCustomToken(true);

        const newCustomTokens = await dispatch(
          fetchSpecificTokensBalances({ tokenAddresses: [tokenAddress], chainId })
        ).unwrap();
        const newCustomToken = newCustomTokens?.find((token) => token.address === tokenAddress);
        if (newCustomToken) {
          trackEvent('Add custom token', {
            tokenSymbol: newCustomToken.symbol,
            tokenAddress: newCustomToken.address,
            chainId: newCustomToken.chainId,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingCustomToken(false);
      }
    },
    [selectedNetwork, customTokens, trackEvent]
  );

  return React.useMemo(
    () => ({ addCustomTokenToList, isLoadingCustomToken }),
    [addCustomTokenToList, isLoadingCustomToken]
  );
}

export default useAddCustomTokenToList;
