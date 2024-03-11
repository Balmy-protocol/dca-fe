import * as React from 'react';
import { Button, ContainerBox, Typography, colors } from 'ui-library';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import usePushToHistory from '@hooks/usePushToHistory';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import { DCA_CREATE_ROUTE } from '@constants/routes';

const StyledContainer = styled(ContainerBox)`
  ${({
    theme: {
      palette: { mode },
      spacing,
    },
  }) => `
    border-radius: ${spacing(4)};
    gap: ${spacing(4)};
    border: ${spacing(0.625)} dashed ${colors[mode].border.border1};
  `}
`;

const CreatePositionBox = () => {
  const pushToHistory = usePushToHistory();
  const dispatch = useAppDispatch();

  const onClick = React.useCallback(() => {
    dispatch(changeRoute(DCA_CREATE_ROUTE.key));
    pushToHistory(`/${DCA_CREATE_ROUTE.key}`);
  }, [dispatch, pushToHistory]);

  return (
    <StyledContainer flexGrow={1} justifyContent="center" alignItems="center" flexDirection="column">
      <ContainerBox flexDirection="column" gap={2} alignItems="center" justifyContent="center">
        <Typography variant="h5" fontWeight={500}>
          <FormattedMessage description="createPositionPositionListTitle" defaultMessage="Balmy’s DCA" />
        </Typography>
        <Typography variant="body" fontWeight={500}>
          <FormattedMessage
            description="createPositionPositionListSubtitle"
            defaultMessage="Spread your investment and earn yields."
          />
        </Typography>
      </ContainerBox>
      <Button variant="contained" color="primary" fullWidth onClick={onClick}>
        <FormattedMessage description="createPositionPositionList" defaultMessage="Create new position" />
      </Button>
    </StyledContainer>
  );
};
export default CreatePositionBox;
