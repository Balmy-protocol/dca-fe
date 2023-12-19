import React, { useCallback, useState } from 'react';
import { ButtonProps, Button } from '../button';
import { Menu } from '../menu';
import { KeyboardArrowDownIcon } from '../../icons';
import { MenuItem } from '../menuitem';
import { Box } from '../box';
import { Divider, Typography } from '@mui/material';
import styled from 'styled-components';
import { colors } from '../../theme';

const StyledSecondaryLabel = styled(Typography)`
  ${({ theme: { palette, typography } }) => `
  color: ${colors[palette.mode].typography.typo3};
  font-size: ${typography.bodyExtraSmall.fontSize};
`}
`;

const StyledMenuItemContent = styled(Box)`
  ${({ theme: { spacing } }) => `
  display: flex;
  align-items: center;
  gap: ${spacing(2)};
`}
`;

const StyledDivider = styled(Divider)`
  ${({ theme: { spacing } }) => `
  padding-top: ${spacing(2)};
`}
`;

type IconMenuOption = {
  label: string;
  secondaryLabel?: string;
  icon?: React.ReactElement;
  onClick?: () => void;
  control?: React.ReactElement;
  closeOnClick?: boolean;
  bottomDivider?: boolean;
  color?: string;
};

type IconMenuProps = {
  options: IconMenuOption[];
  icon: React.ReactElement;
  color?: ButtonProps['color'];
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  blockMenuOpen?: boolean;
};

const IconMenu = ({
  options,
  color = 'info',
  variant = 'text',
  icon,
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
        {options.map(
          ({
            onClick,
            icon: itemIcon,
            label,
            secondaryLabel,
            control,
            closeOnClick = true,
            bottomDivider,
            color: itemColor,
          }) => (
            <Box key={label}>
              <MenuItem onClick={() => handleCloseWithAction(closeOnClick, onClick)} style={{ color: itemColor }}>
                <StyledMenuItemContent>
                  {itemIcon}
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box>{label}</Box>
                    <StyledSecondaryLabel>{secondaryLabel}</StyledSecondaryLabel>
                  </Box>
                </StyledMenuItemContent>
                {control}
              </MenuItem>
              {bottomDivider && <StyledDivider />}
            </Box>
          )
        )}
      </Menu>
    </div>
  );
};

export { IconMenu, IconMenuProps, IconMenuOption };
