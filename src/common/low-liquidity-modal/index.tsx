import React from 'react';
import styled from 'styled-components';
import Modal from 'common/modal';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { POSSIBLE_ACTIONS } from 'config/constants';

const StyledLink = styled(Link)`
  ${({ theme }) => `
    color: ${theme.palette.mode === 'light' ? '#3f51b5' : '#8699ff'}
  `}
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
        <FormattedMessage description="lowLiqCreatePosition" defaultMessage="Create position" />
      ),
      [POSSIBLE_ACTIONS.approveToken]: (
        <FormattedMessage description="lowLiqApproveToken" defaultMessage="Approve token" />
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
      actions={[
        {
          color: 'secondary',
          variant: 'contained',
          onClick: onConfirm,
          label: actionMessages[actionToTake],
        },
      ]}
    >
      <Typography variant="body1" component="p">
        <FormattedMessage
          description="low liquidity message"
          defaultMessage="Due to low volume, the price oracle for this pair of tokens might not be reliable right now. Proceed with caution or try another pair"
        />
      </Typography>
      <Typography variant="body1" component="p">
        <StyledLink href="https://docs.mean.finance/concepts/price-oracle" target="_blank">
          <FormattedMessage description="low liquidity link" defaultMessage="Read about price oracle" />
        </StyledLink>
      </Typography>
    </Modal>
  );
};
export default LowLiquidityModal;
