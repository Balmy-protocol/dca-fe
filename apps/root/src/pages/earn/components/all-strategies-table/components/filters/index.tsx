import React from 'react';
import { useAppDispatch } from '@state/hooks';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  ContainerBox,
  DividerBorder2,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  KeyboardArrowDownIcon,
  Popover,
  SearchIcon,
  TextField,
  Typography,
} from 'ui-library';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { useAllStrategiesFilters } from '@state/all-strategies-filters/hooks';
import { SetStateCallback, StrategyYieldType, Token } from 'common-types';
import {
  setAssetFilter,
  setFarmFilter,
  setGuardianFilter,
  setNetworkFilter,
  setRewardFilter,
  setYieldTypeFilter,
} from '@state/all-strategies-filters/actions';
import { useStrategiesParameters } from '@hooks/earn/useStrategiesParameters';
import TokenIcon from '@common/components/token-icon';

type FilterOption<T> = {
  value: T;
  label: React.ReactNode;
  searchParams?: string[];
};

interface FilterControl<T> {
  options: FilterOption<T>[];
  filteredOptions: T[];
  summaryLabel: string;
  handleFilterChange: (newFilterOptions: T[]) => void;
  searchParams?: string[];
  hideSearch?: boolean;
}

type FilterProps<T> = FilterControl<T> & {
  expanded: number;
  setExpanded: SetStateCallback<number>;
  id: number;
};

const Filter = <T,>({
  options,
  filteredOptions,
  summaryLabel,
  handleFilterChange,
  hideSearch,
  expanded,
  setExpanded,
  id,
}: FilterProps<T>) => {
  const intl = useIntl();
  const [search, setSearch] = React.useState('');

  const onChangeFilter = (newFilter: T) => {
    if (filteredOptions.some((option) => option === newFilter)) {
      handleFilterChange(filteredOptions.filter((option) => option !== newFilter));
    } else {
      handleFilterChange([...filteredOptions, newFilter]);
    }
  };

  const optionsFilteredBySearch = React.useMemo(
    () =>
      options.filter((option) =>
        option.searchParams?.some((param) => param.toLowerCase().includes(search.toLowerCase()))
      ),
    [options, search]
  );

  const handleExpandChange = () => {
    setExpanded(expanded === id ? -1 : id);
  };

  return (
    <Accordion expanded={expanded === id} onChange={handleExpandChange}>
      <AccordionSummary>
        <ContainerBox justifyContent="space-between" fullWidth alignItems="center">
          <Typography variant="bodyBold">{summaryLabel}</Typography>
          {filteredOptions.length === 0 && (
            <Typography variant="bodySmallBold">
              <FormattedMessage defaultMessage="All" description="earn.all-strategies-table.filters.all" />
            </Typography>
          )}
        </ContainerBox>
      </AccordionSummary>
      <AccordionDetails>
        {!hideSearch && (
          <TextField
            placeholder={intl.formatMessage(
              defineMessage({
                defaultMessage: 'Search',
                description: 'earn.all-strategies-table.filters.search',
              })
            )}
            value={search}
            onChange={(evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
              setSearch(evt.currentTarget.value)
            }
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onKeyDown={(e) => {
              if (e.key !== 'Escape') {
                // Prevents autoselecting item while typing (default Select behaviour)
                e.stopPropagation();
              }
            }}
          />
        )}
        <DividerBorder2 />
        {optionsFilteredBySearch.length > 0 ? (
          optionsFilteredBySearch.map((filter, index) => (
            <FormGroup key={index}>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={() => onChangeFilter(filter.value)}
                    checked={filteredOptions.includes(filter.value)}
                  />
                }
                label={filter.label}
              />
            </FormGroup>
          ))
        ) : (
          <Typography variant="bodySmallBold">
            <FormattedMessage defaultMessage="No options found" description="all-strategies-table.filters.no-options" />
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

type FilterTypes = StrategyYieldType | string | number | Token;

function createFilterControl<Option, Filter>({
  options,
  filteredOptions,
  summaryLabel,
  handleFilterChange,
  getOptionValue,
  getSearchParams,
  getOptionLabel,
  hideSearch = false,
}: {
  options: Option[];
  filteredOptions: Filter[];
  summaryLabel: string;
  handleFilterChange: (newFilterOptions: Filter[]) => void;
  getOptionValue: (option: Option) => Filter;
  getSearchParams: (option: Option) => string[];
  getOptionLabel: (option: Option) => React.ReactNode | string;
  hideSearch?: boolean;
}): FilterControl<Filter> {
  const formattedOptions: FilterOption<Filter>[] = options.map((option) => {
    const label = getOptionLabel(option);
    return {
      value: getOptionValue(option),
      label: typeof label === 'string' ? <Typography variant="bodySmallSemibold">{label}</Typography> : label,
      searchParams: getSearchParams(option),
    };
  });

  return {
    options: formattedOptions,
    filteredOptions,
    summaryLabel,
    handleFilterChange,
    hideSearch,
  };
}

const TableFilters = ({ isLoading }: { isLoading: boolean }) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const strategiesFilters = useAllStrategiesFilters();
  const strategiesParameters = useStrategiesParameters();
  const [expandedFilter, setExpandedFilter] = React.useState(0);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'strategies-filters-popover' : undefined;

  const filterItems = React.useMemo<FilterControl<FilterTypes>[]>(() => {
    const assetFilter = createFilterControl({
      options: strategiesParameters.assets,
      filteredOptions: strategiesFilters.assets,
      summaryLabel: intl.formatMessage({
        defaultMessage: 'Token',
        description: 'earn.all-strategies-table.filters.token',
      }),
      handleFilterChange: (filter) => dispatch(setAssetFilter(filter)),
      getSearchParams: (asset) => [asset.symbol, asset.name],
      getOptionLabel: (asset) => (
        <ContainerBox gap={1} alignItems="center">
          <TokenIcon token={asset} size={5.25} />
          <Typography variant="bodySmallSemibold">{asset.symbol}</Typography>
        </ContainerBox>
      ),
      getOptionValue: (asset) => asset,
    });

    const rewardsFilter = createFilterControl({
      options: strategiesParameters.rewards,
      filteredOptions: strategiesFilters.rewards,
      summaryLabel: intl.formatMessage({
        defaultMessage: 'Rewards',
        description: 'earn.all-strategies-table.filters.rewards',
      }),
      handleFilterChange: (filter) => dispatch(setRewardFilter(filter)),
      getSearchParams: (reward) => [reward.symbol, reward.name],
      getOptionLabel: (reward) => (
        <ContainerBox gap={1} alignItems="center">
          <TokenIcon token={reward} size={5.25} />
          <Typography variant="bodySmallSemibold">{reward.symbol}</Typography>
        </ContainerBox>
      ),
      getOptionValue: (reward) => reward,
    });

    const farmsFilter = createFilterControl({
      options: strategiesParameters.farms,
      filteredOptions: strategiesFilters.farms,
      summaryLabel: intl.formatMessage(
        defineMessage({
          defaultMessage: 'Protocol',
          description: 'earn.all-strategies-table.filters.protocol',
        })
      ),
      handleFilterChange: (filter) => dispatch(setFarmFilter(filter)),
      getSearchParams: (farm) => [farm.name],
      getOptionLabel: (farm) => farm.name,
      getOptionValue: (farm) => farm.id,
    });

    const networksFilter = createFilterControl({
      options: strategiesParameters.networks,
      filteredOptions: strategiesFilters.networks,
      summaryLabel: intl.formatMessage(
        defineMessage({
          defaultMessage: 'Network',
          description: 'earn.all-strategies-table.filters.network',
        })
      ),
      handleFilterChange: (filter) => dispatch(setNetworkFilter(filter)),
      getSearchParams: (network) => [network.name, network.chainId.toString()],
      getOptionLabel: (network) => network.name,
      getOptionValue: (network) => network.chainId,
    });

    const yieldTypesFilter = createFilterControl({
      options: strategiesParameters.yieldTypes,
      filteredOptions: strategiesFilters.yieldTypes,
      summaryLabel: intl.formatMessage(
        defineMessage({
          defaultMessage: 'Yield Type',
          description: 'earn.all-strategies-table.filters.yield-type',
        })
      ),
      handleFilterChange: (filter) => dispatch(setYieldTypeFilter(filter)),
      getSearchParams: (yieldType) => [yieldType.label],
      getOptionLabel: (yieldType) => yieldType.label,
      getOptionValue: (yieldType) => yieldType.value,
      hideSearch: true,
    });

    const guardiansFilter = createFilterControl({
      options: strategiesParameters.guardians,
      filteredOptions: strategiesFilters.guardians,
      summaryLabel: intl.formatMessage(
        defineMessage({
          defaultMessage: 'Guardians',
          description: 'earn.all-strategies-table.filters.guardians',
        })
      ),
      handleFilterChange: (filter) => dispatch(setGuardianFilter(filter)),
      getSearchParams: (guardian) => [guardian.name],
      getOptionLabel: (guardian) => <Typography variant="bodySmallSemibold">{guardian.name}</Typography>,
      getOptionValue: (guardian) => guardian.id,
    });

    return [networksFilter, assetFilter, rewardsFilter, farmsFilter, yieldTypesFilter, guardiansFilter];
  }, [intl, strategiesFilters, strategiesParameters]);

  return (
    <>
      <Button onClick={handleOpen} disabled={isLoading} variant="outlined" endIcon={<KeyboardArrowDownIcon />}>
        <FormattedMessage defaultMessage="Filters" description="earn.all-strategies-table.filters" />
      </Button>
      <Popover anchorEl={anchorEl} id={id} open={!isLoading && open} onClose={handleClose}>
        {filterItems.map((filters, index) => (
          <Filter
            filteredOptions={filters.filteredOptions}
            handleFilterChange={filters.handleFilterChange}
            hideSearch={filters.hideSearch}
            options={filters.options}
            summaryLabel={filters.summaryLabel}
            expanded={expandedFilter}
            setExpanded={setExpandedFilter}
            key={index}
            id={index}
          />
        ))}
      </Popover>
    </>
  );
};

export default TableFilters;
