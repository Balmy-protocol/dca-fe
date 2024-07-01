import React from 'react';
import { FEE_TYPE_STRING_MAP } from '@constants/earn';
import { FeeType, Strategy, StrategyGuardian } from 'common-types';
import { ContainerBox, Grid, Skeleton, Typography, colors } from 'ui-library';
import { FormattedMessage, useIntl } from 'react-intl';

interface DataAboutProps {
  strategy?: Strategy;
}

const FeeItem = ({ fee, intl }: { fee: StrategyGuardian['fees'][number]; intl: ReturnType<typeof useIntl> }) => (
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

const DataAboutItem = ({
  title,
  content,
  isLoading,
}: {
  title: React.ReactNode;
  content?: React.ReactNode;
  isLoading?: boolean;
}) => (
  <ContainerBox flexDirection="column" gap={1}>
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
);

const DataAbout = ({ strategy }: DataAboutProps) => {
  const intl = useIntl();
  const isLoading = !strategy;

  return (
    <Grid container rowSpacing={5} columnSpacing={10}>
      <Grid item xs={12} sx={{ paddingTop: '0px !important' }}>
        <DataAboutItem
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
      <Grid item sm={7} xs={12}>
        <DataAboutItem
          title={
            <FormattedMessage
              defaultMessage="Guardian Fees"
              description="earn.strategy-details.vault-about.guardian-fee"
            />
          }
          content={<FeeContainer isLoading={isLoading} intl={intl} fees={strategy?.guardian?.fees} />}
        />
      </Grid>
      <Grid item sm={5} xs={12}>
        <DataAboutItem
          title={
            <FormattedMessage defaultMessage="Balmy fees" description="earn.strategy-details.vault-about.balmy-fee" />
          }
          content={
            <FeeContainer isLoading={isLoading} intl={intl} fees={[{ percentage: 0.2, type: FeeType.performance }]} />
          }
        />
      </Grid>
    </Grid>
  );
};

export default DataAbout;
