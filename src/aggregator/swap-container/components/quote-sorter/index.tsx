import * as React from 'react';
import MinimalTabs from 'common/minimal-tabs';
import { FormattedMessage } from 'react-intl';
import { SWAP_ROUTES_SORT_OPTIONS } from 'config/constants/aggregator';

interface QuoteSorterProps {
  isLoading: boolean;
  setQuoteSorting: (sorting: string) => void;
  sorting: string;
}

const SORT_OPTIONS = [
  {
    key: SWAP_ROUTES_SORT_OPTIONS.MOST_PROFIT,
    label: <FormattedMessage description="sortHighReturn" defaultMessage="Highest return" />,
  },
  {
    key: SWAP_ROUTES_SORT_OPTIONS.LEAST_GAS,
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
