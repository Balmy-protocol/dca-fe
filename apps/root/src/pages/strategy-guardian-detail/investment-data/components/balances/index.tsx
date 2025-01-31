import React from 'react';
import { calculateUserStrategiesBalances } from '@common/utils/earn/parsing';
import { FormattedMessage, IntlShape, useIntl } from 'react-intl';
import { AmountsOfToken, EarnPosition, Token } from 'common-types';
import { colors, ContainerBox, HiddenNumber, Typography } from 'ui-library';
import { formatUsdAmount, formatCurrencyAmount } from '@common/utils/currency';
import TokenIcon from '@common/components/token-icon';
import { useShowBalances } from '@state/config/hooks';

const BalanceItem = ({
  balance,
  token,
  intl,
  showBalances,
}: {
  balance: AmountsOfToken;
  token: Token;
  intl: IntlShape;
  showBalances: boolean;
}) => (
  <ContainerBox gap={2} alignItems="center">
    <TokenIcon token={token} size={6} withShadow />
    <Typography variant="bodySmallBold" color={({ palette }) => colors[palette.mode].typography.typo2}>
      {showBalances ? (
        `${formatCurrencyAmount({
          amount: balance.amount,
          token,
          intl,
        })} ${token.symbol}`
      ) : (
        <HiddenNumber size="small" />
      )}
    </Typography>
    {showBalances && (
      <Typography variant="bodySmallBold" color={({ palette }) => colors[palette.mode].typography.typo4}>
        ($
        {formatUsdAmount({
          intl,
          amount: balance.amountInUSD,
        })}
        )
      </Typography>
    )}
  </ContainerBox>
);

const BalancesContainer = ({
  asset,
  userPositions,
  rewards,
}: {
  asset?: Token;
  userPositions?: EarnPosition[];
  rewards?: { tokens: Token[]; apy: number };
}) => {
  const intl = useIntl();
  const showBalances = useShowBalances();
  const strategyWithRewards = rewards && rewards.tokens.length > 0;
  const { assetBalance, rewardsBalances } = React.useMemo(() => {
    if (!asset) return {};
    const mergedBalances = calculateUserStrategiesBalances(userPositions);
    const mergedAssetBalance = mergedBalances.find((balance) => balance.token.address === asset.address);
    const mergedRewardsBalances = mergedBalances.filter((balance) => balance.token.address !== asset.address);
    return {
      assetBalance: mergedAssetBalance,
      rewardsBalances: mergedRewardsBalances,
    };
  }, [userPositions, asset]);

  return (
    <ContainerBox flexDirection="column" gap={3}>
      <ContainerBox flexDirection="column" gap={2}>
        <Typography variant="h5Bold">
          <FormattedMessage defaultMessage="Balances" description="earn.strategy-details.vault-about.balances" />
        </Typography>
        <Typography variant="bodySmallRegular">
          {strategyWithRewards ? (
            <FormattedMessage
              description="earn.strategy-details.vault-about.balances-description.with-rewards"
              defaultMessage="Your total {asset} balance and current rewards in this vault."
              values={{
                asset: asset?.symbol,
              }}
            />
          ) : (
            <FormattedMessage
              description="earn.strategy-details.vault-about.balances-description"
              defaultMessage="Your total {asset} balance in this vault."
              values={{
                asset: asset?.symbol,
              }}
            />
          )}
        </Typography>
      </ContainerBox>
      <ContainerBox gap={4} flexWrap="wrap">
        {assetBalance && (
          <ContainerBox flexDirection="column" gap={1}>
            <Typography variant="bodySmallRegular">
              <FormattedMessage
                defaultMessage="Base Token"
                description="earn.strategy-details.vault-about.balances.asset"
              />
            </Typography>
            <BalanceItem
              showBalances={showBalances}
              balance={assetBalance.amount}
              token={assetBalance.token}
              intl={intl}
            />
          </ContainerBox>
        )}
        {!!rewardsBalances?.length && (
          <ContainerBox flexDirection="column" gap={1}>
            <Typography variant="bodySmallRegular">
              <FormattedMessage
                defaultMessage="Rewards"
                description="earn.strategy-details.vault-about.balances.rewards"
              />
            </Typography>
            <ContainerBox gap={4} flexWrap="wrap">
              {rewardsBalances.map((balance) => (
                <BalanceItem
                  showBalances={showBalances}
                  key={balance.token.address}
                  balance={balance.amount}
                  token={balance.token}
                  intl={intl}
                />
              ))}
            </ContainerBox>
          </ContainerBox>
        )}
      </ContainerBox>
    </ContainerBox>
  );
};

export default BalancesContainer;
