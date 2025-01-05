import * as React from 'react';
import { Button, ContainerBox, Typography, colors } from 'ui-library';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import usePushToHistory from '@hooks/usePushToHistory';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import { DCA_CREATE_ROUTE } from '@constants/routes';
import useAnalytics from '@hooks/useAnalytics';

const StyledContainer = styled(ContainerBox)`
  ${({
    theme: {
      palette: { mode },
      spacing,
      space,
    },
  }) => `
    border-radius: ${spacing(4)};
    gap: ${space.s05};
    border: ${spacing(0.625)} dashed ${colors[mode].border.border1};
    padding: ${space.s05};
  `}
`;

const CreatePositionBox = () => {
  const pushToHistory = usePushToHistory();
  const dispatch = useAppDispatch();
  const { trackEvent } = useAnalytics();

  const onClick = React.useCallback(() => {
    dispatch(changeRoute(DCA_CREATE_ROUTE.key));
    pushToHistory(`/${DCA_CREATE_ROUTE.key}`);
    trackEvent('Position list - Go to create position');
  }, [dispatch, pushToHistory]);

  return (
    <StyledContainer flexGrow={1} justifyContent="center" alignItems="center" flexDirection="column">
      <ContainerBox flexDirection="column" gap={2} alignItems="center" justifyContent="center">
        <Typography variant="h4Bold">
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
    </StyledContainer>
  );
};
export default CreatePositionBox;
