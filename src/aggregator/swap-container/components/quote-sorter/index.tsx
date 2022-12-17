import * as React from 'react';
import MinimalTabs from 'common/minimal-tabs';
import { FormattedMessage } from 'react-intl';
import { SORT_LEAST_GAS, SORT_MOST_PROFIT } from 'config/constants/aggregator';

interface QuoteSorterProps {
  isLoading: boolean;
  setQuoteSorting: (sorting: string) => void;
  sorting: string;
}

const SORT_OPTIONS = [
  {
    key: SORT_MOST_PROFIT,
    label: <FormattedMessage description="sortHighReturn" defaultMessage="Highest return" />,
  },
  {
    key: SORT_LEAST_GAS,
    label: <FormattedMessage description="sortLeastGas" defaultMessage="Least gas" />,
  },
];

const QuoteSorter = ({ isLoading, setQuoteSorting, sorting }: QuoteSorterProps) => (
  <MinimalTabs
    options={Object.values(SORT_OPTIONS)}
    selected={{ key: sorting, label: '' }}
    onChange={({ key }) => setQuoteSorting(key as string)}
    disabled={isLoading}
  />
);

export default QuoteSorter;
