import * as React from 'react';
import styled from 'styled-components';
import { Typography, IconButton, EditIcon, ForegroundPaper, ContainerBox, CloseIcon, colors } from 'ui-library';
import { FormattedMessage } from 'react-intl';
import { useAppDispatch } from '@hooks/state';
import { setTransferTo } from '@state/aggregator/actions';
import useAnalytics from '@hooks/useAnalytics';
import Address from '@common/components/address';

const StyledTransferToContainer = styled(ForegroundPaper).attrs({ variant: 'outlined' })`
  ${({ theme: { spacing, space } }) => `
  border-radius: ${spacing(2)};
  padding: ${space.s05};
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
  onOpenTransferTo?: () => void;
  showControls?: boolean;
}

const TransferTo = ({ transferTo, onOpenTransferTo, showControls }: TransferToProps) => {
  const dispatch = useAppDispatch();
  const { trackEvent } = useAnalytics();

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
        {showControls && onOpenTransferTo && (
          <IconButton aria-label="edit" onClick={onOpenTransferTo}>
            <EditIcon fontSize="small" sx={({ palette }) => ({ color: colors[palette.mode].typography.typo3 })} />
          </IconButton>
        )}
      </ContainerBox>
      {showControls && (
        <StyledCloseContainer>
          <IconButton aria-label="close" onClick={onRemoveAddress}>
            <CloseIcon fontSize="small" sx={({ palette }) => ({ color: colors[palette.mode].typography.typo3 })} />
          </IconButton>
        </StyledCloseContainer>
      )}
    </StyledTransferToContainer>
  );
};

export default TransferTo;
