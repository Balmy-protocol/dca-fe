import React from 'react';
import { StyledFormContainer } from 'ui-library';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import { changeRoute } from '@state/tabs/actions';
import { useAppDispatch } from '@state/hooks';
import useTrackEvent from '@hooks/useTrackEvent';
import { useIsLoadingAllTokenLists } from '@state/token-lists/hooks';
import SwapContainer from '../swap-container';
import { SWAP_ROUTE } from '@constants/routes';

interface AggregatorFrameProps {
  isLoading: boolean;
}

const AggregatorFrame = ({ isLoading }: AggregatorFrameProps) => {
  const dispatch = useAppDispatch();
  const isLoadingLists = useIsLoadingAllTokenLists();
  const trackEvent = useTrackEvent();

  React.useEffect(() => {
    dispatch(changeRoute(SWAP_ROUTE.key));
    trackEvent('Aggregator - Visit swap page');
  }, []);

  return (
    <StyledFormContainer>
      {isLoading || isLoadingLists ? <CenteredLoadingIndicator size={70} /> : <SwapContainer />}
    </StyledFormContainer>
  );
};

// HomeFrame.whyDidYouRender = true;

export default AggregatorFrame;
