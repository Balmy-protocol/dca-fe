import React from 'react';
import { StyledFormContainer } from 'ui-library';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import { changeRoute } from '@state/tabs/actions';
import { useAppDispatch } from '@state/hooks';
import useAnalytics from '@hooks/useAnalytics';
import { useIsLoadingAllTokenLists } from '@state/token-lists/hooks';
import SwapContainer from '../swap-container';
import { SWAP_ROUTE } from '@constants/routes';

interface AggregatorFrameProps {}

const AggregatorFrame = ({}: AggregatorFrameProps) => {
  const dispatch = useAppDispatch();
  const isLoadingLists = useIsLoadingAllTokenLists();
  const { trackEvent } = useAnalytics();

  React.useEffect(() => {
    dispatch(changeRoute(SWAP_ROUTE.key));
    trackEvent('Aggregator - Visit swap page');
  }, []);

  return (
    <StyledFormContainer flexDirection="column" flexWrap="nowrap">
      {isLoadingLists ? <CenteredLoadingIndicator size={70} /> : <SwapContainer />}
    </StyledFormContainer>
  );
};

// HomeFrame.whyDidYouRender = true;

export default AggregatorFrame;
