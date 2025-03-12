import React from 'react';
import { Button, colors, ContainerBox, InfoCircleIcon, Typography } from 'ui-library';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { useThemeMode } from '@state/config/hooks';
import { FarmsWithAvailableDepositTokens } from '@hooks/earn/useAvailableDepositTokens';
import useAnalytics from '@hooks/useAnalytics';

const StyledOneClickMigrationCard = styled(ContainerBox).attrs(() => ({ gap: 2, alignItems: 'center' }))`
  ${({
    theme: {
      spacing,
      palette: { mode },
    },
  }) => `
    padding: ${spacing(3)};
    background-color: ${colors[mode].background.secondary};
    border: 1.5px solid ${colors[mode].semantic.informative.primary};
    border-radius: ${spacing(2)};
    max-width: 532px;
    align-self: center;
  `}
`;

const OneClickMigrationCard = ({
  farmsWithDepositableTokens,
  handleMigrationModalOpen,
}: {
  farmsWithDepositableTokens: FarmsWithAvailableDepositTokens;
  handleMigrationModalOpen: () => void;
}) => {
  const mode = useThemeMode();
  const { trackEvent } = useAnalytics();

  const onMigrationModalOpen = () => {
    trackEvent('Earn - One click migration card - Open migration modal');
    handleMigrationModalOpen();
  };

  const filteredFarmsWithDepositableTokens = React.useMemo(() => {
    return farmsWithDepositableTokens.filter((farm) => Number(farm.balance.amountInUSD) > 1);
  }, [farmsWithDepositableTokens]);

  if (filteredFarmsWithDepositableTokens.length === 0) {
    return null;
  }

  return (
    <StyledOneClickMigrationCard>
      <ContainerBox>
        <InfoCircleIcon fontSize="large" sx={{ color: colors[mode].semantic.informative.primary }} />
      </ContainerBox>
      <ContainerBox gap={1} flexDirection="column" flex={1}>
        <Typography variant="bodySmallBold">
          <FormattedMessage
            defaultMessage="Migrate Your Vaults for Full Protection and Tracking"
            description="earn.one-click-migration-card.title"
          />
        </Typography>
        <Typography variant="bodySmallRegular">
          <FormattedMessage
            defaultMessage="We've detected <span>({amount})</span> investments on external platforms. Migrate them for Guardian protection, improved tracking, and detailed performance insights."
            description="earn.one-click-migration-card.description"
            values={{
              amount: farmsWithDepositableTokens.length,
              span: (chunks) => (
                <Typography variant="bodySmallBold" color={colors[mode].semantic.informative.primary}>
                  {chunks}
                </Typography>
              ),
            }}
          />
        </Typography>
      </ContainerBox>
      <Button variant="text" color="primary" onClick={onMigrationModalOpen}>
        <FormattedMessage defaultMessage="View vaults" description="earn.one-click-migration-card.view-vaults-button" />
      </Button>
    </StyledOneClickMigrationCard>
  );
};

export default OneClickMigrationCard;
