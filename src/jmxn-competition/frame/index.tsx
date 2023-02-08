import React from 'react';
import Grid from '@mui/material/Grid';
import styled from 'styled-components';
import orderBy from 'lodash/orderBy';
import Button from 'common/button';
import CenteredLoadingIndicator from 'common/centered-loading-indicator';
import useCurrentBreakpoint from 'hooks/useCurrentBreakpoint';
import useGqlFetchAll from 'hooks/useGqlFetchAll';
import useDCAGraphql from 'hooks/useDCAGraphql';
import { FullPosition, Token } from 'types';
import { NETWORKS, POSITION_VERSION_4 } from 'config';
import { BigNumber } from 'ethers';
import { getDisplayToken } from 'utils/parsing';
import useRawUsdPrices from 'hooks/useUsdRawPrices';
import { parseUsdPrice, toToken } from 'utils/currency';
import useUnderlyingAmount from 'hooks/useUnderlyingAmount';
import { CREATED_AT_STOP, JMXN_CUTOFF, JMXN_ADDRESS, JMXN_TOKEN, CREATED_AT_START } from 'jmxn-competition/constants';
import { Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import useYieldOptions from 'hooks/useYieldOptions';
import { useHistory } from 'react-router-dom';
import { changeMainTab } from 'state/tabs/actions';
import { useAppDispatch } from 'state/hooks';
import LeaderboardSummary from '../leaderboard';
import getPositions from '../graphql/getPositions.graphql';

const StyledGrid = styled(Grid)<{ isSmall?: boolean }>`
  ${({ isSmall }) => isSmall && 'padding-top: 28px !important;'}
`;

interface UserCompPositions {
  user: string;
  generatedUsd: number;
  totalDepositedUsd: number;
  totalDeposited: BigNumber;
  generated: { token: Token; amount: BigNumber }[];
  positions: FullPosition[];
}

const HomeFrame = () => {
  const currentBreakPoint = useCurrentBreakpoint();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const client = useDCAGraphql(Number(NETWORKS.polygon.chainId), POSITION_VERSION_4);
  const {
    loading: isLoadingPositions,
    data,
    // refetch,
  } = useGqlFetchAll<{ positions: FullPosition[] }>(
    client,
    getPositions,
    {
      createdAtStart: CREATED_AT_START.toString(),
      createdAtStop: CREATED_AT_STOP.toString(),
    },
    'positions'
  );

  const onCreatePosition = () => {
    dispatch(changeMainTab(0));
    history.push('/create/137/0xbd1fe73e1f12bd2bc237de9b626f056f21f86427/');
  };

  const [yieldOptions, isLoadingYieldOptions] = useYieldOptions(NETWORKS.polygon.chainId);

  const positions = React.useMemo(() => data?.positions || [], [data]);

  const positionsByUser = React.useMemo(
    () =>
      positions.reduce<Record<string, FullPosition[]>>((acc, position) => {
        const newAcc = {
          ...acc,
        };

        if (newAcc[position.user]) {
          newAcc[position.user] = [...newAcc[position.user], position];
        } else {
          newAcc[position.user] = [position];
        }

        return newAcc;
      }, {}),
    [positions]
  );

  const filteredPositions = React.useMemo(
    () =>
      Object.values(positionsByUser).reduce<Record<string, FullPosition[]>>((acc, userPositions) => {
        const newAcc = {
          ...acc,
        };

        const { user } = userPositions[0];

        let isOverCutoff = false;

        const unmodifiedPositions = userPositions.filter((position) => !position.history.length);

        const totalDeposited = unmodifiedPositions.reduce<BigNumber>(
          (jmxnAcc, position) => jmxnAcc.add(BigNumber.from(position.totalDeposited)),
          BigNumber.from(0)
        );

        if (totalDeposited.gt(JMXN_CUTOFF)) {
          isOverCutoff = true;
        }

        if (!isOverCutoff && unmodifiedPositions.length) {
          newAcc[user] = unmodifiedPositions;
        }

        return newAcc;
      }, {}),
    [positionsByUser]
  );

  const tokensToFetchPrice = React.useMemo(
    () =>
      Object.values(filteredPositions).reduce<Record<string, Token>>(
        (acc, userPositions) => {
          const tokensOfPositions = userPositions.reduce<Record<string, Token>>((tokensAcc, position) => {
            const displayedToken = getDisplayToken(position.to, Number(NETWORKS.polygon.chainId));

            return {
              ...tokensAcc,
              [displayedToken.address.toLowerCase()]: displayedToken,
            };
          }, {});

          return {
            ...acc,
            ...tokensOfPositions,
          };
        },
        { [JMXN_ADDRESS]: toToken({ address: JMXN_ADDRESS, chainId: NETWORKS.polygon.chainId }) }
      ),
    [filteredPositions]
  );

  const tokensToFetchUnderlying = React.useMemo(
    () =>
      Object.values(filteredPositions).reduce<Record<string, Token>>((acc, userPositions) => {
        const tokensOfPositions = userPositions.reduce<Record<string, Token>>((tokensAcc, position) => {
          if (position.to.type === 'YIELD_BEARING_SHARE') {
            return {
              ...tokensAcc,
              [position.to.address.toLowerCase()]: getDisplayToken(position.to, Number(NETWORKS.polygon.chainId)),
            };
          }

          return tokensAcc;
        }, {});

        return {
          ...acc,
          ...tokensOfPositions,
        };
      }, {}),
    [filteredPositions]
  );

  const [prices, isLoadingPrices] = useRawUsdPrices(
    [...Object.values(tokensToFetchPrice), JMXN_TOKEN],
    undefined,
    NETWORKS.polygon.chainId
  );
  const [underlyings, isLoadingUnderlyings] = useUnderlyingAmount(
    Object.values(tokensToFetchUnderlying).map((token) => ({ token, amount: BigNumber.from(1) }))
  );

  const underlyingRates = React.useMemo(
    () =>
      Object.values(tokensToFetchUnderlying).reduce<Record<string, BigNumber>>(
        (acc, token, index) => ({
          ...acc,
          [token.address]: underlyings[index],
        }),
        {}
      ),
    [underlyings, tokensToFetchUnderlying]
  );

  const mappedUsers = React.useMemo(
    () =>
      orderBy(
        Object.values(
          Object.keys(filteredPositions).reduce<Record<string, UserCompPositions>>((acc, user) => {
            const newAcc = {
              ...acc,
            };

            const userPositions = filteredPositions[user].map((position) => ({
              ...position,
              totalSwapped:
                position.to.type === 'YIELD_BEARING_SHARE' && underlyingRates[position.to.address]
                  ? BigNumber.from(position.totalSwapped).mul(underlyingRates[position.to.address]).toString()
                  : position.totalSwapped,
            }));

            const totalDeposited = userPositions.reduce(
              (totalDepositAcc, position) => totalDepositAcc.add(BigNumber.from(position.totalDeposited)),
              BigNumber.from(0)
            );

            const generated = Object.values(
              userPositions.reduce<Record<string, { token: Token; amount: BigNumber }>>((generatedAcc, position) => {
                const newGeneratedAcc = {
                  ...generatedAcc,
                };

                const displayedToken = getDisplayToken(position.to, Number(NETWORKS.polygon.chainId));

                let generatedByPosition = BigNumber.from(0);

                if (position.to.type === 'YIELD_BEARING_SHARE' && underlyingRates[position.to.address]) {
                  generatedByPosition = BigNumber.from(position.totalSwapped).mul(underlyingRates[position.to.address]);
                } else {
                  generatedByPosition = BigNumber.from(position.totalSwapped);
                }

                if (newGeneratedAcc[displayedToken.address]) {
                  newGeneratedAcc[displayedToken.address].amount =
                    newGeneratedAcc[displayedToken.address].amount.add(generatedByPosition);
                } else {
                  newGeneratedAcc[displayedToken.address] = { token: displayedToken, amount: generatedByPosition };
                }

                return newGeneratedAcc;
              }, {})
            );

            const jmxnInUsd = (prices && prices[JMXN_ADDRESS]) || BigNumber.from(1);

            const generatedUsd =
              (prices &&
                generated.reduce(
                  (generatedUsdAcc, { token, amount }) =>
                    prices[token.address]
                      ? generatedUsdAcc +
                        parseUsdPrice(
                          token,
                          amount,
                          prices[token.address].mul(BigNumber.from(10).pow(18)).div(jmxnInUsd),
                          false
                        )
                      : generatedUsdAcc,
                  0
                )) ||
              0;
            const totalDepositedUsd =
              (prices &&
                parseUsdPrice(
                  toToken({ address: JMXN_ADDRESS, chainId: NETWORKS.polygon.chainId }),
                  totalDeposited,
                  prices[JMXN_ADDRESS]
                )) ||
              0;

            newAcc[user] = {
              user,
              totalDeposited,
              totalDepositedUsd,
              generated,
              generatedUsd,
              positions: userPositions,
            };

            return newAcc;
          }, {})
        ),
        ['generatedUsd'],
        ['desc']
      ),
    [filteredPositions, prices, underlyingRates]
  );

  const isLoading = isLoadingPositions || isLoadingPrices || isLoadingUnderlyings || isLoadingYieldOptions;

  return (
    <Grid container spacing={1} alignItems={isLoading ? 'center' : 'flex-start'}>
      {isLoading ? (
        <StyledGrid item xs={12} style={{ display: 'flex' }} isSmall={currentBreakPoint === 'xs'}>
          <CenteredLoadingIndicator size={70} />
        </StyledGrid>
      ) : (
        <StyledGrid item xs={12} style={{ display: 'flex' }} isSmall={currentBreakPoint === 'xs'}>
          <Grid container spacing={3}>
            <Grid xs={12}>
              <Typography variant="h4" sx={{ textAlign: 'center', marginBottom: '10px' }}>
                <FormattedMessage description="jmxnUserCompTitle" defaultMessage="jMXN Competition" />
              </Typography>
            </Grid>
            <Grid xs={12}>
              <Typography variant="h6" sx={{ textAlign: 'center', marginBottom: '10px' }}>
                <FormattedMessage
                  description="jmxnUserCompTitleDesc"
                  defaultMessage="Start investing with JMXN and win amazing prices!"
                />
              </Typography>
            </Grid>
            <Grid xs={12} sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <Button variant="contained" color="secondary" onClick={onCreatePosition}>
                <FormattedMessage
                  description="jmxnUserCompTitleCallToAction"
                  defaultMessage="Create position and start competing"
                />
              </Button>
            </Grid>
            <Grid xs={12}>
              <LeaderboardSummary userPositions={mappedUsers} prices={prices} yieldOptions={yieldOptions} />
            </Grid>
          </Grid>
        </StyledGrid>
      )}
    </Grid>
  );
};
export default HomeFrame;
