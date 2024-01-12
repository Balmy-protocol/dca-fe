import React from 'react';
import styled from 'styled-components';
import { BackgroundPaper, Typography, colors } from 'ui-library';
import NetworkSelector from '@common/components/network-selector';
import TokenSelector from '../token-selector';
import RecipientAddress from '../recipient-address';
import TransferButton from '../transfer-button';
import useActiveWallet from '@hooks/useActiveWallet';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import useToken from '@hooks/useToken';
import { isEqual, orderBy } from 'lodash';
import { useAppDispatch } from '@hooks/state';
import { useTransferState } from '@state/transfer/hooks';
import { setChainId, setRecipient, setToken } from '@state/transfer/actions';
import { identifyNetwork, validateAddress } from '@common/utils/parsing';
import { getAllChains } from '@mean-finance/sdk';
import { NETWORKS } from '@constants';
import useReplaceHistory from '@hooks/useReplaceHistory';
import { useThemeMode } from '@state/config/hooks';

const StyledTransferForm = styled(BackgroundPaper)`
  ${({ theme: { palette, spacing } }) => `
  border: 1px solid ${colors[palette.mode].border.border1};
  border-radius: ${spacing(4)};
  padding: ${spacing(8)};
  box-shadow: none;
`}
`;

const TransferForm = () => {
  const {
    chainId: chainIdParam,
    token: tokenParamAddress,
    recipient: recipientParam,
  } = useParams<{ chainId?: string; token?: string; recipient?: string }>();

  const activeWallet = useActiveWallet();
  const dispatch = useAppDispatch();
  const replaceHistory = useReplaceHistory();
  const { token: selectedToken } = useTransferState();
  const tokenParam = useToken(tokenParamAddress, undefined, true);
  const themeMode = useThemeMode();

  const networkList = React.useMemo(
    () =>
      orderBy(Object.values(getAllChains()), ['testnet'], ['desc']).filter(
        (network) => !network.testnet || network.ids.includes('base-goerli')
      ),
    [NETWORKS]
  );

  React.useEffect(() => {
    const networkToSet = identifyNetwork(networkList, chainIdParam);
    dispatch(setChainId(networkToSet?.chainId || NETWORKS.mainnet.chainId));
  }, []);

  React.useEffect(() => {
    if (tokenParam && !isEqual(selectedToken, tokenParam)) {
      dispatch(setToken(tokenParam));
    }
  }, [tokenParam]);

  React.useEffect(() => {
    if (!recipientParam) return;
    if (validateAddress(recipientParam)) {
      dispatch(setRecipient(recipientParam));
    }
  }, []);

  const handleChangeNetworkCallback = React.useCallback((chainId: number) => {
    dispatch(setChainId(chainId));
    replaceHistory(`/transfer/${chainId}`);
  }, []);

  const noWalletConnected = React.useMemo(
    () => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          justifyContent: 'center',
          textAlign: 'center',
          color: colors[themeMode].typography.typo3,
        }}
      >
        <Typography variant="h4">💸</Typography>
        <Typography variant="h5" fontWeight="bold">
          <FormattedMessage description="noWalletConnected" defaultMessage="No Wallet Connected" />
        </Typography>
        <Typography variant="body">
          <FormattedMessage
            description="transferConnectWallet"
            defaultMessage="Connect your wallet to be able to transfer"
          />
        </Typography>
      </div>
    ),
    [themeMode]
  );

  return (
    <StyledTransferForm>
      {!activeWallet ? (
        noWalletConnected
      ) : (
        <>
          <NetworkSelector networkList={networkList} handleChangeCallback={handleChangeNetworkCallback} />
          <TokenSelector />
          <RecipientAddress />
          <TransferButton />
        </>
      )}
    </StyledTransferForm>
  );
};

export default TransferForm;
