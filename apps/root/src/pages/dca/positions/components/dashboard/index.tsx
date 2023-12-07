import React from 'react';
import styled from 'styled-components';
import { Grid, Paper } from 'ui-library';
import CountDashboard from '../count-dashboard';
import UsdDashboard from '../usd-dashboard';

const StyledPaper = styled(Paper)`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  display: flex;
  flex: 1;
  align-items: flex-start;
`;

const PositionDashboard = () => {
  const [selectedChain, setSelectedChain] = React.useState<null | number>(null);
  const [selectedTokens, setSelectedTokens] = React.useState<null | string[]>(null);

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={5}>
        <StyledPaper variant="outlined">
          <CountDashboard
            selectedChain={selectedChain}
            onSelectChain={setSelectedChain}
            selectedTokens={selectedTokens}
          />
        </StyledPaper>
      </Grid>
      <Grid item xs={12} md={5}>
        <StyledPaper variant="outlined">
          <UsdDashboard
            selectedTokens={selectedTokens}
            onSelectTokens={setSelectedTokens}
            selectedChain={selectedChain}
          />
        </StyledPaper>
      </Grid>
    </Grid>
  );
};
export default PositionDashboard;
