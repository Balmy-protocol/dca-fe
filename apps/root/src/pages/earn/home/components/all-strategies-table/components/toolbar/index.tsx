import React from 'react';
import { useThemeMode } from '@state/config/hooks';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { ContainerBox, InputAdornment, SearchIcon, TextField, Typography, colors } from 'ui-library';
import TableFilters from '../filters';

interface AllStrategiesTableToolbarProps {
  isLoading: boolean;
  handleSearchChange: (search: string) => void;
}

const AllStrategiesTableToolbar = ({ isLoading, handleSearchChange }: AllStrategiesTableToolbarProps) => {
  const intl = useIntl();
  const themeMode = useThemeMode();

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
          onChange={(evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
            handleSearchChange(evt.currentTarget.value)
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
