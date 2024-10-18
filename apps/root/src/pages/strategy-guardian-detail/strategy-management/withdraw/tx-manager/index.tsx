import React from 'react';
import EarnWithdrawCTAButton from '../cta-button';
import { DisplayStrategy } from 'common-types';
import styled from 'styled-components';
import { ContainerBox } from 'ui-library';
import EarnWithdrawTransactionConfirmation from '../tx-confirmation';
import useEarnWithdrawActions from '../hooks/useEarnWithdrawActions';
import EarnWithdrawTransactionSteps from '../tx-steps';
import MarketWithdrawModal from '../market-withdraw-modal';

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

  const recapDataProps = React.useMemo(() => ({ strategy, withdraw: tokensToWithdraw }), [strategy, tokensToWithdraw]);

  return (
    <>
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
