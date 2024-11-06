import React from 'react';
import { defineMessage, FormattedMessage, IntlShape, MessageDescriptor, useIntl } from 'react-intl';
import CommonTransactionStepItem from '@common/components/transaction-steps/common-transaction-step';
import useActiveWallet from '@hooks/useActiveWallet';
import useContractService from '@hooks/useContractService';
import { AmountsOfToken, DisplayStrategy, EarnPermission, EarnPosition, Token, WithdrawType } from 'common-types';
import { ContainerBox, Modal, Wallet2Icon, UnlockIcon, Typography, colors, Skeleton } from 'ui-library';
import TokenIcon from '@common/components/token-icon';
import { formatCurrencyAmount, formatUsdAmount } from '@common/utils/currency';
import { useEarnManagementState } from '@state/earn-management/hooks';
import { isUndefined } from 'lodash';
import useEstimateMarketWithdraw from '../hooks/useEstimateMarketWithdraw';

const WithdrawAmountItem = ({
  title,
  amount,
  token,
  intl,
  isLoading,
  isNegative,
}: {
  title: MessageDescriptor;
  amount?: AmountsOfToken;
  token?: Token;
  intl: IntlShape;
  isLoading?: boolean;
  isNegative?: boolean;
}) => (
  <ContainerBox flexDirection="column" gap={1}>
    <Typography variant="bodySmallRegular">{intl.formatMessage(title)}</Typography>
    <ContainerBox gap={2} alignItems="center">
      <TokenIcon token={token} size={6} />
      <Typography variant="bodyBold" color={({ palette }) => colors[palette.mode].typography.typo2} lineHeight={1}>
        {isLoading ? (
          <Skeleton variant="text" sx={{ width: '10ch' }} />
        ) : token && amount ? (
          `${isNegative ? '-' : ''}${formatCurrencyAmount({
            amount: amount.amount,
            token,
            intl,
          })}`
        ) : (
          '-'
        )}
      </Typography>
    </ContainerBox>
    <Typography variant="labelLarge" color={({ palette }) => colors[palette.mode].typography.typo3}>
      {isLoading ? (
        <Skeleton variant="text" sx={{ width: '10ch' }} />
      ) : !isUndefined(amount?.amountInUSD) ? (
        `(${isNegative ? '-' : ''}$${formatUsdAmount({
          amount: amount.amountInUSD,
          intl,
        })})`
      ) : (
        '-'
      )}
    </Typography>
  </ContainerBox>
);

interface MarketWithdrawModalContentProps {
  strategy?: DisplayStrategy;
  isOpen: boolean;
  position?: EarnPosition;
}

const MarketWithdrawModalContent = ({ strategy, isOpen, position }: MarketWithdrawModalContentProps) => {
  const intl = useIntl();
  const { asset } = useEarnManagementState();

  const { isLoading, withdrawAmountOfToken, withdrawFeeAmountOfToken, estimatedMarketAmount } =
    useEstimateMarketWithdraw({
      strategy,
      shouldRefetch: isOpen,
      position,
    });

  return (
    <ContainerBox flexDirection="column">
      <ContainerBox gap={6}>
        <CommonTransactionStepItem icon={<Wallet2Icon fontSize="large" />} isCurrentStep isLast={false} hideWalletLabel>
          <ContainerBox gap={6}>
            <WithdrawAmountItem
              title={defineMessage({
                defaultMessage: 'Withdrawal amount',
                description: 'earn.strategy-management.market-withdrawal-modal.withdrawal-amount',
              })}
              amount={withdrawAmountOfToken}
              token={asset}
              intl={intl}
            />
            {withdrawFeeAmountOfToken && (
              <WithdrawAmountItem
                title={defineMessage({
                  defaultMessage: 'Fee',
                  description: 'earn.strategy-management.market-withdrawal-modal.fee',
                })}
                amount={withdrawFeeAmountOfToken}
                token={asset}
                intl={intl}
              />
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
          <WithdrawAmountItem
            title={defineMessage({
              defaultMessage: 'You receive',
              description: 'earn.strategy-management.market-withdrawal-modal.you-receive',
            })}
            amount={estimatedMarketAmount}
            token={asset}
            intl={intl}
            isLoading={isLoading}
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
      <MarketWithdrawModalContent strategy={strategy} isOpen={shouldShowMarketWithdrawModal} position={position} />
    </Modal>
  );
};

export default MarketWithdrawModal;
