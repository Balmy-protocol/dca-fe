import React from 'react';
import styled from 'styled-components';
import {
  BackgroundPaper,
  Divider,
  Skeleton,
  ContainerBox,
  Typography,
  colors,
  Button,
  ProfileAddIcon,
} from 'ui-library';
import NetworkSelector from '@common/components/network-selector';
import TokenSelector from '../token-selector';
import RecipientAddress from '../recipient-address';
import useActiveWallet from '@hooks/useActiveWallet';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import useToken from '@hooks/useToken';
import { isEqual, orderBy } from 'lodash';
import { useAppDispatch } from '@hooks/state';
import { useTransferState } from '@state/transfer/hooks';
import { resetForm, setChainId, setRecipient, setToken } from '@state/transfer/actions';
import { identifyNetwork, validateAddress } from '@common/utils/parsing';
import { getAllChains } from '@mean-finance/sdk';
import { NETWORKS } from '@constants';
import useReplaceHistory from '@hooks/useReplaceHistory';
import { useThemeMode } from '@state/config/hooks';
import useEstimateTransferFee from '@pages/transfer/hooks/useEstimateTransferFee';
import ConfirmTransferModal from '../confirm-transfer-modal';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { parseUnits } from 'viem';
import TransactionConfirmation from '../transaction-confirmation';
import useStoredContactList from '@hooks/useStoredContactList';
import AddContactModal from '../recipient-address/components/add-contact-modal';

const StyledTransferForm = styled(BackgroundPaper)`
  position: relative;
`;

const StyledNoWalletsConnected = styled(ContainerBox)`
  ${({ theme: { palette } }) => `
  text-align: center;
  color: ${colors[palette.mode].typography.typo3};
  `}
`;

const StyledRecipientContainer = styled(ContainerBox).attrs({ gap: 3, alignItems: 'start' })`
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

const StyledFrequentRecipient = styled(ContainerBox).attrs({ gap: 6, justifyContent: 'center', alignItems: 'center' })`
  margin-top: ${({ theme: { spacing } }) => spacing(8)};
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
  const { token: selectedToken, recipient, amount } = useTransferState();
  const selectedNetwork = useSelectedNetwork();
  const tokenParam = useToken(tokenParamAddress, undefined, true);
  const [openConfirmTxStep, setOpenConfirmTxStep] = React.useState(false);
  const [shouldShowConfirmation, setShouldShowConfirmation] = React.useState(false);
  const [currentTxHash, setCurrentTxHash] = React.useState('');
  const themeMode = useThemeMode();
  const [fee, isLoadingFee] = useEstimateTransferFee();
  const contactList = useStoredContactList();
  const [frequentRecipient, setFrequentRecipient] = React.useState<string | undefined>();
  const [openContactListModal, setOpenContactListModal] = React.useState(false);
  const [openAddContactModal, setOpenAddContactModal] = React.useState(false);

  const parsedAmount = parseUnits(amount || '0', selectedToken?.decimals || 18);
  const disableTransfer = !recipient || !selectedToken || parsedAmount <= 0n || !activeWallet;

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

  const handleTransactionConfirmationClose = React.useCallback(() => {
    dispatch(resetForm());
    setShouldShowConfirmation(false);
  }, [setShouldShowConfirmation]);

  const goBackToTransfer = () => {
    setOpenContactListModal(false);
    setOpenAddContactModal(false);
  };

  const isRecipientInContactList = React.useMemo(
    () => contactList.some((contact) => contact.address === recipient),
    [contactList, recipient]
  );

  const onAddFrequentContact = () => {
    setFrequentRecipient(recipient);
    setOpenAddContactModal(true);
  };

  return (
    <>
      <StyledTransferForm variant="outlined">
        <TransactionConfirmation
          from={selectedToken}
          shouldShow={shouldShowConfirmation}
          txHash={currentTxHash}
          handleClose={handleTransactionConfirmationClose}
        />
        <ConfirmTransferModal
          open={openConfirmTxStep}
          setOpen={setOpenConfirmTxStep}
          fee={fee}
          isLoadingFee={isLoadingFee}
          network={selectedNetwork}
          setCurrentTxHash={setCurrentTxHash}
          setShouldShowConfirmation={setShouldShowConfirmation}
        />
        <AddContactModal
          open={openAddContactModal}
          setOpen={setOpenAddContactModal}
          goBackToTransfer={goBackToTransfer}
          defaultAddressValue={frequentRecipient}
          clearDefaultAddressValue={() => setFrequentRecipient(undefined)}
        />
        {!activeWallet ? (
          noWalletConnected
        ) : (
          <>
            <Typography variant="h3" fontWeight="bold" color={colors[themeMode].typography.typo1}>
              <FormattedMessage description="transfer" defaultMessage="Transfer" />
            </Typography>
            <StyledRecipientContainer>
              <RecipientAddress
                shouldShowContactList={openContactListModal}
                setShouldShowContactList={setOpenContactListModal}
                openAddContactModal={openAddContactModal}
                setOpenAddContactModal={setOpenAddContactModal}
              />
            </StyledRecipientContainer>
            <ContainerBox flexDirection="column" gap={3}>
              <NetworkSelector networkList={networkList} handleChangeCallback={handleChangeNetworkCallback} />
              <TokenSelector />
            </ContainerBox>
            <StyledNetworkFeeContainer flexDirection="column" gap={3}>
              <Divider />
              <Typography variant="bodySmall" fontWeight="bold">
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
            <ContainerBox fullWidth justifyContent="center">
              <Button
                fullWidth
                onClick={() => setOpenConfirmTxStep(true)}
                disabled={disableTransfer}
                variant="contained"
              >
                {disableTransfer ? (
                  <FormattedMessage description="enterAmount" defaultMessage="Enter an amount" />
                ) : (
                  <FormattedMessage description="transfer transferButton" defaultMessage="Transfer" />
                )}
              </Button>
            </ContainerBox>
          </>
        )}
      </StyledTransferForm>
      {shouldShowConfirmation && !isRecipientInContactList && (
        <StyledFrequentRecipient>
          <ContainerBox gap={1} alignItems="center" color={colors[themeMode].typography.typo2}>
            <ProfileAddIcon />
            <ContainerBox flexDirection="column">
              <Typography variant="bodySmall" fontWeight="bold">
                <FormattedMessage description="frequientRecipientQuestion" defaultMessage="Frequent Recipient?" />
              </Typography>
              <Typography variant="bodySmall">
                <FormattedMessage description="addThemToYourContacts" defaultMessage="Add them to your contacts." />
              </Typography>
            </ContainerBox>
          </ContainerBox>
          <Button color="secondary" onClick={onAddFrequentContact}>
            <FormattedMessage description="addToContacts" defaultMessage="Add to Contacts" />
          </Button>
        </StyledFrequentRecipient>
      )}
    </>
  );
};

export default TransferForm;