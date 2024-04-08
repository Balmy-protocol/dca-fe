import * as React from 'react';
import styled from 'styled-components';
import { Typography, IconButton, EditIcon, ForegroundPaper, ContainerBox, CloseIcon } from 'ui-library';
import { FormattedMessage } from 'react-intl';
import { useAppDispatch } from '@hooks/state';
import { setTransferTo } from '@state/aggregator/actions';
import useTrackEvent from '@hooks/useTrackEvent';
import Address from '@common/components/address';

const StyledTransferToContainer = styled(ForegroundPaper).attrs({ variant: 'outlined' })`
  ${({ theme: { spacing } }) => `
  border-radius: ${spacing(2)};
  padding: ${spacing(5)};
  position: relative;
  display: flex;
  flex-direction: column;
  `}
`;

const StyledCloseContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
`;

interface TransferToProps {
  transferTo: string;
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
      <Typography variant="bodySmallRegular">
        <FormattedMessage description="transferToDescription" defaultMessage="Transfer to another address:" />
      </Typography>
      <ContainerBox gap={2} alignItems="center">
        <Typography variant="bodyBold">
          <Address address={transferTo} trimAddress />
        </Typography>
        <IconButton aria-label="edit" onClick={onOpenTransferTo}>
          <EditIcon color="info" fontSize="small" />
        </IconButton>
      </ContainerBox>
      <StyledCloseContainer>
        <IconButton aria-label="close" onClick={onRemoveAddress}>
          <CloseIcon color="info" fontSize="small" />
        </IconButton>
      </StyledCloseContainer>
    </StyledTransferToContainer>
  );
};

export default TransferTo;
