import React from 'react';
import Grid from '@mui/material/Grid';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import { changeMainTab } from 'state/tabs/actions';
import { useAppDispatch } from 'state/hooks';
import { useIsLoadingAggregatorTokenLists } from 'state/token-lists/hooks';
import SwapContainer from '../swap-container';

interface HomeFrameProps {
  isLoading: boolean;
}

const HomeFrame = ({ isLoading }: HomeFrameProps) => {
  const dispatch = useAppDispatch();
  const isLoadingLists = useIsLoadingAggregatorTokenLists();

  React.useEffect(() => {
    dispatch(changeMainTab(2));
  }, []);

  return (
    <Grid container spacing={8}>
      {isLoading || isLoadingLists ? (
        <Grid item xs={12} style={{ display: 'flex' }}>
          <CenteredLoadingIndicator size={70} />
        </Grid>
      ) : (
        <Grid item xs={12} style={{ display: 'flex' }}>
          <SwapContainer />
        </Grid>
      )}
    </Grid>
  );
};
export default HomeFrame;
