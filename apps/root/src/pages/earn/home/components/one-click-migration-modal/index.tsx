import React from 'react';
import { FormattedMessage } from 'react-intl';
import { ContainerBox, Modal } from 'ui-library';
import OneClickMigrationOptionsContent from './options-content';
import usePushToHistory from '@hooks/usePushToHistory';
import useAnalytics from '@hooks/useAnalytics';
import OneClickMigrationConfirmMigrationContent from './confirm-migration';
import { Strategy, Token } from 'common-types';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import { FarmWithAvailableDepositTokens, FarmsWithAvailableDepositTokens } from '@hooks/earn/useAvailableDepositTokens';
import NoInvestmentsFound from './no-investments-found';

interface OneClickMigrationModalProps {
  open: boolean;
  onClose: () => void;
  farmsWithDepositableTokens: FarmsWithAvailableDepositTokens;
  updateFarmTokensBalances?: () => Promise<void>;
}

enum OneClickMigrationModalStep {
  SELECT_VAULTS = 'select-vaults',
  CONFIRM_MIGRATION = 'confirm-migration',
}

const OneClickMigrationModal = ({
  open,
  onClose,
  farmsWithDepositableTokens,
  updateFarmTokensBalances,
}: OneClickMigrationModalProps) => {
  const [step, setStep] = React.useState<OneClickMigrationModalStep>(OneClickMigrationModalStep.SELECT_VAULTS);
  const [selectedFarm, setSelectedFarm] = React.useState<FarmWithAvailableDepositTokens | null>(null);
  const pushToHistory = usePushToHistory();
  const { trackEvent } = useAnalytics();
  const [isFetchingDepositTokenBalances, setIsFetchingDepositTokenBalances] = React.useState(false);

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

  React.useEffect(() => {
    const fetchDepositTokens = async () => {
      if (open && updateFarmTokensBalances) {
        setIsFetchingDepositTokenBalances(true);
        await updateFarmTokensBalances();
        setIsFetchingDepositTokenBalances(false);
      }
    };
    void fetchDepositTokens();
  }, [open]);

  const handleOnGoToDetails = (farm: FarmWithAvailableDepositTokens) => {
    setStep(OneClickMigrationModalStep.CONFIRM_MIGRATION);
    setSelectedFarm(farm);
  };

  const conditionalModalProps = React.useMemo(() => {
    if (isFetchingDepositTokenBalances) {
      return {
        children: (
          <ContainerBox style={{ minHeight: '300px' }}>
            <CenteredLoadingIndicator />
          </ContainerBox>
        ),
      };
    }

    if (step === OneClickMigrationModalStep.CONFIRM_MIGRATION) {
      return {
        children: (
          <OneClickMigrationConfirmMigrationContent
            onGoToStrategy={handleOnGoToStrategy}
            onGoBack={() => setStep(OneClickMigrationModalStep.SELECT_VAULTS)}
            selectedFarm={selectedFarm}
          />
        ),
      };
    }

    return {
      title: (
        <FormattedMessage
          defaultMessage="Import Your Investments to Balmy"
          description="earn.one-click-migration-modal.title"
        />
      ),
      subtitle:
        farmsWithDepositableTokens.length > 0 ? (
          <FormattedMessage
            defaultMessage="Here are the Investments we've detected from external platforms. Get exclusive Guardian Protection and performance information now."
            description="earn.one-click-migration-modal.subtitle"
          />
        ) : (
          <FormattedMessage
            defaultMessage="If you have investments in compatible strategies outside of Balmy, <b>connect your wallet, and we'll automatically detect them</b>. From there, you can migrate them to Balmy Earn."
            description="earn.one-click-migration-modal.subtitle"
            values={{
              b: (chunks: React.ReactNode) => <b>{chunks}</b>,
            }}
          />
        ),
      children:
        farmsWithDepositableTokens.length > 0 ? (
          <OneClickMigrationOptionsContent onGoToDetails={handleOnGoToDetails} farms={farmsWithDepositableTokens} />
        ) : (
          <NoInvestmentsFound />
        ),
    };
  }, [isFetchingDepositTokenBalances, step, selectedFarm, handleOnGoToStrategy, handleOnGoToDetails, handleClose]);

  return <Modal open={open} onClose={handleClose} showCloseIcon maxWidth="sm" {...conditionalModalProps} />;
};

export default OneClickMigrationModal;
