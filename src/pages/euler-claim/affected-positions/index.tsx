import React from 'react';
import Grid from '@mui/material/Grid';
import styled from 'styled-components';
import { Position } from 'types';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import useYieldOptions from 'hooks/useYieldOptions';
import Paper from '@mui/material/Paper';
import { NETWORKS } from 'config';
import ActivePosition from './components/position';

const StyledGridItem = styled(Grid)`
  display: flex;
`;

const StyledPaper = styled(Paper)`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  flex-grow: 1;
  background-color: rgba(216, 216, 216, 0.05);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-start;
`;

const StyledPositionsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const StyledTitle = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

interface AffectedPositionsProps {
  positions: Position[];
}

const AffectedPositions = ({ positions }: AffectedPositionsProps) => {
  const [yieldOptions] = useYieldOptions(NETWORKS.mainnet.chainId);

  return (
    <StyledPositionsContainer>
      <StyledTitle>
        <Typography variant="h5">
          <FormattedMessage description="eulerClaimAffectedPositions title" defaultMessage="Your affected positions" />
        </Typography>
        <Typography variant="body1">
          <FormattedMessage
            description="eulerClaimAffectedPositions description"
            defaultMessage="These are the positions that you have that were affected by the euler vulnerability"
          />
        </Typography>
      </StyledTitle>
      <StyledPaper variant="outlined">
        <Grid container spacing={1}>
          {!!positions.length && (
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {positions.map((position) => (
                  <StyledGridItem item xs={12} sm={6} md={4} key={position.id}>
                    <ActivePosition position={position} yieldOptions={yieldOptions || []} />
                  </StyledGridItem>
                ))}
              </Grid>
            </Grid>
          )}
        </Grid>
      </StyledPaper>
    </StyledPositionsContainer>
  );
};

export default AffectedPositions;
