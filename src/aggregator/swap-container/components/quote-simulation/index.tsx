import React from 'react';
import styled from 'styled-components';
import { QuoteTx } from '@mean-finance/sdk/dist/services/quotes/types';
import useSimulateTransaction from 'hooks/useSimulateTransaction';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import Typography from '@mui/material/Typography';
import BlowfishLogo from 'assets/logo/powered_by_blowfish';
import { BLOWFISH_ENABLED_CHAINS } from 'config';
import { FormattedMessage } from 'react-intl';
import TransactionSimulation from 'common/transaction-simulation';
import useSelectedNetwork from 'hooks/useSelectedNetwork';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import TokenIcon from 'common/token-icon';
import { emptyTokenWithAddress } from 'utils/currency';

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
  const currentNetwork = useSelectedNetwork();
  const actualCurrentNetwork = useCurrentNetwork();
  const [transactionSimulation, isLoadingTransactionSimulation, transactionSimulationError] = useSimulateTransaction(
    tx,
    currentNetwork.chainId,
    cantFund || !isApproved || currentNetwork.chainId !== actualCurrentNetwork.chainId
  );

  if (cantFund || !isApproved || !tx || currentNetwork.chainId !== actualCurrentNetwork.chainId) {
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
            <FormattedMessage
              description="blowfishSimulationError"
              defaultMessage="Transaction will fail. We recommend choosing another route"
            />
          </Typography>
        </>
      )}
      {!isLoading && transactionSimulation && !transactionSimulation.simulationResults.error && (
        <StyledSimulation>
          <Typography variant="h6">
            <FormattedMessage description="blowfishSimulationTitle" defaultMessage="Transaction simulation" />
          </Typography>
          {BLOWFISH_ENABLED_CHAINS.includes(currentNetwork.chainId) && (
            <TransactionSimulation items={transactionSimulation} />
          )}
          {!BLOWFISH_ENABLED_CHAINS.includes(currentNetwork.chainId) && (
            <Typography variant="body1" color="#219653" sx={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <TokenIcon token={emptyTokenWithAddress('CHECK')} size="28px" />
              <FormattedMessage description="normalSimulationSuccess" defaultMessage="Transaction will be successful" />
            </Typography>
          )}
        </StyledSimulation>
      )}
      {BLOWFISH_ENABLED_CHAINS.includes(currentNetwork.chainId) && (
        <StyledBlowfishContainer>
          <BlowfishLogo />
        </StyledBlowfishContainer>
      )}
    </StyledTransactionSimulationContainer>
  );
};

export default QuoteSimulation;
