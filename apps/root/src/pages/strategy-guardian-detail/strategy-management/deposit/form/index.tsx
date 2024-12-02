import useActiveWallet from '@hooks/useActiveWallet';
import { useTokenBalance } from '@state/balances/hooks';
import { DisplayStrategy, FeeType, SetStateCallback } from 'common-types';
import React from 'react';
import EarnAssetInput from '../asset-input';
import FormWalletSelector from '@common/components/form-wallet-selector';
import { ContainerBox } from 'ui-library';
import StrategyManagementFees from '../../components/fees';
import { useEarnManagementState } from '@state/earn-management/hooks';
import useEarnDepositActions from '../hooks/useEarnDepositActions';
import styled from 'styled-components';
import EarnDepositCTAButton from '../cta-button';
import EarnTransactionSteps from '../tx-steps';
import EarnDepositTransactionConfirmation from '../tx-confirmation';

const StyledButtonContainer = styled(ContainerBox).attrs(() => ({ alignItems: 'center', justifyContent: 'center' }))`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

interface DepositFormProps {
  strategy?: DisplayStrategy;
  setHeight: (a?: number) => void;
  shouldShowConfirmation: boolean;
  setShouldShowConfirmation: SetStateCallback<boolean>;
  shouldShowSteps: boolean;
  setShouldShowSteps: SetStateCallback<boolean>;
}

const DepositForm = ({
  strategy,
  setHeight,
  shouldShowConfirmation,
  setShouldShowConfirmation,
  shouldShowSteps,
  setShouldShowSteps,
}: DepositFormProps) => {
  const activeWallet = useActiveWallet();
  const { depositAmount } = useEarnManagementState();
  const { balance } = useTokenBalance({
    token: strategy?.asset || null,
    walletAddress: activeWallet?.address,
    shouldAutoFetch: true,
  });

  const {
    currentTransaction,
    transactionSteps,
    transactionOnAction,
    handleBackTransactionSteps,
    onDeposit,
    handleMultiSteps,
    transactionType,
    requiresCompanionSignature,
    isIncrease,
  } = useEarnDepositActions({ strategy, setShouldShowSteps, setShouldShowConfirmation });

  const recapDataProps = React.useMemo(() => ({ strategy }), [strategy]);

  return (
    <>
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
      {!shouldShowSteps && !shouldShowConfirmation && (
        <>
          <ContainerBox flexDirection="column" gap={3}>
            <FormWalletSelector
              filter={strategy ? { chainId: strategy.network.chainId, tokens: [strategy.asset] } : undefined}
            />
            <EarnAssetInput strategy={strategy} balance={balance} />
          </ContainerBox>
          <StrategyManagementFees strategy={strategy} feeType={FeeType.DEPOSIT} assetAmount={depositAmount} />
          <StyledButtonContainer>
            <EarnDepositCTAButton
              onHandleDeposit={onDeposit}
              onHandleProceed={handleMultiSteps}
              balance={balance}
              strategy={strategy}
              requiresCompanionSignature={requiresCompanionSignature}
              isIncrease={isIncrease}
            />
          </StyledButtonContainer>
        </>
      )}
    </>
  );
};

export default DepositForm;
