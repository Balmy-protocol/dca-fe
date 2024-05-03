import React from 'react';
import { useAppDispatch } from './state';
import { fetchCustomTokenBalance } from '@state/balances/actions';
import { Address } from 'viem';
import { useCustomTokens } from '@state/token-lists/hooks';
import { getTokenListId } from '@common/utils/parsing';

function useHandleCustomTokenBalances() {
  const dispatch = useAppDispatch();
  const [isLoadingCustomToken, setIsLoadingCustomToken] = React.useState(false);
  const customTokens = useCustomTokens();

  const handleCustomTokenBalances = React.useCallback(
    async ({ tokenAddress, chainId }: { tokenAddress: Address; chainId: number }) => {
      if (customTokens[getTokenListId({ tokenAddress, chainId })]) return;

      try {
        setIsLoadingCustomToken(true);
        return await dispatch(fetchCustomTokenBalance({ tokenAddress, chainId })).unwrap();
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingCustomToken(false);
      }
    },
    []
  );

  return { handleCustomTokenBalances, isLoadingCustomToken };
}
useHandleCustomTokenBalances.whyDidYouRender = true;

export default useHandleCustomTokenBalances;
