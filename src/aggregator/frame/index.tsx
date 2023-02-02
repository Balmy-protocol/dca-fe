import React from 'react';
import Grid from '@mui/material/Grid';
import styled from 'styled-components';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import { changeMainTab } from 'state/tabs/actions';
import { useAppDispatch } from 'state/hooks';
import useCurrentBreakpoint from 'hooks/useCurrentBreakpoint';
import { useIsLoadingAggregatorTokenLists } from 'state/token-lists/hooks';
import SwapContainer from '../swap-container';

const StyledGrid = styled(Grid)<{ isSmall?: boolean }>`
  ${({ isSmall }) => isSmall && 'padding-top: 28px !important;'}
`;

interface HomeFrameProps {
  isLoading: boolean;
}

const HomeFrame = ({ isLoading }: HomeFrameProps) => {
  const dispatch = useAppDispatch();
  const currentBreakPoint = useCurrentBreakpoint();
  const isLoadingLists = useIsLoadingAggregatorTokenLists();

  React.useEffect(() => {
    dispatch(changeMainTab(2));
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
export default HomeFrame;
