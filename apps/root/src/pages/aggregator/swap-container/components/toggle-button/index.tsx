import styled from 'styled-components';
import React from 'react';
import { ContainerBox, IconButton, ArrowSwapIcon, colors } from 'ui-library';
import { useAppDispatch } from '@state/hooks';
import { useAggregatorState } from '@state/aggregator/hooks';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import useReplaceHistory from '@hooks/useReplaceHistory';
import useAnalytics from '@hooks/useAnalytics';
import { setSelectedRoute, toggleFromTo } from '@state/aggregator/actions';

const StyledToggleContainer = styled(ContainerBox).attrs({ justifyContent: 'center', flex: '1' })`
  ${({ theme: { spacing } }) => `
    position: absolute;
    left: calc(50% - ${spacing(6)});
    bottom: -${spacing(7)};
    z-index: 2;
  `}
`;

const StyledToggleTokenButton = styled(IconButton)`
  ${({
    theme: {
      palette: { mode },
    },
  }) => `
    border: 1.5px solid ${colors[mode].border.border1};
    background: ${colors[mode].background.secondary};
    box-shadow: ${colors[mode].dropShadow.dropShadow100};
    color: ${colors[mode].accent.primary};

    &:hover {
      background: ${colors[mode].background.tertiary};
      box-shadow: ${colors[mode].dropShadow.dropShadow200};
    }

    &:disabled {
      background: ${colors[mode].background.quartery};
      color: ${colors[mode].accent.accent400};
      border: 1.5px solid ${colors[mode].border.border2};
    }
  `}
`;

type Props = {
  isLoadingRoute: boolean;
};

const ToggleButton = ({ isLoadingRoute }: Props) => {
  const { from, to } = useAggregatorState();

  const dispatch = useAppDispatch();

  const currentNetwork = useSelectedNetwork();
  const replaceHistory = useReplaceHistory();
  const { trackEvent } = useAnalytics();

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
      <StyledToggleTokenButton color="primary" onClick={onToggleFromTo} disabled={isLoadingRoute}>
        <ArrowSwapIcon />
      </StyledToggleTokenButton>
    </StyledToggleContainer>
  );
};

export default ToggleButton;
