import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Typography, Card, colors, ContainerBox, Button } from 'ui-library';
import { DCA_CREATE_ROUTE } from '@constants/routes';
import usePushToHistory from '@hooks/usePushToHistory';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import useAnalytics from '@hooks/useAnalytics';

const StyledCard = styled(Card)`
  ${({
    theme: {
      palette: { mode },
    },
  }) => `
    position: relative;
    min-height: 215px;
    border: 3px dashed;
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    align-self: stretch;
    background-color: transparent;
    border-color: ${colors[mode].border.border1};
    outline-color: transparent;
  `}
`;

const EmptyPositions = () => {
  const pushToHistory = usePushToHistory();
  const dispatch = useAppDispatch();
  const { trackEvent } = useAnalytics();

  const onClick = React.useCallback(() => {
    dispatch(changeRoute(DCA_CREATE_ROUTE.key));
    pushToHistory(`/${DCA_CREATE_ROUTE.key}`);
    trackEvent('DCA - Go to create new position');
  }, [dispatch, pushToHistory]);

  return (
    <StyledCard variant="outlined">
      <ContainerBox flexGrow={1} justifyContent="center" alignItems="center" flexDirection="column" gap={6}>
        <ContainerBox flexDirection="column" gap={2} alignItems="center" justifyContent="center">
          <Typography variant="h5Bold">
            <FormattedMessage description="createPositionPositionListTitle" defaultMessage="Balmy’s DCA" />
          </Typography>
          <Typography variant="bodyRegular">
            <FormattedMessage
              description="createPositionPositionListSubtitle"
              defaultMessage="Spread your investment and earn yields."
            />
          </Typography>
        </ContainerBox>
        <Button variant="contained" color="primary" fullWidth onClick={onClick} size="large">
          <FormattedMessage description="createPositionPositionList" defaultMessage="Create new position" />
        </Button>
      </ContainerBox>
    </StyledCard>
  );
};

export default EmptyPositions;
