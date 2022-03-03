import React from 'react';
import Grid from '@material-ui/core/Grid';
import orderBy from 'lodash/orderBy';
import styled from 'styled-components';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import getPositions from 'graphql/getLeaderboardPosition.graphql';
import getTokens from 'graphql/getTokens.graphql';
import { FullPosition, Token } from 'types';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import useGqlFetchAll from 'hooks/useGqlFetchAll';
import useWeb3Service from 'hooks/useWeb3Service';
import { BigNumber } from 'ethers';
import { formatUnits } from '@ethersproject/units';
import { appleTabsStylesHook } from 'common/tabs';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { Duration } from 'luxon';
import Button from 'common/button';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { FormattedMessage } from 'react-intl';
import Leaderboard from '../leaderboard';

const StyledTitleContainer = styled(Paper)`
  ${({ theme }) => `
    padding: 25px;
    border-radius: 10px;
    flex-grow: 0;
    background-color: ${theme.palette.type === 'light' ? '#f6f6f6' : 'rgba(255, 255, 255, 0.12)'};
    border: 1px solid ${theme.palette.type === 'light' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.1)'};
  `}
`;

const toReadable = (time: number) => {
  const customDuration = Duration.fromMillis(time * 1000);
  const asYears = customDuration.as('years');
  const asWeeks = customDuration.as('weeks');
  const asDays = customDuration.as('days');
  const asHours = customDuration.as('hours');
  const asMinutes = customDuration.as('minutes');

  if (asYears >= 1) {
    return `${asYears.toFixed(2)} years`;
  }

  if (asWeeks >= 1) {
    return `${asWeeks.toFixed(2)} weeks`;
  }
  if (asWeeks >= 1) {
    return `${asWeeks.toFixed(2)} weeks`;
  }

  if (asDays >= 1) {
    return `${asDays.toFixed(2)} days`;
  }

  if (asHours >= 1) {
    return `${asHours.toFixed(2)} hours`;
  }

  return `${asMinutes.toFixed(2)} minutes`;
};

const messagesByLeaderboard = [
  <FormattedMessage
    description="leaderboard position"
    defaultMessage="Compete on who has the most positions on Mean Finance"
  />,
  <FormattedMessage
    description="leaderboard total value locked"
    defaultMessage="Compete on who has the most total value locked on Mean Finance. This includes both swapped and unswapped liquidity on your positions"
  />,
  <FormattedMessage
    description="leaderboard traded volume"
    defaultMessage="Compete on who has the most traded volume locked on Mean Finance. This includes swapped liquidity on your positions"
  />,
  <FormattedMessage
    description="leaderboard forgot"
    defaultMessage="Did you forget about your position? This are the addresses that have the most value to withdraw between their positions"
  />,
  <FormattedMessage
    description="leaderbord truedcaor"
    defaultMessage="The TRUE DCAOR is the one who's position has been set to run for the longest time"
  />,
];

const LeaderboardFrame = () => {
  const web3Service = useWeb3Service();

  const [tabIndex, setTabIndex] = React.useState(0);
  const tabsStyles = appleTabsStylesHook.useTabs();
  const tabItemStyles = appleTabsStylesHook.useTabItem();
  const [isLoadingTokenPrices, setIsLoadingTokenPrices] = React.useState(false);
  const [tokensByPrice, setTokensByPrice] = React.useState<Record<string, number>>({});
  const { loading: isLoadingPositions, data: positionsData } = useGqlFetchAll<{ positions: FullPosition[] }>(
    getPositions,
    {},
    'positions'
  );
  const { loading: isLoadingTokens, data: tokensData } = useGqlFetchAll<{ tokens: Token[] }>(getTokens, {}, 'tokens');

  React.useEffect(() => {
    const loadTokenPrices = async (tokens: Token[]) => {
      const tokenPrices = await Promise.all(tokens.map((token) => web3Service.getUsdPrice(token)));

      const reducedTokenPrices = tokenPrices.reduce<Record<string, number>>((acc, price, index) => {
        // eslint-disable-next-line no-param-reassign
        acc[tokens[index].address] = price;

        return acc;
      }, {});

      setTokensByPrice(reducedTokenPrices);
      setIsLoadingTokenPrices(false);
    };

    if (!isLoadingTokens && tokensData?.tokens && !isLoadingTokenPrices) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      loadTokenPrices(tokensData.tokens);
      setIsLoadingTokenPrices(true);
    }
  }, [isLoadingTokens, tokensData]);

  if (
    isLoadingPositions ||
    !positionsData ||
    !positionsData.positions ||
    isLoadingTokens ||
    !tokensData ||
    !tokensData.tokens ||
    isLoadingTokenPrices
  ) {
    return (
      <Grid container>
        <CenteredLoadingIndicator size={70} />
      </Grid>
    );
  }

  const { positions } = positionsData;

  const positionsPerUser = positions.reduce<Record<string, number>>((acc, position) => {
    if (!acc[position.user]) {
      // eslint-disable-next-line no-param-reassign
      acc[position.user] = 1;
    } else {
      // eslint-disable-next-line no-param-reassign
      acc[position.user] += 1;
    }

    return acc;
  }, {});

  const tvlPerUser = positions.reduce<Record<string, number>>((acc, position) => {
    if (!acc[position.user]) {
      // eslint-disable-next-line no-param-reassign
      acc[position.user] =
        parseFloat(formatUnits(BigNumber.from(position.current.remainingLiquidity), position.from.decimals)) *
          tokensByPrice[position.from.address] +
        parseFloat(formatUnits(BigNumber.from(position.totalSwapped), position.to.decimals)) *
          tokensByPrice[position.to.address];
    } else {
      // eslint-disable-next-line no-param-reassign
      acc[position.user] +=
        parseFloat(formatUnits(BigNumber.from(position.current.remainingLiquidity), position.from.decimals)) *
          tokensByPrice[position.from.address] +
        parseFloat(formatUnits(BigNumber.from(position.totalSwapped), position.to.decimals)) *
          tokensByPrice[position.to.address];
    }

    return acc;
  }, {});

  const tradedVolumePerUser = positions.reduce<Record<string, number>>((acc, position) => {
    if (!acc[position.user]) {
      // eslint-disable-next-line no-param-reassign
      acc[position.user] =
        parseFloat(formatUnits(BigNumber.from(position.totalSwapped), position.to.decimals)) *
        tokensByPrice[position.to.address];
    } else {
      // eslint-disable-next-line no-param-reassign
      acc[position.user] +=
        parseFloat(formatUnits(BigNumber.from(position.totalSwapped), position.to.decimals)) *
        tokensByPrice[position.to.address];
    }

    return acc;
  }, {});

  const toWithdrawPerUser = positions.reduce<Record<string, number>>((acc, position) => {
    if (!acc[position.user]) {
      // eslint-disable-next-line no-param-reassign
      acc[position.user] =
        parseFloat(formatUnits(BigNumber.from(position.current.idleSwapped), position.to.decimals)) *
        tokensByPrice[position.to.address];
    } else {
      // eslint-disable-next-line no-param-reassign
      acc[position.user] +=
        parseFloat(formatUnits(BigNumber.from(position.current.idleSwapped), position.to.decimals)) *
        tokensByPrice[position.to.address];
    }

    return acc;
  }, {});

  const mostTimePerUser = positions.reduce<Record<string, number>>((acc, position) => {
    if (!acc[position.user]) {
      // eslint-disable-next-line no-param-reassign
      acc[position.user] = BigNumber.from(position.totalSwaps)
        .mul(BigNumber.from(position.swapInterval.interval))
        .toNumber();
    } else {
      const newTime = BigNumber.from(position.totalSwaps)
        .mul(BigNumber.from(position.swapInterval.interval))
        .toNumber();
      if (newTime > acc[position.user]) {
        // eslint-disable-next-line no-param-reassign
        acc[position.user] = newTime;
      }
    }

    return acc;
  }, {});

  const orderedByPositions = orderBy(
    Object.keys(positionsPerUser).map((user) => ({
      name: user,
      display: `${positionsPerUser[user].toFixed(0)} positions`,
      value: positionsPerUser[user],
    })),
    'value',
    'desc'
  );
  const orderedByTvl = orderBy(
    Object.keys(tvlPerUser).map((user) => ({
      name: user,
      display: `$${tvlPerUser[user].toFixed(2)} USD`,
      value: tvlPerUser[user],
    })),
    'value',
    'desc'
  );
  const orderedByTradedVolume = orderBy(
    Object.keys(tradedVolumePerUser).map((user) => ({
      name: user,
      display: `$${tradedVolumePerUser[user].toFixed(2)} USD`,
      value: tradedVolumePerUser[user],
    })),
    'value',
    'desc'
  );
  const orderedByWithdraw = orderBy(
    Object.keys(toWithdrawPerUser).map((user) => ({
      name: user,
      display: `$${toWithdrawPerUser[user].toFixed(2)} USD`,
      value: toWithdrawPerUser[user],
    })),
    'value',
    'desc'
  );
  const orderedByTime = orderBy(
    Object.keys(mostTimePerUser).map((user) => ({
      name: user,
      display: toReadable(mostTimePerUser[user]),
      value: mostTimePerUser[user],
    })),
    'value',
    'desc'
  );

  const rows = [orderedByPositions, orderedByTvl, orderedByTradedVolume, orderedByWithdraw, orderedByTime];

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} style={{ paddingBottom: '0px', paddingTop: '0px' }}>
        <Button variant="text" color="default" onClick={() => window.open('https://mean.finance/')}>
          <Typography variant="body2" component="div" style={{ display: 'flex', alignItems: 'center' }}>
            <ArrowBackIcon fontSize="inherit" /> Back to app
          </Typography>
        </Button>
      </Grid>
      <Grid item xs={12} style={{ display: 'flex', paddingBottom: '15px', justifyContent: 'center' }}>
        <Tabs classes={tabsStyles} value={tabIndex} onChange={(e, index) => setTabIndex(index)}>
          <Tab classes={tabItemStyles} disableRipple label="Created positions" />
          <Tab classes={tabItemStyles} disableRipple label="Total value locked" />
          <Tab classes={tabItemStyles} disableRipple label="Traded volume" />
          <Tab classes={tabItemStyles} disableRipple label="I forgot about this leaderboard" />
          <Tab classes={tabItemStyles} disableRipple label="The true dcaoor" />
        </Tabs>
      </Grid>
      <Grid item xs={12}>
        <StyledTitleContainer elevation={0}>
          <Typography variant="body1">{messagesByLeaderboard[tabIndex]}</Typography>
        </StyledTitleContainer>
      </Grid>
      <Grid item xs={12}>
        <Leaderboard rows={rows[tabIndex]} />
      </Grid>
    </Grid>
  );
};
export default LeaderboardFrame;
