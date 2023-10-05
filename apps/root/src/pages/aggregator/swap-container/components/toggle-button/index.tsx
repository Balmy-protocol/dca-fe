import styled from 'styled-components';
import React from 'react';
import { IconButton } from 'ui-library';
import { useAppDispatch } from '@state/hooks';
import { useAggregatorState } from '@state/aggregator/hooks';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import useReplaceHistory from '@hooks/useReplaceHistory';
import useTrackEvent from '@hooks/useTrackEvent';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { setSelectedRoute, toggleFromTo } from '@state/aggregator/actions';

const StyledToggleContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  position: absolute;
  left: calc(50% - 24px);
  bottom: -30px;
  z-index: 2;
`;

const StyledToggleTokenButton = styled(IconButton)`
  border: 4px solid #1b1821;
  background-color: #292929;

  :disabled {
    background-color: #292929;
  }

  :hover {
    background-color: #484848;
  }
`;

type Props = {
  isLoadingRoute: boolean;
};

const ToggleButton = ({ isLoadingRoute }: Props) => {
  const { from, to } = useAggregatorState();

  const dispatch = useAppDispatch();

  const currentNetwork = useSelectedNetwork();
  const replaceHistory = useReplaceHistory();
  const trackEvent = useTrackEvent();

  const onToggleFromTo = () => {
    dispatch(setSelectedRoute(null));
    dispatch(toggleFromTo());

    if (to) {
      replaceHistory(`/swap/${currentNetwork.chainId}/${to.address || ''}/${from?.address || ''}`);
    }
    trackEvent('Aggregator - Toggle from/to', { fromAddress: from?.address, toAddress: to?.address });
  };

  return (
    <StyledToggleContainer>
      <StyledToggleTokenButton onClick={onToggleFromTo} disabled={isLoadingRoute}>
        <SwapVertIcon />
      </StyledToggleTokenButton>
    </StyledToggleContainer>
  );
};

export default ToggleButton;
