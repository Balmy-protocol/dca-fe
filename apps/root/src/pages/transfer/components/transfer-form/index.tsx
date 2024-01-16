import React from 'react';
import styled from 'styled-components';
import { BackgroundPaper, Divider, Typography, colors } from 'ui-library';
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
  padding: ${spacing(8)} ${spacing(6)};
  `}
`;

const StyledNoWalletsConnected = styled.div`
  ${({ theme: { palette, spacing } }) => `
  display: flex;
  flex-direction: column;
  gap: ${spacing(2)};
  justify-content: center;
  text-align: center;
  color: ${colors[palette.mode].typography.typo3};
  `}
`;

const StyledRecipientContainer = styled.div`
  ${({ theme: { spacing } }) => `
  margin-top: ${spacing(6)};
  margin-bottom: ${spacing(12)};
  `}
`;

const StyledInputsContainer = styled.div`
  ${({ theme: { spacing } }) => `
  display: flex;
  flex-direction: column;
  gap: ${spacing(3)};
  `}
`;

const StyledNetworkFeeContainer = styled.div`
  ${({ theme: { spacing } }) => `
  display: flex;
  flex-direction: column;
  gap: ${spacing(3)};
  margin: ${spacing(6)} 0 ${spacing(8)};
  `}
`;

const noWalletConnected = (
  <StyledNoWalletsConnected>
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
  </StyledNoWalletsConnected>
);

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

    if (!!recipientParam && validateAddress(recipientParam)) {
      dispatch(setRecipient(recipientParam));
    }
  }, []);

  React.useEffect(() => {
    if (tokenParam && !isEqual(selectedToken, tokenParam)) {
      dispatch(setToken(tokenParam));
    }
  }, [tokenParam]);

  const handleChangeNetworkCallback = React.useCallback((chainId: number) => {
    dispatch(setChainId(chainId));
    replaceHistory(`/transfer/${chainId}`);
  }, []);

  return (
    <StyledTransferForm elevation={0}>
      {!activeWallet ? (
        noWalletConnected
      ) : (
        <>
          <Typography variant="h3" fontWeight="bold" color={colors[themeMode].typography.typo1}>
            <FormattedMessage description="transfer" defaultMessage="Transfer" />
          </Typography>
          <StyledRecipientContainer>
            <RecipientAddress />
          </StyledRecipientContainer>
          <StyledInputsContainer>
            <NetworkSelector networkList={networkList} handleChangeCallback={handleChangeNetworkCallback} />
            <TokenSelector />
          </StyledInputsContainer>
          <StyledNetworkFeeContainer>
            <Divider />
            <Typography variant="bodySmall" fontWeight="bold" color={colors[themeMode].typography.typo3}>
              <FormattedMessage description="networkFee" defaultMessage="Network Fee" />
              {`: $${0.0}`}
            </Typography>
          </StyledNetworkFeeContainer>
          <TransferButton />
        </>
      )}
    </StyledTransferForm>
  );
};

export default TransferForm;
