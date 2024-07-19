import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { BackgroundPaper, Tab, Typography, UnderlinedTabs } from 'ui-library';

const StyledBackgroundPaper = styled(BackgroundPaper).attrs({ variant: 'outlined', elevation: 0 })`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(6)};
    display: flex;
    flex-direction: column;
    gap: ${spacing(5)};
  `}
`;

const StrategyManagement = () => {
  const [tab, setTab] = React.useState(0);
  return (
    <StyledBackgroundPaper>
      <UnderlinedTabs value={tab} onChange={(_, val: number) => setTab(val)}>
        <Tab
          label={
            <Typography variant="bodyRegular" color="inherit">
              {<FormattedMessage description="earn.strategy-management.tabs.deposit" defaultMessage="Deposit" />}
            </Typography>
          }
        />
        <Tab
          label={
            <Typography variant="bodyRegular" color="inherit">
              <FormattedMessage description="earn.strategy-management.tabs.withdraw" defaultMessage="Withdraw" />
            </Typography>
          }
        />
      </UnderlinedTabs>
    </StyledBackgroundPaper>
  );
};

export default StrategyManagement;
