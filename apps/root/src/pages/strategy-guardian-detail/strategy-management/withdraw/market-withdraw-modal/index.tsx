import React from 'react';
import { defineMessage, FormattedMessage, IntlShape, MessageDescriptor, useIntl } from 'react-intl';
import CommonTransactionStepItem from '@common/components/transaction-steps/common-transaction-step';
import useActiveWallet from '@hooks/useActiveWallet';
import useContractService from '@hooks/useContractService';
import { DisplayStrategy, EarnPermission, Token, WithdrawType } from 'common-types';
import { ContainerBox, Modal, Wallet2Icon, UnlockIcon, Typography, colors } from 'ui-library';
import TokenIcon from '@common/components/token-icon';
import { formatCurrencyAmount, toToken } from '@common/utils/currency';

const WithdrawAmountItem = ({
  title,
  amount,
  token,
  intl,
}: {
  title: MessageDescriptor;
  amount: bigint;
  token: Token;
  intl: IntlShape;
}) => (
  <ContainerBox flexDirection="column" gap={1}>
    <Typography variant="bodySmallRegular">{intl.formatMessage(title)}</Typography>
    <ContainerBox gap={2} alignItems="center">
      <TokenIcon token={token} size={6} />
      <Typography variant="bodyBold" color={({ palette }) => colors[palette.mode].typography.typo2}>
        {formatCurrencyAmount({
          amount,
          token,
          intl,
        })}
      </Typography>
    </ContainerBox>
    <Typography variant="labelLarge" color={({ palette }) => colors[palette.mode].typography.typo3}>
      {`($${formatCurrencyAmount({
        amount,
        token,
        intl,
      })})`}
    </Typography>
  </ContainerBox>
);

const MarketWithdrawModalContent = ({
  // strategy,
  isOpen,
}: {
  strategy?: DisplayStrategy;
  isOpen: boolean;
}) => {
  const intl = useIntl();

  // const [data, setData] = React.useState(null);
  // const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      // setLoading(true);
      // Make your API call here
    }
  }, [isOpen]);
  return (
    <ContainerBox flexDirection="column">
      <ContainerBox gap={6}>
        <CommonTransactionStepItem icon={<Wallet2Icon />} isCurrentStep isLast={false} hideWalletLabel>
          <ContainerBox gap={6}>
            <WithdrawAmountItem
              title={defineMessage({
                defaultMessage: 'Withdrawal amount',
                description: 'earn.strategy-management.market-withdrawal-modal.withdrawal-amount',
              })}
              amount={0n}
              token={toToken({})}
              intl={intl}
            />
            <WithdrawAmountItem
              title={defineMessage({
                defaultMessage: 'Withdrawal amount',
                description: 'earn.strategy-management.market-withdrawal-modal.withdrawal-amount',
              })}
              amount={0n}
              token={toToken({})}
              intl={intl}
            />
          </ContainerBox>
        </CommonTransactionStepItem>
      </ContainerBox>
      <ContainerBox gap={6}>
        <CommonTransactionStepItem
          icon={<UnlockIcon />}
          isCurrentStep={false}
          isLast
          hideWalletLabel
          variant="secondary"
        >
          <WithdrawAmountItem
            title={defineMessage({
              defaultMessage: 'Withdrawal amount',
              description: 'earn.strategy-management.market-withdrawal-modal.withdrawal-amount',
            })}
            amount={0n}
            token={toToken({})}
            intl={intl}
          />
        </CommonTransactionStepItem>
      </ContainerBox>
    </ContainerBox>
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

  const companionHasPermission =
    strategy &&
    position &&
    position.permissions[contractService.getEarnCompanionAddress(strategy.network.chainId)]?.includes(
      EarnPermission.WITHDRAW
    );

  const handleProceed = () => {
    setShouldShowMarketWithdrawModal(false);
    onHandleProceed(WithdrawType.MARKET);
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
          onClick: companionHasPermission ? () => onWithdraw(WithdrawType.MARKET) : handleProceed,
          label: <FormattedMessage defaultMessage="Withdraw" description="withdraw" />,
          variant: 'contained',
        },
      ]}
    >
      <MarketWithdrawModalContent strategy={strategy} isOpen={shouldShowMarketWithdrawModal} />
    </Modal>
  );
};

export default MarketWithdrawModal;
