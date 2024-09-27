import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import React from 'react';
import { ContainerBox, useMediaQuery } from 'ui-library';
import { StrategyColumnConfig } from '../strategies-table/components/columns';
import StrategiesTable, { TableStrategy } from '../strategies-table';
import StrategiesList from '../strategies-list';
import usePushToHistory from '@hooks/usePushToHistory';
import useTrackEvent from '@hooks/useTrackEvent';
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
  showTotal?: boolean;
}

const StrategiesDisplayWrapper = <T extends StrategiesTableVariants>({
  columns,
  strategies,
  isLoading,
  variant,
  showTotal = false,
}: StrategiesTableProps<T>) => {
  const [page, setPage] = React.useState(0);
  const pushToHistory = usePushToHistory();
  const trackEvent = useTrackEvent();
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
    () => strategies.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE),
    [page, strategies]
  );

  const displayColumns = columns.filter((col) => !col.hidden?.(theme));

  return (
    <ContainerBox flexDirection="column" gap={5} flex={1}>
      <AllStrategiesTableToolbar
        strategiesCount={strategies.length}
        isLoading={isLoading}
        handleSearchChange={handleSearchChange}
        variant={variant}
      />
      {shouldShowMobileList ? (
        <StrategiesList
          totalCount={strategies.length}
          rowsPerPage={ROWS_PER_PAGE}
          page={page}
          setPage={setPage}
          variant={variant}
          visibleStrategies={visibleRows}
          isLoading={isLoading}
        />
      ) : (
        <StrategiesTable
          displayColumns={displayColumns}
          visibleRows={visibleRows}
          variant={variant}
          isLoading={isLoading}
          showTotal={showTotal}
          onGoToStrategy={onGoToStrategy}
          rowsPerPage={ROWS_PER_PAGE}
          page={page}
          setPage={setPage}
          strategies={strategies}
        />
      )}
    </ContainerBox>
  );
};

export default StrategiesDisplayWrapper;
