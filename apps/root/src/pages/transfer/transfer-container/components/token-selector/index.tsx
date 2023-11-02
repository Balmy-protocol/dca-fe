import styled from 'styled-components';
import React from 'react';
import { Token } from '@types';
import TokenPickerModal from './components/token-picker-modal';
import useActiveWallet from '@hooks/useActiveWallet';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import useReplaceHistory from '@hooks/useReplaceHistory';
import { addCustomToken } from '@state/token-lists/actions';
import FromAmountInput from './components/token-amount-input';
import useUsdPrice from '@hooks/useUsdPrice';
import { parseUnits } from '@ethersproject/units';
import useBalance from '@hooks/useBalance';
import { useAppDispatch } from '@state/hooks';
import { useTransferState } from '@state/transfer/hooks';
import { setToken } from '@state/transfer/actions';
import useToken from '@hooks/useToken';

interface TokenSelectorProps {
  tokenParam?: string;
}

const StyledContentContainer = styled.div`
  position: relative;
  padding: 16px;
  border-radius: 8px;
  gap: 16px;
  display: flex;
  flex-direction: column;
`;

const TokenSelector = ({ tokenParam: tokenParamAddress }: TokenSelectorProps) => {
  const dispatch = useAppDispatch();
  const replaceHistory = useReplaceHistory();
  const currentNetwork = useCurrentNetwork();
  const activeWallet = useActiveWallet();
  const { token: selectedToken, amount, recipient } = useTransferState();
  const [balance] = useBalance(selectedToken, activeWallet?.address);
  const tokenParam = useToken(tokenParamAddress);

  const [fetchedTokenPrice, loadingTokenPrice] = useUsdPrice(
    selectedToken,
    parseUnits(amount || '0', selectedToken?.decimals)
  );
  const [shouldShowPicker, setShouldShowPicker] = React.useState(false);

  const cantFund = !!selectedToken && !!amount && !!balance && parseUnits(amount, selectedToken.decimals).gt(balance);

  React.useEffect(() => {
    if (tokenParam && tokenParam.chainId === currentNetwork.chainId) {
      dispatch(setToken(tokenParam));
    }
  }, []);

  const onTokenPickerClose = React.useCallback(() => {
    setShouldShowPicker(false);
  }, []);

  const onSetToken = React.useCallback(
    (newToken: Token) => {
      dispatch(setToken(newToken));
      replaceHistory(`/transfer/${currentNetwork.chainId}/${newToken.address}/${recipient || ''}`);
    },
    [currentNetwork.chainId, dispatch, replaceHistory]
  );

  const addCustomTokenToList = React.useCallback(
    (customToken: Token) => {
      dispatch(addCustomToken(customToken));
    },
    [currentNetwork.chainId, dispatch]
  );

  const startSelectingCoin = (token: Token) => {
    dispatch(setToken(token));
    setShouldShowPicker(true);
  };

  return (
    <>
      <TokenPickerModal
        shouldShow={shouldShowPicker}
        onClose={onTokenPickerClose}
        isFrom={true}
        onChange={onSetToken}
        isLoadingYieldOptions={false}
        onAddToken={addCustomTokenToList}
        account={activeWallet?.address}
      />
      <StyledContentContainer>
        <FromAmountInput
          cantFund={cantFund}
          balance={balance}
          fromValue={amount}
          selectedToken={selectedToken}
          // isLoadingRoute={false}
          isLoadingFromPrice={loadingTokenPrice}
          fromPrice={fetchedTokenPrice}
          startSelectingCoin={startSelectingCoin}
          // isBuyOrder={false}
        />
      </StyledContentContainer>
    </>
  );
};

export default TokenSelector;
