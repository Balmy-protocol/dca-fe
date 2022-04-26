import React from 'react';
import styled from 'styled-components';
import Button from 'common/button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import TextField from '@mui/material/TextField';
import { useAppDispatch } from 'hooks/state';
import { Permission } from 'types';
import { addOperator } from 'state/position-permissions/actions';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import { STRING_PERMISSIONS } from 'config/constants';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';

const useStyles = makeStyles({
  paper: {
    borderRadius: 20,
  },
});

const StyledDialogContent = styled(DialogContent)`
  display: flex;
  flex-direction: column;
  padding: 40px 60px !important;
  align-items: center;
  justify-content: center;
  text-align: center;
  & > *:not(:last-child) {
    margin-bottom: 10px;
  }
`;

const StyledDialogActions = styled(DialogActions)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 32px 32px 32px;
`;

const StyledGrid = styled(Grid)`
  display: flex;
`;

interface AddAddressPermissionModalProps {
  open: boolean;
  onCancel: () => void;
}

const inputRegex = RegExp(/^0x[A-Za-z0-9]*$/);

const hasPermission = (permissions: Permission[], permission: Permission) => permissions.indexOf(permission) !== -1;

const AddAddressPermissionModal = ({ open, onCancel }: AddAddressPermissionModalProps) => {
  const classes = useStyles();
  const [toAddress, setToAddress] = React.useState('');
  const [permissions, setPermissions] = React.useState<Permission[]>([]);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (!open) {
      setToAddress('');
      setPermissions([]);
    }
  }, [open]);

  const validator = (nextValue: string) => {
    // sanitize value
    if (inputRegex.test(nextValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
      setToAddress(nextValue);
    }
  };

  const handleAddAddress = () => {
    dispatch(addOperator({ operator: toAddress.toLowerCase(), permissions }));
    onCancel();
  };

  const handlePermissionChange = (permission: Permission, newValue: boolean) => {
    if (newValue) {
      setPermissions([...permissions, permission]);
    } else {
      setPermissions(permissions.filter((oldPermission) => oldPermission !== permission));
    }
  };

  return (
    <Dialog open={open} fullWidth maxWidth="xs" classes={{ paper: classes.paper }}>
      <StyledDialogContent>
        <Typography variant="h6">
          <FormattedMessage description="add permission title" defaultMessage="Add permissions for new address" />
        </Typography>
        <Typography variant="body1">
          <FormattedMessage
            description="add permission description"
            defaultMessage="Set to what address you want to give permissions to"
          />
        </Typography>
        <TextField
          id="toAddress"
          value={toAddress}
          placeholder="Set the address to transfer to"
          autoComplete="off"
          autoCorrect="off"
          fullWidth
          type="text"
          margin="normal"
          spellCheck="false"
          onChange={(evt) => validator(evt.target.value)}
          // eslint-disable-next-line react/jsx-no-duplicate-props
          inputProps={{
            pattern: '^0x[A-Fa-f0-9]*$',
            minLength: 1,
            maxLength: 79,
          }}
        />
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
      </StyledDialogContent>
      <StyledDialogActions>
        <Button onClick={onCancel} color="default" variant="outlined" fullWidth>
          <FormattedMessage description="cancel" defaultMessage="Cancel" />
        </Button>
        <Button
          color="secondary"
          variant="contained"
          fullWidth
          onClick={handleAddAddress}
          disabled={toAddress === '' || permissions.length === 0}
          autoFocus
        >
          <FormattedMessage description="Add address" defaultMessage="Add address" />
        </Button>
      </StyledDialogActions>
    </Dialog>
  );
};
export default AddAddressPermissionModal;
