import useAvailableDepositTokens, { FarmWithAvailableDepositTokens } from '@hooks/earn/useAvailableDepositTokens';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'ui-library';
import OneClickMigrationOptionsContent from './options-content';
import usePushToHistory from '@hooks/usePushToHistory';
import useTrackEvent from '@hooks/useTrackEvent';
import OneClickMigrationConfirmMigrationContent from './confirm-migration';
import { Strategy, Token } from 'common-types';

interface OneClickMigrationModalProps {
  open: boolean;
  onClose: () => void;
}

enum OneClickMigrationModalStep {
  SELECT_VAULTS = 'select-vaults',
  CONFIRM_MIGRATION = 'confirm-migration',
}

const OneClickMigrationModal = ({ open, onClose }: OneClickMigrationModalProps) => {
  const [step, setStep] = React.useState<OneClickMigrationModalStep>(OneClickMigrationModalStep.SELECT_VAULTS);
  const [selectedFarm, setSelectedFarm] = React.useState<FarmWithAvailableDepositTokens | null>(null);
  const pushToHistory = usePushToHistory();
  const trackEvent = useTrackEvent();
  const farms = useAvailableDepositTokens();

  const handleClose = React.useCallback(() => {
    onClose();
    setStep(OneClickMigrationModalStep.SELECT_VAULTS);
  }, [onClose]);
  const handleOnGoToStrategy = React.useCallback(
    (strategy: Strategy, token: Token, depositAmount: string, underlyingAmount: string, underlyingToken: Token) => {
      handleClose();
      // Give a little time for the modal to close
      setTimeout(() => {
        pushToHistory(
          `/earn/vaults/${strategy.network.chainId}/${strategy.id}?triggerSteps=true&assetToDeposit=${token.address}&assetToDepositAmount=${depositAmount}&underlyingAmount=${underlyingAmount}&underlyingAsset=${underlyingToken.address}`
        );
        trackEvent('Earn One Click Migration - Go to strategy', {
          chainId: strategy.network.chainId,
        });
      }, 10);
    },
    [pushToHistory, trackEvent, handleClose]
  );

  const handleOnGoToDetails = (farm: FarmWithAvailableDepositTokens) => {
    setStep(OneClickMigrationModalStep.CONFIRM_MIGRATION);
    setSelectedFarm(farm);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      showCloseIcon
      maxWidth="sm"
      title={
        step === OneClickMigrationModalStep.SELECT_VAULTS ? (
          <FormattedMessage
            defaultMessage="Import Your Investments to Balmy"
            description="earn.one-click-migration-modal.title"
          />
        ) : undefined
      }
      subtitle={
        step === OneClickMigrationModalStep.SELECT_VAULTS ? (
          <FormattedMessage
            defaultMessage="Here are the Investments we've detected from external platforms. Get exclusive Guardian Protection and performance information now."
            description="earn.one-click-migration-modal.subtitle"
          />
        ) : undefined
      }
    >
      {step === OneClickMigrationModalStep.SELECT_VAULTS && (
        <OneClickMigrationOptionsContent onGoToDetails={handleOnGoToDetails} farms={farms} />
      )}
      {step === OneClickMigrationModalStep.CONFIRM_MIGRATION && (
        <OneClickMigrationConfirmMigrationContent
          selectedFarm={selectedFarm}
          onGoBack={() => setStep(OneClickMigrationModalStep.SELECT_VAULTS)}
          onGoToStrategy={handleOnGoToStrategy}
        />
      )}
    </Modal>
  );
};

export default OneClickMigrationModal;
