import React from 'react';
import { Token } from '@types';
import TokenPickerModal from '@common/components/token-picker-modal';
import TokenSelectorComponent from '@common/components/token-selector';
import useActiveWallet from '@hooks/useActiveWallet';
import useReplaceHistory from '@hooks/useReplaceHistory';
import { addCustomToken } from '@state/token-lists/actions';
import { useAppDispatch } from '@state/hooks';
import { useTransferState } from '@state/transfer/hooks';
import { setAmount, setToken } from '@state/transfer/actions';
import { FormattedMessage } from 'react-intl';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { useTokenBalance } from '@state/balances/hooks';
import { ContainerBox, TokenAmounUsdInput } from 'ui-library';
import useRawUsdPrice from '@hooks/useUsdRawPrice';
import { AmountsOfToken } from '@mean-finance/sdk';
import { formatCurrencyAmount } from '@common/utils/currency';
import { isUndefined } from 'lodash';

const TokenSelector = () => {
  const dispatch = useAppDispatch();
  const replaceHistory = useReplaceHistory();
  const selectedNetwork = useSelectedNetwork();
  const activeWallet = useActiveWallet();
  const { token: selectedToken, amount, recipient } = useTransferState();
  const { balance } = useTokenBalance({
    token: selectedToken,
    walletAddress: activeWallet?.address,
    shouldAutoFetch: true,
  });

  const [fetchedTokenPrice] = useRawUsdPrice(selectedToken);

  const [shouldShowPicker, setShouldShowPicker] = React.useState(false);

  const onTokenPickerClose = React.useCallback(() => {
    setShouldShowPicker(false);
  }, []);

  const onSetToken = React.useCallback(
    (newToken: Token) => {
      dispatch(setToken(newToken));
      replaceHistory(`/transfer/${selectedNetwork.chainId}/${newToken.address}/${recipient || ''}`);
    },
    [selectedNetwork.chainId, dispatch, replaceHistory]
  );

  const onSetTokenAmount = (newAmount: string) => {
    if (!selectedToken) return;
    dispatch(setAmount(newAmount));
  };

  const addCustomTokenToList = React.useCallback(
    (customToken: Token) => {
      dispatch(addCustomToken(customToken));
    },
    [dispatch]
  );

  const balanceAmount: AmountsOfToken | undefined =
    (!isUndefined(balance) &&
      selectedToken && {
        amount: balance.toString(),
        amountInUnits: formatCurrencyAmount(balance, selectedToken),
      }) ||
    undefined;
  return (
    <>
      <TokenPickerModal
        shouldShow={shouldShowPicker}
        onClose={onTokenPickerClose}
        modalTitle={<FormattedMessage description="youTransfer" defaultMessage="You transfer" />}
        onChange={onSetToken}
        isLoadingYieldOptions={false}
        onAddToken={addCustomTokenToList}
        account={activeWallet?.address}
        showWrappedAndProtocol
        allowAllTokens
        allowCustomTokens
      />
      <ContainerBox flexDirection="column" gap={4}>
        <TokenSelectorComponent handleChange={onSetToken} selectedToken={selectedToken} />
        <TokenAmounUsdInput
          value={amount}
          token={selectedToken}
          balance={balanceAmount}
          tokenPrice={fetchedTokenPrice}
          disabled={!selectedToken}
          onChange={onSetTokenAmount}
        />
      </ContainerBox>
    </>
  );
};

export default React.memo(TokenSelector);
