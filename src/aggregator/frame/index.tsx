import React from 'react';
import Grid from '@mui/material/Grid';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import { useParams } from 'react-router-dom';
import { SUPPORTED_NETWORKS } from 'config/constants';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import useWalletService from 'hooks/useWalletService';
import { changeMainTab } from 'state/tabs/actions';
import { useAppDispatch } from 'state/hooks';
import { useIsLoadingAggregatorTokenLists } from 'state/token-lists/hooks';
import SwapContainer from '../swap-container';

interface HomeFrameProps {
  isLoading: boolean;
}

const HomeFrame = ({ isLoading }: HomeFrameProps) => {
  const walletService = useWalletService();
  const currentNetwork = useCurrentNetwork();
  const { chainId } = useParams<{ chainId: string }>();
  const dispatch = useAppDispatch();
  const isLoadingLists = useIsLoadingAggregatorTokenLists();

  React.useEffect(() => {
    dispatch(changeMainTab(2));
  }, []);

  React.useEffect(() => {
    if (
      chainId &&
      SUPPORTED_NETWORKS.includes(parseInt(chainId, 10)) &&
      currentNetwork.isSet &&
      chainId !== currentNetwork.chainId.toString()
    ) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      walletService.changeNetwork(parseInt(chainId, 10));
    }
  }, [currentNetwork]);

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
