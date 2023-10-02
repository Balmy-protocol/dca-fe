import { createAction } from '@reduxjs/toolkit';
import { SupportedLanguages } from '@constants/lang';

export const toggleTheme = createAction('application/toggleTheme');
export const setNetwork = createAction<{ chainId: number; name: string }>('application/setNetwork');
export const setSelectedLocale = createAction<SupportedLanguages>('application/setSelectedLocale');
