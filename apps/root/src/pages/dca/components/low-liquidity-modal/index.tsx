import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Typography, Link, Modal } from 'ui-library';
import { POSSIBLE_ACTIONS } from '@constants';

const StyledLink = styled(Link)``;

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
      [POSSIBLE_ACTIONS.approveAndCreatePosition]: (
        <FormattedMessage
          description="lowLiqApproveToken"
          defaultMessage="Authorize token and create position anyway"
        />
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
      <Typography variant="bodyRegular" component="p">
        <FormattedMessage
          description="low liquidity message"
          defaultMessage="Due to low volume, the price oracle for this pair might not be reliable or accurate, this means that swaps might not get executed or will be executed with incorrect pricing. Proceed with caution or try another pair."
        />
      </Typography>
      <Typography variant="bodyRegular" component="p">
        <StyledLink href="https://docs.balmy.xyz/concepts/price-oracle" target="_blank">
          <FormattedMessage description="low liquidity link" defaultMessage="Read about price oracle" />
        </StyledLink>
      </Typography>
    </Modal>
  );
};
export default LowLiquidityModal;
