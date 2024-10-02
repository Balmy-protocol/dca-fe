import React, { PropsWithChildren, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import { SplitButton, SplitButtonOptions } from '../split-button';
import { Typography } from '../typography';
import { Dialog } from '../dialog';
import { DialogContent } from '../dialogcontent';
import { IconButton } from '../iconbutton';
import { Breakpoint } from '../breakpoint';
import { CloseIcon } from '../../icons';
import { Button, ButtonProps } from '../button';
import { FormattedMessage } from 'react-intl';
import { colors } from '../../theme';
import { ForegroundPaper } from '../foreground-paper';
import { ContainerBox } from '../container-box';

const StyledDialogHeader = styled(ContainerBox).attrs({
  justifyContent: 'space-between',
  fullWidth: true,
  alignItems: 'center',
})``;

const StyledDialogContent = styled(DialogContent)<{ withTitle: boolean }>`
  ${({ theme: { space }, withTitle }) => `
    display: flex;
    align-items: ${withTitle ? 'stretch' : 'center'};
    justify-content: center;
    padding: 0px;
    ${withTitle && 'flex-direction: column;'}
    overflow-y: visible;
    gap: ${space.s05}
  `}
`;

const StyledModalDialogChildren = styled(ContainerBox).attrs(({ theme: { space } }) => ({
  gap: space.s05,
  aligntItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  fullWidth: true,
}))`
  ${({ theme: { space } }) => `
    padding: 0px;
    flex-grow: 1;
    gap: ${space.s05}
  `}
`;

const StyledDialogTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-grow: 0;
`;

const StyledDialog = styled(Dialog)``;

const StyledPaperModal = styled(ForegroundPaper)`
  ${({ theme: { palette, space } }) => `
    background-color: ${colors[palette.mode].background.tertiary};
    padding: ${space.s07};
    gap: ${space.s05};
    margin: 0;
    position: relative;
  `}
`;

const StyledCloseIconContainer = styled.div`
  display: flex;
`;

const StyledCloseIconButton = styled(IconButton)`
  ${({ theme: { spacing } }) => `
    position: absolute;
    top: ${spacing(4.5)};
    right: ${spacing(4.5)};
  `}
`;

export interface ModalProps extends PropsWithChildren {
  open: boolean;
  onClose?: () => void;
  showCloseIcon?: boolean;
  showCloseButton?: boolean;
  maxWidth?: Breakpoint;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerButton?: React.ReactNode;
  fullHeight?: boolean;
  keepMounted?: boolean;
  closeOnBackdrop?: boolean;
  actions?: {
    label: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    color?: ButtonProps['color'];
    variant?: 'text' | 'outlined' | 'contained';
    options?: SplitButtonOptions;
  }[];
  extraActions?: React.ReactNode[];
  actionsAlignment?: 'horizontal' | 'vertical';
}

const Modal: React.FC<ModalProps> = ({
  title,
  open,
  onClose,
  maxWidth,
  showCloseIcon,
  showCloseButton,
  subtitle,
  actions,
  fullHeight,
  keepMounted,
  children,
  closeOnBackdrop,
  headerButton,
  actionsAlignment = 'vertical',
  extraActions,
}) => {
  const {
    palette: { mode },
    spacing,
  } = useTheme();

  const handleClose = () => {
    if (onClose && (showCloseButton || showCloseIcon || closeOnBackdrop)) {
      onClose();
    }
  };

  const withTitle = showCloseIcon || !!title;

  const fullHeightProps = (fullHeight && { sx: { height: '90vh' } }) || {};

  const TitleComponent = useMemo(
    () =>
      withTitle ? (
        <StyledDialogTitle>
          <StyledDialogHeader>
            <Typography variant="h3Bold" color={colors[mode].typography.typo1}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="bodyRegular" color={colors[mode].typography.typo2}>
                {subtitle}
              </Typography>
            )}
            {headerButton}
          </StyledDialogHeader>
          <StyledCloseIconContainer>
            <StyledCloseIconButton aria-label="close" onClick={onClose}>
              <CloseIcon sx={{ color: colors[mode].typography.typo2 }} size={spacing(3)} />
            </StyledCloseIconButton>
          </StyledCloseIconContainer>
        </StyledDialogTitle>
      ) : null,
    [headerButton, mode, onClose, title, withTitle, spacing, subtitle]
  );

  return (
    <StyledDialog
      open={open}
      fullWidth
      maxWidth={maxWidth || 'lg'}
      onClose={handleClose}
      PaperProps={fullHeightProps}
      keepMounted={keepMounted}
      PaperComponent={StyledPaperModal}
    >
      <StyledDialogContent withTitle={withTitle || !!fullHeight}>
        {TitleComponent}
        <StyledModalDialogChildren>{children}</StyledModalDialogChildren>
      </StyledDialogContent>
      {(showCloseButton || !!actions?.length) && (
        <ContainerBox
          flexDirection={actionsAlignment === 'vertical' ? 'column' : 'row'}
          gap={4}
          justify-content="center"
          alignItems="center"
        >
          {showCloseButton && actionsAlignment === 'horizontal' && (
            <Button onClick={onClose} variant="outlined" size="large" sx={{ width: '100%' }}>
              <FormattedMessage description="Close" defaultMessage="Close" />
            </Button>
          )}
          {actions?.map((action, index) =>
            action.options ? (
              <SplitButton
                onClick={action.onClick}
                text={action.label}
                disabled={action.disabled}
                variant={action.variant ?? 'outlined'}
                color={action.color ?? 'primary'}
                options={action.options}
                size="large"
                block
                key={index}
              />
            ) : (
              <Button
                onClick={action.onClick}
                disabled={action.disabled}
                variant={action.variant ?? 'outlined'}
                color={action.color ?? 'primary'}
                size="large"
                key={index}
                sx={{ width: '100%' }}
              >
                {action.label}
              </Button>
            )
          )}
          {showCloseButton && actionsAlignment === 'vertical' && (
            <Button onClick={onClose} variant="contained" size="large" sx={{ width: '100%' }}>
              <FormattedMessage description="Close" defaultMessage="Close" />
            </Button>
          )}
          {extraActions}
        </ContainerBox>
      )}
    </StyledDialog>
  );
};

export { Modal };
