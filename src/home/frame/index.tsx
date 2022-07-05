import React from 'react';
import Grid from '@mui/material/Grid';
import styled from 'styled-components';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import { useMainTab } from 'state/tabs/hooks';
import { useParams } from 'react-router-dom';
import { SUPPORTED_NETWORKS } from 'config/constants';
import { GetSwapIntervalsGraphqlResponse } from 'types';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { useQuery } from '@apollo/client';
import getAvailableIntervals from 'graphql/getAvailableIntervals.graphql';
import useDCAGraphql from 'hooks/useDCAGraphql';
import useWalletService from 'hooks/useWalletService';
import SwapContainer from '../swap-container';
import Positions from '../positions';

interface HomeFrameProps {
  isLoading: boolean;
}

const StyledGridContainer = styled(Grid).withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) =>
    (!['isLoading'].includes(prop) && defaultValidatorFn(prop)) || ['container'].includes(prop),
})<HomeFrameProps>`
  ${({ isLoading }) => !isLoading && 'align-self: flex-start'}
`;
// height: ${(props) => (props.isLoading ? `calc(100% + ${(parseInt(props?.spacing || '0', 10) || 0) * 4}px)` : 'auto')}; ;

const HomeFrame = ({ isLoading }: HomeFrameProps) => {
  const tabIndex = useMainTab();
  const walletService = useWalletService();
  const currentNetwork = useCurrentNetwork();
  const { chainId } = useParams<{ chainId: string }>();
  const client = useDCAGraphql();

  React.useEffect(() => {
    if (
      chainId &&
      SUPPORTED_NETWORKS.includes(parseInt(chainId, 10)) &&
      chainId !== currentNetwork.chainId.toString()
    ) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      walletService.changeNetwork(parseInt(chainId, 10));
    }
  }, [chainId, currentNetwork]);

  const { loading: isLoadingSwapIntervals, data: swapIntervalsData } = useQuery<GetSwapIntervalsGraphqlResponse>(
    getAvailableIntervals,
    {
      client,
    }
  );

  const isLoadingIntervals = isLoading || isLoadingSwapIntervals;

  return (
    <StyledGridContainer container spacing={8} isLoading={isLoadingIntervals}>
      {isLoadingIntervals ? (
        <Grid item xs={12} style={{ display: 'flex' }}>
          <CenteredLoadingIndicator size={70} />
        </Grid>
      ) : (
        <>
          {tabIndex === 0 ? (
            <Grid item xs={12}>
              <SwapContainer swapIntervalsData={swapIntervalsData} />
            </Grid>
          ) : (
            <Positions />
          )}
        </>
      )}
    </StyledGridContainer>
  );
};
export default HomeFrame;
