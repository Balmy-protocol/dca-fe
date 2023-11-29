import React from 'react';
import styled from 'styled-components';
import Modal from '@common/components/modal';
import { FormattedMessage } from 'react-intl';
import { Typography, Link } from 'ui-library';

const StyledLink = styled(Link)`
  ${({ theme }) => `
    color: ${theme.palette.mode === 'light' ? '#3f51b5' : '#8699ff'}
  `}
`;

const StyledStalePairContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  text-align: left;
  gap: 5px;
`;

interface StalePairModalProps {
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
}

const StalePairModal = ({ onConfirm, open, onCancel }: StalePairModalProps) => (
  <Modal
    open={open}
    onClose={onCancel}
    showCloseButton
    actions={[
      {
        color: 'secondary',
        variant: 'contained',
        onClick: onConfirm,
        label: <FormattedMessage description="Create position submit" defaultMessage="Create position" />,
      },
    ]}
  >
    <StyledStalePairContainer>
      <Typography variant="body" component="span">
        <FormattedMessage description="stale pair message" defaultMessage="This pair is " />
      </Typography>
      <Typography variant="body" component="span">
        <StyledLink href="https://docs.mean.finance/concepts/positions#stale-positions" target="_blank">
          <FormattedMessage description="stale" defaultMessage="stale" />
        </StyledLink>
      </Typography>
      <Typography variant="body" component="span">
        <FormattedMessage
          description="stale pair message"
          defaultMessage=" for that frequency. Are you sure you want to create a position?"
        />
      </Typography>
    </StyledStalePairContainer>
  </Modal>
);

export default StalePairModal;
