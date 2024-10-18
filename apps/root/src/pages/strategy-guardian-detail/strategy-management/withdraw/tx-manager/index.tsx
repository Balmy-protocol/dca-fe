import React from 'react';
import EarnWithdrawCTAButton from '../cta-button';
import { DisplayStrategy } from 'common-types';
import styled from 'styled-components';
import { Button, ContainerBox, Modal } from 'ui-library';
import EarnWithdrawTransactionConfirmation from '../tx-confirmation';
import useEarnWithdrawActions from '../hooks/useEarnWithdrawActions';
import EarnWithdrawTransactionSteps from '../tx-steps';
import { FormattedMessage } from 'react-intl';

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
    onShowMarketWithdrawModal,
    onMarketWithdrawProceed,
    onMarketWithdrawCancel,
  } = useEarnWithdrawActions({
    strategy,
  });

  const recapDataProps = React.useMemo(() => ({ strategy, withdraw: tokensToWithdraw }), [strategy, tokensToWithdraw]);

  return (
    <>
      <Modal
        open={shouldShowMarketWithdrawModal}
        closeOnBackdrop
        showCloseIcon
        onClose={onMarketWithdrawCancel}
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
      >
        <ContainerBox gap={4}>
          <Button variant="outlined" size="large" onClick={onMarketWithdrawCancel} fullWidth>
            <FormattedMessage defaultMessage="Cancel" description="cancel" />
          </Button>
          <Button variant="contained" size="large" onClick={onMarketWithdrawProceed} fullWidth>
            <FormattedMessage defaultMessage="Withdraw" description="withdraw" />
          </Button>
        </ContainerBox>
      </Modal>
      <StyledButtonContainer>
        <EarnWithdrawCTAButton
          onWithdraw={onWithdraw}
          onShowMarketWithdrawModal={onShowMarketWithdrawModal}
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
