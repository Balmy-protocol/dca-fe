import { DASHBOARD_ROUTE } from '@constants/routes';
import useReplaceHistory from '@hooks/useReplaceHistory';
import React from 'react';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import { BackControl, Box, Grid, Typography, colors } from 'ui-library';
import HistoryTable from '../components/historyTable';

const StyledHistoryFrame = styled(Grid)`
  ${({ theme: { spacing } }) => `
  gap: ${spacing(44)};
`}
  display: flex;
  flex-direction: column;
`;

const StyledHistoryHeader = styled(Box)`
  ${({ theme: { spacing } }) => `
  display: flex;
  flex-direction: column;
  gap: ${spacing(4)};
`}
`;

const StyledTitle = styled(Typography).attrs({ variant: 'h1' })`
  ${({ theme: { palette, spacing } }) => `
  display: flex;
  flex-direction: column;
  gap: ${spacing(4)};
  color: ${colors[palette.mode].typography.typo1};
  font-weight: bold;
`}
`;

const HistoryFrame = () => {
  const replaceHistory = useReplaceHistory();
  const intl = useIntl();

  const onGoBack = () => {
    replaceHistory(`/${DASHBOARD_ROUTE.key}`);
  };

  return (
    <StyledHistoryFrame container>
      <StyledHistoryHeader>
        <BackControl
          onClick={onGoBack}
          label={intl.formatMessage(defineMessage({ defaultMessage: 'Back', description: 'back' }))}
        />
        <Box>
          <StyledTitle>
            <FormattedMessage description={'history'} defaultMessage={'History'} />
          </StyledTitle>
        </Box>
      </StyledHistoryHeader>
      <HistoryTable />
    </StyledHistoryFrame>
  );
};

export default HistoryFrame;
