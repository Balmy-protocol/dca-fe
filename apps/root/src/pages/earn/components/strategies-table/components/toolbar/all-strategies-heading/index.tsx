import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, colors, ContainerBox, NotificationIcon, Typography } from 'ui-library';
import styled from 'styled-components';
import { FarmsWithAvailableDepositTokens } from '@hooks/earn/useAvailableDepositTokens';
import useAnalytics from '@hooks/useAnalytics';
import NotifyEmailModal from './notify-email-modal';
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
  handleMigrationModalOpen,
}: {
  farmsWithDepositableTokens?: FarmsWithAvailableDepositTokens;
  handleMigrationModalOpen?: () => void;
}) => {
  const { trackEvent } = useAnalytics();
  const [isNotifyEmailModalOpen, setIsNotifyEmailModalOpen] = useState(false);
  const migrableTokensAmount = farmsWithDepositableTokens?.filter(
    (farm) => Number(farm.balance.amountInUSD) > 1
  ).length;

  const onMigrationModalOpen = () => {
    if (!handleMigrationModalOpen) {
      return;
    }
    handleMigrationModalOpen();
    trackEvent('Earn - One click migration - Table Toolbar - Open migration modal');
  };

  return (
    <>
      <NotifyEmailModal isOpen={isNotifyEmailModalOpen} onClose={() => setIsNotifyEmailModalOpen(false)} />
      <ContainerBox alignItems="center" gap={6}>
        <Typography variant="h2Bold" color={({ palette: { mode } }) => colors[mode].typography.typo1}>
          <FormattedMessage description="earn.all-strategies-table.title" defaultMessage="All Vaults" />
        </Typography>
        <ContainerBox alignItems="center" gap={2}>
          <Button variant="text" onClick={() => setIsNotifyEmailModalOpen(true)} sx={{ display: 'flex', gap: 1 }}>
            <ContainerBox alignItems="center" gap={1}>
              <NotificationIcon sx={({ palette: { mode } }) => ({ color: colors[mode].accentPrimary })} />
              <FormattedMessage
                description="earn.all-strategies-table.notify-email-vaults"
                defaultMessage="Notify me of new vaults"
              />
            </ContainerBox>
          </Button>
          <Button
            variant="text"
            onClick={onMigrationModalOpen}
            sx={{ display: 'flex', gap: 1 }}
            disabled={migrableTokensAmount === 0}
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
      </ContainerBox>
    </>
  );
};

export default AllStrategiesHeading;
