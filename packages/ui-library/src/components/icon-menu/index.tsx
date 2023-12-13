import React, { useCallback, useState } from 'react';
import { ButtonProps, Button } from '../button';
import { Menu } from '../menu';
import { KeyboardArrowDownIcon } from '../../icons';
import { MenuItem } from '../menuitem';

type IconMenuOption = {
  label: string;
  icon?: React.ReactElement;
  onClick?: () => void;
  control?: React.ReactElement;
  closeOnClick?: boolean;
};

type IconMenuProps = {
  options: IconMenuOption[];
  icon: React.ReactElement;
  color?: ButtonProps['color'];
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
};

const IconMenu = ({ options, color = 'info', variant = 'text', icon, size = 'small' }: IconMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [setAnchorEl]
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, [setAnchorEl]);

  const handleCloseWithAction = useCallback(
    (closeOnClick: boolean, action?: () => void) => {
      if (closeOnClick) {
        setAnchorEl(null);
      }
      if (action) action();
    },
    [setAnchorEl]
  );

  return (
    <div>
      <Button variant={variant} color={color} size={size} onClick={handleClick} endIcon={<KeyboardArrowDownIcon />}>
        {icon}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {options.map(({ onClick, icon: itemIcon, label, control, closeOnClick = true }) => (
          <MenuItem key={label} onClick={() => handleCloseWithAction(closeOnClick, onClick)}>
            {itemIcon}
            {label}
            {control}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export { IconMenu, IconMenuProps, IconMenuOption };
