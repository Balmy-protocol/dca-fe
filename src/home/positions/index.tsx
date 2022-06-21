import React from 'react';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import styled from 'styled-components';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import { useOpenClosePositionTab } from 'state/tabs/hooks';
import { useAppDispatch } from 'state/hooks';
import { changeOpenClosePositionTab } from 'state/tabs/actions';
import { withStyles } from '@mui/styles';
import { createStyles } from '@mui/material/styles';
import useCurrentPositions from 'hooks/useCurrentPositions';
import { BigNumber } from 'ethers';
import { Token } from 'types';
import useWeb3Service from 'hooks/useWeb3Service';
import { formatUnits } from '@ethersproject/units';
import Button from 'common/button';
import History from '../history';
import CurrentPositions from '../current-positions';

const StyledWithdrawNumber = styled.div<{ amount: string; withMargin?: boolean }>`
  @property --num {
    syntax: '<integer>';
    initial-value: 0;
    inherits: false;
  }

  transition: --num 5s;
  counter-set: num var(--num);
  --num: ${(props) => props.amount};

  ${(props) => (props.withMargin ? 'margin-right: 5px;' : '')};

  display: inline-flex;

  &:after {
    content: counter(num);
  }
`;

const StyledToWithdrawContainer = styled(Grid)`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 10px;
  gap: 10px;
`;

const StyledTab = withStyles(() =>
  createStyles({
    root: {
      textTransform: 'none',
      overflow: 'visible',
      padding: '5px',
      color: 'rgba(255,255,255,0.5)',
    },
    selected: {
      color: '#FFFFFF !important',
      fontWeight: '500',
    },
  })
)(Tab);

const StyledTabs = withStyles(() =>
  createStyles({
    root: {
      overflow: 'visible',
    },
    scroller: {
      overflow: 'visible !important',
    },
    indicator: {
      background: '#3076F6',
    },
  })
)(Tabs);

const StyledPaper = styled(Paper)`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  flex-grow: 1;
  background-color: rgba(216, 216, 216, 0.05);
  backdrop-filter: blur(6px);
`;

const Positions = () => {
  const tabIndex = useOpenClosePositionTab();
  const dispatch = useAppDispatch();
  const web3Service = useWeb3Service();
  const currentPositions = useCurrentPositions();
  const [withdrawAmount, setWithdrawAmount] = React.useState<{
    usdValue: number;
    breakdown: Record<string, { token: Token; amount: BigNumber }>;
    isLoading: boolean;
    hasLoaded: boolean;
  }>({ usdValue: 0, breakdown: {}, isLoading: false, hasLoaded: false });

  React.useEffect(() => {
    const fetchWithdrawUsdValue = async () => {
      if (!currentPositions || !currentPositions.length) {
        return;
      }

      const breakdown = currentPositions.reduce<Record<string, { token: Token; amount: BigNumber }>>(
        (acc, { to, toWithdraw }) => {
          if (toWithdraw.lte(BigNumber.from(0))) {
            return acc;
          }

          const newAcc = {
            ...acc,
          };

          if (!newAcc[to.address]) {
            newAcc[to.address] = {
              token: to,
              amount: toWithdraw,
            };
          } else {
            newAcc[to.address] = {
              ...newAcc[to.address],
              amount: newAcc[to.address].amount.add(toWithdraw),
            };
          }

          return newAcc;
        },
        {}
      );

      const tokens = Object.keys(breakdown).map((tokenAddress) => breakdown[tokenAddress].token);

      const tokenPrices = await web3Service.getUsdHistoricPrice(tokens);

      const usdValue = tokenPrices.reduce((acc, tokenPrice, index) => {
        const token = tokens[index];
        const { amount } = breakdown[token.address];

        const multiplied = amount.mul(tokenPrice);
        return acc + parseFloat(formatUnits(multiplied, token.decimals + 18));
      }, 0);

      setWithdrawAmount({ hasLoaded: true, isLoading: false, breakdown, usdValue: parseFloat(usdValue.toFixed(2)) });
    };

    if (!withdrawAmount.hasLoaded && !withdrawAmount.isLoading) {
      setWithdrawAmount({ ...withdrawAmount, isLoading: true });
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchWithdrawUsdValue();
    }
  }, [JSON.stringify(currentPositions), withdrawAmount]);

  return (
    <>
      <Grid item xs={12} style={{ display: 'flex', flexDirection: 'column', marginBottom: '24px' }}>
        <Typography variant="h4">
          <FormattedMessage description="positions title" defaultMessage="Your positions" />
        </Typography>
        <Typography variant="body1">
          <FormattedMessage
            description="positions description"
            defaultMessage="Here you will see the details of your open positions and be able to see further details about them"
          />
        </Typography>
      </Grid>
      <Grid item xs={12} style={{ display: 'flex', paddingTop: '0px' }}>
        <Grid container>
          <StyledToWithdrawContainer item xs={12}>
            <Typography variant="h5">
              <StyledWithdrawNumber amount={withdrawAmount.usdValue.toString().split('.')[0]} />
              .
              <StyledWithdrawNumber amount={withdrawAmount.usdValue.toString().split('.')[1]} withMargin />
              <FormattedMessage description="toWithdraw" defaultMessage=" USD available to withdraw" />
            </Typography>
            <Button variant="contained" color="secondary">
              <Typography variant="body1">
                <FormattedMessage description="withdrawAll" defaultMessage="Withdraw all" />
              </Typography>
            </Button>
          </StyledToWithdrawContainer>
          <Grid item xs={12} style={{ display: 'flex', paddingBottom: '15px' }}>
            <StyledTabs
              value={tabIndex}
              onChange={(e, index) => dispatch(changeOpenClosePositionTab(index))}
              TabIndicatorProps={{ style: { bottom: '8px' } }}
            >
              <StyledTab
                disableRipple
                label={
                  <Typography variant="h6">
                    <FormattedMessage description="openPositions" defaultMessage="Open positions" />
                  </Typography>
                }
              />
              <StyledTab
                disableRipple
                sx={{ marginLeft: '32px' }}
                label={
                  <Typography variant="h6">
                    <FormattedMessage description="terminatedPositions" defaultMessage="Terminated positions" />
                  </Typography>
                }
              />
            </StyledTabs>
          </Grid>
          <Grid item xs={12}>
            <StyledPaper variant="outlined">{tabIndex === 0 ? <CurrentPositions /> : <History />}</StyledPaper>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
export default Positions;
