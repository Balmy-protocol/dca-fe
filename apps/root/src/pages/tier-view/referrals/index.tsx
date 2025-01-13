import React from 'react';
import { FormattedMessage } from 'react-intl';
import { ContainerBox, Grid, Typography } from 'ui-library';
import ReferralCard from './card';
import ReferralsTable from './table';

const Referrals = () => {
  return (
    <ContainerBox gap={4} flexDirection="column">
      <ContainerBox gap={2} flexDirection="column">
        <Typography variant="h4Bold">
          <FormattedMessage description="tier-view.referrals.title" defaultMessage="Your Referrals" />
        </Typography>
        <Typography variant="bodyRegular">
          <FormattedMessage
            description="tier-view.referrals.description"
            defaultMessage="Share your unique referral codes and track their progress in real-time."
          />
        </Typography>
      </ContainerBox>
      <Grid container rowSpacing={6} columnSpacing={6}>
        <Grid item xs={12} md={8}>
          {/* Referral table */}
          <ReferralsTable />
        </Grid>
        <Grid item xs={12} md={4}>
          {/* Referral card */}
          <ReferralCard />
        </Grid>
      </Grid>
    </ContainerBox>
  );
};

export default Referrals;
