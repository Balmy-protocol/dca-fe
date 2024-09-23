import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Typography, Link, OpenInNewIcon, Button } from 'ui-library';
import { buildEtherscanTransaction } from '@common/utils/etherscan';
import { Position, WalletStatus } from '@types';
import useWallet from '@hooks/useWallet';
import { CHAIN_CHANGING_WALLETS_WITH_REFRESH } from '@constants';
import useWalletNetwork from '@hooks/useWalletNetwork';
import useWallets from '@hooks/useWallets';

const PositionControlsContainer = styled.div`
  display: flex;
  align-self: flex-end;
  * {
    margin: 0px 5px;
  }
`;

interface PositionPermissionsControlsProps {
  pendingTransaction: string | null;
  position: Position;
  shouldDisable: boolean;
  onSave: () => void;
  onDiscardChanges: () => void;
  onAddAddress: () => void;
}

const PositionPermissionsControls = ({
  pendingTransaction,
  position,
  shouldDisable,
  onSave,
  onDiscardChanges,
  onAddAddress,
}: PositionPermissionsControlsProps) => {
  const isPending = pendingTransaction !== null;
  const wallet = useWallet(position.user);
  const wallets = useWallets();

  const connectedNetwork = useWalletNetwork(position.user);

  const isOnNetwork = connectedNetwork?.chainId === position.chainId;

  const walletIsConnected = wallet?.status === WalletStatus.connected;

  const showSwitchAction =
    walletIsConnected && !isOnNetwork && CHAIN_CHANGING_WALLETS_WITH_REFRESH.includes(wallet.providerInfo?.name || '');

  const isOwner = wallets.find((userWallet) => userWallet.address.toLowerCase() === position.user.toLowerCase());

  const disabled = showSwitchAction || !walletIsConnected;

  if (!isOwner) return null;

  return isPending ? (
    <Button variant="contained" size="large">
      <Link
        href={buildEtherscanTransaction(pendingTransaction, position.chainId)}
        target="_blank"
        rel="noreferrer"
        underline="none"
        color="inherit"
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <Typography variant="bodySmallRegular" component="span">
          <FormattedMessage description="pending transaction" defaultMessage="Pending transaction" />
        </Typography>
        <OpenInNewIcon style={{ fontSize: '1rem' }} />
      </Link>
    </Button>
  ) : (
    <>
      <Button onClick={onAddAddress} variant="outlined" size="large" disabled={disabled}>
        <FormattedMessage description="add new address" defaultMessage="Add new address" />
      </Button>
      {!shouldDisable && (
        <PositionControlsContainer>
          <Button onClick={onDiscardChanges} variant="outlined" size="large" disabled={disabled}>
            <FormattedMessage description="discard changes" defaultMessage="Discard changes" />
          </Button>

          <Button onClick={onSave} disabled={shouldDisable || disabled} variant="contained" size="large">
            <FormattedMessage description="save" defaultMessage="Save" />
          </Button>
        </PositionControlsContainer>
      )}
    </>
  );
};

export default PositionPermissionsControls;
