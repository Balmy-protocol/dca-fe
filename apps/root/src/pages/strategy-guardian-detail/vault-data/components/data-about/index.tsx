import React from 'react';
import { FEE_TYPE_STRING_MAP } from '@constants/earn';
import { DisplayStrategy, FarmId, StrategyGuardian } from 'common-types';
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
import { defineMessage, FormattedMessage, IntlShape, MessageDescriptor, useIntl } from 'react-intl';
import DataHistoricalRate from '../data-historical-rate';
import TokenIcon from '@common/components/token-icon';
import { emptyTokenWithLogoURI } from '@common/utils/currency';
import { BALMY_FEES_LOGO_URL } from '@constants';
interface DataAboutProps {
  strategy?: DisplayStrategy;
  collapsed: boolean;
}

export const FeeItem = ({ fee, intl }: { fee: StrategyGuardian['fees'][number]; intl: IntlShape }) => (
  <ContainerBox gap={1} alignItems="center">
    <Typography variant="bodySmallRegular" color={({ palette: { mode } }) => colors[mode].typography.typo3}>
      {intl.formatMessage(FEE_TYPE_STRING_MAP[fee.type])}:
    </Typography>
    <Typography variant="bodySmallRegular" color={({ palette: { mode } }) => colors[mode].typography.typo2}>
      {fee.percentage}%
    </Typography>
  </ContainerBox>
);

const SKELETON_ROWS = Array.from(Array(3).keys());

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
  icon,
}: {
  title: React.ReactNode;
  explanation?: React.ReactNode;
  isLoading?: boolean;
  expand?: boolean;
  fees?: StrategyGuardian['fees'];
  intl: IntlShape;
  icon?: React.ReactNode;
}) => (
  <ContainerBox flexDirection="column" {...(expand ? { flex: 1 } : {})} gap={3}>
    <ContainerBox alignItems="center" gap={1}>
      {icon}
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
    </ContainerBox>
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

const AAVE_FARM_DESCRIPTION = defineMessage({
  defaultMessage: 'Aave',
  description: 'earn.strategy-details.vault-about.vault-description.Aave',
});

const FARM_DESCRIPTION_MAP: Record<FarmId, MessageDescriptor> = {
  '8453-0xee8f4ec5672f09119b96ab6fb59c27e1b7e44b61': defineMessage({
    description: 'earn.strategy-details.vault-about.vault-description.Base-Morpho-USDC',
    defaultMessage: 'Base-Morpho-USDC',
  }),
  '8453-0x4e65fe4dba92790696d040ac24aa414708f5c0ab': AAVE_FARM_DESCRIPTION,
  '10-0xe50fa9b3c56ffb159cb0fca61f5c9d750e8128c8': AAVE_FARM_DESCRIPTION,
  '10-0x625e7708f30ca75bfd92586e17077590c60eb4cd': AAVE_FARM_DESCRIPTION,
  '10-0x078f358208685046a11c85e8ad32895ded33a249': AAVE_FARM_DESCRIPTION,
  '10-0x6ab707aca953edaefbc4fd23ba73294241490620': AAVE_FARM_DESCRIPTION,
  '10-0x513c7e3a9c69ca3e22550ef58ac1c0088e918fff': AAVE_FARM_DESCRIPTION,
  '10-0x6d80113e533a2c0fe82eabd35f1875dcea89ea97': AAVE_FARM_DESCRIPTION,
  '10-0x38d693ce1df5aadf7bc62595a37d667ad57922e5': AAVE_FARM_DESCRIPTION,
  '10-0x82e64f49ed5ec1bc6e43dad4fc8af9bb3a2312ee': AAVE_FARM_DESCRIPTION,
  '10-0x8eb270e296023e9d92081fdf967ddd7878724424': AAVE_FARM_DESCRIPTION,
  '8453-0xd4a0e0b9149bcee3c920d2e00b5de09138fd8bb7': AAVE_FARM_DESCRIPTION,
  '8453-0xbdb9300b7cde636d9cd4aff00f6f009ffbbc8ee6': AAVE_FARM_DESCRIPTION,
  '8453-0xa0e430870c4604ccfc7b38ca7845b1ff653d0ff1': defineMessage({
    description: 'earn.strategy-details.vault-about.vault-description.Base-Morpho-WETH',
    defaultMessage: 'Base-Morpho-WETH',
  }),
};

const DEFAULT_FARM_DESCRIPTION = defineMessage({
  defaultMessage: 'Farm',
  description: 'earn.strategy-details.vault-about.farm-default',
});

const DataAbout = ({ strategy }: DataAboutProps) => {
  const intl = useIntl();
  const isLoading = !strategy;

  return (
    <Grid container rowSpacing={6}>
      <Grid item xs={12}>
        <ContainerBox flexDirection="column" gap={3}>
          <DataAboutCollapsed
            title={
              <FormattedMessage
                defaultMessage="Vault Info"
                description="earn.strategy-details.vault-about.vault-info"
              />
            }
            content={
              strategy?.farm.id
                ? intl.formatMessage(FARM_DESCRIPTION_MAP[strategy.farm.id] ?? DEFAULT_FARM_DESCRIPTION, {
                    asset: strategy.asset.symbol,
                    br: <br />,
                  })
                : intl.formatMessage(DEFAULT_FARM_DESCRIPTION)
            }
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
        <ContainerBox gap={8}>
          {strategy?.guardian ? (
            <FeeContainer
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
              fees={strategy.guardian.fees}
              isLoading={isLoading}
              icon={<TokenIcon token={emptyTokenWithLogoURI(strategy.guardian.logo)} size={5} />}
            />
          ) : (
            <FeeContainer
              title={
                <FormattedMessage
                  defaultMessage="Strategy Fees"
                  description="earn.strategy-details.vault-about.strategy-fee"
                />
              }
              intl={intl}
              fees={strategy?.fees}
              icon={<TokenIcon token={emptyTokenWithLogoURI(BALMY_FEES_LOGO_URL)} size={5} />}
            />
          )}
        </ContainerBox>
      </Grid>
    </Grid>
  );
};

export default DataAbout;
