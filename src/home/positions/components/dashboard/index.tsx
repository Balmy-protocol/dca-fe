import React from 'react';
import Paper from '@mui/material/Paper';
import styled from 'styled-components';
import Grid from '@mui/material/Grid';
import CountDashboard from '../count-dashboard';
import UsdDashboard from '../usd-dashboard';

const StyledPaper = styled(Paper)`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  background-color: rgba(216, 216, 216, 0.05);
  backdrop-filter: blur(6px);
  display: flex;
  flex: 1;
  align-items: flex-start;
`;

const PositionDashboard = () => {
  const [selectedChain, setSelectedChain] = React.useState<null | number>(null);
  const [selectedToken, setSelectedToken] = React.useState<null | string>(null);

  return (
    <Grid container spacing={4}>
      <Grid item xs={5}>
        <StyledPaper variant="outlined">
          <CountDashboard
            selectedChain={selectedChain}
            onSelectChain={setSelectedChain}
            selectedToken={selectedToken}
          />
        </StyledPaper>
      </Grid>
      <Grid item xs={5}>
        <StyledPaper variant="outlined">
          <UsdDashboard selectedToken={selectedToken} onSelectToken={setSelectedToken} selectedChain={selectedChain} />
        </StyledPaper>
      </Grid>
    </Grid>
  );
};
export default PositionDashboard;
