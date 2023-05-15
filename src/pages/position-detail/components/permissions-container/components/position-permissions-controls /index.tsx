import React from 'react';
import styled from 'styled-components';
import Button from '@common/components/button';
import { FormattedMessage } from 'react-intl';
import uniq from 'lodash/uniq';
import difference from 'lodash/difference';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { COMPANION_ADDRESS, LATEST_VERSION, STRING_PERMISSIONS } from 'config/constants';
import { PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import { useAppDispatch } from 'hooks/state';
import { addOperator } from 'state/position-permissions/actions';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { buildEtherscanTransaction } from '@common/utils/etherscan';
import { FullPosition, Permission, FullPermission } from '@types';
import useWeb3Service from '@hooks/useWeb3Service';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1em;
`;

const PositionControlsContainer = styled.div`
  display: flex;
  align-self: flex-end;
  margin-left: auto;
  * {
    margin: 0px 5px;
  }
`;

const StyledButtonsContainer = styled.div`
  display: flex;
  width: 100%;
  gap: 10px;
`;

interface PositionPermissionsControlsProps {
  pendingTransaction: string | null;
  position: FullPosition;
  shouldDisable: boolean;
  onSave: () => void;
  onDiscardChanges: () => void;
  onAddAddress: () => void;
  disabled: boolean;
  permissions: FullPermission;
}

function getMissingCompanionPermissions(permissions: FullPermission, companionAddress: string) {
  const companionPermissions = permissions[companionAddress as keyof FullPermission]?.permissions;
  if (!companionPermissions) return [];
  const mergedUserPermissions = uniq(
    Object.keys(permissions).reduce((acc, address) => {
      if (address.toLowerCase() === companionAddress) return acc;
      return [...acc, ...permissions[address as keyof FullPermission]?.permissions];
    }, [])
  );
  return difference(mergedUserPermissions, companionPermissions);
}

const PositionPermissionsControls = ({
  pendingTransaction,
  position,
  shouldDisable,
  onSave,
  onDiscardChanges,
  onAddAddress,
  disabled,
  permissions,
}: PositionPermissionsControlsProps) => {
  const isPending = pendingTransaction !== null;
  const web3Service = useWeb3Service();
  const account = web3Service.getAccount();
  const companionAddress = (
    COMPANION_ADDRESS[position.version][position.chainId] || COMPANION_ADDRESS[LATEST_VERSION][position.chainId]
  ).toLowerCase();
  const companionHasPermissions = permissions[companionAddress as keyof FullPermission];
  const dispatch = useAppDispatch();
  const hasYield = !!(position.from.underlyingTokens.length || position.to.underlyingTokens.length);
  const hasProtocolToken =
    position.from.address === PROTOCOL_TOKEN_ADDRESS || position.to.address === PROTOCOL_TOKEN_ADDRESS;
  const missingCompanionPermissions = getMissingCompanionPermissions(permissions, companionAddress);

  if (!account || account.toLowerCase() !== position.user.toLowerCase()) return null;

  return isPending ? (
    <Button variant="contained" color="pending" size="large">
      <Link
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
      </Link>
    </Button>
  ) : (
    <StyledContainer>
      <StyledButtonsContainer>
        <Button onClick={onAddAddress} variant="contained" color="secondary" size="large" disabled={disabled}>
          <FormattedMessage description="add new address" defaultMessage="Add new address" />
        </Button>
        {!companionHasPermissions && (hasYield || hasProtocolToken) && (
          <Button
            onClick={() =>
              dispatch(
                addOperator({
                  operator: companionAddress.toLowerCase(),
                  permissions: Object.keys(STRING_PERMISSIONS) as Permission[],
                })
              )
            }
            variant="contained"
            color="secondary"
            size="large"
            disabled={disabled}
          >
            <FormattedMessage description="add companion" defaultMessage="Add Mean Finance Companion" />
          </Button>
        )}
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
      </StyledButtonsContainer>
      {hasYield && (!!missingCompanionPermissions.length || !companionHasPermissions) && (
        <Typography variant="body1">
          <FormattedMessage
            description="Companion Permission Hint Yield"
            defaultMessage="This position has yield, which means the addresses you give permissions to needs the same permissions as the Mean Finance Companion in order to operate."
          />
        </Typography>
      )}
      {!hasYield && hasProtocolToken && (!!missingCompanionPermissions.length || !companionHasPermissions) && (
        <Typography variant="body1">
          <FormattedMessage
            description="Companion Permission Hint Protocol Token"
            defaultMessage="This position uses a Protocol Token, which means the addresses you give permissions to needs the same permissions as the Mean Finance Companion in order to operate with them. If you don't give permissions to the Mean Finance Companion, then the permissioned addresses will only be able to operate with ERC-20 Wrapped Tokens."
          />
        </Typography>
      )}
      {(hasYield || hasProtocolToken) && !companionHasPermissions && (
        <Typography variant="body1">
          <FormattedMessage
            description="Add the Mean Finance Companion with the above button to start."
            defaultMessage="Add the Mean Finance Companion with the above button to start."
          />
        </Typography>
      )}
      {(hasYield || hasProtocolToken) && !!missingCompanionPermissions.length && (
        <Typography variant="body1">
          <FormattedMessage
            description="Companion permissions missing"
            defaultMessage="Missing permissions on companion: {missingCompanionPermissions}"
            values={{ missingCompanionPermissions: missingCompanionPermissions.join(', ') }}
          />
        </Typography>
      )}
    </StyledContainer>
  );
};

export default PositionPermissionsControls;
