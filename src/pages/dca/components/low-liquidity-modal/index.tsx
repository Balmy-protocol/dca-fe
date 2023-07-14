import React from 'react';
import styled from 'styled-components';
import Modal from '@common/components/modal';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { POSSIBLE_ACTIONS } from '@constants';

const StyledLink = styled(Link)`
  ${({ theme }) => `
    color: ${theme.palette.mode === 'light' ? '#3f51b5' : '#8699ff'}
  `}
`;

const StyledLowLiquidityContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
`;

interface LowLiquidityModalProps {
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  actionToTake: keyof typeof POSSIBLE_ACTIONS;
}

const LowLiquidityModal = ({ actionToTake, onConfirm, open, onCancel }: LowLiquidityModalProps) => {
  const actionMessages = React.useMemo(
    () => ({
      [POSSIBLE_ACTIONS.createPosition]: (
        <FormattedMessage description="lowLiqCreatePosition" defaultMessage="Create position anyway" />
      ),
      [POSSIBLE_ACTIONS.approveToken]: (
        <FormattedMessage description="lowLiqApproveToken" defaultMessage="Authorize token" />
      ),
    }),
    []
  );

  return (
    <Modal
      open={open}
      showCloseButton
      showCloseIcon
      onClose={onCancel}
      maxWidth="sm"
      title={<FormattedMessage description="low liquidity title" defaultMessage="Low liquidity on pair" />}
      actions={[
        {
          color: 'error',
          variant: 'contained',
          onClick: onConfirm,
          label: actionMessages[actionToTake],
        },
      ]}
    >
      <StyledLowLiquidityContainer>
        <Typography variant="body1" component="p">
          <FormattedMessage
            description="low liquidity message"
            defaultMessage="Due to low volume, the price oracle for this pair might not be reliable or accurate, this means that swaps might not get executed or will be executed with incorrect pricing. Proceed with caution or try another pair."
          />
        </Typography>
        <Typography variant="body1" component="p">
          <StyledLink href="https://docs.mean.finance/concepts/price-oracle" target="_blank">
            <FormattedMessage description="low liquidity link" defaultMessage="Read about price oracle" />
          </StyledLink>
        </Typography>
      </StyledLowLiquidityContainer>
    </Modal>
  );
};
export default LowLiquidityModal;
