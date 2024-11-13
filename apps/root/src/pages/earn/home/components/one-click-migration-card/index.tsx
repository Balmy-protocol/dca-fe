import React from 'react';
import { Button, colors, ContainerBox, InfoCircleIcon, Typography } from 'ui-library';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { useThemeMode } from '@state/config/hooks';
import useAvailableDepositTokens from '@hooks/earn/useAvailableDepositTokens';

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
  `}
`;

const OneClickMigrationCard = () => {
  const mode = useThemeMode();
  const tokensWithBalance = useAvailableDepositTokens();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleOpenVaults = () => {
    // Open the migrate vault modal
  };

  if (tokensWithBalance.length === 0) {
    return null;
  }

  return (
    <StyledOneClickMigrationCard>
      {/* icon */}
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
              amount: tokensWithBalance.length,
              span: (chunks) => (
                <Typography variant="bodySmallBold" color={colors[mode].semantic.informative.primary}>
                  {chunks}
                </Typography>
              ),
            }}
          />
        </Typography>
      </ContainerBox>
      <Button variant="text" color="primary">
        <FormattedMessage defaultMessage="View vaults" description="earn.one-click-migration-card.view-vaults-button" />
      </Button>
    </StyledOneClickMigrationCard>
  );
};

export default OneClickMigrationCard;
