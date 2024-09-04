import React from 'react';
import EarnWithdrawCTAButton from '../cta-button';
import { DisplayStrategy, TransactionApplicationIdentifier } from 'common-types';
import styled from 'styled-components';
import { ContainerBox } from 'ui-library';
import EarnWithdrawTransactionConfirmation from '../tx-confirmation';
import useEarnWithdrawActions from '../hooks/useEarnWithdrawActions';

const StyledButtonContainer = styled(ContainerBox).attrs({ alignItems: 'center', justifyContent: 'center' })`
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

interface EarnWithdrawTransactionManagerProps {
  strategy?: DisplayStrategy;
  setHeight: (a?: number) => void;
}

const EarnWithdrawTransactionManager = ({ strategy, setHeight }: EarnWithdrawTransactionManagerProps) => {
  const { onWithdraw, currentTransaction, setShouldShowConfirmation, shouldShowConfirmation } = useEarnWithdrawActions({
    strategy,
  });

  return (
    <>
      <StyledButtonContainer>
        <EarnWithdrawCTAButton onHandleWithdraw={onWithdraw} strategy={strategy} />
      </StyledButtonContainer>
      <EarnWithdrawTransactionConfirmation
        applicationIdentifier={TransactionApplicationIdentifier.EARN_WITHDRAW}
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
