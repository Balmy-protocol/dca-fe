import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Typography } from 'ui-library';

const Activity = () => {
  return (
    <>
      <Typography variant="h5">
        <FormattedMessage description="activity" defaultMessage="Activity" />
      </Typography>
    </>
  );
};

export default Activity;
