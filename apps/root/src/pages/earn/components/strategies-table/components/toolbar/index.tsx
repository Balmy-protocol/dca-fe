import React from 'react';
import { FormattedMessage, defineMessage, useIntl } from 'react-intl';
import { ContainerBox, InputAdornment, SearchIcon, TextField, Typography, colors } from 'ui-library';
import TableFilters from '../filters';
import { StrategiesTableVariants } from '@state/strategies-filters/reducer';
import DelayedWithdrawContainer from '../delayed-withdraw-container';
import styled from 'styled-components';
import useEarnPositions from '@hooks/earn/useEarnPositions';
import { getDelayedWithdrawals } from '@common/utils/earn/parsing';

interface AllStrategiesTableToolbarProps {
  isLoading: boolean;
  handleSearchChange: (search: string) => void;
  variant: StrategiesTableVariants;
  strategiesCount: number;
  setPage: (page: number) => void;
}

const StyledTextField = styled(TextField)`
  flex: 1;
  min-width: ${({ theme: { spacing } }) => spacing(30)};
  max-width: ${({ theme: { spacing } }) => spacing(70)};
  margin-left: auto;
`;

const AllStrategiesTableToolbar = ({
  isLoading,
  handleSearchChange,
  variant,
  strategiesCount,
  setPage,
}: AllStrategiesTableToolbarProps) => {
  const intl = useIntl();

  const { userStrategies } = useEarnPositions();
  const hasDelayedWithdraws = React.useMemo(
    () => getDelayedWithdrawals({ userStrategies }).length > 0,
    [userStrategies]
  );

  React.useEffect(() => {
    // Having an uncontrolled input, the value will be stored in redux and not displayed in the input, so we need to clear it when the page is loaded
    handleSearchChange('');
  }, []);

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
      <ContainerBox
        gap={6}
        alignItems="center"
        justifyContent={!hasDelayedWithdraws ? 'end' : 'space-between'}
        flexWrap="wrap"
        flex={!hasDelayedWithdraws ? 1 : undefined}
      >
        {hasDelayedWithdraws && <DelayedWithdrawContainer />}
        <ContainerBox gap={6} alignItems="center" fullWidth={!hasDelayedWithdraws}>
          <StyledTextField
            size="small"
            placeholder={intl.formatMessage(
              defineMessage({
                defaultMessage: 'Search by Vault, Network, Assets, Guardian or Yield Type',
                description: 'allStrategiesSearch',
              })
            )}
            onChange={(evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
              handleSearchChange(evt.currentTarget.value)
            }
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
          <TableFilters isLoading={isLoading} variant={variant} setPage={setPage} />
        </ContainerBox>
      </ContainerBox>
    </ContainerBox>
  );
};

export default AllStrategiesTableToolbar;
