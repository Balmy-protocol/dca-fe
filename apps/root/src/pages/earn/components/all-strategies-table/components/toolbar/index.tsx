import React from 'react';
import { useThemeMode } from '@state/config/hooks';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { ContainerBox, InputAdornment, SearchIcon, TextField, Typography, colors } from 'ui-library';
import TableFilters from '../filters';
import { useAllStrategiesFilters } from '@state/all-strategies-filters/hooks';

interface AllStrategiesTableToolbarProps {
  isLoading: boolean;
  setSearch: (search: string) => void;
}

const AllStrategiesTableToolbar = ({ isLoading, setSearch }: AllStrategiesTableToolbarProps) => {
  const intl = useIntl();
  const themeMode = useThemeMode();
  const { search } = useAllStrategiesFilters();

  return (
    <ContainerBox justifyContent="space-between" alignItems="end">
      <Typography variant="h4Bold" color={colors[themeMode].typography.typo1}>
        <FormattedMessage description="earn.all-strategies-table.title" defaultMessage="All Vaults" />
      </Typography>
      <ContainerBox gap={6}>
        <TextField
          size="small"
          placeholder={intl.formatMessage(
            defineMessage({
              defaultMessage: 'Search by Vault, Chain, Assets, Guardian or Yield Type',
              description: 'allStrategiesSearch',
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
        <TableFilters isLoading={isLoading} />
      </ContainerBox>
    </ContainerBox>
  );
};

export default AllStrategiesTableToolbar;
