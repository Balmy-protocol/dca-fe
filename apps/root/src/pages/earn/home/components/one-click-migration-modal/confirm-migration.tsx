import { formatCurrencyAmount, formatUsdAmount } from '@common/utils/currency';
import TokenIcon from '@common/components/token-icon';
import { FarmWithAvailableDepositTokens } from '@hooks/earn/useAvailableDepositTokens';
import { Strategy } from 'common-types';
import React from 'react';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';
import {
  ContainerBox,
  Typography,
  BackControl,
  DividerBorder2,
  Button,
  colors,
  DiscordIcon,
  GlobalIcon,
  Link,
  SPACING,
  TwitterIcon,
  Tooltip,
  InfoCircleIcon,
  Grid,
  Radio,
  MovingStarIcon,
} from 'ui-library';
import { getLogoURL } from '@common/utils/urlParser';
import { FeeItem } from '@pages/strategy-guardian-detail/vault-data/components/data-about';
import { PROMOTED_STRATEGIES_IDS } from '@constants/earn';

const StyledTitleDataContainer = styled(ContainerBox).attrs({
  gap: 1,
  alignItems: 'flex-start',
  flexDirection: 'column',
})``;
const StyledTitleData = styled(Typography).attrs({ variant: 'bodySmallRegular' })`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo3};
  `}
`;
const StyledTitleDataValue = styled(Typography).attrs({ variant: 'bodyBold' })`
  ${({ theme: { palette } }) => `
    color: ${colors[palette.mode].typography.typo2};
  `}
`;

const StyledStrategyItem = styled(ContainerBox).attrs({ alignItems: 'center', justifyContent: 'space-between' })<{
  $selected: boolean;
}>`
  ${({ theme: { palette, spacing }, $selected }) => `
    background-color: ${colors[palette.mode].background.secondary};
    padding: ${spacing(6)};
    border-radius: ${spacing(2)};
    border: 1px solid ${$selected ? colors[palette.mode].accent.primary : colors[palette.mode].border.border1};
  `}
`;

interface StrategyItemProps {
  strategy: Strategy;
  selected: boolean;
  onSelect: (strategy: Strategy) => void;
}
const StrategyItem = ({ strategy, selected, onSelect }: StrategyItemProps) => {
  const intl = useIntl();
  const isPromoted = PROMOTED_STRATEGIES_IDS.includes(strategy.id);

  return (
    <StyledStrategyItem $selected={selected} onClick={() => onSelect(strategy)}>
      <ContainerBox gap={4} alignItems="center">
        <Radio checked={selected} />
        <ContainerBox gap={2} alignItems="flex-start" flexDirection="column">
          <Typography variant="h6Bold" color={({ palette }) => colors[palette.mode].typography.typo2}>
            {strategy.guardian?.name}
          </Typography>
          {isPromoted && (
            <ContainerBox gap={1} alignItems="center">
              <MovingStarIcon sx={({ palette }) => ({ color: colors[palette.mode].semantic.success.darker })} />
              <Typography
                variant="bodySmallRegular"
                color={({ palette }) => colors[palette.mode].semantic.success.darker}
              >
                <FormattedMessage
                  description="earn.one-click-migration.confirm-migration.promoted"
                  defaultMessage="Higher than usual rewards"
                />
              </Typography>
            </ContainerBox>
          )}
        </ContainerBox>
      </ContainerBox>
      <ContainerBox gap={3} alignItems="center">
        {!!strategy?.guardian?.links && (
          <>
            <ContainerBox gap={2} alignItems="center">
              {strategy.guardian.links.twitter && (
                <Link
                  underline="none"
                  target="_blank"
                  href={getLogoURL(strategy.guardian.links.twitter)}
                  color={({ palette: { mode } }) => colors[mode].typography.typo5}
                >
                  <TwitterIcon
                    size={SPACING(6)}
                    sx={({ palette }) => ({ color: colors[palette.mode].typography.typo5 })}
                  />
                </Link>
              )}
              {strategy.guardian.links.discord && (
                <Link
                  underline="none"
                  target="_blank"
                  href={getLogoURL(strategy.guardian.links.discord)}
                  color={({ palette: { mode } }) => colors[mode].typography.typo5}
                >
                  <DiscordIcon
                    size={SPACING(6)}
                    sx={({ palette }) => ({ color: colors[palette.mode].typography.typo5 })}
                  />
                </Link>
              )}
              {strategy.guardian.links.website && (
                <Link
                  underline="none"
                  target="_blank"
                  href={getLogoURL(strategy.guardian.links.website)}
                  color={({ palette: { mode } }) => colors[mode].typography.typo5}
                >
                  <GlobalIcon
                    size={SPACING(6)}
                    sx={({ palette }) => ({ color: colors[palette.mode].typography.typo5 })}
                  />
                </Link>
              )}
            </ContainerBox>
            <DividerBorder2 orientation="vertical" flexItem />
          </>
        )}
        <ContainerBox gap={2} alignItems="center">
          <Typography variant="bodySemibold" display="flex" alignItems="center" gap={1}>
            <FormattedMessage description="earn.one-click-migration.confirm-migration.fees" defaultMessage="Fees" />
            <Tooltip
              title={
                <Grid container spacing={3}>
                  {strategy.guardian?.fees?.map((fee) => (
                    <Grid key={fee.type} item xs={6}>
                      <FeeItem fee={fee} intl={intl} />
                    </Grid>
                  ))}
                </Grid>
              }
            >
              <ContainerBox>
                <InfoCircleIcon fontSize="small" />
              </ContainerBox>
            </Tooltip>
          </Typography>
        </ContainerBox>
      </ContainerBox>
    </StyledStrategyItem>
  );
};
interface OneClickMigrationConfirmMigrationContentProps {
  onGoToStrategy: (strategy: Strategy) => void;
  onGoBack: () => void;
  selectedFarm: Nullable<FarmWithAvailableDepositTokens>;
}

const OneClickMigrationConfirmMigrationContent = ({
  onGoToStrategy,
  selectedFarm,
  onGoBack,
}: OneClickMigrationConfirmMigrationContentProps) => {
  const intl = useIntl();
  const [selectedStrategy, setSelectedStrategy] = React.useState<Nullable<Strategy>>(null);

  const handleOnGoBack = () => {
    setSelectedStrategy(null);
    onGoBack();
  };
  const handleOnGoToStrategy = React.useCallback(() => {
    if (!selectedStrategy) {
      return;
    }
    onGoToStrategy(selectedStrategy);
  }, [onGoToStrategy, selectedStrategy]);

  if (!selectedFarm) {
    return null;
  }

  React.useEffect(() => {
    if (selectedFarm.strategies.length === 1) {
      setSelectedStrategy(selectedFarm.strategies[0]);
    }
  }, [selectedFarm]);

  return (
    <ContainerBox flexDirection="column" gap={6}>
      <BackControl
        onClick={handleOnGoBack}
        label={intl.formatMessage(
          defineMessage({
            defaultMessage: 'Funds to import',
            description: 'earn.one-click-migration.confirm-migration.funds-to-import',
          })
        )}
      />
      <ContainerBox flexDirection="column" gap={4}>
        <ContainerBox flexDirection="column" gap={2}>
          <Typography variant="h4Bold" color={({ palette: { mode } }) => colors[mode].typography.typo1}>
            <FormattedMessage
              description="earn.one-click-migration.confirm-migration.title"
              defaultMessage="Investment to migrate"
            />
          </Typography>
          <Typography variant="bodyRegular" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
            <FormattedMessage
              description="earn.one-click-migration.confirm-migration.subtitle"
              defaultMessage="Main token APY stays the same. Rewards APY may vary by Guardian."
            />
          </Typography>
        </ContainerBox>
        <ContainerBox alignItems="center" gap={6}>
          <StyledTitleDataContainer>
            <StyledTitleData>
              <FormattedMessage
                description="earn.one-click-migration.confirm-migration.protocol"
                defaultMessage="Protocol"
              />
            </StyledTitleData>
            <StyledTitleDataValue>{selectedFarm.farm.name}</StyledTitleDataValue>
          </StyledTitleDataContainer>
          <StyledTitleDataContainer>
            <StyledTitleData>
              <FormattedMessage
                description="earn.one-click-migration.confirm-migration.token-amount"
                defaultMessage="Token amount"
              />
            </StyledTitleData>
            <ContainerBox gap={2} alignItems="center">
              <TokenIcon token={selectedFarm.token} size={6} withShadow />
              <StyledTitleDataValue>
                {formatCurrencyAmount({
                  amount: selectedFarm.balance.amount,
                  token: selectedFarm.token,
                  intl,
                })}
              </StyledTitleDataValue>
              <StyledTitleDataValue color={({ palette }) => colors[palette.mode].typography.typo4}>
                ($
                {formatUsdAmount({
                  intl,
                  amount: selectedFarm.balance.amountInUSD,
                })}
                )
              </StyledTitleDataValue>
            </ContainerBox>
          </StyledTitleDataContainer>
          <StyledTitleDataContainer>
            <StyledTitleData>
              <FormattedMessage description="earn.one-click-migration.confirm-migration.apy" defaultMessage="APY" />
            </StyledTitleData>
            <StyledTitleDataValue>{selectedFarm.farm.apy.toFixed(2)}%</StyledTitleDataValue>
          </StyledTitleDataContainer>
        </ContainerBox>
      </ContainerBox>
      <DividerBorder2 />
      <ContainerBox flexDirection="column" gap={2}>
        <Typography variant="h4Bold" color={({ palette: { mode } }) => colors[mode].typography.typo1}>
          <FormattedMessage
            description="earn.one-click-migration.confirm-migration.select-guardian.title"
            defaultMessage="Select your guardian"
          />
        </Typography>
        <Typography variant="bodyRegular" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
          <FormattedMessage
            description="earn.one-click-migration.confirm-migration.select-guardian.subtitle"
            defaultMessage="Pick a Guardian to secure your investment. Each offers real-time monitoring and security, with varying fees."
          />
        </Typography>
      </ContainerBox>
      <ContainerBox flexDirection="column" gap={2}>
        {selectedFarm.strategies.map((strategy) => (
          <StrategyItem
            key={strategy.id}
            strategy={strategy}
            selected={selectedStrategy?.id === strategy.id}
            onSelect={setSelectedStrategy}
          />
        ))}
      </ContainerBox>
      <ContainerBox justifyContent="center" gap={2}>
        <Button variant="contained" onClick={handleOnGoToStrategy} fullWidth size="large">
          <FormattedMessage
            description="earn.one-click-migration.confirm-migration.continue-in-vault"
            defaultMessage="Continue in vault"
          />
        </Button>
      </ContainerBox>
    </ContainerBox>
  );
};

export default OneClickMigrationConfirmMigrationContent;
