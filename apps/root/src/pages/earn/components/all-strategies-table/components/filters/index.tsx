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
import { compact } from 'lodash';

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
              <FormattedMessage defaultMessage="All" description="all-strategies-table.filters.all" />
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
                description: 'all-strategies-table.filters.search',
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
    const assetFilter: FilterControl<Token> = {
      options: strategiesParameters.assets.map((asset) => ({
        value: asset,
        label: (
          <ContainerBox gap={1} alignItems="center">
            <TokenIcon token={asset} size={5.25} />
            <Typography variant="bodySmallSemibold">{asset.symbol}</Typography>
          </ContainerBox>
        ),
        searchParams: compact([asset.symbol, asset.name]),
      })),
      filteredOptions: strategiesFilters.assets,
      summaryLabel: intl.formatMessage(
        defineMessage({
          defaultMessage: 'Token',
          description: 'all-strategies-table.filters.token',
        })
      ),
      handleFilterChange: (filter) => dispatch(setAssetFilter(filter)),
    };

    const rewardsFilter: FilterControl<Token> = {
      options: strategiesParameters.rewards.map((reward) => ({
        value: reward,
        label: (
          <ContainerBox gap={1} alignItems="center">
            <TokenIcon token={reward} size={5.25} />
            <Typography variant="bodySmallSemibold">{reward.symbol}</Typography>
          </ContainerBox>
        ),
        searchParams: compact([reward.symbol, reward.name]),
      })),
      filteredOptions: strategiesFilters.rewards,
      summaryLabel: intl.formatMessage(
        defineMessage({
          defaultMessage: 'Rewards',
          description: 'all-strategies-table.filters.rewards',
        })
      ),
      handleFilterChange: (filter) => dispatch(setRewardFilter(filter)),
    };

    const farmsFilter: FilterControl<string> = {
      options: strategiesParameters.farms.map((farm) => ({
        value: farm.id,
        label: <Typography variant="bodySmallSemibold">{farm.name}</Typography>,
        searchParams: [farm.name],
      })),
      filteredOptions: strategiesFilters.farms,
      summaryLabel: intl.formatMessage(
        defineMessage({
          defaultMessage: 'Protocol',
          description: 'all-strategies-table.filters.protocol',
        })
      ),
      handleFilterChange: (filter) => dispatch(setFarmFilter(filter)),
    };

    const networksFilter: FilterControl<number> = {
      options: strategiesParameters.networks.map((network) => ({
        value: network.chainId,
        label: <Typography variant="bodySmallSemibold">{network.name}</Typography>,
        searchParams: [network.name, network.chainId.toString()],
      })),
      filteredOptions: strategiesFilters.networks,
      summaryLabel: intl.formatMessage(
        defineMessage({
          defaultMessage: 'Network',
          description: 'all-strategies-table.filters.network',
        })
      ),
      handleFilterChange: (filter) => dispatch(setNetworkFilter(filter)),
    };

    const yieldTypesFilter: FilterControl<StrategyYieldType> = {
      options: strategiesParameters.yieldTypes.map((yieldType) => ({
        value: yieldType.value,
        label: <Typography variant="bodySmallSemibold">{yieldType.label}</Typography>,
        searchParams: [yieldType.label],
      })),
      filteredOptions: strategiesFilters.yieldTypes,
      summaryLabel: intl.formatMessage(
        defineMessage({
          defaultMessage: 'Yield Type',
          description: 'all-strategies-table.filters.yield-type',
        })
      ),
      handleFilterChange: (filter) => dispatch(setYieldTypeFilter(filter)),
      hideSearch: true,
    };

    const guardiansFilter: FilterControl<string> = {
      options: strategiesParameters.guardians.map((guardian) => ({
        value: guardian.id,
        label: <Typography variant="bodySmallSemibold">{guardian.name}</Typography>,
        searchParams: [guardian.name],
      })),
      filteredOptions: strategiesFilters.guardians,
      summaryLabel: intl.formatMessage(
        defineMessage({
          defaultMessage: 'Guardians',
          description: 'all-strategies-table.filters.guardians',
        })
      ),
      handleFilterChange: (filter) => dispatch(setGuardianFilter(filter)),
    };

    return [networksFilter, assetFilter, rewardsFilter, farmsFilter, yieldTypesFilter, guardiansFilter];
  }, [intl, strategiesFilters, strategiesParameters]);

  return (
    <>
      <Button onClick={handleOpen} disabled={isLoading} variant="outlined" endIcon={<KeyboardArrowDownIcon />}>
        <FormattedMessage defaultMessage="Filters" description="all-strategies-table.filters" />
      </Button>
      <Popover
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        anchorEl={anchorEl}
        id={id}
        open={!isLoading && open}
        onClose={handleClose}
        disableAutoFocus
      >
        {filterItems.map((filters, index) => (
          <Filter<FilterTypes>
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
