import React, { useCallback, useState } from 'react';
import { ButtonProps, Button } from '../button';
import { Menu } from '../menu';
import { KeyboardArrowDownIcon } from '../../icons';
import { MenuItem } from '../menuitem';
import { Box } from '../box';
import { Divider, Typography } from '@mui/material';
import styled, { useTheme } from 'styled-components';
import { colors } from '../../theme';

const StyledButton = styled(Button)`
  padding: 0;
  max-width: none;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

enum OptionsMenuOptionType {
  divider = 'divider',
  option = 'option',
}

type DividerOption = {
  type: OptionsMenuOptionType.divider;
};

type MenuOption = {
  type: OptionsMenuOptionType.option;
  label: string;
  secondaryLabel?: string;
  icon?: React.ReactElement;
  onClick?: () => void;
  control?: React.ReactElement;
  closeOnClick?: boolean;
  color?: ButtonProps['color'];
};

type OptionsMenuOption = DividerOption | MenuOption;

type OptionsMenuProps = {
  options: OptionsMenuOption[];
  mainDisplay: React.ReactElement | string;
  color?: ButtonProps['color'];
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  blockMenuOpen?: boolean;
  showEndIcon?: boolean;
  setIsMenuOpen?: (isOpen: boolean) => void;
};

const OptionsMenu = ({
  options,
  color = 'info',
  variant = 'text',
  mainDisplay,
  size = 'small',
  blockMenuOpen,
  showEndIcon = true,
  setIsMenuOpen,
}: OptionsMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const {
    palette: { mode },
  } = useTheme();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!blockMenuOpen) {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        if (setIsMenuOpen) setIsMenuOpen(true);
      }
    },
    [setAnchorEl, blockMenuOpen]
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
    if (setIsMenuOpen) setIsMenuOpen(false);
  }, [setAnchorEl]);

  const handleCloseWithAction = useCallback(
    (event: React.MouseEvent<HTMLLIElement, MouseEvent>, closeOnClick: boolean, action?: () => void) => {
      event.stopPropagation();
      if (closeOnClick) {
        handleClose();
      }
      if (action) action();
    },
    [setAnchorEl, handleClose]
  );

  return (
    <div>
      <StyledButton
        variant={variant}
        color={color}
        size={size}
        onClick={handleClick}
        endIcon={showEndIcon && <KeyboardArrowDownIcon />}
      >
        {typeof mainDisplay === 'string' ? (
          <Typography variant={size === 'small' ? 'bodySmall' : 'h6'} fontWeight="bold">
            {mainDisplay}
          </Typography>
        ) : (
          mainDisplay
        )}
      </StyledButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            style: {
              maxHeight: '320px',
              overflow: 'auto',
            },
          },
        }}
      >
        {options.map((option, index) => {
          if (option.type === OptionsMenuOptionType.option) {
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
                onClick={(event) => handleCloseWithAction(event, closeOnClick, onClick)}
                color={itemColor}
                key={index}
              >
                {itemIcon}
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="bodySmall" color={`${itemColor}.main`}>
                    {label}
                  </Typography>
                  {secondaryLabel && (
                    <Typography
                      variant="bodyExtraSmall"
                      color={itemColor ? `${itemColor}.main` : colors[mode].typography.typo3}
                    >
                      {secondaryLabel}
                    </Typography>
                  )}
                </Box>
                {control && <Box sx={{ marginLeft: 'auto' }}>{control}</Box>}
              </MenuItem>
            );
          } else if (option.type === OptionsMenuOptionType.divider) {
            return <Divider key={index} />;
          }
        })}
      </Menu>
    </div>
  );
};

export { OptionsMenu, OptionsMenuProps, OptionsMenuOption, OptionsMenuOptionType };
