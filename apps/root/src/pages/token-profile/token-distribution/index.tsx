import React from 'react';
import { Token, UserStatus } from '@types';
import {
  ContainerBox,
  Typography,
  ForegroundPaper,
  colors,
  CHART_COLOR_PRIORITIES,
  GraphIcon,
  Grid,
  BackgroundPaper,
  HiddenNumber,
  Skeleton,
  SPACING,
  ChartIcon,
} from 'ui-library';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import useUser from '@hooks/useUser';
import styled from 'styled-components';
import useNetWorth from '@hooks/useNetWorth';
import useIsLoggingUser from '@hooks/useIsLoggingUser';
import { useShowBalances, useThemeMode } from '@state/config/hooks';
import { Cell, Label, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { formatUsdAmount } from '@common/utils/currency';

const StyledNoWallet = styled(ContainerBox).attrs({
  flexDirection: 'column',
  gap: 6,
  justifyContent: 'center',
  alignItems: 'center',
})`
  height: 100%;
`;
interface TokenDistributionProps {
  token: Token;
}

const StyledNoWalletIconContainer = styled(ContainerBox)`
  ${({
    theme: {
      spacing,
      palette: { mode },
    },
  }) => `
    border-radius: 50%;
    border: 1px solid ${colors[mode].border.border1};
    backdrop-filter: blur(15.294119834899902px);
    padding: ${spacing(5)};
    box-shadow: 0px 20px 25px rgba(150, 140, 242, 0.25);
  `}
`;

const TokenDistributionNotConnected = () => {
  return (
    <StyledNoWallet>
      <ContainerBox flexDirection="column" gap={4} alignItems="center">
        <StyledNoWalletIconContainer>
          <ChartIcon fontSize="large" sx={({ palette: { mode } }) => ({ color: colors[mode].typography.typo3 })} />
        </StyledNoWalletIconContainer>
        <ContainerBox flexDirection="column" gap={2} alignItems="center">
          <Typography variant="h5Bold">
            <FormattedMessage
              description="token-profile.distribution.noData.title"
              defaultMessage="No Distribution Data Available"
            />
          </Typography>
          <Typography variant="bodyRegular" textAlign="center">
            <FormattedMessage
              description="token-profile.distribution.noData.description"
              defaultMessage="You'll see your holdings in DCA and Earn displayed here"
            />
          </Typography>
        </ContainerBox>
      </ContainerBox>
    </StyledNoWallet>
  );
};

const StyledContainer = styled(ForegroundPaper).attrs({ variant: 'outlined' })`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme: { spacing } }) => spacing(10)};
  padding: ${({ theme: { spacing } }) => spacing(6)};
  min-height: 100%;
`;

const StyledBackgroundPaper = styled(BackgroundPaper)`
  ${({ theme: { space, palette } }) => `
    padding: ${space.s05};
    border-color: ${colors[palette.mode].border.border2};
  `}
  display: flex;
  flex: 1;
`;

const StyledBullet = styled.div<{ fill: string }>`
  ${({ fill, theme: { spacing } }) => `
    width: ${spacing(2)};
    height: ${spacing(2)};
    border-radius: ${spacing(10)};
    ${fill && `background-color: ${fill};`}}
  `}
`;

const DATA_KEY_TO_LABEL: Record<
  keyof ReturnType<typeof useNetWorth>['assetsTotalValue'],
  ReturnType<typeof defineMessage>
> = {
  dca: defineMessage({ description: 'token-profile.distribution.dca', defaultMessage: 'Recurring Investments' }),
  wallet: defineMessage({ description: 'token-profile.distribution.wallet', defaultMessage: 'Spot' }),
  earn: defineMessage({ description: 'token-profile.distribution.earn', defaultMessage: 'Earn' }),
};

const TokenDistributionLabelsSkeleton = () => (
  <>
    <Grid container alignItems="center" columnSpacing={3}>
      <Grid item xs={1}>
        <Skeleton variant="circular" width={SPACING(2)} height={SPACING(2)} />
      </Grid>
      <Grid item xs={5}>
        <Typography variant="bodySmallSemibold">
          <Skeleton variant="text" width="3ch" />
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="bodySmallRegular">
          <Typography variant="bodySmallSemibold">
            <Skeleton variant="text" width="4ch" />
          </Typography>
        </Typography>
      </Grid>
    </Grid>
    <Grid container alignItems="center" columnSpacing={3}>
      <Grid item xs={1}>
        <Skeleton variant="circular" width={SPACING(2)} height={SPACING(2)} />
      </Grid>
      <Grid item xs={5}>
        <Typography variant="bodySmallSemibold">
          <Skeleton variant="text" width="3ch" />
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="bodySmallRegular">
          <Typography variant="bodySmallSemibold">
            <Skeleton variant="text" width="4ch" />
          </Typography>
        </Typography>
      </Grid>
    </Grid>
    <Grid container alignItems="center" columnSpacing={3}>
      <Grid item xs={1}>
        <Skeleton variant="circular" width={SPACING(2)} height={SPACING(2)} />
      </Grid>
      <Grid item xs={5}>
        <Typography variant="bodySmallSemibold">
          <Skeleton variant="text" width="3ch" />
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="bodySmallRegular">
          <Typography variant="bodySmallSemibold">
            <Skeleton variant="text" width="4ch" />
          </Typography>
        </Typography>
      </Grid>
    </Grid>
  </>
);

const DATA_KEYS_TO_SHOW = ['wallet', 'dca', 'earn'];
const TokenDistribution = ({ token }: TokenDistributionProps) => {
  const { assetsTotalValue, totalAssetValue, isLoadingAllBalances, isLoadingSomePrices } = useNetWorth({
    walletSelector: 'allWallets',
    tokens: token && [token],
  });
  const user = useUser();
  const intl = useIntl();
  const isLoggingUser = useIsLoggingUser();
  const showBalances = useShowBalances();
  const mode = useThemeMode();

  const isLoading = isLoadingAllBalances || isLoadingSomePrices;

  const mappedData = isLoading
    ? [
        {
          name: 'Loading',
          value: 100,
          label: 'Loading',
          fill: colors[mode].background.primary,
          relativeValue: 100,
        },
      ]
    : Object.entries(assetsTotalValue)
        .filter(([entryKey, balance]) => balance > 0 && DATA_KEYS_TO_SHOW.includes(entryKey))
        .map(([entryKey, balance], index) => ({
          name: entryKey,
          value: balance,
          label: intl.formatMessage(DATA_KEY_TO_LABEL[entryKey as keyof typeof DATA_KEY_TO_LABEL]),
          fill:
            CHART_COLOR_PRIORITIES[mode][index] ||
            CHART_COLOR_PRIORITIES[mode][CHART_COLOR_PRIORITIES[mode].length - 1],
          relativeValue: (balance * 100) / totalAssetValue,
        }));

  const isLoggdIn = user?.status === UserStatus.loggedIn || isLoggingUser;

  return (
    <StyledContainer>
      <ContainerBox gap={2} alignItems="center">
        <GraphIcon sx={{ color: colors[mode].typography.typo2 }} />
        <Typography variant="h5Bold">
          <FormattedMessage description="token-profile.distribution.wallet" defaultMessage="Token Distribution" />
        </Typography>
      </ContainerBox>
      {isLoggdIn ? (
        <>
          <ResponsiveContainer minHeight={210} minWidth={210} height="100%">
            <PieChart height={210} width={210}>
              <Pie
                data={mappedData}
                dataKey="value"
                innerRadius={90}
                paddingAngle={1}
                outerRadius={100}
                height={210}
                width={210}
                cursor="pointer"
                fill={colors[mode].violet.violet200}
              >
                {mappedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                ))}
                <Label
                  value={showBalances && !isLoading ? `$${formatUsdAmount({ amount: totalAssetValue, intl })}` : '-'}
                  position="center"
                  fontSize="1rem"
                  fontWeight={700}
                  fontFamily="Inter"
                  color={colors[mode].typography.typo2}
                  fill={colors[mode].typography.typo2}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <StyledBackgroundPaper variant="outlined">
            <ContainerBox flexDirection="column" alignSelf="stretch" flex={1} justifyContent="space-around">
              {isLoading ? (
                <TokenDistributionLabelsSkeleton />
              ) : (
                mappedData.map((dataPoint) => (
                  <Grid container alignItems="center" key={dataPoint.name} columnSpacing={3}>
                    <Grid item xs={1}>
                      <StyledBullet fill={dataPoint.fill} />
                    </Grid>
                    <Grid item xs={5} overflow="hidden" textOverflow="ellipsis">
                      <Typography variant="bodySmallSemibold" noWrap>
                        {dataPoint.label}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} display="flex" gap={0.5} justifyContent="end">
                      <Typography variant="bodySmallSemibold">{dataPoint.relativeValue.toFixed(0)}%</Typography>
                      <Typography variant="bodySmallRegular">
                        {showBalances ? (
                          `($${formatUsdAmount({ amount: dataPoint.value, intl })})`
                        ) : (
                          <HiddenNumber size="small" />
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                ))
              )}
            </ContainerBox>
          </StyledBackgroundPaper>
        </>
      ) : (
        <TokenDistributionNotConnected />
      )}
    </StyledContainer>
  );
};

export default TokenDistribution;
