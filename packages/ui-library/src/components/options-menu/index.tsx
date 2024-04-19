import React, { useCallback, useState } from 'react';
import { ButtonProps, Button } from '../button';
import { Menu } from '../menu';
import { KeyboardArrowDownIcon } from '../../icons';
import { MenuItem } from '../menuitem';
import { Divider, PaletteMode, Typography } from '@mui/material';
import styled, { useTheme } from 'styled-components';
import { colors } from '../../theme';
import { ContainerBox } from '../container-box';

const StyledButton = styled(Button)`
  ${({ theme: { spacing } }) => `
  padding: ${spacing(1)};
  max-width: none;
  min-width: 0;
  display: flex;
  gap: ${spacing(1)};
`}
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
  Icon?: React.ElementType;
  onClick?: () => void;
  control?: React.ReactElement;
  closeOnClick?: boolean;
  disabled?: boolean;
  color?: ButtonProps['color'];
};

type BaseMenuOption = DividerOption | MenuOptionWithOptions;

type MenuOptionWithOptions = MenuOption & {
  options?: BaseMenuOption[];
};

type OptionsMenuOption = DividerOption | MenuOptionWithOptions;

interface OptionsMenuItemsProps {
  options: OptionsMenuOption[];
  handleClose: () => void;
  anchorEl: HTMLElement | null;
}

const DividerItem = () => <Divider />;

const BaseOptionItem = ({
  option: { label, closeOnClick = true, color: itemColor, control, onClick, Icon: ItemIcon, secondaryLabel, disabled },
  handleItemClick,
  mode,
}: {
  option: MenuOption;
  handleItemClick: (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    closeOnClick: boolean,
    action?: () => void
  ) => void;
  mode: PaletteMode;
}) => (
  <MenuItem onClick={(e) => handleItemClick(e, closeOnClick, onClick)} color={itemColor} disabled={disabled}>
    {ItemIcon && <ItemIcon color={itemColor ?? 'info'} />}
    <ContainerBox flexDirection="column" fullWidth>
      {typeof label === 'string' ? (
        <Typography variant="bodySmallRegular" color={itemColor ? `${itemColor}.dark` : colors[mode].typography.typo2}>
          {label}
        </Typography>
      ) : (
        label
      )}
      {secondaryLabel && (
        <Typography variant="bodyExtraSmall" color={itemColor ? `${itemColor}.dark` : colors[mode].typography.typo3}>
          {secondaryLabel}
        </Typography>
      )}
    </ContainerBox>
    {control}
  </MenuItem>
);

const OptionItem = ({
  option,
  handleItemClick,
  mode,
}: {
  option: MenuOptionWithOptions;
  handleItemClick: (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    closeOnClick: boolean,
    action?: () => void
  ) => void;
  mode: PaletteMode;
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLLIElement | null>(null);
  const open = Boolean(anchorEl);

  const { closeOnClick = true, onClick, options } = option;

  const handleClick = (
    e: React.MouseEvent<HTMLLIElement, MouseEvent>,
    fromItem?: boolean,
    itemOnClick?: () => void
  ) => {
    if (options?.length && fromItem) {
      setAnchorEl(e.currentTarget);
    } else {
      handleItemClick(e, closeOnClick, itemOnClick || onClick);
    }
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <BaseOptionItem option={option} handleItemClick={(e) => handleClick(e, true)} mode={mode} />
      {options?.length && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={(e) => e.stopPropagation()}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
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
          {options.map((subOption, index) => {
            if (subOption.type === OptionsMenuOptionType.option) {
              return (
                <OptionItem
                  key={index}
                  option={subOption}
                  mode={mode}
                  handleItemClick={(e, nonUseFull, actionClick) => handleClick(e, false, actionClick)}
                />
              );
            } else if (subOption.type === OptionsMenuOptionType.divider) {
              return <DividerItem key={index} />;
            }
          })}
        </Menu>
      )}
    </>
  );
};
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
          return <OptionItem key={index} option={option} mode={mode} handleItemClick={handleCloseWithAction} />;
        } else if (option.type === OptionsMenuOptionType.divider) {
          return <DividerItem key={index} />;
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
          <Typography variant={size === 'small' ? 'bodySmallBold' : 'h6'} fontWeight="bold">
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
