import React from 'react';
import styled from 'styled-components';
import { Menu, MenuItem, ArrowDropDownIcon, createStyles } from 'ui-library';
import { withStyles } from 'tss-react/mui';
import Button from '@common/components/button';
import useUser from '@hooks/useUser';
import { FormattedMessage } from 'react-intl';
import useAccountService from '@hooks/useAccountService';
import useProfiles from '@hooks/useProfiles';

const StyledButton = styled(Button)`
  border-radius: 30px;
  padding: 11px 16px;
  color: #333333;
  background-color: #ffffff;
  cursor: pointer;
  box-shadow:
    0 1px 2px 0 rgba(60, 64, 67, 0.302),
    0 1px 3px 1px rgba(60, 64, 67, 0.149);
  :hover {
    box-shadow:
      0 1px 3px 0 rgba(60, 64, 67, 0.302),
      0 4px 8px 3px rgba(60, 64, 67, 0.149);
  }
  text-transform: none;
`;

const StyledContainer = styled.div``;

const StyledMenu = withStyles(Menu, () =>
  createStyles({
    paper: {
      border: '2px solid #A5AAB5',
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
      <StyledButton onClick={handleOpenClose} color="default" variant="outlined" endIcon={<ArrowDropDownIcon />}>
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
