import React from 'react';
import styled from 'styled-components';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import {
  Typography,
  Grid,
  FormControlLabel,
  FormControl,
  FormGroup,
  Checkbox,
  TextField,
  DeleteIcon,
  createStyles,
  Button,
  Modal,
} from 'ui-library';
import { useAppDispatch } from '@hooks/state';
import { addOperator } from '@state/position-permissions/actions';
import { STRING_PERMISSIONS } from '@constants';
import { withStyles } from 'tss-react/mui';
import { DCAPermission } from '@balmy/sdk';
import { Address } from 'viem';

const StyledGrid = styled(Grid)`
  display: flex;
`;

const StyledDeleteIconContainer = styled.div`
  margin-left: 16px;
`;

const StyledInputWrapper = styled.div`
  display: flex;
  align-items: center;
  align-self: stretch;
`;

const StyledFilledInput = withStyles(TextField, () =>
  createStyles({
    root: {
      paddingLeft: '8px',
      borderRadius: '8px',
    },
    input: {
      paddingTop: '8px',
    },
  })
);

const StyledInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
`;

interface AddAddressPermissionModalProps {
  open: boolean;
  onCancel: () => void;
}

const inputRegex = RegExp(/^[A-Fa-f0-9x]*$/);
const validRegex = RegExp(/^0x[A-Fa-f0-9]*$/);

const hasPermission = (permissions: DCAPermission[], permission: DCAPermission) =>
  permissions.indexOf(permission) !== -1;

const AddAddressPermissionModal = ({ open, onCancel }: AddAddressPermissionModalProps) => {
  const [toAddresses, setToAddresses] = React.useState(['']);
  const [permissions, setPermissions] = React.useState<DCAPermission[]>([]);
  const dispatch = useAppDispatch();
  const intl = useIntl();

  React.useEffect(() => {
    if (!open) {
      setToAddresses(['']);
      setPermissions([]);
    }
  }, [open]);

  const validator = (nextValue: string, index: number) => {
    // sanitize value
    if (inputRegex.test(nextValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
      const newAddressess = [...toAddresses];

      newAddressess[index] = nextValue;
      setToAddresses(newAddressess);
    }
  };

  const onAddAddress = () => {
    setToAddresses([...toAddresses, '']);
  };

  const handleAddAddress = () => {
    const addressesToAdd = toAddresses.filter((address) => !!address.trim());
    addressesToAdd.forEach((address) =>
      dispatch(addOperator({ operator: address.toLowerCase() as Address, permissions }))
    );
    onCancel();
  };

  const onDeleteAddress = (index: number) => {
    const newAddressess = [...toAddresses];

    newAddressess.splice(index, 1);
    setToAddresses(newAddressess);
  };

  const handlePermissionChange = (permission: DCAPermission, newValue: boolean) => {
    if (newValue) {
      setPermissions([...permissions, permission]);
    } else {
      setPermissions(permissions.filter((oldPermission) => oldPermission !== permission));
    }
  };

  const shouldDisable = !toAddresses.filter((address) => address.trim() !== '').length;

  return (
    <Modal
      open={open}
      onClose={onCancel}
      showCloseButton
      showCloseIcon
      title={<FormattedMessage description="add permission title" defaultMessage="Add permissions for new address" />}
      actions={[
        {
          label: <FormattedMessage description="Add address" defaultMessage="Add address" />,
          onClick: handleAddAddress,
          disabled: shouldDisable || permissions.length === 0,
          variant: 'contained',
        },
      ]}
    >
      <StyledInputContainer>
        <Typography variant="bodyRegular">
          <FormattedMessage
            description="add permission description"
            defaultMessage="Set to what address you want to give permissions to"
          />
        </Typography>
        {toAddresses.map((address, index) => (
          <StyledInputWrapper key={index}>
            <StyledFilledInput
              id="toAddress"
              value={address}
              placeholder={intl.formatMessage(
                defineMessage({
                  defaultMessage: 'Set the address you want to give permissions to',
                  description: 'addAddressPermisionModalPlaceholder',
                })
              )}
              autoComplete="off"
              autoCorrect="off"
              fullWidth
              type="text"
              spellCheck="false"
              error={address !== '' && !validRegex.test(address)}
              helperText={address !== '' && !validRegex.test(address) ? 'This is not a valid address' : ''}
              onChange={(evt) => validator(evt.target.value, index)}
              InputProps={{
                disableUnderline: true,
              }}
              hiddenLabel
              variant="filled"
              margin="none"
              key={index}
            />
            {index !== 0 && (
              <StyledDeleteIconContainer onClick={() => onDeleteAddress(index)}>
                <DeleteIcon />
              </StyledDeleteIconContainer>
            )}
          </StyledInputWrapper>
        ))}
        <Button variant="text" onClick={onAddAddress}>
          <FormattedMessage description="add permission add more addresses" defaultMessage="+ Add another wallet" />
        </Button>
      </StyledInputContainer>
      <Typography variant="bodyRegular">
        <FormattedMessage
          description="add permission checkbox description"
          defaultMessage="And set what permissions to set for this address"
        />
      </Typography>
      <FormControl component="fieldset">
        <FormGroup>
          <Grid container>
            {Object.keys(STRING_PERMISSIONS).map((stringPermissionKey: DCAPermission) => (
              <StyledGrid item xs={12} sm={6} key={stringPermissionKey}>
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={(e) => handlePermissionChange(stringPermissionKey, e.target.checked)}
                      size="small"
                      checked={hasPermission(permissions, stringPermissionKey)}
                      color="primary"
                      name={stringPermissionKey}
                    />
                  }
                  label={
                    <Typography variant="bodySmallRegular">
                      {intl.formatMessage(STRING_PERMISSIONS[stringPermissionKey])}
                    </Typography>
                  }
                />
              </StyledGrid>
            ))}
          </Grid>
        </FormGroup>
      </FormControl>
    </Modal>
  );
};
export default AddAddressPermissionModal;
