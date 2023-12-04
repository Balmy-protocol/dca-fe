import React from 'react';
import styled from 'styled-components';
import { Menu, MenuItem, ArrowDropDownIcon, createStyles, Button } from 'ui-library';
import { withStyles } from 'tss-react/mui';
import useUser from '@hooks/useUser';
import { FormattedMessage } from 'react-intl';
import useAccountService from '@hooks/useAccountService';
import useProfiles from '@hooks/useProfiles';

const StyledButton = styled(Button)`
  border-radius: 30px;
  padding: 11px 16px;
  cursor: pointer;
  text-transform: none;
`;

const StyledContainer = styled.div``;

const StyledMenu = withStyles(Menu, () =>
  createStyles({
    paper: {
      borderRadius: '8px',
    },
  })
);

const ProfileSelector = ({ openNewAccountModal }: { openNewAccountModal: () => void }) => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const user = useUser();
  const profiles = useProfiles();
  const accountService = useAccountService();
  // const web3Service = useWeb3Service();

  const handleOpenClose = () => {
    setOpen(!open);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const onClickItem = (userId: string) => {
    void accountService.changeUser(userId);
    handleClose();
  };

  const onCreateProfile = () => {
    openNewAccountModal();
    handleClose();
  };

  return (
    <StyledContainer ref={anchorRef}>
      <StyledButton onClick={handleOpenClose} color="primary" variant="outlined" endIcon={<ArrowDropDownIcon />}>
        {user?.label}
      </StyledButton>
      <StyledMenu
        anchorEl={anchorRef.current}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {profiles
          .filter(({ id }) => id !== user?.id)
          .map(({ id, label }) => (
            <MenuItem
              key={id}
              onClick={() => {
                onClickItem(id);
              }}
            >
              {label}
            </MenuItem>
          ))}
        <MenuItem onClick={onCreateProfile}>
          <FormattedMessage defaultMessage="Create new profile" description="createNewProfile" />
        </MenuItem>
      </StyledMenu>
    </StyledContainer>
  );
};

export default ProfileSelector;
