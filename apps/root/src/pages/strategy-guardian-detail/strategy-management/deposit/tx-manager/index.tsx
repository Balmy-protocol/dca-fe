import React from 'react';
import EarnDepositCTAButton from '../cta-button';
import { AmountsOfToken, DisplayStrategy } from 'common-types';
import EarnDepositTransactionConfirmation from '../tx-confirmation';
import useEarnDepositActions from '../hooks/useEarnDepositActions';
import styled from 'styled-components';
import { ContainerBox } from 'ui-library';
import EarnTransactionSteps from '../tx-steps';

const StyledButtonContainer = styled(ContainerBox).attrs(() => ({ alignItems: 'center', justifyContent: 'center' }))`
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

interface EarnDepositTransactionManagerProps {
  balance?: AmountsOfToken;
  strategy?: DisplayStrategy;
  setHeight: (a?: number) => void;
}

const EarnDepositTransactionManager = ({ balance, strategy, setHeight }: EarnDepositTransactionManagerProps) => {
  const {
    currentTransaction,
    shouldShowSteps,
    shouldShowConfirmation,
    transactionSteps,
    transactionOnAction,
    handleBackTransactionSteps,
    onDeposit,
    handleMultiSteps,
    setShouldShowConfirmation,
    transactionType,
    requiresCompanionSignature,
  } = useEarnDepositActions({ strategy });

  const recapDataProps = React.useMemo(() => ({ strategy }), [strategy]);

  return (
    <>
      <StyledButtonContainer>
        <EarnDepositCTAButton
          onHandleDeposit={onDeposit}
          onHandleProceed={handleMultiSteps}
          balance={balance}
          strategy={strategy}
          requiresCompanionSignature={requiresCompanionSignature}
        />
      </StyledButtonContainer>
      <EarnTransactionSteps
        shouldShow={shouldShowSteps}
        handleClose={handleBackTransactionSteps}
        transactions={transactionSteps}
        onAction={transactionOnAction.onAction}
        onActionConfirmed={transactionOnAction.onActionConfirmed}
        applicationIdentifier={transactionType}
        setShouldShowFirstStep={() => {}}
        setHeight={setHeight}
        recapDataProps={recapDataProps}
      />
      <EarnDepositTransactionConfirmation
        balance={balance}
        strategy={strategy}
        currentTransaction={currentTransaction}
        shouldShowConfirmation={shouldShowConfirmation}
        setShouldShowConfirmation={setShouldShowConfirmation}
        setHeight={setHeight}
        applicationIdentifier={transactionType}
      />
    </>
  );
};

export default EarnDepositTransactionManager;
