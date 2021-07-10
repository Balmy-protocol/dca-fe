import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import PastPosition from './components/position';
import { TokenList, Web3Service, PositionsRaw } from 'types';
import usePromise from 'hooks/usePromise';
import usePastPositions from 'hooks/usePastPositions';
import useTokenList from 'hooks/useTokenList';

interface HistoryProps {
  web3Service: Web3Service;
}

const History = ({ web3Service }: HistoryProps) => {
  const pastPositions = usePastPositions();
  const tokenList = useTokenList();

  return (
    <Grid container direction="column" alignItems="flex-start" justify="center" spacing={3}>
      <Grid item xs={12} style={{ width: '100%' }}>
        <Grid container spacing={2} alignItems="flex-start">
          {pastPositions
            ? (pastPositions as PositionsRaw).map((position) => (
                <Grid item xs={12} sm={6} md={3} key={position.id}>
                  <PastPosition
                    position={{ ...position, from: tokenList[position.from], to: tokenList[position.to] }}
                  />
                </Grid>
              ))
            : null}
        </Grid>
      </Grid>
    </Grid>
  );
};
export default History;
