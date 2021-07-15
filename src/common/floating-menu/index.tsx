import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Menu, { MenuProps } from '@material-ui/core/Menu';
import styled from 'styled-components';

const StyledButton = styled(IconButton)`
  border-radius: 30px;
  padding: 11px 5px;
  margin-left: 5px;
  color: #333333;
  background-color: #ffffff;
  cursor: pointer;
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.302), 0 1px 3px 1px rgba(60, 64, 67, 0.149);
  :hover {
    box-shadow: 0 1px 3px 0 rgba(60, 64, 67, 0.302), 0 4px 8px 3px rgba(60, 64, 67, 0.149);
  }
`;

interface FloatingMenuProps {
  buttonContent: React.ReactNode;
  children: React.ReactNode;
}

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
    marginTop: 5,
    borderRadius: 10,
  },
})((props: MenuProps) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
));

const WalletButton: React.FC<FloatingMenuProps> = ({ buttonContent, children }: FloatingMenuProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <StyledButton aria-label="more" aria-controls="long-menu" aria-haspopup="true" onClick={handleClick} size="small">
        {buttonContent}
      </StyledButton>
      <StyledMenu id="customized-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        {children}
      </StyledMenu>
    </div>
  );
};

export default WalletButton;
