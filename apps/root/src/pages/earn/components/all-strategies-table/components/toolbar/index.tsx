import React from 'react';
import { useThemeMode } from '@state/config/hooks';
import { FormattedMessage } from 'react-intl';
import { ContainerBox, Typography, colors } from 'ui-library';
import TableFilters from '../filters';

interface AllStrategiesTableToolbarProps {
  isLoading: boolean;
}

const AllStrategiesTableToolbar = ({ isLoading }: AllStrategiesTableToolbarProps) => {
  const themeMode = useThemeMode();
  return (
    <ContainerBox justifyContent="space-between" alignItems="end">
      <Typography variant="h4Bold" color={colors[themeMode].typography.typo1}>
        <FormattedMessage description={'allVaults'} defaultMessage={'All Vaults'} />
      </Typography>
      <TableFilters isLoading={isLoading} />
    </ContainerBox>
  );
};

export default AllStrategiesTableToolbar;
