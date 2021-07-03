import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import PastPosition from './components/position';
import { TokenList, Web3Service, PositionsRaw } from 'types';
import usePromise from 'hooks/usePromise';
import usePastPositions from 'hooks/usePastPositions';

interface HistoryProps {
  tokenList: TokenList;
  web3Service: Web3Service;
}

const History = ({ tokenList, web3Service }: HistoryProps) => {
  const pastPositions = usePastPositions();

  return (
    <Grid container direction="column" alignItems="flex-start" justify="center" spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h3">
          <FormattedMessage description="Previous positions" defaultMessage="Your previous positions" />
        </Typography>
      </Grid>
      <Grid item xs={12} style={{ width: '100%' }}>
        <Grid container spacing={2} alignItems="flex-start">
          {pastPositions
            ? (pastPositions as PositionsRaw).map(
                ({
                  from,
                  to,
                  swapInterval,
                  swapped,
                  remainingLiquidity,
                  remainingSwaps,
                  id,
                  status,
                  withdrawn,
                  startedAt,
                }) => (
                  <Grid item xs={12} sm={6} md={3} key={id}>
                    <PastPosition
                      from={tokenList[from]}
                      to={tokenList[to]}
                      swapInterval={swapInterval}
                      swapped={swapped}
                      withdrawn={withdrawn}
                      remainingLiquidity={remainingLiquidity}
                      remainingSwaps={remainingSwaps}
                      id={id}
                      status={status}
                      startedAt={startedAt}
                    />
                  </Grid>
                )
              )
            : null}
        </Grid>
      </Grid>
    </Grid>
  );
};
export default History;
