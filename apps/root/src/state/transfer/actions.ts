import { createAction } from '@reduxjs/toolkit';
import { Token } from '@types';

export const setChainId = createAction<number>('transfer/setChainId');

export const setToken = createAction<Token | null>('transfer/setToken');

export const setAmount = createAction<string>('transfer/setAmount');

export const setRecipient = createAction<string>('transfer/setRecipient');

export const resetForm = createAction('transfer/resetForm');
