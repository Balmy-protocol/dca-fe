import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import PastPosition from './components/position';
import { TokenList, Web3Service, PositionsRaw } from 'types';
import usePromise from 'hooks/usePromise';

interface HistoryProps {
  tokenList: TokenList;
  web3Service: Web3Service;
}

const History = ({ tokenList, web3Service }: HistoryProps) => {
  const [pastPositionsPositions, isLoadingPastPositions, pastPositionErrors] = usePromise(
    web3Service,
    'getPastPositions',
    [],
    !web3Service.getAccount()
  );

  return (
    <Grid container direction="column" alignItems="flex-start" justify="center" spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h3">
          <FormattedMessage description="Previous positions" defaultMessage="Your previous positions" />
        </Typography>
      </Grid>
      <Grid item xs={12} style={{ width: '100%' }}>
        <Grid container spacing={2} alignItems="flex-start">
          {!isLoadingPastPositions && pastPositionsPositions
            ? (pastPositionsPositions as PositionsRaw).map(
                ({
                  from,
                  to,
                  swapInterval,
                  swapped,
                  startedAt,
                  remainingLiquidity,
                  remainingSwaps,
                  id,
                  status,
                  withdrawn,
                }) => (
                  <Grid item xs={12} sm={6} md={3} key={id}>
                    <PastPosition
                      from={tokenList[from]}
                      to={tokenList[to]}
                      swapInterval={swapInterval}
                      swapped={swapped}
                      startedAt={startedAt}
                      withdrawn={withdrawn}
                      remainingLiquidity={remainingLiquidity}
                      remainingSwaps={remainingSwaps}
                      id={id}
                      status={status}
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
