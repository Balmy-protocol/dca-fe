import React from 'react';
import styled from 'styled-components';
import Button, { ButtonTypes } from 'common/button';
import SplitButton, { SplitButtonOptions } from 'common/split-button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@mui/styles';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Breakpoint, Typography } from '@mui/material';

const StyledDialogContent = styled(DialogContent)<{ withTitle: boolean }>`
  display: flex;
  align-items: ${({ withTitle }) => (withTitle ? 'stretch' : 'center')};
  justify-content: center;
  padding: 0px;
  ${({ withTitle }) => withTitle && 'flex-direction: column;'}
  overflow-y: visible;
`;

const StyledDialogColumnContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px;
  flex-grow: 1;
`;

const StyledDialogTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-grow: 0;
  margin-bottom: 28px;
`;

const StyledDialogActions = styled(DialogActions)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
`;

const StyledDialog = styled(Dialog)`
  // display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const useStyles = makeStyles({
  paper: {
    borderRadius: 8,
    border: '2px solid rgba(255, 255, 255, 0.5)',
    background: '#1B1B1C',
    padding: '24px',
    gap: '24px',
    overflow: 'auto',
  },
});

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  showCloseIcon?: boolean;
  showCloseButton?: boolean;
  maxWidth?: Breakpoint;
  title?: React.ReactNode;
  fullHeight?: boolean;
  actions?: {
    label: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    color?: keyof typeof ButtonTypes;
    variant?: 'text' | 'outlined' | 'contained';
    options?: SplitButtonOptions;
  }[];
}

const Modal: React.FC<ModalProps> = ({
  title,
  open,
  onClose,
  maxWidth,
  showCloseIcon,
  showCloseButton,
  actions,
  fullHeight,
  children,
}) => {
  const classes = useStyles();

  const handleClose = () => {
    if (onClose && (showCloseButton || showCloseIcon)) {
      onClose();
    }
  };

  const withTitle = showCloseIcon || !!title;

  const fullHeightProps = (fullHeight && { sx: { height: '90vh' } }) || {};

  return (
    <StyledDialog
      open={open}
      fullWidth
      maxWidth={maxWidth || 'lg'}
      classes={classes}
      onClose={handleClose}
      PaperProps={fullHeightProps}
    >
      <StyledDialogContent withTitle={withTitle || !!fullHeight}>
        {withTitle && (
          <StyledDialogTitle>
            <Typography variant="body1" fontWeight={600} fontSize="1.2rem">
              {title}
            </Typography>
            <IconButton aria-label="close" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </StyledDialogTitle>
        )}
        {withTitle || !!fullHeight ? <StyledDialogColumnContent>{children}</StyledDialogColumnContent> : children}
      </StyledDialogContent>
      {(showCloseButton || !!actions?.length) && (
        <StyledDialogActions>
          {showCloseButton && (
            <Button onClick={onClose} variant="outlined" color="default" size="large" fullWidth>
              <FormattedMessage description="Close" defaultMessage="Close" />
            </Button>
          )}
          {actions?.map((action, index) =>
            action.options ? (
              <SplitButton
                onClick={action.onClick}
                text={action.label}
                disabled={action.disabled}
                variant={action.variant ?? 'contained'}
                color={action.color ?? 'primary'}
                options={action.options}
                size="large"
                fullWidth
                block
                key={index}
              />
            ) : (
              <Button
                onClick={action.onClick}
                disabled={action.disabled}
                variant={action.variant ?? 'contained'}
                color={action.color ?? 'primary'}
                size="large"
                fullWidth
                key={index}
              >
                {action.label}
              </Button>
            )
          )}
        </StyledDialogActions>
      )}
    </StyledDialog>
  );
};

export default Modal;
