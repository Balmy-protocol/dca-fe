import useTransactionsHistory from '@hooks/useTransactionsHistory';
import React from 'react';

const Activity = () => {
  const transactionsHistory = useTransactionsHistory();

  // eslint-disable-next-line no-console
  console.log(transactionsHistory);
  return <></>;
};

export default Activity;
