import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import React from 'react';
import { ContainerBox, useMediaQuery } from 'ui-library';
import { StrategyColumnConfig } from '../strategies-table/components/columns';
import StrategiesTable, { TableStrategy } from '../strategies-table';
import StrategiesList from '../strategies-list';
import usePushToHistory from '@hooks/usePushToHistory';
import useAnalytics from '@hooks/useAnalytics';
import { useAppDispatch } from '@state/hooks';
import { useTheme } from 'styled-components';
import { Strategy } from 'common-types';
import { debounce } from 'lodash';
import { setSearch } from '@state/strategies-filters/actions';
import AllStrategiesTableToolbar from '../strategies-table/components/toolbar';

const ROWS_PER_PAGE = 7;

interface StrategiesTableProps<T extends StrategiesTableVariants> {
  columns: StrategyColumnConfig<T>[];
  strategies: TableStrategy<T>[];
  variant: T;
  isLoading: boolean;
  withPagination?: boolean;
  showBalances?: boolean;
}

const StrategiesDisplayWrapper = <T extends StrategiesTableVariants>({
  columns,
  strategies,
  isLoading,
  variant,
  withPagination,
  showBalances = true,
}: StrategiesTableProps<T>) => {
  const [page, setPage] = React.useState(0);
  const pushToHistory = usePushToHistory();
  const { trackEvent } = useAnalytics();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const shouldShowMobileList = useMediaQuery(theme.breakpoints.down('md'));

  const onGoToStrategy = React.useCallback(
    (strategy: Strategy) => {
      pushToHistory(`/earn/vaults/${strategy.network.chainId}/${strategy.id}`);
      trackEvent('Earn Vault List - Go to vault details', {
        chainId: strategy.network.chainId,
      });
    },
    [pushToHistory, trackEvent]
  );

  const handleSearchChange = debounce((newValue: string) => {
    setPage(0);
    dispatch(setSearch({ variant, value: newValue }));
  }, 500);

  const visibleRows = React.useMemo(
    () => (withPagination ? strategies.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE) : strategies),
    [page, strategies, withPagination]
  );

  return (
    <ContainerBox flexDirection="column" gap={5} flex={1}>
      <AllStrategiesTableToolbar
        strategiesCount={strategies.length}
        isLoading={isLoading}
        handleSearchChange={handleSearchChange}
        variant={variant}
        disabled={strategies.length === 0}
      />
      {shouldShowMobileList ? (
        <StrategiesList
          totalCount={strategies.length}
          rowsPerPage={ROWS_PER_PAGE}
          page={page}
          setPage={setPage}
          variant={variant}
          // @ts-expect-error This will always either be all strategies or user strategies but typescript doesn't know that
          visibleStrategies={visibleRows}
          isLoading={isLoading}
        />
      ) : (
        <StrategiesTable
          columns={columns}
          visibleRows={visibleRows}
          variant={variant}
          isLoading={isLoading}
          // @ts-expect-error This will always either be all strategies or user strategies but typescript doesn't know that
          onGoToStrategy={onGoToStrategy}
          rowsPerPage={ROWS_PER_PAGE}
          page={page}
          setPage={setPage}
          strategies={strategies}
          showBalances={showBalances}
        />
      )}
    </ContainerBox>
  );
};

export default StrategiesDisplayWrapper;
