import React from 'react';
import styled from 'styled-components';
import {
  BackgroundPaper,
  DividerBorder1,
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
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import useToken from '@hooks/useToken';
import { isEqual, orderBy } from 'lodash';
import { useAppDispatch } from '@hooks/state';
import { useTransferState } from '@state/transfer/hooks';
import { resetForm, setChainId, setRecipient, setToken } from '@state/transfer/actions';
import { identifyNetwork } from '@common/utils/parsing';
import { getAllChains, isSameAddress } from '@balmy/sdk';
import { NETWORKS } from '@constants';
import useReplaceHistory from '@hooks/useReplaceHistory';
import { useThemeMode } from '@state/config/hooks';
import useEstimateTransferFee from '@pages/transfer/hooks/useEstimateTransferFee';
import ConfirmTransferModal from '../confirm-transfer-modal';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { Hash, parseUnits } from 'viem';
import TransactionConfirmation from '@common/components/transaction-confirmation';
import useStoredContactList from '@hooks/useStoredContactList';
import { TransactionApplicationIdentifier } from 'common-types';
import ContactModal, { ContactListActiveModal } from '../../../../common/components/contact-modal';
import ContactsButton from '../recipient-address/components/contacts-button';
import TransferButton from '../transfer-button';
import useWallets from '@hooks/useWallets';
import useAnalytics from '@hooks/useAnalytics';
import { formatUsdAmount } from '@common/utils/currency';
import useValidateAddress from '@hooks/useValidateAddress';
import FormWalletSelector from '@common/components/form-wallet-selector';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import useEnsAddress from '@hooks/useEnsAddress';

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
  margin-bottom: ${spacing(1.5)};
  `}
`;

const StyledNetworkFeeContainer = styled(ContainerBox)`
  ${({ theme: { spacing } }) => `
  margin: ${spacing(6)} 0 ${spacing(6)};
  `}
`;

const StyledFrequentRecipient = styled(ContainerBox).attrs({ gap: 6, justifyContent: 'center', alignItems: 'center' })`
  margin-top: ${({ theme: { spacing } }) => spacing(6)};
`;

const noWalletConnected = (
  <StyledNoWalletsConnected flexDirection="column" gap={2} justifyContent="center">
    <Typography variant="h4Bold">💸</Typography>
    <Typography variant="h5Bold">
      <FormattedMessage description="noWalletConnected" defaultMessage="No Wallet Connected" />
    </Typography>
    <Typography variant="bodyRegular">
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

  const intl = useIntl();
  const activeWallet = useActiveWallet();
  const wallets = useWallets();
  const dispatch = useAppDispatch();
  const replaceHistory = useReplaceHistory();
  const { trackEvent } = useAnalytics();
  const actualCurrentNetwork = useCurrentNetwork();
  const { token: selectedToken, recipient, recipientAddress, amount } = useTransferState();
  const selectedNetwork = useSelectedNetwork();
  const [openConfirmTxStep, setOpenConfirmTxStep] = React.useState(false);
  const [shouldShowConfirmation, setShouldShowConfirmation] = React.useState(false);
  const [currentTransaction, setCurrentTransaction] = React.useState<{ hash: Hash; chainId: number } | undefined>();
  const themeMode = useThemeMode();
  const [fee, isLoadingFee] = useEstimateTransferFee();
  const contactList = useStoredContactList();
  const [frequentRecipient, setFrequentRecipient] = React.useState<string | undefined>();
  const [isContactSelection, setIsContactSelection] = React.useState(false);
  const [activeModal, setActiveModal] = React.useState<ContactListActiveModal>(ContactListActiveModal.NONE);
  const {
    validationResult: { isValidAddress: isValidAddressString, errorMessage: addressErrorMessage },
    setAddress: setInputAddress,
  } = useValidateAddress({
    restrictActiveWallet: true,
    defaultValue: recipientAddress,
  });
  const { ensAddress, isLoadingEnsAddress, handleEnsNameSearch } = useEnsAddress(recipientAddress);

  const isValidAddress =
    isValidAddressString || (!isLoadingEnsAddress && !!ensAddress && !isSameAddress(ensAddress, activeWallet?.address));

  const parsedAmount = parseUnits(amount || '0', selectedToken?.decimals || 18);
  const disableTransfer = !recipient || !selectedToken || parsedAmount <= 0n || !activeWallet || !isValidAddress;

  const { networkList, networkToSet } = React.useMemo(() => {
    const networks = orderBy(Object.values(getAllChains()), ['testnet'], ['desc']).filter(
      (network) => !network.testnet
    );
    const networkFromParam = identifyNetwork(networks, chainIdParam);
    return {
      networkList: networks,
      networkToSet: networkFromParam,
    };
  }, []);

  const tokenParam = useToken({
    tokenAddress: tokenParamAddress,
    checkForSymbol: true,
    filterForDca: false,
    chainId: networkToSet?.chainId || selectedNetwork.chainId,
  });

  React.useEffect(() => {
    dispatch(setChainId(networkToSet?.chainId || NETWORKS.mainnet.chainId));
    // Ens may have a dot in the name, so we need to decode it
    const safeRecipientParam = recipientParam?.replace(/_/g, '.');
    if (!!safeRecipientParam) {
      void handleEnsNameSearch(safeRecipientParam);
      setInputAddress(safeRecipientParam);
      dispatch(setRecipient(safeRecipientParam));
    }
  }, []);

  React.useEffect(() => {
    if (selectedNetwork.chainId !== actualCurrentNetwork.chainId && !chainIdParam) {
      dispatch(setChainId(actualCurrentNetwork.chainId));
    }
  }, [actualCurrentNetwork]);

  React.useEffect(() => {
    if (tokenParam && !isEqual(selectedToken, tokenParam)) {
      dispatch(setToken(tokenParam));
    }
  }, [tokenParam]);

  const handleChangeNetworkCallback = React.useCallback((chainId: number) => {
    dispatch(setToken(null));
    dispatch(setChainId(chainId));
    replaceHistory(`/transfer/${chainId}`);
    trackEvent('Transfer - Change network', { chainId });
  }, []);

  const handleTransactionConfirmationClose = React.useCallback(() => {
    dispatch(resetForm());
    setShouldShowConfirmation(false);
    setFrequentRecipient(undefined);
    setIsContactSelection(false);
  }, [setShouldShowConfirmation]);

  const isRecipientInContactList = React.useMemo(
    () => contactList.some((contact) => contact.address === recipientAddress),
    [contactList, recipientAddress]
  );

  const onAddFrequentContact = () => {
    setActiveModal(ContactListActiveModal.ADD_CONTACT);
    setFrequentRecipient(recipientAddress);
    trackEvent('Transfer - Added recipient as contact');
  };

  const onClickContact = (newRecipient: string) => {
    setInputAddress(newRecipient);
    dispatch(setRecipient(newRecipient));
    setActiveModal(ContactListActiveModal.NONE);
    setIsContactSelection(true);
    if (selectedToken) {
      replaceHistory(`/transfer/${selectedNetwork.chainId}/${selectedToken.address}/${newRecipient}`);
    }
    trackEvent('Transfer - Set contact as recipient');
  };

  const onTransferClick = () => {
    setOpenConfirmTxStep(true);
    trackEvent('Transfer - Open confirm modal');
  };

  const onOpenContactList = () => {
    setActiveModal(ContactListActiveModal.CONTACT_LIST);
    trackEvent('Transfer - Open contact modal');
  };

  return (
    <>
      <StyledTransferForm variant="outlined">
        <TransactionConfirmation
          shouldShow={shouldShowConfirmation}
          transaction={currentTransaction}
          showWalletBalanceChanges={false}
          successSubtitle={
            <FormattedMessage
              description="transferSuccessfulDescription"
              defaultMessage="<b>You have sent {amount} {symbol}.</b> You can view the transaction details in your activity log. Check your receipt for more info."
              values={{
                symbol: selectedToken?.symbol,
                amount,
                b: (chunks) => <b>{chunks}</b>,
              }}
            />
          }
          successTitle={
            <FormattedMessage
              description="transactionConfirmationTransferSuccessful"
              defaultMessage="Transfer successful"
            />
          }
          loadingTitle={intl.formatMessage(
            defineMessage({
              description: 'transactionConfirmationTransferLoadingTitle',
              defaultMessage: 'Transfering...',
            })
          )}
          loadingSubtitle={intl.formatMessage(
            defineMessage({
              description: 'transactionConfirmationTransferLoadingSubTitle',
              defaultMessage: 'You are sending {value} {token}.',
            }),
            {
              value: amount || '',
              token: selectedToken?.symbol || '',
            }
          )}
          actions={[
            {
              variant: 'contained',
              color: 'primary',
              onAction: handleTransactionConfirmationClose,
              label: intl.formatMessage({ description: 'transactionConfirmationDone', defaultMessage: 'Done' }),
            },
          ]}
          txIdentifierForSatisfaction={TransactionApplicationIdentifier.TRANSFER}
        />
        <ConfirmTransferModal
          open={openConfirmTxStep}
          setOpen={setOpenConfirmTxStep}
          fee={fee}
          isLoadingFee={isLoadingFee}
          network={selectedNetwork}
          setCurrentTransaction={setCurrentTransaction}
          setShouldShowConfirmation={setShouldShowConfirmation}
        />
        <ContactModal
          activeModal={activeModal}
          setActiveModal={setActiveModal}
          defaultAddressValue={frequentRecipient}
          clearDefaultAddressValue={() => setFrequentRecipient(undefined)}
          onClickContact={onClickContact}
        />
        {!activeWallet && !wallets.length
          ? noWalletConnected
          : !shouldShowConfirmation && (
              <>
                <ContainerBox flexDirection="column" gap={3}>
                  <ContainerBox gap={1} flexDirection="column">
                    <Typography
                      variant="bodySmallSemibold"
                      color={({ palette: { mode } }) => colors[mode].typography.typo4}
                    >
                      <FormattedMessage description="transfer.form.wallet-selector.title" defaultMessage="Wallet" />
                    </Typography>
                    <FormWalletSelector />
                  </ContainerBox>
                  <ContainerBox gap={1} flexDirection="column">
                    <Typography
                      variant="bodySmallSemibold"
                      color={({ palette: { mode } }) => colors[mode].typography.typo4}
                    >
                      <FormattedMessage
                        description="transfer.form.recipient-selector.title"
                        defaultMessage="Transfer to"
                      />
                    </Typography>
                    <StyledRecipientContainer>
                      <RecipientAddress
                        validationResult={{ isValidAddress, errorMessage: addressErrorMessage }}
                        setAddress={setInputAddress}
                        isContactSelection={isContactSelection}
                        setIsContactSelection={(newValue) => setIsContactSelection(newValue)}
                      />
                      <ContactsButton onClick={onOpenContactList} />
                    </StyledRecipientContainer>
                  </ContainerBox>
                  <ContainerBox gap={1} flexDirection="column">
                    <Typography
                      variant="bodySmallSemibold"
                      color={({ palette: { mode } }) => colors[mode].typography.typo4}
                    >
                      <FormattedMessage description="transfer.form.network-selector.title" defaultMessage="Network" />
                    </Typography>
                    <NetworkSelector networkList={networkList} handleChangeCallback={handleChangeNetworkCallback} />
                  </ContainerBox>
                  <TokenSelector />
                </ContainerBox>
                <StyledNetworkFeeContainer flexDirection="column" gap={3}>
                  <DividerBorder1 />
                  <Typography variant="bodySmallBold">
                    <FormattedMessage description="networkFee" defaultMessage="Network Fee:" />
                    {!fee ? (
                      isLoadingFee ? (
                        <Skeleton variant="text" width="5ch" sx={{ marginLeft: '1ch', display: 'inline-flex' }} />
                      ) : (
                        ` -`
                      )
                    ) : (
                      ` $${formatUsdAmount({ amount: fee?.amountInUSD, intl })}`
                    )}
                  </Typography>
                </StyledNetworkFeeContainer>
                <ContainerBox fullWidth justifyContent="center">
                  <TransferButton
                    isValidAddress={isValidAddress}
                    disableTransfer={disableTransfer}
                    onTransferClick={onTransferClick}
                  />
                </ContainerBox>
              </>
            )}
      </StyledTransferForm>
      {shouldShowConfirmation && !isRecipientInContactList && (
        <StyledFrequentRecipient>
          <ContainerBox gap={1} alignItems="center">
            <ProfileAddIcon />
            <ContainerBox flexDirection="column">
              <Typography variant="bodySmallBold" color={colors[themeMode].typography.typo2}>
                <FormattedMessage description="frequientRecipientQuestion" defaultMessage="Frequent Recipient?" />
              </Typography>
              <Typography variant="bodySmallRegular" color={colors[themeMode].typography.typo2}>
                <FormattedMessage description="addThemToYourContacts" defaultMessage="Add them to your contacts." />
              </Typography>
            </ContainerBox>
          </ContainerBox>
          <Button variant="outlined" onClick={onAddFrequentContact}>
            <FormattedMessage description="addToContacts" defaultMessage="Add to Contacts" />
          </Button>
        </StyledFrequentRecipient>
      )}
    </>
  );
};

export default TransferForm;
