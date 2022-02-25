import { createAction } from '@reduxjs/toolkit';

export const toggleTheme = createAction('application/toggleTheme');
export const setNetwork = createAction<{ chainId: number, name: string }>('application/setNetwork');
