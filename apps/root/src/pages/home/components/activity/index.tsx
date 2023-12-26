import usePushToHistory from '@hooks/usePushToHistory';
import useTrackEvent from '@hooks/useTrackEvent';
import useTransactionsHistory from '@hooks/useTransactionsHistory';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { KeyboardArrowRightIcon, Link, Typography } from 'ui-library';

const Activity = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { history, isLoading } = useTransactionsHistory();
  const trackEvent = useTrackEvent();
  const dispatch = useAppDispatch();
  const pushToHistory = usePushToHistory();

  const onSeeAllHistory = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    dispatch(changeRoute('history'));
    pushToHistory('/history');
    trackEvent('Home - Go to see all history');
  };

  return (
    <Typography>
      <Link href="/history" underline="none" color="inherit" onClick={onSeeAllHistory}>
        <Typography variant="body" component="div" style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormattedMessage description="seeAll" defaultMessage="See all" />
          <KeyboardArrowRightIcon fontSize="inherit" />
        </Typography>
      </Link>
    </Typography>
  );
};

export default Activity;
