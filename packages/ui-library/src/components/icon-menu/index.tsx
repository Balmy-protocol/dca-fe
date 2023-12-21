import React, { useCallback, useState } from 'react';
import { ButtonProps, Button } from '../button';
import { Menu } from '../menu';
import { KeyboardArrowDownIcon } from '../../icons';
import { MenuItem } from '../menuitem';
import { Box } from '../box';
import { Divider, Typography } from '@mui/material';
import styled from 'styled-components';
import { colors } from '../../theme';

const StyledSecondaryLabel = styled(Typography).attrs({
  variant: 'bodyExtraSmall',
})`
  ${({ theme: { palette } }) => `
  color: ${colors[palette.mode].typography.typo3};
`}
`;

enum IconMenuOptionType {
  divider = 'divider',
  option = 'option',
}

type DividerOption = {
  type: IconMenuOptionType.divider;
};

type MenuOption = {
  type: IconMenuOptionType.option;
  label: string;
  secondaryLabel?: string;
  icon?: React.ReactElement;
  onClick?: () => void;
  control?: React.ReactElement;
  closeOnClick?: boolean;
  color?: string;
};

type IconMenuOption = DividerOption | MenuOption;

type IconMenuProps = {
  options: IconMenuOption[];
  mainDisplay: React.ReactElement | string;
  color?: ButtonProps['color'];
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  blockMenuOpen?: boolean;
};

const IconMenu = ({
  options,
  color = 'info',
  variant = 'text',
  mainDisplay,
  size = 'small',
  blockMenuOpen,
}: IconMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!blockMenuOpen) {
        setAnchorEl(event.currentTarget);
      }
    },
    [setAnchorEl, blockMenuOpen]
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
        {typeof mainDisplay === 'string' ? <Typography>{mainDisplay}</Typography> : mainDisplay}
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
        {options.map((option, index) => {
          if (option.type === IconMenuOptionType.option) {
            const {
              label,
              closeOnClick = true,
              color: itemColor,
              control,
              onClick,
              icon: itemIcon,
              secondaryLabel,
            } = option;
            return (
              <MenuItem
                onClick={() => handleCloseWithAction(closeOnClick, onClick)}
                style={{ color: itemColor }}
                key={index}
              >
                <Box>
                  {itemIcon}
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box>{label}</Box>
                    {secondaryLabel && <StyledSecondaryLabel>{secondaryLabel}</StyledSecondaryLabel>}
                  </Box>
                </Box>
                {control}
              </MenuItem>
            );
          } else if (option.type === IconMenuOptionType.divider) {
            return <Divider key={index} />;
          }
        })}
      </Menu>
    </div>
  );
};

export { IconMenu, IconMenuProps, IconMenuOption, IconMenuOptionType };
