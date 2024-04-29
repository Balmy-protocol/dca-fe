import React, { PropsWithChildren } from 'react';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { StyledMaterialDesignContent } from '../../components/snackbar';
import { TickCircleIcon, WarningCircleIcon, WarningTriangleIcon } from '../../icons';

const CustomSnackbarProvider = ({ children }: PropsWithChildren) => (
  <SnackbarProvider
    Components={{
      success: StyledMaterialDesignContent,
      error: StyledMaterialDesignContent,
      warning: StyledMaterialDesignContent,
    }}
    iconVariant={{
      success: <TickCircleIcon color="success" />,
      warning: <WarningCircleIcon />,
      error: <WarningTriangleIcon />,
    }}
  >
    {children}
  </SnackbarProvider>
);

export { useSnackbar, CustomSnackbarProvider as SnackbarProvider };
