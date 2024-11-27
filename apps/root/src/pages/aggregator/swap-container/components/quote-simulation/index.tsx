import React from 'react';
import styled from 'styled-components';
import useSimulateTransaction from '@hooks/useSimulateTransaction';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import { Typography, colors } from 'ui-library';
import BlowfishLogo from '@assets/logo/powered_by_blowfish';
import { BLOWFISH_ENABLED_CHAINS } from '@constants';
import { FormattedMessage } from 'react-intl';
import TransactionSimulation from '@common/components/transaction-simulation';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import TokenIcon from '@common/components/token-icon';
import { emptyTokenWithAddress } from '@common/utils/currency';
import { SwapOption } from '@types';
import { useThemeMode } from '@state/config/hooks';

const StyledTransactionSimulationContainer = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
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
  route?: Nullable<SwapOption>;
  cantFund: boolean | null;
  isApproved: boolean;
  isLoadingRoute: boolean;
  setTransactionWillFail: (willFail: boolean) => void;
  forceProviderSimulation: boolean;
}

const QuoteSimulation = ({
  route,
  cantFund,
  isApproved,
  isLoadingRoute,
  setTransactionWillFail,
  forceProviderSimulation,
}: QuoteSimulationProps) => {
  const currentNetwork = useSelectedNetwork();
  const actualCurrentNetwork = useCurrentNetwork();
  const mode = useThemeMode();
  const [transactionSimulation, isLoadingTransactionSimulation, transactionSimulationError] = useSimulateTransaction(
    route,
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

  if (cantFund || !isApproved || !route?.tx || currentNetwork.chainId !== actualCurrentNetwork.chainId) {
    return null;
  }

  const isLoading = isLoadingTransactionSimulation || isLoadingRoute;
  return (
    <StyledTransactionSimulationContainer>
      {(isLoading || isLoadingRoute) && <CenteredLoadingIndicator />}
      {!isLoading && (transactionSimulationError || transactionSimulation?.simulationResults.error) && (
        <>
          <Typography variant="h5Bold">
            <FormattedMessage description="blowfishSimulationTitle" defaultMessage="Transaction simulation" />
          </Typography>
          <Typography
            variant="bodyRegular"
            color={colors[mode].semantic.error.primary}
            sx={{ display: 'flex', gap: '5px', alignItems: 'center' }}
          >
            <TokenIcon token={emptyTokenWithAddress('FAILED')} size={7} />
            <FormattedMessage
              description="blowfishSimulationError"
              defaultMessage="Transaction will fail. We recommend choosing another route"
            />
          </Typography>
        </>
      )}
      {!isLoading && transactionSimulation && !transactionSimulation.simulationResults.error && (
        <StyledSimulation>
          <Typography variant="h5Bold">
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
            <Typography
              variant="bodyRegular"
              color={colors[mode].semantic.success}
              sx={{ display: 'flex', gap: '5px', alignItems: 'center' }}
            >
              <TokenIcon token={emptyTokenWithAddress('CHECK')} size={7} />
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
