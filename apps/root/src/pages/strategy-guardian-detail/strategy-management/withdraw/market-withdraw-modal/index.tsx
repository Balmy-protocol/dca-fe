import React from 'react';
import { FormattedMessage } from 'react-intl';
import CommonTransactionStepItem from '@common/components/transaction-steps/common-transaction-step';
import useActiveWallet from '@hooks/useActiveWallet';
import useContractService from '@hooks/useContractService';
import { DisplayStrategy, EarnPermission, EarnPosition, WithdrawType } from 'common-types';
import { ContainerBox, Modal, Wallet2Icon, UnlockIcon, Typography, Alert } from 'ui-library';
import { useEarnManagementState } from '@state/earn-management/hooks';
import useEstimateMarketWithdraw from '../hooks/useEstimateMarketWithdraw';
import TokenAmount from '@common/components/token-amount';

interface MarketWithdrawModalContentProps {
  strategy?: DisplayStrategy;
  isOpen: boolean;
  position?: EarnPosition;
}

const MarketWithdrawModalContent = ({ strategy, isOpen, position }: MarketWithdrawModalContentProps) => {
  const { asset } = useEarnManagementState();

  const { isLoading, withdrawAmountOfToken, withdrawFeeAmountOfToken, marketAmountOfToken, error } =
    useEstimateMarketWithdraw({
      strategy,
      shouldRefetch: isOpen,
      position,
    });

  return (
    <>
      {error && (
        <Alert severity="warning">
          <FormattedMessage
            defaultMessage="We were unable to calculate the received amount, but you can still proceed with your transaction"
            description="earn.strategy-management.market-withdrawal-modal.error"
          />
        </Alert>
      )}
      <ContainerBox flexDirection="column">
        <ContainerBox gap={6}>
          <CommonTransactionStepItem
            icon={<Wallet2Icon fontSize="large" />}
            isCurrentStep
            isLast={false}
            hideWalletLabel
          >
            <ContainerBox gap={6}>
              <ContainerBox flexDirection="column" gap={1}>
                <Typography variant="bodySmallRegular">
                  <FormattedMessage
                    defaultMessage="Withdrawal amount"
                    description="earn.strategy-management.market-withdrawal-modal.withdrawal-amount"
                  />
                </Typography>
                <TokenAmount
                  amount={withdrawAmountOfToken}
                  token={asset}
                  iconSize={6}
                  showSymbol={false}
                  showSubtitle
                />
              </ContainerBox>
              {withdrawFeeAmountOfToken && (
                <ContainerBox flexDirection="column" gap={1}>
                  <Typography variant="bodySmallRegular">
                    <FormattedMessage
                      defaultMessage="Fee"
                      description="earn.strategy-management.market-withdrawal-modal.fee"
                    />
                  </Typography>
                  <TokenAmount
                    amount={withdrawFeeAmountOfToken}
                    token={asset}
                    iconSize={6}
                    showSymbol={false}
                    showSubtitle
                    titlePrefix="-"
                    subtitlePrefix="-"
                  />
                </ContainerBox>
              )}
            </ContainerBox>
          </CommonTransactionStepItem>
        </ContainerBox>
        <ContainerBox gap={6}>
          <CommonTransactionStepItem
            icon={<UnlockIcon fontSize="large" />}
            isCurrentStep={false}
            isLast
            hideWalletLabel
            variant="secondary"
          >
            <ContainerBox flexDirection="column" gap={1}>
              <Typography variant="bodySmallRegular">
                <FormattedMessage
                  defaultMessage="You receive"
                  description="earn.strategy-management.market-withdrawal-modal.you-receive"
                />
              </Typography>
              <TokenAmount
                amount={marketAmountOfToken}
                token={asset}
                iconSize={6}
                showSymbol={false}
                isLoading={isLoading}
              />
            </ContainerBox>
          </CommonTransactionStepItem>
        </ContainerBox>
      </ContainerBox>
    </>
  );
};

interface MarketWithdrawModalProps {
  shouldShowMarketWithdrawModal: boolean;
  setShouldShowMarketWithdrawModal: (shouldShowMarketWithdrawModal: boolean) => void;
  onHandleProceed: (assetWithdrawType: WithdrawType) => void;
  strategy?: DisplayStrategy;
  onWithdraw: (assetWithdrawType: WithdrawType) => void;
}

const MarketWithdrawModal = ({
  onHandleProceed,
  onWithdraw,
  strategy,
  shouldShowMarketWithdrawModal,
  setShouldShowMarketWithdrawModal,
}: MarketWithdrawModalProps) => {
  const activeWallet = useActiveWallet();
  const contractService = useContractService();
  const position = strategy?.userPositions?.find((userPosition) => userPosition.owner === activeWallet?.address);

  const companionAddress = strategy && contractService.getEarnCompanionAddress(strategy.network.chainId);
  const companionHasPermission =
    strategy &&
    position &&
    companionAddress &&
    position.permissions[companionAddress]?.includes(EarnPermission.WITHDRAW);

  const handleProceed = () => {
    setShouldShowMarketWithdrawModal(false);
    onHandleProceed(WithdrawType.MARKET);
  };

  const handleWithdraw = () => {
    setShouldShowMarketWithdrawModal(false);
    onWithdraw(WithdrawType.MARKET);
  };

  return (
    <Modal
      open={shouldShowMarketWithdrawModal}
      closeOnBackdrop
      showCloseIcon
      onClose={() => setShouldShowMarketWithdrawModal(false)}
      title={
        <FormattedMessage
          defaultMessage="Instant Withdrawal"
          description="earn.strategy-management.market-withdrawal-modal.title"
        />
      }
      subtitle={
        <FormattedMessage
          defaultMessage="You're about to make an instant withdrawal from your vault. Fees will be applied to your total withdrawal, allowing you to skip the standard waiting period."
          description="earn.strategy-management.market-withdrawal-modal.subtitle"
        />
      }
      maxWidth="sm"
      actionsAlignment="horizontal"
      actions={[
        {
          onClick: () => setShouldShowMarketWithdrawModal(false),
          label: <FormattedMessage defaultMessage="Cancel" description="cancel" />,
          variant: 'outlined',
        },
        {
          onClick: companionHasPermission ? handleWithdraw : handleProceed,
          label: <FormattedMessage defaultMessage="Withdraw" description="withdraw" />,
          variant: 'contained',
        },
      ]}
    >
      <MarketWithdrawModalContent strategy={strategy} isOpen={shouldShowMarketWithdrawModal} position={position} />
    </Modal>
  );
};

export default MarketWithdrawModal;
