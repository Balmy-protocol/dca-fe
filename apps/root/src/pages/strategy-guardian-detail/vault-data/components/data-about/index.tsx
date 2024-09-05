import React from 'react';
import { BALMY_FEES, FEE_TYPE_STRING_MAP } from '@constants/earn';
import { DisplayStrategy, StrategyGuardian } from 'common-types';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  ContainerBox,
  Grid,
  Skeleton,
  Typography,
  colors,
} from 'ui-library';
import { FormattedMessage, useIntl } from 'react-intl';
import DataHistoricalRate from '../data-historical-rate';

interface DataAboutProps {
  strategy?: DisplayStrategy;
  collapsed: boolean;
}

const FeeItem = ({ fee, intl }: { fee: StrategyGuardian['fees'][number]; intl: ReturnType<typeof useIntl> }) => (
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

const SKELETON_ROWS = Array.from(Array(3).keys());

const FeeContainer = ({
  fees,
  intl,
  isLoading,
}: {
  fees?: StrategyGuardian['fees'];
  intl: ReturnType<typeof useIntl>;
  isLoading: boolean;
}) => (
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
);

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
      <Typography variant="h6Bold">{title}</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Typography variant="bodySmallRegular">
        {isLoading ? (
          <>
            {SKELETON_ROWS.map((index) => (
              <Skeleton key={index} variant="text" width="20ch" />
            ))}
          </>
        ) : (
          content
        )}
      </Typography>
    </AccordionDetails>
  </Accordion>
);

const DataAboutItem = ({
  title,
  content,
  isLoading,
  collapsed,
  expand,
}: {
  title: React.ReactNode;
  content?: React.ReactNode;
  isLoading?: boolean;
  collapsed?: boolean;
  expand?: boolean;
}) => (
  <>
    {collapsed && <DataAboutCollapsed expand={expand} title={title} content={content} isLoading={isLoading} />}
    {!collapsed && (
      <ContainerBox flexDirection="column" {...(expand ? { flex: 1 } : {})} gap={1}>
        <Typography variant="bodyBold">{title}</Typography>
        <Typography variant="bodySmallRegular">
          {isLoading ? (
            <>
              {SKELETON_ROWS.map((index) => (
                <Skeleton key={index} variant="text" width="20ch" />
              ))}
            </>
          ) : (
            content
          )}
        </Typography>
      </ContainerBox>
    )}
  </>
);

const DataAbout = ({ strategy, collapsed }: DataAboutProps) => {
  const intl = useIntl();
  const isLoading = !strategy;

  return (
    <Grid container rowSpacing={collapsed ? 2 : 5} columnSpacing={5}>
      <Grid item xs={12} sx={{ paddingTop: '0px !important' }}>
        <DataAboutItem
          collapsed={collapsed}
          title={
            <FormattedMessage
              defaultMessage="About the project"
              description="earn.strategy-details.vault-about.about-project"
            />
          }
          content={strategy?.farm.name}
          isLoading={isLoading}
        />
      </Grid>
      <Grid item xs={12}>
        <DataAboutItem
          collapsed={collapsed}
          title={
            <FormattedMessage
              defaultMessage="Vault strategy"
              description="earn.strategy-details.vault-about.vault-strategy"
            />
          }
          content={strategy?.farm.name}
          isLoading={isLoading}
        />
      </Grid>
      <Grid item xs={12}>
        <DataAboutItem
          collapsed={collapsed}
          title={
            <FormattedMessage
              defaultMessage="Historical Rate"
              description="earn.strategy-details.vault-about.historical-rate"
            />
          }
          content={<DataHistoricalRate strategy={strategy} />}
          isLoading={isLoading}
        />
      </Grid>
      <Grid item xs={12}>
        <ContainerBox gap={10}>
          <DataAboutItem
            expand
            title={
              <FormattedMessage
                defaultMessage="Guardian Fees"
                description="earn.strategy-details.vault-about.guardian-fee"
              />
            }
            content={<FeeContainer isLoading={isLoading} intl={intl} fees={strategy?.guardian?.fees} />}
          />
          <DataAboutItem
            title={
              <FormattedMessage defaultMessage="Balmy fees" description="earn.strategy-details.vault-about.balmy-fee" />
            }
            content={<FeeContainer isLoading={isLoading} intl={intl} fees={BALMY_FEES} />}
          />
        </ContainerBox>
      </Grid>
    </Grid>
  );
};

export default DataAbout;
