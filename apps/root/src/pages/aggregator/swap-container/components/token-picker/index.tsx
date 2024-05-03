import { TokenPicker, TokenWithBalance } from 'ui-library';
import { Address, Token } from 'common-types';
import React from 'react';
import useTokenList from '@hooks/useTokenList';
import { useWalletBalances } from '@state/balances/hooks';
import { useCustomTokens, useIsLoadingAllTokenLists } from '@state/token-lists/hooks';
import useActiveWallet from '@hooks/useActiveWallet';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import TokenIcon from '@common/components/token-icon';
import useTrackEvent from '@hooks/useTrackEvent';
import { parseTokensForPicker } from '@common/utils/parsing';
import useHandleCustomTokenBalances from '@hooks/useHandleCustomTokenBalances';

interface AggregatorTokenPickerProps {
  shouldShow: boolean;
  onChange: (token: Token) => void;
  onClose: () => void;
  modalTitle: React.ReactNode;
}

const AggregatorTokenPicker = ({ shouldShow, onChange, onClose, modalTitle }: AggregatorTokenPickerProps) => {
  const activeWallet = useActiveWallet();
  const currentNetwork = useSelectedNetwork();
  const tokenList = useTokenList({ chainId: currentNetwork.chainId, curateList: true });
  const customTokens = useCustomTokens(currentNetwork.chainId);
  const isLoadingLists = useIsLoadingAllTokenLists();
  const trackEvent = useTrackEvent();
  const { balances, isLoadingBalances, isLoadingPrices } = useWalletBalances(
    activeWallet?.address as Address,
    currentNetwork.chainId
  );
  const { handleCustomTokenBalances, isLoadingCustomToken } = useHandleCustomTokenBalances();

  const tokens = React.useMemo<TokenWithBalance[]>(
    () =>
      parseTokensForPicker({ tokenList, balances, customTokens }).map((tokenWithBalance) => ({
        ...tokenWithBalance,
        token: {
          ...tokenWithBalance.token,
          icon: <TokenIcon token={tokenWithBalance.token} size={8} />,
        },
      })),
    [tokenList, balances, customTokens]
  );

  // TODO: Track custom tokens addition like it was tracked before

  const handleOnChange = (token: TokenWithBalance) => {
    onChange(token.token);
  };

  const onFetchCustomToken = React.useCallback(
    async (tokenAddress: Address) => {
      const newCustomToken = await handleCustomTokenBalances({ tokenAddress, chainId: currentNetwork.chainId });
      if (!newCustomToken) return;

      trackEvent('Aggregator - Add custom token', {
        tokenSymbol: newCustomToken.symbol,
        tokenAddress: newCustomToken.address,
        chainId: newCustomToken.chainId,
      });
    },
    [currentNetwork.chainId, trackEvent]
  );

  return (
    <TokenPicker
      shouldShow={shouldShow}
      onChange={handleOnChange}
      onClose={onClose}
      modalTitle={modalTitle}
      onFetchCustomToken={onFetchCustomToken}
      isLoadingBalances={isLoadingBalances}
      isLoadingPrices={isLoadingPrices}
      isLoadingCustomToken={isLoadingCustomToken}
      isLoadingTokens={isLoadingLists}
      tokens={tokens}
    />
  );
};

export default AggregatorTokenPicker;
