import React from 'react';
import styled from 'styled-components';
import { Paper, Typography } from 'ui-library';
import NetworkSelector from '@common/components/network-selector';
import WalletSelector from '@common/components/wallet-selector';
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

const StyledPaper = styled(Paper)`
  margin-top: 16px;
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  flex-grow: 1;
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
    const { isValidRecipient } = validateAddress(recipientParam, activeWallet?.address);
    if (isValidRecipient) {
      dispatch(setRecipient(recipientParam));
    }
  }, []);

  const handleChangeNetworkCallback = React.useCallback((chainId: number) => {
    dispatch(setChainId(chainId));
    replaceHistory(`/transfer/${chainId}`);
  }, []);

  return (
    <StyledPaper variant="outlined">
      {!activeWallet ? (
        <Typography variant="body1">
          <FormattedMessage description="PleaseConnectWallet" defaultMessage="Please connect your Wallet" />
        </Typography>
      ) : (
        <>
          <WalletSelector setSelectionAsActive />
          <NetworkSelector networkList={networkList} handleChangeCallback={handleChangeNetworkCallback} />
          <TokenSelector />
          <RecipientAddress />
          <TransferButton />
        </>
      )}
    </StyledPaper>
  );
};

export default TransferForm;
