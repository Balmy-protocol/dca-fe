import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import Menu, { MenuProps } from '@material-ui/core/Menu';
import styled from 'styled-components';
import CircularProgress from '@material-ui/core/CircularProgress';

interface FloatingMenuProps {
  buttonContent: React.ReactNode;
  buttonStyles: React.CSSProperties;
  isIcon: boolean;
  children: React.ReactNode;
  badge?: number;
  isLoading?: boolean;
  onOpen?: () => void;
}

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
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

const StyledButton = styled(Button)`
  max-width: 200px;
  text-transform: none;
`;

const WalletButton: React.FC<FloatingMenuProps> = ({
  buttonContent,
  buttonStyles,
  children,
  isIcon,
  onOpen,
  badge = 0,
  isLoading = false,
}: FloatingMenuProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    onOpen && onOpen();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Badge badgeContent={isLoading ? <CircularProgress size={10} /> : badge} color="secondary" component="div">
        {isIcon ? (
          <IconButton
            aria-label="more"
            aria-controls="long-menu"
            aria-haspopup="true"
            onClick={handleClick}
            size="small"
          >
            {buttonContent}
          </IconButton>
        ) : (
          <StyledButton
            aria-controls="customized-menu"
            aria-haspopup="true"
            variant="contained"
            color="primary"
            onClick={handleClick}
            style={buttonStyles}
          >
            {buttonContent}
          </StyledButton>
        )}
      </Badge>
      <StyledMenu id="customized-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        {children}
      </StyledMenu>
    </div>
  );
};

export default WalletButton;
