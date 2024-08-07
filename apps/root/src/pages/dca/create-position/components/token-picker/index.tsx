import { TokenPicker, TokenWithBalance } from 'ui-library';
import { Address, Token, YieldOptions } from 'common-types';
import React from 'react';
import { useWalletBalances } from '@state/balances/hooks';
import { useIsLoadingAllTokenLists } from '@state/token-lists/hooks';
import useActiveWallet from '@hooks/useActiveWallet';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import TokenIcon from '@common/components/token-icon';
import useAvailablePairs from '@hooks/useAvailablePairs';
import { parseTokensForPicker } from '@common/utils/parsing';
import useDcaTokens from '@hooks/useDcaTokens';
import { getProtocolToken, getWrappedProtocolToken } from '@common/mocks/tokens';
import { defineMessage } from 'react-intl';

interface DCATokenPickerProps {
  shouldShow: boolean;
  onChange: (token: Token) => void;
  onClose: () => void;
  modalTitle: React.ReactNode;
  yieldOptions: YieldOptions;
  otherSelected: Token | null;
}

const DCATokenPicker = ({
  shouldShow,
  onChange,
  onClose,
  modalTitle,
  yieldOptions,
  otherSelected,
}: DCATokenPickerProps) => {
  const activeWallet = useActiveWallet();
  const currentNetwork = useSelectedNetwork();
  const tokenList = useDcaTokens(currentNetwork.chainId);
  const isLoadingLists = useIsLoadingAllTokenLists();
  const allowedPairs = useAvailablePairs(currentNetwork.chainId);
  const { balances, isLoadingBalances, isLoadingPrices } = useWalletBalances(
    activeWallet?.address as Address,
    currentNetwork.chainId
  );

  const tokensWithBalance: TokenWithBalance[] = parseTokensForPicker({ tokenList, balances, yieldOptions }).map(
    (tokenWithBalance) => ({
      ...tokenWithBalance,
      token: {
        ...tokenWithBalance.token,
        icon: <TokenIcon token={tokenWithBalance.token} size={8} />,
      },
    })
  );

  const handleOnChange = (token: TokenWithBalance) => {
    onChange(token.token);
  };

  const protocolToken = React.useMemo(() => getProtocolToken(currentNetwork.chainId), [currentNetwork.chainId]);
  const wrappedProtocolToken = React.useMemo(
    () => getWrappedProtocolToken(currentNetwork.chainId),
    [currentNetwork.chainId]
  );

  return (
    <TokenPicker
      shouldShow={shouldShow}
      onChange={handleOnChange}
      onClose={onClose}
      modalTitle={modalTitle}
      isLoadingBalances={isLoadingBalances}
      isLoadingPrices={isLoadingPrices}
      isLoadingTokens={isLoadingLists}
      tokens={tokensWithBalance}
      allowedPairs={allowedPairs}
      filterByPair
      otherSelected={otherSelected}
      protocolToken={protocolToken}
      wrappedProtocolToken={wrappedProtocolToken}
      emptySearchMessage={defineMessage({
        description: 'dca.token-picker.empty-search-message',
        defaultMessage: 'We could not find any token with those search parameters',
      })}
    />
  );
};

export default DCATokenPicker;
