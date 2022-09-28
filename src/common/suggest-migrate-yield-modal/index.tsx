import React from 'react';
import styled from 'styled-components';
import Modal from 'common/modal';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import { ButtonTypes } from 'common/button';
import { Position } from 'types';

const StyledSuggestMigrateContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

interface SuggestMigrateYieldModalProps {
  onCancel: () => void;
  open: boolean;
  onMigrate: (position: Position) => void;
  onAddFunds: (position: Position) => void;
  position: Position;
}

const SuggestMigrateYieldModal = ({
  open,
  onCancel,
  onAddFunds,
  onMigrate,
  position,
}: SuggestMigrateYieldModalProps) => {
  const handleCancel = () => {
    onCancel();
  };

  const actions: {
    label: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    color?: keyof typeof ButtonTypes;
    variant?: 'text' | 'outlined' | 'contained';
  }[] = [
    {
      color: 'secondary',
      variant: 'contained',
      label: <FormattedMessage description="addFunds" defaultMessage="Add funds" />,
      onClick: () => {
        onCancel();
        onAddFunds(position);
      },
    },
    {
      color: 'migrate',
      variant: 'contained',
      label: (
        <FormattedMessage description="generateYield" defaultMessage="Migrate position and start generating yield" />
      ),
      onClick: () => {
        onCancel();
        onMigrate(position);
      },
    },
  ];

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      showCloseIcon
      maxWidth="md"
      title={<FormattedMessage description="startGainYield title" defaultMessage="You can start generating yield" />}
      actions={actions}
    >
      <StyledSuggestMigrateContainer>
        <Typography variant="body1" textAlign="left">
          <FormattedMessage
            description="whyYouShouldMigrate"
            defaultMessage="The tokens in this position allow generating yield while your positions gets swapped. We suggest migrating your position so it starts generating yield, if you don't want to do this you can still add funds to your current position and not generate yield."
          />
        </Typography>
        <Typography variant="body1" textAlign="left">
          <FormattedMessage
            description="howItWorksDescriptionStep1"
            defaultMessage="We will need to first terminate your position and then open a new one where you will start generating yield. Your historical data from this position will appear as a terminated position"
          />
        </Typography>
      </StyledSuggestMigrateContainer>
    </Modal>
  );
};
export default SuggestMigrateYieldModal;
