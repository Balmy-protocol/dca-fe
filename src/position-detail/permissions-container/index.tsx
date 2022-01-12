import React from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import { FullPosition } from 'types';
import useWeb3Service from 'hooks/useWeb3Service';
import useTransactionModal from 'hooks/useTransactionModal';
import { useTransactionAdder } from 'state/transactions/hooks';
import PositionPermissionsControls from 'position-detail/position-permissions-controls ';
import {
  useHasModifiedPermissions,
  useModifiedPermissions,
  usePositionPermissions,
} from 'state/position-permissions/hooks';
import PositionPermission from 'position-detail/permission';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import { TRANSACTION_TYPES } from 'config/constants';
import { discardChanges } from 'state/position-permissions/actions';
import { useAppDispatch } from 'state/hooks';
import AddAddressPermissionModal from 'common/add-address-permission-modal';

const StyledControlsWrapper = styled(Grid)<{ isPending: boolean }>`
  display: flex;
  justify-content: ${(props) => (props.isPending ? 'flex-end' : 'space-between')};
`;

const StyledFlexGridItem = styled(Grid)`
  display: flex;
`;

interface PositionPermissionsContainerProps {
  position: FullPosition;
  pendingTransaction: string | null;
}

const PositionPermissionsContainer = ({ position, pendingTransaction }: PositionPermissionsContainerProps) => {
  const permissions = usePositionPermissions(position.id);
  const hasModifiedPermissions = useHasModifiedPermissions();
  const modifiedPermissions = useModifiedPermissions();
  const web3Service = useWeb3Service();
  const [shouldShowAddAddressModal, setShouldShowAddAddressModal] = React.useState(false);
  const dispatch = useAppDispatch();
  const [setModalSuccess, setModalLoading, setModalError] = useTransactionModal();
  const addTransaction = useTransactionAdder();

  const onSave = async () => {
    if (!position) {
      return;
    }

    try {
      setModalLoading({
        content: (
          <Typography variant="body1">
            <FormattedMessage
              description="Modifying your position permissions"
              defaultMessage="Setting your {from}/{to} position permissions"
              values={{
                from: position.from.symbol,
                to: position.to.symbol,
              }}
            />
          </Typography>
        ),
      });
      const result = await web3Service.modifyPermissions(position, modifiedPermissions);
      addTransaction(result, {
        type: TRANSACTION_TYPES.MODIFY_PERMISSIONS,
        typeData: { id: position.id, from: position.from.symbol, to: position.to.symbol },
      });
      setModalSuccess({
        hash: result.hash,
        content: (
          <FormattedMessage
            description="success modify permission for position"
            defaultMessage="Setting your {from}/{to} position permissions has been succesfully submitted to the blockchain and will be confirmed soon"
            values={{
              from: position.from.symbol,
              to: position.to.symbol,
            }}
          />
        ),
      });
    } catch (e) {
      /* eslint-disable  @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      setModalError({
        content: 'Error setting permissions',
        error: { code: e.code, message: e.message, data: e.data },
      });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    }
  };

  const onDiscardChanges = () => {
    dispatch(discardChanges());
  };

  return (
    <>
      <AddAddressPermissionModal
        open={shouldShowAddAddressModal}
        onCancel={() => setShouldShowAddAddressModal(false)}
      />
      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12}>
          <Typography variant="h4">
            <FormattedMessage description="AddressessPermissions" defaultMessage="Permissions on your position:" />
          </Typography>
        </Grid>
        <StyledControlsWrapper item xs={12} isPending={!!pendingTransaction}>
          {position.status !== 'TERMINATED' && (
            <PositionPermissionsControls
              position={position}
              pendingTransaction={pendingTransaction}
              shouldDisable={!hasModifiedPermissions}
              onSave={onSave}
              onDiscardChanges={onDiscardChanges}
              onAddAddress={() => setShouldShowAddAddressModal(true)}
            />
          )}
        </StyledControlsWrapper>
        <StyledFlexGridItem item xs={12}>
          <Grid container>
            {Object.values(permissions).map((permission) => (
              <Grid item xs={4}>
                <PositionPermission positionPermission={permission} />
              </Grid>
            ))}
          </Grid>
        </StyledFlexGridItem>
      </Grid>
    </>
  );
};

export default PositionPermissionsContainer;
