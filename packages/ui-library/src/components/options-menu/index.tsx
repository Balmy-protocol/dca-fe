import React, { useCallback, useState } from 'react';
import { ButtonProps, Button } from '../button';
import { Menu } from '../menu';
import { KeyboardArrowDownIcon } from '../../icons';
import { MenuItem } from '../menuitem';
import { Box } from '../box';
import { Divider, Typography } from '@mui/material';
import styled, { useTheme } from 'styled-components';
import { colors } from '../../theme';
import { ContainerBox } from '../container-box';

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
  label: string | React.ReactElement;
  secondaryLabel?: string;
  icon?: React.ReactElement;
  onClick?: () => void;
  control?: React.ReactElement;
  closeOnClick?: boolean;
  disabled?: boolean;
  color?: ButtonProps['color'];
};

type OptionsMenuOption = DividerOption | MenuOption;

interface OptionsMenuItemsProps {
  options: OptionsMenuOption[];
  handleClose: () => void;
  anchorEl: HTMLElement | null;
}

const OptionsMenuItems = ({ options, handleClose, anchorEl }: OptionsMenuItemsProps) => {
  const open = Boolean(anchorEl);
  const {
    palette: { mode },
  } = useTheme();

  const handleCloseWithAction = useCallback(
    (event: React.MouseEvent<HTMLLIElement, MouseEvent>, closeOnClick: boolean, action?: () => void) => {
      event.stopPropagation();
      if (closeOnClick) {
        handleClose();
      }
      if (action) action();
    },
    [handleClose]
  );

  return (
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
            disabled,
          } = option;
          return (
            <MenuItem
              onClick={(event) => handleCloseWithAction(event, closeOnClick, onClick)}
              color={itemColor}
              key={index}
              disabled={disabled}
            >
              {itemIcon}
              <ContainerBox flexDirection="column" fullWidth>
                {typeof label === 'string' ? (
                  <Typography variant="bodySmall" color={`${itemColor}.main`}>
                    {label}
                  </Typography>
                ) : (
                  label
                )}
                {secondaryLabel && (
                  <Typography
                    variant="bodyExtraSmall"
                    color={itemColor ? `${itemColor}.main` : colors[mode].typography.typo3}
                  >
                    {secondaryLabel}
                  </Typography>
                )}
              </ContainerBox>
              {control && <Box sx={{ marginLeft: 'auto' }}>{control}</Box>}
            </MenuItem>
          );
        } else if (option.type === OptionsMenuOptionType.divider) {
          return <Divider key={index} />;
        }
      })}
    </Menu>
  );
};

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
      <OptionsMenuItems options={options} anchorEl={anchorEl} handleClose={handleClose} />
    </div>
  );
};

export { OptionsMenu, OptionsMenuItems, OptionsMenuProps, OptionsMenuOption, OptionsMenuOptionType };
