import React from 'react';
import { Grid } from 'ui-library';
import TransferForm from './components/transfer-form';

const TransferContainer = () => {
  return (
    <Grid container justifyContent="space-around">
      <Grid item xs={12} sm={8} md={5}>
        <TransferForm />
      </Grid>
    </Grid>
  );
};

export default TransferContainer;
