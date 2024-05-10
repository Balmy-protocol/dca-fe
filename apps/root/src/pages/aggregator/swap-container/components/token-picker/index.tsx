import { TokenPicker, TokenWithBalance } from 'ui-library';
import { Address, Token } from 'common-types';
import React from 'react';
import useTokenList from '@hooks/useTokenList';
import { useWalletBalances } from '@state/balances/hooks';
import { useCustomTokens, useIsLoadingAllTokenLists } from '@state/token-lists/hooks';
import useActiveWallet from '@hooks/useActiveWallet';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import TokenIcon from '@common/components/token-icon';
import { parseTokensForPicker } from '@common/utils/parsing';
import useAddCustomTokenToList from '@hooks/useAddCustomTokenToList';

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
  const { balances, isLoadingBalances, isLoadingPrices } = useWalletBalances(
    activeWallet?.address as Address,
    currentNetwork.chainId
  );
  const { setCustomTokenAddress, isLoadingCustomToken } = useAddCustomTokenToList();

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

  const handleOnChange = (token: TokenWithBalance) => {
    onChange(token.token);
  };

  return (
    <TokenPicker
      shouldShow={shouldShow}
      onChange={handleOnChange}
      onClose={onClose}
      modalTitle={modalTitle}
      onFetchCustomToken={setCustomTokenAddress}
      isLoadingBalances={isLoadingBalances}
      isLoadingPrices={isLoadingPrices}
      isLoadingCustomToken={isLoadingCustomToken}
      isLoadingTokens={isLoadingLists}
      tokens={tokens}
    />
  );
};

export default AggregatorTokenPicker;
