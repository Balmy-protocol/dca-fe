import React from 'react';
import EarnDepositCTAButton from '../cta-button';
import { AmountsOfToken, DisplayStrategy } from 'common-types';
import EarnDepositTransactionConfirmation from '../tx-confirmation';
import useEarnDepositActions from '../hooks/useEarnDepositActions';
import styled from 'styled-components';
import { ContainerBox } from 'ui-library';
import EarnTransactionSteps from '../tx-steps';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '@state/hooks';
import { setOneClickMigrationSettings, setTriggerSteps } from '@state/earn-management/actions';
import useToken from '@hooks/useToken';
import { isNil } from 'lodash';

const StyledButtonContainer = styled(ContainerBox).attrs(() => ({ alignItems: 'center', justifyContent: 'center' }))`
  margin-top: ${({ theme }) => theme.spacing(2)};
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
    isIncrease,
  } = useEarnDepositActions({ strategy });
  const hasTriggeredSteps = React.useRef(false);
  const [params] = useSearchParams();
  const dispatch = useAppDispatch();
  const paramAssetToDeposit = useToken({
    chainId: strategy?.network.chainId,
    tokenAddress: params.get('assetToDeposit') ?? undefined,
    checkForSymbol: true,
    filterForDca: false,
    // Allow farm tokens that are not in the curated token list
    curateList: false,
  });
  const paramUnderlyingAsset = useToken({
    chainId: strategy?.network.chainId,
    tokenAddress: params.get('underlyingAsset') ?? undefined,
    checkForSymbol: true,
    filterForDca: false,
  });

  const recapDataProps = React.useMemo(() => ({ strategy }), [strategy]);

  React.useEffect(() => {
    const depositAmount = params.get('assetToDepositAmount');
    const paramUnderlyingAmount = params.get('underlyingAmount');
    if (
      params.get('triggerSteps') &&
      paramAssetToDeposit &&
      !!strategy &&
      !hasTriggeredSteps.current &&
      !isNil(depositAmount) &&
      !isNil(paramUnderlyingAmount) &&
      !isNil(paramUnderlyingAsset)
    ) {
      hasTriggeredSteps.current = true;
      dispatch(
        setOneClickMigrationSettings({
          paramAssetToDeposit,
          paramUnderlyingAsset,
          paramUnderlyingAmount,
          depositAmount,
        })
      );
      dispatch(setTriggerSteps(true));
    }
  }, [strategy, paramAssetToDeposit, paramUnderlyingAsset, handleMultiSteps]);

  return (
    <>
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
