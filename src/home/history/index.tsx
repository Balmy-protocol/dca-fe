import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import PastPosition from './components/position';
import { TokenList } from 'types';

const mockData = [
  {
    from: 'ETH',
    to: 'DAI',
    initialAmmount: 0.00001,
    exercised: 2,
    startedAt: new Date('05-11-2021'),
    daysSet: 8,
  },
  {
    from: 'ETH',
    to: 'DAI',
    initialAmmount: 5,
    exercised: 345200,
    startedAt: new Date('05-20-2021'),
    daysSet: 8,
  },
  {
    from: 'DAI',
    to: 'ETH',
    initialAmmount: 4,
    exercised: 0.0002,
    startedAt: new Date('04-17-2021'),
    daysSet: 8,
  },
  {
    id: '4',
    from: 'ETH',
    to: 'DAI',
    initialAmmount: 0.00001,
    exercised: 2,
    startedAt: new Date('03-05-2021'),
    daysSet: 8,
  },
  {
    from: 'DAI',
    to: 'EYH',
    initialAmmount: 2,
    exercised: 0.05,
    startedAt: new Date('03-13-2021'),
    daysSet: 8,
  },
  {
    from: 'ETH',
    to: 'DAI',
    initialAmmount: 0.04,
    exercised: 2000,
    startedAt: new Date('02-20-2021'),
    daysSet: 8,
  },
];

interface HistoryProps {
  tokenList: TokenList;
}

const History = ({ tokenList }: HistoryProps) => (
  <Grid container direction="column" alignItems="flex-start" justify="center" spacing={3}>
    <Grid item xs={12}>
      <Typography variant="h3">
        <FormattedMessage description="Previous positions" defaultMessage="Your previous positions" />
      </Typography>
    </Grid>
    <Grid item xs={12}>
      <Grid container spacing={2}>
        {mockData.map(({ from, to, daysSet, startedAt, exercised, initialAmmount }, index) => (
          <PastPosition
            key={index}
            from={from}
            to={to}
            daysSet={daysSet}
            startedAt={startedAt}
            exercised={exercised}
            initialAmmount={initialAmmount}
          />
        ))}
      </Grid>
    </Grid>
  </Grid>
);
export default History;
