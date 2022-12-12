import React from 'react';
import styled from 'styled-components';
import Menu from '@mui/material/Menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MenuItem from '@mui/material/MenuItem';
import { withStyles } from '@mui/styles';
import { createStyles } from '@mui/material/styles';
import Button, { CustomButtonProps } from 'common/button';

const StyledButton = styled(Button)`
  white-space: nowrap;
`;

const StyledButtonGroup = styled.div<{ fullWidth?: boolean; block?: boolean }>`
  gap: 1px;
  display: flex;

  ${({ fullWidth }) => fullWidth && 'width: 100%;'}

  ${StyledButton} {
    ${({ block }) => !block && 'border-radius: 30px;'}
  }

  ${StyledButton}:first-child {
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
  }
  ${StyledButton}:last-child {
    min-width: 0px;
    padding-left: ${({ block }) => (block ? '1' : '0')}px;
    padding-right: ${({ block }) => (block ? '1' : '5')}px;
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
  }
`;

const SplitButtonContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  ${({ fullWidth }) => fullWidth && 'width: 100%;'}
`;

const StyledMenu = withStyles(() =>
  createStyles({
    paper: {
      border: '2px solid #A5AAB5',
      borderRadius: '8px',
    },
  })
)(Menu);

export type SplitButtonOptions = { onClick: () => void; text: React.ReactNode; disabled?: boolean }[];

interface SplitButtonProps {
  onClick: () => void;
  text: React.ReactNode;
  disabled?: boolean;
  options: SplitButtonOptions;
  variant: CustomButtonProps['variant'];
  color: CustomButtonProps['color'];
  size?: CustomButtonProps['size'];
  fullWidth?: boolean;
  block?: boolean;
}

const SplitButton = ({
  onClick,
  text,
  disabled,
  variant,
  color,
  options,
  fullWidth,
  size = 'small',
  block,
}: SplitButtonProps) => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);

  const handleOpenClose = () => {
    setOpen(!open);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const isOptionsButtonDisabled = options.every(({ disabled: isDisabled }) => isDisabled);

  return (
    <SplitButtonContainer fullWidth={fullWidth}>
      <StyledButtonGroup ref={anchorRef} fullWidth={fullWidth} block={block}>
        <StyledButton
          onClick={onClick}
          disabled={disabled}
          color={color}
          variant={variant}
          size={size}
          fullWidth={fullWidth}
        >
          {text}
        </StyledButton>
        <StyledButton
          onClick={handleOpenClose}
          color={color}
          variant={variant}
          size={size}
          disabled={isOptionsButtonDisabled}
        >
          <ArrowDropDownIcon />
        </StyledButton>
      </StyledButtonGroup>
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
        {options.map(({ onClick: onClickItem, disabled: disabledItem, text: itemText }) => (
          <MenuItem
            onClick={() => {
              onClickItem();
              handleClose();
            }}
            disabled={disabledItem}
          >
            {itemText}
          </MenuItem>
        ))}
      </StyledMenu>
    </SplitButtonContainer>
  );
};

export default SplitButton;
