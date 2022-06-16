import React from 'react';
import styled from 'styled-components';
import Button from 'common/button';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { buildEtherscanTransaction } from 'utils/etherscan';
import useCurrentNetwork from 'hooks/useCurrentNetwork';
import { FullPosition } from 'types';
import useWeb3Service from 'hooks/useWeb3Service';

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
  const currentNetwork = useCurrentNetwork();
  const isPending = pendingTransaction !== null;
  const web3Service = useWeb3Service();
  const account = web3Service.getAccount();

  if (!account || account.toLowerCase() !== position.user.toLowerCase()) return null;

  return isPending ? (
    <Button variant="contained" color="pending" size="large">
      <Link
        href={buildEtherscanTransaction(pendingTransaction as string, currentNetwork.chainId)}
        target="_blank"
        rel="noreferrer"
        underline="none"
        color="inherit"
      >
        <Typography variant="body2" component="span">
          <FormattedMessage description="pending transaction" defaultMessage="Pending transaction" />
        </Typography>
        <OpenInNewIcon style={{ fontSize: '1rem' }} />
      </Link>
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
