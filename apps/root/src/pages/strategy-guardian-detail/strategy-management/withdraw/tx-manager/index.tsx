import React from 'react';
import EarnWithdrawCTAButton from '../cta-button';
import { DisplayStrategy, FeeType } from 'common-types';
import styled from 'styled-components';
import { ContainerBox } from 'ui-library';
import EarnWithdrawTransactionConfirmation from '../tx-confirmation';
import useEarnWithdrawActions from '../hooks/useEarnWithdrawActions';
import EarnWithdrawTransactionSteps from '../tx-steps';
import MarketWithdrawModal from '../market-withdraw-modal';
import { useEarnManagementState } from '@state/earn-management/hooks';
import StrategyManagementFees from '../../components/fees';
import WithdrawAssetInput from '../asset-input';
import EarnWithdrawChangesSummary from '../changes-summary';
import WithdrawRewardsCard from '../withdraw-rewards-card';

const StyledButtonContainer = styled(ContainerBox).attrs({ alignItems: 'center', justifyContent: 'center' })`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

interface EarnWithdrawTransactionManagerProps {
  strategy?: DisplayStrategy;
  setHeight: (a?: number) => void;
}

const EarnWithdrawTransactionManager = ({ strategy, setHeight }: EarnWithdrawTransactionManagerProps) => {
  const {
    onWithdraw,
    currentTransaction,
    setShouldShowConfirmation,
    shouldShowConfirmation,
    shouldShowSteps,
    transactionSteps,
    transactionOnAction,
    handleBackTransactionSteps,
    handleMultiSteps,
    tokensToWithdraw,
    applicationIdentifier,
    shouldShowMarketWithdrawModal,
    setShouldShowMarketWithdrawModal,
  } = useEarnWithdrawActions({
    strategy,
  });

  const { withdrawAmount } = useEarnManagementState();

  const recapDataProps = React.useMemo(() => ({ strategy, withdraw: tokensToWithdraw }), [strategy, tokensToWithdraw]);

  return (
    <>
      <WithdrawRewardsCard strategy={strategy} onWithdraw={onWithdraw} onHandleProceed={handleMultiSteps} />
      <WithdrawAssetInput strategy={strategy} />
      <EarnWithdrawChangesSummary strategy={strategy} />
      <StrategyManagementFees strategy={strategy} feeType={FeeType.WITHDRAW} assetAmount={withdrawAmount} />
      <MarketWithdrawModal
        onHandleProceed={handleMultiSteps}
        onWithdraw={onWithdraw}
        shouldShowMarketWithdrawModal={shouldShowMarketWithdrawModal}
        setShouldShowMarketWithdrawModal={setShouldShowMarketWithdrawModal}
        strategy={strategy}
      />
      <StyledButtonContainer>
        <EarnWithdrawCTAButton
          onWithdraw={onWithdraw}
          onShowMarketWithdrawModal={() => setShouldShowMarketWithdrawModal(true)}
          onHandleProceed={handleMultiSteps}
          strategy={strategy}
        />
      </StyledButtonContainer>
      <EarnWithdrawTransactionSteps
        shouldShow={shouldShowSteps}
        handleClose={handleBackTransactionSteps}
        transactions={transactionSteps}
        onAction={transactionOnAction.onAction}
        applicationIdentifier={applicationIdentifier}
        setShouldShowFirstStep={() => {}}
        setHeight={setHeight}
        recapDataProps={recapDataProps}
      />
      <EarnWithdrawTransactionConfirmation
        applicationIdentifier={applicationIdentifier}
        strategy={strategy}
        currentTransaction={currentTransaction}
        shouldShowConfirmation={shouldShowConfirmation}
        setShouldShowConfirmation={setShouldShowConfirmation}
        setHeight={setHeight}
      />
    </>
  );
};

export default EarnWithdrawTransactionManager;
