import React from 'react';
import some from 'lodash/some';
import { useAppDispatch } from '@state/hooks';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  ContainerBox,
  ForegroundPaper,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  Popover,
  SearchIcon,
  TextField,
  Typography,
  colors,
} from 'ui-library';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { useStrategiesFilters } from '@state/strategies-filters/hooks';
import { SetStateCallback, StrategyYieldType, Token } from 'common-types';
import {
  resetFilters,
  setAssetFilter,
  setProtocolFilter,
  setGuardianFilter,
  setNetworkFilter,
  setRewardFilter,
  setYieldTypeFilter,
} from '@state/strategies-filters/actions';
import { useStrategiesParameters } from '@hooks/earn/useStrategiesParameters';
import TokenIcon from '@common/components/token-icon';
import styled from 'styled-components';
import { getNetworkCurrencyTokens, toToken } from '@common/utils/currency';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import { AnyAction } from 'redux';
import useCurrentBreakpoint from '@hooks/useCurrentBreakpoint';

const StyledContainer = styled(ForegroundPaper).attrs({ variant: 'outlined' })`
  ${({ theme: { spacing } }) => `
  padding: ${spacing(3)};
  display: flex;
  flex-direction: column;
  gap: ${spacing(1)};
  max-height: ${spacing(75)};
  overflow: auto;
  `}
`;

const StyledControlButton = styled(Button)`
  ${({ theme: { spacing } }) => `
    border-radius: ${spacing(2.5)};
  `}
`;

const StyledFilterAccordion = styled(Accordion)`
  ${({ theme: { palette, spacing } }) => `
    padding: ${spacing(3)};
    background: ${colors[palette.mode].background.tertiary};
    border-radius: ${spacing(2)} !important;
  `}
`;

const StyledAccordionDetails = styled(AccordionDetails)`
  ${({ theme: { spacing } }) => `
    padding: 0;
    gap: ${spacing(1)};
  `}
`;

const StyledACcordionSummaryTitle = styled(ContainerBox).attrs({
  justifyContent: 'space-between',
  fullWidth: true,
  alignItems: 'center',
})`
  ${({ theme: { spacing } }) => `
    padding-right: ${spacing(1)};
  `}
`;

const StyledFormControlLabel = styled(FormControlLabel)`
  margin: 0px;
`;

const StyledCheckbox = styled(Checkbox)`
  ${({ theme: { spacing } }) => `
    padding: ${spacing(1)};
  `}
`;

const StyledAccordionSummary = styled(AccordionSummary)<{ expanded: boolean }>`
  ${({ theme: { spacing }, expanded }) => `
    margin-bottom: ${expanded ? spacing(3) : 0};
  `}
`;

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
  disabled?: boolean;
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
    <StyledFilterAccordion expanded={expanded === id} onChange={handleExpandChange}>
      <StyledAccordionSummary expanded={expanded === id}>
        <StyledACcordionSummaryTitle>
          <Typography variant="bodySmallSemibold">{summaryLabel}</Typography>
          {filteredOptions.length === 0 && (
            <Typography variant="bodySmallSemibold" color={({ palette: { mode } }) => colors[mode].typography.typo4}>
              <FormattedMessage defaultMessage="All" description="earn.all-strategies-table.filters.all" />
            </Typography>
          )}
        </StyledACcordionSummaryTitle>
      </StyledAccordionSummary>
      <StyledAccordionDetails>
        {!hideSearch && (
          <TextField
            size="small"
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
        {optionsFilteredBySearch.length > 0 ? (
          <ContainerBox flexDirection="column">
            {optionsFilteredBySearch.map((filter, index) => (
              <FormGroup key={index}>
                <StyledFormControlLabel
                  control={
                    <StyledCheckbox
                      onChange={() => onChangeFilter(filter.value)}
                      checked={filteredOptions.includes(filter.value)}
                    />
                  }
                  label={filter.label}
                />
              </FormGroup>
            ))}
          </ContainerBox>
        ) : (
          <Typography variant="bodySmallBold">
            <FormattedMessage defaultMessage="No options found" description="all-strategies-table.filters.no-options" />
          </Typography>
        )}
      </StyledAccordionDetails>
    </StyledFilterAccordion>
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
  getOptionLabel: (option: Option) => string | Token;
  hideSearch?: boolean;
}): FilterControl<Filter> {
  const formattedOptions: FilterOption<Filter>[] = options.map((option) => {
    const labelData = getOptionLabel(option);
    return {
      value: getOptionValue(option),
      label:
        typeof labelData === 'string' ? (
          <Typography variant="bodySmallSemibold">{labelData}</Typography>
        ) : (
          <ContainerBox gap={1} alignItems="center">
            <TokenIcon token={labelData} size={4.5} />
            <Typography variant="bodySmallSemibold">{labelData.symbol}</Typography>
          </ContainerBox>
        ),
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

interface TableFiltersProps {
  isLoading: boolean;
  variant: StrategiesTableVariants;
  disabled?: boolean;
  setPage: (page: number) => void;
}

const TableFilters = ({ isLoading, variant, disabled, setPage }: TableFiltersProps) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const strategiesFilters = useStrategiesFilters(variant);
  const strategiesParameters = useStrategiesParameters(variant);
  const [expandedFilter, setExpandedFilter] = React.useState(0);
  const currentBreakpoint = useCurrentBreakpoint();

  const isDownMd = currentBreakpoint === 'xs' || currentBreakpoint === 'sm';

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const onResetFilters = () => {
    dispatch(resetFilters(variant));
    setPage(0);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'strategies-filters-popover' : undefined;

  const onFilterChange = React.useCallback(
    <T,>(filter: T, action: (payload: { variant: StrategiesTableVariants; value: T }) => AnyAction) => {
      dispatch(action({ variant, value: filter }));
      setPage(0);
    },
    []
  );

  const filterItems = React.useMemo<FilterControl<FilterTypes>[]>(() => {
    const assetFilter = createFilterControl({
      options: strategiesParameters.assets,
      filteredOptions: strategiesFilters.assets,
      summaryLabel: intl.formatMessage({
        defaultMessage: 'Token',
        description: 'earn.all-strategies-table.filters.token',
      }),
      handleFilterChange: (filter) => onFilterChange(filter, setAssetFilter),
      getSearchParams: (asset) => [asset.symbol, asset.name],
      getOptionLabel: (asset) => asset,
      getOptionValue: (asset) => asset,
    });

    const rewardsFilter = createFilterControl({
      options: strategiesParameters.rewards,
      filteredOptions: strategiesFilters.rewards,
      summaryLabel: intl.formatMessage({
        defaultMessage: 'Rewards',
        description: 'earn.all-strategies-table.filters.rewards',
      }),
      handleFilterChange: (filter) => onFilterChange(filter, setRewardFilter),
      getSearchParams: (reward) => [reward.symbol, reward.name],
      getOptionLabel: (reward) => reward,
      getOptionValue: (reward) => reward,
    });

    const protocolsFilter = createFilterControl({
      options: strategiesParameters.protocols,
      filteredOptions: strategiesFilters.protocols,
      summaryLabel: intl.formatMessage(
        defineMessage({
          defaultMessage: 'Protocol',
          description: 'earn.all-strategies-table.filters.protocol',
        })
      ),
      handleFilterChange: (filter) => onFilterChange(filter, setProtocolFilter),
      getSearchParams: (protocol) => [protocol],
      getOptionLabel: (protocol) => protocol,
      getOptionValue: (protocol) => protocol,
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
      handleFilterChange: (filter) => onFilterChange(filter, setNetworkFilter),
      getSearchParams: (network) => [network.name, network.chainId.toString()],
      getOptionLabel: (network) =>
        toToken({ ...getNetworkCurrencyTokens(network).mainCurrencyToken, symbol: network.name }),
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
      handleFilterChange: (filter) => onFilterChange(filter, setYieldTypeFilter),
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
      handleFilterChange: (filter) => onFilterChange(filter, setGuardianFilter),
      getSearchParams: (guardian) => [guardian.name],
      getOptionLabel: (guardian) =>
        toToken({
          logoURI: guardian.logo || '',
          symbol: guardian.name,
        }),
      getOptionValue: (guardian) => guardian.id,
    });

    return [networksFilter, assetFilter, rewardsFilter, protocolsFilter, yieldTypesFilter, guardiansFilter];
  }, [intl, strategiesFilters, variant, strategiesParameters]);

  const hasSelectedAnyFilter = React.useMemo(
    () =>
      some(
        Object.keys(strategiesFilters),
        (filter: keyof typeof strategiesFilters) =>
          !!(strategiesFilters[filter] as unknown[]).length && filter !== 'search'
      ),
    [strategiesFilters, variant]
  );

  return (
    <ContainerBox alignItems="center" justifyContent="flex-end" gap={3}>
      <StyledControlButton onClick={handleOpen} disabled={isLoading || disabled} variant="outlined">
        <FormattedMessage defaultMessage="Filters" description="earn.all-strategies-table.filters" />
      </StyledControlButton>
      {!isDownMd && (
        <StyledControlButton
          onClick={onResetFilters}
          disabled={isLoading || !hasSelectedAnyFilter || disabled}
          variant="outlined"
        >
          <FormattedMessage defaultMessage="Clear all" description="earn.all-strategies-table.clear-filters" />
        </StyledControlButton>
      )}
      <Popover
        anchorEl={anchorEl}
        id={id}
        open={!isLoading && open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        disableScrollLock
      >
        <StyledContainer>
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
        </StyledContainer>
      </Popover>
    </ContainerBox>
  );
};

export default TableFilters;
