import React from 'react';
import styled from 'styled-components';
import Modal from '@common/components/modal';
import { FormattedMessage } from 'react-intl';
import useTrackEvent from '@hooks/useTrackEvent';
import { Typography } from '@mui/material';

const StyledFailedQuotesContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
  flex: 1;
  gap: 10px;
`;
interface FailedQuotesModalProps {
  open: boolean;
  onCancel: () => void;
  onGoBack: () => void;
}

const FailedQuotesModal = ({ open, onCancel, onGoBack }: FailedQuotesModalProps) => {
  const trackEvent = useTrackEvent();

  const handleOnClose = () => {
    onCancel();
    onGoBack();
    trackEvent('Aggregator - All quotes simulation failed go back');
  };

  return (
    <Modal
      open={open}
      maxWidth="xs"
      title={<FormattedMessage description="failedQuotes title" defaultMessage="All quotes will fail" />}
      actions={[
        {
          label: (
            <FormattedMessage description="failedQuotes reject action" defaultMessage="Go back and search again" />
          ),
          color: 'default',
          variant: 'outlined',
          onClick: handleOnClose,
        },
      ]}
    >
      <StyledFailedQuotesContainer>
        <Typography variant="body1">
          <FormattedMessage
            description="failedQuote selectBetterQuote"
            defaultMessage="After simulating quotes, we found that all would fail if executed. We are sorry for this outcome. You can try searching for quotes again."
          />
        </Typography>
      </StyledFailedQuotesContainer>
    </Modal>
  );
};
export default FailedQuotesModal;
