import * as React from 'react';
import styled from 'styled-components';
import { Typography, IconButton, EditIcon, DeleteOutlineIcon, Button } from 'ui-library';
import { FormattedMessage } from 'react-intl';
import { useAppDispatch } from '@hooks/state';
import { setTransferTo } from '@state/aggregator/actions';
import useTrackEvent from '@hooks/useTrackEvent';

const StyledTransferToContainer = styled.div`
  display: flex;
  flex: 1;
`;

const StyledNoTransferContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
`;

const StyledConfirmedTransferToContainer = styled.div`
  display: flex;
  padding: 16px 12px;
  align-items: center;
  justify-content: space-between;
  flex: 1;
`;

const StyledConfirmedTransferToAddress = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledConfirmedTransferToIconsContainer = styled.div`
  display: flex;
  align-items: center;
`;

interface TransferToProps {
  transferTo: string | null;
  onOpenTransferTo: () => void;
}

const TransferTo = ({ transferTo, onOpenTransferTo }: TransferToProps) => {
  const dispatch = useAppDispatch();
  const trackEvent = useTrackEvent();

  const onRemoveAddress = () => {
    dispatch(setTransferTo(null));
    trackEvent('Aggregator - Cancel transfer to');
  };

  return (
    <StyledTransferToContainer>
      {!transferTo && (
        <StyledNoTransferContainer>
          <Typography variant="bodySmall">
            <FormattedMessage description="transferToDescription" defaultMessage="Transfer to another address:" />
          </Typography>
          <Button variant="outlined" onClick={onOpenTransferTo}>
            <FormattedMessage description="transferToSelectAddress" defaultMessage="Select address" />
          </Button>
        </StyledNoTransferContainer>
      )}
      {!!transferTo && (
        <StyledConfirmedTransferToContainer>
          <StyledConfirmedTransferToAddress>
            <Typography variant="body">
              <FormattedMessage description="transferToDescription" defaultMessage="Transfer to another address:" />
            </Typography>
            <Typography variant="caption">{transferTo}</Typography>
          </StyledConfirmedTransferToAddress>
          <StyledConfirmedTransferToIconsContainer>
            <IconButton aria-label="close" size="medium" onClick={onOpenTransferTo}>
              <EditIcon fontSize="inherit" />
            </IconButton>
            <IconButton aria-label="close" size="medium" onClick={onRemoveAddress}>
              <DeleteOutlineIcon fontSize="inherit" />
            </IconButton>
          </StyledConfirmedTransferToIconsContainer>
        </StyledConfirmedTransferToContainer>
      )}
    </StyledTransferToContainer>
  );
};

export default TransferTo;
