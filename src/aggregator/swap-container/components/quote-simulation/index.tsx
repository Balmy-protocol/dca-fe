import React from 'react';
import styled from 'styled-components';
import { QuoteTx } from '@mean-finance/sdk/dist/services/quotes/types';
import useSimulateTransaction from 'hooks/useSimulateTransaction';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import Typography from '@mui/material/Typography';
import BlowfishLogo from 'assets/logo/powered_by_blowfish';
import { BLOWFISH_ENABLED_CHAINS } from 'config';
import { FormattedMessage } from 'react-intl';
import TransactionSimulation from 'common/transaction-simulation';

const StyledTransactionSimulationContainer = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  background: rgba(216, 216, 216, 0.1);
  box-shadow: inset 1px 1px 0px rgba(0, 0, 0, 0.4);
  border-radius: 4px;
  gap: 16px;
`;

const StyledSimulation = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledBlowfishContainer = styled.div`
  display: flex;
  align-self: center;
`;

interface QuoteSimulationProps {
  tx?: QuoteTx;
  cantFund: boolean | null;
  isApproved: boolean;
  isLoadingRoute: boolean;
}

const QuoteSimulation = ({ tx, cantFund, isApproved, isLoadingRoute }: QuoteSimulationProps) => {
  const currentNetwork = useCurrentNetwork();
  const [transactionSimulation, isLoadingTransactionSimulation, transactionSimulationError] = useSimulateTransaction(
    tx,
    currentNetwork.chainId,
    cantFund || !isApproved
  );

  if (!BLOWFISH_ENABLED_CHAINS.includes(currentNetwork.chainId) || cantFund || !isApproved || !tx) {
    return null;
  }

  const isLoading = isLoadingTransactionSimulation || isLoadingRoute;
  return (
    <StyledTransactionSimulationContainer>
      {(isLoading || isLoadingRoute) && <CenteredLoadingIndicator />}
      {!isLoading && (transactionSimulationError || transactionSimulation?.simulationResults.error) && (
        <>
          <Typography variant="h6">
            <FormattedMessage description="blowfishSimulationTitle" defaultMessage="Transaction simulation" />
          </Typography>
          <Typography variant="body1">
            <FormattedMessage description="blowfishSimulationError" defaultMessage="Transaction will fail" />
          </Typography>
        </>
      )}
      {!isLoading && transactionSimulation && !transactionSimulation.simulationResults.error && (
        <StyledSimulation>
          <Typography variant="h6">
            <FormattedMessage description="blowfishSimulationTitle" defaultMessage="Transaction simulation" />
          </Typography>
          <TransactionSimulation items={transactionSimulation} />
        </StyledSimulation>
      )}
      <StyledBlowfishContainer>
        <BlowfishLogo />
      </StyledBlowfishContainer>
    </StyledTransactionSimulationContainer>
  );
};

export default QuoteSimulation;
