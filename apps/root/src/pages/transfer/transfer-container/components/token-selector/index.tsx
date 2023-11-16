import styled from 'styled-components';
import React from 'react';
import { Token } from '@types';
import TokenPickerModal from '@common/components/token-picker-modal';
import TokenPickerWithAmount from '@common/components/token-amount-input';
import useActiveWallet from '@hooks/useActiveWallet';
import useReplaceHistory from '@hooks/useReplaceHistory';
import { addCustomToken } from '@state/token-lists/actions';
import useUsdPrice from '@hooks/useUsdPrice';
import { parseUnits } from '@ethersproject/units';
import useBalance from '@hooks/useBalance';
import { useAppDispatch } from '@state/hooks';
import { useTransferState } from '@state/transfer/hooks';
import { setAmount, setToken } from '@state/transfer/actions';
import { FormattedMessage } from 'react-intl';
import useSelectedNetwork from '@hooks/useSelectedNetwork';

const StyledContentContainer = styled.div`
  position: relative;
  padding: 16px;
  border-radius: 8px;
  gap: 16px;
  display: flex;
  flex-direction: column;
`;

const TokenSelector = () => {
  const dispatch = useAppDispatch();
  const replaceHistory = useReplaceHistory();
  const selectedNetwork = useSelectedNetwork();
  const activeWallet = useActiveWallet();
  const { token: selectedToken, amount, recipient } = useTransferState();
  const [balance] = useBalance(selectedToken, activeWallet?.address);

  const [fetchedTokenPrice, loadingTokenPrice] = useUsdPrice(
    selectedToken,
    parseUnits(amount || '0', selectedToken?.decimals)
  );
  const [shouldShowPicker, setShouldShowPicker] = React.useState(false);

  const cantFund = !!selectedToken && !!amount && !!balance && parseUnits(amount, selectedToken.decimals).gt(balance);

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
      <StyledContentContainer>
        <TokenPickerWithAmount
          id="transfer-token"
          label={<FormattedMessage description="tokenToTransfer" defaultMessage="Token to transfer:" />}
          cantFund={cantFund}
          balance={balance}
          tokenAmount={amount}
          selectedToken={selectedToken}
          isLoadingPrice={loadingTokenPrice}
          tokenPrice={fetchedTokenPrice}
          startSelectingCoin={() => setShouldShowPicker(true)}
          onSetTokenAmount={onSetTokenAmount}
          maxBalanceBtn
        />
      </StyledContentContainer>
    </>
  );
};

export default React.memo(TokenSelector);
