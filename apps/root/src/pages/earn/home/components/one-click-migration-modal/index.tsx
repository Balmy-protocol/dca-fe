import useAvailableDepositTokens, { FarmWithAvailableDepositTokens } from '@hooks/earn/useAvailableDepositTokens';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'ui-library';
import OneClickMigrationOptionsContent from './options-content';
import usePushToHistory from '@hooks/usePushToHistory';
import useTrackEvent from '@hooks/useTrackEvent';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedFarm, setSelectedFarm] = React.useState<FarmWithAvailableDepositTokens | null>(null);
  const pushToHistory = usePushToHistory();
  const trackEvent = useTrackEvent();
  const farms = useAvailableDepositTokens();

  const handleOnGoToStrategy = React.useCallback(
    (farm: FarmWithAvailableDepositTokens) => {
      pushToHistory(`/earn/vaults/${farm.strategies[0].network.chainId}/${farm.strategies[0].id}`);
      trackEvent('Earn One Click Migration - Go to strategy', {
        chainId: farm.strategies[0].network.chainId,
      });
    },
    [pushToHistory, trackEvent]
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
        <FormattedMessage
          defaultMessage="Import Your Investments to Balmy"
          description="earn.one-click-migration-modal.title"
        />
      }
      subtitle={
        <FormattedMessage
          defaultMessage="Here are the Investments we've detected from external platforms. Get exclusive Guardian Protection and performance information now."
          description="earn.one-click-migration-modal.subtitle"
        />
      }
    >
      {step === OneClickMigrationModalStep.SELECT_VAULTS && (
        <OneClickMigrationOptionsContent
          onGoToStrategy={handleOnGoToStrategy}
          onGoToDetails={handleOnGoToDetails}
          farms={farms}
        />
      )}
      {step === OneClickMigrationModalStep.CONFIRM_MIGRATION && <div>Confirm migration</div>}
    </Modal>
  );
};

export default OneClickMigrationModal;
