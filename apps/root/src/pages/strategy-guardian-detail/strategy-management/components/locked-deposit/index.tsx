import React from 'react';
import TokenAmount from '@common/components/token-amount';
import { generateEstimatedUserPosition, StrategyReturnPeriods } from '@common/utils/earn/parsing';
import ExpectedReturns from '@pages/strategy-guardian-detail/investment-data/components/expected-returns';
import { useTotalTokenBalance } from '@state/balances/hooks';
import { useEarnManagementState } from '@state/earn-management/hooks';
import { DisplayStrategy } from 'common-types';
import { FormattedMessage } from 'react-intl';
import {
  ActiveTiersIcons,
  colors,
  ContainerBox,
  DividerBorder1,
  InfoCircleIcon,
  Tooltip,
  Typography,
} from 'ui-library';
import useTierLevel from '@hooks/tiers/useTierLevel';
import ProgressionRequeriments from '@pages/tier-view/current-tier/progression-requeriments';
import HowToLevelUpModal from '@pages/tier-view/current-tier/how-to-level-up-modal';
import VerifyToLevelUpModal from '@pages/tier-view/current-tier/verify-to-level-up-modal';

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

const LockedDeposit = ({ strategy, needsTier }: { strategy?: DisplayStrategy; needsTier: number }) => {
  const { tierLevel, progress } = useTierLevel();
  const [isHowToLevelUpModalOpen, setIsHowToLevelUpModalOpen] = React.useState(false);
  const [isVerifyToLevelUpModalOpen, setIsVerifyToLevelUpModalOpen] = React.useState(false);
  const TierIcon = ActiveTiersIcons[needsTier];

  return (
    <>
      <HowToLevelUpModal
        isOpen={isHowToLevelUpModalOpen}
        onClose={() => setIsHowToLevelUpModalOpen(false)}
        onGoToVerifyWallets={() => setIsVerifyToLevelUpModalOpen(true)}
      />
      <VerifyToLevelUpModal isOpen={isVerifyToLevelUpModalOpen} onClose={() => setIsVerifyToLevelUpModalOpen(false)} />
      <ContainerBox flexDirection="column" gap={8}>
        <ContainerBox gap={6} alignItems="center">
          <TierIcon size="4.8125rem" />
          <ContainerBox flexDirection="column" gap={1}>
            <Typography variant="h3Bold">
              <FormattedMessage
                description="earn.strategy-management.locked-deposit.title"
                defaultMessage="Reach Tier {necessaryTierLevel} to Unlock This Vault"
                values={{ necessaryTierLevel: needsTier }}
              />
            </Typography>
            <Typography variant="h5Bold">
              <FormattedMessage
                description="earn.strategy-management.locked-deposit.subtitle"
                defaultMessage="{percentage}% to Tier {nextTier}"
                values={{ percentage: progress, nextTier: (tierLevel ?? 0) + 1 }}
              />
            </Typography>
          </ContainerBox>
        </ContainerBox>
        <ContainerBox flexDirection="column" gap={4}>
          <Typography variant="bodySmallRegular" color={({ palette }) => colors[palette.mode].typography.typo2}>
            <FormattedMessage
              description="earn.strategy-management.locked-deposit.description"
              defaultMessage="This strategy is exclusively available for Tier {necessaryTierLevel} and above. You're currently at Tier {currentTierLevel}. <b>Meet the progression requirements below to access this vault and enjoy premium benefits.</b>"
              values={{
                currentTierLevel: tierLevel,
                necessaryTierLevel: needsTier,
                b: (chunks: React.ReactNode) => <b>{chunks}</b>,
              }}
            />
          </Typography>
          <ProgressionRequeriments onOpenHowToLevelUp={() => setIsHowToLevelUpModalOpen(true)} />
        </ContainerBox>
        <AvailableBalanceProjection strategy={strategy} />
      </ContainerBox>
    </>
  );
};

export default LockedDeposit;
