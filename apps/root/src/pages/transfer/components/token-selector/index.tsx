import React from 'react';
import { Token } from '@types';
import TokenSelectorComponent from '@common/components/token-selector';
import useActiveWallet from '@hooks/useActiveWallet';
import useReplaceHistory from '@hooks/useReplaceHistory';
import { useAppDispatch } from '@state/hooks';
import { useTransferState } from '@state/transfer/hooks';
import { setAmount, setToken } from '@state/transfer/actions';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { useTokenBalance } from '@state/balances/hooks';
import { ContainerBox, TokenAmounUsdInput } from 'ui-library';
import useRawUsdPrice from '@hooks/useUsdRawPrice';

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

  const onSetToken = React.useCallback(
    (newToken: Token) => {
      dispatch(setToken(newToken));
      replaceHistory(`/transfer/${selectedNetwork.chainId}/${newToken.address}/${recipient || ''}`);
    },
    [selectedNetwork.chainId, dispatch, replaceHistory, recipient]
  );

  const onSetTokenAmount = (newAmount: string) => {
    if (!selectedToken) return;
    dispatch(setAmount(newAmount));
  };

  return (
    <>
      <ContainerBox flexDirection="column" gap={4}>
        <TokenSelectorComponent handleChange={onSetToken} selectedToken={selectedToken} />
        <TokenAmounUsdInput
          value={amount}
          token={selectedToken}
          balance={balance}
          tokenPrice={fetchedTokenPrice}
          disabled={!selectedToken}
          onChange={onSetTokenAmount}
        />
      </ContainerBox>
    </>
  );
};

export default React.memo(TokenSelector);
