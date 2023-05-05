import React from 'react';
import styled from 'styled-components';
import { QuoteTransaction } from '@mean-finance/sdk';
import useSimulateTransaction from '@hooks/useSimulateTransaction';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import Typography from '@mui/material/Typography';
import BlowfishLogo from '@assets/logo/powered_by_blowfish';
import { BLOWFISH_ENABLED_CHAINS } from '@constants';
import { FormattedMessage } from 'react-intl';
import TransactionSimulation from '@common/components/transaction-simulation';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import TokenIcon from '@common/components/token-icon';
import { emptyTokenWithAddress } from '@common/utils/currency';

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
  tx?: QuoteTransaction;
  cantFund: boolean | null;
  isApproved: boolean;
  isLoadingRoute: boolean;
  setTransactionWillFail: (willFail: boolean) => void;
  forceProviderSimulation: boolean;
}

const QuoteSimulation = ({
  tx,
  cantFund,
  isApproved,
  isLoadingRoute,
  setTransactionWillFail,
  forceProviderSimulation,
}: QuoteSimulationProps) => {
  const currentNetwork = useSelectedNetwork();
  const actualCurrentNetwork = useCurrentNetwork();
  const [transactionSimulation, isLoadingTransactionSimulation, transactionSimulationError] = useSimulateTransaction(
    tx,
    currentNetwork.chainId,
    cantFund || !isApproved || currentNetwork.chainId !== actualCurrentNetwork.chainId,
    forceProviderSimulation
  );

  React.useEffect(() => {
    if (!BLOWFISH_ENABLED_CHAINS.includes(currentNetwork.chainId) && transactionSimulationError) {
      setTransactionWillFail(true);
    } else {
      setTransactionWillFail(false);
    }
  }, [currentNetwork.chainId, transactionSimulationError]);

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
          <Typography variant="body1" color="#EB5757" sx={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <TokenIcon token={emptyTokenWithAddress('FAILED')} size="28px" />
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
          {BLOWFISH_ENABLED_CHAINS.includes(currentNetwork.chainId) &&
            !forceProviderSimulation &&
            !!transactionSimulation.simulationResults.expectedStateChanges.length && (
              <TransactionSimulation items={transactionSimulation} />
            )}
          {(!BLOWFISH_ENABLED_CHAINS.includes(currentNetwork.chainId) ||
            forceProviderSimulation ||
            !transactionSimulation.simulationResults.expectedStateChanges.length) && (
            <Typography variant="body1" color="#219653" sx={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <TokenIcon token={emptyTokenWithAddress('CHECK')} size="28px" />
              <FormattedMessage description="normalSimulationSuccess" defaultMessage="Transaction will be successful" />
            </Typography>
          )}
        </StyledSimulation>
      )}
      {BLOWFISH_ENABLED_CHAINS.includes(currentNetwork.chainId) && !forceProviderSimulation && (
        <StyledBlowfishContainer>
          <BlowfishLogo />
        </StyledBlowfishContainer>
      )}
    </StyledTransactionSimulationContainer>
  );
};

export default QuoteSimulation;
