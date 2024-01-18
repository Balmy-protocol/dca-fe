import React from 'react';
import styled from 'styled-components';
import { BackgroundPaper, Divider, Skeleton, ContainerBox, Typography, colors } from 'ui-library';
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
import useEstimateTransferFee from '@pages/transfer/hooks/useEstimateTransferFee';

const StyledTransferForm = styled(BackgroundPaper)`
  ${({ theme: { spacing } }) => `
  padding: ${spacing(8)} ${spacing(6)};
  `}
`;

const StyledNoWalletsConnected = styled(ContainerBox)`
  ${({ theme: { palette } }) => `
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

const StyledNetworkFeeContainer = styled(ContainerBox)`
  ${({ theme: { spacing } }) => `
  margin: ${spacing(6)} 0 ${spacing(8)};
  `}
`;

const noWalletConnected = (
  <StyledNoWalletsConnected flexDirection="column" gap={2} justifyContent="center">
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
  const [fee, isLoadingFee] = useEstimateTransferFee();

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
    <StyledTransferForm variant="outlined">
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
          <ContainerBox flexDirection="column" gap={3}>
            <NetworkSelector networkList={networkList} handleChangeCallback={handleChangeNetworkCallback} />
            <TokenSelector />
          </ContainerBox>
          <StyledNetworkFeeContainer flexDirection="column" gap={3}>
            <Divider />
            <Typography variant="bodySmall" fontWeight="bold" color={colors[themeMode].typography.typo3}>
              <FormattedMessage description="networkFee" defaultMessage="Network Fee:" />
              {!fee ? (
                isLoadingFee ? (
                  <Skeleton variant="text" width="5ch" sx={{ marginLeft: '1ch', display: 'inline-flex' }} />
                ) : (
                  ` -`
                )
              ) : (
                ` $${Number(fee?.amountInUSD).toFixed(2)}`
              )}
            </Typography>
          </StyledNetworkFeeContainer>
          <TransferButton />
        </>
      )}
    </StyledTransferForm>
  );
};

export default TransferForm;
