import React from 'react';
import { BALMY_FEES, FEE_TYPE_STRING_MAP } from '@constants/earn';
import { AmountsOfToken, DisplayStrategy, EarnPosition, StrategyGuardian, Token } from 'common-types';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  ContainerBox,
  Grid,
  InfoCircleIcon,
  Skeleton,
  Tooltip,
  Typography,
  colors,
} from 'ui-library';
import { FormattedMessage, IntlShape, useIntl } from 'react-intl';
import DataHistoricalRate from '../data-historical-rate';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import { calculateUserStrategiesBalances } from '@common/utils/earn/parsing';
import TokenIcon from '@common/components/token-icon';
import { formatCurrencyAmount, formatUsdAmount } from '@common/utils/currency';

interface DataAboutProps {
  strategy?: DisplayStrategy;
  collapsed: boolean;
}

const FeeItem = ({ fee, intl }: { fee: StrategyGuardian['fees'][number]; intl: IntlShape }) => (
  <ContainerBox gap={2} alignItems="center">
    <Skeleton variant="circular" width={18} animation={false} />
    <Typography variant="bodySmallRegular" color={({ palette: { mode } }) => colors[mode].typography.typo3}>
      {intl.formatMessage(FEE_TYPE_STRING_MAP[fee.type])}:
    </Typography>
    <Typography variant="bodySmallRegular" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
      {fee.percentage}%
    </Typography>
  </ContainerBox>
);

const BalanceItem = ({ balance, token, intl }: { balance: AmountsOfToken; token: Token; intl: IntlShape }) => (
  <ContainerBox gap={2} alignItems="center">
    <TokenIcon token={token} size={6} withShadow />
    <Typography variant="bodySmallBold" color={({ palette }) => colors[palette.mode].typography.typo2}>
      {formatCurrencyAmount({
        amount: balance.amount,
        token,
        intl,
      })}{' '}
      {token.symbol} ($
      {formatUsdAmount({
        intl,
        amount: balance.amountInUSD,
      })}
      )
    </Typography>
  </ContainerBox>
);

const SKELETON_ROWS = Array.from(Array(3).keys());

const RewardsContainer = ({
  isLoading,
  asset,
  rewards,
}: {
  isLoading: boolean;
  asset?: Token;
  rewards?: { tokens: Token[]; apy: number };
}) => (
  <ContainerBox flexDirection="column" gap={2}>
    <Typography variant="h5Bold">
      {isLoading ? (
        <Skeleton variant="text" width="6ch" />
      ) : (
        <FormattedMessage defaultMessage="Rewards" description="earn.strategy-details.vault-about.rewards" />
      )}
    </Typography>
    <Typography variant="bodySmallRegular">
      {isLoading ? (
        <Skeleton variant="text" width="20ch" />
      ) : (
        <FormattedMessage
          description="earn.strategy-details.vault-about.rewards-description"
          defaultMessage="For each {asset} deposited, you will earn {apy}% APY in {rewards}."
          values={{
            asset: asset?.symbol,
            apy: rewards?.apy,
            rewards: rewards?.tokens.map((token) => token.symbol).join(', '),
          }}
        />
      )}
    </Typography>
    <ComposedTokenIcon size={8} tokens={rewards?.tokens} isLoading={isLoading} />
  </ContainerBox>
);

const BalancesContainer = ({
  intl,
  asset,
  userPositions,
  rewards,
}: {
  asset?: Token;
  userPositions?: EarnPosition[];
  rewards?: { tokens: Token[]; apy: number };
  intl: IntlShape;
}) => {
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
          <FormattedMessage
            description="earn.strategy-details.vault-about.rewards-description"
            defaultMessage="For each {asset} deposited, you will earn {apy}% APY in {rewards}."
            values={{
              asset: asset?.symbol,
              apy: rewards?.apy,
              rewards: rewards?.tokens.map((token) => token.symbol).join(', '),
            }}
          />
        </Typography>
      </ContainerBox>
      {assetBalance && (
        <ContainerBox flexDirection="column" gap={1}>
          <Typography variant="bodySmallRegular">
            <FormattedMessage
              defaultMessage="Base Token"
              description="earn.strategy-details.vault-about.balances.asset"
            />
          </Typography>
          <BalanceItem balance={assetBalance.amount} token={assetBalance.token} intl={intl} />
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
          <ContainerBox gap={4}>
            {rewardsBalances.map((balance) => (
              <BalanceItem key={balance.token.address} balance={balance.amount} token={balance.token} intl={intl} />
            ))}
          </ContainerBox>
        </ContainerBox>
      )}
    </ContainerBox>
  );
};

const DataAboutCollapsed = ({
  title,
  content,
  isLoading,
  expand,
}: {
  title: React.ReactNode;
  content?: React.ReactNode;
  isLoading?: boolean;
  expand?: boolean;
}) => (
  <Accordion disableGutters sx={{ padding: ({ spacing }) => spacing(4), ...(expand ? { flex: 1 } : {}) }}>
    <AccordionSummary>
      <Typography variant="h5Bold">{title}</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Typography variant="bodySmallRegular">
        {isLoading ? SKELETON_ROWS.map((index) => <Skeleton key={index} variant="text" width="20ch" />) : content}
      </Typography>
    </AccordionDetails>
  </Accordion>
);

const FeeContainer = ({
  title,
  explanation,
  isLoading,
  expand,
  fees,
  intl,
}: {
  title: React.ReactNode;
  explanation?: React.ReactNode;
  isLoading?: boolean;
  expand?: boolean;
  fees?: StrategyGuardian['fees'];
  intl: IntlShape;
}) => (
  <ContainerBox flexDirection="column" {...(expand ? { flex: 1 } : {})} gap={3}>
    <Typography variant="bodySemibold" display="flex" alignItems="center" gap={1}>
      {title}
      {explanation && (
        <Tooltip title={explanation}>
          <ContainerBox>
            <InfoCircleIcon fontSize="small" />
          </ContainerBox>
        </Tooltip>
      )}
    </Typography>
    <Grid container spacing={3}>
      {isLoading
        ? SKELETON_ROWS.map((index) => (
            <Grid key={index} item xs={6}>
              <Skeleton key={index} variant="text" width="6ch" />
            </Grid>
          ))
        : fees?.map((fee) => (
            <Grid key={fee.type} item xs={6}>
              <FeeItem fee={fee} intl={intl} />
            </Grid>
          ))}
    </Grid>
  </ContainerBox>
);

const DataAbout = ({ strategy }: DataAboutProps) => {
  const intl = useIntl();
  const isLoading = !strategy;

  const hasInvestment = !!strategy?.userPositions?.length;

  return (
    <Grid container rowSpacing={6}>
      <Grid item xs={12}>
        {!isLoading && hasInvestment ? (
          <BalancesContainer
            asset={strategy?.asset}
            rewards={strategy?.rewards}
            userPositions={strategy?.userPositions}
            intl={intl}
          />
        ) : (
          <RewardsContainer isLoading={isLoading} asset={strategy?.asset} rewards={strategy?.rewards} />
        )}
      </Grid>
      <Grid item xs={12}>
        <ContainerBox flexDirection="column" gap={3}>
          <DataAboutCollapsed
            title={
              <FormattedMessage
                defaultMessage="Vault Info"
                description="earn.strategy-details.vault-about.vault-info"
              />
            }
            content={strategy?.farm.name}
            isLoading={isLoading}
          />
          <DataAboutCollapsed
            title={
              <FormattedMessage
                defaultMessage="Historical Rate"
                description="earn.strategy-details.vault-about.historical-rate"
              />
            }
            content={<DataHistoricalRate strategy={strategy} />}
            isLoading={isLoading}
          />
        </ContainerBox>
      </Grid>
      <Grid item xs={12}>
        <ContainerBox gap={10}>
          <FeeContainer
            expand
            title={
              <FormattedMessage
                defaultMessage="Guardian Fees"
                description="earn.strategy-details.vault-about.guardian-fee"
              />
            }
            explanation={
              <FormattedMessage
                defaultMessage="These fees are set by the strategy's guardian and are paid to them."
                description="earn.strategy-details.vault-about.guardian-fee-tooltip"
              />
            }
            intl={intl}
            fees={strategy?.guardian?.fees}
            isLoading={isLoading}
          />
          <FeeContainer
            title={
              <FormattedMessage defaultMessage="Balmy fees" description="earn.strategy-details.vault-about.balmy-fee" />
            }
            isLoading={isLoading}
            intl={intl}
            fees={BALMY_FEES}
          />
        </ContainerBox>
      </Grid>
    </Grid>
  );
};

export default DataAbout;
