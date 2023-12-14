import React from 'react';
import { Grid } from 'ui-library';
import styled from 'styled-components';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import { changeRoute } from '@state/tabs/actions';
import { useAppDispatch } from '@state/hooks';
import useCurrentBreakpoint from '@hooks/useCurrentBreakpoint';
import useTrackEvent from '@hooks/useTrackEvent';
import { useIsLoadingAllTokenLists } from '@state/token-lists/hooks';
import SwapContainer from '../swap-container';
import { SWAP_ROUTE } from '@constants/routes';

const StyledGrid = styled(Grid)<{ isSmall?: boolean }>`
  ${({ isSmall }) => isSmall && 'padding-top: 28px !important;'}
`;

interface AggregatorFrameProps {
  isLoading: boolean;
}

const AggregatorFrame = ({ isLoading }: AggregatorFrameProps) => {
  const dispatch = useAppDispatch();
  const currentBreakPoint = useCurrentBreakpoint();
  const isLoadingLists = useIsLoadingAllTokenLists();
  const trackEvent = useTrackEvent();

  React.useEffect(() => {
    dispatch(changeRoute(SWAP_ROUTE.key));
    trackEvent('Aggregator - Visit swap page');
  }, []);

  return (
    <Grid container spacing={8}>
      {isLoading || isLoadingLists ? (
        <StyledGrid item xs={12} style={{ display: 'flex' }} isSmall={currentBreakPoint === 'xs'}>
          <CenteredLoadingIndicator size={70} />
        </StyledGrid>
      ) : (
        <StyledGrid item xs={12} style={{ display: 'flex' }} isSmall={currentBreakPoint === 'xs'}>
          <SwapContainer />
        </StyledGrid>
      )}
    </Grid>
  );
};

// HomeFrame.whyDidYouRender = true;

export default AggregatorFrame;
