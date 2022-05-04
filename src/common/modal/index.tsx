import React from 'react';
import styled from 'styled-components';
import Button, { ButtonTypes } from 'common/button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@mui/styles';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const StyledDialogContent = styled(DialogContent)<{ withTitle: boolean }>`
  display: flex;
  align-items: ${({ withTitle }) => (withTitle ? 'stretch' : 'center')};
  justify-content: center;
  padding: 0px;
  ${({ withTitle }) => withTitle && 'flex-direction: column;'}
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
`;

const StyledDialogActions = styled(DialogActions)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
`;

const StyledDialog = styled(Dialog)`
  display: flex;
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
  },
});

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  showCloseIcon?: boolean;
  showCloseButton?: boolean;
  title?: React.ReactNode;
  actions?: {
    label: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    color?: keyof typeof ButtonTypes;
    variant?: 'text' | 'outlined' | 'contained';
  }[];
}

const Modal: React.FC<ModalProps> = ({ title, open, onClose, showCloseIcon, showCloseButton, actions, children }) => {
  const classes = useStyles();

  const handleClose = () => {
    if (onClose && (showCloseButton || showCloseIcon)) {
      onClose();
    }
  };

  const withTitle = showCloseIcon || !!title;

  return (
    <StyledDialog open={open} fullWidth maxWidth="lg" classes={classes} onClose={handleClose}>
      <StyledDialogContent withTitle={withTitle}>
        {withTitle && (
          <StyledDialogTitle>
            {title}
            <IconButton aria-label="close" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </StyledDialogTitle>
        )}
        {withTitle ? <StyledDialogColumnContent>{children}</StyledDialogColumnContent> : children}
      </StyledDialogContent>
      {(showCloseButton || !!actions?.length) && (
        <StyledDialogActions>
          {showCloseButton && (
            <Button onClick={onClose} variant="outlined" color="default" size="large" fullWidth>
              <FormattedMessage description="Close" defaultMessage="Close" />
            </Button>
          )}
          {actions?.map((action) => (
            <Button
              onClick={action.onClick}
              disabled={action.disabled}
              variant={action.variant ?? 'contained'}
              color={action.color ?? 'primary'}
              size="large"
              fullWidth
            >
              {action.label}
            </Button>
          ))}
        </StyledDialogActions>
      )}
    </StyledDialog>
  );
};

export default Modal;
