import '@mui/material';

declare module '@mui/material' {
  interface ButtonPropsColorOverrides {
    transparent: true;
    migrate: true;
    default: true;
    pending: true;
  }
}
