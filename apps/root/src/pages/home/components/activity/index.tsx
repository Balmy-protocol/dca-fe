import usePushToHistory from '@hooks/usePushToHistory';
import useTrackEvent from '@hooks/useTrackEvent';
import { useAppDispatch } from '@state/hooks';
import { changeRoute } from '@state/tabs/actions';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { KeyboardArrowRightIcon, Link } from 'ui-library';

const Activity = () => {
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
    <Link href="/history" variant="body" underline="none" color="inherit" onClick={onSeeAllHistory}>
      <FormattedMessage description="seeAll" defaultMessage="See all" />
      <KeyboardArrowRightIcon fontSize="inherit" />
    </Link>
  );
};

export default Activity;
