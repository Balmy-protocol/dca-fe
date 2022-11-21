import * as React from 'react';
import styled from 'styled-components';
import Button from 'common/button';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import { useAppDispatch } from 'hooks/state';
import { setTransferTo } from 'state/aggregator/actions';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

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
  border: 1px solid rgba(255, 255, 255, 0.5);
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

  const onRemoveAddress = () => {
    dispatch(setTransferTo(null));
  };

  return (
    <StyledTransferToContainer>
      {!transferTo && (
        <StyledNoTransferContainer>
          <Typography variant="body2">
            <FormattedMessage description="transferToDescription" defaultMessage="Transfer to another address:" />
          </Typography>
          <Button variant="outlined" color="default" onClick={onOpenTransferTo}>
            <FormattedMessage description="transferToSelectAddress" defaultMessage="Select address" />
          </Button>
        </StyledNoTransferContainer>
      )}
      {!!transferTo && (
        <StyledConfirmedTransferToContainer>
          <StyledConfirmedTransferToAddress>
            <Typography variant="body1">
              <FormattedMessage description="transferToDescription" defaultMessage="Transfer to another address:" />
            </Typography>
            <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">
              {transferTo}
            </Typography>
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
