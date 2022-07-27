import { createAction } from '@reduxjs/toolkit';
import { FullPosition, TransactionDetails } from 'types';

export const setPosition = createAction<FullPosition | null>('positionDetails/setPosition');

export const updatePosition = createAction<TransactionDetails>('positionDetails/updatePosition');
