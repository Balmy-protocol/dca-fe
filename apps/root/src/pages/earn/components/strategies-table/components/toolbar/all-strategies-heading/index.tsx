import OneClickMigrationModal from '@pages/earn/home/components/one-click-migration-modal';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, colors, ContainerBox, Typography } from 'ui-library';
import styled from 'styled-components';
import { FarmsWithAvailableDepositTokens } from '@hooks/earn/useAvailableDepositTokens';

const StyledMigrationAmount = styled(ContainerBox).attrs({
  alignItems: 'center',
  justifyContent: 'center',
})`
  ${({ theme: { palette, spacing } }) => `
    background-color: ${colors[palette.mode].accentPrimary};
    border-radius: 100px;
    width: ${spacing(4.5)};
    height: ${spacing(4.5)};
  `}
`;

const AllStrategiesHeading = ({
  farmsWithDepositableTokens = [],
  updateFarmTokensBalances,
}: {
  farmsWithDepositableTokens?: FarmsWithAvailableDepositTokens;
  updateFarmTokensBalances?: () => Promise<void>;
}) => {
  const [open, setOpen] = React.useState(false);
  const migrableTokensAmount = farmsWithDepositableTokens?.filter(
    (farm) => Number(farm.balance.amountInUSD) > 1
  ).length;

  return (
    <>
      <OneClickMigrationModal
        open={open}
        onClose={() => setOpen(false)}
        farmsWithDepositableTokens={farmsWithDepositableTokens}
        updateFarmTokensBalances={updateFarmTokensBalances}
      />
      <ContainerBox alignItems="center" gap={6}>
        <Typography variant="h2Bold" color={({ palette: { mode } }) => colors[mode].typography.typo1}>
          <FormattedMessage description="earn.all-strategies-table.title" defaultMessage="All Vaults" />
        </Typography>
        <Button
          variant="text"
          onClick={() => setOpen(true)}
          sx={{ display: 'flex', gap: 1 }}
          endIcon={
            migrableTokensAmount > 0 && (
              <StyledMigrationAmount>
                <Typography variant="labelRegular" color={({ palette }) => colors[palette.mode].typography.white}>
                  {migrableTokensAmount}
                </Typography>
              </StyledMigrationAmount>
            )
          }
        >
          <FormattedMessage
            description="earn.all-strategies-table.migrate-investments"
            defaultMessage="Migrate Investments"
          />
        </Button>
      </ContainerBox>
    </>
  );
};

export default AllStrategiesHeading;
