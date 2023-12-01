import React from 'react';
import { Grid } from 'ui-library';
import styled from 'styled-components';
import { changeMainTab } from '@state/tabs/actions';
import { useAppDispatch } from '@state/hooks';
import TransferContainer from '../transfer-container';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import useTrackEvent from '@hooks/useTrackEvent';

const StyledGrid = styled(Grid)`
  padding-top: 28px !important;
  display: flex;
`;

interface TransferFrameProps {
  isLoading: boolean;
}

const TransferFrame = ({ isLoading }: TransferFrameProps) => {
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();

  React.useEffect(() => {
    dispatch(changeMainTab(3));
    trackEvent('Transfer - Visit transfer page');
  }, []);

  return (
    <Grid container spacing={8}>
      <StyledGrid item xs={12}>
        {isLoading ? <CenteredLoadingIndicator size={70} /> : <TransferContainer />}
      </StyledGrid>
    </Grid>
  );
};

export default TransferFrame;
