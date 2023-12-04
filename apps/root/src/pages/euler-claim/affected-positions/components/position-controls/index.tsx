import * as React from 'react';
import { Typography, Link, Button } from 'ui-library';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Position } from '@types';
import { useAppDispatch } from '@state/hooks';
import { setPosition } from '@state/position-details/actions';
import { changePositionDetailsTab } from '@state/tabs/actions';
import usePushToHistory from '@hooks/usePushToHistory';
import useTrackEvent from '@hooks/useTrackEvent';

const StyledCardFooterButton = styled(Button)``;

const StyledCallToActionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 8px;
`;

interface PositionControlsProps {
  position: Position;
}

const PositionControls = ({ position }: PositionControlsProps) => {
  const { version, chainId, positionId } = position;

  const pushToHistory = usePushToHistory();
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();

  const onViewDetails = (event: React.MouseEvent) => {
    event.preventDefault();
    dispatch(setPosition(null));
    dispatch(changePositionDetailsTab(0));
    pushToHistory(`/${chainId}/positions/${version}/${positionId}`);
    trackEvent('Euler claim - View details');
  };

  return (
    <StyledCallToActionContainer>
      <StyledCardFooterButton variant="outlined" color="primary" onClick={onViewDetails} fullWidth>
        <Link href={`/${chainId}/positions/${version}/${positionId}`} underline="none" color="inherit">
          <Typography variant="bodySmall">
            <FormattedMessage description="goToPosition" defaultMessage="Go to position" />
          </Typography>
        </Link>
      </StyledCardFooterButton>
    </StyledCallToActionContainer>
  );
};
export default PositionControls;
