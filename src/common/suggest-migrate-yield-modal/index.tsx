import React from 'react';
import styled from 'styled-components';
import Modal from 'common/modal';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import { ButtonTypes } from 'common/button';
import { Position } from 'types';
import { useHistory } from 'react-router-dom';
import { changeMainTab } from 'state/tabs/actions';
import { useAppDispatch } from 'hooks/state';

const StyledSuggestMigrateContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

interface SuggestMigrateYieldModalProps {
  onCancel: () => void;
  open: boolean;
  onAddFunds: (position: Position) => void;
  position: Position;
}

const SuggestMigrateYieldModal = ({ open, onCancel, onAddFunds, position }: SuggestMigrateYieldModalProps) => {
  const history = useHistory();
  const dispatch = useAppDispatch();

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
        <FormattedMessage description="generateYield" defaultMessage="Create a position and start generating yield" />
      ),
      onClick: () => {
        onCancel();
        dispatch(changeMainTab(0));
        history.push(`/create/${position.chainId}/${position.from.address}/${position.to.address}`);
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
            defaultMessage="The tokens in this position allow generating yield while your positions gets swapped. We suggest creating a new position so it starts generating yield, if you don't want to do this you can still add funds to your current position and not generate yield."
          />
        </Typography>
        <Typography variant="body1" textAlign="left">
          <FormattedMessage
            description="howItWorksDescriptionStep1"
            defaultMessage="We send you to the create page with the same tokens specified in your position"
          />
        </Typography>
      </StyledSuggestMigrateContainer>
    </Modal>
  );
};
export default SuggestMigrateYieldModal;
