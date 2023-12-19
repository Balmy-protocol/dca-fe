import React, { useState } from 'react';
import {
  Grid,
  List,
  ListItem,
  ListItemIcon,
  MenuItem,
  Paper,
  Select,
  Switch,
  Typography,
  WalletIcon,
} from 'ui-library';
import CenteredLoadingIndicator from '@common/components/centered-loading-indicator';
import styled from 'styled-components';
import useProfiles from '@hooks/useProfiles';
import useAccountService from '@hooks/useAccountService';
import Address from '@common/components/address';
import useUser from '@hooks/useUser';
import { Address as ViemAddress } from 'viem';

const StyledContainerPaper = styled(Paper)`
  padding: 16px;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  flex-grow: 1;
  display: flex;
  gap: 24px;
  flex-direction: column;
`;

const StyledPaper = styled(Paper)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

interface SettingsFrameProps {
  isLoading: boolean;
}

const SettingsFrame = ({ isLoading }: SettingsFrameProps) => {
  const [change, setChange] = useState(false);
  const profiles = useProfiles();
  const user = useUser();
  const accountService = useAccountService();

  const handleChangeUser = async (userId: string) => {
    await accountService.changeUser(userId);
    setChange(!change);
  };

  const onSetWalletAsAdmin = async ({ address, isAuth }: { address: ViemAddress; isAuth: boolean }) => {
    if (!user) {
      throw new Error('no user set for modifying wallet');
    }

    await accountService.changeWalletAdmin({
      address,
      isAuth,
      userId: user.id,
    });
    setChange(!change);
  };

  return (
    <Grid container spacing={3}>
      {isLoading || !profiles.length || !user ? (
        <Grid item xs={12} style={{ display: 'flex' }}>
          <CenteredLoadingIndicator size={70} />
        </Grid>
      ) : (
        <Grid
          item
          xs={12}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        >
          <StyledContainerPaper variant="elevation">
            <Typography variant="h6">Your profiles and connected wallets</Typography>
            <StyledPaper variant="elevation">
              <Select
                id="choose-profile"
                fullWidth
                value={user.id}
                onChange={(e) => handleChangeUser(e.target.value)}
                size="small"
                SelectDisplayProps={{ style: { display: 'flex', alignItems: 'center', gap: '5px' } }}
                MenuProps={{
                  autoFocus: false,
                  transformOrigin: {
                    horizontal: 'center',
                    vertical: 'top',
                  },
                }}
              >
                {profiles.map(({ label, id }) => (
                  <MenuItem key={id} sx={{ display: 'flex', alignItems: 'center', gap: '5px' }} value={id}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
              <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                {user.wallets.map(({ address, isAuth }) => (
                  <ListItem key={address}>
                    <ListItemIcon>
                      <WalletIcon />
                    </ListItemIcon>
                    <Address editable trimAddress address={address} />
                    <Switch
                      edge="end"
                      onChange={() => onSetWalletAsAdmin({ address, isAuth: !isAuth })}
                      checked={isAuth}
                      inputProps={{
                        'aria-labelledby': 'switch-list-label-wifi',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </StyledPaper>
          </StyledContainerPaper>
        </Grid>
      )}
    </Grid>
  );
};
export default SettingsFrame;
