import React from 'react';
import { useAppDispatch } from './state';
import { fetchCustomTokenBalance } from '@state/balances/actions';
import { Address } from 'viem';
import { useCustomTokens } from '@state/token-lists/hooks';
import { getTokenListId } from '@common/utils/parsing';
import useSelectedNetwork from './useSelectedNetwork';
import useTrackEvent from './useTrackEvent';

function useAddCustomTokenToList(chainId?: number) {
  const dispatch = useAppDispatch();
  const [customTokenAddress, setCustomTokenAddress] = React.useState<Address | undefined>();
  const [isLoadingCustomToken, setIsLoadingCustomToken] = React.useState(false);
  const customTokens = useCustomTokens();
  const selectedNetwork = useSelectedNetwork();
  const trackEvent = useTrackEvent();

  React.useEffect(() => {
    const handleCustomTokenBalances = async (tokenAddress: Address) => {
      const network = chainId || selectedNetwork.chainId;

      if (customTokens[getTokenListId({ tokenAddress, chainId: network })]) return;

      try {
        setIsLoadingCustomToken(true);

        const newCustomToken = await dispatch(fetchCustomTokenBalance({ tokenAddress, chainId: network })).unwrap();

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
    };

    if (customTokenAddress) {
      void handleCustomTokenBalances(customTokenAddress);
    }
  }, [customTokenAddress]);

  return React.useMemo(() => ({ setCustomTokenAddress, isLoadingCustomToken }), [isLoadingCustomToken]);
}

export default useAddCustomTokenToList;
