import React from 'react';
import styled from 'styled-components';
import Button from '@common/components/button';
import { FormattedMessage } from 'react-intl';
import { Typography, LinkComponent, OpenInNew as OpenInNewIcon } from 'ui-library';
import { buildEtherscanTransaction } from '@common/utils/etherscan';
import { FullPosition } from '@types';
import useWeb3Service from '@hooks/useWeb3Service';

const PositionControlsContainer = styled.div`
  display: flex;
  align-self: flex-end;
  * {
    margin: 0px 5px;
  }
`;

interface PositionPermissionsControlsProps {
  pendingTransaction: string | null;
  position: FullPosition;
  shouldDisable: boolean;
  onSave: () => void;
  onDiscardChanges: () => void;
  onAddAddress: () => void;
  disabled: boolean;
}

const PositionPermissionsControls = ({
  pendingTransaction,
  position,
  shouldDisable,
  onSave,
  onDiscardChanges,
  onAddAddress,
  disabled,
}: PositionPermissionsControlsProps) => {
  const isPending = pendingTransaction !== null;
  const web3Service = useWeb3Service();
  const account = web3Service.getAccount();

  if (!account || account.toLowerCase() !== position.user.toLowerCase()) return null;

  return isPending ? (
    <Button variant="contained" color="pending" size="large">
      <LinkComponent
        href={buildEtherscanTransaction(pendingTransaction, position.chainId)}
        target="_blank"
        rel="noreferrer"
        underline="none"
        color="inherit"
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <Typography variant="body2" component="span">
          <FormattedMessage description="pending transaction" defaultMessage="Pending transaction" />
        </Typography>
        <OpenInNewIcon style={{ fontSize: '1rem' }} />
      </LinkComponent>
    </Button>
  ) : (
    <>
      <Button onClick={onAddAddress} variant="contained" color="secondary" size="large" disabled={disabled}>
        <FormattedMessage description="add new address" defaultMessage="Add new address" />
      </Button>
      {!shouldDisable && (
        <PositionControlsContainer>
          <Button onClick={onDiscardChanges} variant="outlined" color="default" size="large" disabled={disabled}>
            <FormattedMessage description="discard changes" defaultMessage="Discard changes" />
          </Button>

          <Button
            onClick={onSave}
            disabled={shouldDisable || disabled}
            variant="contained"
            color="primary"
            size="large"
          >
            <FormattedMessage description="save" defaultMessage="Save" />
          </Button>
        </PositionControlsContainer>
      )}
    </>
  );
};

export default PositionPermissionsControls;
