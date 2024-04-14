import { TokenPicker, TokenWithBalance } from 'ui-library';
import { Address, Token, TokenListId } from 'common-types';
import React from 'react';
import useCustomToken from '@hooks/useCustomToken';
import useTokenList from '@hooks/useTokenList';
import { useWalletBalances } from '@state/balances/hooks';
import { useCustomTokens, useIsLoadingAllTokenLists } from '@state/token-lists/hooks';
import useActiveWallet from '@hooks/useActiveWallet';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { formatCurrencyAmount } from '@common/utils/currency';
import TokenIcon from '@common/components/token-icon';
import { formatUnits } from 'viem';
import { addCustomToken } from '@state/token-lists/actions';
import { useAppDispatch } from '@hooks/state';
import useTrackEvent from '@hooks/useTrackEvent';
import { parseTokensForPicker } from '@common/utils/parsing';

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
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();
  const { balances, isLoadingBalances, isLoadingPrices } = useWalletBalances(
    activeWallet?.address as Address,
    currentNetwork.chainId
  );

  const [customTokenToSearch, setCustomTokenToSearch] = React.useState<string | undefined>(undefined);

  const [customToken, isLoadingCustomToken] = useCustomToken(customTokenToSearch);

  let tokens: TokenWithBalance[] = parseTokensForPicker({ tokenList, balances, customTokens }).map(
    (tokenWithBalance) => ({
      ...tokenWithBalance,
      token: {
        ...tokenWithBalance.token,
        icon: <TokenIcon token={tokenWithBalance.token} size={8} />,
      },
    })
  );

  const parsedCustomToken: TokenWithBalance | undefined = customToken && {
    token: {
      ...customToken.token,
      icon: <TokenIcon token={customToken.token} size={8} />,
    },
    balance:
      (customToken.balance && {
        amount: customToken.balance,
        amountInUnits: formatCurrencyAmount(customToken.balance, customToken.token),
        amountInUSD:
          (customToken.balanceUsd &&
            parseFloat(formatUnits(customToken.balanceUsd, customToken.token.decimals + 18)).toFixed(2)) ||
          undefined,
      }) ||
      undefined,
  };

  const addCustomTokenToList = React.useCallback(
    (token: Token) => {
      dispatch(addCustomToken(token));
      trackEvent('Aggregator - Add custom token', {
        tokenSymbol: token.symbol,
        tokenAddress: token.address,
        chainId: currentNetwork.chainId,
      });
    },
    [currentNetwork.chainId, dispatch, trackEvent]
  );

  tokens = parsedCustomToken ? [...tokens, parsedCustomToken] : tokens;

  const handleOnChange = (token: TokenWithBalance) => {
    if (token.isCustomToken && !!customTokens[`${token.token.chainId}-${token.token.address}` as TokenListId]) {
      addCustomTokenToList(token.token);
    }

    onChange(token.token);
  };

  return (
    <TokenPicker
      shouldShow={shouldShow}
      onChange={handleOnChange}
      onClose={onClose}
      modalTitle={modalTitle}
      onFetchCustomToken={setCustomTokenToSearch}
      isLoadingBalances={isLoadingBalances}
      isLoadingPrices={isLoadingPrices}
      isLoadingCustomToken={isLoadingCustomToken}
      isLoadingTokens={isLoadingLists}
      tokens={tokens}
    />
  );
};

export default AggregatorTokenPicker;
