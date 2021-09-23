import { createAction } from '@reduxjs/toolkit';

export const enableTokenList =
  createAction<{
    tokenList: string;
    enabled: boolean;
  }>('tokenLists/enableTokenList');
