import React from 'react';

import { SnackbarProvider } from '../src/common/notistack';

export const withSnackbar = (Story) => {
  return (
    <SnackbarProvider>
      <Story />
    </SnackbarProvider>
  );
};
