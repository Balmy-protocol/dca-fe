import React from 'react';
import { FEE_TYPE_STRING_MAP } from '@constants/earn';
import { DisplayStrategy, StrategyGuardian } from 'common-types';
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
