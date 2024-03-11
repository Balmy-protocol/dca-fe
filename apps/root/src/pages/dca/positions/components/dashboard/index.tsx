import React from 'react';
import styled from 'styled-components';
import { BackgroundPaper, Grid } from 'ui-library';
import CountDashboard from '../count-dashboard';
import UsdDashboard from '../usd-dashboard';

const StyledBackgroundPaper = styled(BackgroundPaper)`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(8)};
  `}
`;

const PositionDashboard = () => {
  const [selectedChain] = React.useState<null | number>(null);
  const [selectedTokens, setSelectedTokens] = React.useState<null | string[]>(null);

  return (
    <StyledBackgroundPaper variant="outlined">
      <Grid container rowSpacing={16} alignItems="stretch">
        <Grid item xs={12} md={6}>
          <CountDashboard />
        </Grid>
        <Grid item xs={12} md={6}>
          <UsdDashboard
            selectedTokens={selectedTokens}
            onSelectTokens={setSelectedTokens}
            selectedChain={selectedChain}
          />
        </Grid>
      </Grid>
    </StyledBackgroundPaper>
  );
};
export default PositionDashboard;
