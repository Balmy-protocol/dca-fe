import React from 'react';
import Paper from '@material-ui/core/Paper';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Select from 'common/select';
import { SwapContextValue } from '../../SwapContext';

const StyledPaper = styled(Paper)`
  padding: 20px;
  max-width: 500px;
`;

const selectOptions = [
  {
    label: 'ETH',
    value: 'ETH',
  },
  {
    label: 'DAI',
    value: 'DAI',
  },
];

const Swap = ({ from, to, fromValue, toValue, setFrom, setTo, setFromValue, setToValue }: SwapContextValue) => {
  React.useEffect(() => {
    if (!from) {
      setFrom(selectOptions[0].label);
    }
    if (!to) {
      setTo(selectOptions[1].label);
    }
  }, []);
  return (
    <StyledPaper elevation={3}>
      <Grid container>
        <Grid container alignItems="center">
          <Grid xs={2}>
            <Select options={selectOptions} onChange={setFrom} selected={from} />
          </Grid>
          <Grid xs={10}>input</Grid>
        </Grid>
        <Grid container alignItems="center">
          <Grid xs={2}>
            <Select options={selectOptions} onChange={setTo} selected={to} />
          </Grid>
          <Grid xs={10}>input</Grid>
        </Grid>
      </Grid>
    </StyledPaper>
  );
};
export default Swap;
