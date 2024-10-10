import React from 'react';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { ContainerBox, InputAdornment, SearchIcon, TextField, Typography, colors } from 'ui-library';
import TableFilters from '../filters';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import PendingDelayedWithdrawals from '../pending-delayed-withdrawals';
import ReadyDelayedWithdrawals from '../ready-delayed-withdrawals';

interface AllStrategiesTableToolbarProps {
  isLoading: boolean;
  handleSearchChange: (search: string) => void;
  variant: StrategiesTableVariants;
  strategiesCount: number;
}

const AllStrategiesTableToolbar = ({
  isLoading,
  handleSearchChange,
  variant,
  strategiesCount,
}: AllStrategiesTableToolbarProps) => {
  const intl = useIntl();

  return (
    <ContainerBox justifyContent="space-between" alignItems="end" flexWrap="wrap" gap={3}>
      {variant === StrategiesTableVariants.ALL_STRATEGIES ? (
        <Typography variant="h2Bold" color={({ palette: { mode } }) => colors[mode].typography.typo1}>
          <FormattedMessage description="earn.all-strategies-table.title" defaultMessage="All Vaults" />
        </Typography>
      ) : (
        <ContainerBox alignItems="center" gap={2}>
          <Typography variant="h3Bold" color={({ palette: { mode } }) => colors[mode].typography.typo1}>
            <FormattedMessage description="earn.user-strategies-table.title" defaultMessage="Active Vaults" />
          </Typography>
          <Typography variant="bodySmallRegular">
            {' · '}
            {strategiesCount === 1 ? (
              <FormattedMessage
                description="earn.user-strategies-table.active-strategies-amount"
                defaultMessage="{amount} Investment"
                values={{ amount: strategiesCount }}
              />
            ) : (
              <FormattedMessage
                description="earn.user-strategies-table.active-strategies-amount.plural"
                defaultMessage="{amount} Investments"
                values={{ amount: strategiesCount }}
              />
            )}
          </Typography>
        </ContainerBox>
      )}
      <ContainerBox gap={6} alignItems="center">
        <ContainerBox gap={3} alignItems="center">
          <ReadyDelayedWithdrawals />
          <PendingDelayedWithdrawals />
        </ContainerBox>
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
        <TableFilters isLoading={isLoading} variant={variant} />
      </ContainerBox>
    </ContainerBox>
  );
};

export default AllStrategiesTableToolbar;
