import { createAction } from '@reduxjs/toolkit';

export const updateBlockNumber = createAction<{ blockNumber: number }>('application/updateBlockNumber');
