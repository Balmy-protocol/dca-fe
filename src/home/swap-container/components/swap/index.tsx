import React from 'react';
import Paper from '@material-ui/core/Paper';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Select from 'common/select';
import { SwapContextValue } from '../../SwapContext';
import { TokenList } from 'common/wallet-context';

const StyledPaper = styled(Paper)`
  padding: 20px;
  max-width: 500px;
`;

const selectOptions = [
  {
    label: 'ETH',
    value: '0x6b175474e89094c44da98b954eedeac495271d0f',
  },
  {
    label: 'DAI',
    value: 'DAI',
  },
];

interface SwapProps extends SwapContextValue {
  tokenList: TokenList;
}

const Swap = ({ from, to, fromValue, toValue, setFrom, setTo, setFromValue, setToValue, tokenList }: SwapProps) => {
  const mappedTokenList = React.useMemo(
    () =>
      tokenList.map((token) => ({
        ...token,
        value: token.address,
        label: token.symbol.toUpperCase(),
      })),
    [tokenList]
  );

  React.useEffect(() => {
    if (tokenList.length) {
      if (!from) {
        setFrom(mappedTokenList[0].address);
      }
      if (!to) {
        setTo(mappedTokenList[1].address);
      }
    }
  }, [tokenList]);
  return (
    <StyledPaper elevation={3}>
      <Grid container>
        <Grid container alignItems="center">
          <Grid item xs={2}>
            <Select options={mappedTokenList} onChange={setFrom} selected={from} />
          </Grid>
          <Grid item xs={10}>
            input
          </Grid>
        </Grid>
        <Grid container alignItems="center">
          <Grid item xs={2}>
            <Select options={mappedTokenList} onChange={setTo} selected={to} />
          </Grid>
          <Grid item xs={10}>
            input
          </Grid>
        </Grid>
      </Grid>
    </StyledPaper>
  );
};
export default Swap;
