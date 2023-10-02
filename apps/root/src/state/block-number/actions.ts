import { createAction } from '@reduxjs/toolkit';

export const updateBlockNumber = createAction<{ blockNumber: number; chainId: number }>(
  'application/updateBlockNumber'
);
