import React from 'react';
import { DisplayStrategy, FeeType, SetStateCallback } from 'common-types';
import WithdrawAssetInput from '../asset-input';
import EarnWithdrawChangesSummary from '../changes-summary';
import StrategyManagementFees from '../../components/fees';
import { useEarnManagementState } from '@state/earn-management/hooks';
import FormWalletSelector from '@common/components/form-wallet-selector';
import DelayedWithdrawContainer from '../delayed-withdraw-container';
import { useIntl, defineMessage } from 'react-intl';
import { AllWalletsBalances } from '@state/balances/hooks';
import { isSameToken } from '@common/utils/currency';
import useEarnWithdrawActions from '../hooks/useEarnWithdrawActions';
import EarnWithdrawCTAButton from '../cta-button';
import MarketWithdrawModal from '../market-withdraw-modal';
import EarnWithdrawTransactionSteps from '../tx-steps';
import EarnWithdrawTransactionConfirmation from '../tx-confirmation';
import styled from 'styled-components';
import { ContainerBox } from 'ui-library';

const StyledButtonContainer = styled(ContainerBox).attrs({ alignItems: 'center', justifyContent: 'center' })`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

interface WithdrawFormProps {
  strategy?: DisplayStrategy;
  setHeight: (a?: number) => void;
  shouldShowSteps: boolean;
  setShouldShowSteps: SetStateCallback<boolean>;
  shouldShowConfirmation: boolean;
  setShouldShowConfirmation: SetStateCallback<boolean>;
}

const WithdrawForm = ({
  strategy,
  setHeight,
  shouldShowSteps,
  setShouldShowSteps,
  shouldShowConfirmation,
  setShouldShowConfirmation,
}: WithdrawFormProps) => {
  const { withdrawAmount } = useEarnManagementState();
  const intl = useIntl();

  const {
    onWithdraw,
    currentTransaction,
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
    setShouldShowSteps,
    setShouldShowConfirmation,
  });

  const recapDataProps = React.useMemo(() => ({ strategy, withdraw: tokensToWithdraw }), [strategy, tokensToWithdraw]);

  const usdBalances = React.useMemo(() => {
    return strategy?.userPositions?.reduce<AllWalletsBalances>((acc, curr) => {
      const assetBalance = curr.balances.find((balance) => isSameToken(balance.token, curr.strategy.asset));
      if (!assetBalance) return acc;

      if (!acc[curr.owner]) {
        // eslint-disable-next-line no-param-reassign
        acc[curr.owner] = 0;
      }
      // eslint-disable-next-line no-param-reassign
      acc[curr.owner] += Number(assetBalance.amount.amountInUSD);
      return acc;
    }, {});
  }, [strategy?.userPositions]);

  return (
    <>
      <MarketWithdrawModal
        onHandleProceed={handleMultiSteps}
        onWithdraw={onWithdraw}
        shouldShowMarketWithdrawModal={shouldShowMarketWithdrawModal}
        setShouldShowMarketWithdrawModal={setShouldShowMarketWithdrawModal}
        strategy={strategy}
      />
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
      {!shouldShowConfirmation && !shouldShowSteps && (
        <>
          <DelayedWithdrawContainer strategy={strategy} />
          <FormWalletSelector
            chipDescription={intl.formatMessage(
              defineMessage({
                id: 'earn.strategy-management.withdraw.form-wallet-selector.chip-description',
                defaultMessage: 'Available:',
              })
            )}
            overrideUsdBalances={usdBalances}
          />
          <WithdrawAssetInput strategy={strategy} />
          <EarnWithdrawChangesSummary strategy={strategy} />
          <StrategyManagementFees strategy={strategy} feeType={FeeType.WITHDRAW} assetAmount={withdrawAmount} />
          <StyledButtonContainer>
            <EarnWithdrawCTAButton
              onWithdraw={onWithdraw}
              onShowMarketWithdrawModal={() => setShouldShowMarketWithdrawModal(true)}
              onHandleProceed={handleMultiSteps}
              strategy={strategy}
            />
          </StyledButtonContainer>
        </>
      )}
    </>
  );
};

export default WithdrawForm;
