import React from 'react';
import { Grid } from 'ui-library';
import ReferralCard from './card';
import ShareLinkContainer from './share-link-container';

const Referrals = () => {
  return (
    <Grid container rowSpacing={6} columnSpacing={6}>
      <Grid item xs={12} md={8}>
        {/* Referral link container */}
        <ShareLinkContainer />
      </Grid>
      <Grid item xs={12} md={4}>
        {/* Referral card */}
        <ReferralCard />
      </Grid>
    </Grid>
  );
};

export default Referrals;
