import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import ActivePosition from './components/position';
import usePromise from 'hooks/usePromise';
import { Web3Service, TokenList, CurrentPositions } from 'types';

interface CurrentPositionsProps {
  web3Service: Web3Service;
  tokenList: TokenList;
}

const CurrentPositions = ({ web3Service, tokenList }: CurrentPositionsProps) => {
  const [currentPositions, isLoadingCurrentPositions, currentPositionErrors] = usePromise(
    web3Service,
    'getCurrentPositions',
    [],
    !web3Service.getAccount()
  );

  return (
    <Grid container direction="column" alignItems="flex-start" justify="center" spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h3">
          <FormattedMessage description="Current positions" defaultMessage="Your current positions" />
        </Typography>
      </Grid>
      {/* dont know why I need the 100% width :shrug: */}
      <Grid item xs={12} style={{ width: '100%' }}>
        <Grid container spacing={2} alignItems="flex-start">
          {!isLoadingCurrentPositions && currentPositions
            ? (currentPositions as CurrentPositions).map(
                (
                  {
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
                  },
                  index
                ) => (
                  <Grid item xs={12} sm={6} md={3}>
                    <ActivePosition
                      key={index}
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
                      web3Service={web3Service}
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
export default CurrentPositions;
