import React from 'react';
import TokenAmount from '@common/components/token-amount';
import { generateEstimatedUserPosition, StrategyReturnPeriods } from '@common/utils/earn/parsing';
import ExpectedReturns from '@pages/strategy-guardian-detail/investment-data/components/expected-returns';
import { useTotalTokenBalance } from '@state/balances/hooks';
import { useEarnManagementState } from '@state/earn-management/hooks';
import { DisplayStrategy } from 'common-types';
import { FormattedMessage } from 'react-intl';
import { colors, ContainerBox, DividerBorder1, InfoCircleIcon, ShieldTickIcon, Tooltip, Typography } from 'ui-library';

const AvailableBalanceProjection = ({ strategy }: { strategy?: DisplayStrategy }) => {
  const { asset } = useEarnManagementState();
  const balance = useTotalTokenBalance(asset);

  const projectedPosition = React.useMemo(() => {
    if (!asset || !strategy) return null;
    return generateEstimatedUserPosition({ token: asset, owner: '0xowner', amount: balance, strategy });
  }, [asset, balance, strategy]);

  if (!asset || !projectedPosition || balance.amount === 0n) return null;
  return (
    <>
      <DividerBorder1 />
      <ContainerBox gap={8} flexWrap="wrap" justifyContent="space-between">
        <ContainerBox flexDirection="column" gap={1}>
          <Typography variant="bodyExtraSmall">
            <FormattedMessage
              description="earn.strategy-management.locked-deposit.available-balance"
              defaultMessage="Available Balance"
            />
          </Typography>
          <TokenAmount
            token={asset}
            amount={balance}
            showIcon
            iconSize={6}
            showSubtitle
            addEqualIcon
            amountTypographyVariant="bodySmallBold"
            usdPriceTypographyVariant="labelRegular"
          />
        </ContainerBox>
        <ContainerBox flexDirection="column" gap={2}>
          <ContainerBox gap={1} alignItems="center">
            <Typography variant="bodySmallBold">
              <FormattedMessage
                description="earn.strategy-management.locked-deposit.available-balance-projection"
                defaultMessage="What you could be generating on this strategy"
              />
            </Typography>
            <Tooltip
              title={
                <FormattedMessage
                  defaultMessage="This projection is based on the current market conditions and the expected performance of the strategy."
                  description="earn.strategy-management.locked-deposit.available-balance-projection-tooltip"
                />
              }
            >
              <ContainerBox>
                <InfoCircleIcon
                  sx={({ palette }) => ({
                    color: colors[palette.mode].typography.typo4,
                  })}
                  size="small"
                />
              </ContainerBox>
            </Tooltip>
          </ContainerBox>
          <ExpectedReturns
            hidePeriods={[StrategyReturnPeriods.DAY]}
            isFiat={false}
            userPositions={[projectedPosition]}
            isSimulated
            size="small"
          />
        </ContainerBox>
      </ContainerBox>
    </>
  );
};

const LockedDeposit = ({ strategy }: { strategy?: DisplayStrategy }) => {
  // TODO: get current tier level
  const currentTierLevel = 2;
  // TODO: get necessary tier level
  const necessaryTierLevel = 3;
  // TODO: get remaining percent
  const remainingPercent = 35;
  return (
    <ContainerBox flexDirection="column" gap={8}>
      <ContainerBox gap={6} alignItems="center">
        {/* TODO: Replace with correct icon */}
        <ShieldTickIcon sx={{ width: 60, height: 60 }} />
        <ContainerBox flexDirection="column" gap={1}>
          <Typography variant="h3Bold">
            <FormattedMessage
              description="earn.strategy-management.locked-deposit.title"
              defaultMessage="Reach Tier {necessaryTierLevel} to Unlock This Vault"
              values={{ necessaryTierLevel }}
            />
          </Typography>
          <Typography variant="h5Bold">
            <FormattedMessage
              description="earn.strategy-management.locked-deposit.subtitle"
              defaultMessage="{remainingPercent}% to Tier {necessaryTierLevel}"
              values={{ remainingPercent, necessaryTierLevel }}
            />
          </Typography>
        </ContainerBox>
      </ContainerBox>
      <ContainerBox flexDirection="column" gap={4}>
        {/* // TODO: Complete with the LEVEL UP component */}
        <Typography variant="bodySmallRegular" color={({ palette }) => colors[palette.mode].typography.typo2}>
          <FormattedMessage
            description="earn.strategy-management.locked-deposit.description"
            defaultMessage="This strategy is exclusively available for Tier {necessaryTierLevel} and above. You're currently at Tier {currentTierLevel}. <b>Meet the progression requirements below to access this vault and enjoy premium benefits.</b>"
            values={{ currentTierLevel, necessaryTierLevel, b: (chunks: React.ReactNode) => <b>{chunks}</b> }}
          />
        </Typography>
      </ContainerBox>
      <AvailableBalanceProjection strategy={strategy} />
    </ContainerBox>
  );
};

export default LockedDeposit;
