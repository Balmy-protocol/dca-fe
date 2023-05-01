import React from 'react';
import Grid from '@mui/material/Grid';
import { BigNumber } from 'ethers';
import { FullPosition, Token, YieldOptions } from '@types';
import UserCompPosition from '@pages/jbrl-competition/user-comp-position';

interface LeaderboardSummaryProps {
  userPositions: {
    user: string;
    generatedUsd: number;
    totalUsed: BigNumber;
    totalUsedUsd: number;
    totalDepositedUsd: number;
    totalDeposited: BigNumber;
    generated: { token: Token; amount: BigNumber }[];
    positions: FullPosition[];
  }[];
  prices?: Record<string, BigNumber>;
  yieldOptions?: YieldOptions;
}

const LeaderboardSummary = ({ userPositions, prices, yieldOptions }: LeaderboardSummaryProps) => (
  <Grid container spacing={4} alignItems="flex-start">
    {userPositions.map((userPosition, index) => (
      <Grid item xs={12} key={userPosition.user}>
        <UserCompPosition
          userPosition={userPosition}
          prices={prices}
          leaderboardPosition={index}
          yieldOptions={yieldOptions}
        />
      </Grid>
    ))}
  </Grid>
);

export default LeaderboardSummary;
