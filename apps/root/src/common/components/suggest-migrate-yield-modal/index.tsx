import React from 'react';
import styled from 'styled-components';
import Modal from '@common/components/modal';
import { FormattedMessage } from 'react-intl';
import { Typography } from 'ui-library';
import { ButtonTypes } from '@common/components/button';
import { Position } from '@types';
import { changeMainTab, changeSubTab } from '@state/tabs/actions';
import { useAppDispatch } from '@hooks/state';
import usePushToHistory from '@hooks/usePushToHistory';

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
  const pushToHistory = usePushToHistory();
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
      label: <FormattedMessage description="addFundsExisting" defaultMessage="Add funds to existing position" />,
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
        dispatch(changeSubTab(0));
        pushToHistory(`/create/${position.chainId}/${position.from.address}/${position.to.address}`);
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
            defaultMessage="One or both of the tokens in this position allow generating yield while your positions gets swapped. We suggest creating a new position so it starts generating yield for you. If you agree, we will send you to the create page with the same tokens specified in your position."
          />
        </Typography>
        <Typography variant="body1" textAlign="left">
          <FormattedMessage
            description="howItWorksDescriptionStep1"
            defaultMessage="If you don't want to do this, you can still add funds to your current position."
          />
        </Typography>
      </StyledSuggestMigrateContainer>
    </Modal>
  );
};
export default SuggestMigrateYieldModal;
