import useActiveWallet from '@hooks/useActiveWallet';
import useContractService from '@hooks/useContractService';
import { DisplayStrategy, EarnPermission, WithdrawType } from 'common-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'ui-library';

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
    ></Modal>
  );
};

export default MarketWithdrawModal;
