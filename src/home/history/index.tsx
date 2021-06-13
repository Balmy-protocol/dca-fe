import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import { DataGrid } from '@material-ui/data-grid';
import type { GridColDef, GridRowsProp } from '@material-ui/data-grid';
import { COLUMNS } from './constants';

const mockData: GridRowsProp = [
  {
    id: '1',
    coinFrom: 'ETH',
    coinTo: 'DAI',
    initialAmmount: '0.00001',
    exchangedAmmount: '2',
    executedFrom: '11/06/2021',
    daysSet: '8 days',
  },
  {
    id: '2',
    coinFrom: 'ETH',
    coinTo: 'DAI',
    initialAmmount: '5',
    exchangedAmmount: '345200',
    executedFrom: '11/06/2021',
    daysSet: '8 days',
  },
  {
    id: '3',
    coinFrom: 'DAI',
    coinTo: 'ETH',
    initialAmmount: '4',
    exchangedAmmount: '0.0002',
    executedFrom: '11/06/2021',
    daysSet: '8 days',
  },
  {
    id: '4',
    coinFrom: 'ETH',
    coinTo: 'DAI',
    initialAmmount: '0.00001',
    exchangedAmmount: '2',
    executedFrom: '11/06/2021',
    daysSet: '8 days',
  },
  {
    id: '5',
    coinFrom: 'DAI',
    coinTo: 'EYH',
    initialAmmount: '2',
    exchangedAmmount: '0.05',
    executedFrom: '11/06/2021',
    daysSet: '8 days',
  },
  {
    id: '6',
    coinFrom: 'ETH',
    coinTo: 'DAI',
    initialAmmount: '0.04',
    exchangedAmmount: '2000',
    executedFrom: '11/06/2021',
    daysSet: '8 days',
  },
];

const History = () => (
  <Grid container alignItems="flex-start" justify="center" style={{ height: '100%' }}>
    <Grid xs={12}>
      <Typography variant="h3">
        <FormattedMessage description="Previous positions" defaultMessage="Your previous positions" />
      </Typography>
    </Grid>
    <Grid xs={12} style={{ height: 500 }}>
      <DataGrid rows={mockData} columns={COLUMNS} />
    </Grid>
  </Grid>
);
export default History;
