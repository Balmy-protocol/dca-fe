import React from 'react';
import styled from 'styled-components';
import Modal from 'common/modal';
import Button from 'common/button';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import { useAppDispatch } from 'hooks/state';
import { Permission } from 'types';
import { addOperator } from 'state/position-permissions/actions';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import { STRING_PERMISSIONS } from 'config/constants';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import FilledInput from '@mui/material/FilledInput';
import { withStyles } from '@mui/styles';
import { createStyles } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';

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

const StyledAddPermisionContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  align-items: flex-start;
  gap: 24px;
`;

const StyledFilledInput = withStyles(() =>
  createStyles({
    root: {
      paddingLeft: '8px',
      borderRadius: '8px',
    },
    input: {
      paddingTop: '8px',
    },
  })
)(FilledInput);

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

const inputRegex = RegExp(/^0x[A-Za-z0-9]*$/);

const hasPermission = (permissions: Permission[], permission: Permission) => permissions.indexOf(permission) !== -1;

const AddAddressPermissionModal = ({ open, onCancel }: AddAddressPermissionModalProps) => {
  const [toAddresses, setToAddresses] = React.useState(['']);
  const [permissions, setPermissions] = React.useState<Permission[]>([]);
  const dispatch = useAppDispatch();

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
    toAddresses.forEach((address) => dispatch(addOperator({ operator: address.toLowerCase(), permissions })));
    onCancel();
  };

  const onDeleteAddress = (index: number) => {
    const newAddressess = [...toAddresses];

    newAddressess.splice(index, 1);
    setToAddresses(newAddressess);
  };

  const handlePermissionChange = (permission: Permission, newValue: boolean) => {
    if (newValue) {
      setPermissions([...permissions, permission]);
    } else {
      setPermissions(permissions.filter((oldPermission) => oldPermission !== permission));
    }
  };

  const shouldDisable = !toAddresses.filter((address) => address !== '').length;

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
          color: 'secondary',
          variant: 'contained',
        },
      ]}
    >
      <StyledAddPermisionContainer>
        <StyledInputContainer>
          <Typography variant="body1">
            <FormattedMessage
              description="add permission description"
              defaultMessage="Set to what address you want to give permissions to"
            />
          </Typography>
          {toAddresses.map((address, index) => (
            <StyledInputWrapper>
              <StyledFilledInput
                id="toAddress"
                value={address}
                placeholder="Set the address to transfer to"
                autoComplete="off"
                autoCorrect="off"
                fullWidth
                type="text"
                spellCheck="false"
                onChange={(evt) => validator(evt.target.value, index)}
                disableUnderline
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
          <Button variant="text" color="secondary" onClick={onAddAddress}>
            <FormattedMessage description="add permission add more addresses" defaultMessage="+ Add another wallet" />
          </Button>
        </StyledInputContainer>
        <Typography variant="body1">
          <FormattedMessage
            description="add permission checkbox description"
            defaultMessage="And set what permissions to set for this address"
          />
        </Typography>
        <FormControl component="fieldset">
          <FormGroup>
            <Grid container>
              {Object.keys(STRING_PERMISSIONS).map((stringPermissionKey: Permission) => (
                <StyledGrid item xs={12} sm={6}>
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
                    label={<Typography variant="body2">{STRING_PERMISSIONS[stringPermissionKey]}</Typography>}
                  />
                </StyledGrid>
              ))}
            </Grid>
          </FormGroup>
        </FormControl>
      </StyledAddPermisionContainer>
    </Modal>
  );
};
export default AddAddressPermissionModal;
