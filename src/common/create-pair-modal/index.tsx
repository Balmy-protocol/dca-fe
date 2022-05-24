import React from 'react';
import styled from 'styled-components';
import Modal from 'common/modal';
import LoadingIndicator from 'common/centered-loading-indicator';
import { Token } from 'types';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';

const StyledLoadingIndicatorWrapper = styled.div`
  margin: 40px;
`;

const StyledCreatePositionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
`;

interface CreatePairModalProps {
  from: Token | null;
  to: Token | null;
  onCancel: () => void;
  open: boolean;
  onCreatePair: () => void;
}

const CreatePairModal = ({ from, to, open, onCancel, onCreatePair }: CreatePairModalProps) => {
  const isLoading = false;

  return (
    <Modal
      open={open}
      showCloseButton
      onClose={onCancel}
      showCloseIcon
      maxWidth="sm"
      title={
        <FormattedMessage
          description="First deposit"
          defaultMessage="Create position for {from}/{to}"
          values={{ from: (from && from.symbol) || '', to: (to && to.symbol) || '' }}
        />
      }
      actions={[
        {
          color: 'secondary',
          variant: 'contained',
          onClick: onCreatePair,
          label: <FormattedMessage description="Create pair submit" defaultMessage="Create position" />,
        },
      ]}
    >
      {isLoading ? (
        <>
          <StyledLoadingIndicatorWrapper>
            <LoadingIndicator size={70} />
          </StyledLoadingIndicatorWrapper>
          <Typography variant="body1">
            <FormattedMessage
              description="calculate pair cost"
              defaultMessage="Calculating the cost of creating this position"
            />
          </Typography>
        </>
      ) : (
        <StyledCreatePositionContainer>
          <Typography variant="body1">
            <FormattedMessage
              description="create pair question"
              defaultMessage="You are the first person to create a position for this pair of tokens. Because of this, the gas cost is going to be higher than a normal position creation. This, however, will be a one time operation. Are you sure you want to create the {from}/{to} position?"
              values={{ from: (from && from.symbol) || '', to: (to && to.symbol) || '' }}
            />
          </Typography>
        </StyledCreatePositionContainer>
      )}
    </Modal>
  );
};
export default CreatePairModal;
